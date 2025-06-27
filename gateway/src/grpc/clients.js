import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import circuitBreakerService from '../services/circuitBreakerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientOptions = {
  'grpc.keepalive_time_ms': config.grpc.authService.keepaliveTimeMs,
  'grpc.keepalive_timeout_ms': config.grpc.authService.keepaliveTimeoutMs,
  'grpc.keepalive_permit_without_calls': true,
  'grpc.http2.max_pings_without_data': 0,
  'grpc.http2.min_time_between_pings_ms': 10000,
  'grpc.http2.min_ping_interval_without_data_ms': 300000,
  'grpc.max_receive_message_length': config.grpc.authService.maxReceiveMessageLength,
  'grpc.max_send_message_length': config.grpc.authService.maxSendMessageLength,
};

const loadProto = (protoFile) => {
  const dockerSharedProtoPath = path.join('/shared-lib', 'protos', protoFile);
  const localSharedProtoPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'shared-lib',
    'protos',
    protoFile
  );
  const localProtoPath = path.join(__dirname, '..', 'protos', protoFile);

  let protoPath;
  if (fs.existsSync(dockerSharedProtoPath)) {
    protoPath = dockerSharedProtoPath;
    logger.info(`Using docker shared proto: ${protoPath}`);
  } else if (fs.existsSync(localSharedProtoPath)) {
    protoPath = localSharedProtoPath;
    logger.info(`Using local shared proto: ${protoPath}`);
  } else {
    protoPath = localProtoPath;
    logger.info(`Using local proto: ${protoPath}`);
  }

  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition);
};

const createClient = (serviceUrl, serviceName, packageName) => {
  try {
    const proto = loadProto(`${serviceName}.proto`);

    // Debug: Log the proto structure
    logger.info(`Proto structure for ${serviceName}:`, {
      packageName,
      availablePackages: Object.keys(proto),
      availableServices: proto[packageName] ? Object.keys(proto[packageName]) : 'No package found',
    });

    const serviceClassName = `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service`;
    logger.info(`Looking for service class: ${serviceClassName}`);

    if (!proto[packageName]) {
      throw new Error(`Package '${packageName}' not found in proto`);
    }

    if (!proto[packageName][serviceClassName]) {
      throw new Error(`Service '${serviceClassName}' not found in package '${packageName}'`);
    }

    const client = new proto[packageName][serviceClassName](
      serviceUrl,
      grpc.credentials.createInsecure(),
      clientOptions
    );

    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 30); // 30 seconds timeout

    const wrappedClient = {};
    Object.keys(client).forEach((method) => {
      if (typeof client[method] === 'function') {
        // Create circuit breaker for each method
        const breaker = circuitBreakerService.createGrpcBreaker(
          serviceName,
          method,
          (request) => {
            return new Promise((resolve, reject) => {
              const metadata = new grpc.Metadata();
              metadata.add('correlation-id', request.correlationId || 'unknown');

              client[method](request, metadata, { deadline }, (error, response) => {
                if (error) {
                  logger.error(`gRPC call failed: ${serviceName}.${method}`, {
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    correlationId: request.correlationId,
                  });
                  reject(error);
                } else {
                  resolve(response);
                }
              });
            });
          },
          {
            timeout: config.circuitBreaker.timeout || 30000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
          }
        );

        wrappedClient[method] = (request) => {
          return breaker.fire(request);
        };
      }
    });

    logger.info(
      `Successfully created gRPC client for ${serviceName} with methods:`,
      Object.keys(wrappedClient)
    );
    return wrappedClient;
  } catch (error) {
    logger.error(`Failed to create gRPC client for ${serviceName}`, {
      error: error.message,
      serviceUrl,
      stack: error.stack,
    });
    console.log('skipped service', serviceName);

    // Return a mock client with error methods instead of undefined
    return {
      registerWithEmail: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      registerWithOAuth: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      login: () => Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      refreshToken: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      logout: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      validateToken: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
      health: () =>
        Promise.reject(new Error(`gRPC client for ${serviceName} failed to initialize`)),
    };
  }
};

const grpcClients = {
  authService: createClient(config.grpc.authService.url, 'auth', 'auth'),
  userService: createClient(config.grpc.userService.url, 'user', 'user'),
  eventService: createClient(config.grpc.eventService.url, 'event', 'event'),
  bookingService: createClient(config.grpc.bookingService.url, 'booking', 'booking'),
  paymentService: createClient(config.grpc.paymentService.url, 'payment', 'payment'),
  ticketService: createClient(config.grpc.ticketService.url, 'ticket', 'ticket'),
};

const healthCheck = async () => {
  const healthStatus = {};

  for (const [serviceName, client] of Object.entries(grpcClients)) {
    try {
      if (client.health) {
        await client.health({});
        healthStatus[serviceName] = 'healthy';
        continue;
      }
      healthStatus[serviceName] = 'unknown';
    } catch (error) {
      healthStatus[serviceName] = 'unhealthy';
      logger.error(`Health check failed for ${serviceName}`, {
        error: error.message,
        code: error.code,
      });
    }
  }

  return healthStatus;
};

const shutdown = () => {
  logger.info('Shutting down gRPC clients...');
  Object.values(grpcClients).forEach((client) => {
    if (client.close) {
      client.close();
    }
  });
};

export { grpcClients, healthCheck, shutdown };
export default grpcClients;
