/**
 * Patient-specific form for creating and editing patients
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

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
    password: ''
  });

  const { createUser, isCreatingUser } = useMasterUserManagement();

  // Pre-populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        email: initialData.email || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        password: ''
      });
    } else {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        password: ''
      });
    }
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      return;
    }

    if (mode === 'create') {
      // Create new patient with patientCaregiver role
      await createUser({
        ...formData
      });
    } else {
      // For edit mode, we would need an update function
      console.log('Edit patient:', patientId, formData);
      // TODO: Implement patient update functionality
    }

    // Reset form and close dialog
    setFormData({ email: '', first_name: '', last_name: '', password: '' });
    onOpenChange(false);
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
            <Button type="submit" disabled={isCreatingUser}>
              {isCreatingUser ? 
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