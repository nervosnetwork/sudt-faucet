import { startRpcServer } from './rpc-server';
import { startSendGrid } from './sendgrid';

async function main() {
  void startSendGrid();
  startRpcServer();
}

void main();
