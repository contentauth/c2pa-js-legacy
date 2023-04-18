// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use std::panic;
use twoway::find_bytes;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn main() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}

// The C2PA Manifest Store shall have a label of c2pa, a UUID of 0x63327061-0011-0010-8000-00AA00389B71 (c2pa)
const CAI_BLOCK_UUID: [u8; 16] = [
    0x63, 0x32, 0x70, 0x61, 0x00, 0x11, 0x00, 0x10, 0x80, 0x00, 0x00, 0xAA, 0x00, 0x38, 0x9B, 0x71,
];

const DCTERMS_PROVENANCE: [u8; 18] = [
    0x64, 0x63, 0x74, 0x65, 0x72, 0x6D, 0x73, 0x3A, 0x70, 0x72, 0x6F, 0x76, 0x65, 0x6E, 0x61, 0x6E,
    0x63, 0x65,
];

#[wasm_bindgen]
pub fn scan_array_buffer(buf: JsValue) -> Result<usize, JsValue> {
    let scan_bytes: serde_bytes::ByteBuf = serde_wasm_bindgen::from_value(buf)?;

    if let Some(pos) = find_bytes(&scan_bytes, &CAI_BLOCK_UUID) {
        Ok(pos)
    } else if let Some(pos) = find_bytes(&scan_bytes, &DCTERMS_PROVENANCE) {
        Ok(pos)
    } else {
        Err(JsValue::from_str("NOT_FOUND"))
    }
}
