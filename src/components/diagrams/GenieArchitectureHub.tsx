/**
 * Genie Architecture Hub
 * Consolidated Architecture Tab with All Diagrams + P0-P5 Stage Gates
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Brain, Film, Users, Zap, Plug, Server, Target, Sparkles, Database, Shield } from 'lucide-react';

// Import all architecture diagrams
import { GenieStudioOverallArchitectureDiagram } from './architecture/GenieStudioOverallArchitectureDiagram';
import { GenieMindArchitectureDiagram } from './architecture/GenieMindArchitectureDiagram';
import { GenieVibeArchitectureDiagram } from './architecture/GenieVibeArchitectureDiagram';
import { GenieArcProductionHubDiagram } from './architecture/GenieArcProductionHubDiagram';
import { GenieSparkArchitectureDiagram } from './architecture/GenieSparkArchitectureDiagram';
import { GenieIntegrationsDiagram } from './architecture/GenieIntegrationsDiagram';
import { GenieMicroservicesDiagram } from './architecture/GenieMicroservicesDiagram';
import { GenieDataArchitectureDiagram } from './architecture/GenieDataArchitectureDiagram';
import { GenieSecurityArchitectureDiagram } from './architecture/GenieSecurityArchitectureDiagram';
import { GenieStageGateDashboard } from './architecture/GenieStageGateDashboard';
import { GenieP3IntegrationDashboard } from './architecture/GenieP3IntegrationDashboard';

const architectureTabs = [
  { id: 'overall', label: 'Overview', icon: Layers, description: 'Complete system architecture' },
  { id: 'stage-gates', label: 'Stage Gates', icon: Target, description: 'P0-P5 Readiness' },
  { id: 'p3-features', label: 'P3 Features', icon: Sparkles, description: 'Enterprise Capabilities' },
  { id: 'mind', label: 'Genie Mind', icon: Brain, description: 'AI Intelligence Layer' },
  { id: 'vibe', label: 'Genie Vibe', icon: Film, description: 'Production Layer' },
  { id: 'arc-hub', label: 'Arc & Hub', icon: Users, description: 'Collaboration & Enterprise' },
  { id: 'spark', label: 'Genie Spark', icon: Zap, description: 'Quick-Start Engine' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'APIs & Services' },
  { id: 'microservices', label: 'Microservices', icon: Server, description: 'Service Architecture' },
  { id: 'data', label: 'Data Arch', icon: Database, description: 'Schema & ER Diagram' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Auth & Compliance' },
];

export const GenieArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stage-gates');

  return (
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

          <TabsContent value="stage-gates" className="m-0">
            <GenieStageGateDashboard />
          </TabsContent>

          <TabsContent value="p3-features" className="m-0">
            <GenieP3IntegrationDashboard />
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

          <TabsContent value="data" className="m-0">
            <GenieDataArchitectureDiagram />
          </TabsContent>

          <TabsContent value="security" className="m-0">
            <GenieSecurityArchitectureDiagram />
          </TabsContent>
        </div>
    </Tabs>
  );
};

export default GenieArchitectureHub;
