
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Settings, Globe, Database } from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const ApiRegistryTab: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  console.log('🚀 API Registry Tab - Using unified data source');

  // Filter APIs based on search and filters
  const filteredApis = apiServices.data.filter(api => {
    const matchesSearch = !searchQuery || 
      api.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || api.status === statusFilter;
    const matchesType = typeFilter === 'all' || api.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'deprecated':
        return <Badge variant="destructive">Deprecated</Badge>;
      case 'development':
        return <Badge variant="secondary">Development</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'internal' ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <Database className="h-3 w-3" />
        Internal
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        External
      </Badge>
    );
  };

  if (apiServices.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registry Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Registry</h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all registered APIs ({apiServices.data.length} total)
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register API
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search APIs by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Registry Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered APIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No APIs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApis.map((api) => (
                    <TableRow key={api.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{api.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {api.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(api.type)}</TableCell>
                      <TableCell>{getStatusBadge(api.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{api.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{api.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{api.lifecycle_stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
