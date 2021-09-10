import { rpc } from '@sudt-faucet/commons';
import bodyParser from 'body-parser';
import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { ServerContext } from '../types';
import { IssuerRpcHandler } from './handler';

export function startRpcServer(context: ServerContext): void {
  const app = express();
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));
  const rpcServer = new JSONRPCServer();
  const rpcHandler = new IssuerRpcHandler(context);

  rpcServer.addMethod('send_claimable_mails', (params) =>
    rpcHandler.send_claimable_mails(params as rpc.SendClaimableMailsPayload),
  );

  rpcServer.addMethod('disable_claim_secret', (params) =>
    rpcHandler.disable_claim_secret(params as rpc.DisableClaimSecretPayload),
  );
  rpcServer.addMethod('login', (params) => rpcHandler.login(params as rpc.LoginPayload));

  rpcServer.addMethod('get_claimable_account_address', () => rpcHandler.get_claimable_account_address());

  rpcServer.addMethod('claim_sudt', (params) => rpcHandler.claim_sudt(params as rpc.ClaimSudtPayload));

  rpcServer.addMethod('list_claim_history', (params) =>
    rpcHandler.list_claim_history(params as rpc.ListClaimHistoryPayload),
  );

  rpcServer.addMethod('get_claim_history', (params) =>
    rpcHandler.get_claim_history(params as rpc.GetClaimHistoryPayload),
  );

  const permissionlessMethods = new Set(['login', 'claim_sudt', 'get_claim_history']);

  app.post('/sudt-issuer/api/v1', (req, res) => {
    const jsonRpcRequest = req.body;

    if (!permissionlessMethods.has(jsonRpcRequest.method)) {
      try {
        rpcHandler.verify_user(req);
      } catch (error) {
        res.status(401);
        res.json(error);
        return;
      }
    }
    //TODO handle auth
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
