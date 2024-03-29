import { ExchangeSudtForCkbBuilder } from '@ckitjs/ckit';
import { serialize } from '@ckitjs/ckit/dist/helpers/pw.serde';
import {
  rpc,
  utils,
  verifyLoginMessage,
  createToken,
  verifyToken,
  ClaimStatus,
  Unclaimed,
  Claimed,
  Disabled,
  ClaimHistory,
} from '@sudt-faucet/commons';
import { Request } from 'express';
import Joi from 'joi';
import {
  GenerateDepositToGodWokenPayload,
  GenerateDepositToGodWokenResponse,
} from '../../../commons/src/interfaces/rpc';
import { DB } from '../db';
import { ExchangeProviderManager } from '../exchange-provider/ExchangeProviderManager';
import { InsertMailIssue, ServerContext, ClaimRecord } from '../types';
import { genKeyPair } from '../utils/createKey';
import { claimSudtPayloadSchema, sendMailsPayloadSchema } from './validate';

const keyPair = genKeyPair();

export class IssuerRpcHandler implements rpc.IssuerRpc {
  constructor(private context: ServerContext) {}

  async login(payload: rpc.LoginPayload): Promise<rpc.LoginResponse> {
    if (!process.env.OWNER_PUBKEY_HASH) throw new Error('OWNER_PUBKEY_HASH not set');
    const address = process.env.OWNER_PUBKEY_HASH;
    const { message, sig } = payload;
    const result = await verifyLoginMessage(sig, message, address);
    if (result) {
      const token = createToken(message, keyPair.privateKey);
      return { jwt: token };
    }
    throw new Error('Only the owner is allowed to access');
  }

  verify_user(req: Request): void {
    const token = req.get('authorization') || '';
    verifyToken(token, keyPair.publicKey);
  }

  list_issued_sudt(_payload: rpc.GetIssuedHistoryPayload): Promise<rpc.GetIssuedHistoryResponse> {
    utils.unimplemented();
  }

  send_claimable_mails(payload: rpc.SendClaimableMailsPayload): Promise<void> {
    const validatedPayload = Joi.attempt(payload, sendMailsPayloadSchema) as rpc.SendClaimableMailsPayload;

    const recordsWithSecret: InsertMailIssue[] = validatedPayload.recipients.map((recipient) => {
      return {
        mail_address: recipient.mail,
        sudt_issuer_pubkey_hash: validatedPayload.rcIdentity.pubkeyHash,
        sudt_issuer_rc_id_flag: Number(validatedPayload.rcIdentity.flag),
        sudt_id: recipient.sudtId,
        amount: recipient.amount,
        secret: utils.randomHexString(32).slice(2),
        mail_message: recipient.additionalMessage,
        expire_time: recipient.expiredAt,
        status: 'WaitForSendMail',
      };
    });
    return DB.getInstance().batchInsertMailIssue(recordsWithSecret);
  }

  get_claimable_sudt_balance(
    _payload: rpc.GetClaimableSudtBalancePayload,
  ): Promise<rpc.GetClaimableSudtBalanceResponse> {
    utils.unimplemented();
  }

  async generate_deposit_to_godwoken_tx(
    payload: GenerateDepositToGodWokenPayload,
  ): Promise<GenerateDepositToGodWokenResponse> {
    const cells = await ExchangeProviderManager.getInstance().getLeagalCells(payload.amountForExchangeWithCkb);
    const builder = new ExchangeSudtForCkbBuilder(
      {
        sudt: payload.sudt,
        sudtSender: payload.sudtSender,
        sudtAmountForExchange: payload.amountForExchangeWithCkb,
        sudtAmountForRecipient: payload.amountForRecipient,
        exchangeProvider: cells,
        ckbAmountForRecipient: ExchangeProviderManager.getInstance()
          .calcExchangableCkbAmount(payload.amountForExchangeWithCkb)
          .toHexString(),
        exchangeRecipient: payload.exchangeRecipient,
      },
      this.context.ckitProvider,
    );
    const unsignedTx = await builder.build();

    const partialSignedTx = await this.context.exchangeSigner!.partialSeal(unsignedTx);

    return {
      transaction: serialize(partialSignedTx),
    };
  }

  async list_claim_history(payload: rpc.ListClaimHistoryPayload): Promise<rpc.ListClaimHistoryResponse> {
    const records = await DB.getInstance().getClaimHistoryBySudtId(payload.sudtId);
    const claimHistories = records.map(convertRecordToResponse);
    return { histories: claimHistories };
  }

  async get_claim_history(payload: rpc.GetClaimHistoryPayload): Promise<rpc.GetClaimHistoryResponse> {
    const record = await DB.getInstance().getClaimHistoryBySecret(payload.secret);
    return { history: record ? convertRecordToResponse(record) : null };
  }

  get_claimable_account_address(): Promise<string> {
    return this.context.txSigner.getAddress();
  }

  async disable_claim_secret(payload: rpc.DisableClaimSecretPayload): Promise<void> {
    return DB.getInstance().disableSecret(payload.claimSecret);
  }

  async claim_sudt(payload: rpc.ClaimSudtPayload): Promise<void> {
    Joi.assert(payload, claimSudtPayloadSchema);
    this.context.ckitProvider.parseToScript(payload.address);
    return DB.getInstance().claimSudtBySecret(payload.claimSecret, payload.address);
  }
}

function convertRecordToResponse(record: ClaimRecord): ClaimHistory {
  const claimStatus: ClaimStatus = (() => {
    switch (record.status) {
      case 'WaitForSendMail':
      case 'WaitForClaim':
        return { status: 'unclaimed' } as Unclaimed;
      case 'WaitForTransfer':
      case 'SendingTransaction':
      case 'WaitForTransactionCommit':
      case 'WaitForTransactionConfirm':
      case 'Done':
      case 'BuildTransactionError':
      case 'SendTransactionError':
      case 'SendMailError': {
        return {
          status: 'claimed',
          claimedStartAt: 0,
          txHash: record.tx_hash ?? '',
          claimedAt: 0,
          address: record.claim_address,
        } as Claimed;
      }
      case 'Disabled': {
        return {
          status: 'disabled',
        } as Disabled;
      }
      default:
        throw new Error('exception: unknown record status');
    }
  })();
  return {
    mail: record.mail_address,
    createdAt: Number(record.created_at) * 1000,
    expiredAt: record.expire_time,
    amount: record.amount,
    claimSecret: record.secret,
    claimStatus,
  };
}
