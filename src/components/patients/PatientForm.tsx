/**
 * Patient-specific form for creating and editing patients
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string | null;
  initialData?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  mode: 'create' | 'edit';
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  open, 
  onOpenChange, 
  patientId,
  initialData,
  mode 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    facility_id: ''
  });

  const { createUser, isCreatingUser, assignRole, refreshData } = useMasterUserManagement();
  const { showSuccess, showError } = useMasterToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [facilities, setFacilities] = useState<Array<{id: string, name: string, facility_type: string}>>([]);

  // Load facilities and pre-populate form data
  useEffect(() => {
    const loadFacilities = async () => {
      const { data } = await supabase
        .from('facilities')
        .select('id, name, facility_type')
        .eq('is_active', true)
        .order('name');
      
      if (data) {
        setFacilities(data);
      }
    };

    loadFacilities();

    if (mode === 'edit' && initialData) {
      setFormData({
        email: initialData.email || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        password: '',
        facility_id: ''
      });
    } else {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        facility_id: ''
      });
    }
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      return;
    }

    if (mode === 'create') {
      try {
        // Create user using admin API
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password || 'TempPassword123!',
          email_confirm: true,
          user_metadata: {
            firstName: formData.first_name,
            lastName: formData.last_name
          }
        });
        
        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }
        
        if (authData.user) {
          // Update the profile with names and facility
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              first_name: formData.first_name,
              last_name: formData.last_name,
              facility_id: formData.facility_id || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);
            
          if (profileError) {
            console.error('Profile error:', profileError);
          }
            
          // Assign patient role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: authData.user.id, 
              role_id: '991a1679-d423-4c62-86c8-f14c11db5186' // patientCaregiver role ID
            });
          
          if (roleError) {
            console.error('Role assignment error:', roleError);
            throw roleError;
          }
          
          showSuccess('Patient Created', 'Patient has been created successfully with Patient/Caregiver role');
          
          // Refresh the data
          refreshData();
        }

        // Reset form and close dialog
        setFormData({ email: '', first_name: '', last_name: '', password: '', facility_id: '' });
        onOpenChange(false);
      } catch (error: any) {
        console.error('Creation failed:', error);
        showError('Creation Failed', error.message || 'Failed to create patient');
      }
    } else {
      // Edit mode - update patient profile
      try {
        setIsUpdating(true);
        const { error } = await supabase
          .from('profiles')
          .update({ 
            first_name: formData.first_name,
            last_name: formData.last_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', patientId);
        
        if (error) throw error;
        
        showSuccess('Patient Updated', 'Patient information has been updated successfully');
        refreshData(); // Refresh the patient list
        
        // Reset form and close dialog
        setFormData({ email: '', first_name: '', last_name: '', password: '', facility_id: '' });
        onOpenChange(false);
      } catch (error: any) {
        showError('Update Failed', error.message);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Patient' : 'Edit Patient'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={mode === 'edit'}
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            )}
          </div>

          <div>
            <Label htmlFor="facility">Facility</Label>
            <Select value={formData.facility_id} onValueChange={(value) => setFormData(prev => ({ ...prev, facility_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} ({facility.facility_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'create' && (
            <div>
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Auto-generated if empty"
              />
            </div>
          )}

          {/* Patient role indicator */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Role:</strong> Patient/Caregiver (automatically assigned)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingUser || isUpdating}>
              {(isCreatingUser || isUpdating) ? 
                (mode === 'create' ? 'Creating...' : 'Updating...') : 
                (mode === 'create' ? 'Create Patient' : 'Update Patient')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};