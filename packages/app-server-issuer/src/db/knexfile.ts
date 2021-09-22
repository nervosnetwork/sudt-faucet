const password = process.env.MYSQL_PASSWORD || '123456';
const host = process.env.MYSQL_HOST || '127.0.0.1';
const port = process.env.MYSQL_PORT || '3306';
const database = process.env.MYSQL_DATABASE;

const knexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: host,
      database: database,
      port: port,
      user: 'root',
      password: password,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {},

  production: {
    client: 'mysql2',
    connection: {
      host: host,
      database: database,
      port: port,
      user: 'root',
      password: password,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

export default knexConfig;
