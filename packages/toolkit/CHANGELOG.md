# Change Log - @contentauth/toolkit

This log was last generated on Tue, 30 Sep 2025 18:12:55 GMT and should not be manually modified.

## 0.13.14
Tue, 30 Sep 2025 18:12:55 GMT

### Patches

- Fix for some validation errors being thrown as exceptions

## 0.13.13
Tue, 16 Sep 2025 19:04:49 GMT

### Patches

- Update c2pa-rs

## 0.13.12
Thu, 11 Sep 2025 18:31:42 GMT

### Patches

- Updated c2pa-rs

## 0.13.11
Sun, 07 Sep 2025 05:40:43 GMT

### Patches

- Update c2pa-rs

## 0.13.10
Thu, 21 Aug 2025 23:43:07 GMT

### Patches

- Pass validation_results through

## 0.13.9
Sat, 16 Aug 2025 15:28:06 GMT

### Patches

- Update c2pa-rs

## 0.13.8
Tue, 06 May 2025 21:10:16 GMT

### Patches

- Make templates optional in actions v2

## 0.13.7
Tue, 29 Apr 2025 23:13:41 GMT

### Patches

- Pass validation results through

## 0.13.6
Thu, 24 Apr 2025 22:18:28 GMT

### Patches

- Update c2pa rs

## 0.13.5
Wed, 16 Apr 2025 17:11:17 GMT

### Patches

- Update c2pa rs to 0.49.3

## 0.13.4
Tue, 15 Apr 2025 19:45:38 GMT

### Patches

- Update c2pa rs to 0.49.2

## 0.13.3
Wed, 09 Apr 2025 19:43:58 GMT

### Patches

- Improve CAWG signature validation

## 0.13.2
Fri, 04 Apr 2025 21:29:51 GMT

### Patches

- Update c2pa-rs to 0.49.1 and cawg-identity to 0.11.1

## 0.13.1
Thu, 27 Mar 2025 14:09:02 GMT

### Patches

- Update c2pa-rs to 0.48.2

## 0.13.0
Mon, 24 Feb 2025 21:12:02 GMT

### Minor changes

- Implement CAWG reading

## 0.12.1
Tue, 11 Feb 2025 19:43:56 GMT

### Patches

- Update c2pa-rs to 0.45.3

## 0.12.0
Fri, 07 Feb 2025 16:21:09 GMT

### Minor changes

- Update to c2pa-rs 0.45.2

## 0.11.9
Fri, 18 Oct 2024 18:01:58 GMT

### Patches

- Update to c2pa-rs 0.37.0

## 0.11.8
Mon, 19 Aug 2024 17:03:27 GMT

### Patches

- Update c2pa-rs to 0.33.3

## 0.11.7
Tue, 30 Jul 2024 00:37:40 GMT

### Patches

- Upgrade to c2pa-rs 0.33.0

## 0.11.6
Mon, 15 Jul 2024 20:21:36 GMT

### Patches

- Update c2pa-rs to 0.32.6

## 0.11.5
Wed, 19 Jun 2024 16:57:37 GMT

### Patches

- Update c2pa-rs to 0.32.2

## 0.11.4
Fri, 12 Apr 2024 19:34:30 GMT

### Patches

- Expose `GeneratorInfoMap`

## 0.11.3
Fri, 05 Apr 2024 18:04:37 GMT

### Patches

- Add types for c2pa.actions.v2

## 0.11.2
Fri, 05 Apr 2024 16:07:54 GMT

### Patches

- Update c2pa-rs to 0.31.3

## 0.11.1
Tue, 26 Mar 2024 21:30:40 GMT

### Patches

- Update c2pa-rs to 0.31.1

## 0.11.0
Mon, 18 Mar 2024 21:08:16 GMT

### Minor changes

- Update to c2pa-rs 0.31.0, add settings support

## 0.10.6
Thu, 07 Mar 2024 22:56:51 GMT

### Patches

- Update dependencies

## 0.10.5
Thu, 11 Jan 2024 20:02:01 GMT

### Patches

- Update c2pa-rs version for PDF/AVI support

## 0.10.4
Tue, 05 Dec 2023 22:00:22 GMT

### Patches

- Add type for claim_generator_info

## 0.10.3
Wed, 04 Oct 2023 21:32:12 GMT

### Patches

- Update c2pa-rs to 0.27.1

## 0.10.2
Thu, 14 Sep 2023 11:56:56 GMT

### Patches

- Update to c2pa-rs 0.26.0

## 0.10.1
Wed, 19 Jul 2023 20:42:52 GMT

### Patches

- Update c2pa-rs to 0.25.1, fix i128 serialization issue in Wasm

## 0.10.0
Wed, 14 Jun 2023 15:36:00 GMT

### Minor changes

- Update c2pa-rs to 0.23.1

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

