# Gateway Service (Node.js)

**Language:** Node.js

**Why Node.js?**

- Fast I/O, event-driven, ideal for API Gateway
- Easy to integrate with real-time and frontend
- Middleware ecosystem is rich and flexible

# 🚪 API Gateway Service

## Overview

The API Gateway is the unified entry point for all client requests to the Event Ticket Booking System. It provides a RESTful API interface while internally communicating with microservices using high-performance gRPC. The gateway handles authentication, rate limiting, request routing, and response transformation.

## 🎯 Key Responsibilities

- **Request Routing**: Route REST requests to appropriate microservices via gRPC
- **Authentication & Authorization**: JWT token validation and user context injection
- **Rate Limiting**: Distributed rate limiting with Redis
- **Load Balancing**: Client-side gRPC load balancing across service instances
- **Request/Response Transformation**: Convert REST ↔ gRPC formats
- **Error Handling**: Centralized error mapping and consistent error responses
- **CORS Management**: Cross-origin request handling
- **Health Monitoring**: Service health checks and circuit breaker implementation
- **API Documentation**: Swagger/OpenAPI documentation
- **Request Logging**: Structured logging with correlation IDs

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js with middleware architecture
- **Inter-Service Communication**: gRPC with Protocol Buffers
- **Caching & Rate Limiting**: Redis
- **Authentication**: JWT with refresh token support
- **API Documentation**: Swagger UI with YAML definitions
- **Validation**: Express-validator with centralized validation middleware
- **Monitoring**: Prometheus metrics and Winston logging
- **Error Handling**: Centralized error mapping system

### Service Integration

The gateway integrates with the following microservices:

```
Gateway Service
├── Auth Service (gRPC) - Authentication & user management
├── User Profile Service (gRPC) - User profiles & addresses
├── Event Management Service (gRPC) - Event CRUD operations
├── Booking Service (gRPC) - Booking operations
├── Booking Worker Service (gRPC) - Queue-based booking (Go)
├── Payment Service (gRPC) - Payment processing
├── Ticket Service (gRPC) - Ticket inventory
├── Notification Service (gRPC) - Multi-channel notifications
├── Analytics Service (gRPC) - User behavior tracking
├── Pricing Service (gRPC) - Dynamic pricing
├── Support Service (gRPC) - Customer support
└── Invoice Service (gRPC) - Invoice generation
```

## 🔄 Request Flow

```
Client Request (REST)
    ↓
Rate Limiting Check (Redis)
    ↓
Authentication Middleware (JWT)
    ↓
Request Validation (Express-validator)
    ↓
Route to Service Handler
    ↓
Transform to gRPC Request
    ↓
gRPC Client Load Balancer
    ↓
Circuit Breaker Check
    ↓
Forward to Microservice (gRPC)
    ↓
Transform gRPC Response to REST
    ↓
Error Mapping (if applicable)
    ↓
Return Response to Client
```

## 📡 API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # User logout
```

### User Management Endpoints

```
GET    /api/users/profile          # Get user profile
PUT    /api/users/profile          # Update user profile
GET    /api/users/addresses        # Get user addresses
POST   /api/users/addresses        # Add new address
PUT    /api/users/addresses/:id    # Update address
DELETE /api/users/addresses/:id    # Delete address
```

### Event Management Endpoints

```
GET    /api/events                 # List events (with filters)
GET    /api/events/:id             # Get event details
POST   /api/events                 # Create event (admin)
PUT    /api/events/:id             # Update event (admin)
DELETE /api/events/:id             # Delete event (admin)
```

### Booking Endpoints

```
GET    /api/bookings               # Get user bookings
POST   /api/bookings               # Create booking
GET    /api/bookings/:id           # Get booking details
PUT    /api/bookings/:id           # Update booking
DELETE /api/bookings/:id           # Cancel booking
```

### Payment Endpoints

```
POST   /api/payments               # Process payment
GET    /api/payments/:id           # Get payment details
GET    /api/payments               # Get user payments
POST   /api/payments/:id/refund    # Refund payment
GET    /api/payments/methods       # Get payment methods
POST   /api/payments/methods       # Add payment method
```

### System Endpoints

```
GET    /health                     # Health check
GET    /api-docs                   # Swagger documentation
GET    /metrics                    # Prometheus metrics
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Token Validation**: Verify access tokens on protected routes
- **Refresh Token Support**: Automatic token refresh mechanism
- **User Context Injection**: Inject user information into requests
- **Role-Based Access Control**: Admin vs user permissions
- **Token Blacklisting**: Secure logout with token invalidation

