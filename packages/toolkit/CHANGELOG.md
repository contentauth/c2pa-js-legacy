# Change Log - @contentauth/toolkit

This log was last generated on Wed, 22 Mar 2023 18:52:56 GMT and should not be manually modified.

## 0.9.10
Wed, 22 Mar 2023 18:52:56 GMT

### Patches

- Adds the new `--weak-refs` flag now available in [wasm-pack 0.11.0](https://github.com/rustwasm/wasm-pack/blob/master/CHANGELOG.md#-fixes) for more reliable memory cleanup (`--reference-types` causes a memory access error in Safari, so that was not added)

## 0.9.9
Tue, 14 Mar 2023 16:35:49 GMT

### Patches

- Fix builds on Windows platforms

## 0.9.8
Wed, 08 Mar 2023 01:47:53 GMT

### Patches

- Update c2pa-rs to 0.18.1

## 0.9.7
Fri, 03 Mar 2023 16:52:27 GMT

### Patches

- Update c2pa-rs to 0.18.0, add types for ResourceStore support

## 0.9.6
Mon, 13 Feb 2023 17:35:38 GMT

### Patches

- Added subresource integrity JSON generation script

## 0.9.5
Thu, 26 Jan 2023 16:40:49 GMT

### Patches

- Update c2pa-rs to 0.16.1

## 0.9.4
Tue, 15 Nov 2022 19:56:02 GMT

### Patches

- Support Safari 14
- Update to c2pa-rs 0.15.0

## 0.9.3
Mon, 17 Oct 2022 18:22:56 GMT

### Patches

- Support Safari 14

## 0.9.2
Wed, 14 Sep 2022 13:56:41 GMT

### Patches

- Update to c2pa-rs 0.13.1, add get_manifest_store_data_from_manifest_and_asset_bytes

## 0.9.1
Tue, 06 Sep 2022 20:05:32 GMT

### Patches

- Support cloud stored manifests

## 0.9.0
Fri, 26 Aug 2022 16:47:09 GMT

### Minor changes

- Extract TS types to types/ directory

## 0.8.1
Tue, 02 Aug 2022 16:00:06 GMT

### Patches

- Update to c2pa-rs 0.11.1

## 0.8.0
Fri, 15 Jul 2022 19:02:22 GMT

### Minor changes

- Update to c2pa-rs@0.7.0

