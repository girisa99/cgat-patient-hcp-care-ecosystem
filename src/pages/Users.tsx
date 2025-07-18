
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useUsers } from '@/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, UserCheck, UserMinus, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserManagement = () => {
  const { isAuthenticated } = useMasterAuth();
  const users = useUsers();

  if (!isAuthenticated) {
    return (
      <AppLayout title="User Management">
        <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
          <CardContent className="p-8 text-center">
            <p className="text-yellow-700">
              You need to be logged in to manage users.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const columns = [
    {
      key: 'first_name',
      header: 'First Name'
    },
    {
      key: 'last_name', 
      header: 'Last Name'
    },
    {
      key: 'email',
      header: 'Email',
      cell: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (value: string) => value || 'N/A'
    },
    {
      key: 'user_roles',
      header: 'Roles',
      cell: (value: any[], row: any) => {
        if (!value || value.length === 0) {
          return <Badge variant="secondary">No roles</Badge>;
        }
        return (
          <div className="flex gap-1 flex-wrap">
            {value.map((ur: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {ur.roles?.name || 'Unknown'}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  // Enhanced statistics for user management
  const userStats = () => {
    const stats = users.getStatistics();
    const items = Array.isArray(users.items) ? users.items : [];
    
    const isValidUser = (item: any): item is Record<string, any> => {
      return item != null && typeof item === 'object' && 'user_roles' in item;
    };
    
    const withRoles = items.filter(item => 
      isValidUser(item) && (item as any).user_roles && Array.isArray((item as any).user_roles) && (item as any).user_roles.length > 0
    ).length;
    const withoutRoles = items.filter(item => 
      isValidUser(item) && (!(item as any).user_roles || !Array.isArray((item as any).user_roles) || (item as any).user_roles.length === 0)
    ).length;
    
    return {
      total: stats.total,
      active: withRoles,
      inactive: withoutRoles
    };
  };

  const customActions = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <UserCheck className="h-4 w-4 text-green-600" />
        <span>{userStats().active} With Roles</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <UserMinus className="h-4 w-4 text-orange-600" />
        <span>{userStats().inactive} Pending</span>
      </div>
      <UsersIcon className="h-4 w-4" />
    </div>
  );

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* User Management with Template */}
        <ExtensibleModuleTemplate
          title="Users"
          description="Manage user accounts, roles, and onboarding workflow"
          items={users.items}
          isLoading={users.isLoading}
          error={users.error}
          searchItems={users.searchItems}
          createItem={undefined}
          updateItem={undefined}
          deleteItem={undefined}
          getStatistics={userStats}
          columns={columns}
          onRefresh={users.refetch}
          customActions={customActions}
          enableCreate={false}
          enableEdit={false}
          enableDelete={false}
        />

        {/* Additional User Management Features */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Users</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <UserMinus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Pending Role Assignment</h3>
                  <p>Users waiting for role assignment will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Bulk User Operations</h3>
                  <p>Perform bulk actions on multiple users simultaneously.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Onboarding Workflow</h3>
                  <p>Track and manage user onboarding progress.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserManagement;
