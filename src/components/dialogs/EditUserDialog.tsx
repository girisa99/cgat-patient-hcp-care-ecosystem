/**
 * Edit User Dialog Component
 * Handles user profile editing with validation
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, User, Mail, Phone, Building } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterToast } from '@/hooks/useMasterToast';
import type { UserWithRoles } from '@/types/userManagement';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRoles | null;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { facilities } = useMasterData();
  const { updateUser, isUpdatingUser } = useMasterUserManagement();
  const { showSuccess, showError } = useMasterToast();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    facility_id: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        facility_id: user.facility_id || '',
        is_active: user.is_active !== false
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    try {
      await updateUser(user.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        facility_id: formData.facility_id || null,
        is_active: formData.is_active
      });

      showSuccess('User Updated', `Successfully updated ${formData.first_name} ${formData.last_name}`);
      onOpenChange(false);
    } catch (error) {
      showError('Update Failed', 'Failed to update user');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <div className="relative">
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={errors.first_name ? 'border-destructive' : ''}
                  placeholder="Enter first name"
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <div className="relative">
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={errors.last_name ? 'border-destructive' : ''}
                  placeholder="Enter last name"
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.last_name && (
                <p className="text-sm text-destructive mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                placeholder="Enter email address"
              />
              <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
                placeholder="Enter phone number"
              />
              <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Facility Assignment */}
          <div>
            <Label htmlFor="facility">Facility</Label>
            <Select value={formData.facility_id} onValueChange={(value) => handleInputChange('facility_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No facility assigned</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {facility.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active User</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUpdatingUser}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdatingUser}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isUpdatingUser ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};