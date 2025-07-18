/**
 * Roles Hook - Restored Full Functionality
 * Uses the original master data functionality
 */

import { useMasterData } from './useMasterData';

export const useRoles = () => {
  const masterData = useMasterData(true);
  
  const searchItems = (query: string) => {
    if (!query.trim()) return masterData.roles;
    return masterData.roles.filter((role: any) => 
      role.name?.toLowerCase().includes(query.toLowerCase()) ||
      role.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getStatistics = () => {
    return {
      total: masterData.roles.length,
      active: masterData.roles.filter((role: any) => role.is_default).length,
      inactive: masterData.roles.filter((role: any) => !role.is_default).length
    };
  };

  return {
    items: masterData.roles,
    isLoading: masterData.isLoading,
    error: masterData.error,
    refetch: masterData.refreshData,
    searchItems,
    getStatistics,
    meta: {
      hookName: 'useRoles',
      version: 'restored-v1.0.0',
      dataSource: 'master-data'
    }
  };
};