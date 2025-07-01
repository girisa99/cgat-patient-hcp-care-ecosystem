
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';
import { useUnifiedUserData } from '@/hooks/useUnifiedUserData';
import { Card, CardContent } from '@/components/ui/card';

const Users: React.FC = () => {
  const { allUsers, isLoading, error, meta } = useUnifiedUserData();

  console.log('👥 Users page data:', { 
    users: allUsers?.length, 
    isLoading, 
    error: error?.message,
    meta: meta
  });

  // Add detailed logging for debugging
  React.useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      console.log('📊 Detailed user breakdown:', {
        totalUsers: allUsers.length,
        usersWithRoles: allUsers.filter(u => u.user_roles && u.user_roles.length > 0).length,
        usersWithFacilities: allUsers.filter(u => u.facilities).length,
        patients: meta.patientCount,
        staff: meta.staffCount,
        admins: meta.adminCount,
        sampleUser: allUsers[0] ? {
          id: allUsers[0].id,
          email: allUsers[0].email,
          name: `${allUsers[0].first_name} ${allUsers[0].last_name}`.trim(),
          roles: allUsers[0].user_roles?.length || 0,
          facility: allUsers[0].facilities?.name || 'None'
        } : null
      });
    }
  }, [allUsers, meta]);

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Users"
          subtitle="Loading user data from auth.users..."
          fluid
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading users from authentication system...</p>
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
                This may indicate an issue with the edge function or database connection.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
                <h4 className="font-semibold text-yellow-800">Debugging Info:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Data source: {meta.dataSource}
                </p>
                <p className="text-sm text-yellow-700">
                  Expected: 14 users, 2 patients, 3 facilities
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
        subtitle={`Manage users, roles, and permissions across the platform (${allUsers?.length || 0} users found from auth.users)`}
        fluid
      >
        {/* Data Source Indicator */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-800 font-medium">
              Data Source: {meta.dataSource}
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            Found: {allUsers?.length || 0} total users • {meta.patientCount} patients • {meta.staffCount} staff • {meta.adminCount} admins
          </div>
        </div>

        <UserManagementMain />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
