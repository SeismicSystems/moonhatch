use alloy_primitives::{Address, Uint};
use bigdecimal::{
    num_bigint::{BigInt, Sign},
    BigDecimal, One, Zero,
};
use std::str::FromStr;

use crate::{contract::pair::UniswapV2Pair, db::models, error::PumpError};

#[derive(Debug, Copy, Clone)]
pub struct Pool {
    pub lp_token: Address,
    pub token_0: Address,
    pub token_1: Address,
}

impl Pool {
    pub fn other(self, weth: Address) -> (Address, bool) {
        if self.token_0 == weth {
            return (self.token_1, true);
        }
        return (self.token_0, false);
    }
}

fn parse_address(address: &str) -> Result<Address, PumpError> {
    Address::from_str(&address).map_err(|_e| PumpError::InvalidAddress)
}

impl TryFrom<models::Pool> for Pool {
    type Error = PumpError;

    fn try_from(value: models::Pool) -> Result<Self, Self::Error> {
        Ok(Pool {
            lp_token: parse_address(&value.address)?,
            token_0: parse_address(&value.token_0)?,
            token_1: parse_address(&value.token_1)?,
        })
    }
}

fn int_to_decimal<const BITS: usize, const LIMBS: usize>(i: Uint<BITS, LIMBS>) -> BigDecimal {
    BigDecimal::from(to_bigint(i))
}

fn to_bigint<const BITS: usize, const LIMBS: usize>(i: Uint<BITS, LIMBS>) -> BigInt {
    BigInt::from_bytes_le(Sign::Plus, i.to_le_bytes_vec().as_ref())
}

impl Pool {
    // TODO: add decimals when we need them (all coins have 18 now)
    pub fn swap_price(
        swap: &UniswapV2Pair::Swap,
    ) -> Option<(bool, BigDecimal, BigDecimal, BigDecimal)> {
        let amt0_in = to_bigint(swap.amount0In);
        let amt0_out = to_bigint(swap.amount0Out);
        let amt1_in = to_bigint(swap.amount1In);
        let amt1_out = to_bigint(swap.amount1Out);

        let amt0_net = BigDecimal::from(amt0_out - amt0_in);
        let amt1_net = BigDecimal::from(amt1_out - amt1_in);

        let buy_a = match (amt0_net > BigDecimal::zero(), amt1_net > BigDecimal::zero()) {
            (true, false) => true,
            (false, true) => false,
            _ => {
                return None;
            }
        };
        let px = -1 * amt1_net.clone() / amt0_net.clone();
        Some((buy_a, amt0_net, amt1_net, px))
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
