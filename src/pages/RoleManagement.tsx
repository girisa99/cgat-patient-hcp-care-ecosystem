
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useRoles } from '@/hooks/useRoles';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RoleManagement = () => {
  const { user: authUser, isAuthenticated } = useMasterAuth();
  const roles = useRoles();

  if (!isAuthenticated) {
    return (
      <AppLayout title="Role Management">
        <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
          <CardContent className="p-8 text-center">
            <p className="text-yellow-700">
              You need to be logged in to manage roles.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const columns = [
    {
      key: 'name',
      header: 'Role Name',
      cell: (value: string) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      cell: (value: string) => value || 'No description available'
    },
    {
      key: 'is_default',
      header: 'Default Role',
      cell: (value: boolean) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  // Enhanced statistics for role management
  const roleStats = () => {
    const stats = roles.getStatistics();
    const defaultRoles = roles.items.filter(item => item.is_default).length;
    const customRoles = roles.items.filter(item => !item.is_default).length;
    
    return {
      total: stats.total,
      active: defaultRoles,
      inactive: customRoles
    };
  };

  const customActions = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-green-600" />
        <span>{roleStats().active} Default Roles</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Settings className="h-4 w-4 text-blue-600" />
        <span>{roleStats().inactive} Custom Roles</span>
      </div>
      <Shield className="h-4 w-4" />
    </div>
  );

  return (
    <AppLayout title="Role Management">
      <div className="space-y-6">
        {/* Role Management with Template */}
        <ExtensibleModuleTemplate
          title="Roles"
          description="Manage system roles, permissions, and user assignments"
          items={roles.items}
          isLoading={roles.isLoading}
          error={roles.error}
          searchItems={roles.searchItems}
          createItem={undefined}
          updateItem={undefined}
          deleteItem={undefined}
          getStatistics={roleStats}
          columns={columns}
          onRefresh={roles.refetch}
          customActions={customActions}
          enableCreate={false}
          enableEdit={false}
          enableDelete={false}
        />

        {/* Additional Role Management Features */}
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">User Assignments</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">User Role Assignments</h3>
                  <p>Assign roles to users and manage access permissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Permission Management</h3>
                  <p>Configure role permissions and access controls.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Role Hierarchy</h3>
                  <p>Define role inheritance and hierarchical permissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RoleManagement;