### Rate Limiting

- **Per IP Limiting**: 100 requests/minute for public endpoints
- **Per User Limiting**: 1000 requests/minute for authenticated users
- **Endpoint-Specific Limits**: Custom limits for sensitive operations
- **Burst Protection**: Allow short bursts with exponential backoff
- **Redis-Based**: Distributed rate limiting across gateway instances

### Input Validation & Sanitization

- **Request Validation**: Comprehensive input validation using express-validator
- **Centralized Validation**: Reusable validation middleware
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Protection**: Content sanitization and security headers
- **Request Size Limits**: Prevent large payload attacks

### gRPC Security

- **TLS Encryption**: Secure inter-service communication
- **mTLS Support**: Mutual TLS for service authentication
- **Token Propagation**: Pass JWT tokens in gRPC metadata
- **Service Authentication**: Verify service identity certificates

## 🚀 Performance Optimizations

### gRPC Benefits

- **Protocol Buffers**: 3-10x smaller payload size compared to JSON
- **HTTP/2**: Multiplexing, compression, and connection reuse
- **Bidirectional Streaming**: Real-time communication capabilities
- **Code Generation**: Type-safe client/server code generation
- **Connection Pooling**: Reuse gRPC connections for better performance

### Caching Strategy

- **Response Caching**: Cache static responses (events, categories)
- **Session Caching**: Redis-based session storage
- **Health Check Caching**: Cache service health status
- **gRPC Connection Pooling**: Reuse gRPC connections

### Load Balancing

- **Client-side Load Balancing**: Round-robin with health checks
- **gRPC Load Balancing**: Distribute requests across service instances
- **Health Checks**: Remove unhealthy instances automatically
- **Weighted Routing**: Route based on service capacity
- **Sticky Sessions**: Maintain session affinity when needed

### Connection Management

- **gRPC Connection Pool**: Reuse connections to services
- **Connection Limits**: Prevent connection exhaustion
- **Timeout Management**: Handle slow services gracefully
- **Keep-Alive**: Maintain persistent connections

## 📊 Monitoring & Observability

### Metrics Collection

- **Request Metrics**: Request rate, response time, error rates
- **gRPC Metrics**: Request/response counts, latency, connection status
- **Business Metrics**: Authentication success rate, booking success rate
- **Infrastructure Metrics**: CPU, memory, Redis connections

### Structured Logging

- **Request Logging**: All incoming requests with correlation IDs
- **Error Logging**: Failed requests and error details
- **gRPC Logging**: Inter-service communication logs
- **Performance Logging**: Slow requests and bottlenecks
- **Security Logging**: Authentication failures and rate limit violations

### Health Monitoring

- **Self Health**: Gateway service health status
- **Service Health**: Downstream service health via gRPC
- **Dependency Health**: Redis connectivity and performance
- **gRPC Health**: gRPC health check protocol implementation

### Distributed Tracing

- **Correlation IDs**: Track requests across all services
- **Request Tracing**: Full request lifecycle tracking
- **gRPC Tracing**: Automatic tracing for gRPC calls
- **Performance Profiling**: Identify bottlenecks and slow operations

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_REQUESTS_AUTH=1000

