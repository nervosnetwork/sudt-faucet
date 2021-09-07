import { Address, HexNumber, HexString } from '@ckb-lumos/base';
import { ClaimHistory, Id, MailIssueInfo, RcIdentity, SudtInfo } from './types';

/**
 * client and server are the same interface
 *
 * @permission represents the permissions required for this RPC method
 *    - anyone: anyone can call
 *    - owner: only sudt owner can call
 *
 */
export interface IssuerRpc {
  /**
   * login via MetaMask
   * @permission [anyone]
   * @param payload
   */
  login(payload: LoginPayload): Promise<LoginResponse>;

  /**
   * @deprecated move to https://github.com/nervosnetwork/michi-internal/issues/471
   * @permission [owner]
   * @param payload
   */
  list_issued_sudt(payload: GetIssuedHistoryPayload): Promise<GetIssuedHistoryResponse>;

  /**
   * create claim secret and send claimable invitation email
   * @permission [owner]
   */
  send_claimable_mails(payload: SendClaimableMailsPayload): Promise<void>;

  /**
   * the server maintains a private key, and the sudt issuer can issue to the corresponding address,
   * the balance of this address will be used to automate the claim transfer
   * @permission [owner]
   * @param payload
   */
  get_claimable_sudt_balance(payload: GetClaimableSudtBalancePayload): Promise<GetClaimableSudtBalanceResponse>;

  /**
   * list all claim histories
   * @permission [owner]
   * @param payload
   */
  list_claim_history(payload: ListClaimHistoryPayload): Promise<ListClaimHistoryResponse>;

  /**
   * @permission [owner]
   * disable an unclaimed claim secret
   */
  disable_claim_secret(payload: DisableClaimSecretPayload): Promise<void>;

  /**
   * claim sudt, the claimable account will transfer sudt to an address
   * @permission [anyone]
   * @param payload
   */
  claim_sudt(payload: ClaimSudtPayload): Promise<void>;
}

export interface LoginPayload {
  // String(timestamp) + 'login'
  message: string;
  // personal_sign(hash(String(timestamp), 'login')) via MetaMask
  sig: HexString;
  address: HexString;
}

export interface LoginResponse {
  // https://github.com/auth0/node-jsonwebtoken
  jwt: string;
}

export interface GetIssuedHistoryPayload {
  userIdent: RcIdentity;
}

export interface GetIssuedHistoryResponse {
  sudt: SudtInfo[];
}

export interface SendClaimableMailsPayload {
  recipients: Array<MailIssueInfo>;
}

export interface ClaimSudtPayload {
  claimSecret: string;
  address: Address;
}

export interface GetClaimableSudtBalancePayload {
  sudtId: Id;
}

export interface GetClaimableSudtBalanceResponse {
  address: Address;
  amount: HexNumber;
}

export interface ListClaimHistoryPayload {
  sudtId: Id;
}

export interface ListClaimHistoryResponse {
  histories: ClaimHistory[];
}

export interface DisableClaimSecretPayload {
  /**
   * {@link ListClaimHistoryResponse.claimSecret}
   */
  claimSecret: string;
}
