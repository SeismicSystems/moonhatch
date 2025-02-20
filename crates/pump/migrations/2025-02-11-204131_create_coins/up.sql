CREATE TABLE coins (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    supply NUMERIC NOT NULL,
    decimals INT NOT NULL,
    contract_address CHAR(42) NOT NULL,
    creator CHAR(42) NOT NULL,
    graduated BOOLEAN DEFAULT FALSE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    wei_in NUMERIC DEFAULT 0 NOT NULL,
    description TEXT,
    image_url TEXT,
    website TEXT,
    telegram TEXT,
    twitter TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
