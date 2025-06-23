import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import logger from './utils/logger.js';
import authController from './controllers/authController.js';
import db from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'proto', 'auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

// Add AuthService to the server
server.addService(authProto.AuthService.service, {
  // User authentication
  Register: authController.register,
  Login: authController.login,
  OAuthLogin: authController.oauthLogin,
  RefreshToken: authController.refreshToken,
  Logout: authController.logout,
  
  // Token verification
  VerifyToken: authController.verifyToken,
  GetUserPermissions: authController.getUserPermissions,
  
  // User management
  GetUser: authController.getUser,
  UpdateUser: authController.updateUser,
  DeleteUser: authController.deleteUser,
  
  // Password management
  ForgotPassword: authController.forgotPassword,
  ResetPassword: authController.resetPassword,
  
  // Email verification
  SendVerificationEmail: authController.sendVerificationEmail,
  VerifyEmail: authController.verifyEmail,
  
  // Health check
  HealthCheck: authController.healthCheck,
});

async function startServer() {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connected successfully');

    // Start gRPC server
    const GRPC_PORT = config.grpc.port;
    server.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          logger.error('Failed to start gRPC server:', error);
          process.exit(1);
        }
        
        logger.info(`Auth Service gRPC server running on port ${port}`);
        logger.info(`Service address: 0.0.0.0:${GRPC_PORT}`);
        logger.info('Available gRPC methods: Register, Login, OAuthLogin, RefreshToken, Logout, VerifyToken, GetUserPermissions, GetUser, UpdateUser, DeleteUser, ForgotPassword, ResetPassword, SendVerificationEmail, VerifyEmail, HealthCheck');
      }
    );
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.tryShutdown(() => {
    logger.info('gRPC server shutdown complete');
    db.destroy().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.tryShutdown(() => {
    logger.info('gRPC server shutdown complete');
    db.destroy().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});

export default server;