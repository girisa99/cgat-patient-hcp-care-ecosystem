
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiIntegrationsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="w-full">
      <TabsList className="grid grid-cols-7 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="internal">Internal APIs</TabsTrigger>
        <TabsTrigger value="external">External APIs</TabsTrigger>
        <TabsTrigger value="published">Published APIs</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="keys">API Keys</TabsTrigger>
        <TabsTrigger value="testing">Testing</TabsTrigger>
      </TabsList>
    </div>
  );
};
