
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatusCheck {
  comprehensiveVerificationActive: boolean;
  databaseValidationActive: boolean;
  syncVerificationActive: boolean;
  automatedVerificationActive: boolean;
  lastAutomatedRun: string | null;
  backendAutomationStatus: 'active' | 'inactive' | 'unknown';
  totalComponentsChecked: number;
  workingComponents: string[];
  issuesFound: string[];
}

export const useSystemStatusCheck = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatusCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemStatus = async () => {
    setIsChecking(true);
    
    try {
      console.log('🔍 SYSTEM STATUS CHECK: Verifying all components...');
      
      const workingComponents: string[] = [];
      const issuesFound: string[] = [];
      
      // Check database connectivity
      try {
        const { error: dbError } = await supabase.from('active_issues').select('count', { count: 'exact', head: true });
        if (!dbError) {
          workingComponents.push('Database Connectivity');
        } else {
          issuesFound.push('Database Connectivity Issue');
        }
      } catch (error) {
        issuesFound.push('Database Connection Failed');
      }
      
      // Check active_issues table
      try {
        const { data: activeIssues, error } = await supabase
          .from('active_issues')
          .select('*')
          .limit(1);
        
        if (!error) {
          workingComponents.push('Active Issues Table');
        } else {
          issuesFound.push('Active Issues Table Access Issue');
        }
      } catch (error) {
        issuesFound.push('Active Issues Table Failed');
      }
      
      // Check issue_fixes table
      try {
        const { data: fixedIssues, error } = await supabase
          .from('issue_fixes')
          .select('*')
          .limit(1);
        
        if (!error) {
          workingComponents.push('Issue Fixes Table');
        } else {
          issuesFound.push('Issue Fixes Table Access Issue');
        }
      } catch (error) {
        issuesFound.push('Issue Fixes Table Failed');
      }
      
      // Check for recent automated activity (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      let backendAutomationStatus: 'active' | 'inactive' | 'unknown' = 'unknown';
      let lastAutomatedRun: string | null = null;
      
      try {
        const { data: recentActivity, error } = await supabase
          .from('active_issues')
          .select('created_at')
          .gte('created_at', thirtyMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && recentActivity && recentActivity.length > 0) {
          backendAutomationStatus = 'active';
          lastAutomatedRun = recentActivity[0].created_at;
          workingComponents.push('Backend Automation (30min cycle)');
        } else {
          backendAutomationStatus = 'inactive';
          issuesFound.push('No recent backend automation activity detected');
        }
      } catch (error) {
        backendAutomationStatus = 'unknown';
        issuesFound.push('Cannot verify backend automation status');
      }
      
      const status: SystemStatusCheck = {
        comprehensiveVerificationActive: true,
        databaseValidationActive: workingComponents.includes('Database Connectivity'),
        syncVerificationActive: workingComponents.includes('Active Issues Table') && workingComponents.includes('Issue Fixes Table'),
        automatedVerificationActive: backendAutomationStatus === 'active',
        lastAutomatedRun,
        backendAutomationStatus,
        totalComponentsChecked: workingComponents.length + issuesFound.length,
        workingComponents,
        issuesFound
      };
      
      setSystemStatus(status);
      
      console.log('✅ SYSTEM STATUS CHECK COMPLETE');
      console.log('📊 Working Components:', workingComponents);
      console.log('⚠️ Issues Found:', issuesFound);
      console.log('🤖 Backend Automation:', backendAutomationStatus);
      
    } catch (error) {
      console.error('❌ System status check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  return {
    systemStatus,
    isChecking,
    recheckStatus: checkSystemStatus
  };
};
