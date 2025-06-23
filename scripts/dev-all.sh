#!/bin/bash

# Development script for all microservices with hot reload
# This script starts all services in development mode with hot reload

echo "🚀 Starting All Microservices Development Environment"

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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
cd deploy
docker-compose -f docker-compose.dev.yml up -d redis postgres kafka zookeeper prometheus grafana elasticsearch kibana

# Wait for services to be ready
echo "⏳ Waiting for infrastructure services to be ready..."
sleep 10

# Go back to root directory
cd ..

echo "🎯 Starting all microservices in development mode..."
echo ""
echo "📊 Available services:"
echo "   - Gateway: http://localhost:3000"
echo "   - Auth Service: http://localhost:50051 (gRPC)"
echo "   - User Profile: http://localhost:50052 (gRPC)"
echo "   - Event Management: http://localhost:50053 (gRPC)"
echo "   - Booking Service: http://localhost:50054 (gRPC)"
echo "   - Booking Worker: http://localhost:50055 (gRPC)"
echo "   - Payment Service: http://localhost:50056 (gRPC)"
echo "   - Ticket Service: http://localhost:50057 (gRPC)"
echo "   - Notification Service: http://localhost:50058 (gRPC)"
echo "   - Analytics Service: http://localhost:50059 (gRPC)"
echo "   - Pricing Service: http://localhost:50060 (gRPC)"
echo "   - Support Service: http://localhost:50061 (gRPC)"
echo "   - Invoice Service: http://localhost:50062 (gRPC)"
echo ""
echo "🔧 Development tools:"
echo "   - Grafana: http://localhost:3001 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Kibana: http://localhost:5601"
echo ""
echo "💡 Tips:"
echo "   - Each service will auto-restart when you save changes"
echo "   - Use Ctrl+C to stop all services"
echo "   - Check individual service logs for debugging"
echo ""

# Function to start a service in development mode
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "🚀 Starting $service_name..."
    cd "$service_path"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $service_name..."
        yarn install
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env for $service_name..."
        cat > .env << EOF
# Server Configuration
PORT=$port
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=dev_jwt_secret
JWT_REFRESH_SECRET=dev_refresh_secret

# Database Configuration
DATABASE_URL=postgresql://booking_user:booking_pass@localhost:5432/booking_system

# gRPC Service Configuration
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

# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
EOF
    fi
    
    # Start service with nodemon
    yarn dev &
    
    cd ..
    echo "✅ $service_name started on port $port"
}

# Start all services in parallel
echo "🔄 Starting all services..."

# Start Gateway
start_service "Gateway" "gateway" "3000"

# Start other services (you can add more as needed)
# start_service "Auth Service" "auth-service" "50051"
# start_service "User Profile" "user-profile" "50052"
# start_service "Event Management" "event-management" "50053"
# start_service "Booking Service" "booking-service" "50054"
# start_service "Payment Service" "payment-service" "50056"
# start_service "Ticket Service" "ticket-service" "50057"
# start_service "Notification Service" "notification-service" "50058"
# start_service "Analytics Service" "analytics-service" "50059"
# start_service "Pricing Service" "pricing-service" "50060"
# start_service "Support Service" "support-service" "50061"
# start_service "Invoice Service" "invoice-service" "50062"

echo ""
echo "🎉 All services started! Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait 