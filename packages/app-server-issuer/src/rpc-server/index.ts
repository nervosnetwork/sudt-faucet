import bodyParser from 'body-parser';
import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { IssuerRpcHandler } from './handler';

export function startRpcServer(): void {
  const app = express();
  app.use(bodyParser.json());

  const server = new JSONRPCServer();
  const rpcHandler = new IssuerRpcHandler();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.addMethod('send_claimable_mails', rpcHandler.send_claimable_mails);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.addMethod('disable_claim_secret', rpcHandler.disable_claim_secret);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.addMethod('claim_sudt', rpcHandler.claim_sudt);

  app.post('/sudt-issuer/api/v1', (req, res) => {
    const jsonRpcRequest = req.body;

    void server.receive(jsonRpcRequest).then((jsonRpcResponse) => {
      if (jsonRpcResponse) {
        res.json(jsonRpcResponse);
        return;
      }
      res.sendStatus(204);
    });
  });

  const port = 1570;
  app.listen(port, () => {
    console.log(`issuer server listen at ${port}`);
  });
}
