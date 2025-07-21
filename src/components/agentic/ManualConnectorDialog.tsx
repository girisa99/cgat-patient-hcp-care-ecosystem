import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManualConnectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectorCreated: () => void;
}

export const ManualConnectorDialog: React.FC<ManualConnectorDialogProps> = ({
  open,
  onOpenChange,
  onConnectorCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'external',
    category: 'healthcare',
    base_url: '',
    direction: 'bidirectional',
    version: '1.0.0',
    lifecycle_stage: 'development',
    status: 'active',
    purpose: 'integration',
    documentation_url: '',
    security_requirements: {
      authentication: 'api_key',
      encryption: true,
      rate_limiting: true
    },
    rate_limits: {
      requests_per_hour: 1000,
      burst_limit: 100
    },
    webhook_config: {
      enabled: false,
      retry_attempts: 3,
      timeout_seconds: 30
    }
  });

  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const addCustomHeader = () => {
    setCustomHeaders(prev => [...prev, { key: '', value: '' }]);
  };

  const updateCustomHeader = (index: number, field: 'key' | 'value', value: string) => {
    setCustomHeaders(prev => prev.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    ));
  };

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Name and description are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare final data with custom headers
      const finalData = {
        ...formData as any,
        security_requirements: {
          ...formData.security_requirements,
          custom_headers: customHeaders.reduce((acc, header) => {
            if (header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          }, {} as Record<string, string>)
        }
      };

      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert([finalData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Connector Created",
        description: `Successfully created connector "${formData.name}".`
      });

      onConnectorCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'external',
        category: 'healthcare',
        base_url: '',
        direction: 'bidirectional',
        version: '1.0.0',
        lifecycle_stage: 'development',
        status: 'active',
        purpose: 'integration',
        documentation_url: '',
        security_requirements: {
          authentication: 'api_key',
          encryption: true,
          rate_limiting: true
        },
        rate_limits: {
          requests_per_hour: 1000,
          burst_limit: 100
        },
        webhook_config: {
          enabled: false,
          retry_attempts: 3,
          timeout_seconds: 30
        }
      });
      setCustomHeaders([]);

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create connector",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Connector</DialogTitle>
          <DialogDescription>
            Add a new external API connector to integrate with your agent workflow
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Connector Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Salesforce CRM API"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this connector does..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="erp">ERP</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                value={formData.base_url}
                onChange={(e) => handleInputChange('base_url', e.target.value)}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Direction</Label>
                <Select value={formData.direction} onValueChange={(value) => handleInputChange('direction', value)}>
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
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentation_url">Documentation URL</Label>
              <Input
                id="documentation_url"
                value={formData.documentation_url}
                onChange={(e) => handleInputChange('documentation_url', e.target.value)}
                placeholder="https://docs.example.com/api"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lifecycle Stage</Label>
                <Select 
                  value={formData.lifecycle_stage} 
                  onValueChange={(value) => handleInputChange('lifecycle_stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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

            {/* Security Settings */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Security Configuration</Label>
              
              <div>
                <Label>Authentication Method</Label>
                <Select 
                  value={formData.security_requirements.authentication} 
                  onValueChange={(value) => handleNestedChange('security_requirements', 'authentication', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="bearer_token">Bearer Token</SelectItem>
                    <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Encryption Required</Label>
                <Switch
                  checked={formData.security_requirements.encryption}
                  onCheckedChange={(value) => handleNestedChange('security_requirements', 'encryption', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Rate Limiting</Label>
                <Switch
                  checked={formData.security_requirements.rate_limiting}
                  onCheckedChange={(value) => handleNestedChange('security_requirements', 'rate_limiting', value)}
                />
              </div>
            </div>

            {/* Rate Limits */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Rate Limits</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="requests_per_hour">Requests/Hour</Label>
                  <Input
                    id="requests_per_hour"
                    type="number"
                    value={formData.rate_limits.requests_per_hour}
                    onChange={(e) => handleNestedChange('rate_limits', 'requests_per_hour', parseInt(e.target.value) || 1000)}
                  />
                </div>

                <div>
                  <Label htmlFor="burst_limit">Burst Limit</Label>
                  <Input
                    id="burst_limit"
                    type="number"
                    value={formData.rate_limits.burst_limit}
                    onChange={(e) => handleNestedChange('rate_limits', 'burst_limit', parseInt(e.target.value) || 100)}
                  />
                </div>
              </div>
            </div>

            {/* Custom Headers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Custom Headers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomHeader}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Header
                </Button>
              </div>

              {customHeaders.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomHeader(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Connector'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};