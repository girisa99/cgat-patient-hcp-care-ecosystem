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
  Building2, 
  Edit, 
  UserPlus, 
  Shield, 
  Trash2, 
  Plus,
  Users,
  Settings 
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useRealUsers } from '@/hooks/api/useRealUsers';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database["public"]["Enums"]["facility_type"];

interface FacilityManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility?: {
    id: string;
    name: string;
    facility_type: FacilityType;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
  };
  onSuccess?: () => void;
}

export const FacilityManagementModal: React.FC<FacilityManagementModalProps> = ({
  open,
  onOpenChange,
  facility,
  onSuccess
}) => {
  const { showSuccess, showError } = useMasterToast();
  const { data: users = [], isLoading: usersLoading } = useRealUsers();
  const [activeTab, setActiveTab] = useState('edit');
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!facility;
  
  const [editForm, setEditForm] = useState({
    name: facility?.name || '',
    facility_type: facility?.facility_type || 'treatmentFacility' as FacilityType,
    address: facility?.address || '',
    phone: facility?.phone || '',
    email: facility?.email || '',
    is_active: facility?.is_active ?? true
  });

  // Update form when facility prop changes
  useEffect(() => {
    if (facility) {
      setEditForm({
        name: facility.name,
        facility_type: facility.facility_type,
        address: facility.address || '',
        phone: facility.phone || '',
        email: facility.email || '',
        is_active: facility.is_active
      });
    } else {
      // Reset form for new facility
      setEditForm({
        name: '',
        facility_type: 'treatmentFacility' as FacilityType,
        address: '',
        phone: '',
        email: '',
        is_active: true
      });
    }
  }, [facility]);

  const [assignUserForm, setAssignUserForm] = useState({
    userId: '',
    accessLevel: 'read'
  });

  const handleSaveFacility = async () => {
    if (isEditMode && !facility?.id) return;
    
    setLoading(true);
    try {
      if (isEditMode) {
        // Update existing facility
        const { error } = await supabase
          .from('facilities')
          .update({
            name: editForm.name,
            facility_type: editForm.facility_type,
            address: editForm.address,
            phone: editForm.phone,
            email: editForm.email,
            is_active: editForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', facility.id);

        if (error) throw error;
        showSuccess('Facility Updated', `${editForm.name} has been updated successfully`);
      } else {
        // Create new facility
        const { error } = await supabase
          .from('facilities')
          .insert({
            name: editForm.name,
            facility_type: editForm.facility_type,
            address: editForm.address,
            phone: editForm.phone,
            email: editForm.email,
            is_active: editForm.is_active
          });

        if (error) throw error;
        showSuccess('Facility Created', `${editForm.name} has been created successfully`);
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      showError(isEditMode ? 'Update Failed' : 'Create Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateFacility = async () => {
    if (!facility?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('facilities')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', facility.id);

      if (error) throw error;

      showSuccess('Facility Deactivated', `${facility.name} has been deactivated`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      showError('Deactivation Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!facility?.id || !assignUserForm.userId) return;
    
    setLoading(true);
    try {
      // Check if user_facility_access table exists, if not, create the assignment logic
      const { error } = await supabase
        .from('user_facility_access')
        .insert({
          user_id: assignUserForm.userId,
          facility_id: facility.id,
          access_level: assignUserForm.accessLevel,
          is_active: true
        });

      if (error) throw error;

      showSuccess('User Assigned', 'User has been assigned to facility successfully');
      setAssignUserForm({ userId: '', accessLevel: 'read' });
    } catch (error: any) {
      showError('Assignment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditMode ? `Manage Facility: ${facility.name}` : 'Create New Facility'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={isEditMode ? "grid w-full grid-cols-3" : "grid w-full grid-cols-1"}>
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              {isEditMode ? 'Edit' : 'Create'}
            </TabsTrigger>
            {isEditMode && (
              <>
                <TabsTrigger value="assign">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Users
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
                <CardTitle>{isEditMode ? 'Edit Facility Details' : 'Create New Facility'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Facility Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Facility Type</Label>
                    <Select value={editForm.facility_type} onValueChange={(value: FacilityType) => setEditForm(prev => ({ ...prev, facility_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treatmentFacility">Treatment Facility</SelectItem>
                        <SelectItem value="referralFacility">Referral Facility</SelectItem>
                        <SelectItem value="prescriberFacility">Prescriber Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
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
                  <Button onClick={handleSaveFacility} disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Facility')}
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Users to Facility</CardTitle>
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
                    <Label htmlFor="accessLevel">Access Level</Label>
                    <Select value={assignUserForm.accessLevel} onValueChange={(value) => setAssignUserForm(prev => ({ ...prev, accessLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAssignUser} disabled={loading || !assignUserForm.userId}>
                  {loading ? 'Assigning...' : 'Assign User'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facility Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Deactivate Facility</h4>
                    <p className="text-sm text-muted-foreground">
                      This will deactivate the facility and prevent new assignments
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleDeactivateFacility}
                    disabled={loading || !facility.is_active}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {facility.is_active ? 'Deactivate' : 'Already Inactive'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">View Audit Trail</h4>
                    <p className="text-sm text-muted-foreground">
                      View all changes made to this facility
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => showSuccess('Audit Trail', 'Audit trail viewer coming soon')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    View Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};