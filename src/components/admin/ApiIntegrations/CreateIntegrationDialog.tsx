
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { ApiEndpoint } from '@/utils/api/ApiIntegrationTypes';

interface CreateIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateIntegrationDialog: React.FC<CreateIntegrationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { registerIntegration, isRegistering } = useApiIntegrations();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseUrl: '',
    version: '1.0.0',
    category: 'integration' as 'healthcare' | 'auth' | 'data' | 'integration' | 'utility',
    status: 'active' as 'active' | 'inactive' | 'deprecated'
  });
  const [endpoints, setEndpoints] = useState<Partial<ApiEndpoint>[]>([
    {
      name: '',
      method: 'GET',
      url: '',
      headers: {},
      isPublic: false
    }
  ]);

  const handleSubmit = () => {
    const integration = {
      ...formData,
      type: 'external' as const,
      endpoints: endpoints.map(endpoint => ({
        ...endpoint,
        id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: endpoint.description || endpoint.name || '',
        headers: endpoint.headers || {},
        isPublic: endpoint.isPublic || false
      })) as ApiEndpoint[],
      schemas: {},
      mappings: [],
      rlsPolicies: []
    };

    registerIntegration(integration);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      baseUrl: '',
      version: '1.0.0',
      category: 'integration',
      status: 'active'
    });
    setEndpoints([{
      name: '',
      method: 'GET',
      url: '',
      headers: {},
      isPublic: false
    }]);
  };

  const addEndpoint = () => {
    setEndpoints([...endpoints, {
      name: '',
      method: 'GET',
      url: '',
      headers: {},
      isPublic: false
    }]);
  };

  const updateEndpoint = (index: number, field: string, value: any) => {
    const updated = [...endpoints];
    updated[index] = { ...updated[index], [field]: value };
    setEndpoints(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create API Integration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Stripe API"
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the API integration"
            />
          </div>

          <div>
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={formData.baseUrl}
              onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
              placeholder="https://api.example.com/v1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>API Endpoints</Label>
              <Button variant="outline" size="sm" onClick={addEndpoint}>
                Add Endpoint
              </Button>
            </div>
            
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={endpoint.name || ''}
                        onChange={(e) => updateEndpoint(index, 'name', e.target.value)}
                        placeholder="Get Users"
                      />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Select
                        value={endpoint.method}
                        onValueChange={(value) => updateEndpoint(index, 'method', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>URL Path</Label>
                      <Input
                        value={endpoint.url || ''}
                        onChange={(e) => updateEndpoint(index, 'url', e.target.value)}
                        placeholder="/users"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isRegistering}>
              {isRegistering ? 'Creating...' : 'Create Integration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
