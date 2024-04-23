# Change Log - c2pa

This log was last generated on Mon, 22 Apr 2024 15:46:27 GMT and should not be manually modified.

## 0.21.0
Mon, 22 Apr 2024 15:46:27 GMT

### Minor changes

- Add i18n registration API for selectEditsAndActivity

## 0.20.0
Fri, 12 Apr 2024 19:34:30 GMT

### Minor changes

- Add support for V2 Actions when using `selectGenerativeInfo`

## 0.19.4
Fri, 05 Apr 2024 19:04:44 GMT

### Patches

- Add icons for actions.v2

## 0.19.3
Fri, 05 Apr 2024 18:04:37 GMT

### Patches

- Add support for c2pa.actions.v2 in selectEditsAndActivity

## 0.19.2
Fri, 05 Apr 2024 16:07:54 GMT

### Patches

- Add MOV support

## 0.19.1
Tue, 26 Mar 2024 21:30:40 GMT

### Patches

- Add dubbed and translated action support

## 0.19.0
Tue, 19 Mar 2024 18:41:20 GMT

### Minor changes

- web3 and gen AI support in createL2ManifestStore

## 0.18.0
Mon, 18 Mar 2024 21:08:16 GMT

### Minor changes

- Add settings and trust list support

## 0.17.9
Thu, 07 Mar 2024 22:56:51 GMT

### Patches

- Add embedded icon support in claim_generator_info

## 0.17.8
Fri, 16 Feb 2024 16:46:52 GMT

### Patches

- added string and icon for c2pa.edited.metadata action

## 0.17.7
Thu, 11 Jan 2024 20:02:01 GMT

### Patches

- Support AVI and PDF

## 0.17.6
Tue, 05 Dec 2023 22:00:22 GMT

### Patches

- Expose claimGeneratorInfo

## 0.17.5
Wed, 04 Oct 2023 22:10:09 GMT

### Patches

- Add MIME types for WAV and M4A
- Add MIME type for MP3

## 0.17.4
Wed, 04 Oct 2023 21:32:12 GMT

_Version update only_

## 0.17.3
Tue, 26 Sep 2023 18:33:54 GMT

### Patches

- Correct generative info display

## 0.17.2
Thu, 14 Sep 2023 11:56:56 GMT

### Patches

- Add support for serde arbitrary values, additional file types, fix generative parsing bug

## 0.17.1
Fri, 04 Aug 2023 17:01:16 GMT

### Patches

- exporting the generativeInfo type

## 0.17.0
Fri, 04 Aug 2023 15:51:55 GMT

### Minor changes

- Adds functionality to handle v1 assertions (trained and composite media) while still being compatible with legacy assertions

## 0.16.2
Wed, 19 Jul 2023 20:42:52 GMT

_Version update only_

## 0.16.1
Wed, 14 Jun 2023 16:47:50 GMT

### Patches

- Fixed TypeScript for ExtendedAssertions functionality

## 0.16.0
Wed, 14 Jun 2023 15:36:00 GMT

### Minor changes

- Update calls to work with changes in c2pa-rs 0.23.1

## 0.15.0
Fri, 31 Mar 2023 18:34:40 GMT

### Minor changes

- Add generativeInfo to createL2ManifestStore
- Add selectFormattedGenerator and include in createL2ManifestStore

## 0.14.5
Thu, 30 Mar 2023 16:18:58 GMT

### Patches

- Added new c2pa icons and mapped them to their ids
- Fix `selectEditsAndActivity` issues with embedded translations introduced in [C2PA 1.2 spec](https://c2pa.org/specifications/specifications/1.2/specs/C2PA_Specification.html#_metadata_about_assertions)

## 0.14.4
Wed, 22 Mar 2023 18:52:56 GMT

### Patches

- Fixes error on `read` that would get triggered if an ingredient doesn't have a thumbnail
- Allows assets that have invalid JUMBF box to have their sources passed through to the client during a `read` request instead instead of throwing an error so that the asset can still be displayed
- Fixes TypeScript errors by updating our `target` to `es2017` to use some newer (but widely supported) JavaScript APIs, as well as removing `process.env` in favor of a constant for the integrity logic

## 0.14.3
Tue, 14 Mar 2023 23:02:41 GMT

### Patches

- Use self over window to support non-browser contexts

## 0.14.2
Tue, 14 Mar 2023 16:35:49 GMT

### Patches

- Fix builds on Windows platforms

## 0.14.1
Mon, 13 Mar 2023 22:23:10 GMT

### Patches

- Disable downloader inspection by default
- Fix worker src CORS

## 0.14.0
Thu, 09 Mar 2023 23:41:40 GMT

### Minor changes

- Replace workerpool implementation to remove insecure eval statements

## 0.13.4
Wed, 08 Mar 2023 01:47:53 GMT

_Version update only_

## 0.13.3
Fri, 03 Mar 2023 16:52:27 GMT

### Patches

- Add changes to support ResourceStore from c2pa-rs 0.18.0

## 0.13.2
Wed, 15 Feb 2023 20:44:21 GMT

### Patches

- Removed unnecessary translations, export assertion types

## 0.13.1
Mon, 13 Feb 2023 17:35:38 GMT

### Patches

- Added subresource integrity integration for Wasm fetching

## 0.13.0
Fri, 10 Feb 2023 17:56:22 GMT

### Minor changes

- Exported `getC2paCategorizedActions` function from `selectEditsAndActivity` selector file

## 0.12.2
Thu, 26 Jan 2023 16:40:49 GMT

### Patches

- Add validation for remote manifests that are not properly-formed URLs

## 0.12.1
Wed, 18 Jan 2023 18:02:12 GMT

### Patches

- C2PA v1.2 actions compatibility changes and translations

## 0.12.0
Tue, 15 Nov 2022 19:56:02 GMT

### Minor changes

- Rename createL2Manifest to createL2ManifestStore and include validation info

## 0.11.4
Mon, 17 Oct 2022 18:22:56 GMT

_Version update only_

## 0.11.3
Thu, 29 Sep 2022 18:19:22 GMT

### Patches

- Additional documentation and exported types

## 0.11.2
Wed, 14 Sep 2022 13:56:41 GMT

### Patches

- Validate remote manifests

## 0.11.1
Tue, 06 Sep 2022 20:05:32 GMT

### Patches

- Support cloud stored manifests

## 0.11.0
Fri, 26 Aug 2022 16:47:09 GMT

### Minor changes

- Replaced resolvers with selector functions to derive more complex manifest data
- Significantly overhauled interfaces

## 0.10.3
Thu, 18 Aug 2022 20:45:42 GMT

### Patches

- Add `application/x-c2pa-manifest-store` to list of accepted mime-types
- Update c2pa-rs to 0.12.0

## 0.10.2
Tue, 02 Aug 2022 16:00:06 GMT

_Version update only_

## 0.10.1
Fri, 22 Jul 2022 18:58:41 GMT

### Patches

- Add basic support for c2pa actions

## 0.10.0
Fri, 15 Jul 2022 19:02:22 GMT

### Minor changes

- Update to use c2pa-rs@0.7.0 under the hood
- Minor updates to returned assertion and manifest data structures

## 0.9.2
Tue, 21 Jun 2022 19:32:15 GMT

### Patches

- Export Serializable and Disposable types

## 0.9.1
Mon, 13 Jun 2022 22:26:10 GMT

_Initial release_

