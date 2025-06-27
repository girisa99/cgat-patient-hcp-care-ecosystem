import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type UserRole = Database['public']['Enums']['user_role'];

const BulkRoleAssignment: React.FC = () => {
  const { users, assignRole } = useUsers();
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'superAdmin', label: 'Super Admin' },
    { value: 'onboardingTeam', label: 'Onboarding Team' },
    { value: 'caseManager', label: 'Case Manager' },
    { value: 'patientCaregiver', label: 'Patient Caregiver' },
    { value: 'healthcareProvider', label: 'Healthcare Provider' },
    { value: 'nurse', label: 'Nurse' }
  ];

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users?.map(user => user.id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedRole || selectedUsers.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select both users and a role to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedUsers) {
      try {
        await assignRole({ userId, roleName: selectedRole });
        successCount++;
      } catch (error) {
        console.error(`Failed to assign role to user ${userId}:`, error);
        errorCount++;
      }
    }

    setIsAssigning(false);
    setSelectedUsers([]);
    setSelectedRole('');

    if (successCount > 0) {
      toast({
        title: "Bulk Assignment Complete",
        description: `Successfully assigned roles to ${successCount} users${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Assignment Failed",
        description: `Failed to assign roles to ${errorCount} users.`,
        variant: "destructive",
      });
    }
  };

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Bulk Role Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No users available for bulk role assignment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Bulk Role Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Role to Assign</label>
          <Select
            value={selectedRole}
            onValueChange={(value: UserRole) => setSelectedRole(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Select Users</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedUsers.length === users.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All ({users.length})
              </label>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'No name set'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.user_roles && user.user_roles.length > 0 ? (
                    user.user_roles.slice(0, 2).map((userRole, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {userRole.roles.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No roles
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary and Action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{selectedUsers.length} users selected</span>
            {selectedRole && (
              <>
                <span>•</span>
                <Badge variant="outline">
                  {roles.find(r => r.value === selectedRole)?.label}
                </Badge>
              </>
            )}
          </div>
          
          <Button
            onClick={handleBulkAssign}
            disabled={!selectedRole || selectedUsers.length === 0 || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Role to {selectedUsers.length} Users
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkRoleAssignment;
