# CKB UDT Issuer

## Development

### Requirement

- NodeJS 12.x
- yarn 1.x

### Start Development UI

```
// init ckit submodule
// submodule will be removed when ckit published
git submodule update --init

// install dependencies
yarn install

// build packages
yarn build:lib

// start apps
yarn workspace @sudt-faucet/app-ui-issuer start
yarn workspace claim-ui start
```
