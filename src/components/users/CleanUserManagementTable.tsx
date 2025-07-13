
/**
 * CLEAN USER MANAGEMENT TABLE - REDIRECTS TO MASTER VERSION
 * Maintains compatibility while using the consolidated master functionality
 */
import React from 'react';
import { MasterUserManagementTable } from '@/components/master/MasterUserManagementTable';

export const CleanUserManagementTable: React.FC = () => {
  console.log('🔄 CleanUserManagementTable - Redirecting to MasterUserManagementTable');
  
  return <MasterUserManagementTable />;
};
