import { rpc, utils, verifyLoginMessage, createToken, verifyToken } from '@sudt-faucet/commons';
import dotenv from 'dotenv';
import { Request } from 'express';
import { DB } from '../db';
import { genKeyPair } from '../util/createKey';
dotenv.config();

const keyPair = genKeyPair();
export class IssuerRpcHandler implements rpc.IssuerRpc {
  async login(payload: rpc.LoginPayload): Promise<rpc.LoginResponse> {
    if (!process.env.USER_ADDRESS) throw new Error('USER_ADDRESS not set');
    const address = process.env.USER_ADDRESS;
    const { message, sig } = payload;
    const result = await verifyLoginMessage(sig, message, address);
    if (result) {
      const token = createToken(address, keyPair.privateKey);
      return { jwt: token };
    }
    throw new Error('Only the owner is allowed to access');
  }

  get_user_address(req: Request): string {
    const token = req.get('authorization') || '';
    return verifyToken(token, keyPair.publicKey);
  }

  list_issued_sudt(_payload: rpc.GetIssuedHistoryPayload): Promise<rpc.GetIssuedHistoryResponse> {
    utils.unimplemented();
  }

  send_claimable_mails(payload: rpc.SendClaimableMailsPayload): Promise<void> {
    if (payload.recipients.length === 0) throw new Error('call send_claimable_mails with empty payload');
    return DB.getInstance().batchInsertMailIssue(payload);
  }

  get_claimable_sudt_balance(
    _payload: rpc.GetClaimableSudtBalancePayload,
  ): Promise<rpc.GetClaimableSudtBalanceResponse> {
    utils.unimplemented();
  }

  list_claim_history(_payload: rpc.ListClaimHistoryPayload): Promise<rpc.ListClaimHistoryResponse> {
    utils.unimplemented();
  }

  get_claimable_account_address(): Promise<string> {
    utils.unimplemented();
  }

  // TODO resolve concurrency with claim sudt
  async disable_claim_secret(payload: rpc.DisableClaimSecretPayload): Promise<void> {
    const db = DB.getInstance();
    const status = await db.getStatusBySecret(payload.claimSecret);
    if (!status) throw new Error('error: secret not found');
    if (status !== 'unclaimed') throw new Error('error: can not disable claimed secret');
    return db.updateStatusBySecret(payload.claimSecret, 'disabled');
  }

  claim_sudt(_payload: rpc.ClaimSudtPayload): Promise<void> {
    utils.unimplemented();
  }
}
