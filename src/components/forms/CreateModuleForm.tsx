/**
 * Create Module Form Component
 * Handles module creation with proper validation
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface CreateModuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateModuleForm: React.FC<CreateModuleFormProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      showError('Validation Error', 'Module name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('modules')
        .insert([{
          name: formData.name,
          description: formData.description,
          is_active: true
        }]);

      if (error) throw error;

      showSuccess('Success', 'Module created successfully');
      
      // Reset form
      setFormData({
        name: '',
        description: ''
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
          <DialogTitle>Create New Module</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Module Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Patient Management, Billing, Reports"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this module does..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};