import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Key, Plus, Search, Eye, EyeOff, Trash2, 
  Copy, Settings, AlertTriangle, Clock
} from "lucide-react";
import { useApiKeys } from '@/hooks/useApiKeys';
import { useMasterToast } from '@/hooks/useMasterToast';

interface CreateApiKeyForm {
  name: string;
  type: string;
  permissions: string[];
  modules: string[];
  expires_at?: string;
}

const ApiKeyManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [createForm, setCreateForm] = useState<CreateApiKeyForm>({
    name: '',
    type: 'development',
    permissions: [],
    modules: []
  });

  const { 
    apiKeys, 
    isLoading, 
    createApiKey, 
    deleteApiKey, 
    fetchApiKeys 
  } = useApiKeys();
  const { showSuccess, showError } = useMasterToast();

  const availablePermissions = [
    'read', 'write', 'delete', 'admin', 'api_access', 'sandbox_access'
  ];

  const availableModules = [
    'user_management', 'patient_management', 'facility_management', 
    'api_integration', 'testing', 'analytics'
  ];

  const filteredKeys = apiKeys.filter(key => 
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('API key copied to clipboard');
  };

  const handleCreateApiKey = async () => {
    if (!createForm.name.trim()) {
      showError('Please provide a name for the API key');
      return;
    }

    try {
      await createApiKey({
        name: createForm.name,
        type: createForm.type,
        permissions: createForm.permissions,
        modules: createForm.modules,
        user_id: '', // Will be set by the hook
        key_prefix: '',
        key_hash: '',
        status: 'active'
      });
      
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        type: 'development',
        permissions: [],
        modules: []
      });
      showSuccess('API key created successfully');
    } catch (error) {
      showError('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyId: string, keyName: string) => {
    if (window.confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      try {
        await deleteApiKey(keyId);
        showSuccess('API key deleted successfully');
      } catch (error) {
        showError('Failed to delete API key');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'sandbox': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Key className="h-6 w-6" />
            <span>API Keys</span>
          </h2>
          <p className="text-gray-600">Manage API keys for secure access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  placeholder="API Key Name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select 
                  value={createForm.type} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Permissions</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={createForm.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCreateForm(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission]
                            }));
                          } else {
                            setCreateForm(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={permission} className="text-sm capitalize">
                        {permission.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Modules</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableModules.map((module) => (
                    <div key={module} className="flex items-center space-x-2">
                      <Checkbox
                        id={module}
                        checked={createForm.modules.includes(module)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCreateForm(prev => ({
                              ...prev,
                              modules: [...prev.modules, module]
                            }));
                          } else {
                            setCreateForm(prev => ({
                              ...prev,
                              modules: prev.modules.filter(m => m !== module)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={module} className="text-sm capitalize">
                        {module.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateApiKey}>
                  Create Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.status === 'active').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Production Keys</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.type === 'production').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Used</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.last_used).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search API keys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {filteredKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{apiKey.name}</h3>
                    <Badge className={getTypeColor(apiKey.type)}>
                      {apiKey.type}
                    </Badge>
                    <Badge className={getStatusColor(apiKey.status)}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {visibleKeys.has(apiKey.id) 
                        ? `${apiKey.key_prefix}${'*'.repeat(32)}`
                        : `${apiKey.key_prefix}${'*'.repeat(32)}`
                      }
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${apiKey.key_prefix}${apiKey.key_hash}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Usage: {apiKey.usage_count}</span>
                    <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                    {apiKey.last_used && (
                      <span>Last Used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Permissions:</span>
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteApiKey(apiKey.id, apiKey.name)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKeys.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No API keys found</h3>
          <p className="text-sm">Create your first API key to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;