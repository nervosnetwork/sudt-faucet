import { JSONRPCClient } from 'json-rpc-2.0';
import { rpc } from './interfaces';

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

export class RpcClient implements rpc.IssuerRpc {
  async get_claimable_account_address(): Promise<string> {
    return rpcClient.request('get_claimable_account_address');
  }

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
    return Promise.resolve({
      address: 'Address',
      amount: 'HexNumber7788',
    });
    return rpcClient.request('get_claimable_sudt_balance', payload);
  }

  async list_claim_history(payload: rpc.ListClaimHistoryPayload): Promise<rpc.ListClaimHistoryResponse> {
    return rpcClient.request('list_claim_history', payload);
  }

  async disable_claim_secret(payload: rpc.DisableClaimSecretPayload): Promise<void> {
    return rpcClient.request('disable_claim_secret', payload);
  }

  async claim_sudt(payload: rpc.ClaimSudtPayload): Promise<void> {
    return rpcClient.request('claim_sudt', payload);
  }
}
