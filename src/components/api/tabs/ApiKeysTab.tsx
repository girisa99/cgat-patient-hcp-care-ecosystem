import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Key, Plus, RefreshCw, Trash2, Eye, EyeOff,
  Copy, CheckCircle, AlertCircle, Search, Shield
} from "lucide-react";
import { useApiKeys } from '@/hooks/useApiKeys';

const ApiKeysTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  
  const {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    createApiKey,
    deleteApiKey
  } = useApiKeys();

  // Filter keys based on search
  const filteredKeys = (apiKeys || []).filter(key =>
    key.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.permissions?.some(perm => perm.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRefresh = () => {
    fetchApiKeys();
  };

  const handleCreateKey = async () => {
    try {
      await createApiKey({
        name: 'New API Key',
        key_prefix: 'ak_' + Math.random().toString(36).substring(2, 10),
        key_hash: 'hashed_key_value',
        type: 'standard',
        status: 'active',
        permissions: ['api.read'],
        modules: ['api-services'],
        user_id: 'current-user-id'
      });
    } catch (err) {
      console.error('Failed to create API key:', err);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys Management</h2>
          <p className="text-gray-600">Generate and manage API keys for authentication and testing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateKey}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Key
          </Button>
        </div>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Keys</p>
                <p className="text-2xl font-bold text-blue-900">{apiKeys?.length || 0}</p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {apiKeys?.filter(key => key.status === 'active').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Standard</p>
                <p className="text-2xl font-bold text-purple-900">
                  {apiKeys?.filter(key => key.type === 'standard').length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Admin</p>
                <p className="text-2xl font-bold text-orange-900">
                  {apiKeys?.filter(key => key.type === 'admin').length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error Loading API Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Keys ({filteredKeys.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'No Keys Match Your Search' : 'No API Keys Found'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'No API keys have been generated yet.'
                }
              </p>
              <Button onClick={handleCreateKey}>
                <Plus className="h-4 w-4 mr-2" />
                Generate First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKeys.map((apiKey) => (
                <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{apiKey.name}</h3>
                          <Badge variant={apiKey.status === 'active' ? "default" : "secondary"}>
                            {apiKey.status}
                          </Badge>
                          <Badge variant="outline">
                            {apiKey.type}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Key:</span>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {visibleKeys.has(apiKey.id) 
                                ? `${apiKey.key_prefix}...${apiKey.key_hash.slice(-8)}`
                                : `${apiKey.key_prefix}${'*'.repeat(16)}`
                              }
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {visibleKeys.has(apiKey.id) ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${apiKey.key_prefix}...${apiKey.key_hash.slice(-8)}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Usage: {apiKey.usage_count}</span>
                            <span>Last used: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}</span>
                            <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions?.map((permission, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Using API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Postman:</strong> Add the API key to headers as 'Authorization: Bearer YOUR_API_KEY'</p>
            <p><strong>curl:</strong> curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/endpoint</p>
            <p><strong>JavaScript:</strong> headers: {'Authorization': 'Bearer YOUR_API_KEY'}</p>
            <p className="text-orange-600 font-medium mt-3">⚠️ Keep your API keys secure and never expose them in client-side code</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysTab;