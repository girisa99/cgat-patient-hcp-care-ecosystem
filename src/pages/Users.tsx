
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import { Card, CardContent } from '@/components/ui/card';

const Users: React.FC = () => {
  const { allUsers, isLoading, error, meta } = useConsolidatedUsers();

  console.log('👥 Users page data:', { 
    users: allUsers?.length, 
    isLoading, 
    error: error?.message,
    meta: meta
  });

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Loading consolidated user data..."
          fluid
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading users from consolidated data source...</p>
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
          fluid
        >
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <p>Error loading users: {error.message}</p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
                <h4 className="font-semibold text-yellow-800">Data Source Info:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Source: {meta.dataSource}
                </p>
                <p className="text-sm text-yellow-700">
                  This is the consolidated user management system.
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
        subtitle={`Consolidated user management system (${allUsers?.length || 0} users)`}
        fluid
      >
        <UserManagementMain />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
