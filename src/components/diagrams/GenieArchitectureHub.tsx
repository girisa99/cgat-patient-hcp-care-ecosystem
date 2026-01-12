/**
 * Genie Architecture Hub
 * Consolidated Architecture Tab with All Diagrams
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Layers, Brain, Film, Users, Zap, Plug, Server } from 'lucide-react';

// Import all architecture diagrams
import { GenieStudioOverallArchitectureDiagram } from './architecture/GenieStudioOverallArchitectureDiagram';
import { GenieMindArchitectureDiagram } from './architecture/GenieMindArchitectureDiagram';
import { GenieVibeArchitectureDiagram } from './architecture/GenieVibeArchitectureDiagram';
import { GenieArcProductionHubDiagram } from './architecture/GenieArcProductionHubDiagram';
import { GenieSparkArchitectureDiagram } from './architecture/GenieSparkArchitectureDiagram';
import { GenieIntegrationsDiagram } from './architecture/GenieIntegrationsDiagram';
import { GenieMicroservicesDiagram } from './architecture/GenieMicroservicesDiagram';

const architectureTabs = [
  { id: 'overall', label: 'Overview', icon: Layers, description: 'Complete system architecture' },
  { id: 'mind', label: 'Genie Mind', icon: Brain, description: 'AI Intelligence Layer' },
  { id: 'vibe', label: 'Genie Vibe', icon: Film, description: 'Production Layer' },
  { id: 'arc-hub', label: 'Arc & Hub', icon: Users, description: 'Collaboration & Enterprise' },
  { id: 'spark', label: 'Genie Spark', icon: Zap, description: 'Quick-Start Engine' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'APIs & Services' },
  { id: 'microservices', label: 'Microservices', icon: Server, description: 'Service Architecture' },
];

export const GenieArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overall');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-violet-400" />
            Genie Studio Architecture
          </h2>
          <p className="text-slate-400 text-sm">
            Complete technical documentation with download & expand functionality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
            7 Diagrams
          </Badge>
          <Badge variant="outline" className="text-blue-300 border-blue-500/30">
            PNG Export
          </Badge>
          <Badge variant="outline" className="text-purple-300 border-purple-500/30">
            Fullscreen
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
            {architectureTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-md"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* Tab Content */}
        <div className="mt-4">
          <TabsContent value="overall" className="m-0">
            <GenieStudioOverallArchitectureDiagram />
          </TabsContent>

          <TabsContent value="mind" className="m-0">
            <GenieMindArchitectureDiagram />
          </TabsContent>

          <TabsContent value="vibe" className="m-0">
            <GenieVibeArchitectureDiagram />
          </TabsContent>

          <TabsContent value="arc-hub" className="m-0">
            <GenieArcProductionHubDiagram />
          </TabsContent>

          <TabsContent value="spark" className="m-0">
            <GenieSparkArchitectureDiagram />
          </TabsContent>

          <TabsContent value="integrations" className="m-0">
            <GenieIntegrationsDiagram />
          </TabsContent>

          <TabsContent value="microservices" className="m-0">
            <GenieMicroservicesDiagram />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default GenieArchitectureHub;
