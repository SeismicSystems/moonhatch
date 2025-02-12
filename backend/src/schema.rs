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
        description -> Nullable<Text>,
        image_url -> Nullable<Text>,
        created_at -> Timestamp,
    }
}
