
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * Prevents TypeScript "never" type inference issues
 * Version: master-form-state-types-v2.0.0 - Enhanced with proper form state definitions
 */

export interface ApiFormState {
  name: string;
  description: string;  
  endpoint: string;
  method: string;
  headers: string;
}

export interface PublishFormState {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
}

export interface PatientFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

export interface SharedModuleState {
  selectedModule: string;
  isActive: boolean;
  configuration: string;
}

export interface UserManagementFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
}

// Enhanced form state interfaces for comprehensive TypeScript alignment
export interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
}

export interface AdminRealtimeState {
  connectedUsers: string;
  activeConnections: string;
  systemLoad: number;
}

export interface ApiConsumptionTriggerState {
  apiName: string;
  triggerType: string;
  endpoint: string;
  method: string;
  payload: string;
}

export interface ApiIntegrationState {
  integrationName: string;
  apiUrl: string;
  authMethod: string;
  headers: string;
  timeout: string;
}
