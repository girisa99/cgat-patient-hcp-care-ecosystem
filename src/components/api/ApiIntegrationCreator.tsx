import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, ExternalLink, Settings, CheckCircle, 
  AlertCircle, Clock, Code, Shield
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useMasterToast } from '@/hooks/useMasterToast';

interface IntegrationForm {
  name: string;
  base_url: string;
  category: string;
  description: string;
  auth_type: string;
  status: string;
  type: string;
  direction: string;
  purpose: string;
}

interface ApiIntegrationCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiIntegrationCreator: React.FC<ApiIntegrationCreatorProps> = ({
  isOpen,
  onClose
}) => {
  const [form, setForm] = useState<IntegrationForm>({
    name: '',
    base_url: '',
    category: '',
    description: '',
    auth_type: 'api_key',
    status: 'active',
    type: 'external',
    direction: 'inbound',
    purpose: 'data_integration'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  
  const { createApiService } = useMasterApiServices();
  const { showSuccess, showError } = useMasterToast();

  const categories = [
    'healthcare',
    'patient_management',
    'clinical_data',
    'billing',
    'scheduling',
    'analytics',
    'communication',
    'compliance'
  ];

  const authTypes = [
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth', label: 'OAuth 2.0' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'custom', label: 'Custom Auth' }
  ];

  const directions = [
    { value: 'inbound', label: 'Inbound (Receive data)' },
    { value: 'outbound', label: 'Outbound (Send data)' },
    { value: 'bidirectional', label: 'Bidirectional' }
  ];

  const purposes = [
    { value: 'data_integration', label: 'Data Integration' },
    { value: 'notification', label: 'Notifications' },
    { value: 'synchronization', label: 'Data Synchronization' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'automation', label: 'Process Automation' },
    { value: 'analytics', label: 'Analytics' }
  ];

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showError('Please provide an integration name');
      return;
    }
    
    if (!form.base_url.trim()) {
      showError('Please provide a base URL');
      return;
    }
    
    if (!form.category) {
      showError('Please select a category');
      return;
    }

    setIsCreating(true);
    
    try {
      await createApiService({
        name: form.name,
        description: form.description,
        type: form.type,
        direction: form.direction,
        purpose: form.purpose,
        category: form.category
      });
      
      showSuccess('Integration created successfully');
      onClose();
      
      // Reset form
      setForm({
        name: '',
        base_url: '',
        category: '',
        description: '',
        auth_type: 'api_key',
        status: 'active',
        type: 'external',
        direction: 'inbound',
        purpose: 'data_integration'
      });
    } catch (error) {
      showError('Failed to create integration');
      console.error('Create integration error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New API Integration</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Integration Name *</label>
                <Input
                  placeholder="e.g., Healthcare Data API"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Base URL *</label>
                <Input
                  placeholder="https://api.example.com/v1"
                  value={form.base_url}
                  onChange={(e) => setForm(prev => ({ ...prev, base_url: e.target.value }))}
                />
                {form.base_url && !validateUrl(form.base_url) && (
                  <p className="text-sm text-red-600 mt-1">Please enter a valid URL</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe this API integration..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Direction</label>
                  <Select value={form.direction} onValueChange={(value) => setForm(prev => ({ ...prev, direction: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {directions.map(direction => (
                        <SelectItem key={direction.value} value={direction.value}>
                          {direction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Purpose</label>
                  <Select value={form.purpose} onValueChange={(value) => setForm(prev => ({ ...prev, purpose: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map(purpose => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Authentication Type</label>
                <Select value={form.auth_type} onValueChange={(value) => setForm(prev => ({ ...prev, auth_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map(auth => (
                      <SelectItem key={auth.value} value={auth.value}>
                        {auth.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Features</span>
                </h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• SSL/TLS encryption required</li>
                  <li>• Authentication tokens are encrypted</li>
                  <li>• Rate limiting protection enabled</li>
                  <li>• Audit logging for all requests</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{form.name || 'Integration Name'}</h4>
                    <p className="text-sm text-gray-600">
                      {form.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{form.category || 'category'}</Badge>
                    <Badge>{form.direction}</Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>URL:</strong> {form.base_url || 'https://api.example.com'}</p>
                  <p><strong>Auth:</strong> {authTypes.find(a => a.value === form.auth_type)?.label}</p>
                  <p><strong>Purpose:</strong> {purposes.find(p => p.value === form.purpose)?.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isCreating || !form.name.trim() || !form.base_url.trim() || !form.category}
            >
              {isCreating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Integration
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiIntegrationCreator;