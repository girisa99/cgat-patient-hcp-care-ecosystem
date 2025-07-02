
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Settings, Eye, Download } from 'lucide-react';

interface InternalApisTabContentProps {
  internalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onEditApi: (api: any) => void;
  onViewDetails: (id: string) => void;
  onDownloadCollection: (id: string) => void;
}

export const InternalApisTabContent: React.FC<InternalApisTabContentProps> = ({
  internalApis,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onEditApi,
  onViewDetails,
  onDownloadCollection
}) => {
  const filteredApis = internalApis.filter(api => 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Create */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search internal APIs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create API
        </Button>
      </div>

      {/* APIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredApis.map((api) => (
          <Card key={api.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                    <Badge variant="outline">{api.version}</Badge>
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
                    onClick={() => onEditApi(api)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-4">
                {api.description || 'No description available'}
              </CardDescription>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{api.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purpose:</span>
                  <span className="font-medium">{api.purpose}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Endpoints:</span>
                  <span className="font-medium">{api.endpoints_count || 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onDownloadCollection(api.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApis.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No APIs match your search criteria' : 'No internal APIs found'}
            </p>
            <Button onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First API
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
