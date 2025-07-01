
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFacilities } from '@/hooks/useFacilities';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database['public']['Enums']['facility_type'];

interface CreateFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateFacilityDialog: React.FC<CreateFacilityDialogProps> = ({ open, onOpenChange }) => {
  const { createFacility } = useFacilities();
  const [formData, setFormData] = useState<{
    name: string;
    facility_type: FacilityType | '';
    address: string;
    phone: string;
    email: string;
  }>({
    name: '',
    facility_type: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure facility_type is selected before submitting
    if (!formData.facility_type) {
      return;
    }

    createFacility({
      name: formData.name,
      facility_type: formData.facility_type as FacilityType,
      address: formData.address,
      phone: formData.phone,
      email: formData.email
    });
    
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      facility_type: '',
      address: '',
      phone: '',
      email: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Facility Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="facility_type">Facility Type</Label>
            <Select 
              value={formData.facility_type} 
              onValueChange={(value: FacilityType) => setFormData({ ...formData, facility_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="treatmentFacility">Treatment Facility</SelectItem>
                <SelectItem value="referralFacility">Referral Facility</SelectItem>
                <SelectItem value="prescriberFacility">Prescriber Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!formData.facility_type}>
              Create Facility
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFacilityDialog;
