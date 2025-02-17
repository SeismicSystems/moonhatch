-- Your SQL goes here
CREATE TABLE pool_prices (
    -- Primary key: Auto-incrementing identifier
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign key reference to pools table
    pool CHAR(42) NOT NULL,
    
    -- Unix timestamp for the price data point
    time BIGINT NOT NULL,
    
    -- OHLC price data
    open DECIMAL NOT NULL,
    high DECIMAL NOT NULL,
    low DECIMAL NOT NULL,
    close DECIMAL NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT fk_pool_prices_pool
        FOREIGN KEY (pool)
        REFERENCES pools(address)
        ON DELETE CASCADE
);

CREATE INDEX idx_pool_prices_time ON pool_prices(time);
CREATE INDEX idx_pool_prices_pool_time ON pool_prices(pool, time);
