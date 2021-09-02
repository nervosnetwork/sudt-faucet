const knexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      database: 'sudt_faucet',
      user: 'root',
      password: '123456',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {},

  production: {},
};

export default knexConfig;
