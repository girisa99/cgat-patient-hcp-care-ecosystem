

export interface ComprehensiveSystemStatus {
  totalUsers: number;
  totalFacilities: number;
  totalModules: number;
  totalApiServices: number;
  activeUsers: number;
  activeFacilities: number;
  activeModules: number;
  activeApiServices: number;
  patientCount: number;
  adminCount: number;
  staffCount: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
  overallHealth: string;
  workingModules: number;
  userManagement: {
    moduleName: string;
    isWorking: boolean;
    dataCount: number;
    issues: string[];
  };
  facilities: {
    moduleName: string;
    isWorking: boolean;
    dataCount: number;
    issues: string[];
  };
  modules: {
    moduleName: string;
    isWorking: boolean;
    dataCount: number;
    issues: string[];
  };
  apiIntegrations: {
    moduleName: string;
    isWorking: boolean;
    dataCount: number;
    issues: string[];
  };
  adminVerification: {
    moduleName: string;
    isWorking: boolean;
    dataCount: number;
    issues: string[];
  };
  recommendations: string[];
  totalIssues: number;
}
