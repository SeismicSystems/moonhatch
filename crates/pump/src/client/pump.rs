use alloy_sol_types::sol;

sol! {
    contract PumpRand {
        #[derive(Debug)]
        event CoinCreated(uint32 coinId);
        #[derive(Debug)]
        event CoinGraduated(uint32 coinId);
        #[derive(Debug)]
        event DeployedToDex(uint32 coinId, address lpToken);
    }
}
