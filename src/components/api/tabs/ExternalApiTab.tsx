import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, Plus, RefreshCw, Settings, Globe,
  Zap, Clock, Shield, CheckCircle, AlertCircle,
  Search, Cloud, Code, Database
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';

const ExternalApiTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    externalApis,
    publishedApis,
    isLoadingExternalApis
  } = useExternalApis();

  // Filter APIs based on search
  const filteredApis = (externalApis || []).filter(api =>
    api.external_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get known external API integrations (Twilio, OpenAI, etc.)
  const knownExternalApis = [
    {
      name: 'Twilio SMS/Voice',
      category: 'Communication',
      status: 'active',
      type: 'REST',
      description: 'SMS and voice communication services',
      endpoints: ['send-sms', 'make-call', 'verify-phone'],
      configured: true
    },
    {
      name: 'OpenAI GPT',
      category: 'AI/ML',
      status: 'active', 
      type: 'REST',
      description: 'AI language model and chat completions',
      endpoints: ['chat-completions', 'embeddings', 'moderation'],
      configured: true
    },
    {
      name: 'Claude AI',
      category: 'AI/ML',
      status: 'active',
      type: 'REST', 
      description: 'Anthropic Claude AI assistant',
      endpoints: ['messages', 'completions'],
      configured: true
    },
    {
      name: 'NPI Registry',
      category: 'Healthcare',
      status: 'active',
      type: 'REST',
      description: 'National Provider Identifier lookup service',
      endpoints: ['provider-lookup', 'organization-search'],
      configured: true
    },
    {
      name: 'CMS Data',
      category: 'Healthcare',
      status: 'configured',
      type: 'REST',
      description: 'Centers for Medicare & Medicaid Services APIs',
      endpoints: ['provider-data', 'quality-measures'],
      configured: false
    },
    {
      name: 'DocAI',
      category: 'Document Processing',
      status: 'configured',
      type: 'REST',
      description: 'Document AI processing and extraction',
      endpoints: ['document-parse', 'text-extract'],
      configured: false
    }
  ];

  const handleRefresh = () => {
    // Refresh functionality would go here
    console.log('Refreshing external APIs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External API Integrations</h2>
          <p className="text-gray-600">Manage external API connections and third-party services</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoadingExternalApis}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingExternalApis ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search external APIs..."
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
                <p className="text-sm text-blue-600">Total External</p>
                <p className="text-2xl font-bold text-blue-900">{knownExternalApis.length}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {knownExternalApis.filter(api => api.status === 'active').length}
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
                <p className="text-sm text-purple-600">Categories</p>
                <p className="text-2xl font-bold text-purple-900">
                  {new Set(knownExternalApis.map(api => api.category)).size}
                </p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Published</p>
                <p className="text-2xl font-bold text-orange-900">{publishedApis?.length || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Known External APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Known External API Integrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knownExternalApis.map((api, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="truncate">{api.name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={api.status === 'active' ? "default" : "secondary"}>
                      {api.status}
                    </Badge>
                    {api.configured && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {api.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {api.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {api.category}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Endpoints:</span>
                        <div className="mt-1 space-x-1">
                          {api.endpoints.slice(0, 2).map((endpoint, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {endpoint}
                            </Badge>
                          ))}
                          {api.endpoints.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{api.endpoints.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        {api.endpoints.length} endpoints
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Published External APIs */}
      {(publishedApis?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Published External APIs ({publishedApis?.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedApis?.map((api) => (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="truncate">{api.external_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {api.external_description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Version: {api.version}</span>
                        <Badge variant="outline" className="text-xs">
                          {api.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          {api.visibility}
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalApiTab;