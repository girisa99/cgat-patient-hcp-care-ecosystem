
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';

interface CreateIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateIntegrationDialog: React.FC<CreateIntegrationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createApiService, isCreatingApiService } = useApiServices();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'internal',
    direction: 'inbound',
    purpose: '',
    base_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApiService(formData);
    onOpenChange(false);
    setFormData({
      name: '',
      description: '',
      category: '',
      type: 'internal',
      direction: 'inbound',
      purpose: '',
      base_url: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New API Integration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direction">Direction</Label>
            <Select value={formData.direction} onValueChange={(value) => setFormData(prev => ({ ...prev, direction: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="bidirectional">Bidirectional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="What is this API used for?"
            />
          </div>

          <div>
            <Label htmlFor="base_url">Base URL (Optional)</Label>
            <Input
              id="base_url"
              value={formData.base_url}
              onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingApiService}>
              {isCreatingApiService ? 'Creating...' : 'Create Integration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIntegrationDialog;
