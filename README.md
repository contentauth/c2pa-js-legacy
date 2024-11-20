# C2PA JavaScript SDK

This library aims to make viewing and verifying C2PA metadata in the browser as easy as possible.

For more information, please view the documentation at https://opensource.contentauthenticity.org/docs/js-sdk/getting-started/overview.

## Getting started

This monorepo is managed by [Rush](https://rushjs.io/). To get started:

Install Rush:
```
npm install -g @microsoft/rush
```
Install Rush-managed tooling and package dependencies: 
```
rush install
```
Build all packages:
```
rush build 
```

To run an individual package's `package.json` commands, use the `rushx` command from within that package's directory, e.g.:
```
cd packages/c2pa
rushx dev
```

### Contributions and feedback

We welcome contributions to this project.  For information on contributing, providing feedback, and ongoing work, see [Contributing](CONTRIBUTING.md).

## License

This repository is distributed under the terms of the [MIT license](LICENSE).

Some components and dependent crates are licensed under different terms; please check 