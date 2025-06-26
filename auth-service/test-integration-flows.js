import { integrationService } from './src/services/integration/integrationService.js';
import { deviceService } from './src/services/external/deviceService.js';
import { securityService } from './src/services/external/securityService.js';

/**
 * Integration Flows Test
 * Tests the business flows between Auth, Device, and Security services
 */

// Mock data for testing
const mockUserData = {
  id: 'test-user-123',
  email: 'test@example.com',
  status: 'active',
  created_at: new Date().toISOString()
};

const mockDeviceInfo = {
  device_hash: 'test-device-hash-123',
  device_name: 'Test Device',
  device_type: 'desktop',
  browser: 'Chrome',
  browser_version: '120.0.0.0',
  os: 'Windows',
  os_version: '10',
  screen_resolution: '1920x1080',
  timezone: 'UTC',
  language: 'en-US',
  location_data: { country: 'US', city: 'New York' },
  fingerprint_data: { canvas: 'test', webgl: 'test' }
};

const mockRequestInfo = {
  ip_address: '127.0.0.1',
  user_agent: 'Mozilla/5.0 Test Browser',
  headers: {}
};

const mockLoginData = {
  method: 'email_password'
};

const mockEventData = {
  service_name: 'auth-service',
  event_type: 'test_event',
  event_category: 'testing',
  severity: 'low',
  event_data: { test: true },
  location_data: { country: 'US' }
};

// Test functions
async function testServiceHealth() {
  console.log('\n🔍 Testing Service Health...');
  
  try {
    const health = await integrationService.checkServiceHealth();
    console.log('✅ Health Check Result:', JSON.stringify(health, null, 2));
    return health;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return null;
  }
}

async function testDeviceService() {
  console.log('\n📱 Testing Device Service...');
  
  try {
    // Test device registration
    console.log('  Testing device registration...');
    const deviceReg = await deviceService.registerDevice({
      user_id: mockUserData.id,
      device_hash: mockDeviceInfo.device_hash,
      device_name: mockDeviceInfo.device_name,
      device_type: mockDeviceInfo.device_type,
      browser: mockDeviceInfo.browser,
      browser_version: mockDeviceInfo.browser_version,
      os: mockDeviceInfo.os,
      os_version: mockDeviceInfo.os_version,
      screen_resolution: mockDeviceInfo.screen_resolution,
      timezone: mockDeviceInfo.timezone,
      language: mockDeviceInfo.language,
      ip_address: mockRequestInfo.ip_address,
      user_agent: mockRequestInfo.user_agent,
      location_data: mockDeviceInfo.location_data,
      fingerprint_data: mockDeviceInfo.fingerprint_data
    });
    
    console.log('  ✅ Device Registration:', deviceReg.success ? 'Success' : 'Failed');
    
    if (deviceReg.success) {
      // Test session creation
      console.log('  Testing session creation...');
      const session = await deviceService.createSession({
        user_id: mockUserData.id,
        device_id: deviceReg.device_id,
        ip_address: mockRequestInfo.ip_address,
        user_agent: mockRequestInfo.user_agent,
        location_data: mockDeviceInfo.location_data
      });
      
      console.log('  ✅ Session Creation:', session.success ? 'Success' : 'Failed');
      
      // Test device validation
      console.log('  Testing device validation...');
      const validation = await deviceService.validateDevice(
        deviceReg.device_id,
        mockUserData.id,
        mockRequestInfo.ip_address,
        mockRequestInfo.user_agent
      );
      
      console.log('  ✅ Device Validation:', validation.success ? 'Success' : 'Failed');
      
      return {
        device_id: deviceReg.device_id,
        session_id: session.session_id,
        trust_score: deviceReg.trust_score
      };
    }
    
    return null;
  } catch (error) {
    console.error('  ❌ Device Service Test Failed:', error.message);
    return null;
  }
}

async function testSecurityService() {
  console.log('\n🛡️ Testing Security Service...');
  
  try {
    // Test event submission
    console.log('  Testing event submission...');
    const event = await securityService.submitEvent({
      user_id: mockUserData.id,
      service_name: 'auth-service',
      event_type: 'test_event',
      event_category: 'testing',
      severity: 'low',
      event_data: { test: true },
      ip_address: mockRequestInfo.ip_address,
      user_agent: mockRequestInfo.user_agent,
      location_data: mockDeviceInfo.location_data
    });
    
    console.log('  ✅ Event Submission:', event.success ? 'Success' : 'Failed');
    
    // Test risk score retrieval
    console.log('  Testing risk score retrieval...');
    const riskScore = await securityService.getUserRiskScore(mockUserData.id);
    console.log('  ✅ Risk Score:', riskScore.success ? `Score: ${riskScore.risk_score}, Level: ${riskScore.risk_level}` : 'Failed');
    
    // Test threat detection
    console.log('  Testing threat detection...');
    const threat = await securityService.detectThreat(
      mockUserData.id,
      'test_event',
      { test: true },
      mockRequestInfo.ip_address,
      mockRequestInfo.user_agent
    );
    
    console.log('  ✅ Threat Detection:', threat.success ? `Threat: ${threat.threat_detected}` : 'Failed');
    
    return {
      event_id: event.event_id,
      risk_score: riskScore.risk_score,
      threat_detected: threat.threat_detected
    };
  } catch (error) {
    console.error('  ❌ Security Service Test Failed:', error.message);
    return null;
  }
}

