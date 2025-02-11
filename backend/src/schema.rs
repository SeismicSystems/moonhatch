// @generated automatically by Diesel CLI.

diesel::table! {
    coins (id) {
        id -> Int4,
        name -> Text,
        symbol -> Text,
        supply -> Numeric,
        contract_address -> Text,
        creator -> Text,
        description -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
    }
}
