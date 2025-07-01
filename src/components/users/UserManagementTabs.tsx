
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MoreHorizontal } from 'lucide-react';
import UsersList from './UsersList';
import BulkRoleAssignment from './BulkRoleAssignment';

interface UserManagementTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  filteredUsersCount: number;
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

export const UserManagementTabs: React.FC<UserManagementTabsProps> = ({
  activeTab,
  onTabChange,
  filteredUsersCount,
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onManagePermissions,
  onAssignModule,
  onResendVerification,
  onDeactivateUser,
  onViewModules
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users List ({filteredUsersCount})
        </TabsTrigger>
        <TabsTrigger value="bulk" className="flex items-center gap-2">
          <MoreHorizontal className="h-4 w-4" />
          Bulk Actions
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="users" className="mt-6">
        <UsersList
          onEditUser={onEditUser}
          onAssignRole={onAssignRole}
          onRemoveRole={onRemoveRole}
          onAssignFacility={onAssignFacility}
          onManagePermissions={onManagePermissions}
          onAssignModule={onAssignModule}
          onResendVerification={onResendVerification}
          onDeactivateUser={onDeactivateUser}
          onViewModules={onViewModules}
        />
      </TabsContent>
      
      <TabsContent value="bulk" className="mt-6">
        <BulkRoleAssignment />
      </TabsContent>
    </Tabs>
  );
};
