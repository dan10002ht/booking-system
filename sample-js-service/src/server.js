const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const userController = require("./controllers/user.controller");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "proto", "user.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  GetUser: userController.getUser,
});

const PORT = process.env.GRPC_PORT || "50051";
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`gRPC server running at 0.0.0.0:${PORT}`);
  }
);
