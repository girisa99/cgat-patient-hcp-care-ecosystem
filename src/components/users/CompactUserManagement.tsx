
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Filter, MoreHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UsersList from './UsersList';
import BulkRoleAssignment from './BulkRoleAssignment';

interface CompactUserManagementProps {
  stats: {
    totalUsers: number;
    usersWithRoles: number;
    activeUsers: number;
    usersWithFacilities: number;
  };
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: any) => void;
  onManagePermissions?: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

const CompactUserManagement: React.FC<CompactUserManagementProps> = ({
  stats,
  onCreateUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onEditUser,
  onManagePermissions,
  onAssignModule,
  onResendVerification,
  onDeactivateUser,
  onViewModules
}) => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Users className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-lg font-semibold text-blue-900">{stats.totalUsers}</div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Badge className="h-4 w-4 bg-green-600" />
          <div>
            <div className="text-lg font-semibold text-green-900">{stats.usersWithRoles}</div>
            <div className="text-xs text-green-700">With Roles</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
          <div className="h-4 w-4 bg-purple-600 rounded" />
          <div>
            <div className="text-lg font-semibold text-purple-900">{stats.activeUsers}</div>
            <div className="text-xs text-purple-700">Active</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
          <div className="h-4 w-4 bg-orange-600 rounded" />
          <div>
            <div className="text-lg font-semibold text-orange-900">{stats.usersWithFacilities}</div>
            <div className="text-xs text-orange-700">Facilities</div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">User Management</CardTitle>
            <Button onClick={onCreateUser} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users List
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Bulk Actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <UsersList
                onCreateUser={onCreateUser}
                onAssignRole={onAssignRole}
                onRemoveRole={onRemoveRole}
                onAssignFacility={onAssignFacility}
                onEditUser={onEditUser}
                onManagePermissions={onManagePermissions}
                onAssignModule={onAssignModule}
                onResendVerification={onResendVerification}
                onDeactivateUser={onDeactivateUser}
                onViewModules={onViewModules}
              />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-4">
              <BulkRoleAssignment />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactUserManagement;