# gRPC Service Configuration
GRPC_AUTH_SERVICE_URL=auth-service:50051
GRPC_USER_SERVICE_URL=user-profile:50052
GRPC_EVENT_SERVICE_URL=event-management:50053
GRPC_BOOKING_SERVICE_URL=booking-service:50054
GRPC_BOOKING_WORKER_URL=booking-worker:50055
GRPC_PAYMENT_SERVICE_URL=payment-service:50056
GRPC_TICKET_SERVICE_URL=ticket-service:50057
GRPC_NOTIFICATION_SERVICE_URL=notification-service:50058
GRPC_ANALYTICS_SERVICE_URL=analytics-service:50059
GRPC_PRICING_SERVICE_URL=pricing-service:50060
GRPC_SUPPORT_SERVICE_URL=support-service:50061
GRPC_INVOICE_SERVICE_URL=invoice-service:50062

# gRPC Configuration
GRPC_MAX_RECEIVE_MESSAGE_LENGTH=4194304
GRPC_MAX_SEND_MESSAGE_LENGTH=4194304
GRPC_KEEPALIVE_TIME_MS=30000
GRPC_KEEPALIVE_TIMEOUT_MS=5000
GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS=true

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30000
CIRCUIT_BREAKER_FALLBACK=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### gRPC Service Discovery

```javascript
// gRPC service registry configuration
const grpcServices = {
  auth: {
    instances: ["auth-service-1:50051", "auth-service-2:50051"],
    healthCheck: "/grpc.health.v1.Health/Check",
    timeout: 5000,
    retries: 3,
  },
  user: {
    instances: ["user-profile-1:50052", "user-profile-2:50052"],
    healthCheck: "/grpc.health.v1.Health/Check",
    timeout: 5000,
    retries: 3,
  },
  // ... other services
};
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### gRPC Tests

```bash
npm run test:grpc
```

### Load Tests

```bash
npm run test:load
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install protobuf compiler
RUN apk add --no-cache protobuf

COPY package*.json ./
RUN npm ci --only=production

# Copy protobuf definitions
COPY shared-lib/protos ./protos

# Generate gRPC code
RUN npm run grpc:generate

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
        - name: gateway
          image: booking-system/gateway:latest
          ports:
            - containerPort: 3000
          env:
            - name: REDIS_URL
              value: "redis://redis-service:6379"
            - name: GRPC_AUTH_SERVICE_URL
              value: "auth-service:50051"
            - name: GRPC_USER_SERVICE_URL
              value: "user-profile:50052"
          volumeMounts:
            - name: grpc-certs
              mountPath: /etc/grpc/certs
              readOnly: true
      volumes:
        - name: grpc-certs
          secret:
            secretName: grpc-tls-certs
```

### Health Check Endpoints

```
GET /health
Response: { "status": "healthy", "timestamp": "2024-01-01T00:00:00Z" }

