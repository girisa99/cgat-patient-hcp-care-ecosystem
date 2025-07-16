import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Edit, 
  UserPlus, 
  Shield, 
  Trash2, 
  Plus,
  Users,
  Settings,
  Key
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useRealUsers } from '@/hooks/api/useRealUsers';
import { useMasterRoleManagement } from '@/hooks/useMasterRoleManagement';
import { supabase } from '@/integrations/supabase/client';

interface ModuleManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  };
  onSuccess?: () => void;
  isCreating?: boolean;
}

export const ModuleManagementModal: React.FC<ModuleManagementModalProps> = ({
  open,
  onOpenChange,
  module,
  onSuccess,
  isCreating = false
}) => {
  const { showSuccess, showError } = useMasterToast();
  const { data: users = [], isLoading: usersLoading } = useRealUsers();
  const { roles, isLoading: rolesLoading } = useMasterRoleManagement();
  const [activeTab, setActiveTab] = useState('edit');
  const [loading, setLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: module?.name || '',
    description: module?.description || '',
    is_active: module?.is_active ?? true
  });

  const [assignUserForm, setAssignUserForm] = useState({
    userId: '',
    expiresAt: ''
  });

  const [rbacForm, setRbacForm] = useState({
    roleId: '',
    permissions: [] as string[]
  });

  // Update form when module prop changes
  useEffect(() => {
    if (module) {
      setEditForm({
        name: module.name,
        description: module.description || '',
        is_active: module.is_active
      });
    } else if (isCreating) {
      // Reset form for new module
      setEditForm({
        name: '',
        description: '',
        is_active: true
      });
    }
  }, [module, isCreating]);

  const handleEditModule = async () => {
    setLoading(true);
    try {
      if (isCreating) {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert({
            name: editForm.name,
            description: editForm.description,
            is_active: editForm.is_active
          });

        if (error) throw error;
        showSuccess('Module Created', `${editForm.name} has been created successfully`);
      } else {
        // Update existing module
        if (!module?.id) return;
        
        const { error } = await supabase
          .from('modules')
          .update({
            name: editForm.name,
            description: editForm.description,
            is_active: editForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        showSuccess('Module Updated', `${editForm.name} has been updated successfully`);
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      showError(isCreating ? 'Create Failed' : 'Update Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateModule = async (e) => {
    console.log('=== handleDeactivateModule called ===', { 
      event: e, 
      module: module?.id, 
      moduleData: module,
      moduleActive: module?.is_active 
    });
    if (!module?.id) {
      console.log('No module ID found, returning early');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      showSuccess('Module Deactivated', `${module.name} has been deactivated`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      showError('Deactivation Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!module?.id || !assignUserForm.userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_module_assignments')
        .insert({
          user_id: assignUserForm.userId,
          module_id: module.id,
          expires_at: assignUserForm.expiresAt || null,
          is_active: true
        });

      if (error) throw error;

      showSuccess('User Assigned', 'User has been assigned to module successfully');
      setAssignUserForm({ userId: '', expiresAt: '' });
    } catch (error: any) {
      showError('Assignment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssignment = async () => {
    if (!module?.id || !rbacForm.roleId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('role_module_assignments')
        .insert({
          role_id: rbacForm.roleId,
          module_id: module.id,
          is_active: true
        });

      if (error) throw error;

      showSuccess('Role Assigned', 'Role has been assigned to module successfully');
      setRbacForm({ roleId: '', permissions: [] });
    } catch (error: any) {
      showError('Role Assignment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!module && !isCreating) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isCreating ? 'Create New Module' : `Manage Module: ${module?.name}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${isCreating ? 'grid-cols-1' : 'grid-cols-4'}`}>
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              {isCreating ? 'Create' : 'Edit'}
            </TabsTrigger>
            {!isCreating && (
              <>
                <TabsTrigger value="assign">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Users
                </TabsTrigger>
                <TabsTrigger value="rbac">
                  <Shield className="h-4 w-4 mr-2" />
                  RBAC
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isCreating ? 'Create Module' : 'Edit Module Details'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Module Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={editForm.is_active ? "default" : "secondary"}>
                    {editForm.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  >
                    {editForm.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditModule} disabled={loading}>
                    {loading ? (isCreating ? 'Creating...' : 'Saving...') : (isCreating ? 'Create Module' : 'Save Changes')}
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {!isCreating && (
            <TabsContent value="assign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Users to Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userId">Select User</Label>
                    <Select value={assignUserForm.userId} onValueChange={(value) => setAssignUserForm(prev => ({ ...prev, userId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersLoading ? (
                          <SelectItem value="" disabled>Loading users...</SelectItem>
                        ) : users.length === 0 ? (
                          <SelectItem value="" disabled>No users available</SelectItem>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={assignUserForm.expiresAt}
                      onChange={(e) => setAssignUserForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleAssignUser} disabled={loading || !assignUserForm.userId}>
                  {loading ? 'Assigning...' : 'Assign User'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isCreating && (

          <TabsContent value="rbac" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="roleId">Select Role</Label>
                  <Select value={rbacForm.roleId} onValueChange={(value) => setRbacForm(prev => ({ ...prev, roleId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="" disabled>Loading roles...</SelectItem>
                      ) : roles.length === 0 ? (
                        <SelectItem value="" disabled>No roles available</SelectItem>
                      ) : (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['read', 'write', 'delete', 'manage'].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={rbacForm.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRbacForm(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                            } else {
                              setRbacForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                            }
                          }}
                        />
                        <label htmlFor={permission} className="text-sm capitalize">{permission}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleRoleAssignment} disabled={loading || !rbacForm.roleId}>
                  {loading ? 'Assigning...' : 'Assign Role'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isCreating && (
            <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Deactivate Module</h4>
                    <p className="text-sm text-muted-foreground">
                      This will deactivate the module and prevent new assignments
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleDeactivateModule}
                     disabled={loading || !module?.is_active}
                   >
                     <Trash2 className="h-4 w-4 mr-2" />
                     {module?.is_active ? 'Deactivate' : 'Already Inactive'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">View Permissions</h4>
                    <p className="text-sm text-muted-foreground">
                      View all permissions assigned to this module
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      console.log('=== View Permissions button clicked ===', e);
                      console.log('Event target:', e.target);
                      console.log('Current target:', e.currentTarget);
                      try {
                        showSuccess('Permissions', 'Permission viewer coming soon');
                        console.log('showSuccess called successfully');
                      } catch (error) {
                        console.error('Error in showSuccess:', error);
                      }
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    View Permissions
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">View Audit Trail</h4>
                    <p className="text-sm text-muted-foreground">
                      View all changes made to this module
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      console.log('=== View Audit Trail button clicked ===', e);
                      console.log('Event target:', e.target);
                      console.log('Current target:', e.currentTarget);
                      try {
                        showSuccess('Audit Trail', 'Audit trail viewer coming soon');
                        console.log('showSuccess called successfully');
                      } catch (error) {
                        console.error('Error in showSuccess:', error);
                      }
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    View Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};