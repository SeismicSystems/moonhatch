use alloy_primitives::Address;
use bigdecimal::BigDecimal;
use diesel::prelude::*;
use std::{collections::HashMap, str::FromStr};

use crate::{
    client::pool,
    contract::SolidityCoin,
    db::{
        models::{Coin, NewCoin, Pool, PoolPriceData},
        schema::{
            coins::{self as coins_schema, dsl::coins as coins_table},
            pool_prices::{self as pool_prices_schema, dsl::pool_prices as pool_prices_table},
            pools::{self as pools_schema, dsl::pools as pools_table},
            trades::dsl::trades as trades_table,
        },
    },
    error::PumpError,
};

use super::models::{NewPoolPrice, Trade};

pub fn upsert_unverified_coin(
    conn: &mut PgConnection,
    new_coin: NewCoin,
) -> Result<Coin, PumpError> {
    let coin = diesel::insert_into(coins_table)
        .values(&new_coin.clone())
        .on_conflict(coins_schema::id)
        .do_update()
        .set((
            coins_schema::description.eq(new_coin.description),
            coins_schema::website.eq(new_coin.website),
            coins_schema::telegram.eq(new_coin.telegram),
            coins_schema::image_url.eq(new_coin.image_url),
            coins_schema::twitter.eq(new_coin.twitter),
        ))
        .get_result(conn)?;
    Ok(coin)
}

pub fn get_coin(conn: &mut PgConnection, coin_id: i64) -> Result<Coin, PumpError> {
    Ok(coins_table.filter(coins_schema::id.eq(coin_id)).first(conn)?)
}

pub fn get_all_coins(conn: &mut PgConnection) -> Result<Vec<Coin>, PumpError> {
    Ok(coins_table.order(coins_schema::created_at.desc()).load::<Coin>(conn)?)
}

pub fn get_pool_prices(
    conn: &mut PgConnection,
    pool: String,
    max_ts: Option<i64>,
    min_ts: Option<i64>,
    limit: usize,
) -> Result<Vec<PoolPriceData>, PumpError> {
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
    let prices = query
        .select((
            pool_prices_schema::time,
            pool_prices_schema::open,
            pool_prices_schema::high,
            pool_prices_schema::low,
            pool_prices_schema::close,
        ))
        .order_by(pool_prices_schema::time.asc())
        .limit(limit as i64)
        .load::<PoolPriceData>(conn)?;
    Ok(prices)
}

pub fn update_coin(
    conn: &mut PgConnection,
    coin_id: i64,
    coin: SolidityCoin,
) -> Result<(), PumpError> {
    let coins_updated = diesel::update(coins_table.filter(coins_schema::id.eq(coin_id)))
        .set((
            coins_schema::verified.eq(true),
            coins_schema::supply.eq(BigDecimal::from_str(&coin.supply.to_string()).unwrap()),
            coins_schema::decimals.eq(coin.decimals as i32),
            coins_schema::name.eq(coin.name),
            coins_schema::symbol.eq(coin.symbol),
            coins_schema::contract_address.eq(coin.contractAddress.to_string()),
            coins_schema::creator.eq(coin.creator.to_string()),
        ))
        .execute(conn)?;
    match coins_updated {
        0 => Err(PumpError::CoinNotFound(coin_id as u32)),
        _ => Ok(()),
    }
}

pub fn upsert_verified(
    conn: &mut PgConnection,
    coin_id: i64,
    coin: SolidityCoin,
) -> Result<usize, PumpError> {
    let new_coin = NewCoin {
        id: coin_id,
        name: coin.name.clone(),
        symbol: coin.symbol.clone(),
        supply: BigDecimal::from_str(&coin.supply.to_string()).unwrap(),
        decimals: coin.decimals as i32,
        contract_address: coin.contractAddress.to_string(),
        creator: coin.creator.to_string(),
        description: None,
        website: None,
        telegram: None,
        image_url: None,
        twitter: None,
    };
    let rows_affected = diesel::insert_into(coins_table)
        .values(&new_coin)
        .on_conflict(coins_schema::id)
        .do_update()
        .set((
            coins_schema::verified.eq(true),
            coins_schema::supply.eq(BigDecimal::from_str(&coin.supply.to_string()).unwrap()),
            coins_schema::decimals.eq(coin.decimals as i32),
            coins_schema::name.eq(coin.name),
            coins_schema::symbol.eq(coin.symbol),
            coins_schema::contract_address.eq(coin.contractAddress.to_string()),
            coins_schema::creator.eq(coin.creator.to_string()),
        ))
        .execute(conn)?;
    Ok(rows_affected)
}

pub fn graduate_coin(conn: &mut PgConnection, coin_id: i64) -> Result<(), PumpError> {
    let coins_updated = diesel::update(coins_table.filter(coins_schema::id.eq(coin_id)))
        .set((coins_schema::graduated.eq(true),))
        .execute(conn)?;
    match coins_updated {
        0 => Err(PumpError::CoinNotFound(coin_id as u32)),
        _ => Ok(()),
    }
}

pub fn update_deployed_pool(
    conn: &mut PgConnection,
    coin_id: i64,
    pool: Address,
) -> Result<(), PumpError> {
    let coins_updated = diesel::update(coins_table.filter(coins_schema::id.eq(coin_id)))
        .set((coins_schema::deployed_pool.eq(pool.to_string()),))
        .execute(conn)?;
    match coins_updated {
        0 => Err(PumpError::CoinNotFound(coin_id as u32)),
        _ => Ok(()),
    }
}

pub fn upsert_deployed_pool(conn: &mut PgConnection, pool: Pool) -> Result<usize, PumpError> {
    let rows_affected = diesel::insert_into(pools_table)
        .values(pool)
        .on_conflict(pools_schema::address)
        .do_nothing()
        .execute(conn)?;
    Ok(rows_affected)
}

pub fn add_price(conn: &mut PgConnection, price: NewPoolPrice) -> Result<usize, PumpError> {
    let count = diesel::insert_into(pool_prices_table).values(&price).execute(conn)?;
    Ok(count)
}

pub fn load_pools(conn: &mut PgConnection) -> Result<HashMap<Address, pool::Pool>, PumpError> {
    let pool_vec: Vec<Pool> = pools_table.select(pools_schema::all_columns).load(conn)?;

    let pools = pool_vec
        .into_iter()
        .map(|pool| pool.try_into().unwrap())
        .map(|pool: pool::Pool| (pool.lp_token, pool))
        .collect();

    Ok(pools)
}

pub fn add_trade(conn: &mut PgConnection, trade: &Trade) -> Result<(), PumpError> {
    diesel::insert_into(trades_table).values(trade).execute(conn)?;
    Ok(())
}
