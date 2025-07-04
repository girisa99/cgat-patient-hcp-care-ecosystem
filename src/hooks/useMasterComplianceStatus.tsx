
/**
 * MASTER COMPLIANCE STATUS - REAL-TIME MONITORING
 * Real-time status monitoring for master consolidation compliance
 * Version: master-compliance-status-v1.0.0
 */
import { useMasterTypeScriptCompliance } from './useMasterTypeScriptCompliance';
import { useMasterSystemCompliance } from './useMasterSystemCompliance';
import { useMasterToastAlignment } from './useMasterToastAlignment';

export interface MasterComplianceStatus {
  isFullyCompliant: boolean;
  overallScore: number;
  systemHealth: {
    typescript: number;
    buildStatus: 'resolved' | 'issues';
    uiComponents: 'fixed' | 'issues';
    masterHooks: 'aligned' | 'misaligned';
  };
  complianceLevel: 'perfect' | 'excellent' | 'good' | 'needs_work';
  lastUpdated: string;
}

export const useMasterComplianceStatus = () => {
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  const systemCompliance = useMasterSystemCompliance();
  const toastAlignment = useMasterToastAlignment();

  console.log('🎯 Master Compliance Status - Real-time Monitoring Active');

  const getMasterComplianceStatus = (): MasterComplianceStatus => {
    const tsReport = typeScriptCompliance.validateTypeScriptCompliance();
    const systemReport = systemCompliance.validateSystemCompliance();
    
    const overallScore = Math.round(
      (tsReport.overallTypeScriptHealth * 0.60 +
       systemReport.overallCompliance * 0.40)
    );

    let complianceLevel: 'perfect' | 'excellent' | 'good' | 'needs_work';
    if (overallScore >= 100) complianceLevel = 'perfect';
    else if (overallScore >= 95) complianceLevel = 'excellent';
    else if (overallScore >= 85) complianceLevel = 'good';
    else complianceLevel = 'needs_work';

    return {
      isFullyCompliant: overallScore >= 98,
      overallScore,
      systemHealth: {
        typescript: tsReport.overallTypeScriptHealth,
        buildStatus: tsReport.buildStatus.hasErrors ? 'issues' : 'resolved',
        uiComponents: tsReport.validationResults.uiComponentsFixed ? 'fixed' : 'issues',
        masterHooks: tsReport.validationResults.masterHooksAligned ? 'aligned' : 'misaligned'
      },
      complianceLevel,
      lastUpdated: new Date().toISOString()
    };
  };

  const displayComplianceStatus = () => {
    const status = getMasterComplianceStatus();
    
    if (status.complianceLevel === 'perfect') {
      toastAlignment.showSuccess(
        "🎉 PERFECT Master Compliance",
        `Score: ${status.overallScore}%. Single source of truth achieved, TypeScript aligned, all systems verified.`
      );
    } else if (status.complianceLevel === 'excellent') {
      toastAlignment.showSuccess(
        "✅ Excellent Master Compliance",
        `Score: ${status.overallScore}%. Master consolidation active, systems aligned.`
      );
    } else {
      toastAlignment.showInfo(
        "Master Compliance Status",
        `Score: ${status.overallScore}%. Level: ${status.complianceLevel}. Continue optimization.`
      );
    }
    
    return status;
  };

  return {
    getMasterComplianceStatus,
    displayComplianceStatus,
    
    // Quick status checks
    isFullyCompliant: () => getMasterComplianceStatus().isFullyCompliant,
    getOverallScore: () => getMasterComplianceStatus().overallScore,
    getComplianceLevel: () => getMasterComplianceStatus().complianceLevel,
    
    // Meta information
    meta: {
      statusVersion: 'master-compliance-status-v1.0.0',
      monitoringActive: true,
      realTimeCompliance: true
    }
  };
};
