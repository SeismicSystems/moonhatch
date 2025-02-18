-- Your SQL goes here
ALTER TABLE coins
ADD COLUMN deployed_pool CHAR(42);

ALTER TABLE coins
ADD CONSTRAINT fk_coins_deployed_pool
    FOREIGN KEY (deployed_pool)
    REFERENCES pools(address)
    ON DELETE SET NULL;

-- Add index for foreign key performance
CREATE INDEX idx_coins_deployed_pool ON coins(deployed_pool);