GET /health/detailed
Response: {
  "status": "healthy",
  "services": {
    "auth-service": "healthy",
    "user-profile": "healthy",
    "booking-service": "healthy"
  },
  "grpc_connections": {
    "auth-service": "connected",
    "user-profile": "connected"
  },
  "dependencies": {
    "redis": "connected"
  }
}
```

## 🔄 Error Handling

### Centralized Error Mapping

The gateway implements a centralized error mapping system that converts gRPC error codes to appropriate HTTP status codes and user-friendly messages:

```javascript
// Error mapping for different services
const AUTH_ERROR_MAPPING = {
  3: { status: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
  6: { status: 409, message: 'User already exists', code: 'USER_EXISTS' },
  16: { status: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' }
};
```

### Error Response Format

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "correlationId": "req-12345",
  "details": {
    "field": "userId",
    "value": "invalid-id"
  }
}
```

## 📈 Scaling Considerations

### Horizontal Scaling

- **Stateless Design**: No local state, can scale horizontally
- **Load Balancer**: Use external load balancer (nginx, haproxy)
- **Session Storage**: Redis for shared session data
- **gRPC Load Balancing**: Client-side load balancing
- **Configuration**: Environment-based configuration

### Performance Tuning

- **gRPC Connection Pooling**: Optimize connection reuse
- **Caching**: Implement response caching
- **Compression**: Enable gzip compression
- **Keep-Alive**: Configure HTTP keep-alive
- **Protocol Buffers**: Optimize message serialization

## 🛡️ Security Best Practices

### Input Validation

- **Request Sanitization**: Remove malicious content
- **Size Limits**: Prevent large payload attacks
- **Content-Type Validation**: Ensure correct content types
- **Schema Validation**: Validate request bodies

### Authentication

- **JWT Verification**: Validate all tokens
- **Token Expiration**: Handle expired tokens gracefully
- **Refresh Token Rotation**: Implement token rotation
- **gRPC Token Propagation**: Pass tokens in metadata

### gRPC Security

- **TLS Encryption**: Secure all gRPC communications
- **mTLS**: Mutual TLS for service authentication
- **Token Validation**: Validate tokens in gRPC metadata
- **Service Identity**: Verify service certificates

### Rate Limiting

- **IP-based Limiting**: Prevent abuse from single IPs
- **User-based Limiting**: Limit authenticated users
- **Endpoint-specific Limits**: Different limits for different endpoints
- **Burst Protection**: Allow short bursts with backoff

## 📞 Troubleshooting

### Common Issues

1. **High Response Times**: Check downstream service health
2. **gRPC Connection Failures**: Verify service endpoints
3. **Rate Limiting**: Monitor rate limit configurations
4. **Circuit Breaker**: Check service availability
5. **Authentication Failures**: Verify JWT configuration

### Debug Commands

```bash
# Check service health
curl http://gateway:3000/health/detailed

# Test gRPC connectivity
grpcurl -plaintext auth-service:50051 list

# Check Redis connectivity
redis-cli ping

# Monitor gRPC metrics
curl http://gateway:3000/metrics

# View logs
docker logs gateway-service
```

## 🔗 Dependencies

### External Services (gRPC)

- **Auth Service**: Authentication and authorization
- **User Profile Service**: User information and addresses
- **Event Management Service**: Event CRUD operations
- **Booking Service**: Booking operations
- **Booking Worker Service**: Queue-based booking (Go)
- **Payment Service**: Payment processing
- **Ticket Service**: Ticket inventory management
- **Notification Service**: Multi-channel notifications
- **Analytics Service**: User behavior tracking
- **Pricing Service**: Dynamic pricing algorithms
- **Support Service**: Customer support system
- **Invoice Service**: Invoice generation

### Infrastructure

- **Redis**: Rate limiting, session storage, and caching
- **Load Balancer**: Request distribution
- **Monitoring**: Prometheus and Grafana
- **Protocol Buffers**: Message serialization

## 🆕 Recent Updates

### Error Mapping System

- **Centralized Error Handling**: All error mappings in `utils/errorMapping.js`
- **Service-Specific Mapping**: Custom error handling for each service
- **Consistent Error Format**: Standardized error response structure
- **Error Codes**: Meaningful error codes for client handling

### Validation Middleware

- **Centralized Validation**: All validation logic in `middlewares/validationMiddleware.js`
- **Reusable Components**: Validation middleware for different endpoints
- **Comprehensive Validation**: Email, password, UUID, and custom validation rules
- **Error Messages**: User-friendly validation error messages

### Swagger Documentation

- **YAML-Based Documentation**: Swagger docs separated from route definitions
- **Service-Specific Docs**: Separate YAML files for each service
- **Auto-Generation**: Automatic Swagger UI setup
- **API Testing**: Interactive API documentation

### Booking Worker Integration

The gateway now supports queue-based booking via the **Booking Worker Service** (written in Go):

- **High Concurrency**: Booking Worker (Go) provides high-throughput queue management
- **Queue Management**: Handles booking requests in a distributed queue
- **Real-time Updates**: Notifies clients about queue position and booking status
- **Timeout Handling**: Enforces booking timeouts and ticket release

### Booking Request Flow

1. **Client sends booking request to Gateway** → 2. **Gateway forwards to Booking Worker** → 3. **Client receives queue position/status** → 4. **On turn, client proceeds to payment**

This architecture ensures fair booking access and prevents system overload during high-demand events.
