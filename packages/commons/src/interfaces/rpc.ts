import { Address, HexNumber, HexString } from '@ckb-lumos/base';
import { ClaimHistory, MailIssueInfo, RcIdentity, SudtInfo } from './types';

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
  // list_issued_sudt(payload: GetIssuedHistoryPayload): Promise<GetIssuedHistoryResponse>;

  /**
   * the address corresponding to the private key hosted on the server,
   * which is generally the account used to automatically transfer to claim users
   */
  get_claimable_account_address(): Promise<Address>;

  /**
   * create claim secret and send claimable invitation email
   * @permission [owner]
   */
  send_claimable_mails(payload: SendClaimableMailsPayload): Promise<void>;

  /**
   * list all claim histories
   * @permission [owner]
   * @param payload
   */
  list_claim_history(payload: ListClaimHistoryPayload): Promise<ListClaimHistoryResponse>;

  /**
   * get single claim history via claim secret
   * @permission [anyone]
   * @param payload
   */
  get_claim_history(payload: GetClaimHistoryPayload): Promise<GetClaimHistoryResponse>;

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
  rcIdentity: RcIdentity;
  recipients: Array<MailIssueInfo>;
}

export interface ClaimSudtPayload {
  claimSecret: string;
  address: Address;
}

export interface GetClaimableSudtBalancePayload {
  sudtId: string;
}

export interface GetClaimableSudtBalanceResponse {
  address: Address;
  amount: HexNumber;
}

export interface ListClaimHistoryPayload {
  sudtId: string;
  addressOrEmail?: string;
  status?: string;
}

export interface ListClaimHistoryResponse {
  histories: ClaimHistory[];
}

export interface GetClaimHistoryPayload {
  secret: string;
}

export interface GetClaimHistoryResponse {
  history: ClaimHistory | null;
}

export interface DisableClaimSecretPayload {
  /**
   * {@link ListClaimHistoryResponse.claimSecret}
   */
  claimSecret: string;
}
