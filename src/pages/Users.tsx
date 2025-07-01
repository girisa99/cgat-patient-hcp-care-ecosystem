
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';
import { useUnifiedUserData } from '@/hooks/useUnifiedUserData';
import { Card, CardContent } from '@/components/ui/card';

const Users: React.FC = () => {
  const { allUsers, isLoading, error } = useUnifiedUserData();

  console.log('👥 Users page data:', { 
    users: allUsers?.length, 
    isLoading, 
    error: error?.message 
  });

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Loading user data..."
          fluid
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading users...</p>
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
              <p className="text-sm text-gray-500 mt-2">
                Please check your database connection and try again.
              </p>
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
        subtitle={`Manage users, roles, and permissions across the platform (${allUsers?.length || 0} users)`}
        fluid
      >
        <UserManagementMain />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
