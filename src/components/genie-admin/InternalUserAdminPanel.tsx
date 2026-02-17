/**
 * INTERNAL USER ADMIN PANEL
 * Admin interface for managing internal Genie Suite users
 * Only accessible to super_admin and marketing_lead roles
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserPlus, Shield, Settings, Users, Search, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { INTERNAL_DOMAINS, isInternalDomain } from '@/utils/genie/internalDomainWhitelist';
import type { GenieStudioRole } from '@/hooks/useGenieStudioAuth';

interface InternalUser {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  is_internal: boolean;
  is_verified: boolean;
  current_subscription_tier: string;
  created_at: string;
  roles: GenieStudioRole[];
}

const ROLE_OPTIONS: { value: GenieStudioRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'content_manager', label: 'Content Manager' },
  { value: 'marketing_lead', label: 'Marketing Lead' },
  { value: 'creator', label: 'Creator' },
];

const InternalUserAdminPanel: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Add user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<GenieStudioRole>('creator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch internal users
  const fetchInternalUsers = async () => {
    setIsLoading(true);
    try {
      // Get users with is_internal = true
      const { data: usersData, error } = await supabase
        .from('genie_studio_users')
        .select('*')
        .eq('is_internal', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get roles for each user
      const usersWithRoles: InternalUser[] = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: rolesData } = await supabase
            .from('genie_studio_user_roles')
            .select('role')
            .eq('user_id', user.id);

          return {
            ...user,
            roles: (rolesData?.map(r => r.role) || []) as GenieStudioRole[],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching internal users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internal users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInternalUsers();
  }, []);

  // Add internal user
  const handleAddInternalUser = async () => {
    if (!newUserEmail) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('genie_studio_users')
        .select('id, is_internal')
        .eq('email', newUserEmail.toLowerCase())
        .single();

      if (existingUser) {
        // Update existing user to internal
        const { error: updateError } = await supabase
          .from('genie_studio_users')
          .update({ is_internal: true })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;

        // Add role if not exists
        await supabase
          .from('genie_studio_user_roles')
          .upsert({
            user_id: existingUser.id,
            role: newUserRole,
          }, { onConflict: 'user_id,role' });

        toast({
          title: 'User Updated',
          description: `${newUserEmail} is now an internal user`,
        });
      } else {
        // Create new internal user entry (they'll complete signup when they log in)
        const { data: newUser, error: insertError } = await supabase
          .from('genie_studio_users')
          .insert({
            auth_user_id: crypto.randomUUID(), // Placeholder until they sign up
            email: newUserEmail.toLowerCase(),
            display_name: newUserName || newUserEmail.split('@')[0],
            is_internal: true,
            is_verified: false,
            current_subscription_tier: 'free',
            subscription_status: 'active',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Add role
        await supabase
          .from('genie_studio_user_roles')
          .insert({
            user_id: newUser.id,
            role: newUserRole,
          });

        toast({
          title: 'Internal User Added',
          description: `${newUserEmail} has been added as ${newUserRole}`,
        });
      }

      // Reset form and refresh
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('creator');
      setIsAddDialogOpen(false);
      fetchInternalUsers();
    } catch (error) {
      console.error('Error adding internal user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle internal status
  const toggleInternalStatus = async (user: InternalUser) => {
    try {
      const { error } = await supabase
        .from('genie_studio_users')
        .update({ is_internal: !user.is_internal })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: `${user.email} internal status changed`,
      });
      fetchInternalUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Internal User Management
            </CardTitle>
            <CardDescription className="mt-1">
              Manage internal team members and their roles. 
              Auto-detected domains: {INTERNAL_DOMAINS.join(', ')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInternalUsers}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Internal User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Internal User</DialogTitle>
                  <DialogDescription>
                    Add a team member as an internal user. They will be auto-flagged when they sign up.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="team@geniecellgene.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                    {newUserEmail && isInternalDomain(newUserEmail) && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Internal domain detected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Initial Role</Label>
                    <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as GenieStudioRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInternalUser} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No internal users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.display_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.is_verified ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-400 border-0">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={user.is_internal}
                        onCheckedChange={() => toggleInternalStatus(user)}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InternalUserAdminPanel;
