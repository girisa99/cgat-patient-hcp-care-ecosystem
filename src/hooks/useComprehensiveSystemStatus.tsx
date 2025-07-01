
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemModuleStatus {
  moduleName: string;
  isWorking: boolean;
  dataCount: number;
  lastActivity: string | null;
  issues: string[];
}

interface ComprehensiveSystemStatus {
  overallHealth: 'healthy' | 'warning' | 'critical';
  workingModules: number;
  totalModules: number;
  userManagement: SystemModuleStatus;
  facilities: SystemModuleStatus;
  modules: SystemModuleStatus;
  apiIntegrations: SystemModuleStatus;
  adminVerification: SystemModuleStatus;
  recommendations: string[];
  totalIssues: number;
}

export const useComprehensiveSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<ComprehensiveSystemStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemStatus = async (): Promise<ComprehensiveSystemStatus> => {
    console.log('🔍 Checking comprehensive system status...');
    
    // Check User Management
    const userManagement = await checkModule('User Management', 'profiles', async () => {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      return { data, error };
    });

    // Check Facilities
    const facilities = await checkModule('Facilities', 'facilities', async () => {
      const { data, error } = await supabase.from('facilities').select('count', { count: 'exact', head: true });
      return { data, error };
    });

    // Check Modules
    const modules = await checkModule('Modules', 'modules', async () => {
      const { data, error } = await supabase.from('modules').select('count', { count: 'exact', head: true });
      return { data, error };
    });

    // Check API Integrations
    const apiIntegrations = await checkModule('API Integrations', 'api_integration_registry', async () => {
      const { data, error } = await supabase.from('api_integration_registry').select('count', { count: 'exact', head: true });
      return { data, error };
    });

    // Check Admin Verification
    const adminVerification = await checkModule('Admin Verification', 'audit_logs', async () => {
      const { data, error } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
      return { data, error };
    });

    const moduleStatuses = [userManagement, facilities, modules, apiIntegrations, adminVerification];
    const workingModules = moduleStatuses.filter(m => m.isWorking).length;
    const totalModules = moduleStatuses.length;
    const totalIssues = moduleStatuses.reduce((sum, module) => sum + module.issues.length, 0);

    // Determine overall health
    let overallHealth: 'healthy' | 'warning' | 'critical';
    const healthPercentage = (workingModules / totalModules) * 100;
    
    if (healthPercentage >= 80 && totalIssues === 0) {
      overallHealth = 'healthy';
    } else if (healthPercentage >= 60) {
      overallHealth = 'warning';
    } else {
      overallHealth = 'critical';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (workingModules < totalModules) {
      recommendations.push(`${totalModules - workingModules} modules need attention`);
    }
    if (totalIssues > 0) {
      recommendations.push(`${totalIssues} issues detected across modules`);
    }
    if (overallHealth === 'healthy') {
      recommendations.push('System is ready for Phase 2 implementation');
    }

    return {
      overallHealth,
      workingModules,
      totalModules,
      userManagement,
      facilities,
      modules,
      apiIntegrations,
      adminVerification,
      recommendations,
      totalIssues
    };
  };

  const checkModule = async (
    moduleName: string, 
    tableName: string, 
    queryFn: () => Promise<{ data: any; error: any }>
  ): Promise<SystemModuleStatus> => {
    const issues: string[] = [];
    let isWorking = true;
    let dataCount = 0;
    let lastActivity: string | null = null;

    try {
      const { data, error } = await queryFn();
      
      if (error) {
        issues.push(`Database connection error: ${error.message}`);
        isWorking = false;
      } else {
        dataCount = data || 0;
      }

      // Check for recent activity
      try {
        const { data: recentData } = await supabase
          .from(tableName)
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (recentData && recentData.length > 0) {
          lastActivity = recentData[0].created_at;
        }
      } catch (err) {
        // Non-critical error for recent activity check
      }

    } catch (err) {
      issues.push(`Module check failed: ${err}`);
      isWorking = false;
    }

    return {
      moduleName,
      isWorking,
      dataCount,
      lastActivity,
      issues
    };
  };

  const recheckStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    recheckStatus();
  }, []);

  return {
    systemStatus,
    isChecking,
    recheckStatus
  };
};
