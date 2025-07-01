
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { UserPlus, Loader2 } from 'lucide-react';

// Simple roles data
const roles = [
  { id: '1', name: 'superAdmin' },
  { id: '2', name: 'caseManager' },
  { id: '3', name: 'onboardingTeam' },
  { id: '4', name: 'healthcareProvider' },
  { id: '5', name: 'nurse' },
  { id: '6', name: 'patientCaregiver' }
];

const BulkRoleAssignment: React.FC = () => {
  const { users, assignRole, isAssigningRole } = useUnifiedUserManagement();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedRole || selectedUsers.length === 0) return;

    for (const userId of selectedUsers) {
      await new Promise(resolve => {
        assignRole({ userId, roleName: selectedRole as any });
        setTimeout(resolve, 100); // Small delay between assignments
      });
    }

    // Reset selections
    setSelectedUsers([]);
    setSelectedRole('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Bulk Role Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role to assign" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBulkAssignment}
              disabled={!selectedRole || selectedUsers.length === 0 || isAssigningRole}
            >
              {isAssigningRole ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign to ${selectedUsers.length} users`
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedUsers.length === users.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select all users ({users.length})
            </label>
            {selectedUsers.length > 0 && (
              <Badge variant="secondary">
                {selectedUsers.length} selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                />
                <div className="flex-1">
                  <label htmlFor={`user-${user.id}`} className="cursor-pointer">
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex gap-1 mt-1">
                      {user.user_roles.map((userRole, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {userRole.roles.name}
                        </Badge>
                      ))}
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkRoleAssignment;
