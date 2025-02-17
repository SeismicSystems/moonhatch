
-- 1. Create pools
INSERT INTO pools (address, chain_id, dex, token_a, token_b, created_at) VALUES
    ('0x12345678901234567890123456789012345678aa', -- BTC pool
     31337,
     '0xdex1111111111111111111111111111111111111',
     '0xbtc1111111111111111111111111111111111111',
     '0xusd1111111111111111111111111111111111111',
     CURRENT_TIMESTAMP),
    ('0x12345678901234567890123456789012345678bb', -- ETH pool
     31337,
     '0xdex1111111111111111111111111111111111111',
     '0xeth1111111111111111111111111111111111111',
     '0xusd1111111111111111111111111111111111111',
     CURRENT_TIMESTAMP);

-- 2. Create coins with original data plus new fields
INSERT INTO coins (
    id,
    name,
    symbol,
    supply,
    contract_address,
    creator,
    description,
    image_url,
    created_at,
    graduated,
    deployed_pool
) VALUES
    (-1,
     'Bitcoin',
     'BTC',
     21000000,
     '0xbtc1111111111111111111111111111111111111',
     '0x0000000000000000000000000000000000000000',
     'A decentralized digital currency.',
     'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
     NOW(),
     true,
     '0x12345678901234567890123456789012345678aa'),
    (-2,
     'Ethereum',
     'ETH',
     115000000,
     '0xeth1111111111111111111111111111111111111',
     '0x0000000000000000000000000000000000000000',
     'A programmable blockchain platform.',
     'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
     NOW(),
     true,
     '0x12345678901234567890123456789012345678bb');

-- 3. Create price data
-- We'll create 100 minute-by-minute data points for each pool
WITH RECURSIVE price_generator AS (
    -- Generate timestamps for last 100 minutes, 60 seconds apart
    SELECT 
        generate_series(
            EXTRACT(EPOCH FROM NOW() - INTERVAL '100 minutes')::BIGINT,
            EXTRACT(EPOCH FROM NOW())::BIGINT,
            60 -- 60 seconds interval
        ) as time
),
btc_prices AS (
    -- Generate BTC price data with some randomization
    SELECT 
        '0x12345678901234567890123456789012345678aa' as pool,
        time,
        30000 + random() * 5000 as base_price
    FROM price_generator
),
eth_prices AS (
    -- Generate ETH price data with some randomization
    SELECT 
        '0x12345678901234567890123456789012345678bb' as pool,
        time,
        2000 + random() * 300 as base_price
    FROM price_generator
)
INSERT INTO pool_prices (pool, time, open, high, low, close)
-- BTC prices
SELECT 
    pool,
    time,
    base_price as open,
    base_price * (1 + random() * 0.005) as high,
    base_price * (1 - random() * 0.005) as low,
    base_price * (1 + (random() * 0.01 - 0.005)) as close
FROM btc_prices
UNION ALL
-- ETH prices
SELECT 
    pool,
    time,
    base_price as open,
    base_price * (1 + random() * 0.005) as high,
    base_price * (1 - random() * 0.005) as low,
    base_price * (1 + (random() * 0.01 - 0.005)) as close
FROM eth_prices;
