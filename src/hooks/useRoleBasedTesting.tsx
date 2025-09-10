/**
 * Role-Based Testing Hook
 * Manages role-specific testing suites and documentation
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RoleBasedTestingManager } from '@/utils/automation/RoleBasedTestingManager';

// Define UserRole locally since not exported from types
type UserRole = 'superAdmin' | 'healthcareProvider' | 'nurse' | 'caseManager' | 'onboardingTeam' | 'patientCaregiver' | 'financeTeam' | 'contractTeam' | 'workflowManager' | 'demoUser';

interface RoleTestingUpdate {
  role: UserRole;
  updated_tests: any[];
  updated_documentation: any[];
  architecture_changes: any[];
  requirements_changes: any[];
}

interface UseRoleBasedTestingOptions {
  role: UserRole;
  autoUpdate?: boolean;
  enableNotifications?: boolean;
}

export const useRoleBasedTesting = (options: UseRoleBasedTestingOptions) => {
  const { role, autoUpdate = true, enableNotifications = true } = options;
  const { toast } = useToast();
  
  const [testingSuite, setTestingSuite] = useState<RoleTestingUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (autoUpdate) {
      loadRoleTestingSuite();
      
      // Subscribe to real-time updates
      const unsubscribe = RoleBasedTestingManager.subscribeToRoleTestingUpdates(
        role,
        handleTestingUpdate
      );

      return unsubscribe;
    }
  }, [role, autoUpdate]);

  const loadRoleTestingSuite = async () => {
    setIsLoading(true);
    try {
      const suite = await RoleBasedTestingManager.generateRoleTestingSuite(role);
      setTestingSuite(suite);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Failed to load role testing suite:', error);
      if (enableNotifications) {
        toast({
          title: "Testing Suite Error",
          description: "Failed to load role-specific testing suite",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestingUpdate = (update: RoleTestingUpdate) => {
    setTestingSuite(update);
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);

    if (enableNotifications) {
      toast({
        title: `Testing Suite Updated`,
        description: `${update.updated_tests.length} test cases and ${update.updated_documentation.length} documents updated for ${role}`,
      });
    }
  };

  const exportTestingArtifacts = async () => {
    try {
      const artifacts = await RoleBasedTestingManager.exportRoleTestingArtifacts(role);
      
      // Create downloadable files
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `${role}_testing_suite_${timestamp}`;
      
      // Create a ZIP-like structure (simplified for demo)
      const artifactData = {
        role,
        timestamp,
        tests: JSON.parse(artifacts.tests),
        documentation: JSON.parse(artifacts.documentation),
        architecture: JSON.parse(artifacts.architecture),
        requirements: JSON.parse(artifacts.requirements)
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(artifactData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (enableNotifications) {
        toast({
          title: "Export Complete",
          description: `Testing artifacts exported for ${role}`,
        });
      }
    } catch (error) {
      console.error('❌ Failed to export testing artifacts:', error);
      if (enableNotifications) {
        toast({
          title: "Export Failed",
          description: "Failed to export testing artifacts",
          variant: "destructive"
        });
      }
    }
  };

  const refreshTestingSuite = async () => {
    await loadRoleTestingSuite();
  };

  const getTestingStats = () => {
    if (!testingSuite) return null;

    return {
      total_tests: testingSuite.updated_tests.length,
      total_docs: testingSuite.updated_documentation.length,
      architecture_docs: testingSuite.architecture_changes.length,
      requirements_docs: testingSuite.requirements_changes.length,
      last_update: lastUpdate,
      update_count: updateCount
    };
  };

  const getAvailableTestTypes = () => {
    if (!testingSuite) return [];
    
    return [...new Set(testingSuite.updated_tests.map((test: any) => test.type))];
  };

  const getDocumentationByType = (docType: string) => {
    if (!testingSuite) return [];
    
    return testingSuite.updated_documentation.filter(
      (doc: any) => doc.type === docType
    );
  };

  const getArchitectureByLevel = (level: string) => {
    if (!testingSuite) return [];
    
    return testingSuite.architecture_changes.filter(
      (arch: any) => arch.level === level
    );
  };

  return {
    // Core data
    testingSuite,
    isLoading,
    lastUpdate,
    updateCount,
    
    // Actions
    loadRoleTestingSuite,
    refreshTestingSuite,
    exportTestingArtifacts,
    
    // Utility functions
    getTestingStats,
    getAvailableTestTypes,
    getDocumentationByType,
    getArchitectureByLevel,
    
    // Computed values
    hasTestingSuite: !!testingSuite,
    stats: getTestingStats(),
    
    // Meta information
    meta: {
      role,
      auto_update: autoUpdate,
      notifications_enabled: enableNotifications,
      last_loaded: lastUpdate?.toISOString() || null,
      total_updates: updateCount
    }
  };
};

// Specialized hooks for different roles
export const useSuperAdminTesting = () => {
  return useRoleBasedTesting({ 
    role: 'superAdmin',
    autoUpdate: true,
    enableNotifications: true 
  });
};

export const useHealthcareProviderTesting = () => {
  return useRoleBasedTesting({ 
    role: 'healthcareProvider',
    autoUpdate: true,
    enableNotifications: true 
  });
};

export const useWorkflowManagerTesting = () => {
  return useRoleBasedTesting({ 
    role: 'workflowManager',
    autoUpdate: true,
    enableNotifications: true 
  });
};