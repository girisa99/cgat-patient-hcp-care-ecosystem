
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Download, Eye, Copy, ExternalLink } from 'lucide-react';
import CreateIntegrationDialog from '../CreateIntegrationDialog';

interface ExternalApisTabContentProps {
  externalApis?: any[];
  searchTerm?: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const ExternalApisTabContent: React.FC<ExternalApisTabContentProps> = ({
  externalApis = [],
  searchTerm = '',
  createDialogOpen,
  setCreateDialogOpen,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const filteredApis = externalApis.filter(api => 
    !searchTerm || 
    (api.external_name || api.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (api.external_description || api.description)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredApis.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No External APIs</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm 
              ? `No external APIs match "${searchTerm}"`
              : "You haven't integrated any external APIs yet. External APIs will appear here."
            }
          </p>
          <CreateIntegrationDialog 
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">External APIs ({filteredApis.length})</h3>
        <CreateIntegrationDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>

      <div className="grid gap-4">
        {filteredApis.map((api, index) => (
          <Card key={api.id || index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {api.external_name || api.name || `External API ${index + 1}`}
                </CardTitle>
                <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                  {api.status || 'active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {api.external_description || api.description || 'External API integration'}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{api.version || '1.0.0'}</Badge>
                <Badge variant="outline">{api.category || 'API'}</Badge>
                {api.external_api_endpoints && (
                  <Badge variant="outline">{api.external_api_endpoints.length} endpoints</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewDetails(api.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDownloadCollection(api.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCopyUrl(api.base_url || api.documentation_url || '#')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button variant="outline" size="sm" onClick={() => onViewDocumentation(api.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
