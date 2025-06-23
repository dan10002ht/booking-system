# 🔄 Microservices Development Workflow

## 🎯 Development Strategies

### **Strategy 1: Single Service Development (Recommended for Active Coding)**

**Best for:** Working on one specific service with hot reload

```bash
# Start only the service you're working on
cd gateway
yarn dev:local

# Or manually:
yarn infra:start  # Start infrastructure only
yarn dev          # Start gateway with nodemon
```

**Ưu điểm:**

- ✅ **Fastest development cycle** - chỉ restart service bạn đang làm
- ✅ **Low resource usage** - chỉ chạy 1 service
- ✅ **Easy debugging** - logs rõ ràng
- ✅ **Hot reload** - như single app development

**Nhược điểm:**

- ❌ Cần mock/stub các services khác
- ❌ Không test được integration thực tế

### **Strategy 2: Multi-Service Development**

**Best for:** Testing integration between services

```bash
# Start all services with hot reload
./scripts/dev-all.sh

# Or manually start each service:
cd gateway && yarn dev &
cd auth-service && yarn dev &
cd user-profile && yarn dev &
# ... other services
```

**Ưu điểm:**

- ✅ **Full integration testing**
- ✅ **Real service communication**
- ✅ **End-to-end testing**

**Nhược điểm:**

- ❌ **High resource usage** - nhiều services cùng lúc
- ❌ **Complex setup** - khó manage
- ❌ **Slow startup** - phải start tất cả services

### **Strategy 3: Hybrid Development**

**Best for:** Most practical approach

```bash
# Start infrastructure + 2-3 services you're working on
yarn infra:start
cd gateway && yarn dev &
cd auth-service && yarn dev &
cd user-profile && yarn dev &
```

## 🛠️ Development Tools

### **Hot Reload Setup**

Mỗi service đều có `nodemon` configuration:

```json
// package.json
{
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

```javascript
// nodemon.json (nếu cần custom)
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["node_modules", "logs"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

### **Environment Management**

**Local Development (.env):**

```bash
# Gateway .env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
GRPC_AUTH_SERVICE_URL=localhost:50051
```

**Docker Development:**

```yaml
# docker-compose.dev.yml
gateway:
  environment:
    - NODE_ENV=development
    - REDIS_URL=redis://redis:6379
    - GRPC_AUTH_SERVICE_URL=auth-service:50051
```

## 📊 Development Scenarios

### **Scenario 1: Working on Gateway Only**

```bash
# Quick start
cd gateway
yarn dev:local

# Gateway sẽ auto-restart khi save changes
# Các services khác có thể mock hoặc chạy riêng
```

### **Scenario 2: Working on Auth + Gateway**

```bash
# Start infrastructure
yarn infra:start

# Start both services
cd gateway && yarn dev &
cd auth-service && yarn dev &

# Test integration
curl http://localhost:3000/api/auth/login
```

### **Scenario 3: Full System Testing**

```bash
# Start all services
./scripts/dev-all.sh

# Test complete flow
# 1. Register user
# 2. Login
# 3. Create booking
# 4. Process payment
```

## 🔧 Development Tips

### **Hot Reload Best Practices**

1. **Use nodemon for all services**

   ```bash
   yarn dev  # Auto-restart on file changes
   ```

2. **Configure nodemon properly**

   ```json
   {
     "watch": ["src"],
     "ext": "js,json,yaml",
     "ignore": ["node_modules", "logs", "*.test.js"]
   }
   ```

3. **Use environment-specific configs**

   ```bash
   # .env.development
   LOG_LEVEL=debug
   NODE_ENV=development

   # .env.production
   LOG_LEVEL=info
   NODE_ENV=production
   ```

### **Service Communication**

1. **gRPC for inter-service calls**

   ```javascript
   // Gateway calls Auth Service
   const result = await grpcClients.authService.login(req.body);
   ```

2. **Mock services for development**

   ```javascript
   // Mock auth service for testing
   const mockAuthService = {
     login: async (data) => ({ token: "mock-token" }),
   };
   ```

3. **Health checks**
   ```bash
   # Check service health
   curl http://localhost:3000/health
   ```

### **Debugging Strategies**

1. **Service-specific logs**

   ```bash
   # View gateway logs
   tail -f gateway/logs/app.log

   # View all service logs
   docker-compose logs -f
   ```

2. **Distributed tracing**

   ```javascript
   // Add correlation ID
   req.correlationId = uuid();
   logger.info("Request started", { correlationId: req.correlationId });
   ```

3. **Breakpoint debugging**

   ```bash
   # Start with debugger
   node --inspect src/index.js

   # Or with nodemon
   nodemon --inspect src/index.js
   ```

## 🚀 Performance Optimization

### **Development Performance**

1. **Start only needed services**

   ```bash
   # Only start services you're working on
   yarn infra:start
   yarn dev  # Only gateway
   ```

2. **Use caching**

   ```javascript
   // Cache frequently accessed data
   const cache = new Map();
   ```

3. **Optimize nodemon**
   ```json
   {
     "watch": ["src"],
     "ignore": ["node_modules", "logs", "*.test.js", "coverage"]
   }
   ```

### **Resource Management**

1. **Monitor resource usage**

   ```bash
   # Check memory usage
   htop

   # Check Docker resources
   docker stats
   ```

2. **Clean up regularly**

   ```bash
   # Stop unused services
   yarn infra:stop

   # Clean Docker
   docker system prune
   ```

## 🔄 Workflow Examples

### **Daily Development Workflow**

```bash
# 1. Start infrastructure
yarn infra:start

# 2. Start service you're working on
cd gateway
yarn dev

# 3. Make changes and see hot reload
# 4. Test with other services if needed
# 5. Stop when done
Ctrl+C
yarn infra:stop
```

### **Integration Testing Workflow**

```bash
# 1. Start all services
./scripts/dev-all.sh

# 2. Run integration tests
yarn run test:integration

# 3. Test manual flows
# 4. Stop all services
Ctrl+C
```

### **Debugging Workflow**

```bash
# 1. Start with debug logging
LOG_LEVEL=debug yarn dev

# 2. Add breakpoints in IDE
# 3. Use distributed tracing
# 4. Check logs and metrics
```

## 🎯 Recommendations

### **For Individual Developers**

- Use **Strategy 1** (Single Service) for most development
- Use **Strategy 2** (Multi-Service) only for integration testing
- Mock external services when possible

### **For Teams**

- Use **Strategy 3** (Hybrid) for team development
- Coordinate which services each developer works on
- Use shared development environment

### **For CI/CD**

- Use Docker for consistent testing
- Run integration tests in separate environment
- Use staging environment for pre-production testing
