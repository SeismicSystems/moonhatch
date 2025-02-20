CREATE TABLE pools (
    -- Primary key: The pool's contract address
    address CHAR(42) PRIMARY KEY,
    
    chain_id int NOT NULL,

    -- The DEX (decentralized exchange) contract address
    dex CHAR(42) NOT NULL,
    
    -- The first token's contract address in the pool
    token_0 CHAR(42) NOT NULL,
    
    -- The second token's contract address in the pool
    token_1 CHAR(42) NOT NULL,
    
    -- Timestamp for when this record was created
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_pools_dex ON pools(chain_id, dex);
