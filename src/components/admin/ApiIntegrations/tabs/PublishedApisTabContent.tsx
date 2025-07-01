
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, ExternalLink, Eye, Share2, BarChart3 } from 'lucide-react';

interface PublishedApisTabContentProps {
  consolidatedApis: any[];
  searchTerm: string;
}

export const PublishedApisTabContent: React.FC<PublishedApisTabContentProps> = ({
  consolidatedApis,
  searchTerm
}) => {
  const filteredApis = consolidatedApis.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Published APIs</h2>
          <p className="text-muted-foreground">APIs available in the marketplace</p>
        </div>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Publish New API
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredApis.map((api) => (
          <Card key={api.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {api.description || 'No description available'}
                  </p>
                </div>
                <Globe className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{api.category}</Badge>
                <Badge variant="outline">{api.version}</Badge>
                {api.status === 'published' && (
                  <Badge className="bg-green-100 text-green-800">Published</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Endpoints:</span>
                  <span className="ml-2 font-medium">{api.endpoints_count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2 font-medium">{api.version}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApis.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Published APIs Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'No published APIs match your search criteria.'
              : 'Publish your first API to make it available in the marketplace.'
            }
          </p>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Publish API
          </Button>
        </div>
      )}
    </div>
  );
};
