import { unimplemented } from '@ckit/utils';
import { rpc } from '@sudt-faucet/commons';
import {
  ClaimSudtPayload,
  DisableClaimSecretPayload,
  GetClaimableSudtBalancePayload,
  GetClaimableSudtBalanceResponse,
  GetIssuedHistoryPayload,
  GetIssuedHistoryResponse,
  ListClaimHistoryPayload,
  ListClaimHistoryResponse,
  LoginPayload,
  LoginResponse,
  SendClaimableMailsPayload,
} from '@sudt-faucet/commons/src/interfaces/rpc';
import { DB } from '../db';

export class IssuerRpcHandler implements rpc.IssuerRpc {
  login(_payload: LoginPayload): Promise<LoginResponse> {
    unimplemented();
  }

  list_issued_sudt(_payload: GetIssuedHistoryPayload): Promise<GetIssuedHistoryResponse> {
    unimplemented();
  }

  send_claimable_mails(payload: SendClaimableMailsPayload): Promise<void> {
    if (payload.recipients.length === 0) throw new Error('call send_claimable_mails with empty payload');
    return DB.getInstance().batchInsertMailIssue(payload);
  }

  get_claimable_sudt_balance(_payload: GetClaimableSudtBalancePayload): Promise<GetClaimableSudtBalanceResponse> {
    unimplemented();
  }

  list_claim_history(_payload: ListClaimHistoryPayload): Promise<ListClaimHistoryResponse> {
    unimplemented();
  }

  disable_claim_secret(_payload: DisableClaimSecretPayload): Promise<void> {
    unimplemented();
  }

  claim_sudt(_payload: ClaimSudtPayload): Promise<void> {
    unimplemented();
  }
}
