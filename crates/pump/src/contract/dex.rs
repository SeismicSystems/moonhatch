use alloy_sol_types::sol;

sol! {
    contract UniswapV2Router02 {
        address public immutable override factory;
        address public immutable override WETH;
    }
}
