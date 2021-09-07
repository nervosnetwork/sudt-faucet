import { JSONRPCClient } from 'json-rpc-2.0';

type Header = {
  authorization?: string;
  'content-type': string;
};

const client: JSONRPCClient = new JSONRPCClient((jsonRPCRequest) => {
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
      return response.json().then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }

    return Promise.reject(response);
  });
});

export default client;
