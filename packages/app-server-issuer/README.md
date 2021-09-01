# Issuer Server

## Development

### Prerequisites

Sign up [SendGrid](https://sendgrid.com/) to get `api_keys` and `verified_sender`, and make `.env` file:

```bash
// .env file
SENDGRID_API_KEY='your_api_key'
SENDGRID_VERIFIED_SENDER='your_verified_sender'
```

### Start Server

```bash
// setup mysql
bash src/db/setup_mysql.sh

// build bin
yarn build

// start server
node ./dist/index.js
```
