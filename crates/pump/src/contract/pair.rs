use alloy_sol_types::{sol, SolCall};
use UniswapV2Pair::{token0Call, token1Call};

sol! {
    contract UniswapV2Pair {
        address public token0;
        address public token1;

        #[derive(Debug)]
        event Swap(
            address indexed sender,
            uint amount0In,
            uint amount1In,
            uint amount0Out,
            uint amount1Out,
            address indexed to
        );
        #[derive(Debug)]
        event Sync(uint112 reserve0, uint112 reserve1);
    }
}

pub(crate) fn get_token0_calldata() -> Vec<u8> {
    token0Call {}.abi_encode()
}

pub(crate) fn get_token1_calldata() -> Vec<u8> {
    token1Call {}.abi_encode()
}
