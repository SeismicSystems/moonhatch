-- This file should undo anything in `up.sql`
ALTER TABLE coins DROP COLUMN twitter;
ALTER TABLE coins DROP COLUMN website;
ALTER TABLE coins DROP COLUMN telegram;
