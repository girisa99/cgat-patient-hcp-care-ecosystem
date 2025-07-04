
/**
 * CLEAN USER MANAGEMENT TABLE - REDIRECTS TO COMPLETE VERSION
 * Maintains compatibility while using the complete functionality
 */
import React from 'react';
import { CompleteUserManagementTable } from './CompleteUserManagementTable';

export const CleanUserManagementTable: React.FC = () => {
  console.log('🔄 CleanUserManagementTable - Redirecting to CompleteUserManagementTable');
  
  return <CompleteUserManagementTable />;
};
