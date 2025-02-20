-- Your SQL goes here
CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    tx VARCHAR(66) NOT NULL,
    pool VARCHAR(42) NOT NULL,
    trader VARCHAR(42) NOT NULL,
    buy_0 BOOLEAN NOT NULL,
    amount_0 NUMERIC NOT NULL,
    amount_1 NUMERIC NOT NULL,
    time BIGINT NOT NULL
);

-- Create an index on the tx field
CREATE INDEX idx_trades_tx ON trades(tx);