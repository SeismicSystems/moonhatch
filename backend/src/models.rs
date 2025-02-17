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
    pub contract_address: String,
    pub creator: String,
    pub graduated: bool,
    pub verified: bool,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub created_at: NaiveDateTime,
    pub twitter: Option<String>,
    pub website: Option<String>,
    pub telegram: Option<String>,
}
