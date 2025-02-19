// src/models.rs

use bigdecimal::{BigDecimal, ToPrimitive};
use chrono::NaiveDateTime;
use diesel::{prelude::*, Queryable};
use serde::{Deserialize, Serialize};

use crate::db::schema;

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

#[derive(Insertable, Deserialize)]
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
