
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Clock, 
  Zap, 
  Key, 
  Bell,
  BookOpen,
  TestTube
} from 'lucide-react';
import { usePublishedApiIntegration, PublishedApiForDevelopers } from '@/hooks/usePublishedApiIntegration';
import { usePublishedApiDetails, ApiIntegrationDetails } from '@/hooks/usePublishedApiDetails';
import { useToast } from '@/hooks/use-toast';
import ApiDetailsDialog from './ApiDetailsDialog';

interface PublishedApisSectionProps {
  showInDeveloperPortal?: boolean;
}

const PublishedApisSection = ({ showInDeveloperPortal = false }: PublishedApisSectionProps) => {
  const { toast } = useToast();
  const [selectedApiDetails, setSelectedApiDetails] = useState<ApiIntegrationDetails | null>(null);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const {
    publishedApisForDevelopers,
    isLoadingPublishedApis,
    generateDocumentation,
    isGeneratingDocs,
    notifyDevelopers,
    isNotifyingDevelopers
  } = usePublishedApiIntegration();

  const { getApiDetails } = usePublishedApiDetails();

  const handleViewApi = async (api: PublishedApiForDevelopers) => {
    setIsLoadingDetails(true);
    setShowApiDialog(true);
    
    try {
      const details = await getApiDetails(api.id);
      setSelectedApiDetails(details);
    } catch (error) {
      console.error('Error fetching API details:', error);
      toast({
        title: "Error",
        description: "Failed to load API details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "URL has been copied to clipboard",
    });
  };

  const handleGenerateDocs = (apiId: string) => {
    generateDocumentation(apiId);
  };

  const handleNotifyDevelopers = (apiId: string) => {
    notifyDevelopers(apiId);
  };

  if (isLoadingPublishedApis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading published APIs...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            {showInDeveloperPortal ? 'Available APIs' : 'Published APIs'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {showInDeveloperPortal 
              ? 'APIs available for integration in your applications with complete documentation'
              : 'APIs published and available to developers'
            }
          </p>
        </div>
        <Badge variant="secondary">{publishedApisForDevelopers.length} APIs</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedApisForDevelopers.map((api) => (
          <Card key={api.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{api.external_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {api.external_description || 'No description available'}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  v{api.version}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-1">
                {api.category && (
                  <Badge variant="secondary" className="text-xs">
                    {api.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {api.pricing_model}
                </Badge>
                {api.endpoints && api.endpoints.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {api.endpoints.length} endpoints
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-3 w-3" />
                  <span>{api.authentication_methods.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3" />
                  <span>
                    {api.rate_limits?.requests || 1000} requests/{api.rate_limits?.period || 'hour'}
                  </span>
                </div>
                {api.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => handleViewApi(api)} className="flex-1">
                  View Details
                </Button>
                {!showInDeveloperPortal && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateDocs(api.id)}
                      disabled={isGeneratingDocs}
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNotifyDevelopers(api.id)}
                      disabled={isNotifyingDevelopers}
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {publishedApisForDevelopers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Published APIs</h3>
            <p className="text-sm text-muted-foreground">
              {showInDeveloperPortal 
                ? 'No APIs are currently available for development.'
                : 'Publish your first API to make it available to developers.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced API Details Dialog */}
      <ApiDetailsDialog
        open={showApiDialog}
        onOpenChange={setShowApiDialog}
        apiDetails={selectedApiDetails}
        isLoading={isLoadingDetails}
      />
    </div>
  );
};

export default PublishedApisSection;
