
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApiKeys } from '@/hooks/useApiKeys';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Shield,
  Calendar
} from 'lucide-react';

const ApiKeyManager: React.FC = () => {
  console.log('🚀 ApiKeyManager: Component rendering');
  
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  
  const { 
    apiKeys, 
    isLoading, 
    createApiKey, 
    deleteApiKey, 
    isCreating, 
    isDeleting 
  } = useApiKeys();

  const handleCreateKey = async () => {
    if (newKeyName.trim()) {
      await createApiKey(newKeyName.trim());
      setNewKeyName('');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${'*'.repeat(24)}${key.substring(key.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">API Key Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage API keys for accessing your services
          </p>
        </div>
        <Badge variant="outline">{apiKeys?.length || 0} keys</Badge>
      </div>

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter key name (e.g., Production API)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
            />
            <Button 
              onClick={handleCreateKey}
              disabled={!newKeyName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys && apiKeys.length > 0 ? (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {showKey[apiKey.id] ? apiKey.key_value : maskApiKey(apiKey.key_value)}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key_value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {new Date(apiKey.created_at).toLocaleDateString()}
                      </span>
                      {apiKey.last_used_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteApiKey(apiKey.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first API key to start accessing your services programmatically.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;
