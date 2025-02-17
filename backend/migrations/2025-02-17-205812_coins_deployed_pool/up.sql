-- Your SQL goes here
ALTER TABLE coins
ADD COLUMN deployed_pool CHAR(42);

ALTER TABLE coins
ADD CONSTRAINT fk_coins_deployed_pool
    FOREIGN KEY (deployed_pool)
    REFERENCES pools(address)
    ON DELETE SET NULL;

ALTER TABLE coins
ADD CONSTRAINT check_graduated_deployed_pool
    CHECK (
        (graduated = true AND deployed_pool IS NOT NULL) OR
        (graduated = false AND deployed_pool IS NULL)
    );

-- Add index for foreign key performance
CREATE INDEX idx_coins_deployed_pool ON coins(deployed_pool);
