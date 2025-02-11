// src/models.rs

use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;
use serde::{Serialize, Deserialize};
use diesel::Queryable;

#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct Coin {
    pub id: i32,
    pub name: String,
    pub symbol: String,
    pub supply: BigDecimal,
    pub contract_address: String,
    pub creator: String,
    pub description: Option<String>,
    // Change to Option to match Nullable<Timestamp> from your schema.
    pub created_at: Option<NaiveDateTime>,
}
