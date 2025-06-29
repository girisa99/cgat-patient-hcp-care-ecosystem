
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFacilities } from '@/hooks/useFacilities';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { facilities, isLoading: facilitiesLoading } = useFacilities();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    facility_id: ''
  });

  useEffect(() => {
    if (user && open) {
      console.log('📝 EditUserDialog received user data:', user);
      console.log('🔍 User properties:', Object.keys(user));
      
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        department: user.department || '',
        facility_id: user.facility_id || ''
      });
      
      console.log('✅ Form data initialized:', {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        department: user.department || '',
        facility_id: user.facility_id || ''
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('❌ No user ID provided');
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    console.log('🔄 Updating user profile:', user.id, formData);
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
        body: {
          action: 'update',
          user_id: user.id,
          profile_data: formData
        }
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw error;
      }

      console.log('✅ User profile updated successfully:', data);

      toast({
        title: "User Updated",
        description: "User profile has been updated successfully.",
      });

      // Invalidate both users and specific user queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Failed to update user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    console.log('⚠️ No user provided to EditUserDialog');
    return null;
  }

  console.log('🎨 Rendering EditUserDialog for user:', user.email, 'Open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user.email}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Enter department"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facility">Facility</Label>
            <Select
              value={formData.facility_id}
              onValueChange={(value) => handleInputChange('facility_id', value)}
              disabled={facilitiesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={facilitiesLoading ? "Loading facilities..." : "Select a facility"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No facility</SelectItem>
                {facilities?.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
