// @generated automatically by Diesel CLI.

diesel::table! {
    coins (id) {
        id -> Int4,
        name -> Text,
        symbol -> Text,
        supply -> Numeric,
        #[max_length = 42]
        contract_address -> Bpchar,
        creator -> Text,
        description -> Nullable<Text>,
        image_url -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
    }
}
