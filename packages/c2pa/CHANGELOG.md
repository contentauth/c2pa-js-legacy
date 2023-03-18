# Change Log - c2pa

This log was last generated on Tue, 14 Mar 2023 23:02:41 GMT and should not be manually modified.

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

