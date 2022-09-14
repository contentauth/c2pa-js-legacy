// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.
use crate::error::{Error, Result};
use c2pa::ManifestStore;

pub async fn get_manifest_store_data(data: &[u8], mime_type: &str) -> Result<ManifestStore> {
    ManifestStore::from_bytes_async(mime_type, data.to_owned(), true)
        .await
        .map_err(Error::from)
}

pub async fn get_manifest_store_data_from_manifest_and_asset_bytes(manifest_bytes: &[u8], asset_bytes: &[u8]) -> Result<ManifestStore> {
    ManifestStore::from_manifest_and_asset_bytes_async(manifest_bytes, asset_bytes)
        .await
        .map_err(Error::from)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    pub async fn test_manifest_store_data() {
        let test_asset = include_bytes!("../../../tools/testing/fixtures/images/CAICAI.jpg");

        let result = get_manifest_store_data(test_asset, "image/jpeg").await;
        assert!(result.is_ok());
    }
}
