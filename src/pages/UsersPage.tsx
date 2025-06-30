
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import CompactUserManagement from '@/components/users/CompactUserManagement';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const UsersPage: React.FC = () => {
  const { users, isLoading, refetch } = useUsers();

  // Calculate real stats from users data
  const stats = {
    totalUsers: users?.length || 0,
    usersWithRoles: users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0,
    activeUsers: users?.filter(u => u.is_active !== false).length || 0,
    usersWithFacilities: users?.filter(u => u.facilities && u.facilities.length > 0).length || 0
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Manage user accounts and permissions"
        >
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle="Manage user accounts and permissions"
        headerActions={
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      >
        <CompactUserManagement 
          stats={stats}
          onCreateUser={() => {}}
          onAssignRole={() => {}}
          onAssignFacility={() => {}}
          onEditUser={() => {}}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default UsersPage;
