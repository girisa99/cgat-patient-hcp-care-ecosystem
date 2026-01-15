/**
 * Governance Validation Hook
 * Provides real-time validation of Command Center data consistency
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  getGovernanceSummary, 
  validateGovernanceData, 
  masterScenarioCounts,
  masterInfrastructureCounts,
  masterFinancialMetrics,
  masterGartnerPosition,
  governanceMetadata,
  updateChecklist,
  recentAuditLog,
  type ValidationResult,
  type AuditEntry,
} from '@/components/diagrams/genie-command-center/data/governance-data';

export interface GovernanceState {
  isValid: boolean;
  lastValidated: string | null;
  validationResult: ValidationResult | null;
}

export interface GovernanceMetrics {
  scenarios: {
    total: number;
    implemented: number;
    percentage: number;
    displayString: string;
  };
  infrastructure: typeof masterInfrastructureCounts;
  financials: typeof masterFinancialMetrics;
  gartner: typeof masterGartnerPosition;
}

export const useGovernanceValidation = () => {
  const [state, setState] = useState<GovernanceState>({
    isValid: true,
    lastValidated: null,
    validationResult: null,
  });

  // Run validation
  const runValidation = useCallback(() => {
    const result = validateGovernanceData();
    setState({
      isValid: result.isValid,
      lastValidated: new Date().toISOString(),
      validationResult: result,
    });
    return result;
  }, []);

  // Get current metrics (computed from single source)
  const total = masterScenarioCounts.totalScenarios;
  const implemented = masterScenarioCounts.implementedScenarios;
  const percentage = masterScenarioCounts.completionPercentage;
  
  const metrics: GovernanceMetrics = useMemo(() => ({
    scenarios: {
      total,
      implemented,
      percentage,
      displayString: `${implemented}/${total} (${percentage}%)`,
    },
    infrastructure: masterInfrastructureCounts,
    financials: masterFinancialMetrics,
    gartner: masterGartnerPosition,
  }), [total, implemented, percentage]);

  // Get phase-specific data
  const getPhaseData = useCallback((phaseId: string) => {
    const phase = masterScenarioCounts.phases[phaseId as keyof typeof masterScenarioCounts.phases];
    if (!phase) return null;
    return {
      ...phase,
      percentage: phase.total > 0 ? Math.round((phase.implemented / phase.total) * 100) : 0,
    };
  }, []);

  // Get completed phases list
  const completedPhases = useMemo(() => 
    Object.entries(masterScenarioCounts.phases)
      .filter(([_, p]) => p.status === 'completed')
      .map(([key]) => key),
  []);

  // Get pending phases list
  const pendingPhases = useMemo(() => 
    Object.entries(masterScenarioCounts.phases)
      .filter(([_, p]) => p.status === 'planned')
      .map(([key]) => key),
  []);

  // Get full summary for dashboards
  const getSummary = useCallback(() => getGovernanceSummary(), []);

  // Get metadata
  const metadata = governanceMetadata;

  // Get update checklist
  const getUpdateChecklist = useCallback(() => updateChecklist, []);

  // Get recent audit log
  const getAuditLog = useCallback((): AuditEntry[] => recentAuditLog, []);

  return {
    // State
    state,
    
    // Actions
    runValidation,
    getSummary,
    getPhaseData,
    getUpdateChecklist,
    getAuditLog,
    
    // Computed values
    metrics,
    metadata,
    completedPhases,
    pendingPhases,
    
    // Quick access to common values
    totalScenarios: masterScenarioCounts.totalScenarios,
    implementedScenarios: masterScenarioCounts.implementedScenarios,
    completionPercentage: masterScenarioCounts.completionPercentage,
  };
};

export default useGovernanceValidation;
