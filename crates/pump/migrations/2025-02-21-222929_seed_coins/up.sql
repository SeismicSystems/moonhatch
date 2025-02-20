
-- 1. Create pools
INSERT INTO pools (address, chain_id, dex, token_0, token_1, created_at) VALUES
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
     CURRENT_TIMESTAMP),
    ('0x12345678901234567890123456789012345678cc', -- SOL pool
     31337,
     '0xdex1111111111111111111111111111111111111',
     '0xsol1111111111111111111111111111111111111',
     '0xusd1111111111111111111111111111111111111',
     CURRENT_TIMESTAMP);

-- 2. Create coins with original data plus new fields
INSERT INTO coins (
    id,
    name,
    symbol,
    supply,
    decimals,
    contract_address,
    creator,
    description,
    image_url,
    created_at,
    graduated,
    deployed_pool,
    website,
    telegram,
    twitter
) VALUES
    (-1,
     'Bitcoin',
     'BTC',
     21000000,
     18,
     '0xbtc1111111111111111111111111111111111111',
     '0x0000000000000000000000000000000000000000',
     'A decentralized digital currency.',
     'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
     NOW(),
     true,
     '0x12345678901234567890123456789012345678aa',
     'https://bitcoin.org/',
     NULL,
     NULL
     ),
    (-2,
     'Ethereum',
     'ETH',
     115000000,
     18,
     '0xeth1111111111111111111111111111111111111',
     '0x0000000000000000000000000000000000000000',
     'A programmable blockchain platform.',
     'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
     NOW(),
     true,
     '0x12345678901234567890123456789012345678bb',
     'https://ethereum.org/',
     NULL,
     'https://x.com/VitalikButerin'
     ),
    (-3,
     'Solana',
     'SOL',
     18,
     115000000,
     '0xsol1111111111111111111111111111111111111',
     '0x0000000000000000000000000000000000000000',
     'A programmable blockchain platform.',
     'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
     NOW(),
     true,
     '0x12345678901234567890123456789012345678cc',
     'https://solana.com/',
     'https://t.me/solana',
     'https://x.com/solana'
     );

-- 3. Create price data
-- We'll create 100 minute-by-minute data points for each pool

WITH RECURSIVE price_generator AS (
    SELECT 
        generate_series(
            EXTRACT(EPOCH FROM NOW() - INTERVAL '100 minutes')::BIGINT,
            EXTRACT(EPOCH FROM NOW())::BIGINT,
            60
        ) as time
),
btc_prices AS (
    -- Initial price
    SELECT 
        '0x12345678901234567890123456789012345678aa' as pool,
        time,
        30000.0::double precision as open_price,
        30300.0::double precision as close_price,  -- Start slightly up
        row_number() OVER (ORDER BY time) as rn
    FROM price_generator
    WHERE time = (SELECT MIN(time) FROM price_generator)
    
    UNION ALL
    
    SELECT 
        pool,
        pg.time,
        bp.close_price as open_price,
        -- Explicitly force up/down movement
        CASE 
            WHEN random() > 0.5 THEN 
                bp.close_price * (1.0 + (random() * 0.003))  -- Up up to 0.3%
            ELSE 
                bp.close_price * (1.0 - (random() * 0.003))  -- Down up to 0.3%
        END::double precision as close_price,
        bp.rn + 1
    FROM btc_prices bp
    JOIN price_generator pg ON pg.time = (
        SELECT MIN(time) 
        FROM price_generator 
        WHERE time > bp.time
    )
    WHERE bp.rn < 100
),
eth_prices AS (
    -- Initial price
    SELECT 
        '0x12345678901234567890123456789012345678bb' as pool,
        time,
        2000.0::double precision as open_price,
        2020.0::double precision as close_price,  -- Start slightly up
        row_number() OVER (ORDER BY time) as rn
    FROM price_generator
    WHERE time = (SELECT MIN(time) FROM price_generator)
    
    UNION ALL
    
    SELECT 
        pool,
        pg.time,
        ep.close_price as open_price,
        -- Explicitly force up/down movement
        CASE 
            WHEN random() > 0.5 THEN 
                ep.close_price * (1.0 + (random() * 0.004))  -- Up up to 0.4%
            ELSE 
                ep.close_price * (1.0 - (random() * 0.004))  -- Down up to 0.4%
        END::double precision as close_price,
        ep.rn + 1
    FROM eth_prices ep
    JOIN price_generator pg ON pg.time = (
        SELECT MIN(time) 
        FROM price_generator 
        WHERE time > ep.time
    )
    WHERE ep.rn < 100
),
sol_prices AS (
    -- Initial price
    SELECT 
        '0x12345678901234567890123456789012345678cc' as pool,
        time,
        200.0::double precision as open_price,
        202.0::double precision as close_price,  -- Start slightly up
        row_number() OVER (ORDER BY time) as rn
    FROM price_generator
    WHERE time = (SELECT MIN(time) FROM price_generator)
    
    UNION ALL
    
    SELECT 
        pool,
        pg.time,
        sp.close_price as open_price,
        -- Explicitly force up/down movement
        CASE 
            WHEN random() > 0.5 THEN 
                sp.close_price * (1.0 + (random() * 0.004))  -- Up up to 0.4%
            ELSE 
                sp.close_price * (1.0 - (random() * 0.004))  -- Down up to 0.4%
        END::double precision as close_price,
        sp.rn + 1
    FROM sol_prices sp
    JOIN price_generator pg ON pg.time = (
        SELECT MIN(time) 
        FROM price_generator 
        WHERE time > sp.time
    )
    WHERE sp.rn < 100
)
INSERT INTO pool_prices (pool, time, open, high, low, close)
SELECT 
    pool,
    time,
    open_price as open,
    GREATEST(open_price, close_price) * (1.0 + random() * 0.0005)::double precision as high,
    LEAST(open_price, close_price) * (1.0 - random() * 0.0005)::double precision as low,
    close_price as close
FROM (
    SELECT pool, time, open_price, close_price FROM btc_prices
    UNION ALL
    SELECT pool, time, open_price, close_price FROM eth_prices
    UNION ALL
    SELECT pool, time, open_price, close_price FROM sol_prices
) combined_prices;
