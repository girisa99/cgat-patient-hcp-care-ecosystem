
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useUsers';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const BulkRoleAssignment = () => {
  const { users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssigning, setIsAssigning] = useState(false);

  const usersWithoutRoles = users?.filter(user => !user.user_roles || user.user_roles.length === 0) || [];

  const assignDefaultRoles = async () => {
    if (usersWithoutRoles.length === 0) return;

    setIsAssigning(true);
    console.log('🔄 Starting bulk role assignment for', usersWithoutRoles.length, 'users');

    try {
      // Get the default role (patientCaregiver) ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'patientCaregiver')
        .single();

      if (roleError || !role) {
        throw new Error('Default role "patientCaregiver" not found');
      }

      // Prepare bulk insert data
      const roleAssignments = usersWithoutRoles.map(user => ({
        user_id: user.id,
        role_id: role.id
      }));

      console.log('🔄 Inserting', roleAssignments.length, 'role assignments');

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleAssignments);

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Bulk role assignment completed successfully');
      
      // Refresh the users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Roles Assigned",
        description: `Successfully assigned default roles to ${usersWithoutRoles.length} users.`,
      });

    } catch (error: any) {
      console.error('❌ Bulk role assignment failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign roles",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (usersWithoutRoles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-green-600">
            ✅ All users have roles assigned!
          </div>
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
      <CardContent>
        <div className="space-y-4">
          <div>
            <Badge variant="destructive">
              {usersWithoutRoles.length} users without roles
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>The following users don't have any roles assigned:</p>
            <ul className="mt-2 ml-4 list-disc">
              {usersWithoutRoles.slice(0, 5).map(user => (
                <li key={user.id}>{user.email}</li>
              ))}
              {usersWithoutRoles.length > 5 && (
                <li>... and {usersWithoutRoles.length - 5} more</li>
              )}
            </ul>
          </div>

          <Button 
            onClick={assignDefaultRoles}
            disabled={isAssigning}
            className="w-full"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Roles...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Default Role (Patient/Caregiver) to All
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkRoleAssignment;
