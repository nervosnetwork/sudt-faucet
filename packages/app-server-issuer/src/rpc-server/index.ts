import { rpc } from '@sudt-faucet/commons';
import bodyParser from 'body-parser';
import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { IssuerRpcHandler } from './handler';
export function startRpcServer(): void {
  const app = express();
  app.use(bodyParser.json());

  const rpcServer = new JSONRPCServer();
  const rpcHandler = new IssuerRpcHandler();

  rpcServer.addMethod('send_claimable_mails', (params) =>
    rpcHandler.send_claimable_mails(params as rpc.SendClaimableMailsPayload),
  );

  rpcServer.addMethod('disable_claim_secret', (params) =>
    rpcHandler.disable_claim_secret(params as rpc.DisableClaimSecretPayload),
  );
  rpcServer.addMethod('login', (params) => rpcHandler.login(params as rpc.LoginPayload));

  rpcServer.addMethod('claim_sudt', (params) => rpcHandler.claim_sudt(params as rpc.ClaimSudtPayload));

  app.post('/sudt-issuer/api/v1', (req, res) => {
    const jsonRpcRequest = req.body;
    //TODO handle auth
    // rpcHandler.get_user_address(req);
    void rpcServer.receive(jsonRpcRequest).then((jsonRpcResponse) => {
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
