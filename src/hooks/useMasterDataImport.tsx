
/**
 * MASTER DATA IMPORT - COMPREHENSIVE DATA IMPORT SYSTEM
 * Enhanced data import with complete TypeScript alignment
 * Version: master-data-import-v2.1.0 - Fixed form state compatibility
 */
import { useState, useCallback } from 'react';
import { useMasterUserManagement } from './useMasterUserManagement';
import { useMasterToast } from './useMasterToast';
import type { MasterUserFormState } from '@/types/masterFormState';
import { normalizeMasterUserFormState } from '@/types/masterFormState';

export interface ImportStats {
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  skippedRecords: number;
}

export const useMasterDataImport = () => {
  const { createUser } = useMasterUserManagement();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats>({
    totalRecords: 0,
    successfulImports: 0,
    failedImports: 0,
    skippedRecords: 0
  });

  console.log('🎯 Master Data Import v2.1 - Complete TypeScript Alignment');

  const importUsersFromCSV = useCallback(async (csvData: string) => {
    setIsImporting(true);
    showInfo('Import Started', 'Processing CSV data...');
    
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const stats: ImportStats = {
        totalRecords: lines.length - 1,
        successfulImports: 0,
        failedImports: 0,
        skippedRecords: 0
      };

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          stats.skippedRecords++;
          continue;
        }
        
        const userData: Record<string, any> = {};
        headers.forEach((header, index) => {
          userData[header] = values[index];
        });

        try {
          // Create properly normalized user form state
          const userFormState: MasterUserFormState = normalizeMasterUserFormState({
            firstName: userData.first_name || userData.firstName || '',
            lastName: userData.last_name || userData.lastName || '',
            email: userData.email || '',
            role: userData.role || 'user',
            phone: userData.phone || '',
            isActive: userData.is_active !== 'false'
          });

          await createUser(userFormState);
          stats.successfulImports++;
        } catch (error) {
          console.error('Failed to import user:', error);
          stats.failedImports++;
        }
      }

      setImportStats(stats);
      showSuccess(
        'Import Complete',
        `Successfully imported ${stats.successfulImports} out of ${stats.totalRecords} records`
      );
    } catch (error) {
      showError('Import Failed', 'Failed to process CSV data');
    } finally {
      setIsImporting(false);
    }
  }, [createUser, showSuccess, showError, showInfo]);

  const importUsersFromJSON = useCallback(async (jsonData: any[]) => {
    setIsImporting(true);
    showInfo('Import Started', 'Processing JSON data...');
    
    try {
      const stats: ImportStats = {
        totalRecords: jsonData.length,
        successfulImports: 0,
        failedImports: 0,
        skippedRecords: 0
      };

      for (const userData of jsonData) {
        if (!userData.email || !userData.first_name || !userData.last_name) {
          stats.skippedRecords++;
          continue;
        }

        try {
          const userFormState: MasterUserFormState = normalizeMasterUserFormState({
            firstName: userData.first_name || userData.firstName || '',
            lastName: userData.last_name || userData.lastName || '',
            email: userData.email || '',
            role: userData.role || 'user',
            phone: userData.phone || '',
            isActive: userData.is_active !== false
          });

          await createUser(userFormState);
          stats.successfulImports++;
        } catch (error) {
          console.error('Failed to import user:', error);
          stats.failedImports++;
        }
      }

      setImportStats(stats);
      showSuccess(
        'Import Complete',
        `Successfully imported ${stats.successfulImports} out of ${stats.totalRecords} records`
      );
    } catch (error) {
      showError('Import Failed', 'Failed to process JSON data');
    } finally {
      setIsImporting(false);
    }
  }, [createUser, showSuccess, showError, showInfo]);

  const validateImportData = useCallback((data: any[]) => {
    const requiredFields = ['email', 'first_name', 'last_name'];
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    data.forEach((record, index) => {
      requiredFields.forEach(field => {
        if (!record[field]) {
          validation.errors.push(`Row ${index + 1}: Missing required field '${field}'`);
          validation.isValid = false;
        }
      });
    });

    return validation;
  }, []);

  return {
    // Import methods
    importUsersFromCSV,
    importUsersFromJSON,
    validateImportData,
    
    // State
    isImporting,
    importStats,
    
    // Utilities
    resetStats: () => setImportStats({
      totalRecords: 0,
      successfulImports: 0,
      failedImports: 0,
      skippedRecords: 0
    }),
    
    meta: {
      importVersion: 'master-data-import-v2.1.0',
      singleSourceValidated: true,
      typeScriptAligned: true,
      formStateFixed: true
    }
  };
};
