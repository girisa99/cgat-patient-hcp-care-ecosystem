import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ExternalLink, Upload, RefreshCw, Plus, Search,
  Globe, Code, Settings, CheckCircle, Clock,
  Eye, Map, FileText
} from "lucide-react";
import FieldMappingManager from '../FieldMappingManager';
import PublishingPipelineManager from '../PublishingPipelineManager';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useExternalApiPublishing } from '@/hooks/useExternalApiPublishing';
import { useMasterApiServices } from '@/hooks/useMasterApiServices';

const ExternalIntegrationTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('external');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedApi, setSelectedApi] = useState<any>(null);
  
  const {
    externalApis,
    publishedApis,
    isLoadingExternalApis
  } = useExternalApis();

  const { apiServices } = useMasterApiServices();

  const {
    moveToReview,
    publishApi
  } = useExternalApiPublishing();

  // Get external APIs from main registry - simplified
  const externalIntegrationApis = apiServices?.filter(api => 
    api.type === 'external'
  ) || [];

  // Transform integration APIs to match external API format
  const transformedIntegrationApis = externalIntegrationApis.map(api => ({
    id: api.id,
    external_name: api.name,
    external_description: api.description || '',
    published_at: api.created_at,
    visibility: 'public' as const,
    pricing_model: 'free' as const,
    status: api.status,
    category: api.category,
    created_at: api.created_at,
    base_url: api.base_url,
    version: '1.0.0'
  }));

  // Combine with published external APIs
  const allExternalApis = [
    ...transformedIntegrationApis,
    ...(externalApis || [])
  ];

  // Filter external APIs based on search
  const filteredExternalApis = allExternalApis.filter(api =>
    api.external_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter published APIs based on search
  const filteredPublishedApis = (publishedApis || []).filter(api =>
    api.external_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    console.log('Refreshing external integrations...');
    window.location.reload();
  };

  const handleAddIntegration = () => {
    // Create a modal or redirect to add integration
    const integrationWindow = window.open('', '_blank', 'width=800,height=600');
    if (integrationWindow) {
      integrationWindow.document.write(`
        <html>
          <head>
            <title>Add New Integration</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; font-weight: bold; }
              input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
              button:hover { background: #0056b3; }
            </style>
          </head>
          <body>
            <h1>Add New External Integration</h1>
            <form>
              <div class="form-group">
                <label>Integration Name:</label>
                <input type="text" placeholder="e.g., Healthcare Data API" required>
              </div>
              <div class="form-group">
                <label>Base URL:</label>
                <input type="url" placeholder="https://api.example.com/v1" required>
              </div>
              <div class="form-group">
                <label>Category:</label>
                <select required>
                  <option value="">Select Category</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="patient">Patient Management</option>
                  <option value="clinical">Clinical Data</option>
                  <option value="billing">Billing</option>
                  <option value="scheduling">Scheduling</option>
                </select>
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea rows="3" placeholder="Describe this API integration..."></textarea>
              </div>
              <div class="form-group">
                <label>Authentication Type:</label>
                <select>
                  <option value="api_key">API Key</option>
                  <option value="oauth">OAuth 2.0</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              <button type="submit">Create Integration</button>
            </form>
          </body>
        </html>
      `);
      integrationWindow.document.close();
    }
  };

  const handleViewDetails = (api: any) => {
    const detailsWindow = window.open('', '_blank', 'width=800,height=600');
    if (detailsWindow) {
      detailsWindow.document.write(`
        <html>
          <head>
            <title>${api.external_name} - Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .detail-section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
              .badge { display: inline-block; padding: 4px 8px; background: #007bff; color: white; border-radius: 3px; font-size: 12px; margin-right: 5px; }
              .status-active { background: #28a745; }
              .status-draft { background: #6c757d; }
            </style>
          </head>
          <body>
            <h1>${api.external_name}</h1>
            
            <div class="detail-section">
              <h2>Basic Information</h2>
              <p><strong>Description:</strong> ${api.external_description || 'No description available'}</p>
              <p><strong>Category:</strong> ${api.category || 'Not specified'}</p>
              <p><strong>Version:</strong> ${api.version || '1.0.0'}</p>
              <p><strong>Status:</strong> <span class="badge status-${api.status}">${api.status}</span></p>
            </div>

            <div class="detail-section">
              <h2>Configuration</h2>
              <p><strong>Base URL:</strong> ${api.base_url || 'Not configured'}</p>
              <p><strong>Pricing Model:</strong> ${api.pricing_model || 'Not specified'}</p>
              <p><strong>Visibility:</strong> ${api.visibility || 'Private'}</p>
            </div>

            <div class="detail-section">
              <h2>Timestamps</h2>
              <p><strong>Created:</strong> ${new Date(api.created_at).toLocaleString()}</p>
              ${api.published_at ? `<p><strong>Published:</strong> ${new Date(api.published_at).toLocaleString()}</p>` : ''}
            </div>
          </body>
        </html>
      `);
      detailsWindow.document.close();
    }
  };

  const handleConfigure = (api: any) => {
    // Open an inline configuration dialog instead of a new window
    setShowConfigDialog(true);
    setSelectedApi(api);
  };

  const handleViewLive = (api: any) => {
    if (api.base_url) {
      window.open(api.base_url, '_blank');
    } else {
      alert('No live URL configured for this API');
    }
  };

  const handleCreateMapping = () => {
    const mappingWindow = window.open('', '_blank', 'width=900,height=700');
    if (mappingWindow) {
      mappingWindow.document.write(`
        <html>
          <head>
            <title>Create Field Mapping</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .mapping-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; font-weight: bold; }
              input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
              button:hover { background: #0056b3; }
              .mapping-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px; }
              .add-btn { background: #28a745; }
              .add-btn:hover { background: #1e7e34; }
            </style>
          </head>
          <body>
            <h1>Create Field Mapping</h1>
            
            <div class="mapping-container">
              <div>
                <h2>Source System (Internal)</h2>
                <div class="form-group">
                  <label>Source Table:</label>
                  <select>
                    <option value="">Select Table</option>
                    <option value="profiles">User Profiles</option>
                    <option value="patients">Patients</option>
                    <option value="facilities">Facilities</option>
                    <option value="appointments">Appointments</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Source Field:</label>
                  <input type="text" placeholder="e.g., first_name">
                </div>
              </div>
              
              <div>
                <h2>Target System (External)</h2>
                <div class="form-group">
                  <label>Target API:</label>
                  <select>
                    <option value="">Select API</option>
                    ${allExternalApis.map(api => `<option value="${api.id}">${api.external_name}</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Target Field:</label>
                  <input type="text" placeholder="e.g., firstName">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Transformation Rule:</label>
              <select>
                <option value="direct">Direct Mapping</option>
                <option value="format">Format Transformation</option>
                <option value="concat">Concatenation</option>
                <option value="split">Split Field</option>
                <option value="custom">Custom Function</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Default Value (if source is empty):</label>
              <input type="text" placeholder="Optional default value">
            </div>
            
            <div class="form-group">
              <label>Validation Rules:</label>
              <textarea rows="3" placeholder="JSON validation rules..."></textarea>
            </div>
            
            <button type="button" class="add-btn">Create Mapping</button>
            <button type="button">Cancel</button>
          </body>
        </html>
      `);
      mappingWindow.document.close();
    }
  };

  const handlePublishApi = () => {
    const publishWindow = window.open('', '_blank', 'width=800,height=600');
    if (publishWindow) {
      publishWindow.document.write(`
        <html>
          <head>
            <title>Publish API</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; font-weight: bold; }
              input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
              button:hover { background: #0056b3; }
              .publish-btn { background: #28a745; }
              .publish-btn:hover { background: #1e7e34; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            </style>
          </head>
          <body>
            <h1>Publish API to External Registry</h1>
            
            <div class="warning">
              <strong>Warning:</strong> Publishing will make this API available to external consumers. Ensure all security and compliance requirements are met.
            </div>
            
            <form>
              <div class="form-group">
                <label>Source API:</label>
                <select required>
                  <option value="">Select Internal API to Publish</option>
                  ${apiServices?.map(api => `<option value="${api.id}">${api.name}</option>`).join('') || ''}
                </select>
              </div>
              
              <div class="form-group">
                <label>External Name:</label>
                <input type="text" placeholder="Public name for this API" required>
              </div>
              
              <div class="form-group">
                <label>Public Description:</label>
                <textarea rows="3" placeholder="Description for external consumers..."></textarea>
              </div>
              
              <div class="form-group">
                <label>Visibility:</label>
                <select>
                  <option value="public">Public (discoverable)</option>
                  <option value="private">Private (invite only)</option>
                  <option value="partner">Partner (restricted)</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Pricing Model:</label>
                <select>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Rate Limiting:</label>
                <input type="number" placeholder="Requests per hour" value="1000">
              </div>
              
              <button type="button" class="publish-btn">Publish API</button>
              <button type="button">Cancel</button>
            </form>
          </body>
        </html>
      `);
      publishWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External Integration Management</h2>
          <p className="text-gray-600">Manage external APIs, publishing pipeline, and field mappings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoadingExternalApis}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingExternalApis ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddIntegration}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">External APIs</p>
                <p className="text-2xl font-bold text-blue-900">{externalApis?.length || 0}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">{publishedApis?.length || 0}</p>
              </div>
              <Upload className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Review</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {externalApis?.filter(api => api.status === 'review').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Mappings</p>
                <p className="text-2xl font-bold text-purple-900">
                  {externalApis?.length || 0}
                </p>
              </div>
              <Map className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Consolidated External Integration View */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="external">External APIs</TabsTrigger>
          <TabsTrigger value="publishing">Publishing Pipeline</TabsTrigger>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="external" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>External API Integrations ({filteredExternalApis.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredExternalApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">
                    {searchQuery ? 'No APIs Match Your Search' : 'No External API Integrations'}
                  </h3>
                  <p className="text-sm mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'No external APIs have been integrated yet.'
                    }
                  </p>
                  <Button onClick={handleAddIntegration}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Integration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExternalApis.map((api) => (
                    <Card key={api.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{api.external_name}</h3>
                              <Badge variant={
                                api.status === 'published' ? "default" :
                                api.status === 'draft' ? "secondary" : "outline"
                              }>
                                {api.status}
                              </Badge>
                              <Badge variant="outline">v{api.version}</Badge>
                              {api.category && <Badge variant="outline">{api.category}</Badge>}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {api.external_description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Created: {new Date(api.created_at).toLocaleDateString()}</span>
                              {api.published_at && (
                                <span>Published: {new Date(api.published_at).toLocaleDateString()}</span>
                              )}
                              <span>Pricing: {api.pricing_model}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(api)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConfigure(api)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            {api.base_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={api.base_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Open
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="mt-6">
          <PublishingPipelineManager />
        </TabsContent>

        <TabsContent value="mappings" className="mt-6">
          <FieldMappingManager />
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {selectedApi?.external_name}</DialogTitle>
          </DialogHeader>
          {selectedApi && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">API Name</label>
                <Input 
                  defaultValue={selectedApi.external_name}
                  placeholder="API Name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Base URL</label>
                <Input 
                  defaultValue={selectedApi.base_url || ''}
                  placeholder="https://api.example.com/v1"
                  type="url"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea 
                  defaultValue={selectedApi.external_description || ''}
                  placeholder="Describe this API..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select defaultValue={selectedApi.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input 
                  defaultValue={selectedApi.category || ''}
                  placeholder="e.g., healthcare, patient"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Save configuration logic here
                  setShowConfigDialog(false);
                  console.log('Configuration saved for:', selectedApi.external_name);
                }}>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalIntegrationTab;