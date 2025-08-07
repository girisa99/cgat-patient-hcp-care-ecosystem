/**
 * Demo Data Service
 * Provides realistic mock data for demo mode
 */

import { faker } from '@faker-js/faker';

export class DemoDataService {
  private static instance: DemoDataService;
  
  private constructor() {}
  
  public static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService();
    }
    return DemoDataService.instance;
  }

  // Mock Users Data
  generateMockUsers(count: number = 25) {
    return Array.from({ length: count }, (_, index) => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: faker.helpers.arrayElement(['patient', 'staff', 'admin', 'care_manager', 'nurse']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
      created_at: faker.date.recent({ days: 90 }).toISOString(),
      last_login: faker.date.recent({ days: 7 }).toISOString(),
      facility_id: faker.string.uuid(),
      phone: faker.phone.number(),
      is_verified: faker.datatype.boolean(),
      demo_data: true
    }));
  }

  // Mock Patients Data
  generateMockPatients(count: number = 50) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      date_of_birth: faker.date.birthdate({ min: 18, max: 85, mode: 'age' }).toISOString(),
      medical_record_number: faker.string.alphanumeric(8).toUpperCase(),
      insurance_number: faker.string.numeric(10),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip_code: faker.location.zipCode(),
      emergency_contact: faker.person.fullName(),
      emergency_phone: faker.phone.number(),
      primary_diagnosis: faker.helpers.arrayElement([
        'Substance Use Disorder', 'Depression', 'Anxiety Disorder', 
        'Bipolar Disorder', 'PTSD', 'Schizophrenia'
      ]),
      treatment_status: faker.helpers.arrayElement(['active', 'discharged', 'on_hold']),
      admission_date: faker.date.recent({ days: 180 }).toISOString(),
      assigned_counselor: faker.person.fullName(),
      facility_id: faker.string.uuid(),
      demo_data: true
    }));
  }

  // Mock Facilities Data
  generateMockFacilities(count: number = 12) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: `${faker.company.name()} Treatment Center`,
      type: faker.helpers.arrayElement(['inpatient', 'outpatient', 'residential', 'intensive_outpatient']),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip_code: faker.location.zipCode(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      capacity: faker.number.int({ min: 20, max: 200 }),
      current_census: faker.number.int({ min: 5, max: 180 }),
      license_number: faker.string.alphanumeric(12).toUpperCase(),
      accreditation: faker.helpers.arrayElement(['CARF', 'Joint Commission', 'NCQA', 'AAAHC']),
      services_offered: faker.helpers.arrayElements([
        'Individual Therapy', 'Group Therapy', 'Family Therapy', 
        'Medication Management', 'Detoxification', 'Peer Support'
      ], { min: 2, max: 6 }),
      is_active: faker.datatype.boolean({ probability: 0.9 }),
      created_at: faker.date.past({ years: 3 }).toISOString(),
      demo_data: true
    }));
  }

  // Mock AI Agents Data
  generateMockAgents(count: number = 15) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Care Coordinator AI', 'Treatment Planner', 'Medication Monitor',
        'Crisis Intervention Bot', 'Discharge Planner', 'Insurance Verification AI',
        'Appointment Scheduler', 'Progress Tracker', 'Compliance Monitor'
      ]),
      type: faker.helpers.arrayElement(['conversational', 'analytical', 'workflow', 'monitoring']),
      status: faker.helpers.arrayElement(['active', 'testing', 'draft', 'disabled']),
      description: faker.lorem.sentence(),
      capabilities: faker.helpers.arrayElements([
        'Natural Language Processing', 'Data Analysis', 'Workflow Automation',
        'Predictive Analytics', 'Real-time Monitoring', 'Integration Management'
      ], { min: 2, max: 4 }),
      accuracy_score: faker.number.float({ min: 0.75, max: 0.99, fractionDigits: 2 }),
      response_time_ms: faker.number.int({ min: 150, max: 800 }),
      usage_count: faker.number.int({ min: 100, max: 10000 }),
      last_trained: faker.date.recent({ days: 30 }).toISOString(),
      created_at: faker.date.past({ years: 1 }).toISOString(),
      demo_data: true
    }));
  }

  // Mock API Services Data
  generateMockApiServices(count: number = 20) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Electronic Health Records API', 'Insurance Verification Service',
        'Medication Database API', 'Lab Results Integration', 'Billing System API',
        'Pharmacy Management API', 'Telehealth Platform API', 'Document Management API'
      ]),
      endpoint: faker.internet.url(),
      method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
      status: faker.helpers.arrayElement(['active', 'testing', 'maintenance', 'error']),
      response_time_avg: faker.number.int({ min: 50, max: 500 }),
      success_rate: faker.number.float({ min: 0.85, max: 0.999, fractionDigits: 3 }),
      requests_per_hour: faker.number.int({ min: 10, max: 1000 }),
      last_health_check: faker.date.recent({ days: 1 }).toISOString(),
      documentation_url: faker.internet.url(),
      version: faker.system.semver(),
      provider: faker.company.name(),
      cost_per_request: faker.number.float({ min: 0.001, max: 0.1, fractionDigits: 3 }),
      demo_data: true
    }));
  }

  // Mock Test Results
  generateMockTestResults(count: number = 30) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      test_name: faker.helpers.arrayElement([
        'User Authentication Flow', 'Patient Data Sync', 'Billing Integration',
        'Medication Alerts', 'Appointment Scheduling', 'Report Generation',
        'Data Backup Process', 'Security Scan', 'Performance Load Test'
      ]),
      status: faker.helpers.arrayElement(['passed', 'failed', 'running', 'pending']),
      duration_ms: faker.number.int({ min: 500, max: 30000 }),
      assertions_total: faker.number.int({ min: 5, max: 50 }),
      assertions_passed: faker.number.int({ min: 0, max: 50 }),
      error_message: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
      environment: faker.helpers.arrayElement(['development', 'staging', 'demo']),
      executed_at: faker.date.recent({ days: 1 }).toISOString(),
      executed_by: faker.person.fullName(),
      demo_data: true
    }));
  }

  // Mock Recent Activities
  generateMockActivities(count: number = 100) {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      action: faker.helpers.arrayElement([
        'User logged in', 'Patient record updated', 'Appointment scheduled',
        'Medication prescribed', 'Test result uploaded', 'Report generated',
        'Alert triggered', 'Data synchronized', 'Backup completed'
      ]),
      user: faker.person.fullName(),
      entity_type: faker.helpers.arrayElement(['user', 'patient', 'facility', 'appointment', 'medication']),
      entity_id: faker.string.uuid(),
      timestamp: faker.date.recent({ days: 2 }).toISOString(),
      ip_address: faker.internet.ip(),
      user_agent: faker.internet.userAgent(),
      details: faker.lorem.sentence(),
      demo_data: true
    }));
  }

  // Comprehensive mock data generator
  generateAllMockData() {
    return {
      users: this.generateMockUsers(),
      patients: this.generateMockPatients(),
      facilities: this.generateMockFacilities(),
      agents: this.generateMockAgents(),
      apiServices: this.generateMockApiServices(),
      testResults: this.generateMockTestResults(),
      activities: this.generateMockActivities(),
      metadata: {
        generated_at: new Date().toISOString(),
        total_records: 252,
        demo_mode: true,
        version: '1.0.0'
      }
    };
  }
}

export const demoDataService = DemoDataService.getInstance();