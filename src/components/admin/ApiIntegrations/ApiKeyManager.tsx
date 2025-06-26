
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2, 
  RefreshCw,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyConfig {
  name: string;
  type: 'development' | 'production' | 'sandbox';
  modules: string[];
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  expiresAt?: string;
  ipWhitelist?: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'development' | 'production' | 'sandbox';
  modules: string[];
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

const ApiKeyManager = () => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const availableModules = [
    { id: 'patients', name: 'Patient Management' },
    { id: 'facilities', name: 'Facility Management' },
    { id: 'users', name: 'User Management' },
    { id: 'appointments', name: 'Appointments' },
    { id: 'billing', name: 'Billing' },
  ];

  const availablePermissions = [
    { id: 'read', name: 'Read Access' },
    { id: 'write', name: 'Write Access' },
    { id: 'delete', name: 'Delete Access' },
    { id: 'admin', name: 'Admin Access' },
  ];

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Healthcare App Dev',
      key: 'hc_dev_1a2b3c4d5e6f7g8h9i0j',
      type: 'development',
      modules: ['patients', 'facilities'],
      permissions: ['read', 'write'],
      rateLimit: { requests: 1000, period: 'hour' },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      lastUsed: '2024-01-20T14:30:00Z',
      usageCount: 2450
    }
  ]);

  const generateApiKey = (type: string): string => {
    const prefix = type === 'production' ? 'hc_prod_' : type === 'sandbox' ? 'hc_sandbox_' : 'hc_dev_';
    const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return prefix + randomStr;
  };

  const handleCreateApiKey = (config: ApiKeyConfig) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: config.name,
      key: generateApiKey(config.type),
      type: config.type,
      modules: config.modules,
      permissions: config.permissions,
      rateLimit: config.rateLimit,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsed: undefined,
      usageCount: 0
    };

    setApiKeys([...apiKeys, newKey]);
    setShowCreateDialog(false);
    
    toast({
      title: "API Key Created",
      description: `${config.name} has been created successfully.`,
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const CreateApiKeyDialog = () => {
    const [config, setConfig] = useState<ApiKeyConfig>({
      name: '',
      type: 'development',
      modules: [],
      permissions: ['read'],
      rateLimit: { requests: 1000, period: 'hour' }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!config.name || config.modules.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please provide a name and select at least one module.",
          variant: "destructive"
        });
        return;
      }
      handleCreateApiKey(config);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyName">API Key Name</Label>
          <Input
            id="keyName"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="e.g., Mobile App Development"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keyType">Environment Type</Label>
          <Select value={config.type} onValueChange={(value: 'development' | 'production' | 'sandbox') => setConfig({ ...config, type: value })}>
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
        
        <div className="space-y-2">
          <Label>API Modules</Label>
          <div className="grid grid-cols-1 gap-2">
            {availableModules.map((module) => (
              <div key={module.id} className="flex items-center space-x-2">
                <Checkbox
                  id={module.id}
                  checked={config.modules.includes(module.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig({ ...config, modules: [...config.modules, module.id] });
                    } else {
                      setConfig({ ...config, modules: config.modules.filter(m => m !== module.id) });
                    }
                  }}
                />
                <Label htmlFor={module.id}>{module.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2">
            {availablePermissions.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={permission.id}
                  checked={config.permissions.includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig({ ...config, permissions: [...config.permissions, permission.id] });
                    } else {
                      setConfig({ ...config, permissions: config.permissions.filter(p => p !== permission.id) });
                    }
                  }}
                />
                <Label htmlFor={permission.id}>{permission.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Rate Limit (requests)</Label>
            <Input
              id="rateLimit"
              type="number"
              value={config.rateLimit.requests}
              onChange={(e) => setConfig({
                ...config,
                rateLimit: { ...config.rateLimit, requests: parseInt(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePeriod">Per</Label>
            <Select
              value={config.rateLimit.period}
              onValueChange={(value: 'minute' | 'hour' | 'day') => setConfig({
                ...config,
                rateLimit: { ...config.rateLimit, period: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minute">Minute</SelectItem>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Create API Key
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">API Key Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage API keys for different environments and modules
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <CreateApiKeyDialog />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.filter(k => k.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((acc, key) => acc + key.usageCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all keys
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All keys encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <Badge variant={apiKey.type === 'production' ? 'default' : 'secondary'}>
                      {apiKey.type}
                    </Badge>
                    <Badge variant={apiKey.status === 'active' ? 'secondary' : 'destructive'}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    {visibleKeys.has(apiKey.id) ? (
                      <span className="bg-gray-100 px-2 py-1 rounded">{apiKey.key}</span>
                    ) : (
                      <span className="bg-gray-100 px-2 py-1 rounded">{'*'.repeat(20)}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rate Limit</p>
                  <p className="font-medium">{apiKey.rateLimit.requests}/{apiKey.rateLimit.period}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usage</p>
                  <p className="font-medium">{apiKey.usageCount} calls</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modules</p>
                  <p className="font-medium">{apiKey.modules.length} modules</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(apiKey.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Used</p>
                  <p className="font-medium">
                    {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Modules:</p>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.modules.map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">{module}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">{permission}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApiKeyManager;
