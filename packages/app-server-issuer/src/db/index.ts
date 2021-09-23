import Knex, { Knex as IKnex } from 'knex';
import { ClaimRecord, InsertMailIssue, MailIssue, MailIssueStatus, MailToSend, TransactionToSend } from '../types';
import knexConfig from './knexfile';

export class DB {
  private static instance: DB;
  private knex: IKnex;

  private constructor() {
    const config = (() => {
      switch (process.env.NODE_ENV) {
        case undefined:
        case 'development':
          return knexConfig.development;
        case 'production':
          return knexConfig.production;
        default:
          throw new Error('unknown value of env NODE_ENV');
      }
    })();
    this.knex = Knex(config);
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  public async batchInsertMailIssue(records: InsertMailIssue[]): Promise<void> {
    await this.knex.batchInsert('mail_issue', records, records.length);
  }

  public async getMailsToSend(limit: number): Promise<MailToSend[]> {
    return this.knex
      .select(
        'mail_address',
        'sudt_issuer_pubkey_hash',
        'sudt_issuer_rc_id_flag',
        'sudt_id',
        'amount',
        'secret',
        'mail_message',
        'expire_time',
      )
      .from<MailIssue>('mail_issue')
      .where({ status: 'WaitForSendMail' })
      .limit(limit);
  }

  public async getTransactionsToSend(limit: number): Promise<TransactionToSend[]> {
    return this.knex
      .select('sudt_issuer_pubkey_hash', 'sudt_issuer_rc_id_flag', 'sudt_id', 'amount', 'claim_address', 'secret')
      .from<MailIssue>('mail_issue')
      .whereIn('status', ['WaitForTransfer', 'BuildTransactionError'])
      .limit(limit);
  }

  public async disableSecret(secret: string): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      const statusRow = await this.knex
        .select('status')
        .from<MailIssue>('mail_issue')
        .where({ secret: secret })
        .forUpdate()
        .transacting(trx);
      if (statusRow.length > 1) throw new Error('exception: secret not unique');

      const status = statusRow[0]?.status;
      if (!status) throw new Error('error: secret not found');

      if (status === 'Disabled') throw new Error('error: secret already disabled');
      if (status !== 'WaitForSendMail' && status !== 'WaitForClaim')
        throw new Error('error: can not disable secret after user claimed');
      await this.knex('mail_issue').where({ secret: secret }).update({ status: 'Disabled' }).transacting(trx);
    } catch (e) {
      await trx.rollback();
      throw e;
    }
    await trx.commit();
  }

  public async claimSudtBySecret(secret: string, address: string): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      const rows = await this.knex
        .select('status', 'expire_time')
        .from<MailIssue>('mail_issue')
        .where({ secret: secret })
        .forUpdate()
        .transacting(trx);
      if (rows.length > 1) throw new Error('exception: secret not unique');
      if (rows.length === 0)
        throw new Error('The claim is invalid. Please make sure you have a valid claim invitation');

      if (rows[0]!.expire_time <= new Date().getTime()) throw new Error('The claim secret was expired');

      const status = rows[0]!.status;
      if (!status) throw new Error('The claim is invalid. Please make sure you have a valid claim invitation');
      if (status !== 'WaitForClaim') throw new Error('It seems you have already claimed');

      await this.knex('mail_issue')
        .where({ secret: secret })
        .update({
          status: 'WaitForTransfer',
          claim_address: address,
        })
        .transacting(trx);
    } catch (e) {
      await trx.rollback();
      throw e;
    }
    await trx.commit();
  }

  public async updateStatusToWaitForClaim(secrets: string[]): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      const rows = await this.knex
        .select('secret', 'status')
        .from<MailIssue>('mail_issue')
        .whereIn('secret', secrets)
        .forUpdate()
        .transacting(trx);
      const secretsOfUpdateRows = rows.filter((row) => row.status !== 'Disabled').map((row) => row.secret);

      if (secretsOfUpdateRows.length > 0)
        await this.knex('mail_issue')
          .whereIn('secret', secretsOfUpdateRows)
          .update({ status: 'WaitForClaim' })
          .transacting(trx);
    } catch (e) {
      await trx.rollback();
      throw e;
    }
    await trx.commit();
  }

  public async updateStatusBySecrets(secrets: string[], status: MailIssueStatus): Promise<void> {
    await this.knex('mail_issue').whereIn('secret', secrets).update({ status: status });
  }

  public async updateTxHashBySecrets(secrets: string[], txHash: string, status: MailIssueStatus): Promise<void> {
    await this.knex('mail_issue').whereIn('secret', secrets).update({ tx_hash: txHash, status: status });
  }

  public async updateErrorBySecrets(secrets: string[], error: string, status: MailIssueStatus): Promise<void> {
    const truncatedError = error.length > 1024 ? error.slice(0, 1023) : error;
    await this.knex('mail_issue').whereIn('secret', secrets).update({ error: truncatedError, status: status });
  }

  public async getClaimHistoryBySudtId(sudtId: string): Promise<ClaimRecord[]> {
    return (await this.knex
      .select(
        this.knex.raw(
          'mail_address, UNIX_TIMESTAMP(created_at) as created_at, expire_time, amount, secret, claim_address, tx_hash, status',
        ),
      )
      .from<MailIssue>('mail_issue')
      .where({ sudt_id: sudtId })
      .orderBy('id', 'desc')) as unknown as ClaimRecord[];
  }

  public async getClaimHistoryBySecret(secret: string): Promise<ClaimRecord | undefined> {
    const ret = await this.knex
      .select(
        this.knex.raw(
          'mail_address, UNIX_TIMESTAMP(created_at) as created_at, expire_time, amount, secret, claim_address, tx_hash, status',
        ),
      )
      .from<MailIssue>('mail_issue')
      .where({ secret: secret });

    if (ret.length > 1) throw new Error('exception: secret not unique');

    return ret?.[0] as unknown as ClaimRecord;
  }
}
