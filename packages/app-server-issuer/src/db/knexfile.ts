import dotenv from 'dotenv';
import { nonNullable } from '../util';

dotenv.config();

const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;

nonNullable(host, 'env MYSQL_HOST');
nonNullable(port, 'env MYSQL_PORT');
nonNullable(user, 'env MYSQL_USER');
nonNullable(password, 'env MYSQL_PASSWORD');
nonNullable(database, 'env MYSQL_DATABASE');

const knexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: host,
      database: database,
      port: port,
      user: user,
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
      user: user,
      password: password,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

export default knexConfig;
