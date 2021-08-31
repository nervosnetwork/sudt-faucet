import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('mail_issue', (tableBuilder) => {
    tableBuilder.increments();
    tableBuilder.string('mail_address').notNullable();
    tableBuilder.string('sudt_id').notNullable();
    tableBuilder.string('amount').notNullable();
    tableBuilder.string('secret', 32).notNullable().index();
    tableBuilder.string('mail_message');
    tableBuilder.timestamp('expire_time').nullable().defaultTo(null);
    tableBuilder.timestamp('claim_time').nullable().defaultTo(null);
    tableBuilder.string('claim_address');
    tableBuilder.string('tx_hash', 66);
    tableBuilder.integer('confirm_number');
    tableBuilder.timestamp('confirm_time').nullable().defaultTo(null);
    tableBuilder.string('status').notNullable();
    tableBuilder.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('mail_issue');
}
