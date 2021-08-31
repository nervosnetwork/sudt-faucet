import Knex from 'knex';

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const knexConfig = require('./knexfile');

export async function testKnex(): Promise<void> {
  const knex = Knex(knexConfig.development);
  await knex('mail_issue').insert({ mail_address: 'ok@qq.com' });
}

void testKnex().then(() => console.log('o98k'));
