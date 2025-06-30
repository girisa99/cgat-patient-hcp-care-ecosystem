
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  ExternalLink, 
  Database, 
  Shield, 
  FileText, 
  Code2, 
  GitBranch,
  Settings,
  Eye,
  Copy,
  Download,
  Activity,
  Phone,
  MessageSquare,
  Stethoscope
} from 'lucide-react';
import { Section } from '@/components/ui/layout/Section';
import { CreateIntegrationDialog } from '../CreateIntegrationDialog';

interface ExternalApisTabContentProps {
  externalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const ExternalApisTabContent: React.FC<ExternalApisTabContentProps> = ({
  externalApis,
  searchTerm,
  createDialogOpen,
  setCreateDialogOpen,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const filteredApis = externalApis.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (api.description && api.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'communications':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'healthcare verification':
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      default:
        return <Globe className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'deprecated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Section 
      variant="card" 
      title="External APIs We're Consuming" 
      subtitle={`Third-party APIs integrated with comprehensive processes (${filteredApis.length} active integrations)`}
      headerActions={
        <CreateIntegrationDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      }
    >
      {filteredApis.length > 0 ? (
        <div className="space-y-6">
          {filteredApis.map((api) => (
            <Card key={api.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(api.category)}
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      <Badge variant="outline">External</Badge>
                      <Badge variant={getStatusColor(api.status) as any}>
                        {api.status}
                      </Badge>
                      {api.direction && (
                        <Badge variant="secondary">{api.direction}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {api.description}
                    </p>
                    {api.baseUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3" />
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {api.baseUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCopyUrl(api.baseUrl)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(api.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {api.documentation?.specificationUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDocumentation(api.id)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        API Docs
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadCollection(api.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Collection
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* API Integration Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="font-semibold">{api.endpoints?.length || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Endpoints</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Code2 className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-semibold">{Object.keys(api.schemas || {}).length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Schemas</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="h-4 w-4 text-purple-600 mr-1" />
                      <span className="font-semibold">{api.rlsPolicies?.length || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">RLS Policies</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <GitBranch className="h-4 w-4 text-orange-600 mr-1" />
                      <span className="font-semibold">{api.mappings?.length || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Mappings</p>
                  </div>
                </div>

                {/* Comprehensive Integration Processes */}
                {api.documentation && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Integration Processes & Documentation
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Field Mappings */}
                      {api.documentation.fieldMappings && api.documentation.fieldMappings.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            Field Mappings ({api.documentation.fieldMappings.length})
                          </p>
                          <div className="space-y-1">
                            {api.documentation.fieldMappings.slice(0, 3).map((mapping: any, index: number) => (
                              <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                                <code className="text-blue-700">{mapping.externalField}</code>
                                <span className="mx-1">←</span>
                                <code className="text-green-700">{mapping.internalField}</code>
                                {mapping.description && (
                                  <p className="text-muted-foreground mt-1">{mapping.description}</p>
                                )}
                              </div>
                            ))}
                            {api.documentation.fieldMappings.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{api.documentation.fieldMappings.length - 3} more mappings
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Generated Database Tables */}
                      {api.documentation.databaseTables && api.documentation.databaseTables.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            Database Tables ({api.documentation.databaseTables.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {api.documentation.databaseTables.map((table: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generated Schemas */}
                      {api.documentation.generatedSchemas && api.documentation.generatedSchemas.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Code2 className="h-3 w-3" />
                            Generated Schemas ({api.documentation.generatedSchemas.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {api.documentation.generatedSchemas.map((schema: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {schema}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RLS Policies */}
                      {api.documentation.rlsPolicies && api.documentation.rlsPolicies.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Security Policies ({api.documentation.rlsPolicies.length})
                          </p>
                          <div className="space-y-1">
                            {api.documentation.rlsPolicies.slice(0, 2).map((policy: any, index: number) => (
                              <div key={index} className="text-xs bg-purple-50 p-2 rounded">
                                <p className="font-medium text-purple-700">{policy.table}</p>
                                <p className="text-muted-foreground">{policy.policy}</p>
                              </div>
                            ))}
                            {api.documentation.rlsPolicies.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{api.documentation.rlsPolicies.length - 2} more policies
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Endpoint Mappings */}
                    {api.documentation.endpoints && api.documentation.endpoints.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Endpoint Mappings ({api.documentation.endpoints.length})
                        </p>
                        <div className="space-y-1">
                          {api.documentation.endpoints.slice(0, 3).map((endpoint: any, index: number) => (
                            <div key={index} className="text-xs bg-green-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{endpoint.method}</Badge>
                                <code className="text-green-700">{endpoint.internal_path}</code>
                                <span>→</span>
                                <code className="text-blue-700">{endpoint.external_path}</code>
                              </div>
                              <p className="text-muted-foreground mt-1">{endpoint.purpose}</p>
                            </div>
                          ))}
                          {api.documentation.endpoints.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{api.documentation.endpoints.length - 3} more endpoints
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* API Details */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Version: {api.version}</span>
                    {api.category && <span>Category: {api.category}</span>}
                    <span>Updated: {new Date(api.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No External APIs Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No external APIs match "${searchTerm}"`
              : "No external APIs are currently being consumed."
            }
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Globe className="h-4 w-4 mr-2" />
            Add External API
          </Button>
        </div>
      )}
    </Section>
  );
};
