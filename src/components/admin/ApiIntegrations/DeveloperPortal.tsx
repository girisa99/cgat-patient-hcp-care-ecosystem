
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublishedApiIntegration } from '@/hooks/usePublishedApiIntegration';
import { 
  Code2, 
  Book, 
  Key, 
  Users, 
  Globe, 
  ExternalLink,
  Bell,
  Settings,
  Download
} from 'lucide-react';

const DeveloperPortal: React.FC = () => {
  console.log('🚀 DeveloperPortal: Component rendering');
  
  const [activeTab, setActiveTab] = useState('overview');
  const {
    publishedApisForDevelopers,
    isLoadingPublishedApis,
    generateDocumentation,
    isGeneratingDocs,
    notifyDevelopers,
    isNotifyingDevelopers
  } = usePublishedApiIntegration();

  console.log('📊 DeveloperPortal: Published APIs:', publishedApisForDevelopers?.length || 0);

  if (isLoadingPublishedApis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading developer portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Developer Portal</h2>
          <p className="text-muted-foreground">
            Manage API documentation, developer access, and application integrations
          </p>
        </div>
        <Badge variant="outline">
          {publishedApisForDevelopers.length} Published APIs
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{publishedApisForDevelopers.length}</p>
                    <p className="text-sm text-muted-foreground">Published APIs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Active Developers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Key className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">API Keys Issued</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recently Published APIs</CardTitle>
            </CardHeader>
            <CardContent>
              {publishedApisForDevelopers.length > 0 ? (
                <div className="space-y-3">
                  {publishedApisForDevelopers.slice(0, 3).map((api) => (
                    <div key={api.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{api.external_name}</h4>
                        <p className="text-sm text-muted-foreground">{api.external_description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{api.version}</Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No APIs published yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Documentation Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedApisForDevelopers.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">{api.external_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {api.endpoints?.length || 0} endpoints
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateDocumentation(api.id)}
                        disabled={isGeneratingDocs}
                      >
                        <Book className="h-4 w-4 mr-2" />
                        {isGeneratingDocs ? 'Generating...' : 'Generate Docs'}
                      </Button>
                      {api.documentation_url && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {publishedApisForDevelopers.length === 0 && (
                  <p className="text-muted-foreground">No APIs available for documentation</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Developer Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No developer applications registered yet. Applications will appear here when developers request access to your APIs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Developer Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedApisForDevelopers.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">{api.external_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Notify developers about this API
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => notifyDevelopers(api.id)}
                      disabled={isNotifyingDevelopers}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {isNotifyingDevelopers ? 'Sending...' : 'Notify Developers'}
                    </Button>
                  </div>
                ))}
                {publishedApisForDevelopers.length === 0 && (
                  <p className="text-muted-foreground">No APIs available for notifications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
