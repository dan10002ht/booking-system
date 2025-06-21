# Email Worker Service (Go)

**Language:** Go (Golang)

**Why Go?**

- Max performance for bulk email delivery
- Goroutines for parallel sending
- Handles queue, retry, and scale efficiently

## Overview

The Email Worker Service is a background processing service that handles email generation and delivery asynchronously. It processes email jobs from message queues, generates personalized email content, and ensures reliable delivery with retry mechanisms and dead letter queues.

## 🎯 Responsibilities

- **Background Email Processing**: Process email jobs asynchronously
- **Template Rendering**: Generate personalized email content
- **Email Delivery**: Send emails through multiple providers
- **Retry Logic**: Handle failed deliveries with exponential backoff
- **Dead Letter Queue**: Manage undeliverable emails
- **Email Tracking**: Track email delivery and open rates
- **Bulk Email Processing**: Handle large email campaigns
- **gRPC Client**: Communicate with other services

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Java 17+
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL (email tracking, templates)
- **Cache**: Redis (template cache, job status)
- **Message Queue**: Redis Queue + Kafka (email jobs)
- **gRPC**: grpc-java for inter-service communication
- **Email Providers**: SendGrid, AWS SES, SMTP
- **Template Engine**: Thymeleaf, Freemarker
- **Monitoring**: Micrometer + Prometheus

### Key Components

```
Email Worker Service
├── Job Consumer
├── Template Engine
├── Email Renderer
├── Delivery Manager
├── Retry Handler
├── Dead Letter Queue
├── Tracking Manager
├── gRPC Client
└── Health Checker
```

## 🔄 Email Processing Flow

### Standard Email Flow

```
Email Job (Queue)
    ↓
Job Validation
    ↓
Template Resolution
    ↓
Content Rendering
    ↓
Email Preparation
    ↓
Delivery Attempt
    ↓
Status Tracking
    ↓
Retry (if needed)
    ↓
Completion/Dead Letter
```

### Bulk Email Flow

```
Bulk Email Job
    ↓
User Segmentation
    ↓
Template Personalization
    ↓
Batch Processing
    ↓
Parallel Delivery
    ↓
Progress Tracking
    ↓
Completion Report
```

### Retry Flow

```
Failed Delivery
    ↓
Retry Count Check
    ↓
Exponential Backoff
    ↓
Alternative Provider
    ↓
Delivery Attempt
    ↓
Success or Dead Letter
```

## 📡 Job Types

### Email Job Structure

```json
{
  "id": "job-uuid",
  "type": "email",
  "template": "booking-confirmation",
  "recipient": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "data": {
    "bookingId": "booking-uuid",
    "eventName": "Concert 2024",
    "ticketCount": 2,
    "totalAmount": 150.0
  },
  "priority": "high",
  "scheduledAt": "2024-01-01T10:00:00Z",
  "retryCount": 0,
  "maxRetries": 3
}
```

### Job Types

```java
// Booking confirmation emails
BOOKING_CONFIRMATION
BOOKING_CANCELLATION
BOOKING_REMINDER

// Payment emails
PAYMENT_CONFIRMATION
PAYMENT_FAILED
REFUND_CONFIRMATION

// User emails
WELCOME_EMAIL
PASSWORD_RESET
EMAIL_VERIFICATION

// Marketing emails
EVENT_ANNOUNCEMENT
SPECIAL_OFFER
NEWSLETTER

// System emails
MAINTENANCE_NOTICE
SECURITY_ALERT
SYSTEM_UPDATE
```

## 🔐 Security Features

### Email Security

- **Content Validation**: Validate email content
- **Template Security**: Secure template rendering
- **Rate Limiting**: Prevent email abuse
- **Spam Prevention**: Follow email best practices

### Data Protection

- **Personal Data Handling**: Secure personal data processing
- **Template Sanitization**: Sanitize template content
- **Audit Logging**: Log all email activities
- **Encryption**: Encrypt sensitive data

### Provider Security

- **API Key Management**: Secure provider credentials
- **SSL/TLS**: Secure email transmission
- **Authentication**: Verify provider identity
- **Access Control**: Control provider access

## 📊 Database Schema

### Email Jobs Table

```sql
CREATE TABLE email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    template VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(255),
    content TEXT,
    data JSONB,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    processed_at TIMESTAMP,
    sent_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    provider VARCHAR(50),
    message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Templates Table

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Tracking Table

```sql
CREATE TABLE email_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES email_jobs(id),
    message_id VARCHAR(100),
    provider VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
