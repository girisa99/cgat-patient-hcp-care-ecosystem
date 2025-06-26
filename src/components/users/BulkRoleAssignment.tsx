
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useUsers';
import { UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const BulkRoleAssignment = () => {
  const { users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const usersWithoutRoles = users?.filter(user => !user.user_roles || user.user_roles.length === 0) || [];

  const assignDefaultRoles = async () => {
    if (usersWithoutRoles.length === 0) return;

    setIsAssigning(true);
    setAssignmentResults(null);
    console.log('🔄 Starting bulk role assignment for', usersWithoutRoles.length, 'users');

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      // Get the default role (patientCaregiver) ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', 'patientCaregiver')
        .single();

      if (roleError || !role) {
        throw new Error('Default role "patientCaregiver" not found in roles table');
      }

      console.log('✅ Found role:', role);

      // Process users one by one to get detailed error information
      for (const user of usersWithoutRoles) {
        try {
          console.log(`🔄 Assigning role to user: ${user.email} (${user.id})`);
          
          // Check if assignment already exists
          const { data: existingAssignment } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', user.id)
            .eq('role_id', role.id)
            .maybeSingle();

          if (existingAssignment) {
            console.log(`ℹ️ User ${user.email} already has role assigned`);
            results.success++;
            continue;
          }

          // Insert new role assignment
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role_id: role.id
            });

          if (insertError) {
            console.error(`❌ Failed to assign role to ${user.email}:`, insertError);
            results.failed++;
            results.errors.push(`${user.email}: ${insertError.message}`);
          } else {
            console.log(`✅ Successfully assigned role to ${user.email}`);
            results.success++;
          }

        } catch (userError: any) {
          console.error(`❌ Exception for user ${user.email}:`, userError);
          results.failed++;
          results.errors.push(`${user.email}: ${userError.message}`);
        }
      }

      console.log('📊 Bulk assignment results:', results);
      setAssignmentResults(results);
      
      // Refresh the users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      if (results.success > 0) {
        toast({
          title: "Roles Assigned",
          description: `Successfully assigned roles to ${results.success} users${results.failed > 0 ? `. ${results.failed} failed.` : '.'}`,
        });
      }

      if (results.failed > 0 && results.success === 0) {
        toast({
          title: "Assignment Failed",
          description: `Failed to assign roles to all ${results.failed} users. Check the details below.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('❌ Bulk role assignment failed:', error);
      setAssignmentResults({
        success: 0,
        failed: usersWithoutRoles.length,
        errors: [error.message || "Unknown error occurred"]
      });
      
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
          <div className="text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            All users have roles assigned!
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
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              {usersWithoutRoles.length} users without roles
            </Badge>
            {assignmentResults && (
              <>
                {assignmentResults.success > 0 && (
                  <Badge variant="default">
                    {assignmentResults.success} successful
                  </Badge>
                )}
                {assignmentResults.failed > 0 && (
                  <Badge variant="destructive">
                    {assignmentResults.failed} failed
                  </Badge>
                )}
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>The following users don't have any roles assigned:</p>
            <ul className="mt-2 ml-4 list-disc">
              {usersWithoutRoles.slice(0, 3).map(user => (
                <li key={user.id}>
                  {user.email}
                  {user.first_name && ` (${user.first_name} ${user.last_name || ''})`}
                </li>
              ))}
              {usersWithoutRoles.length > 3 && (
                <li>... and {usersWithoutRoles.length - 3} more</li>
              )}
            </ul>
          </div>

          {assignmentResults && assignmentResults.errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Assignment Errors:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {assignmentResults.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="break-words">{error}</li>
                ))}
                {assignmentResults.errors.length > 5 && (
                  <li>... and {assignmentResults.errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}

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
