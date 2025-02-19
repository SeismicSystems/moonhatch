-- This file should undo anything in `up.sql`
ALTER TABLE coins DROP CONSTRAINT IF EXISTS fk_coins_deployed_pool;
DROP INDEX IF EXISTS idx_coins_deployed_pool;
ALTER TABLE coins DROP COLUMN IF EXISTS deployed_pool;