SERVER_PORT=8082
SPRING_PROFILES_ACTIVE=production

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/email_worker_db
SPRING_DATASOURCE_USERNAME=email_worker_user
SPRING_DATASOURCE_PASSWORD=email_worker_password
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DATABASE=5

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_EMAIL_JOBS=email-jobs
KAFKA_TOPIC_EMAIL_EVENTS=email-events
KAFKA_GROUP_ID=email-worker

# gRPC Configuration
GRPC_AUTH_SERVICE_URL=auth-service:50051
GRPC_USER_SERVICE_URL=user-service:50056
GRPC_BOOKING_SERVICE_URL=booking-service:50053
GRPC_MAX_RECEIVE_MESSAGE_SIZE=4194304
GRPC_MAX_SEND_MESSAGE_SIZE=4194304
GRPC_KEEPALIVE_TIME_MS=30000
GRPC_KEEPALIVE_TIMEOUT_MS=5000

# Email Configuration
EMAIL_PROVIDER_PRIMARY=sendgrid
EMAIL_PROVIDER_FALLBACK=ses
EMAIL_FROM_ADDRESS=noreply@bookingsystem.com
EMAIL_FROM_NAME=Booking System
EMAIL_REPLY_TO=support@bookingsystem.com

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_TEMPLATE_ID=your_template_id

# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_ses_access_key
AWS_SES_SECRET_KEY=your_ses_secret_key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_ENCRYPTION=starttls

# Job Configuration
EMAIL_JOB_BATCH_SIZE=50
EMAIL_JOB_CONCURRENCY=10
EMAIL_JOB_TIMEOUT_SECONDS=300
EMAIL_RETRY_DELAY_SECONDS=60
EMAIL_MAX_RETRIES=3
EMAIL_DEAD_LETTER_QUEUE=email-dlq
```

## 🚀 Performance Optimizations

### gRPC Benefits

- **Protocol Buffers**: 3-10x smaller payload size
- **HTTP/2**: Multiplexing and compression
- **Connection Reuse**: Persistent connections
- **Bidirectional Streaming**: Real-time communication
- **Code Generation**: Type-safe client/server code

### Processing Optimization

- **Batch Processing**: Process emails in batches
- **Parallel Processing**: Concurrent email delivery
- **Connection Pooling**: Reuse provider connections
- **Template Caching**: Cache rendered templates

### Queue Optimization

- **Priority Queuing**: Priority-based job processing
- **Dead Letter Queue**: Handle failed jobs
- **Retry Logic**: Exponential backoff for retries
- **Job Partitioning**: Partition jobs by type

## 📊 Monitoring & Observability

### Metrics

- **Job Processing Rate**: Jobs processed per minute
- **Delivery Success Rate**: Successful vs failed deliveries
- **Provider Performance**: Performance per email provider
- **Template Usage**: Template usage statistics
- **Retry Rate**: Job retry statistics
- **gRPC Metrics**: Request/response counts, latency

### Logging

- **Job Logs**: All job processing activities
- **Delivery Logs**: Email delivery attempts
- **Error Logs**: Job failures and errors
- **Performance Logs**: Slow operations
- **gRPC Logs**: Inter-service communication logs

### Health Checks

- **Database Health**: Connection and query health
- **Redis Health**: Cache connectivity
- **Kafka Health**: Message queue connectivity
- **Provider Health**: Email provider connectivity
- **gRPC Health**: gRPC service connectivity

## 🧪 Testing

### Unit Tests

```bash
./mvnw test
```

### Integration Tests

```bash
./mvnw test -Dtest=IntegrationTest
```

### gRPC Tests

```bash
./mvnw test -Dtest=GrpcTest
```

### Email Tests

```bash
./mvnw test -Dtest=EmailTest
```

### Load Tests

```bash
./mvnw test -Dtest=LoadTest
```

## 🚀 Deployment

### Docker

```dockerfile
FROM openjdk:17-jdk-slim

# Install protobuf compiler
RUN apt-get update && apt-get install -y protobuf-compiler

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Copy protobuf definitions
COPY shared-lib/protos ./protos

# Generate gRPC code
RUN ./mvnw grpc:generate

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

EXPOSE 8082

