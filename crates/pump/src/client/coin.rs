use alloy_primitives::Address;
use alloy_rpc_types_eth::TransactionRequest;
use alloy_sol_types::{sol, SolCall};

use super::build_tx;

sol! {
    #[derive(Debug)]
    struct SolidityCoin {
        string name;
        string symbol;
        uint256 supply;
        address contractAddress;
        address creator;
    }

    function getCoin(uint32 coinId) public view returns (SolidityCoin memory);
}

pub fn get_coin_calldata(coin_id: u32) -> Vec<u8> {
    getCoinCall { coinId: coin_id }.abi_encode()
}

pub fn get_coin_tx(to: Address, coin_id: u32) -> TransactionRequest {
    build_tx(to, get_coin_calldata(coin_id))
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use alloy_provider::{create_seismic_provider_without_wallet, Provider};
    use alloy_sol_types::SolType;
    use reqwest::Url;

    use super::*;

    #[test]
    fn test_calldata() {
        let contract_address =
            Address::from_str("0x5FbDB2315678afecb367f032d93F642f64180aa3").unwrap();
        println!("{:?}", get_coin_tx(contract_address, 0))
    }

    #[tokio::test]
    async fn test_call() {
        let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
        let seismic_client = create_seismic_provider_without_wallet(rpc_url);

        let contract_address =
            Address::from_str("0x5FbDB2315678afecb367f032d93F642f64180aa3").unwrap();
        let coin_id = 0;
        let tx = &get_coin_tx(contract_address, coin_id);
        let response_bytes = seismic_client.call(tx).await.unwrap();
        let coin = SolidityCoin::abi_decode(&response_bytes, true).unwrap();
        println!("Coin = {:#?}", coin);
    }
}
