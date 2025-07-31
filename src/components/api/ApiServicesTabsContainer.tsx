import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Key, Upload, Database, Users, Star, Code,
  ExternalLink, TestTube
} from "lucide-react";

// Import existing hooks
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Import consolidated components
import InternalApiServicesTab from './tabs/InternalApiServicesTab';
import ExternalIntegrationTab from './tabs/ExternalIntegrationTab';
import DeveloperHubTab from './tabs/DeveloperHubTab';
import TestingTab from './tabs/TestingTab';

interface ApiServicesTabsContainerProps {
  defaultTab?: string;
  selectedServiceId?: string | null;
  onboardingContext?: boolean;
}

const ApiServicesTabsContainer: React.FC<ApiServicesTabsContainerProps> = ({ 
  defaultTab = "internal",
  selectedServiceId = null,
  onboardingContext = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { currentRole } = useRoleBasedNavigation();

  // Get data from hooks
  const { apiServices, isLoading: isLoadingInternal } = useMasterApiServices();
  const { apiKeys, isLoading: isLoadingKeys } = useApiKeys();
  const { 
    externalApis, 
    publishedApis, 
    developerApplications, 
    marketplaceListings,
    isLoadingExternalApis 
  } = useExternalApis();

  // Role-based filtering for API services
  const filterApisByRole = (apis: any[]) => {
    if (currentRole === 'onboardingTeam') {
      return apis.filter(api => 
        api.name?.toLowerCase().includes('onboarding') ||
        api.description?.toLowerCase().includes('onboarding') ||
        api.category?.toLowerCase().includes('onboarding') ||
        api.purpose?.toLowerCase().includes('onboarding') ||
        api.name?.toLowerCase().includes('treatment') ||
        api.name?.toLowerCase().includes('center')
      );
    }
    return apis;
  };

  // Categorize APIs properly - simplified logic
  const allFilteredApis = filterApisByRole(apiServices || []);
  
  const internalApis = allFilteredApis.filter(api => 
    api.type === 'internal'
  );
  
  const filteredExternalApis = allFilteredApis.filter(api => 
    api.type === 'external'
  );

  // Simplified tab structure - removed redundant tabs
  const tabs = [
    {
      id: "internal",
      label: "Internal APIs",
      icon: Database,
      count: internalApis.length,
      component: InternalApiServicesTab,
      description: "Internal system APIs and services"
    },
    {
      id: "external",
      label: "External Integration",
      icon: ExternalLink,
      count: filteredExternalApis.length + (publishedApis?.length || 0),
      component: ExternalIntegrationTab,
      description: "External API integrations and publishing pipeline"
    },
    {
      id: "developer",
      label: "Developer Hub",
      icon: Code,
      count: (publishedApis?.length || 0) + (apiKeys?.length || 0),
      component: DeveloperHubTab,
      description: "Developer portal with API keys and documentation"
    },
    {
      id: "testing",
      label: "Testing & Sandbox",
      icon: TestTube,
      count: apiServices?.length || 0,
      component: TestingTab,
      description: "API testing tools and sandbox environments"
    }
  ];

  const isLoading = isLoadingInternal || isLoadingKeys || isLoadingExternalApis;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role-based Notice */}
      {currentRole === 'onboardingTeam' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Onboarding Treatment Center API View</h3>
          <p className="text-blue-700 text-sm">
            <strong>Cleaned & Consolidated View:</strong> Showing onboarding-specific API services with streamlined tabs. 
            Redundant categories removed. Field mappings, publishing pipeline consolidated under External Integration.
          </p>
        </div>
      )}

      {currentRole === 'superAdmin' && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">🔧 SuperAdmin API Management</h3>
          <p className="text-purple-700 text-sm">
            <strong>Consolidated Structure:</strong> Reduced from 5+ tabs to 4 focused areas. 
            Eliminated redundant Business/Technical API categories. API Keys moved to Developer Hub.
          </p>
        </div>
      )}

      {/* Simplified Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Services</p>
                <p className="text-2xl font-bold text-blue-900">{allFilteredApis.length}</p>
              </div>
              <Database className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Internal APIs</p>
                <p className="text-2xl font-bold text-green-900">{internalApis.length}</p>
              </div>
              <Database className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">External APIs</p>
                <p className="text-2xl font-bold text-orange-900">{filteredExternalApis.length}</p>
              </div>
              <ExternalLink className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">API Keys</p>
                <p className="text-2xl font-bold text-purple-900">{apiKeys?.length || 0}</p>
              </div>
              <Key className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                title={tab.description}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden lg:inline truncate">{tab.label}</span>
                <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 min-w-[20px] h-5">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const TabComponent = tab.component as any;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {tab.id === 'internal' ? (
                <TabComponent 
                  selectedServiceId={selectedServiceId}
                  onboardingContext={onboardingContext}
                />
              ) : (
                <TabComponent />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ApiServicesTabsContainer;