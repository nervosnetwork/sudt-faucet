const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;

function nonNullable(condition: unknown, name = 'The variable'): asserts condition {
  if (!condition) throw new Error(`${name} cannot be nil`);
}

nonNullable(password);
nonNullable(host);
nonNullable(port);

const knexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: host,
      database: 'sudt_faucet',
      port: port,
      user: 'root',
      password: password,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {},

  production: {},
};

export default knexConfig;
