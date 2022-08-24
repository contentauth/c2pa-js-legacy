// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

// See https://github.com/rustwasm/wasm-bindgen/issues/2774
#![allow(clippy::unused_unit)]

use log::Level;
use serde::Serialize;
use serde_wasm_bindgen::Serializer;
use std::panic;
use wasm_bindgen::prelude::*;

mod error;
mod manifest_store;
mod util;

use error::Error;
use js_sys::Error as JsSysError;
use manifest_store::get_manifest_store_data;
use util::log_time;

#[wasm_bindgen(typescript_custom_section)]
pub const TS_APPEND_CONTENT: &'static str = r#"

export function getManifestStoreFromArrayBuffer(
    buf: ArrayBuffer,
    mimeType: string
): ManifestStore;

"#;

#[wasm_bindgen(start)]
pub fn run() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(Level::Info).unwrap();
}

/// Creates a JavaScript Error with additional error info
///
/// We can't use wasm-bindgen's `JsError` since it only allows you to set a single message string
fn as_js_error(err: Error) -> JsSysError {
    let js_err = JsSysError::new(&err.to_string());
    js_err.set_name(&format!("{:?}", err));
    js_err
}

#[wasm_bindgen(js_name = getManifestStoreFromArrayBuffer, skip_typescript)]
pub async fn get_manifest_store_from_array_buffer(
    buf: JsValue,
    mime_type: String,
) -> Result<JsValue, JsSysError> {
    log_time("get_manifest_store_from_array_buffer::start");
    let asset: serde_bytes::ByteBuf = serde_wasm_bindgen::from_value(buf)
        .map_err(Error::SerdeInput)
        .map_err(as_js_error)?;
    log_time("get_manifest_store_from_array_buffer::from_bytes");
    let result = get_manifest_store_data(&asset, &mime_type)
        .await
        .map_err(as_js_error)?;
    log_time("get_manifest_store_from_array_buffer::get_result");
    let serializer = Serializer::new().serialize_maps_as_objects(true);
    let js_value = result
        .serialize(&serializer)
        .map_err(|_err| Error::JavaScriptConversion)
        .map_err(as_js_error)?;
    log_time("get_manifest_store_from_array_buffer::javascript_conversion");

    Ok(js_value)
}
