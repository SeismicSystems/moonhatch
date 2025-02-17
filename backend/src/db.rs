// src/db.rs

use crate::models::{Coin, PoolPrices};
use crate::schema::{coins as coins_schema, pool_prices as pool_prices_schema, pools as pools_schema};
use crate::schema::coins::dsl::{coins as coins_table};
use crate::schema::pools::dsl::{pools as pools_table};
use crate::schema::pool_prices::dsl::{pool_prices as pool_prices_table};
use bigdecimal::BigDecimal;
use diesel::prelude::*;
use diesel::result::QueryResult;
use serde::Deserialize;

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
    pub graduated: bool,
    pub verified: bool,
    pub description: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub twitter: Option<String>,
    pub website: Option<String>,
    pub telegram: Option<String>,
}

pub fn create_coin(conn: &mut PgConnection, new_coin: NewCoin) -> QueryResult<Coin> {
    use crate::schema::coins::dsl::*;
    diesel::insert_into(coins)
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

pub fn get_pool_prices(conn: &mut PgConnection, pool: String, max_ts: Option<i64>, min_ts: Option<i64>, limit: usize) -> QueryResult<Vec<PoolPrices>> {    
    // Start with base query and pool filter
    let mut query = pool_prices_table
        .filter(pool_prices_schema::pool.eq(pool))
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
        .order_by(pool_prices_schema::time.desc())
        .limit(limit as i64)
        .load::<PoolPrices>(conn)
}