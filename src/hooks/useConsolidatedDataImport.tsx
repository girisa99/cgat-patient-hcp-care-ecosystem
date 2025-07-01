
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedUserManagement } from './useUnifiedUserManagement';
import { useFacilities } from './useFacilities';

/**
 * Consolidated Data Import Hook - Single Source of Truth
 * Handles all data import operations using the unified architecture
 */
export const useConsolidatedDataImport = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // Use consolidated hooks for data operations
  const { createUser, refetch: refetchUsers } = useUnifiedUserManagement();
  const { createFacility, refetch: refetchFacilities } = useFacilities();

  const importUsers = async (userData: any[]) => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      for (let i = 0; i < userData.length; i++) {
        const user = userData[i];
        await createUser({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          department: user.department,
          role: user.role || 'user',
          facility_id: user.facility_id
        });
        
        setImportProgress(Math.round(((i + 1) / userData.length) * 100));
      }
      
      await refetchUsers();
      
      toast({
        title: "Users Imported Successfully",
        description: `${userData.length} users have been imported.`,
      });
      
      return { success: true, count: userData.length };
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const importFacilities = async (facilityData: any[]) => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      for (let i = 0; i < facilityData.length; i++) {
        const facility = facilityData[i];
        await createFacility({
          name: facility.name,
          facility_type: facility.facility_type,
          address: facility.address,
          phone: facility.phone,
          email: facility.email
        });
        
        setImportProgress(Math.round(((i + 1) / facilityData.length) * 100));
      }
      
      await refetchFacilities();
      
      toast({
        title: "Facilities Imported Successfully",
        description: `${facilityData.length} facilities have been imported.`,
      });
      
      return { success: true, count: facilityData.length };
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const importFromAPI = async (endpoint: string, dataType: 'users' | 'facilities') => {
    setIsImporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('data-loader', {
        body: { 
          action: 'import_from_api',
          endpoint,
          data_type: dataType
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Import failed');

      toast({
        title: "API Import Successful",
        description: `Data imported from ${endpoint}`,
      });

      // Refresh the appropriate data
      if (dataType === 'users') {
        await refetchUsers();
      } else if (dataType === 'facilities') {
        await refetchFacilities();
      }

      return { success: true, data: data.data };
    } catch (error: any) {
      toast({
        title: "API Import Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  };

  const validateData = (data: any[], type: 'users' | 'facilities') => {
    const errors = [];
    
    if (type === 'users') {
      data.forEach((item, index) => {
        if (!item.email) errors.push(`Row ${index + 1}: Email is required`);
        if (!item.first_name) errors.push(`Row ${index + 1}: First name is required`);
      });
    } else if (type === 'facilities') {
      data.forEach((item, index) => {
        if (!item.name) errors.push(`Row ${index + 1}: Facility name is required`);
        if (!item.facility_type) errors.push(`Row ${index + 1}: Facility type is required`);
      });
    }
    
    return errors;
  };

  return {
    // Import functions
    importUsers,
    importFacilities,
    importFromAPI,
    
    // Utility functions
    parseCSV,
    validateData,
    
    // State
    isImporting,
    importProgress,
    
    // Meta information
    meta: {
      dataSource: 'Consolidated import using unified hooks',
      version: 'consolidated-import-v1',
      supportedTypes: ['users', 'facilities'],
      supportedFormats: ['CSV', 'JSON', 'API']
    }
  };
};
