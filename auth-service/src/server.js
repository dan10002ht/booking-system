import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { closeDatabaseConnections } from './config/databaseConfig.js';

// Import functional controllers
import * as authController from './controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load protobuf definition
const PROTO_PATH = path.join(__dirname, 'proto', 'auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Create gRPC server
const server = new grpc.Server();

// Add services to server
server.addService(authProto.AuthService.service, {
  // Registration & Login
  register: authController.register,
  login: authController.login,
  logout: authController.logout,

  // Token Management
  refreshToken: authController.refreshToken,
  validateToken: authController.validateToken,

  // Password Management
  changePassword: authController.changePassword,
  resetPassword: authController.resetPassword,

  // User Management
  getUserProfile: authController.getUserProfile,
  updateUserProfile: authController.updateUserProfile,
  getUserSessions: authController.getUserSessions,

  // Admin Operations
  getUsers: authController.getUsers,
  searchUsers: authController.searchUsers,
  updateUserStatus: authController.updateUserStatus,

  // Health Check
  health: authController.health
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new requests
    server.tryShutdown(() => {
      logger.info('✅ gRPC server stopped');
    });

    // Close database connections
    await closeDatabaseConnections();
    logger.info('✅ Database connections closed');

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { server, gracefulShutdown }; 