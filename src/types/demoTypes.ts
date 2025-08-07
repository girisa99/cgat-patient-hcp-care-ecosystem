/**
 * Demo Version Types & Configuration
 * Defines demo mode behavior and mock data structures
 */

export type DemoMode = 'full' | 'read-only' | 'guided-tour' | 'disabled';

export interface DemoConfig {
  mode: DemoMode;
  allowDataEntry: boolean;
  showDemoIndicators: boolean;
  mockDataEnabled: boolean;
  guidedTourEnabled: boolean;
  restrictedFeatures: string[];
}

export interface DemoUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'demo_user' | 'demo_admin' | 'demo_superadmin';
  demo_mode: DemoMode;
  demo_session_id: string;
  created_at: string;
}

export interface MockDataService {
  generateMockUsers: (count: number) => any[];
  generateMockPatients: (count: number) => any[];
  generateMockFacilities: (count: number) => any[];
  generateMockModules: (count: number) => any[];
  generateMockActivities: (count: number) => any[];
}

// Demo feature flags
export const DEMO_FEATURES = {
  AGENTS: {
    enabled: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    showMockData: true
  },
  API_SERVICES: {
    enabled: true,
    canCreate: false,
    canTest: true, // Allow testing with mock responses
    showMockData: true
  },
  TESTING_SUITE: {
    enabled: true,
    canRunTests: true, // Allow running tests with mock data
    canCreateTests: false,
    showMockResults: true
  },
  USER_MANAGEMENT: {
    enabled: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    showMockData: true
  },
  FACILITIES: {
    enabled: true,
    canCreate: false,
    canEdit: false,
    showMockData: true
  }
} as const;

export type DemoFeatureKey = keyof typeof DEMO_FEATURES;