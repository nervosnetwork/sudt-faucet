import dotenv from 'dotenv';
import { startRpcServer } from './rpc-server';
import { startSendGrid } from './sendgrid';

async function main() {
  dotenv.config();
  void startSendGrid();
  startRpcServer();
}

void main();
