
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
}
