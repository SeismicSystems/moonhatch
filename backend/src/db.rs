// src/db.rs

use diesel::prelude::*;
use diesel::result::QueryResult;
use crate::models::Coin;
use crate::schema::coins;
use bigdecimal::BigDecimal;

#[derive(Insertable)]
#[diesel(table_name = coins)]
pub struct NewCoin<'a> {
    pub name: &'a str,
    pub symbol: &'a str,
    pub supply: BigDecimal,
    pub contract_address: &'a str,
    pub creator: &'a str,
    pub description: Option<&'a str>,
}

pub fn create_coin<'a>(
    conn: &mut PgConnection,
    new_coin: NewCoin<'a>,
) -> QueryResult<Coin> {
    use crate::schema::coins::dsl::*;
    diesel::insert_into(coins)
        .values(&new_coin)
        .get_result(conn)
}

pub fn get_coin_snippet(
    conn: &mut PgConnection,
    coin_id: i32,
    snippet_length: usize,
) -> QueryResult<String> {
    use crate::schema::coins::dsl::*;
    
    // Fetch the coin record.
    let coin_record: Coin = coins.filter(id.eq(coin_id)).first(conn)?;
    
    // Extract description (or default to empty string)
    let desc = coin_record.description.unwrap_or_default();
    
    // Return the snippet safely.
    let snippet = if desc.len() > snippet_length {
        desc[..snippet_length].to_string()
    } else {
        desc
    };
    
    Ok(snippet)
}
