
/**
 * Consolidation Utils - Main Export
 */

export { CodebaseConsolidator, type ConsolidationAnalysis } from './CodebaseConsolidator';
export { DeadCodeEliminator, type DeadCodeAnalysis } from './DeadCodeEliminator';
export { SingleSourceEnforcer, type SingleSourceValidation } from './SingleSourceEnforcer';

// Main consolidation function
export const performComprehensiveConsolidation = async () => {
  console.log('🚀 Starting comprehensive codebase consolidation...');
  
  const codebaseAnalysis = await CodebaseConsolidator.analyzeCodebase();
  const deadCodeAnalysis = DeadCodeEliminator.analyzeDeadCode();
  const singleSourceValidation = SingleSourceEnforcer.validateSingleSource();
  
  const report = {
    timestamp: new Date().toISOString(),
    codebaseAnalysis,
    deadCodeAnalysis,
    singleSourceValidation,
    summary: {
      totalViolations: singleSourceValidation.violations.length,
      compliantSystems: singleSourceValidation.compliantSystems.length,
      deadCodeItems: deadCodeAnalysis.unusedFiles.length + deadCodeAnalysis.unusedFunctions.length,
      duplicatesFound: Object.values(codebaseAnalysis.duplicates).reduce((sum, arr) => sum + arr.length, 0)
    }
  };
  
  console.log('📊 Consolidation Analysis Complete:', report.summary);
  return report;
};
