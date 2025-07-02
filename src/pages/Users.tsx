
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
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
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Loading unified user management system..."
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading users from unified data source...</p>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Error loading user data"
        >
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
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle={`Unified user management system (${users?.length || 0} users)`}
        fluid
      >
        {/* LOCKED STATUS INDICATOR */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
