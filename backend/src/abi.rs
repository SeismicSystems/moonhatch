use alloy_primitives::Bytes;
use alloy_sol_types::{sol, SolCall};
use alloy_primitives::{hex, Address};
use alloy_provider::network::TransactionBuilder;
use alloy_rpc_types_eth::{TransactionInput, TransactionRequest};

sol! {
    #[derive(Debug)]
    struct Coin {
        string name;
        string symbol;
        uint256 supply;
        address contractAddress;
        address creator;    
        // TODO: add decimals?
        // uint8 decimals;
    }

    function getCoin(uint32 coinId) public view returns (Coin memory);
}

pub fn get_coin_tx(contract_address: Address, coin_id: u32) -> TransactionRequest {
    let calldata = getCoinCall { coinId: coin_id }.abi_encode();
    TransactionRequest::default()
        .with_to(contract_address)
        .input(TransactionInput::new(calldata.into()))
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use alloy_provider::{create_seismic_provider_without_wallet, Provider};
    use alloy_sol_types::SolType;
    use reqwest::Url;

    use crate::abi::get_coin_tx;
    use super::*;

    #[test]
    fn test_calldata() {
        let contract_address = Address::from_str("0x5FbDB2315678afecb367f032d93F642f64180aa3").unwrap();
        println!("{:?}", get_coin_tx(contract_address, 0))
    }

    #[tokio::test]
    async fn test_call() {
        let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
        let seismic_client = create_seismic_provider_without_wallet(rpc_url);


        let contract_address = Address::from_str("0x5FbDB2315678afecb367f032d93F642f64180aa3").unwrap();
        let coin_id = 0;
        let tx = &get_coin_tx(contract_address, coin_id);
        let response_bytes = seismic_client.call(tx).await.unwrap();
        let coin = Coin::abi_decode(&response_bytes, true).unwrap();
        println!("Coin = {:#?}", coin);
    }
}