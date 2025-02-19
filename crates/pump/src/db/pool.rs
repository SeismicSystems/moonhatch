use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, PooledConnection},
};
use std::env;

pub type PgPool = r2d2::Pool<ConnectionManager<PgConnection>>;
pub type PgConn = PooledConnection<ConnectionManager<PgConnection>>;

pub fn establish_pool() -> PgPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    r2d2::Pool::builder().build(manager).expect("Failed to create pool.")
}

pub fn connect(pool: &PgPool) -> Result<PgConn, r2d2::Error> {
    match pool.get() {
        Ok(conn_) => Ok(conn_),
        Err(e) => Err(e),
    }
}
