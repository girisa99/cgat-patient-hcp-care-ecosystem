
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemModuleStatus {
  moduleName: string;
  isWorking: boolean;
  tableConnected: boolean;
  dataCount: number;
  lastActivity: string | null;
  issues: string[];
}

interface ComprehensiveSystemStatus {
  userManagement: SystemModuleStatus;
  facilities: SystemModuleStatus;
  modules: SystemModuleStatus;
  apiIntegrations: SystemModuleStatus;
  adminVerification: SystemModuleStatus;
  overallHealth: 'healthy' | 'warning' | 'critical';
  totalIssues: number;
  workingModules: number;
  recommendations: string[];
}

export const useComprehensiveSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<ComprehensiveSystemStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkModuleStatus = async (tableName: 'profiles' | 'facilities' | 'modules' | 'api_integration_registry' | 'active_issues', moduleName: string): Promise<SystemModuleStatus> => {
    const issues: string[] = [];
    let isWorking = true;
    let tableConnected = false;
    let dataCount = 0;
    let lastActivity: string | null = null;

    try {
      // Check table connectivity and data
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        tableConnected = true;
        dataCount = count || 0;
        
        // Check for recent activity based on table structure
        if (tableName === 'profiles' || tableName === 'facilities' || tableName === 'modules') {
          const { data: recentData } = await supabase
            .from(tableName)
            .select('created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentData && recentData.length > 0) {
            lastActivity = recentData[0].created_at || recentData[0].updated_at;
          }
        } else if (tableName === 'api_integration_registry') {
          const { data: recentData } = await supabase
            .from(tableName)
            .select('created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentData && recentData.length > 0) {
            lastActivity = recentData[0].created_at || recentData[0].updated_at;
          }
        } else if (tableName === 'active_issues') {
          const { data: recentData } = await supabase
            .from(tableName)
            .select('first_detected, last_seen')
            .order('first_detected', { ascending: false })
            .limit(1);

          if (recentData && recentData.length > 0) {
            lastActivity = recentData[0].first_detected || recentData[0].last_seen;
          }
        }
      } else {
        isWorking = false;
        tableConnected = false;
        issues.push(`Database connection error: ${error.message}`);
      }
    } catch (error) {
      isWorking = false;
      issues.push(`System error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      moduleName,
      isWorking,
      tableConnected,
      dataCount,
      lastActivity,
      issues
    };
  };

  const checkComprehensiveSystemStatus = async () => {
    setIsChecking(true);

    try {
      console.log('🔍 Comprehensive System Status Check Starting...');

      // Check all major modules
      const [
        userManagement,
        facilities,
        modules,
        apiIntegrations,
        adminVerification
      ] = await Promise.all([
        checkModuleStatus('profiles', 'User Management'),
        checkModuleStatus('facilities', 'Facilities'),
        checkModuleStatus('modules', 'Modules'),
        checkModuleStatus('api_integration_registry', 'API Integrations'),
        checkModuleStatus('active_issues', 'Admin Verification')
      ]);

      // Calculate overall health
      const allModules = [userManagement, facilities, modules, apiIntegrations, adminVerification];
      const workingModules = allModules.filter(m => m.isWorking).length;
      const totalIssues = allModules.reduce((sum, m) => sum + m.issues.length, 0);

      let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (totalIssues > 3 || workingModules < 3) {
        overallHealth = 'critical';
      } else if (totalIssues > 0 || workingModules < 5) {
        overallHealth = 'warning';
      }

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (totalIssues > 0) {
        recommendations.push(`🔧 Address ${totalIssues} system issues found across modules`);
      }

      if (workingModules === allModules.length) {
        recommendations.push('✅ All core modules functioning - system is healthy');
      }

      recommendations.push('🔄 Regular monitoring recommended for continued system health');
      recommendations.push('📊 Consider implementing automated health checks');

      const status: ComprehensiveSystemStatus = {
        userManagement,
        facilities,
        modules,
        apiIntegrations,
        adminVerification,
        overallHealth,
        totalIssues,
        workingModules,
        recommendations
      };

      setSystemStatus(status);
      console.log('✅ Comprehensive System Status Check Complete');
      console.log(`📊 Working Modules: ${workingModules}/${allModules.length}`);
      console.log(`⚠️ Total Issues: ${totalIssues}`);

    } catch (error) {
      console.error('❌ Comprehensive system status check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkComprehensiveSystemStatus();
  }, []);

  return {
    systemStatus,
    isChecking,
    recheckStatus: checkComprehensiveSystemStatus
  };
};
