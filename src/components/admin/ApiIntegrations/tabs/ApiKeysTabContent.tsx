import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Shield, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  type: string;
  status: string;
  permissions: string[];
  modules: string[];
  rate_limit_requests: number;
  rate_limit_period: string;
  usage_count: number;
  last_used: string | null;
  expires_at: string | null;
  created_at: string;
  user_id: string;
}

export const ApiKeysTabContent: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real API keys data
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      console.log('🔍 Fetching real API keys...');
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API keys:', error);
        throw error;
      }

      console.log('✅ Real API keys fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 30000
  });

  // Create API key mutation with fixed user_id assignment
  const createApiKeyMutation = useMutation({
    mutationFn: async (keyData: {
      name: string;
      type: string;
      permissions: string[];
      modules: string[];
      rate_limit_requests: number;
      rate_limit_period: string;
      expires_at?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('generate_api_key', {
        key_type: keyData.type
      });

      if (error) throw error;

      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
      const hashArray = Array.from(new Uint8Array(keyHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: insertData, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          ...keyData,
          user_id: user.user.id, // Fix: Add required user_id field
          key_hash: hashHex,
          key_prefix: data.split('_')[0] + '_' + data.split('_')[1] + '_'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return { ...insertData, full_key: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setShowCreateDialog(false);
      toast({
        title: "✅ API Key Created",
        description: "New API key has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    }
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
      return keyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "✅ API Key Deleted",
        description: "API key has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    }
  });

  // Filter API keys based on search
  const filteredApiKeys = (apiKeys || []).filter((key: ApiKey) =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate real metrics
  const keyMetrics = React.useMemo(() => {
    const keys = apiKeys || [];
    return {
      total: keys.length,
      active: keys.filter(k => k.status === 'active').length,
      expired: keys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length,
      totalUsage: keys.reduce((sum, k) => sum + k.usage_count, 0),
      averageUsage: keys.length > 0 ? Math.round(keys.reduce((sum, k) => sum + k.usage_count, 0) / keys.length) : 0
    };
  }, [apiKeys]);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied",
      description: `${type} copied to clipboard`,
    });
  };

  const handleCreateKey = (formData: FormData) => {
    const keyData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      permissions: (formData.get('permissions') as string)?.split(',') || [],
      modules: (formData.get('modules') as string)?.split(',') || [],
      rate_limit_requests: parseInt(formData.get('rate_limit_requests') as string) || 1000,
      rate_limit_period: formData.get('rate_limit_period') as string || 'hour',
      expires_at: formData.get('expires_at') as string || undefined
    };

    createApiKeyMutation.mutate(keyData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading real API keys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Error loading API keys: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real API Keys Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{keyMetrics.total}</p>
                <p className="text-sm text-muted-foreground">Total Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{keyMetrics.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{keyMetrics.expired}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{keyMetrics.totalUsage.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{keyMetrics.averageUsage}</p>
                <p className="text-sm text-muted-foreground">Avg Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Create */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">API Keys ({filteredApiKeys.length})</h3>
          <Input
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateKey(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="type">Key Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rate_limit_requests">Rate Limit (requests)</Label>
                <Input id="rate_limit_requests" name="rate_limit_requests" type="number" defaultValue={1000} />
              </div>
              <div>
                <Label htmlFor="rate_limit_period">Rate Limit Period</Label>
                <Select name="rate_limit_period" defaultValue="hour">
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
              <Button type="submit" disabled={createApiKeyMutation.isPending}>
                {createApiKeyMutation.isPending ? 'Creating...' : 'Create Key'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {filteredApiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No Matching API Keys' : 'No API Keys'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? `No API keys match "${searchTerm}"`
                  : "Create your first API key to start accessing healthcare APIs"
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredApiKeys.map((key: ApiKey) => {
            const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
            
            return (
              <Card key={key.id} className={`border-l-4 ${isExpired ? 'border-l-red-500' : key.status === 'active' ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {key.name}
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                      <Badge variant="outline">{key.type}</Badge>
                      {isExpired && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteApiKeyMutation.mutate(key.id)}
                        disabled={deleteApiKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Usage Count</Label>
                        <p className="text-sm">{key.usage_count.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Rate Limit</Label>
                        <p className="text-sm">{key.rate_limit_requests}/{key.rate_limit_period}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Used</Label>
                        <p className="text-sm">
                          {key.last_used 
                            ? new Date(key.last_used).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Expires</Label>
                        <p className="text-sm">
                          {key.expires_at 
                            ? new Date(key.expires_at).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Key Value */}
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type={showKeyValue[key.id] ? 'text' : 'password'}
                          value={showKeyValue[key.id] ? `${key.key_prefix}${'*'.repeat(24)}` : '●'.repeat(32)}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {showKeyValue[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${key.key_prefix}${'*'.repeat(24)}`, 'API Key')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions & Modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Permissions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.permissions.length > 0 ? (
                            key.permissions.map(permission => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No specific permissions</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Modules</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.modules.length > 0 ? (
                            key.modules.map(module => (
                              <Badge key={module} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">All modules</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
