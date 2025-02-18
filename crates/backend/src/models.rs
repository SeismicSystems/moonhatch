// src/models.rs

use bigdecimal::BigDecimal;
use chrono::NaiveDateTime;
use diesel::Queryable;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Serialize, Deserialize, Debug)]
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
    pub description: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub twitter: Option<String>,
    pub website: Option<String>,
    pub telegram: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: NaiveDateTime,
    #[serde(rename = "deployedPool")]
    pub deployed_pool: Option<String>,
}

#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct Pool {
    pub address: String,
    #[serde(rename = "chainId")]
    pub chain_id: i32,
    pub dex: String,
    #[serde(rename = "tokenA")]
    pub token_a: String,
    #[serde(rename = "tokenB")]
    pub token_b: String,
    #[serde(rename = "createdAt")]
    pub created_at: NaiveDateTime,
}

#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct PoolPrices {
    pub id: i64,
    pub pool: String,
    pub time: i64,
    pub open: BigDecimal,
    pub high: BigDecimal,
    pub low: BigDecimal,
    pub close: BigDecimal,
}
