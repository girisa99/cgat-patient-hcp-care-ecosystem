
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Eye, Copy, ExternalLink } from 'lucide-react';

interface PublishedApisTabContentProps {
  publishedApis?: any[];
  searchTerm?: string;
}

export const PublishedApisTabContent: React.FC<PublishedApisTabContentProps> = ({
  publishedApis = [],
  searchTerm = ''
}) => {
  const filteredApis = publishedApis.filter(api => 
    !searchTerm || 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (filteredApis.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Published APIs</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm 
              ? `No published APIs match "${searchTerm}"`
              : "You haven't published any APIs yet. Published APIs will appear here."
            }
          </p>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn About Publishing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Published APIs ({filteredApis.length})</h3>
        <Badge variant="outline">{filteredApis.length} published</Badge>
      </div>

      <div className="grid gap-4">
        {filteredApis.map((api, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {api.name || `Published API ${index + 1}`}
                </CardTitle>
                <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                  {api.status || 'published'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {api.description || 'Published API available for external consumption'}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{api.version || '1.0.0'}</Badge>
                <Badge variant="outline">{api.category || 'API'}</Badge>
                {api.endpoints && (
                  <Badge variant="outline">{api.endpoints.length} endpoints</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyUrl(api.url || api.baseUrl || '#')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button variant="outline" size="sm">
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
