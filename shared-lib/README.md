# Shared Library

This directory contains shared libraries and protobuf definitions used across all microservices, regardless of programming language.

## Structure

```
shared-lib/
├── protos/           # Protocol Buffer definitions (language-agnostic)
│   ├── auth.proto    # Authentication service
│   ├── user.proto    # User management service
│   ├── booking.proto # Booking service
│   └── ...
├── docs/             # API documentation
├── schemas/          # JSON schemas, OpenAPI specs
└── README.md
```

## Supported Languages

- **JavaScript/Node.js** (gateway, auth-service, etc.)
- **Java** (future services)
- **Go** (booking-worker, future services)
- **Python** (analytics, ML services)
- **Any gRPC-supported language**

## Usage

### JavaScript/Node.js Services

```javascript
// In auth-service/src/server.js
const PROTO_PATH = path.join(
  __dirname,
  "..",
  "..",
  "shared-lib",
  "protos",
  "auth.proto"
);

// In gateway/src/grpc/clients.js
const protoPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "shared-lib",
  "protos",
  "auth.proto"
);
```

### Java Services (Future)

```java
// In Java service
String protoPath = "../shared-lib/protos/auth.proto";
```

### Go Services (Future)

```go
// In Go service
protoPath := "../shared-lib/protos/auth.proto"
```

## Benefits

- **Language Agnostic**: Proto files work with any gRPC-supported language
- **Single Source of Truth**: All services use the same proto definitions
- **Consistency**: No more mismatched proto files between services
- **Maintainability**: Update proto once, affects all services
- **Version Control**: Track proto changes centrally
- **Multi-language Support**: Easy to add new services in different languages

## Adding New Proto Files

1. Add the `.proto` file to `shared-lib/protos/`
2. Update all services (JS, Java, Go, etc.) to use the shared proto
3. Ensure all services use the same proto definition
4. Update documentation in `docs/` folder

## Best Practices

- Keep proto files **backward compatible** when possible
- Use **semantic versioning** for proto changes
- Document **breaking changes** clearly
- Test proto changes across all language implementations
