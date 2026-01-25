/**
 * Genie Architecture Hub
 * Consolidated Architecture Tab with All Diagrams + P0-P5 Stage Gates
 * FIXED: Removed nested cards, improved scroll, better tab layout
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Layers, Brain, Film, Users, Zap, Plug, Server, Target, Sparkles, Database, Shield, GitBranch, Radio, Grid3X3, Bot, Presentation, BarChart3, HeadphonesIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
import { ParallelStreamsDashboard } from './genie-command-center/tabs/ParallelStreamsDashboard';

// New diagrams
import { GenieCastArchitectureDiagram } from './architecture/GenieCastArchitectureDiagram';
import { GenieProviderCapabilityMatrix } from './architecture/GenieProviderCapabilityMatrix';
import { GenieAskGenieArchitectureDiagram } from './architecture/GenieAskGenieArchitectureDiagram';
import { GenieDeckArchitectureDiagram } from './architecture/GenieDeckArchitectureDiagram';
import { GenieAnalyticsArchitectureDiagram } from './architecture/GenieAnalyticsArchitectureDiagram';
import { GenieSupportArchitectureDiagram } from './architecture/GenieSupportArchitectureDiagram';

const architectureTabs = [
  { id: 'overall', label: 'Overview', icon: Layers, description: 'Complete system architecture' },
  { id: 'stage-gates', label: 'Stage Gates', icon: Target, description: 'P0-P5 Readiness' },
  { id: 'parallel-streams', label: 'Streams', icon: GitBranch, description: 'A/B/C Implementation' },
  { id: 'providers', label: 'Providers', icon: Grid3X3, description: '12-Provider Matrix' },
  { id: 'p3-features', label: 'P3', icon: Sparkles, description: 'Enterprise Capabilities' },
  { id: 'mind', label: 'Mind', icon: Brain, description: 'AI Intelligence' },
  { id: 'spark', label: 'Spark', icon: Zap, description: 'Quick-Start' },
  { id: 'vibe', label: 'Vibe', icon: Film, description: 'Production' },
  { id: 'deck', label: 'Deck', icon: Presentation, description: 'Presentations' },
  { id: 'arc-hub', label: 'Arc/Hub', icon: Users, description: 'Collaboration' },
  { id: 'cast', label: 'Cast', icon: Radio, description: 'Marketing' },
  { id: 'ask-genie', label: 'Ask', icon: Bot, description: 'AI Assistant' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Insights' },
  { id: 'support', label: 'Support', icon: HeadphonesIcon, description: 'Help' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'APIs' },
  { id: 'microservices', label: 'Services', icon: Server, description: 'Architecture' },
  { id: 'data', label: 'Data', icon: Database, description: 'Schema' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Auth' },
];

export const GenieArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stage-gates');

  const renderContent = () => {
    switch (activeTab) {
      case 'overall': return <GenieStudioOverallArchitectureDiagram />;
      case 'stage-gates': return <GenieStageGateDashboard />;
      case 'parallel-streams': return <ParallelStreamsDashboard />;
      case 'providers': return <GenieProviderCapabilityMatrix />;
      case 'p3-features': return <GenieP3IntegrationDashboard />;
      case 'mind': return <GenieMindArchitectureDiagram />;
      case 'spark': return <GenieSparkArchitectureDiagram />;
      case 'vibe': return <GenieVibeArchitectureDiagram />;
      case 'deck': return <GenieDeckArchitectureDiagram />;
      case 'arc-hub': return <GenieArcProductionHubDiagram />;
      case 'cast': return <GenieCastArchitectureDiagram />;
      case 'ask-genie': return <GenieAskGenieArchitectureDiagram />;
      case 'analytics': return <GenieAnalyticsArchitectureDiagram />;
      case 'support': return <GenieSupportArchitectureDiagram />;
      case 'integrations': return <GenieIntegrationsDiagram />;
      case 'microservices': return <GenieMicroservicesDiagram />;
      case 'data': return <GenieDataArchitectureDiagram />;
      case 'security': return <GenieSecurityArchitectureDiagram />;
      default: return <GenieStageGateDashboard />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab Navigation - Horizontal Scroll */}
      <div className="relative">
        <ScrollArea className="w-full pb-2">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg border border-border min-w-max">
            {architectureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Content Area - Scrollable */}
      <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-lg border border-border bg-background">
        <div className="p-4 min-h-full">
          {renderContent()}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default GenieArchitectureHub;
