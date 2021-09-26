# Issuer Server

## Development

### Prerequisites

Sign up [SendGrid](https://sendgrid.com/) to get `api_keys` and `verified_sender`, then config `.env` file:

```bash
# copy from .env.development, then make .env fields complete
cp  .env.development .env
```

To login with matemask, relase the `OWNER_PUBKEY_HASH`in `.env` file to your matemask address

### Start Server

```bash
// setup mysql
bash src/db/setup_mysql_dev.sh

// build bin
yarn build

// start server
node ./dist/index.js
```
