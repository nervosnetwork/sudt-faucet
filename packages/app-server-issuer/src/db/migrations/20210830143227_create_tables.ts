import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('mail_issue', (tableBuilder) => {
    tableBuilder.increments();
    tableBuilder.string('mail_address');
    tableBuilder.string('sudt_id');
    tableBuilder.string('amount');
    tableBuilder.string('secret', 32);
    tableBuilder.string('mail_message');
    tableBuilder.timestamp('expire_time');
    tableBuilder.timestamp('claim_time');
    tableBuilder.string('claim_address');
    tableBuilder.string('tx_hash', 66);
    tableBuilder.integer('confirm_number');
    tableBuilder.timestamp('confirm_time');
    tableBuilder.string('status');
    tableBuilder.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('mail_issue');
}
