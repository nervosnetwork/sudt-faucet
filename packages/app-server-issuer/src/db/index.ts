import Knex from 'knex';
import knexConfig from './knexfile';

export async function testKnex(): Promise<void> {
  const knex = Knex(knexConfig.development);
  await knex('mail_issue').insert({ mail_address: 'ok@qq.com' });
}

void testKnex().then(() => console.log('o98k'));
