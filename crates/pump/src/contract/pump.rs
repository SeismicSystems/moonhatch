use alloy_sol_types::{sol, SolCall};
use PumpRand::deployGraduatedCall;

sol! {
    contract PumpRand {
        #[derive(Debug)]
        event CoinCreated(uint32 coinId);
        #[derive(Debug)]
        event WeiInUpdated(uint32 coinId, uint256 totalWeiIn);
        #[derive(Debug)]
        event CoinGraduated(uint32 coinId);
        #[derive(Debug)]
        event DeployedToDex(uint32 coinId, address lpToken);

        function deployGraduated(uint32 coinId) public;
    }
}

pub(crate) fn deploy_graduated_bytecode(coin_id: u32) -> Vec<u8> {
    deployGraduatedCall { coinId: coin_id }.abi_encode()
}
