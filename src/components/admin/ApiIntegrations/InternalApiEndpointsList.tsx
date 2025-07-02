
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Eye, Download, Copy, ExternalLink } from 'lucide-react';

interface InternalApiEndpointsListProps {
  apis: any[];
  searchTerm: string;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const InternalApiEndpointsList: React.FC<InternalApiEndpointsListProps> = ({
  apis,
  searchTerm,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const filteredApis = apis.filter(api => 
    !searchTerm || 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredApis.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Internal APIs</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm 
              ? `No internal APIs match "${searchTerm}"`
              : "You haven't created any internal APIs yet. Internal APIs will appear here."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Internal APIs ({filteredApis.length})</h3>
      </div>

      <div className="grid gap-4">
        {filteredApis.map((api, index) => (
          <Card key={api.id || index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {api.name || `Internal API ${index + 1}`}
                </CardTitle>
                <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                  {api.status || 'active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {api.description || 'Internal API service'}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{api.version || '1.0.0'}</Badge>
                <Badge variant="outline">{api.category || 'API'}</Badge>
                {api.endpoints_count && (
                  <Badge variant="outline">{api.endpoints_count} endpoints</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(api.id)}
                >
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
