
import React from 'react';
import { RealDataUserTable } from '@/components/users/RealDataUserTable';

/**
 * MASTER USER MANAGEMENT TABLE - REAL DATA ONLY
 * Uses consolidated real data components following architecture principles
 * Version: master-user-management-table-v4.0.0
 */
export const MasterUserManagementTable: React.FC = () => {
  console.log('🔧 MasterUserManagementTable - Real data integration active');
  
  return <RealDataUserTable />;
};
