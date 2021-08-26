import bodyParser from 'body-parser';
import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';

const server = new JSONRPCServer();

const app = express();
app.use(bodyParser.json());

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
