/**
 * Documentation Versioning Hook
 * Manages version control and 21 CFR Part 11 compliance tracking
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { documentationVersionControl, DocumentationVersion, FunctionalityChange } from '@/utils/automation/DocumentationVersionControl';

type UserRole = 'superAdmin' | 'healthcareProvider' | 'nurse' | 'caseManager' | 'onboardingTeam' | 'patientCaregiver' | 'financeTeam' | 'contractTeam' | 'workflowManager' | 'demoUser';

interface UseDocumentationVersioningOptions {
  role: UserRole;
  autoTrack?: boolean;
}

export const useDocumentationVersioning = (options: UseDocumentationVersioningOptions) => {
  const { role, autoTrack = true } = options;
  const { toast } = useToast();
  
  const [versions, setVersions] = useState<DocumentationVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<DocumentationVersion | null>(null);
  const [executionCount, setExecutionCount] = useState<number>(0);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [validationPending, setValidationPending] = useState(false);

  useEffect(() => {
    if (autoTrack) {
      loadVersionData();
    }
  }, [role, autoTrack]);

  const loadVersionData = async () => {
    try {
      await documentationVersionControl.loadVersionHistory();
      const roleVersions = documentationVersionControl.getVersionHistory(role);
      const current = documentationVersionControl.getCurrentVersion(role);
      const execCount = documentationVersionControl.getExecutionCount(role);
      
      setVersions(roleVersions);
      setCurrentVersion(current);
      setExecutionCount(execCount);
    } catch (error) {
      console.error('Failed to load version data:', error);
    }
  };

  const createNewVersion = async (
    functionalityChanges: FunctionalityChange[],
    userId: string = 'system'
  ): Promise<DocumentationVersion | null> => {
    setIsCreatingVersion(true);
    try {
      const newVersion = await documentationVersionControl.createNewVersion(
        role,
        functionalityChanges,
        userId
      );
      
      await loadVersionData();
      
      toast({
        title: "New Documentation Version Created",
        description: `Version ${newVersion.version} (Execution #${newVersion.execution_number}) for ${role}`,
      });
      
      return newVersion;
    } catch (error) {
      console.error('Failed to create version:', error);
      toast({
        title: "Version Creation Failed",
        description: "Failed to create new documentation version",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const validateCurrentVersion = async (validatorId: string, notes: string): Promise<boolean> => {
    if (!currentVersion) return false;
    
    setValidationPending(true);
    try {
      const success = await documentationVersionControl.validateVersion(
        currentVersion.id,
        validatorId,
        notes
      );
      
      if (success) {
        await loadVersionData();
        toast({
          title: "Version Validated",
          description: `Documentation version ${currentVersion.version} has been validated`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to validate version:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate documentation version",
        variant: "destructive"
      });
      return false;
    } finally {
      setValidationPending(false);
    }
  };

  const generateVersionReport = async (): Promise<string> => {
    try {
      return await documentationVersionControl.generateVersionReport(role);
    } catch (error) {
      console.error('Failed to generate report:', error);
      return `# Error generating report for ${role}`;
    }
  };

  const exportVersionHistory = async () => {
    try {
      const report = await generateVersionReport();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${role}_documentation_versions_${timestamp}.md`;
      
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Version History Exported",
        description: `Documentation version history exported for ${role}`,
      });
    } catch (error) {
      console.error('Failed to export version history:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export version history",
        variant: "destructive"
      });
    }
  };

  const getComplianceStatus = () => {
    if (!currentVersion) {
      return {
        cfr_compliant: false,
        compliance_score: 0,
        validation_status: 'No version available'
      };
    }

    return {
      cfr_compliant: currentVersion.cfr_compliance.part_11_compliant,
      compliance_score: currentVersion.validation_status.compliance_score,
      validation_status: currentVersion.validation_status.is_validated ? 'Validated' : 'Pending Validation'
    };
  };

  const getVersionStats = () => {
    return {
      total_versions: versions.length,
      current_version: currentVersion?.version || 'None',
      execution_number: currentVersion?.execution_number || 0,
      total_executions: executionCount,
      last_updated: currentVersion?.created_at ? new Date(currentVersion.created_at).toLocaleString() : 'Never',
      compliance_score: currentVersion?.validation_status.compliance_score || 0
    };
  };

  const trackFunctionalityChange = async (
    changeType: FunctionalityChange['change_type'],
    description: string,
    affectedModules: string[],
    impactLevel: FunctionalityChange['impact_level'] = 'medium'
  ) => {
    const change: FunctionalityChange = {
      change_id: `change_${Date.now()}`,
      change_type: changeType,
      description,
      impact_level: impactLevel,
      affected_modules: affectedModules,
      test_coverage_updated: true
    };

    await createNewVersion([change]);
  };

  const getCFRComplianceDetails = () => {
    if (!currentVersion) return null;
    
    return {
      checklist: currentVersion.cfr_compliance.compliance_checklist,
      audit_trail_complete: currentVersion.cfr_compliance.audit_trail_complete,
      electronic_signature_valid: currentVersion.cfr_compliance.electronic_signature_valid,
      data_integrity_verified: currentVersion.cfr_compliance.data_integrity_verified,
      access_controls_validated: currentVersion.cfr_compliance.access_controls_validated
    };
  };

  return {
    // Version data
    versions,
    currentVersion,
    executionCount,
    
    // Loading states
    isCreatingVersion,
    validationPending,
    
    // Actions
    createNewVersion,
    validateCurrentVersion,
    trackFunctionalityChange,
    generateVersionReport,
    exportVersionHistory,
    refreshVersionData: loadVersionData,
    
    // Computed values
    versionStats: getVersionStats(),
    complianceStatus: getComplianceStatus(),
    cfrComplianceDetails: getCFRComplianceDetails(),
    
    // Utilities
    hasVersions: versions.length > 0,
    isCompliant: currentVersion?.cfr_compliance.part_11_compliant || false,
    needsValidation: currentVersion && !currentVersion.validation_status.is_validated,
    
    // Meta
    meta: {
      role,
      auto_tracking: autoTrack,
      version_control_enabled: true,
      cfr_part_11_enabled: true
    }
  };
};

// Specialized hooks for different roles
export const useSuperAdminVersioning = () => {
  return useDocumentationVersioning({ role: 'superAdmin' });
};

export const useHealthcareProviderVersioning = () => {
  return useDocumentationVersioning({ role: 'healthcareProvider' });
};

export const useFinanceTeamVersioning = () => {
  return useDocumentationVersioning({ role: 'financeTeam' });
};