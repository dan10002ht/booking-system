import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import userController from './controllers/user.controller.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'proto', 'user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  GetUser: userController.getUser,
});

const PORT = process.env.GRPC_PORT || '9090';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log(`gRPC server running at 0.0.0.0:${PORT}`);
});