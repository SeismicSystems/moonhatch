// src/db.rs

use std::str::FromStr;

use crate::{
    client::SolidityCoin,
    db::{
        models::{Coin, Pool},
        schema::{
            coins::{self as coins_schema, dsl::coins as coins_table},
            pool_prices::{self as pool_prices_schema, dsl::pool_prices as pool_prices_table},
            pools::{self as pools_schema, dsl::pools as pools_table},
        },
    },
};
use bigdecimal::BigDecimal;
use diesel::{prelude::*, result::QueryResult};

use crate::db::models::NewCoin;

use super::models::PoolPriceData;

pub fn create_coin(conn: &mut PgConnection, new_coin: NewCoin) -> QueryResult<Coin> {
    diesel::insert_into(coins_table).values(&new_coin).get_result(conn)
}

pub fn get_coin(conn: &mut PgConnection, coin_id: i64) -> QueryResult<Coin> {
    // Fetch the coin record.
    let coin_record: Coin = coins_table.filter(coins_schema::id.eq(coin_id)).first(conn)?;

    Ok(coin_record)
}

pub fn get_all_coins(conn: &mut PgConnection) -> QueryResult<Vec<Coin>> {
    coins_table.order(coins_schema::created_at.desc()).load::<Coin>(conn)
}

pub fn get_pool_prices(
    conn: &mut PgConnection,
    pool: String,
    max_ts: Option<i64>,
    min_ts: Option<i64>,
    limit: usize,
) -> QueryResult<Vec<PoolPriceData>> {
    // first make sure the pool exists
    let _pool = pools_table.filter(pools_schema::address.eq(&pool)).first::<Pool>(conn)?;

    // Start with base query and pool filter
    let mut query = pool_prices_table.filter(pool_prices_schema::pool.eq(&pool)).into_boxed();

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

pub fn update_coin(
    conn: &mut PgConnection,
    coin_id: i64,
    coin: SolidityCoin,
) -> Result<usize, diesel::result::Error> {
    diesel::update(coins_table.filter(coins_schema::id.eq(coin_id)))
        .set((
            coins_schema::verified.eq(true),
            coins_schema::supply.eq(BigDecimal::from_str(&coin.supply.to_string()).unwrap()),
            coins_schema::decimals.eq(coin.decimals as i32),
            coins_schema::name.eq(coin.name),
            coins_schema::symbol.eq(coin.symbol),
            coins_schema::contract_address.eq(coin.contractAddress.to_string()),
            coins_schema::creator.eq(coin.creator.to_string()),
        ))
        .execute(conn)
}
