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
  'grpc.initial_reconnect_backoff_ms': 1000,
  'grpc.max_reconnect_backoff_ms': 30000,
  'grpc.use_local_subchannel_pool': 1,
  'grpc.max_concurrent_streams': 100,
  'grpc.initial_window_size': 65536,
  'grpc.max_send_initial_metadata': 100,
  'grpc.max_receive_initial_metadata': 100,
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
  } else if (fs.existsSync(localSharedProtoPath)) {
    protoPath = localSharedProtoPath;
  } else {
    protoPath = localProtoPath;
  }

  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition);
};

const createClient = (serviceUrl, serviceName, packageName) => {
  try {
    console.log(`🔧 Creating gRPC client for ${serviceName} at ${serviceUrl}`);

    const proto = loadProto(`${serviceName}.proto`);

    const serviceClassName = `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service`;

    if (!proto[packageName]) {
      throw new Error(`Package '${packageName}' not found in proto`);
    }

    if (!proto[packageName][serviceClassName]) {
      throw new Error(`Service '${serviceClassName}' not found in package '${packageName}'`);
    }

    console.log(`✅ Proto loaded successfully for ${serviceName}`);

    const client = new proto[packageName][serviceClassName](
      serviceUrl,
      grpc.credentials.createInsecure(),
      clientOptions
    );

    console.log(`✅ gRPC client created for ${serviceName}`);

    // Increase deadline timeout to 60 seconds to match circuit breaker
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 60); // 60 seconds timeout

    const wrappedClient = {};
    // Lấy đủ method từ cả instance và prototype
    const instanceMethods = Object.keys(client);
    const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(
      (m) => typeof client[m] === 'function' && m !== 'constructor'
    );
    const allMethods = Array.from(new Set([...instanceMethods, ...protoMethods]));

    allMethods.forEach((method) => {
      if (typeof client[method] === 'function') {
        // Create circuit breaker for each method
        const breaker = circuitBreakerService.createGrpcBreaker(
          serviceName,
          method,
          async (request) => {
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                return await new Promise((resolve, reject) => {
                  const metadata = new grpc.Metadata();
                  metadata.add('correlation-id', request.correlationId || 'unknown');

                  client[method](request, metadata, { deadline }, (error, response) => {
                    if (error) {
                      logger.error(
                        `gRPC call failed: ${serviceName}.${method} (attempt ${attempt})`,
                        {
                          error: error.message,
                          code: error.code,
                          details: error.details,
                          correlationId: request.correlationId,
                          attempt,
                        }
                      );
                      reject(error);
                    } else {
                      resolve(response);
                    }
                  });
                });
              } catch (error) {
                // Don't retry on certain errors
                if (
                  error.code === grpc.status.INVALID_ARGUMENT ||
                  error.code === grpc.status.PERMISSION_DENIED ||
                  error.code === grpc.status.UNAUTHENTICATED
                ) {
                  throw error;
                }

                // If this is the last attempt, throw the error
                if (attempt === maxRetries) {
                  throw error;
                }

                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                logger.warn(
                  `Retrying gRPC call: ${serviceName}.${method} (attempt ${attempt + 1}/${maxRetries})`,
                  {
                    service: serviceName,
                    method,
                    attempt,
                    delay,
                    error: error.message,
                  }
                );

                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          },
          {
            timeout: 65000, // Slightly higher than gRPC deadline to avoid conflicts
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
      `Successfully created gRPC client for ${serviceName} with ${Object.keys(wrappedClient).length} methods`
    );

    return wrappedClient;
  } catch (error) {
    logger.error(`Failed to create gRPC client for ${serviceName}`, {
      error: error.message,
      serviceUrl,
      stack: error.stack,
    });

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
