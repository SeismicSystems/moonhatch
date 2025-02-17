// src/db_pool.rs

use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use std::env;

pub type PgPool = r2d2::Pool<ConnectionManager<PgConnection>>;

pub fn establish_pool() -> PgPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.")
}
