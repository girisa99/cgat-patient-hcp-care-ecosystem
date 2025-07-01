
import React from 'react';
import { ConsolidatedUserManagement } from './ConsolidatedUserManagement';

/**
 * Main User Management Component
 * Entry point for all user management functionality
 * Now uses unified system - single source of truth
 */
export const UserManagementMain: React.FC = () => {
  return <ConsolidatedUserManagement />;
};
