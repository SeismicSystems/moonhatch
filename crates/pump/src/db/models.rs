// src/models.rs

use alloy_primitives::Address;
use bigdecimal::{BigDecimal, ToPrimitive, Zero};
use chrono::NaiveDateTime;
use diesel::{prelude::*, Queryable};
use serde::{Deserialize, Serialize};

use crate::{client::block::Block, db::schema, error::PumpError};

/*
CREATE TABLE coins (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    supply NUMERIC NOT NULL,
    decimals INT NOT NULL,
    contract_address CHAR(42) NOT NULL,
    creator CHAR(42) NOT NULL,
    graduated BOOLEAN DEFAULT FALSE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    wei_in NUMERIC DEFAULT 0 NOT NULL,
    description TEXT,
    image_url TEXT,
    website TEXT,
    telegram TEXT,
    twitter TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

*/

#[derive(Queryable, Serialize, Deserialize, Debug)]
#[diesel(table_name = schema::coins)]
pub struct Coin {
    pub id: i64,
    pub name: String,
    pub symbol: String,
    pub supply: BigDecimal,
    pub decimals: i32,
    #[serde(rename = "contractAddress")]
    pub contract_address: String,
    pub creator: String,
    pub graduated: bool,
    pub verified: bool,
    #[serde(rename = "weiIn")]
    pub wei_in: BigDecimal,
    pub description: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub website: Option<String>,
    pub telegram: Option<String>,
    pub twitter: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: NaiveDateTime,
    #[serde(rename = "deployedPool")]
    pub deployed_pool: Option<String>,
}

#[derive(Insertable, Queryable, Serialize, Deserialize, Debug)]
#[diesel(table_name = schema::pools)]
pub struct Pool {
    pub address: String,
    #[serde(rename = "chainId")]
    pub chain_id: i32,
    pub dex: String,
    #[serde(rename = "tokenA")]
    pub token_0: String,
    #[serde(rename = "tokenB")]
    pub token_1: String,
    #[serde(rename = "createdAt")]
    pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = schema::pool_prices)]
pub struct NewPoolPrice {
    pub pool: String,
    pub time: i64,
    pub open: BigDecimal,
    pub high: BigDecimal,
    pub low: BigDecimal,
    pub close: BigDecimal,
}

impl NewPoolPrice {
    pub fn try_new(
        lp_token: &Address,
        block: Block,
        prices: &Vec<BigDecimal>,
    ) -> Result<NewPoolPrice, PumpError> {
        if prices.is_empty() {
            return Err(PumpError::no_prices(block.number, lp_token.clone()));
        }
        let open = prices[0].clone();
        let close = prices[prices.len() - 1].clone();
        let high = prices.iter().max().unwrap_or(&BigDecimal::zero()).clone();
        let low = prices.iter().min().unwrap_or(&BigDecimal::zero()).clone();
        let price = NewPoolPrice {
            pool: lp_token.to_string(),
            time: block.timestamp,
            open,
            high,
            low,
            close,
        };
        Ok(price)
    }
}

#[derive(Insertable, Deserialize, Clone)]
#[diesel(table_name = schema::coins)]
pub struct NewCoin {
    pub id: i64,
    pub name: String,
    pub symbol: String,
    pub supply: BigDecimal,
    pub decimals: i32,
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
#[diesel(table_name = schema::pool_prices)]
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

#[derive(Queryable, Insertable)]
#[diesel(table_name = schema::trades)]
pub struct Trade {
    pub tx: String,
    pub pool: String,
    pub trader: String,
    pub buy_0: bool,
    pub amount_0: BigDecimal,
    pub amount_1: BigDecimal,
    pub time: i64,
}
