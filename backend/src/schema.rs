// @generated automatically by Diesel CLI.

diesel::table! {
    coins (id) {
        id -> Int8,
        name -> Text,
        symbol -> Text,
        supply -> Numeric,
        #[max_length = 42]
        contract_address -> Bpchar,
        #[max_length = 42]
        creator -> Bpchar,
        graduated -> Bool,
        verified -> Bool,
        description -> Nullable<Text>,
        image_url -> Nullable<Text>,
        created_at -> Timestamp,
        twitter -> Nullable<Text>,
        website -> Nullable<Text>,
        telegram -> Nullable<Text>,
    }
}

diesel::table! {
    pools (address) {
        #[max_length = 42]
        address -> Bpchar,
        chain_id -> Int4,
        #[max_length = 42]
        dex -> Bpchar,
        #[max_length = 42]
        token_a -> Bpchar,
        #[max_length = 42]
        token_b -> Bpchar,
        created_at -> Timestamp,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    coins,
    pools,
);
