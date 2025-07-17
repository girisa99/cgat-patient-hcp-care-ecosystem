/**
 * Create Facility Form Component
 * Handles facility creation with proper validation
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database["public"]["Enums"]["facility_type"];

interface CreateFacilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateFacilityForm: React.FC<CreateFacilityFormProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    facility_type: '' as FacilityType | '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
    npi_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const facilityTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'treatmentFacility', label: 'Treatment Facility' },
    { value: 'referralFacility', label: 'Referral Facility' },
    { value: 'prescriberFacility', label: 'Prescriber Facility' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.facility_type) {
      showError('Validation Error', 'Name and facility type are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure we have a valid facility_type before submitting
      const submitData = {
        ...formData,
        facility_type: formData.facility_type as FacilityType
      };
      
      const { error } = await supabase
        .from('facilities')
        .insert([submitData]);

      if (error) throw error;

      showSuccess('Success', 'Facility created successfully');
      
      // Reset form
      setFormData({
        name: '',
        facility_type: '' as FacilityType | '',
        address: '',
        phone: '',
        email: '',
        license_number: '',
        npi_number: ''
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      showError('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Facility</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Facility Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="facility_type">Facility Type *</Label>
            <Select 
              value={formData.facility_type} 
              onValueChange={(value: FacilityType) => 
                setFormData(prev => ({ ...prev, facility_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {facilityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="npi_number">NPI Number</Label>
              <Input
                id="npi_number"
                value={formData.npi_number}
                onChange={(e) => setFormData(prev => ({ ...prev, npi_number: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Facility'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};