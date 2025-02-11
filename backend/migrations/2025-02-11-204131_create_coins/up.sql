CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    supply NUMERIC NOT NULL,
    contract_address TEXT NOT NULL,
    creator TEXT NOT NULL,
    description TEXT,       -- To store the text description from the front end
    created_at TIMESTAMP DEFAULT NOW()
);
