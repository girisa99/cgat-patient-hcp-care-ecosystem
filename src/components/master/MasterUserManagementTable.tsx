
import React from 'react';
import { MasterUserTable } from '@/components/users/MasterUserTable';

/**
 * MASTER USER MANAGEMENT TABLE - REFACTORED FOR SMALLER COMPONENTS
 * Now uses focused, smaller components following master consolidation principles
 * Version: master-user-management-table-v3.0.0
 */
export const MasterUserManagementTable: React.FC = () => {
  console.log('🔧 MasterUserManagementTable - Using refactored smaller components');
  
  return <MasterUserTable />;
};
