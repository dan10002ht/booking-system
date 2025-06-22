# API Gateway Service

API Gateway cho hệ thống Booking với rate limiting, load balancing, và gRPC client để giao tiếp với các microservices.

## Tính năng

- **API Gateway**: Route requests đến các microservices
- **Authentication & Authorization**: JWT token validation
- **Rate Limiting**: Bảo vệ API khỏi abuse
- **Load Balancing**: Phân tải requests
- **gRPC Communication**: Giao tiếp hiệu quả với microservices
- **Request/Response Logging**: Log đầy đủ với correlation ID
- **Error Handling**: Xử lý lỗi tập trung
- **Health Checks**: Kiểm tra sức khỏe service
- **API Documentation**: Swagger/OpenAPI docs
- **Monitoring**: Prometheus metrics
- **Security**: Helmet, CORS, validation

## Cấu trúc Project

```
gateway/
├── src/
│   ├── config/
│   │   └── index.js          # Configuration
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── requestLogger.js  # Request logging
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── user.js           # User routes
│   │   ├── event.js          # Event routes
│   │   ├── booking.js        # Booking routes
│   │   ├── payment.js        # Payment routes
│   │   └── health.js         # Health check routes
│   ├── grpc/
│   │   └── clients.js        # gRPC clients
│   ├── proto/
│   │   ├── auth.proto        # Auth service proto
│   │   ├── user.proto        # User service proto
│   │   └── ...               # Other service protos
│   ├── utils/
│   │   └── logger.js         # Logging utility
│   └── index.js              # Main application
├── package.json
└── README.md
```

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chạy development
npm run dev

# Chạy production
npm start
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_DELAY_AFTER=50
RATE_LIMIT_DELAY_MS=500

# gRPC Services
GRPC_AUTH_SERVICE_URL=auth-service:50051
GRPC_USER_SERVICE_URL=user-profile-service:50052
GRPC_EVENT_SERVICE_URL=event-management-service:50053
GRPC_BOOKING_SERVICE_URL=booking-service:50054
GRPC_PAYMENT_SERVICE_URL=payment-service:50055
GRPC_TICKET_SERVICE_URL=ticket-service:50056

# gRPC Options
GRPC_MAX_RECEIVE_MESSAGE_LENGTH=4194304
GRPC_MAX_SEND_MESSAGE_LENGTH=4194304
GRPC_KEEPALIVE_TIME_MS=30000
GRPC_KEEPALIVE_TIMEOUT_MS=5000

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
PROMETHEUS_PORT=9090
```

## API Endpoints

### Health Checks
- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Authentication
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/addresses` - Lấy danh sách địa chỉ
- `POST /api/users/addresses` - Thêm địa chỉ mới

### Events
- `GET /api/events` - Lấy danh sách events
- `GET /api/events/:id` - Lấy chi tiết event

### Bookings
- `GET /api/bookings` - Lấy danh sách bookings
- `POST /api/bookings` - Tạo booking mới

### Payments
- `GET /api/payments` - Lấy danh sách payments
- `POST /api/payments/process` - Xử lý payment

## gRPC Communication

Gateway sử dụng gRPC để giao tiếp với các microservices:

- **Auth Service**: Authentication và authorization
- **User Service**: Quản lý user profile và addresses
- **Event Service**: Quản lý events
- **Booking Service**: Quản lý bookings
- **Payment Service**: Xử lý payments
- **Ticket Service**: Quản lý tickets

## Monitoring

### Prometheus Metrics
- HTTP request metrics
- gRPC call metrics
- Response time metrics
- Error rate metrics

### Health Checks
- Service health status
- gRPC client health
- Database connectivity
- External service dependencies

## Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Protection against abuse
- **JWT Validation**: Token-based authentication
- **Input Validation**: Request validation
- **Error Handling**: Secure error responses

## Development

```bash
# Linting
npm run lint

# Formatting
npm run format

# Testing
npm test

# Generate gRPC code
npm run grpc:generate
```

## Docker

```bash
# Build image
docker build -t gateway .

# Run container
docker run -p 3000:3000 gateway
```

## Deployment

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

### Docker Compose
```yaml
version: '3.8'
services:
  gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - auth-service
      - user-service
```

## Troubleshooting

### Common Issues

1. **gRPC Connection Failed**
   - Kiểm tra service URLs trong config
   - Đảm bảo services đang chạy
   - Kiểm tra network connectivity

2. **Rate Limiting Too Strict**
   - Điều chỉnh rate limit settings
   - Kiểm tra Redis connection

3. **JWT Validation Failed**
   - Kiểm tra JWT_SECRET
   - Đảm bảo token format đúng

4. **High Response Time**
   - Kiểm tra gRPC client timeouts
   - Monitor service dependencies
   - Kiểm tra circuit breaker settings

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
