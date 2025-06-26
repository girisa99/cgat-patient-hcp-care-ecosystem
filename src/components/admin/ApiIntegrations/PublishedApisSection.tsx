
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
  TestTube,
  sync as Sync
} from 'lucide-react';
import { usePublishedApiIntegration, PublishedApiForDevelopers } from '@/hooks/usePublishedApiIntegration';
import { useEnhancedPublishedApiDetails, ApiIntegrationDetails } from '@/hooks/useEnhancedPublishedApiDetails';
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

  const { getEnhancedApiDetails } = useEnhancedPublishedApiDetails();

  const handleViewApi = async (api: PublishedApiForDevelopers) => {
    setIsLoadingDetails(true);
    setShowApiDialog(true);
    
    try {
      console.log('🔍 Loading enhanced API details for:', api.id);
      const details = await getEnhancedApiDetails(api.id);
      console.log('✅ Enhanced API details loaded:', details?.name);
      setSelectedApiDetails(details);
    } catch (error) {
      console.error('❌ Error fetching enhanced API details:', error);
      toast({
        title: "Error",
        description: "Failed to load enhanced API details",
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
          <Sync className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          Loading enhanced published APIs...
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Sync className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            {showInDeveloperPortal 
              ? 'Enhanced APIs with real-time sync available for integration in your applications'
              : 'Enhanced APIs with real-time synchronization published and available to developers'
            }
          </p>
        </div>
        <Badge variant="secondary">{publishedApisForDevelopers.length} APIs</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedApisForDevelopers.map((api) => (
          <Card key={api.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {api.external_name}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Sync className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {api.external_description || 'Enhanced API with real-time synchronization capabilities'}
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
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {api.endpoints.length} synced endpoints
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  Real-time
                </Badge>
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
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Sync className="h-3 w-3" />
                  <span>Live Sync Active</span>
                </div>
                {api.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => handleViewApi(api)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Globe className="h-3 w-3 mr-1" />
                  View Enhanced Details
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
            <h3 className="font-medium mb-2">No Enhanced Published APIs</h3>
            <p className="text-sm text-muted-foreground">
              {showInDeveloperPortal 
                ? 'No enhanced APIs with real-time sync are currently available for development.'
                : 'Publish your first API with enhanced real-time sync to make it available to developers.'
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
