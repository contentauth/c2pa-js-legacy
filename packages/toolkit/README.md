# @contentauth/toolkit

This package houses the WebAssembly code that the SDK uses.

**You probably do not want to use this package directly.** To integrate with the WebAssembly code, please do so through `c2pa`.

**Note:** To run or build this package, you will need access to the `cai-toolkit` and `cms-parser` Rust libraries, which are private for now.

## Setup

Install the dependencies if you haven't already:

```
yarn install
```

Install [wasm-pack](https://github.com/rustwasm/wasm-pack). You can do this easily by running the [shell script on their page](https://rustwasm.github.io/wasm-pack/installer/) or via Cargo (the NPM route is not currently recommended because of M1 incompatibility):

```
cargo install wasm-pack
```

### Apple M1 on Monterey note

For `cargo install wasm-pack` to compile properly on macOS Monterey, you'll have to [export an environment variable](https://github.com/rust-lang/rust/issues/90342) for now, as well as install a currently-unreleased version of `wasm-pack` (as of 16 Nov 2021):

```shell
export MACOSX_DEPLOYMENT_TARGET=10.7
cargo install wasm-pack --git https://github.com/rustwasm/wasm-pack --rev ae10c23cc14b79ed37a7be222daf5fd851b9cd0d
```

## Updating the toolkit

When new versions of `cai-toolkit` are released, you will have to update the @contentauth/toolkit to bring those in. To update, locate the `[dependencies.cai_toolkit]` section in `Cargo.toml` and update the `rev` value to the SHA that you want to update to. In most cases this should be the current SHA that HEAD points to in the `main` branch of `cai-toolkit`.

After this, running `yarn dev` or `yarn build` will pull in the new dependencies. Please make a PR with the updated `Cargo.lock` file, and then follow the instructions under "Packaging" below to publish new package versions.

## Development

Run `yarn dev` to watch the `cai-toolkit` directory for changes and rebuild if necessary.

## Building

Run `yarn build` to build a production-optimized build of the WebAssembly module.

## Packaging

**Note:** You need to be a member of the `contentauth` organization to publish packages.

Before packaging, you'll have to open up a PR, get it approved, and merge it into `main`. To package, go into the root of this git repository and run `yarn run publish`. This will go through all of the changed packages and ask you what versions you'd like to increment to. After following the steps, lerna should update all versions in package.json as well as create new tags and package versions.

Please be sure to add release notes and an overview of changes to the [releases page](https://github.com/contentauth/c2pa-js-legacy/releases).
