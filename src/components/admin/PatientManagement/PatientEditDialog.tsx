
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface PatientEditDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department?: string;
  };
}

export const PatientEditDialog: React.FC<PatientEditDialogProps> = ({
  open,
  onClose,
  patient
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: ''
  });

  // Initialize form data when patient changes
  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        department: patient.department || ''
      });
    }
  }, [patient]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!patient) return;

    console.log('💾 Saving patient updates:', formData);
    setIsLoading(true);

    try {
      // Update patient profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id);

      if (error) {
        throw error;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      toast({
        title: "Patient Updated",
        description: `${formData.first_name} ${formData.last_name}'s information has been updated successfully.`,
      });

      console.log('✅ Patient updated successfully');
      onClose();

    } catch (error: any) {
      console.error('❌ Error updating patient:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update patient information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Enter department"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
