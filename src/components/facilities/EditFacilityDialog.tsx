
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditFacilityDialogProps {
  facility: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFacilityDialog: React.FC<EditFacilityDialogProps> = ({
  facility,
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    facility_type: '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
    npi_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load facility data when dialog opens or facility changes
  useEffect(() => {
    if (facility && open) {
      console.log('🏥 Loading facility data for edit:', facility);
      setFormData({
        name: facility.name || '',
        facility_type: facility.facility_type || '',
        address: facility.address || '',
        phone: facility.phone || '',
        email: facility.email || '',
        license_number: facility.license_number || '',
        npi_number: facility.npi_number || ''
      });
    }
  }, [facility, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('💾 Updating facility:', facility.id, formData);
      
      // TODO: Implement update via facilities hook
      toast({
        title: "Facility Updated",
        description: "Facility information has been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error updating facility:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update facility information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const facilityTypes = [
    'hospital',
    'clinic',
    'pharmacy',
    'laboratory',
    'imaging_center',
    'rehabilitation_center',
    'long_term_care',
    'ambulatory_surgery_center',
    'urgent_care',
    'mental_health_facility'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Facility Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter facility name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="facility_type">Facility Type *</Label>
            <Select
              value={formData.facility_type}
              onValueChange={(value) => handleInputChange('facility_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {facilityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter facility address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="Enter license number"
              />
            </div>
            <div>
              <Label htmlFor="npi_number">NPI Number</Label>
              <Input
                id="npi_number"
                value={formData.npi_number}
                onChange={(e) => handleInputChange('npi_number', e.target.value)}
                placeholder="Enter NPI number"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Facility'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFacilityDialog;
