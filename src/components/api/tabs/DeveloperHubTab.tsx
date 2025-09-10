import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, FileText, Key, Plus, RefreshCw, Search,
  CheckCircle, Clock, Eye, ExternalLink, X, Users,
  Shield, Download, Book, TestTube, Settings,
  Globe, PlayCircle, Database, Zap
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useTesting } from '@/hooks/useTesting';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ApiSandboxEnvironment from '../ApiSandboxEnvironment';
import ApiEndpointManager from '../ApiEndpointManager';
import ApiKeyManager from '../ApiKeyManager';
import PostmanCollectionManager from '../PostmanCollectionManager';
import RoleBasedApiDocumentation from '../RoleBasedApiDocumentation';
import { DOMSecurity } from '@/utils/security/domSecurity';
import { useRealTimeRoleSync } from '@/hooks/useRealTimeRoleSync';

const DeveloperHubTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('sandbox');
  
  // Real-time sync for developer hub updates
  const { isConnected, hasUpdates, updateCount } = useRealTimeRoleSync();
  
  const { apiServices, isLoading } = useMasterApiServices();
  const { publishedApis } = useExternalApis();
  const { apiKeys } = useApiKeys();
  const { testCases } = useTesting();

  // Get real endpoint count from database
  const { data: endpointCount = 0 } = useQuery({
    queryKey: ['endpoint-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('api_endpoints')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 300000,
  });

  // Get all active APIs for developer access
  const developerApis = apiServices?.filter(api => 
    api.status === 'active'
  ) || [];

  const handleRefresh = () => {
    console.log('Refreshing developer hub...');
    // Refresh functionality would be implemented here
    window.location.reload();
  };

  const handleNewApiKey = () => {
    // Switch to the API keys tab and trigger create dialog
    setActiveSubTab('keys');
    // Add a small delay to ensure tab is active before triggering dialog
    setTimeout(() => {
      const createButton = document.querySelector('[data-testid="create-api-key-trigger"]') as HTMLButtonElement;
      if (createButton) {
        createButton.click();
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Developer Hub
            {isConnected && hasUpdates && (
              <Badge variant="destructive" className="text-xs">
                {updateCount} updates
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">
            Sandbox, published APIs, endpoints, Postman, API keys, and testing
            {isConnected && <span className="text-green-600 ml-2">• Real-time sync active</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleNewApiKey}>
            <Plus className="h-4 w-4 mr-2" />
            New API Key
          </Button>
        </div>
      </div>

      {/* Developer Hub Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Published APIs</p>
                <p className="text-2xl font-bold text-blue-900">{developerApis.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">API Keys</p>
                <p className="text-2xl font-bold text-green-900">{apiKeys?.length || 0}</p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Endpoints</p>
                <p className="text-2xl font-bold text-purple-900">{endpointCount}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Test Cases</p>
                <p className="text-2xl font-bold text-orange-900">{testCases?.length || 0}</p>
              </div>
              <TestTube className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600">Sandbox</p>
                <p className="text-2xl font-bold text-cyan-900">Active</p>
              </div>
              <PlayCircle className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search APIs, keys, endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Developer Hub Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="published">Published APIs</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="postman">Postman</TabsTrigger>
          <TabsTrigger value="documentation">Docs</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="sandbox" className="mt-6">
          <ApiSandboxEnvironment />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Published APIs ({developerApis.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {developerApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No Published APIs</h3>
                  <p className="text-sm mb-4">No APIs have been published for external consumption yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {developerApis.map((api) => (
                    <Card key={api.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="truncate">{api.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{api.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <Badge variant="outline">{api.category}</Badge>
                          <Badge variant={api.status === 'active' ? "default" : "secondary"}>
                            {api.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              DOMSecurity.createAPIDetailsWindow(api, 'api');
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              // Create documentation window - simplified approach for now
                              DOMSecurity.createAPIDetailsWindow({
                                ...api,
                                name: `${api.name} - Documentation`,
                                description: 'API Documentation and endpoints'
                              }, 'api');
                            }}
                          >
                            <Code className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6">
          <ApiEndpointManager />
        </TabsContent>

        <TabsContent value="postman" className="mt-6">
          <PostmanCollectionManager />
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <RoleBasedApiDocumentation />
        </TabsContent>

        <TabsContent value="keys" className="mt-6">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Role-Based Testing Suite</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Comprehensive Role-Based Testing</h3>
                <p className="text-gray-600 mb-6">
                  Access testing suites, documentation, and architecture docs specific to your role
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    onClick={() => {
                      // Navigate to role-based testing suite
                      window.open('/testing-suite', '_blank');
                    }}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Open Testing Suite
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Test Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperHubTab;