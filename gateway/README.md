# Gateway Service (Node.js)

**Language:** Node.js

**Why Node.js?**

- Fast I/O, event-driven, ideal for API Gateway
- Easy to integrate with real-time and frontend
- Middleware ecosystem is rich and flexible

# 🚪 API Gateway Service

## Overview

The API Gateway is the entry point for all client requests to the booking system. It handles authentication, rate limiting, load balancing, and request routing to appropriate microservices using gRPC for high-performance inter-service communication.

## 🎯 Responsibilities

- **Request Routing**: Route requests to appropriate microservices via gRPC
- **Authentication**: Verify JWT tokens and handle authentication
- **Rate Limiting**: Prevent abuse with distributed rate limiting
- **Load Balancing**: Distribute load across service instances
- **Request/Response Transformation**: Convert REST to gRPC and vice versa
- **CORS Handling**: Manage cross-origin requests
- **Health Checks**: Monitor downstream service health
- **Circuit Breaker**: Prevent cascade failures
- **gRPC Client Management**: Manage gRPC connections and load balancing

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Cache**: Redis (for rate limiting and session storage)
- **Authentication**: JWT verification
- **gRPC**: @grpc/grpc-js for inter-service communication
- **Protocol Buffers**: Efficient binary serialization
- **Load Balancer**: Client-side gRPC load balancing
- **Monitoring**: Prometheus metrics

### Key Components

```
Gateway Service
├── Authentication Middleware
├── Rate Limiting Middleware
├── Request Router
├── gRPC Client Manager
├── Load Balancer
├── Circuit Breaker
├── Response Transformer
└── Health Checker
```

## 🔄 Request Flow

```
Client Request (REST)
    ↓
Rate Limiting Check
    ↓
Authentication (if required)
    ↓
Route to Service
    ↓
Transform to gRPC Request
    ↓
gRPC Load Balancer Selection
    ↓
Circuit Breaker Check
    ↓
Forward to Microservice (gRPC)
    ↓
Transform gRPC Response to REST
    ↓
Return to Client
```

## 📡 API Endpoints

### Public Endpoints (REST)

```
GET    /health                    # Health check
GET    /api/v1/events            # List events (cached)
GET    /api/v1/events/:id        # Get event details (cached)
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/refresh      # Refresh token
```

### Protected Endpoints (REST)

```
GET    /api/v1/user/profile      # Get user profile
PUT    /api/v1/user/profile      # Update user profile
GET    /api/v1/bookings          # Get user bookings
POST   /api/v1/bookings          # Create booking
GET    /api/v1/bookings/:id      # Get booking details
POST   /api/v1/payments          # Process payment
GET    /api/v1/tickets           # Get user tickets
```

### gRPC Services (Internal)

```
auth.AuthService
├── Register
├── Login
├── RefreshToken
├── ValidateToken
└── GetUserProfile

ticket.TicketService
├── GetEvents
├── GetEventById
├── GetAvailableTickets
└── ReserveTickets

booking.BookingService
├── CreateBooking
├── GetBooking
├── CancelBooking
└── UpdateBooking

payment.PaymentService
├── ProcessPayment
├── GetPaymentStatus
└── RefundPayment
```

## 🔐 Security Features

### Rate Limiting

- **Per IP**: 100 requests/minute for public endpoints
- **Per User**: 1000 requests/minute for authenticated users
- **Per Endpoint**: Custom limits for sensitive operations
- **Burst Protection**: Allow short bursts with exponential backoff

### Authentication

- **JWT Verification**: Validate tokens on each request
- **Token Refresh**: Automatic token refresh handling
- **Session Management**: Redis-based session storage
- **CORS**: Configured for web and mobile clients

### gRPC Security

- **TLS Encryption**: Secure inter-service communication
- **mTLS**: Mutual TLS for service-to-service authentication
- **Token Propagation**: Pass JWT tokens in gRPC metadata
- **Service Authentication**: Verify service identity

### Input Validation

- **Request Sanitization**: Remove malicious content
- **Schema Validation**: Validate request bodies
- **Size Limits**: Prevent large payload attacks

## 🚀 Performance Optimizations

### gRPC Benefits

- **Protocol Buffers**: 3-10x smaller payload size
- **HTTP/2**: Multiplexing and compression
- **Connection Reuse**: Persistent connections
- **Bidirectional Streaming**: Real-time communication
- **Code Generation**: Type-safe client/server code

### Caching Strategy

- **Response Caching**: Cache static responses (events, categories)
- **Session Caching**: Redis-based session storage
- **Health Check Caching**: Cache service health status
- **gRPC Connection Pooling**: Reuse gRPC connections

### Load Balancing

- **Client-side Load Balancing**: Round-robin with health checks
- **gRPC Load Balancing**: Distribute requests across service instances
- **Health Checks**: Remove unhealthy instances
- **Weighted Routing**: Route based on service capacity
- **Sticky Sessions**: Maintain session affinity when needed

### Connection Management

- **gRPC Connection Pool**: Reuse connections to services
- **Connection Limits**: Prevent connection exhaustion
- **Timeout Management**: Handle slow services gracefully
- **Keep-Alive**: Maintain persistent connections

## 📊 Monitoring & Observability

### Metrics

- **Request Rate**: Requests per second
- **Response Time**: Average and percentile response times
- **Error Rate**: 4xx and 5xx error rates
- **gRPC Metrics**: Request/response counts, latency
- **Circuit Breaker Status**: Open/closed state
- **Rate Limiting**: Blocked requests count

### Logging

- **Access Logs**: All incoming requests
- **Error Logs**: Failed requests and errors
- **gRPC Logs**: Inter-service communication logs
- **Performance Logs**: Slow requests and bottlenecks
- **Security Logs**: Authentication failures and attacks

### Health Checks

- **Self Health**: Gateway service health
- **Service Health**: Downstream service health via gRPC
- **Dependency Health**: Redis, database connectivity
- **gRPC Health**: gRPC health check protocol

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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# gRPC Service Configuration
GRPC_AUTH_SERVICE_URL=auth-service:50051
GRPC_TICKET_SERVICE_URL=ticket-service:50052
GRPC_BOOKING_SERVICE_URL=booking-service:50053
GRPC_PAYMENT_SERVICE_URL=payment-service:50054

# gRPC Configuration
GRPC_MAX_RECEIVE_MESSAGE_LENGTH=4194304
GRPC_MAX_SEND_MESSAGE_LENGTH=4194304
GRPC_KEEPALIVE_TIME_MS=30000
GRPC_KEEPALIVE_TIMEOUT_MS=5000

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30000
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
  ticket: {
    instances: ["ticket-service-1:50052", "ticket-service-2:50052"],
    healthCheck: "/grpc.health.v1.Health/Check",
    timeout: 5000,
    retries: 3,
  },
  // ... other services
};
```

### Protocol Buffer Definitions

```protobuf
// shared-lib/protos/auth.proto
syntax = "proto3";

package auth;

service AuthService {
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc GetUserProfile(GetUserProfileRequest) returns (GetUserProfileResponse);
}

message RegisterRequest {
  string email = 1;
  string password = 2;
  string first_name = 3;
  string last_name = 4;
}

message RegisterResponse {
  string user_id = 1;
  string message = 2;
}
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
            - name: GRPC_TICKET_SERVICE_URL
              value: "ticket-service:50052"
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
    "ticket-service": "healthy",
    "booking-service": "healthy"
  },
  "grpc_connections": {
    "auth-service": "connected",
    "ticket-service": "connected"
  },
  "dependencies": {
    "redis": "connected",
    "database": "connected"
  }
}
```

## 🔄 Circuit Breaker Configuration

### Failure Threshold

- **Threshold**: 5 consecutive failures
- **Timeout**: 30 seconds before retry
- **Half-Open**: Allow 1 request to test recovery

### Implementation

```javascript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 30000,
  fallback: (err) => ({ error: "Service temporarily unavailable" }),
});

// gRPC circuit breaker
const grpcCircuitBreaker = new GrpcCircuitBreaker({
  failureThreshold: 5,
  timeout: 30000,
  healthCheck: "/grpc.health.v1.Health/Check",
});
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
```

## 🔗 Dependencies

### External Services (gRPC)

- **Auth Service**: Authentication and authorization
- **Ticket Service**: Event and ticket information
- **Booking Service**: Booking operations
- **Payment Service**: Payment processing
- **User Profile Service**: User information

### Infrastructure

- **Redis**: Rate limiting and session storage
- **Load Balancer**: Request distribution
- **Monitoring**: Prometheus and Grafana
- **Protocol Buffers**: Message serialization

## 🆕 Integration with Booking Worker Service (Go)

The API Gateway now supports queue-based booking via the **Booking Worker Service** (written in Go):

- **Go Performance**: Booking Worker (Go) provides high-throughput queue management.
- **gRPC Communication**: Gateway communicates with Booking Worker (Go) for queue and booking status.

### Booking Request Flow

1. **Client sends booking request to Gateway** → 2. **Gateway forwards to Booking Worker** → 3. **Client receives queue position/status** → 4. **On turn, client proceeds to payment**
