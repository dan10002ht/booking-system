# 🛠️ Booking System Setup & Deployment Steps (2024)

This guide outlines the recommended steps to set up, configure, and deploy the current microservices-based booking system. It reflects the latest architecture, including booking-worker (Go), checkin-service, and all integrations.

---

## 1. Clone & Prepare the Repository

```bash
git clone <repo-url>
cd booking-system
```

## 2. Prerequisites

- Docker & Docker Compose (for local dev)
- Kubernetes (for production)
- Java 17+ (for most services)
- Go 1.21+ (for booking-worker)
- Node.js (if using any JS-based tools)
- Redis, Kafka, PostgreSQL, Prometheus, Grafana

## 3. Build Shared Libraries

- Compile protobuf definitions in `shared-lib/protos/` for all languages (Java, Go, etc.)
- Example (Go):
  ```bash
  cd shared-lib/protos
  protoc --go_out=. --go-grpc_out=. *.proto
  ```
- Example (Java):
  ```bash
  ./mvnw generate-sources
  ```

## 4. Service Setup Order (Recommended)

1. **auth-service**: User/staff authentication
2. **rate-limiter**: API protection
3. **gateway**: API entrypoint
4. **user-profile**: User data
5. **event-management**: Event/venue management
6. **ticket-service**: Ticket inventory
7. **booking-service**: Booking logic
8. **booking-worker** (Go): Queue-based booking handler
9. **payment-service**: Payment processing
10. **pricing-service**: Dynamic pricing
11. **realtime-service**: WebSocket updates
12. **notification-service**: Push/email/SMS notifications
13. **email-worker**: Asynchronous email
14. **invoice-service**: Invoice/PDF
15. **analytics-service**: Data analytics
16. **support-service**: Customer support
17. **checkin-service**: Ticket check-in at event

## 5. Environment Configuration

- Each service has its own `.env` or environment variables (see each README)
- Set up Redis, Kafka, PostgreSQL, and other infra as per service requirements

## 6. Local Development (Docker Compose)

```bash
docker-compose up --build
```

- All core services, infra, and monitoring will start
- Access API Gateway at `http://localhost:<gateway-port>`

## 7. Production Deployment (Kubernetes)

- Use manifests in `deploy/` for each service
- Example:
  ```bash
  kubectl apply -f deploy/k8s/auth-service.yaml
  ...
  kubectl apply -f deploy/k8s/checkin-service.yaml
  ```
- Set up Ingress, secrets, and monitoring as needed

## 8. Booking Flow (End-to-End)

1. Client requests booking via Gateway
2. Gateway forwards to booking-worker (Go)
3. booking-worker enqueues, manages queue, notifies client via realtime-service
4. When turn comes, booking-worker reserves ticket via booking-service/ticket-service
5. Client pays via payment-service
6. On success, notification-service/email-worker/invoice-service are triggered
7. At event, staff scans ticket via checkin-service
8. checkin-service validates ticket, marks as used, notifies analytics/notification

## 9. Monitoring & Observability

- All services expose Prometheus metrics
- Grafana dashboards available in `deploy/monitoring/`
- Logs are centralized (ELK/EFK stack recommended)

## 10. Security

- JWT/mTLS for gRPC and API
- Role-based access for staff/admin
- Rate limiting on all APIs

## 11. Testing

- Each service: `./mvnw test` (Java), `go test ./...` (Go)
- Integration tests: see `test/` or service-specific docs
- Load tests: Use k6, JMeter, or similar tools

## 12. Adding New Services

- Follow naming conventions (`-service`, `-worker`)
- Add gRPC definitions to `shared-lib/protos/`
- Update `README.md` and `step.md` accordingly

---

**For more details, see each service's README and the main `README.md`.**
