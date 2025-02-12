CREATE TABLE coins (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    supply NUMERIC NOT NULL,
    contract_address CHAR(42) NOT NULL,
    creator CHAR(42) NOT NULL,
    graduated BOOLEAN DEFAULT FALSE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    description TEXT,       -- To store the text description from the front end
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
