// src/db.rs

use crate::models::{Coin, Pool, PoolPrices};
use crate::schema::{coins as coins_schema, pool_prices as pool_prices_schema, pools as pools_schema};
use crate::schema::coins::dsl::coins as coins_table;
use crate::schema::pools::dsl::pools as pools_table;
use crate::schema::pool_prices::dsl::pool_prices as pool_prices_table;
use bigdecimal::BigDecimal;
use diesel::prelude::*;
use diesel::result::QueryResult;
use serde::{Deserialize, Serialize};
use bigdecimal::ToPrimitive;

#[derive(Insertable, Deserialize)]
#[diesel(table_name = coins_schema)]
pub struct NewCoin {
    pub id: i64,
    pub name: String,
    pub symbol: String,
    pub supply: BigDecimal,
    #[serde(rename = "contractAddress")]
    pub contract_address: String,
    pub creator: String,
    pub description: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub twitter: Option<String>,
    pub website: Option<String>,
    pub telegram: Option<String>,
}

fn serialize_decimal_as_f64<S>(decimal: &BigDecimal, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    serializer.serialize_f64(decimal.to_f64().unwrap_or(0.0))
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = pool_prices_schema)]
pub struct PoolPriceData {
    pub time: i64,
    #[serde(serialize_with = "serialize_decimal_as_f64")]
    pub open: BigDecimal,
    #[serde(serialize_with = "serialize_decimal_as_f64")]
    pub high: BigDecimal,
    #[serde(serialize_with = "serialize_decimal_as_f64")]
    pub low: BigDecimal,
    #[serde(serialize_with = "serialize_decimal_as_f64")]
    pub close: BigDecimal,
}

pub fn create_coin(conn: &mut PgConnection, new_coin: NewCoin) -> QueryResult<Coin> {
    diesel::insert_into(coins_table)
        .values(&new_coin)
        .get_result(conn)
}

pub fn get_coin(conn: &mut PgConnection, coin_id: i64) -> QueryResult<Coin> {
    // Fetch the coin record.
    let coin_record: Coin = coins_table.filter(coins_schema::id.eq(coin_id)).first(conn)?;

    Ok(coin_record)
}

pub fn get_all_coins(conn: &mut PgConnection) -> QueryResult<Vec<Coin>> {
    coins_table.order(coins_schema::created_at.desc()).load::<Coin>(conn)
}

pub fn get_pool_prices(conn: &mut PgConnection, pool: String, max_ts: Option<i64>, min_ts: Option<i64>, limit: usize) -> QueryResult<Vec<PoolPriceData>> { 
    // first make sure the pool exists
    let _pool = pools_table.filter(pools_schema::address.eq(&pool)).first::<Pool>(conn)?;

    // Start with base query and pool filter
    let mut query = pool_prices_table
        .filter(pool_prices_schema::pool.eq(&pool))
        .into_boxed();

    // Add timestamp filters if provided
    if let Some(max_timestamp) = max_ts {
        query = query.filter(pool_prices_schema::time.le(max_timestamp));
    }
    
    if let Some(min_timestamp) = min_ts {
        query = query.filter(pool_prices_schema::time.ge(min_timestamp));
    }

    // Add ordering and limit
    query
        .select((
            pool_prices_schema::time,
            pool_prices_schema::open,
            pool_prices_schema::high,
            pool_prices_schema::low,
            pool_prices_schema::close,
        ))
        .order_by(pool_prices_schema::time.asc())
        .limit(limit as i64)
        .load::<PoolPriceData>(conn)
}