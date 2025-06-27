220#!/bin/bash

# Local Development Script for Gateway Service
# This script starts only infrastructure services and runs gateway locally with hot reload

echo "🚀 Starting Gateway Local Development Environment"

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

# Check if Docker Compose v2 is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose v2 is not installed. Hãy cài Docker Desktop mới hoặc docker compose plugin."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start only infrastructure services (no other microservices)
echo "🐳 Starting infrastructure services only..."
cd ../deploy
docker compose -f docker-compose.dev.yml up -d redis postgres kafka zookeeper prometheus grafana elasticsearch kibana

# Wait for services to be ready
echo "⏳ Waiting for infrastructure services to be ready..."
sleep 10

# Go back to gateway directory
cd ../gateway

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Generate gRPC code if proto files exist
if [ -d "protos" ]; then
    echo "🔧 Generating gRPC code..."
    yarn grpc:generate
fi

# Create .env file for local development
echo "📝 Creating .env file for local development..."
cat > .env << EOF
# Server Configuration
PORT=53000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:56379

# JWT Configuration
JWT_SECRET=dev_jwt_secret
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_REQUESTS_AUTH=1000

# gRPC Service Configuration (point to localhost for other services)
# Note: These services need to be running separately for full functionality
GRPC_AUTH_SERVICE_URL=localhost:50051
GRPC_USER_SERVICE_URL=localhost:50052
GRPC_EVENT_SERVICE_URL=localhost:50053
GRPC_BOOKING_SERVICE_URL=localhost:50054
GRPC_BOOKING_WORKER_URL=localhost:50055
GRPC_PAYMENT_SERVICE_URL=localhost:50056
GRPC_TICKET_SERVICE_URL=localhost:50057
GRPC_NOTIFICATION_SERVICE_URL=localhost:50058
GRPC_ANALYTICS_SERVICE_URL=localhost:50059
GRPC_PRICING_SERVICE_URL=localhost:50060
GRPC_SUPPORT_SERVICE_URL=localhost:50061
GRPC_INVOICE_SERVICE_URL=localhost:50062

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
LOG_LEVEL=debug
LOG_FORMAT=json
EOF

echo "✅ .env file created"

echo "🎯 Starting Gateway with hot reload (nodemon)..."
echo ""
echo "📊 Available endpoints:"
echo "   - Gateway API: http://localhost:53000"
echo "   - Swagger Docs: http://localhost:53000/api-docs"
echo "   - Health Check: http://localhost:53000/health"
echo "   - Metrics: http://localhost:53000/metrics"
echo ""
echo "🔧 Development tools:"
echo "   - Grafana: http://localhost:53001 (admin/admin)"
echo "   - Prometheus: http://localhost:59090"
echo "   - Kibana: http://localhost:55601"
echo ""
echo "💡 Tips:"
echo "   - Gateway will auto-restart when you save changes"
echo "   - Other services need to be running separately for full functionality"
echo "   - Use Ctrl+C to stop the development server"
echo ""

# Start the application with nodemon for hot reload
yarn dev 