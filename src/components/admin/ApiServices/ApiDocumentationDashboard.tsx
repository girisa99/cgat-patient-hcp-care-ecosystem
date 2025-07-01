
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, Globe, FileText, Download, Eye } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';
import { ApiDocumentationGenerator } from '@/utils/api/ApiDocumentationGenerator';

export const ApiDocumentationDashboard: React.FC = () => {
  const { apiServices, isLoading } = useApiServices();

  const handleViewDocumentation = (api: any) => {
    ApiDocumentationGenerator.viewDocumentation(api);
  };

  const handleDownloadDocumentation = (api: any) => {
    const doc = ApiDocumentationGenerator.generateDocumentation(api);
    const htmlContent = ApiDocumentationGenerator.generateHtmlDocumentation(doc);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${api.name}-documentation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading API documentation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documentedApis = apiServices?.filter(api => api.status === 'active') || [];
  const totalEndpoints = documentedApis.reduce((sum, api) => sum + (api.endpoints_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">API Documentation</h2>
        <p className="text-gray-600">
          Generate and manage comprehensive documentation for your API integrations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documented APIs</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentedApis.length}</div>
            <p className="text-xs text-muted-foreground">
              Active API integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Documented endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation Coverage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              APIs with documentation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Documentation Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            View and download documentation for your API integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Endpoints</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentedApis.map((api) => (
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
                    <Badge variant="outline" className="capitalize">
                      {api.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {api.version}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        api.status === 'active' ? 'bg-green-500' : 
                        api.status === 'inactive' ? 'bg-gray-500' : 
                        'bg-blue-500'
                      }
                    >
                      {api.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {api.endpoints_count || 0} endpoints
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDocumentation(api)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadDocumentation(api)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {documentedApis.length === 0 && (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documented APIs found</p>
              <p className="text-sm text-gray-500 mt-2">
                APIs will appear here when they have active status
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
