import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('mail_issue', (tableBuilder) => {
    tableBuilder.increments();
    tableBuilder.string('mail_address').notNullable();
    tableBuilder.string('sudt_issuer_pubkey_hash', 66).notNullable();
    tableBuilder.integer('sudt_issuer_rc_id_flag').notNullable();
    tableBuilder.string('sudt_id').notNullable();
    tableBuilder.decimal('amount', 36, 0).unsigned().notNullable();
    tableBuilder.string('secret', 32).notNullable().unique();
    tableBuilder.string('mail_message', 2048).notNullable().defaultTo('');
    tableBuilder.bigInteger('expire_time');
    tableBuilder.bigInteger('claim_time');
    tableBuilder.string('claim_address');
    tableBuilder.string('tx_hash', 66);
    tableBuilder.integer('confirm_number');
    tableBuilder.bigInteger('confirm_time');
    tableBuilder.string('status').notNullable();
    tableBuilder.string('error', 1024);
    tableBuilder.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    tableBuilder
      .dateTime('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    tableBuilder.charset('utf8mb4');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('mail_issue');
}