CMD ["java", "-jar", "target/email-worker.jar"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: email-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: email-worker
  template:
    metadata:
      labels:
        app: email-worker
    spec:
      containers:
        - name: email-worker
          image: booking-system/email-worker:latest
          ports:
            - containerPort: 8082
          env:
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: email-worker-secrets
                  key: database-url
            - name: REDIS_HOST
              value: "redis-service"
            - name: KAFKA_BOOTSTRAP_SERVERS
              value: "kafka-service:9092"
            - name: SENDGRID_API_KEY
              valueFrom:
                secretKeyRef:
                  name: email-worker-secrets
                  key: sendgrid-api-key
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
```

## 🔄 Job Processing Implementation

### Job Consumer

```java
@Component
public class EmailJobConsumer {

    @KafkaListener(topics = "${kafka.topic.email-jobs}")
    public void consumeEmailJob(EmailJob job) {
        try {
            // Validate job
            validateJob(job);

            // Process job
            EmailResult result = processEmailJob(job);

            // Update job status
            updateJobStatus(job.getId(), result);

            // Publish event
            publishEmailEvent(job, result);

        } catch (Exception e) {
            handleJobError(job, e);
        }
    }

    private EmailResult processEmailJob(EmailJob job) {
        // Resolve template
        EmailTemplate template = templateService.getTemplate(job.getTemplate());

        // Render content
        String htmlContent = templateEngine.render(template, job.getData());
        String textContent = templateEngine.renderText(template, job.getData());

        // Prepare email
        Email email = Email.builder()
            .to(job.getRecipient().getEmail())
            .subject(template.getSubject())
            .htmlContent(htmlContent)
            .textContent(textContent)
            .build();

        // Send email
        return emailService.sendEmail(email);
    }
}
```

### Retry Handler

```java
@Component
public class RetryHandler {

    public void handleRetry(EmailJob job, Exception error) {
        if (job.getRetryCount() < job.getMaxRetries()) {
            // Calculate delay with exponential backoff
            long delay = calculateRetryDelay(job.getRetryCount());

            // Schedule retry
            scheduleRetry(job, delay);

            // Update retry count
            updateRetryCount(job.getId());

        } else {
            // Move to dead letter queue
            moveToDeadLetterQueue(job, error);
        }
    }

    private long calculateRetryDelay(int retryCount) {
        return (long) Math.pow(2, retryCount) * 60 * 1000; // Exponential backoff
    }
}
```

### Email Service

```java
@Service
public class EmailService {

    @Autowired
    private SendGridEmailProvider sendGridProvider;

    @Autowired
    private SESEmailProvider sesProvider;

    public EmailResult sendEmail(Email email) {
        try {
            // Try primary provider
            return sendGridProvider.sendEmail(email);

        } catch (Exception e) {
            // Fallback to secondary provider
            return sesProvider.sendEmail(email);
        }
    }
}
```

## 🛡️ Security Best Practices

### Content Security

- **Template Validation**: Validate email templates
- **Content Sanitization**: Sanitize email content
- **Rate Limiting**: Prevent email abuse
- **Spam Prevention**: Follow email best practices

### Data Security

- **Personal Data Protection**: Secure personal data
- **Template Security**: Secure template management
- **Audit Logging**: Log all email activities
- **Encryption**: Encrypt sensitive data

### Provider Security

- **API Key Management**: Secure provider credentials
- **SSL/TLS**: Secure email transmission
- **Authentication**: Verify provider identity
- **Access Control**: Control provider access

## 📞 Troubleshooting

### Common Issues

1. **Job Processing Failures**: Check job validation
2. **Template Errors**: Verify template syntax
3. **Provider Failures**: Check provider credentials
4. **Queue Issues**: Monitor message queue health
5. **gRPC Connection**: Verify service endpoints

### Debug Commands

```bash
# Check service health
curl http://email-worker:8082/actuator/health

# Check Kafka consumer group
kafka-consumer-groups --bootstrap-server kafka:9092 --group email-worker --describe

# Check Redis queue
redis-cli llen email-jobs

# Monitor email jobs
kafka-console-consumer --bootstrap-server kafka:9092 --topic email-jobs

# Check dead letter queue
redis-cli llen email-dlq
```

## 🔗 Dependencies

### External Services (gRPC)

- **Auth Service**: User authentication and validation
- **User Service**: User profile information
- **Booking Service**: Booking details for emails

### Infrastructure

- **PostgreSQL**: Email job and template storage
- **Redis**: Job queuing and caching
- **Kafka**: Message queue for email jobs
- **Protocol Buffers**: Message serialization

### Email Providers

- **SendGrid**: Primary email provider
- **AWS SES**: Secondary email provider
- **SMTP**: Fallback email provider
