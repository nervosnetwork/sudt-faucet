export type token = {
  id: string;
  name: string;
  symbol: string;
  unissued: string;
  issued: string;
  decimals: number;
  description?: string;
};

export type account = {
  mail: string;
  date: string;
  amount: number;
  address: string;
  status: 'wait for claim' | 'claimed' | 'expired';
  claimCode: string;
};

export type emailIssue = {
  sudtId: string;
  mail: string;
  amount: string;
  expiredDate: string;
  addtionalMessage: string;
};
