
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';
import { useUserManagementPage } from '@/hooks/useUserManagementPage';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Users Page - LOCKED IMPLEMENTATION
 * Uses dedicated useUserManagementPage hook for consistent data access
 * DO NOT MODIFY - This page is locked for stability
 */
const Users: React.FC = () => {
  const { users, isLoading, error, meta } = useUserManagementPage();

  console.log('🔒 Users Page - LOCKED VERSION active with hook version:', meta.hookVersion);

  if (isLoading) {
    return (
      <UnifiedDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Loading unified user management system...</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading users from unified data source...</p>
            </CardContent>
          </Card>
        </div>
      </UnifiedDashboardLayout>
    );
  }

  if (error) {
    return (
      <UnifiedDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Error loading user data</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <p>Error loading users: {error.message}</p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
                <h4 className="font-semibold text-yellow-800">System Info:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Source: {meta.dataSource}
                </p>
                <p className="text-sm text-yellow-700">
                  Version: {meta.hookVersion} - Locked user management system
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </UnifiedDashboardLayout>
    );
  }

  return (
    <UnifiedDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Unified user management system ({users?.length || 0} users)
          </p>
        </div>

        {/* LOCKED STATUS INDICATOR */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-900">🔒 User Management Locked & Stable</h3>
          </div>
          <p className="text-sm text-green-700">
            Data from {meta.dataSource} | Total: {meta.totalUsers} | Patients: {meta.patientCount} | Staff: {meta.staffCount} | Admins: {meta.adminCount}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Hook Version: {meta.hookVersion} | Single Source Validated: {meta.singleSourceValidated ? '✅' : '❌'}
          </p>
        </div>

        <UserManagementMain />
      </div>
    </UnifiedDashboardLayout>
  );
};

export default Users;
