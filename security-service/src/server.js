import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// Import security controllers
import securityEventController from './controllers/securityEventController.js';
import securityAlertController from './controllers/securityAlertController.js';
import securityIncidentController from './controllers/securityIncidentController.js';
import riskAssessmentController from './controllers/riskAssessmentController.js';
import threatDetectionController from './controllers/threatDetectionController.js';
import healthController from './controllers/healthController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load security service proto
const PROTO_PATH = path.join(__dirname, 'proto', 'security.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const securityProto = grpc.loadPackageDefinition(packageDefinition).security;

// Create gRPC server
const server = new grpc.Server();

// Add SecurityService
server.addService(securityProto.SecurityService.service, {
  // Event Management
  SubmitEvent: securityEventController.submitEvent,
  GetEvents: securityEventController.getEvents,
  
  // Alert Management
  GetAlerts: securityAlertController.getAlerts,
  AcknowledgeAlert: securityAlertController.acknowledgeAlert,
  
  // Incident Management
  GetIncidents: securityIncidentController.getIncidents,
  ResolveIncident: securityIncidentController.resolveIncident,
  
  // Risk Assessment
  GetRiskScore: riskAssessmentController.getRiskScore,
  UpdateRiskScore: riskAssessmentController.updateRiskScore,
  
  // Analytics
  GetAnalytics: threatDetectionController.getAnalytics,
  GetThreatPatterns: threatDetectionController.getThreatPatterns,
});

// Add HealthService
server.addService(securityProto.HealthService.service, {
  Check: healthController.check,
});

export { server };