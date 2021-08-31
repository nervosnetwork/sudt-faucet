import { HexString, HexNumber } from '@ckb-lumos/base';

/* primitive */
/**
 * object identity
 */
export type Id = string | number;
/**
 * millisecond timestamp
 */
export type Timestamp = number;
/**
 * type id {@link https://xuejie.space/2020_02_03_introduction_to_ckb_script_programming_type_id/}
 */
export type TypeId = HexString;
/**
 * rc lock identity
 */
export type RcIdentity = HexString;

export interface SudtStaticInfo {
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: HexNumber;
  description: string;
}

export interface SudtInfo extends SudtStaticInfo {
  /**
   * the rc cell type id
   * TODO rfc
   */
  id: TypeId;

  // TODO rfc
  issuer: RcIdentity;
  currentIssuedSupply: HexNumber;
}

export interface MailIssueInfo {
  sudtId: Id;

  mail: string;
  amount: HexString;
  expiredAt: Timestamp;

  /**
   * A claimable email will have a fixed string of information, something like this
   *
   *```mail
   * Hi,
   *
   * {{additionalMessage}}
   *
   * This is an airdrop email from Ins, click this link to claim token.
   * https://domain.com?claim_secret=abcdefg
   * ```
   */
  additionalMessage: string;
}

// the claimable mail has been sent, but no claim has been made yet
export interface Unclaimed {
  status: 'unclaimed';
}

// the claim amount was sent to the address, but there are not yet 15 confirmations
export interface Claiming {
  status: 'claiming';
  claimedStartAt: Timestamp;
  txHash: HexString;
  confirmation: number;
}

// claimed after 15 confirmations
export interface Claimed {
  status: 'claimed';
  claimedStartAt: Timestamp;
  claimedAt: Timestamp;
  txHash: HexString;
}

export type ClaimStatus = Unclaimed | Claiming | Claimed;

export interface ClaimHistory {
  /**
   * target
   */
  mail: string;
  /**
   * when this email was sent
   */
  createdAt: Timestamp;
  /**
   * expiration date of a claim secret
   */
  expiredAt: Timestamp;
  /**
   * sudt amount
   */
  amount: HexString;
  /**
   * a claim secret can only be claimed once
   */
  claimSecret: Id;

  claimStatus: ClaimStatus;
}
