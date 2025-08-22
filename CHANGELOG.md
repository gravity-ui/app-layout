# Changelog

## [2.3.0](https://github.com/gravity-ui/app-layout/compare/v2.2.2...v2.3.0) (2025-08-22)


### Features

* add remote-versions plugin ([#58](https://github.com/gravity-ui/app-layout/issues/58)) ([205dfe4](https://github.com/gravity-ui/app-layout/commit/205dfe4bc8db9cc05b9c74fdc997bf7f18e77b78))

## [2.2.2](https://github.com/gravity-ui/app-layout/compare/v2.2.1...v2.2.2) (2025-04-14)


### Bug Fixes

* **layout:** export LayoutInitOptions type ([#55](https://github.com/gravity-ui/app-layout/issues/55)) ([eb2b863](https://github.com/gravity-ui/app-layout/commit/eb2b863057e3c02645a45d30505dd2027c380e0e))

## [2.2.1](https://github.com/gravity-ui/app-layout/compare/v2.2.0...v2.2.1) (2025-02-12)


### Bug Fixes

* fix typo if metrika sendTitle params ([#53](https://github.com/gravity-ui/app-layout/issues/53)) ([5ed34ee](https://github.com/gravity-ui/app-layout/commit/5ed34ee25b1edb18837e9d96edd9d2886c700aee))

## [2.2.0](https://github.com/gravity-ui/app-layout/compare/v2.1.1...v2.2.0) (2025-02-03)


### Features

* **MetrikaTitles:** add option for disable sending page title ([#51](https://github.com/gravity-ui/app-layout/issues/51)) ([c19a877](https://github.com/gravity-ui/app-layout/commit/c19a877a1a7ec7670319bff5795434873dbb28aa))

## [2.1.1](https://github.com/gravity-ui/app-layout/compare/v2.1.0...v2.1.1) (2025-01-30)


### Bug Fixes

* **RenderBodyContent:** make renderBodyContent ssr-friendly ([#49](https://github.com/gravity-ui/app-layout/issues/49)) ([cb6a9ff](https://github.com/gravity-ui/app-layout/commit/cb6a9ff123440b15e7303837ed4446c03f5af264))

## [2.1.0](https://github.com/gravity-ui/app-layout/compare/v2.0.1...v2.1.0) (2024-09-16)


### Features

* **LayoutPlugin:** allow to set and pass crossOrigin for styles and scripts ([#46](https://github.com/gravity-ui/app-layout/issues/46)) ([ce9848f](https://github.com/gravity-ui/app-layout/commit/ce9848f6f244c3b723f01590e0200d6ca5008e8a))

## [2.0.1](https://github.com/gravity-ui/app-layout/compare/v2.0.0...v2.0.1) (2024-04-09)


### Bug Fixes

* do not modify input params ([#44](https://github.com/gravity-ui/app-layout/issues/44)) ([793bfd0](https://github.com/gravity-ui/app-layout/commit/793bfd0336600fbe296084f3241466be87228a4c))

## [2.0.0](https://github.com/gravity-ui/app-layout/compare/v1.8.0...v2.0.0) (2024-03-20)


### ⚠ BREAKING CHANGES

* add uikit plugin instead of theme render param ([#43](https://github.com/gravity-ui/app-layout/issues/43))
* add htmlAttributes and bodyContent.attributes render params ([#41](https://github.com/gravity-ui/app-layout/issues/41))

### Features

* add htmlAttributes and bodyContent.attributes render params ([#41](https://github.com/gravity-ui/app-layout/issues/41)) ([f99b4ff](https://github.com/gravity-ui/app-layout/commit/f99b4ff4492a7bb85f94bbf39fa92b691d18fdc7))
* add uikit plugin instead of theme render param ([#43](https://github.com/gravity-ui/app-layout/issues/43)) ([329892c](https://github.com/gravity-ui/app-layout/commit/329892cd5fa004afdfc0745e17cdc1f91a343fe5))
* **LayoutPlugin:** allow to pass manifest content to plugin, read manifest file on initialization ([#40](https://github.com/gravity-ui/app-layout/issues/40)) ([d2465b0](https://github.com/gravity-ui/app-layout/commit/d2465b0e3d4a9fabe8fdb4eaa0f0f4ab090c5982))

## [1.8.0](https://github.com/gravity-ui/app-layout/compare/v1.7.1...v1.8.0) (2024-03-19)


### Features

* export html parts renderers ([#38](https://github.com/gravity-ui/app-layout/issues/38)) ([f5fee5e](https://github.com/gravity-ui/app-layout/commit/f5fee5ef2fa513d7e7742d61b6f374ed2154e1c7))

## [1.7.1](https://github.com/gravity-ui/app-layout/compare/v1.7.0...v1.7.1) (2024-02-27)


### Bug Fixes

* overriding existing default meta ([#36](https://github.com/gravity-ui/app-layout/issues/36)) ([e68011e](https://github.com/gravity-ui/app-layout/commit/e68011eac80d9bbd023382593ba04e4aa4305c2d))

## [1.7.0](https://github.com/gravity-ui/app-layout/compare/v1.6.0...v1.7.0) (2024-02-12)


### Features

* dynamic manifest path in layout plugin ([#33](https://github.com/gravity-ui/app-layout/issues/33)) ([f3c5b97](https://github.com/gravity-ui/app-layout/commit/f3c5b97893147c5fa7a6a1b47189f54dd65d2391))

## [1.6.0](https://github.com/gravity-ui/app-layout/compare/v1.5.0...v1.6.0) (2024-01-30)


### Features

* add type attribute to renderScript helper ([#30](https://github.com/gravity-ui/app-layout/issues/30)) ([18b0bd2](https://github.com/gravity-ui/app-layout/commit/18b0bd20013899cd67ea1bfeb1d06929b40939e8))

## [1.5.0](https://github.com/gravity-ui/app-layout/compare/v1.4.1...v1.5.0) (2024-01-12)


### Features

* calculate initial body classes in @gravity-ui/uikit notation if… ([#28](https://github.com/gravity-ui/app-layout/issues/28)) ([4e3f89f](https://github.com/gravity-ui/app-layout/commit/4e3f89fd6fbf2c0a1266b83e99f676fae6f3c180))

## [1.4.1](https://github.com/gravity-ui/app-layout/compare/v1.4.0...v1.4.1) (2023-11-23)


### Bug Fixes

* SyntaxError: Unexpected identifier 'userParams' ([#26](https://github.com/gravity-ui/app-layout/issues/26)) ([d6234a9](https://github.com/gravity-ui/app-layout/commit/d6234a9cc79de67a12678b4fd2c209f2ca0f36b6))

## [1.4.0](https://github.com/gravity-ui/app-layout/compare/v1.3.0...v1.4.0) (2023-11-15)


### Features

* add userParams prop in yaMetrika init ([#24](https://github.com/gravity-ui/app-layout/issues/24)) ([be125b1](https://github.com/gravity-ui/app-layout/commit/be125b1453b0855f745de68ae548753c6b338ee0))

## [1.3.0](https://github.com/gravity-ui/app-layout/compare/v1.2.0...v1.3.0) (2023-09-15)


### Features

* add function to get generated content for render an HTML page ([#21](https://github.com/gravity-ui/app-layout/issues/21)) ([5e8cfa3](https://github.com/gravity-ui/app-layout/commit/5e8cfa39804bd5c7d0d35c3926d65360f075c483))


### Bug Fixes

* do not render metrika for empty array ([#13](https://github.com/gravity-ui/app-layout/issues/13)) ([5d255c8](https://github.com/gravity-ui/app-layout/commit/5d255c8073ad5621dc4f9adb4072c6118d5b8f0d))
* **metrika:** only counter id is required ([#20](https://github.com/gravity-ui/app-layout/issues/20)) ([65f4328](https://github.com/gravity-ui/app-layout/commit/65f4328fd5a13683f8a542b8b935c549202a9599))
* render empty root content if bodyContent.root is not set ([#18](https://github.com/gravity-ui/app-layout/issues/18)) ([1db127a](https://github.com/gravity-ui/app-layout/commit/1db127a35b4116e46ded8ba909436e8644a6e128))

## [1.2.0](https://github.com/gravity-ui/app-layout/compare/v1.1.3...v1.2.0) (2023-03-07)


### Features

* add `&lt;html&gt;` attributes override support ([#10](https://github.com/gravity-ui/app-layout/issues/10)) ([4275f73](https://github.com/gravity-ui/app-layout/commit/4275f7300a5209f24f797b9661f5377b2417decf))

## [1.1.3](https://github.com/gravity-ui/app-layout/compare/v1.1.2...v1.1.3) (2022-12-13)


### Bug Fixes

* add nonce for preload link for scripts ([#8](https://github.com/gravity-ui/app-layout/issues/8)) ([75274b0](https://github.com/gravity-ui/app-layout/commit/75274b0f63e590fe6bde64a807141568fd3fff87))

## [1.1.2](https://github.com/gravity-ui/app-layout/compare/v1.1.1...v1.1.2) (2022-11-11)


### Bug Fixes

* add hreflang to Link type ([#6](https://github.com/gravity-ui/app-layout/issues/6)) ([da68569](https://github.com/gravity-ui/app-layout/commit/da685696bfcf75b01a4835ffe88d199de373adb1))

## [1.1.1](https://github.com/gravity-ui/app-layout/compare/v1.1.0...v1.1.1) (2022-10-25)


### Bug Fixes

* make bodyContent optional ([8a60c5d](https://github.com/gravity-ui/app-layout/commit/8a60c5dd90de98ca425ced04abcf27e42a1b8a3e))

## [1.1.0](https://github.com/gravity-ui/app-layout/compare/v1.0.1...v1.1.0) (2022-10-25)


### Features

* add default consent to GA ([cba6e51](https://github.com/gravity-ui/app-layout/commit/cba6e5187eedcc57ea38b8709c4c86d7f709eee7))

## [1.0.1](https://github.com/gravity-ui/app-layout/compare/v1.0.0...v1.0.1) (2022-10-25)


### Bug Fixes

* export plugins options types ([e9e449d](https://github.com/gravity-ui/app-layout/commit/e9e449da277a25a0c360620be0da542e48bc2e5f))

## 1.0.0 (2022-10-25)


### Features

* pass plugins to createRcreateRenderFunction, infer plugins options types from params ([d0a4cc9](https://github.com/gravity-ui/app-layout/commit/d0a4cc91770e5a8a6d0c5b3680c935b9f9f04939))


### Bug Fixes

* readme ([125db0a](https://github.com/gravity-ui/app-layout/commit/125db0a2382586a7791e86d98c8a2046a1e9f060))


### chore

* **main:** release 1.0.0 ([cf76c67](https://github.com/gravity-ui/app-layout/commit/cf76c6746fcc26a06e05068de3a62b4c97701590))
