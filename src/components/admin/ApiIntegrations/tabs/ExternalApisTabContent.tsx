
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Globe, Eye, TestTube } from 'lucide-react';

interface ExternalApisTabContentProps {
  externalApis: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPublishClick: () => void;
  onViewDetails: (id: string) => void;
  onTestEndpoint: (endpoint: any) => void;
}

export const ExternalApisTabContent: React.FC<ExternalApisTabContentProps> = ({
  externalApis,
  searchTerm,
  onSearchChange,
  onPublishClick,
  onViewDetails,
  onTestEndpoint
}) => {
  const filteredApis = externalApis.filter(api => 
    api.external_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Publish */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search external APIs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onPublishClick}>
          <Globe className="h-4 w-4 mr-2" />
          Publish API
        </Button>
      </div>

      {/* APIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredApis.map((api) => (
          <Card key={api.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{api.external_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                    <Badge variant="outline">{api.version}</Badge>
                    <Badge variant={api.visibility === 'public' ? 'default' : 'secondary'}>
                      {api.visibility}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(api.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTestEndpoint(api)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-4">
                {api.external_description || 'No description available'}
              </CardDescription>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{api.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pricing:</span>
                  <span className="font-medium">{api.pricing_model}</span>
                </div>
                {api.published_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Published:</span>
                    <span className="font-medium">
                      {new Date(api.published_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {api.base_url && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Base URL:</p>
                  <code className="text-xs bg-muted p-1 rounded block break-all">
                    {api.base_url}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApis.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No external APIs match your search criteria' : 'No external APIs found'}
            </p>
            <Button onClick={onPublishClick}>
              <Globe className="h-4 w-4 mr-2" />
              Publish Your First API
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
