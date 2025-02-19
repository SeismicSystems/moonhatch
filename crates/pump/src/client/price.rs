use bigdecimal::{BigDecimal, One, Zero};

/// Given an input amount and an output amount, compute the price as out/in,
/// returning None if either value is zero.
fn calculate_price(in_amt: &BigDecimal, out_amt: &BigDecimal) -> Option<BigDecimal> {
    if in_amt > &BigDecimal::zero() && out_amt > &BigDecimal::zero() {
        Some(out_amt / in_amt)
    } else {
        None
    }
}

/// Returns a weight for a given token0 amount.
/// In our case, if the amount is positive, we use it as weight.
fn weight_for(amt: &BigDecimal) -> BigDecimal {
    if amt > &BigDecimal::zero() {
        amt.clone()
    } else {
        BigDecimal::zero()
    }
}

/// Compute the weighted average of a slice of (price, weight) tuples.
/// Returns None if the total weight is zero.
fn weighted_average(price_weight_pairs: &[(BigDecimal, BigDecimal)]) -> Option<BigDecimal> {
    let (total_weight, weighted_sum) = price_weight_pairs.iter().fold(
        (BigDecimal::zero(), BigDecimal::zero()),
        |(w_total, w_sum), (price, weight)| {
            (w_total + weight, w_sum + price * weight)
        },
    );
    if total_weight == BigDecimal::zero() {
        None
    } else {
        Some(weighted_sum / total_weight)
    }
}

/// Compute an effective price from the swap event values.
/// For leg A (token0 in, token1 out) the price is amt1Out / amt0In,
/// and for leg B (token1 in, token0 out) we convert to token1 per token0 as amt1In / amt0Out.
/// We then combine any legs that are present using a volume-weighted average (weighted by token0 volume).
pub(crate) fn effective_price(
    amt0_in: &BigDecimal,
    amt0_out: &BigDecimal,
    amt1_in: &BigDecimal,
    amt1_out: &BigDecimal,
) -> Option<BigDecimal> {
    let mut price_weight_pairs = Vec::new();

    // Leg A: token0 in and token1 out.
    if let Some(p_a) = calculate_price(amt0_in, amt1_out) {
        price_weight_pairs.push((p_a, weight_for(amt0_in)));
    }
    // Leg B: token1 in and token0 out.
    if let Some(p_b) = calculate_price(amt0_out, amt1_in) {
        // p_b here is naturally token0 per token1,
        // so invert it to get token1 per token0.
        let p_b_converted = if p_b != BigDecimal::zero() {
            BigDecimal::one() / p_b.clone()
        } else {
            BigDecimal::zero()
        };
        price_weight_pairs.push((p_b_converted, weight_for(amt0_out)));
    }

    if price_weight_pairs.is_empty() {
        None
    } else {
        weighted_average(&price_weight_pairs)
    }
}