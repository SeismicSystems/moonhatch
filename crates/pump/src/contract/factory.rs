use alloy_primitives::Address;
use alloy_sol_types::{sol, SolCall};
use UniswapV2Factory::getPairCall;

sol! {
    contract UniswapV2Factory is IUniswapV2Factory {
        mapping(address => mapping(address => address)) public override getPair;
    }
}

pub fn get_pair_calldata(token_a: Address, token_b: Address) -> Vec<u8> {
    getPairCall { _0: token_a, _1: token_b }.abi_encode()
}
