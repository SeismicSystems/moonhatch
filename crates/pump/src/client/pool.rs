use alloy_primitives::{Address, Uint};
use bigdecimal::{
    num_bigint::{BigInt, Sign},
    BigDecimal, One,
};

use crate::{client::price::effective_price, contract::pair::UniswapV2Pair};

#[derive(Debug, Copy, Clone)]
pub struct Pool {
    pub lp_token: Address,
    pub token_0: Address,
    pub token_1: Address,
}

fn int_to_decimal<const BITS: usize, const LIMBS: usize>(i: Uint<BITS, LIMBS>) -> BigDecimal {
    let bigint = BigInt::from_bytes_le(Sign::Plus, i.to_le_bytes_vec().as_ref());
    BigDecimal::from(bigint)
}

impl Pool {
    // TODO: add decimals when we need them (all coins have 18 now)
    pub fn swap_price(swap: &UniswapV2Pair::Swap) -> Option<BigDecimal> {
        let amt0_in = int_to_decimal(swap.amount0In);
        let amt0_out = int_to_decimal(swap.amount0Out);
        let amt1_in = int_to_decimal(swap.amount1In);
        let amt1_out = int_to_decimal(swap.amount1Out);
        effective_price(&amt0_in, &amt0_out, &amt1_in, &amt1_out)
    }

    pub fn sync_price(sync: &UniswapV2Pair::Sync) -> BigDecimal {
        let amt_0 = int_to_decimal(sync.reserve0);
        let amt_1 = int_to_decimal(sync.reserve1);
        amt_1 / amt_0
    }

    pub fn to_ui_price(&self, weth: Address, dex_price: BigDecimal) -> BigDecimal {
        if self.token_0 == weth {
            // flip the price if the first token is weth,
            // since we always want to display how much ETH a token is worth
            return BigDecimal::one() / dex_price;
        }
        dex_price
    }
}
