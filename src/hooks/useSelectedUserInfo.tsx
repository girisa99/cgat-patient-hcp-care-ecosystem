
import { useMemo } from 'react';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export const useSelectedUserInfo = (users: User[] | undefined, selectedUserId: string | null) => {
  const selectedUserForRole = useMemo(() => {
    return users?.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  const selectedUserName = useMemo(() => {
    if (!selectedUserForRole) return '';
    return `${selectedUserForRole.first_name || ''} ${selectedUserForRole.last_name || ''}`.trim() || selectedUserForRole.email;
  }, [selectedUserForRole]);

  return {
    selectedUserForRole,
    selectedUserName
  };
};
