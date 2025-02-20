-- This file should undo anything in `up.sql`
DROP INDEX IF EXISTS idx_trades_tx;
DROP TABLE IF EXISTS trades;
