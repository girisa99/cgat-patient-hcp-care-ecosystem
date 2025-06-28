
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';
import { enhancedSecurityPerformanceOrchestrator, ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';
import SecurityDashboardHeader from './SecurityDashboardHeader';
import SecurityStatusOverview from './SecurityStatusOverview';
import AutomatedFixesBanner from './AutomatedFixesBanner';
import SecurityDashboardTabs from './SecurityDashboardTabs';

const SecurityDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(new Date());
  const [comprehensiveSummary, setComprehensiveSummary] = useState<ComprehensiveSecurityPerformanceSummary | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const { toast } = useToast();
  const { runManualScan, lastSummary } = useAutomatedVerification();

  useEffect(() => {
    // Initialize comprehensive monitoring
    initializeComprehensiveMonitoring();
    
    // Set up periodic updates
    const interval = setInterval(updateComprehensiveSummary, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const initializeComprehensiveMonitoring = async () => {
    try {
      console.log('🚀 Initializing comprehensive monitoring...');
      await enhancedSecurityPerformanceOrchestrator.startComprehensiveMonitoring();
      setIsMonitoringActive(true);
      
      // Get initial summary
      const summary = await enhancedSecurityPerformanceOrchestrator.getComprehensiveSummary();
      setComprehensiveSummary(summary);
      
      toast({
        title: "🚀 Comprehensive Monitoring Active",
        description: "Real-time security and performance monitoring is now running",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to initialize comprehensive monitoring:', error);
      toast({
        title: "⚠️ Monitoring Initialization Failed", 
        description: "Some monitoring features may not be available",
        variant: "destructive",
      });
    }
  };

  const updateComprehensiveSummary = async () => {
    try {
      const summary = await enhancedSecurityPerformanceOrchestrator.getComprehensiveSummary();
      setComprehensiveSummary(summary);
      
      // Check for critical issues and show alerts
      if (summary.criticalSecurityIssues > 0 || summary.criticalPerformanceIssues > 0) {
        toast({
          title: "🚨 Critical Issues Detected",
          description: `${summary.criticalSecurityIssues} security issues, ${summary.criticalPerformanceIssues} performance issues`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update comprehensive summary:', error);
    }
  };

  const handleSecurityScan = async () => {
    setIsScanning(true);
    console.log('🔒 Starting comprehensive security verification scan...');
    
    try {
      toast({
        title: "🔍 Comprehensive Scan Started",
        description: "Running full security and performance analysis...",
        variant: "default",
      });

      // Run both traditional scan and comprehensive analysis
      await Promise.all([
        runManualScan(),
        updateComprehensiveSummary()
      ]);
      
      const currentTime = new Date();
      setLastScanTime(currentTime);
      
      setTimeout(() => {
        if (comprehensiveSummary) {
          const criticalTotal = comprehensiveSummary.criticalSecurityIssues + comprehensiveSummary.criticalPerformanceIssues;
          
          if (criticalTotal > 0) {
            toast({
              title: "🚨 Critical Issues Found",
              description: `Found ${criticalTotal} critical issues requiring immediate attention`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "✅ Comprehensive Scan Complete",
              description: `System health: ${comprehensiveSummary.overallHealthScore}% - Status: ${comprehensiveSummary.securityStatus}`,
              variant: "default",
            });
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Comprehensive scan failed:', error);
      toast({
        title: "❌ Comprehensive Scan Failed",
        description: "An error occurred during the comprehensive scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const executeAutomatedFixes = async () => {
    if (!comprehensiveSummary) return;
    
    const autoFixableIssues = comprehensiveSummary.automatedFixes
      .filter(fix => fix.canAutoFix && fix.riskLevel === 'low')
      .map(fix => fix.id);
    
    if (autoFixableIssues.length === 0) {
      toast({
        title: "ℹ️ No Auto-fixes Available",
        description: "No low-risk automated fixes are currently available",
        variant: "default",
      });
      return;
    }

    try {
      toast({
        title: "🔧 Executing Automated Fixes",
        description: `Applying ${autoFixableIssues.length} automated fixes...`,
        variant: "default",
      });

      const result = await enhancedSecurityPerformanceOrchestrator.executeAutomatedFixes(autoFixableIssues);
      
      toast({
        title: "✅ Automated Fixes Complete",
        description: `${result.success.length} fixes applied, ${result.failed.length} failed`,
        variant: result.failed.length === 0 ? "default" : "destructive",
      });

      // Refresh summary after fixes
      setTimeout(updateComprehensiveSummary, 2000);
    } catch (error) {
      toast({
        title: "❌ Automated Fixes Failed",
        description: "An error occurred while applying automated fixes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Security Overview Header */}
      <SecurityDashboardHeader
        comprehensiveSummary={comprehensiveSummary}
        isMonitoringActive={isMonitoringActive}
        isScanning={isScanning}
        onSecurityScan={handleSecurityScan}
      />

      <SecurityStatusOverview
        comprehensiveSummary={comprehensiveSummary}
        lastScanTime={lastScanTime}
      />

      {/* Quick Actions */}
      {comprehensiveSummary && (
        <AutomatedFixesBanner
          comprehensiveSummary={comprehensiveSummary}
          onExecuteAutomatedFixes={executeAutomatedFixes}
        />
      )}

      {/* Comprehensive Dashboard Tabs */}
      <SecurityDashboardTabs
        lastSummary={lastSummary}
        comprehensiveSummary={comprehensiveSummary}
      />
    </div>
  );
};

export default SecurityDashboard;
