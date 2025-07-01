
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Globe, Shield, Edit, Trash2, Eye } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';

export const ApiRegistryTab: React.FC = () => {
  const { apiServices, isLoading } = useApiServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredApis = React.useMemo(() => {
    if (!apiServices) return [];
    
    return apiServices.filter(api => {
      const matchesSearch = !searchTerm || 
        api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || api.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [apiServices, searchTerm, selectedType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'deprecated': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'internal' ? Shield : Globe;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading API registry...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>API Registry</span>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API
            </Button>
          </CardTitle>
          <CardDescription>
            Manage all registered API integrations and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search APIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedType('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={selectedType === 'internal' ? 'default' : 'outline'}
                onClick={() => setSelectedType('internal')}
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Internal
              </Button>
              <Button
                variant={selectedType === 'external' ? 'default' : 'outline'}
                onClick={() => setSelectedType('external')}
                size="sm"
              >
                <Globe className="h-4 w-4 mr-2" />
                External
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Registry Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered APIs ({filteredApis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApis.map((api) => {
                const TypeIcon = getTypeIcon(api.type);
                return (
                  <TableRow key={api.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{api.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {api.description || 'No description available'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span className="capitalize">{api.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {api.version}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {api.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(api.updated_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredApis.length === 0 && (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No APIs found matching your criteria</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
