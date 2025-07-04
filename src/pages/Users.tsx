
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompleteUserManagementTable } from '@/components/users/CompleteUserManagementTable';
import { UserManagementMetrics } from '@/components/users/UserManagementMetrics';
import { BulkOperationsTab } from '@/components/users/BulkOperationsTab';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

const Users: React.FC = () => {
  console.log('👥 Users Page - Complete with Metrics and Bulk Operations');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const userManagement = useMasterUserManagement();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  if (!hasAccess('/users')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access User Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(userManagement.users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAssignRole = (roleId: string) => {
    console.log('🔄 Bulk assigning role:', roleId, 'to users:', selectedUsers);
    // Implement bulk role assignment
  };

  const handleBulkAssignFacility = (facilityId: string) => {
    console.log('🔄 Bulk assigning facility:', facilityId, 'to users:', selectedUsers);
    // Implement bulk facility assignment
  };

  const handleBulkDeactivate = () => {
    console.log('🔄 Bulk deactivating users:', selectedUsers);
    // Implement bulk deactivation
  };

  const handleBulkDelete = () => {
    console.log('🔄 Bulk deleting users:', selectedUsers);
    // Implement bulk deletion
  };

  const handleBulkEmail = () => {
    console.log('📧 Sending bulk email to users:', selectedUsers);
    // Implement bulk email
  };

  const handleExportUsers = () => {
    console.log('📤 Exporting users');
    // Implement user export
  };

  const handleImportUsers = () => {
    console.log('📥 Importing users');
    // Implement user import
  };

  const userStats = userManagement.getUserStats();

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Complete user management with metrics and bulk operations
            </p>
          </div>
        </div>

        {/* Metrics */}
        <UserManagementMetrics
          totalUsers={userStats.totalUsers}
          activeUsers={userStats.activeUsers}
          inactiveUsers={userStats.inactiveUsers}
          patientCount={userStats.patientCount}
          staffCount={userStats.staffCount}
          adminCount={userStats.adminCount}
        />

        {/* Main Content with Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <CompleteUserManagementTable />
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
                <UserManagementMetrics
                  totalUsers={userStats.totalUsers}
                  activeUsers={userStats.activeUsers}
                  inactiveUsers={userStats.inactiveUsers}
                  patientCount={userStats.patientCount}
                  staffCount={userStats.staffCount}
                  adminCount={userStats.adminCount}
                />
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">User Activity</h4>
                      <p className="text-sm text-muted-foreground">
                        Active users represent {((userStats.activeUsers/userStats.totalUsers) * 100).toFixed(1)}% of total users
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Role Distribution</h4>
                      <p className="text-sm text-muted-foreground">
                        Patients: {userStats.patientCount}, Staff: {userStats.staffCount}, Admins: {userStats.adminCount}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <BulkOperationsTab
              selectedUsers={selectedUsers}
              onSelectAll={handleSelectAll}
              onBulkAssignRole={handleBulkAssignRole}
              onBulkAssignFacility={handleBulkAssignFacility}
              onBulkDeactivate={handleBulkDeactivate}
              onBulkDelete={handleBulkDelete}
              onBulkEmail={handleBulkEmail}
              onExportUsers={handleExportUsers}
              onImportUsers={handleImportUsers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Users;
