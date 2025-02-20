use alloy_rpc_types_eth::Header;

#[derive(Default, Clone, Copy, Hash, PartialEq, Eq)]
pub struct Block {
    pub number: u64,
    pub timestamp: i64,
}

impl From<Header> for Block {
    fn from(value: Header) -> Self {
        Block { number: value.number, timestamp: value.timestamp as i64 }
    }
}
