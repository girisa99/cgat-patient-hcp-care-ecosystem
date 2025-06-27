
/**
 * System Assessment Hook
 * Provides easy access to system assessment data and reporting
 */

import { useQuery } from '@tanstack/react-query';
import { assessmentReporter, AssessmentReport } from '@/utils/assessment/AssessmentReporter';
import { useToast } from '@/hooks/use-toast';

export const useSystemAssessment = () => {
  const { toast } = useToast();

  const {
    data: assessmentReport,
    isLoading: isLoadingAssessment,
    error: assessmentError,
    refetch: refetchAssessment
  } = useQuery({
    queryKey: ['system-assessment'],
    queryFn: async (): Promise<AssessmentReport> => {
      console.log('🔍 Running comprehensive system assessment...');
      
      try {
        const report = await assessmentReporter.generateAssessmentReport();
        console.log('✅ System assessment completed successfully');
        return report;
      } catch (error) {
        console.error('❌ System assessment failed:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: 2,
    retryDelay: 2000
  });

  const generateCleanupScript = () => {
    try {
      const script = assessmentReporter.generateCleanupScript();
      const scriptContent = script.join('\n');
      
      // Create downloadable script file
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'system-cleanup-script.sh';
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Cleanup Script Generated",
        description: "System cleanup script has been downloaded successfully.",
      });
    } catch (error) {
      console.error('❌ Error generating cleanup script:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cleanup script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateMigrationPlan = () => {
    try {
      const migrations = assessmentReporter.generateMigrationRecommendations();
      const migrationContent = `
# System Migration Plan

## Database Migrations
${migrations.databaseMigrations.map(m => `- ${m}`).join('\n')}

## Code Refactoring
${migrations.codeRefactoring.map(r => `- ${r}`).join('\n')}

## Configuration Changes
${migrations.configurationChanges.map(c => `- ${c}`).join('\n')}
      `.trim();
      
      // Create downloadable migration plan
      const blob = new Blob([migrationContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'migration-plan.md';
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Migration Plan Generated",
        description: "System migration plan has been downloaded successfully.",
      });
    } catch (error) {
      console.error('❌ Error generating migration plan:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate migration plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    // Assessment data
    assessmentReport,
    isLoadingAssessment,
    assessmentError,
    
    // Actions
    refetchAssessment,
    generateCleanupScript,
    generateMigrationPlan,
    
    // Computed values
    hasCriticalFindings: assessmentReport?.criticalFindings.length > 0,
    totalTablesReviewed: assessmentReport?.detailedFindings.tableUtilization.essentialTables.length || 0,
    unnecessaryTablesCount: assessmentReport?.detailedFindings.tableUtilization.unnecessaryTables.length || 0,
    emptyTablesCount: assessmentReport?.detailedFindings.tableUtilization.emptyTables.length || 0
  };
};
