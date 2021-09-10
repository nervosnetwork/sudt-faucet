import Knex, { Knex as IKnex } from 'knex';
import { ClaimRecord, InsertMailIssue, MailIssue, MailIssueStatus, MailToSend, TransactionToSend } from '../types';
import knexConfig from './knexfile';

export class DB {
  private static instance: DB;
  private knex: IKnex;

  private constructor() {
    this.knex = Knex(knexConfig.development);
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
      .select('mail_address', 'amount', 'secret', 'mail_message', 'expire_time')
      .from<MailIssue>('mail_issue')
      .where({ status: 'WaitForSendMail' })
      .limit(limit);
  }

  public async getTransactionsToSend(limit: number): Promise<TransactionToSend[]> {
    return this.knex
      .select('sudt_issuer_pubkey_hash', 'sudt_issuer_rc_id_flag', 'sudt_id', 'amount', 'claim_address', 'secret')
      .from<MailIssue>('mail_issue')
      .where({ status: 'WaitForTransfer' })
      .limit(limit);
  }

  public async getStatusBySecret(secret: string): Promise<MailIssueStatus | undefined> {
    const ret = await this.knex.select('status').from<MailIssue>('mail_issue').where({ secret: secret });
    if (ret.length > 1) throw new Error('exception: secret not unique');
    return ret[0]?.status;
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

  public async claimBySecret(secret: string, address: string, status: MailIssueStatus): Promise<void> {
    await this.knex('mail_issue').where({ secret: secret }).update({ status: status, claim_address: address });
  }

  public async getClaimHistoryBySudtId(sudtId: string): Promise<ClaimRecord[]> {
    return (await this.knex
      .select(
        this.knex.raw('mail_address, UNIX_TIMESTAMP(created_at) as created_at, expire_time, amount, secret, status'),
      )
      .from<MailIssue>('mail_issue')
      .where({ sudt_id: sudtId })
      .orderBy('id', 'desc')) as unknown as ClaimRecord[];
  }

  public async getClaimHistoryBySecret(secret: string): Promise<ClaimRecord | undefined> {
    const ret = await this.knex
      .select(
        this.knex.raw('mail_address, UNIX_TIMESTAMP(created_at) as created_at, expire_time, amount, secret, status'),
      )
      .from<MailIssue>('mail_issue')
      .where({ secret: secret });

    if (ret.length > 1) throw new Error('exception: secret not unique');

    return ret?.[0] as unknown as ClaimRecord;
  }
}
