import { rpc, utils } from '@sudt-faucet/commons';
import { DB } from '../db';

export class IssuerRpcHandler implements rpc.IssuerRpc {
  login(_payload: rpc.LoginPayload): Promise<rpc.LoginResponse> {
    utils.unimplemented();
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

  disable_claim_secret(payload: rpc.DisableClaimSecretPayload): Promise<void> {
    return DB.getInstance().updateStatusBySecret(payload.claimSecret, 'disabled');
  }

  claim_sudt(_payload: rpc.ClaimSudtPayload): Promise<void> {
    utils.unimplemented();
  }
}
