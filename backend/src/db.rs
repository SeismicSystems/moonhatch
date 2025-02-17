// src/db.rs

use crate::models::Coin;
use crate::schema::coins;
use crate::schema::coins::dsl::*;
use bigdecimal::BigDecimal;
use diesel::prelude::*;
use diesel::result::QueryResult;
use serde::Deserialize;

#[derive(Insertable, Deserialize)]
#[diesel(table_name = coins)]
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
    let coin_record: Coin = coins.filter(id.eq(coin_id)).first(conn)?;

    Ok(coin_record)
}

pub fn get_all_coins(conn: &mut PgConnection) -> QueryResult<Vec<Coin>> {
    coins.order(created_at.desc()).load::<Coin>(conn)
}
