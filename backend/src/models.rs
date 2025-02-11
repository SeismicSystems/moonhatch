use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;
use serde::{Serialize, Deserialize};

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = coins)]
pub struct Coin {
    pub id: i32,
    pub name: String,
    pub symbol: String,
    pub supply: BigDecimal,        
    pub contract_address: String,
    pub creator: String,
    pub description: Option<String>,
    pub created_at: NaiveDateTime,
}
