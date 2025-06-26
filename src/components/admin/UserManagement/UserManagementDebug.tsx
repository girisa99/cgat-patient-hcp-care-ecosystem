
import React from 'react';
import RoleAssignmentDebugger from '@/components/users/RoleAssignmentDebugger';

interface UserManagementDebugProps {
  debugMode: boolean;
  selectedUserId: string | null;
  selectedUserName: string;
}

export const UserManagementDebug: React.FC<UserManagementDebugProps> = ({
  debugMode,
  selectedUserId,
  selectedUserName
}) => {
  if (!debugMode || !selectedUserId) {
    return null;
  }

  return (
    <RoleAssignmentDebugger
      userId={selectedUserId}
      userName={selectedUserName}
    />
  );
};
