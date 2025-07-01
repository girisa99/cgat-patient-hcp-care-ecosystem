
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Eye, Copy, ExternalLink, Server, Shield, FileText, Code } from 'lucide-react';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { useToast } from '@/hooks/use-toast';

interface PublishedApisTabContentProps {
  publishedApis?: any[];
  searchTerm?: string;
}

export const PublishedApisTabContent: React.FC<PublishedApisTabContentProps> = ({
  publishedApis = [],
  searchTerm = ''
}) => {
  const { toast } = useToast();
  const { getDetailedApiStats, generatePostmanCollection } = useApiServiceDetails();

  // Filter APIs based on search term
  const filteredApis = publishedApis.filter(api => 
    !searchTerm || 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get real detailed stats for published APIs
  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(filteredApis);
  }, [filteredApis, getDetailedApiStats]);

  const handleCopyUrl = (api: any) => {
    const url = api.base_url || `${window.location.origin}/api/v1/${api.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "✅ URL Copied",
      description: `API endpoint URL copied: ${api.name}`,
    });
  };

  const handleDownloadCollection = (api: any) => {
    const collection = generatePostmanCollection(api.id, publishedApis);
    if (collection) {
      const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${api.name.replace(/\s+/g, '-')}-collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Collection Downloaded",
        description: `Postman collection for ${api.name} downloaded successfully.`,
      });
    }
  };

  const handleViewDocumentation = (api: any) => {
    if (api.documentation_url) {
      window.open(api.documentation_url, '_blank');
      toast({
        title: "📚 Documentation Opened",
        description: `Opening documentation for ${api.name}`,
      });
    } else {
      toast({
        title: "📚 No Documentation",
        description: `No documentation URL available for ${api.name}`,
        variant: "destructive",
      });
    }
  };

  if (filteredApis.length === 0) {
    return (
      <div className="space-y-6">
        {/* Published APIs Overview */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Published APIs Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{publishedApis.length}</p>
                <p className="text-sm text-muted-foreground">Total Published</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{detailedStats.totalEndpoints}</p>
                <p className="text-sm text-muted-foreground">Total Endpoints</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{detailedStats.totalSchemas}</p>
                <p className="text-sm text-muted-foreground">Total Schemas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{detailedStats.totalDocs}</p>
                <p className="text-sm text-muted-foreground">Documented APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No Matching Published APIs' : 'No Published APIs'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? `No published APIs match "${searchTerm}". Try adjusting your search criteria.`
                : "APIs that are active and in production lifecycle will appear here when published."
              }
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Publishing Guidelines
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Published APIs Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{filteredApis.length}</p>
                <p className="text-sm text-muted-foreground">Published APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{detailedStats.totalEndpoints}</p>
                <p className="text-sm text-muted-foreground">Live Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{detailedStats.totalSchemas}</p>
                <p className="text-sm text-muted-foreground">API Schemas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{detailedStats.totalSecuredEndpoints}</p>
                <p className="text-sm text-muted-foreground">Secured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{detailedStats.totalDocs}</p>
                <p className="text-sm text-muted-foreground">Documented</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Published APIs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Published APIs ({filteredApis.length})</h3>
          <Badge variant="outline" className="text-green-600">
            {filteredApis.filter(api => api.status === 'active').length} active
          </Badge>
        </div>

        <div className="grid gap-4">
          {filteredApis.map((api) => {
            const apiStats = detailedStats.apiBreakdown[api.id] || {};
            
            return (
              <Card key={api.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {api.name}
                      <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                      <Badge variant="outline">v{api.version}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        Published
                      </Badge>
                      {api.lifecycle_stage === 'production' && (
                        <Badge variant="outline" className="text-blue-600">
                          Production
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {api.description || 'Published API available for external consumption'}
                  </p>
                  
                  {/* Real API Metrics */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      {apiStats.endpointCount || 0} endpoints
                    </span>
                    <span className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      {apiStats.hasSchemas ? 'Documented' : 'No schemas'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {apiStats.securityCount || 0} secured
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {apiStats.publicEndpoints || 0} public
                    </span>
                    {api.documentation_url && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Documentation
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {api.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {api.direction}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {api.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyUrl(api)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadCollection(api)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Download Collection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocumentation(api)}
                      disabled={!api.documentation_url}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Documentation
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
