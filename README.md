# C2PA JavaScript SDK (legacy)

> [!WARNING]  
> The packages in this monorepo are now deprecated. Implementors wishing to interact with C2PA data on the web should use our [new libraries instead](https://github.com/contentauth/c2pa-js).

This library aims to make viewing and verifying C2PA metadata in the browser as easy as possible.

For more information, please view the documentation at https://opensource.contentauthenticity.org/docs/js-sdk/getting-started/overview.

## Prerequisites

To build this library on macOS, you must first install LLVM Clang as follows:
1. If you haven't already, install Homebrew:
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
1. Install LLVM Clang:
  ```
  brew install llvm
  ```
1. Add it to your PATH:
  ```
  export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
  ```
  For future use, add it to your `.zshrc` file:
  ```
  echo 'export PATH="/opt/homebrew/opt/llvm/bin:$PATH"' >> ~/.zshrc
  ```

Verify the installation:
  ```
  llvm-config --version
  ```
You should see a version number, such as 20.1.3.

## Build

This monorepo is managed by [Rush](https://rushjs.io/). To build the library:

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
