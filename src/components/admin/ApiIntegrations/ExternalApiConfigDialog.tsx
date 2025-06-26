
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExternalApis } from '@/hooks/useExternalApis';
import { ExternalApiRegistry } from '@/utils/api/ExternalApiManager';

interface ExternalApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ExternalApiRegistry | null;
}

const ExternalApiConfigDialog = ({ open, onOpenChange, api }: ExternalApiConfigDialogProps) => {
  const { updateApiStatus, isUpdatingStatus } = useExternalApis();
  const [configForm, setConfigForm] = useState({
    status: api?.status || 'draft',
    visibility: api?.visibility || 'private',
    base_url: api?.base_url || '',
    documentation_url: api?.documentation_url || '',
    sandbox_url: api?.sandbox_url || '',
    rate_limits: api?.rate_limits || { requests: 1000, period: 'hour' }
  });

  const handleSave = async () => {
    if (!api) return;

    try {
      // Update the API status and other configurations
      await updateApiStatus({ 
        externalApiId: api.id, 
        status: configForm.status as ExternalApiRegistry['status']
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update API configuration:', error);
    }
  };

  if (!api) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure API: {api.external_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select 
                value={configForm.status} 
                onValueChange={(value) => setConfigForm(prev => ({ 
                  ...prev, 
                  status: value as ExternalApiRegistry['status']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select 
                value={configForm.visibility} 
                onValueChange={(value) => setConfigForm(prev => ({ 
                  ...prev, 
                  visibility: value as ExternalApiRegistry['visibility']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Base URL</Label>
            <Input
              value={configForm.base_url}
              onChange={(e) => setConfigForm(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://api.yourservice.com"
            />
          </div>

          <div>
            <Label>Documentation URL</Label>
            <Input
              value={configForm.documentation_url}
              onChange={(e) => setConfigForm(prev => ({ ...prev, documentation_url: e.target.value }))}
              placeholder="https://docs.yourapi.com"
            />
          </div>

          <div>
            <Label>Sandbox URL</Label>
            <Input
              value={configForm.sandbox_url}
              onChange={(e) => setConfigForm(prev => ({ ...prev, sandbox_url: e.target.value }))}
              placeholder="https://sandbox.yourapi.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rate Limit (Requests)</Label>
              <Input
                type="number"
                value={configForm.rate_limits.requests}
                onChange={(e) => setConfigForm(prev => ({ 
                  ...prev, 
                  rate_limits: { ...prev.rate_limits, requests: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label>Rate Limit Period</Label>
              <Select 
                value={configForm.rate_limits.period} 
                onValueChange={(value) => setConfigForm(prev => ({ 
                  ...prev, 
                  rate_limits: { ...prev.rate_limits, period: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minute">Per Minute</SelectItem>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalApiConfigDialog;
