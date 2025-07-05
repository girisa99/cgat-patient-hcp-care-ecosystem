
/**
 * MASTER DATA CONSOLIDATION VALIDATOR
 * Validates that all components use the single master data source
 */
import { useMasterUserManagement } from './useMasterUserManagement';
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

export const useMasterDataConsolidationValidator = () => {
  const masterUserMgmt = useMasterUserManagement();
  const masterData = useMasterData();
  const masterAuth = useMasterAuth();

  console.log('🔍 Master Data Consolidation Validator - Checking consistency');

  // Validation checks
  const validationResults = {
    userDataConsistency: {
      masterDataUsers: masterData.users.length,
      userMgmtUsers: masterUserMgmt.users.length,
      isConsistent: masterData.users.length === masterUserMgmt.users.length
    },
    authenticationAlignment: {
      masterAuthRoles: masterAuth.userRoles.length,
      isAuthenticated: masterAuth.isAuthenticated,
      hasValidAuth: masterAuth.isAuthenticated && masterAuth.userRoles.length > 0
    },
    singleSourceCompliance: {
      masterDataVersion: masterData.meta.version,
      userMgmtVersion: masterUserMgmt.meta.version,
      areVersionsAligned: masterData.meta.version === masterUserMgmt.meta.version
    }
  };

  // Overall health score
  const healthScore = Object.values(validationResults).reduce((score, validation: any) => {
    const validationScore = Object.values(validation).filter((v: any) => 
      typeof v === 'boolean' ? v : typeof v === 'number' ? v > 0 : true
    ).length;
    return score + validationScore;
  }, 0);

  return {
    validationResults,
    healthScore,
    isHealthy: healthScore > 8,
    recommendations: healthScore < 8 ? [
      'Ensure all components use the master data source',
      'Verify authentication consistency',
      'Check version alignment across hooks'
    ] : [],
    
    // Exposed for testing but marked as internal
    _internal: {
      masterData,
      masterUserMgmt,
      masterAuth
    }
  };
};
