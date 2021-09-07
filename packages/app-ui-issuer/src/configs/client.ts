import { JSONRPCClient } from 'json-rpc-2.0';
import { ClaimHistory, rpc } from '@sudt-faucet/commons';

type Header = {
  authorization?: string;
  'content-type': string;
};

const rpcClient: JSONRPCClient = new JSONRPCClient((jsonRPCRequest) => {
  const headers: Header = {
    'content-type': 'application/json',
  };
  const jwt = localStorage.getItem('authorization');
  if (jwt) {
    headers.authorization = jwt;
  }
  return fetch('/sudt-issuer/api/v1', {
    method: 'POST',
    headers,
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response.json().then((jsonRPCResponse) => rpcClient.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }

    return Promise.reject(response);
  });
});

class Client implements rpc.IssuerRpc {
  async login(payload: rpc.LoginPayload): Promise<rpc.LoginResponse> {
    return rpcClient.request('login', payload);
  }

  async list_issued_sudt(payload: rpc.GetIssuedHistoryPayload): Promise<rpc.GetIssuedHistoryResponse> {
    return rpcClient.request('list_issued_sudt', payload);
  }

  async send_claimable_mails(payload: rpc.SendClaimableMailsPayload): Promise<void> {
    return rpcClient.request('send_claimable_mails', payload);
  }

  async get_claimable_sudt_balance(
    payload: rpc.GetClaimableSudtBalancePayload,
  ): Promise<rpc.GetClaimableSudtBalanceResponse> {
    return rpcClient.request('get_claimable_sudt_balance', payload);
  }

  async list_claim_history(payload: rpc.ListClaimHistoryPayload): Promise<rpc.ListClaimHistoryResponse> {
    const histories: ClaimHistory[] = [
      {
        mail: 'wangximing@cryptape.com',
        createdAt: 1631160474000,
        expiredAt: 1631160474000,
        amount: '100',
        // address: 'ckbxxxxx',
        claimStatus: {
          status: 'claiming',
          claimedStartAt: 1631160474000,
          txHash: 'HexString',
          confirmation: 2,
        },
        claimSecret: 'dajskldfj',
      },
      {
        mail: 'wangximing@cryptape.com',
        createdAt: 1631160474000,
        expiredAt: 1631160474000,
        amount: '100',
        // address: 'ckbxxxxx',
        claimStatus: {
          status: 'unclaimed',
        },
        claimSecret: 'dajskldfj',
      },
      {
        mail: 'wangximing@cryptape.com',
        createdAt: 1631160474000,
        expiredAt: 1631160474000,
        amount: '100',
        // address: 'ckbxxxxx',
        claimStatus: {
          status: 'claimed',
          claimedStartAt: 1631160474000,
          claimedAt: 1631160474000,
          txHash: 'HexString',
        },
        claimSecret: 'dajskldfj',
      },
    ];
    const data: rpc.ListClaimHistoryResponse = {
      histories: histories,
    };
    return Promise.resolve(data);
    // return rpcClient.request('list_claim_history', payload);
  }

  async disable_claim_secret(payload: rpc.DisableClaimSecretPayload): Promise<void> {
    return rpcClient.request('disable_claim_secret', payload);
  }

  async claim_sudt(payload: rpc.ClaimSudtPayload): Promise<void> {
    return rpcClient.request('claim_sudt', payload);
  }
}
const client: Client = new Client();

export default client;
