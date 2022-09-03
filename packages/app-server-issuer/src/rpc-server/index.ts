import { rpc } from '@sudt-faucet/commons';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { loggerWithModule } from '../logger';
import { ServerContext } from '../types';
import { IssuerRpcHandler } from './handler';

const logger = loggerWithModule('RpcServer');

export function startRpcServer(context: ServerContext): void {
  const app = express();
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));
  const rpcServer = new JSONRPCServer();
  const rpcHandler = new IssuerRpcHandler(context);

  app.get('/ping', (req, res) => {
    res.send('pong');
  });

  rpcServer.addMethod('login', (params) => rpcHandler.login(params as rpc.LoginPayload));
  rpcServer.addMethod('send_claimable_mails', (params) =>
    rpcHandler.send_claimable_mails(params as rpc.SendClaimableMailsPayload),
  );
  rpcServer.addMethod('disable_claim_secret', (params) =>
    rpcHandler.disable_claim_secret(params as rpc.DisableClaimSecretPayload),
  );
  rpcServer.addMethod('get_claimable_account_address', () => rpcHandler.get_claimable_account_address());
  rpcServer.addMethod('generate_deposit_to_godwoken_tx', (params) =>
    rpcHandler.generate_deposit_to_godwoken_tx(params as rpc.GenerateDepositToGodWokenPayload),
  );
  rpcServer.addMethod('claim_sudt', (params) => rpcHandler.claim_sudt(params as rpc.ClaimSudtPayload));
  rpcServer.addMethod('list_claim_history', (params) =>
    rpcHandler.list_claim_history(params as rpc.ListClaimHistoryPayload),
  );

  rpcServer.addMethod('get_claim_history', (params) =>
    rpcHandler.get_claim_history(params as rpc.GetClaimHistoryPayload),
  );

  const permissionlessMethods = new Set([
    'login',
    'claim_sudt',
    'get_claim_history',
    'generate_deposit_to_godwoken_tx',
  ]);

  const allowedCorsMethods = new Set(['generate_deposit_to_godwoken_tx']);

  app.use(
    cors((req, cb) => {
      if (req.method === 'OPTIONS' || allowedCorsMethods.has(req.body.method)) {
        cb(null, { origin: true });
      }
      cb(null, { origin: false });
    }),
  );

  app.post('/sudt-issuer/api/v1', (req, res) => {
    const jsonRpcRequest = req.body;
    logger.http(`Request: ${JSON.stringify(jsonRpcRequest)}`);

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
        if (jsonRpcResponse.error) {
          logger.http(`Response: ${JSON.stringify(jsonRpcResponse)}`);
        }
        res.json(jsonRpcResponse);
        return;
      }
      res.sendStatus(204);
    });
  });

  const port = (process.env.SERVER_LISTEN_PORT ?? 1570) as number;
  app.listen(port, () => {
    logger.info(`Rpc server started and listen at ${port}`);
  });
}
