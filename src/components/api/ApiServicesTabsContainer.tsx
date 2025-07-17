import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, Key, Settings, Upload, Download, Play, 
  Database, Shield, Users, Star, Code, FileText,
  ExternalLink, Zap, Cloud, TestTube, Map
} from "lucide-react";

// Import existing hooks
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';

// Import components
import InternalApiServicesTab from './tabs/InternalApiServicesTab';
import ExternalApiTab from './tabs/ExternalApiTab';
import ApiKeysTab from './tabs/ApiKeysTab';
import PublishingTab from './tabs/PublishingTab';
import DeveloperPortalTab from './tabs/DeveloperPortalTab';
import MarketplaceTab from './tabs/MarketplaceTab';
import SandboxTab from './tabs/SandboxTab';
import DocumentationTab from './tabs/DocumentationTab';
import FieldMappingTab from './tabs/FieldMappingTab';
import BusinessApiTab from './tabs/BusinessApiTab';
import TechnicalApiTab from './tabs/TechnicalApiTab';

interface ApiServicesTabsContainerProps {
  defaultTab?: string;
}

const ApiServicesTabsContainer: React.FC<ApiServicesTabsContainerProps> = ({ 
  defaultTab = "internal" 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

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

  const tabs = [
    {
      id: "internal",
      label: "Internal APIs",
      icon: Database,
      count: apiServices?.length || 0,
      component: InternalApiServicesTab
    },
    {
      id: "external",
      label: "External APIs", 
      icon: ExternalLink,
      count: externalApis?.length || 0,
      component: ExternalApiTab
    },
    {
      id: "business",
      label: "Business APIs",
      icon: Users,
      count: apiServices?.filter(api => api.category === 'business')?.length || 0,
      component: BusinessApiTab
    },
    {
      id: "technical",
      label: "Technical APIs",
      icon: Code,
      count: apiServices?.filter(api => api.category === 'technical')?.length || 0,
      component: TechnicalApiTab
    },
    {
      id: "publish",
      label: "Publishing",
      icon: Upload,
      count: publishedApis?.length || 0,
      component: PublishingTab
    },
    {
      id: "developer",
      label: "Developer Portal",
      icon: Users,
      count: developerApplications?.length || 0,
      component: DeveloperPortalTab
    },
    {
      id: "marketplace",
      label: "Marketplace",
      icon: Star,
      count: marketplaceListings?.length || 0,
      component: MarketplaceTab
    },
    {
      id: "keys",
      label: "API Keys",
      icon: Key,
      count: apiKeys?.length || 0,
      component: ApiKeysTab
    },
    {
      id: "sandbox",
      label: "Sandbox",
      icon: TestTube,
      count: 0, // Sandbox environments
      component: SandboxTab
    },
    {
      id: "documentation",
      label: "Documentation",
      icon: FileText,
      count: 0, // Generated docs
      component: DocumentationTab
    },
    {
      id: "field-mapping",
      label: "Field Mapping",
      icon: Map,
      count: 0, // Field mappings
      component: FieldMappingTab
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
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Internal APIs</p>
                <p className="text-2xl font-bold text-blue-900">{apiServices?.length || 0}</p>
              </div>
              <Database className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">External APIs</p>
                <p className="text-2xl font-bold text-green-900">{externalApis?.length || 0}</p>
              </div>
              <ExternalLink className="h-6 w-6 text-green-500" />
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

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Published</p>
                <p className="text-2xl font-bold text-orange-900">{publishedApis?.length || 0}</p>
              </div>
              <Upload className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600">Marketplace</p>
                <p className="text-2xl font-bold text-pink-900">{marketplaceListings?.length || 0}</p>
              </div>
              <Star className="h-6 w-6 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600">Dev Apps</p>
                <p className="text-2xl font-bold text-cyan-900">{developerApplications?.length || 0}</p>
              </div>
              <Users className="h-6 w-6 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 gap-1 h-auto p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex flex-col items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
          const TabComponent = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <TabComponent />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ApiServicesTabsContainer;