async function testUserLoginFlow() {
  console.log('\n🔐 Testing User Login Flow...');
  
  try {
    const result = await integrationService.handleUserLogin(
      mockUserData,
      mockLoginData,
      mockDeviceInfo,
      mockRequestInfo
    );
    
    console.log('✅ Login Flow Result:', {
      success: result.success,
      device_id: result.device?.device_id,
      session_id: result.session?.session_id,
      risk_score: result.security?.risk_score,
      threat_detected: result.security?.threat_detected
    });
    
    return result;
  } catch (error) {
    console.error('❌ Login Flow Failed:', error.message);
    return null;
  }
}

async function testDeviceRegistrationFlow() {
  console.log('\n📱 Testing Device Registration Flow...');
  
  try {
    const result = await integrationService.handleDeviceRegistration(
      mockUserData,
      mockDeviceInfo,
      mockRequestInfo
    );
    
    console.log('✅ Device Registration Flow Result:', {
      success: result.success,
      device_id: result.device?.device_id,
      trust_score: result.device?.trust_score,
      trust_level: result.device?.trust_level
    });
    
    return result;
  } catch (error) {
    console.error('❌ Device Registration Flow Failed:', error.message);
    return null;
  }
}

async function testSecurityMonitoringFlow() {
  console.log('\n🛡️ Testing Security Monitoring Flow...');
  
  try {
    const result = await integrationService.handleSecurityMonitoring(
      mockUserData,
      mockEventData,
      mockRequestInfo
    );
    
    console.log('✅ Security Monitoring Flow Result:', {
      success: result.success,
      event_id: result.event_id,
      threat_detected: result.threat_detected,
      threat_level: result.threat_level
    });
    
    return result;
  } catch (error) {
    console.error('❌ Security Monitoring Flow Failed:', error.message);
    return null;
  }
}

async function testDeviceValidationFlow() {
  console.log('\n🔍 Testing Device Validation Flow...');
  
  try {
    // First register a device
    const deviceReg = await deviceService.registerDevice({
      user_id: mockUserData.id,
      device_hash: 'test-device-validation-hash',
      device_name: 'Validation Test Device',
      device_type: 'desktop',
      browser: 'Firefox',
      browser_version: '119.0.0.0',
      os: 'macOS',
      os_version: '14.0',
      screen_resolution: '2560x1440',
      timezone: 'America/New_York',
      language: 'en-US',
      ip_address: mockRequestInfo.ip_address,
      user_agent: mockRequestInfo.user_agent,
      location_data: mockDeviceInfo.location_data,
      fingerprint_data: mockDeviceInfo.fingerprint_data
    });
    
    if (!deviceReg.success) {
      throw new Error('Device registration failed for validation test');
    }
    
    const result = await integrationService.handleDeviceValidation(
      mockUserData,
      deviceReg.device_id,
      mockRequestInfo
    );
    
    console.log('✅ Device Validation Flow Result:', {
      success: result.success,
      is_valid: result.is_valid,
      trust_score: result.trust_score,
      trust_level: result.trust_level
    });
    
    return result;
  } catch (error) {
    console.error('❌ Device Validation Flow Failed:', error.message);
    return null;
  }
}

async function testUserLogoutFlow() {
  console.log('\n🚪 Testing User Logout Flow...');
  
  try {
    // First create a session
    const deviceReg = await deviceService.registerDevice({
      user_id: mockUserData.id,
      device_hash: 'test-logout-device-hash',
      device_name: 'Logout Test Device',
      device_type: 'mobile',
      browser: 'Safari',
      browser_version: '17.0.0.0',
      os: 'iOS',
      os_version: '17.0',
      screen_resolution: '390x844',
      timezone: 'America/Los_Angeles',
      language: 'en-US',
      ip_address: mockRequestInfo.ip_address,
      user_agent: mockRequestInfo.user_agent,
      location_data: mockDeviceInfo.location_data,
      fingerprint_data: mockDeviceInfo.fingerprint_data
    });
    
    if (!deviceReg.success) {
      throw new Error('Device registration failed for logout test');
    }
    
    const session = await deviceService.createSession({
      user_id: mockUserData.id,
      device_id: deviceReg.device_id,
      ip_address: mockRequestInfo.ip_address,
      user_agent: mockRequestInfo.user_agent,
      location_data: mockDeviceInfo.location_data
    });
    
    if (!session.success) {
      throw new Error('Session creation failed for logout test');
    }
    
    const result = await integrationService.handleUserLogout(
      mockUserData,
      session.session_id,
      deviceReg.device_id,
      mockRequestInfo
    );
    
    console.log('✅ User Logout Flow Result:', {
      success: result.success,
      session_revoked: result.session_revoked
    });
    
    return result;
  } catch (error) {
    console.error('❌ User Logout Flow Failed:', error.message);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Integration Flows Tests...\n');
  
  // Test individual services first
  await testServiceHealth();
  await testDeviceService();
  await testSecurityService();
  
  // Test integrated flows
  await testUserLoginFlow();
  await testDeviceRegistrationFlow();
  await testSecurityMonitoringFlow();
  await testDeviceValidationFlow();
  await testUserLogoutFlow();
  
  console.log('\n✅ All Integration Flows Tests Completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export {
  testServiceHealth,
  testDeviceService,
  testSecurityService,
  testUserLoginFlow,
  testDeviceRegistrationFlow,
  testSecurityMonitoringFlow,
  testDeviceValidationFlow,
  testUserLogoutFlow,
  runAllTests
}; 