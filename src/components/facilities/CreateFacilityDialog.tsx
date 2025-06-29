
import React, { useState } from 'react';
import { useFacilities } from '@/hooks/useFacilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database['public']['Enums']['facility_type'];

interface CreateFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const facilityTypeOptions: { value: FacilityType; label: string }[] = [
  { value: 'treatmentFacility', label: 'Treatment Facility' },
  { value: 'referralFacility', label: 'Referral Facility' },
  { value: 'prescriberFacility', label: 'Prescriber Facility' },
];

const CreateFacilityDialog: React.FC<CreateFacilityDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createFacility, isCreatingFacility } = useFacilities();
  
  const [formData, setFormData] = useState({
    name: '',
    facility_type: '' as FacilityType,
    address: '',
    phone: '',
    email: '',
    license_number: '',
    npi_number: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.facility_type) {
      return;
    }

    createFacility({
      name: formData.name,
      facility_type: formData.facility_type,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      license_number: formData.license_number || undefined,
      npi_number: formData.npi_number || undefined
    });
    
    // Reset form
    setFormData({
      name: '',
      facility_type: '' as FacilityType,
      address: '',
      phone: '',
      email: '',
      license_number: '',
      npi_number: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Facility</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Facility Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="facility_type">Facility Type</Label>
            <Select
              value={formData.facility_type}
              onValueChange={(value: FacilityType) => setFormData(prev => ({ ...prev, facility_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {facilityTypeOptions.map((type) => (
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingFacility}>
              {isCreatingFacility ? 'Creating...' : 'Create Facility'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFacilityDialog;
