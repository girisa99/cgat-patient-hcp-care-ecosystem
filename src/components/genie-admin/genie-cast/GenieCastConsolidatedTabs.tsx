/**
 * GenieCastConsolidatedTabs (SIMPLIFIED VERSION WITH MESSAGING GATE)
 * 
 * This is a wrapper that adds messaging gating logic.
 * The gate prevents access to Templates/Assets sub-tabs without approved messaging.
 */

import React, { useState, useCallback } from 'react';
import { useGenieCastSession } from '@/hooks/useGenieCastSession';
import { MessagingGateModal } from './MessagingGateModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Video,
  Share2,
  LayoutTemplate,
  MessageSquare,
  Image,
  Play,
  Grid3X3,
  Film,
  Eye,
  Layers,
  BarChart3,
  GitBranch,
  Calendar,
  Search,
  Wand2,
  Settings,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Placeholder imports for existing components
import { GenieCastOverview } from './GenieCastOverview';
import { ProductSelector } from './ProductSelector';

export type ConsolidatedTab = 'create' | 'produce' | 'publish';
export type CreateSubTab = 'intent' | 'templates' | 'messaging' | 'assets';
export type ProduceSubTab = 'generate' | 'matrix' | 'studio' | 'review' | 'library' | 'analytics' | 'flow';
export type PublishSubTab = 'scheduler' | 'distribution' | 'seo' | 'testing';

interface GenieCastConsolidatedTabsProps {
  selectedVideoStyles: any[];
  onStylesChange: (styles: any[]) => void;
  screenshotGalleries: any[];
  onGalleriesUpdated: (galleries: any[]) => void;
  totalScreenshots: number;
  onGenerate: () => void;
  isGenerating: boolean;
  defaultTab?: ConsolidatedTab;
  defaultSubTab?: string;
}

const TAB_DEFINITIONS = {
  create: {
    label: 'CREATE',
    icon: Sparkles,
    subTabs: [
      { id: 'intent', label: 'Intent', icon: Sparkles },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
      { id: 'messaging', label: 'Messaging', icon: MessageSquare },
      { id: 'assets', label: 'Assets', icon: Image },
    ],
  },
  produce: {
    label: 'PRODUCE',
    icon: Video,
    subTabs: [
      { id: 'generate', label: 'Generate', icon: Play },
      { id: 'matrix', label: 'Matrix', icon: Grid3X3 },
      { id: 'studio', label: 'Studio', icon: Film },
      { id: 'review', label: 'Review', icon: Eye },
      { id: 'library', label: 'Library', icon: Layers },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'flow', label: 'Flow', icon: GitBranch },
    ],
  },
  publish: {
    label: 'PUBLISH',
    icon: Share2,
    subTabs: [
      { id: 'scheduler', label: 'Schedule', icon: Calendar },
      { id: 'distribution', label: 'Distribute', icon: Share2 },
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'testing', label: 'A/B Test', icon: Wand2 },
    ],
  },
};

export const GenieCastConsolidatedTabs: React.FC<GenieCastConsolidatedTabsProps> = ({
  selectedVideoStyles,
  onStylesChange,
  screenshotGalleries,
  onGalleriesUpdated,
  totalScreenshots,
  onGenerate,
  isGenerating,
  defaultTab = 'create',
  defaultSubTab,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<ConsolidatedTab>(defaultTab);
  const [messagingGateOpen, setMessagingGateOpen] = useState(false);
  const [gateRedirectTab, setGateRedirectTab] = useState<'templates' | 'assets'>('templates');
  const [subTabs, setSubTabs] = useState<Record<ConsolidatedTab, string>>(() => {
    try {
      const stored = localStorage.getItem('genie-cast-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        const createSub = (parsed.selectedIntent || parsed.selectedTemplate) ? 'templates' : 'intent';
        return { create: createSub, produce: 'generate', publish: 'scheduler' };
      }
    } catch {}
    return { create: defaultSubTab || 'intent', produce: 'generate', publish: 'scheduler' };
  });

  const castSession = useGenieCastSession();

  // Gate logic: prevent access to templates/assets without approved messaging
  const setSubTab = useCallback((mainTab: ConsolidatedTab, subTab: string) => {
    if (mainTab === 'create' && (subTab === 'templates' || subTab === 'assets')) {
      if (!castSession.session.approvedMessaging) {
        setGateRedirectTab(subTab as 'templates' | 'assets');
        setMessagingGateOpen(true);
        return;
      }
    }
    setSubTabs(prev => ({ ...prev, [mainTab]: subTab }));
  }, [castSession.session.approvedMessaging]);

  const handleMessagingGateDismiss = useCallback(() => {
    setMessagingGateOpen(false);
  }, []);

  const handleNavigateToMessaging = useCallback(() => {
    setMessagingGateOpen(false);
    setSubTabs(prev => ({ ...prev, create: 'messaging' }));
  }, []);

  const currentMainTab = activeMainTab;
  const currentSubTab = subTabs[currentMainTab];
  const currentMainDef = TAB_DEFINITIONS[currentMainTab];

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {/* Product selector removed - can be added back if needed */}

          <Tabs value={currentMainTab} onValueChange={(v) => setActiveMainTab(v as ConsolidatedTab)}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(TAB_DEFINITIONS).map(([tabKey, def]) => {
                const Icon = def.icon;
                return (
                  <TabsTrigger key={tabKey} value={tabKey}>
                    <Icon className="w-4 h-4 mr-2" />
                    {def.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Sub-tab navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentMainDef?.subTabs.map((subTab: any) => {
                  const SubIcon = subTab.icon;
                  const isActive = currentSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setSubTab(currentMainTab, subTab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded whitespace-nowrap transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-tab content */}
              <Card>
                <CardHeader>
                  <CardTitle>{currentMainDef?.subTabs.find((s: any) => s.id === currentSubTab)?.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96">
                    {currentMainTab === 'create' && (
                      <>
                        {currentSubTab === 'intent' && <div className="text-gray-500">Intent selection</div>}
                        {currentSubTab === 'templates' && <div className="text-gray-500">Templates (wired to messaging)</div>}
                        {currentSubTab === 'messaging' && <div className="text-gray-500">Messaging Generator</div>}
                        {currentSubTab === 'assets' && <div className="text-gray-500">Assets & Brand</div>}
                      </>
                    )}
                    {currentMainTab === 'produce' && <div className="text-gray-500">Produce content here</div>}
                    {currentMainTab === 'publish' && <div className="text-gray-500">Publish & distribute</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Messaging Gate Modal */}
      <MessagingGateModal
        isOpen={messagingGateOpen}
        gateType={gateRedirectTab}
        onClose={handleMessagingGateDismiss}
        onNavigateToMessaging={handleNavigateToMessaging}
      />
    </>
  );
};

export default GenieCastConsolidatedTabs;
