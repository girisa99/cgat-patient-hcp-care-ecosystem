/**
 * Genie Command Center - Enterprise Dashboard
 * Professional investor-ready dashboard with comprehensive metrics
 * No frame-in-frame, clean enterprise design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Users, Building2, TrendingUp, 
  Rocket, Settings, Globe, DollarSign,
  Target, Shield, Layers, FileText,
  Sparkles, ArrowRight
} from 'lucide-react';

// Tab Components
import { OverviewTab } from './tabs/OverviewTab';
import { MarketAnalysisTab } from './tabs/MarketAnalysisTab';
import { ProductSuiteTab } from './tabs/ProductSuiteTab';
import { ArchitectureTab } from './tabs/ArchitectureTab';
import { TechnicalDocsTab } from './tabs/TechnicalDocsTab';
import { RoadmapTab } from './tabs/RoadmapTab';
import { InvestorDashboardTab } from './tabs/InvestorDashboardTab';
import { StageGatesTab } from './tabs/StageGatesTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Problem statement & market opportunity' },
  { id: 'market', label: 'Market Analysis', icon: TrendingUp, description: 'Competitors, trends & positioning' },
  { id: 'products', label: 'Product Suite', icon: Layers, description: 'Genie products & capabilities' },
  { id: 'architecture', label: 'Architecture', icon: Settings, description: 'Technical architecture diagrams' },
  { id: 'technical', label: 'Technical Docs', icon: FileText, description: 'PRD, BRD, FRS documentation' },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket, description: 'P0-P5 implementation status' },
  { id: 'investor', label: 'Investor Dashboard', icon: DollarSign, description: 'Financials & projections' },
  { id: 'stagegates', label: 'Stage Gates', icon: Shield, description: 'Go-live readiness checklist' },
];

export const GenieCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header - Clean, Enterprise Style */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Genie Suite Command Center
                </h1>
                <p className="text-sm text-slate-400">
                  Enterprise Content Production Platform • 289 Scenarios • 46% Implemented
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 text-sm font-medium">P0-P2 Complete</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-sm font-medium">P3 In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontal Scrollable */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-[1920px] mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent border-0 flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent 
                    data-[state=active]:border-violet-500 data-[state=active]:bg-transparent
                    data-[state=active]:text-white data-[state=inactive]:text-slate-400
                    hover:text-slate-200 transition-all whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <div className="py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="overview" className="mt-0">
                    <OverviewTab />
                  </TabsContent>
                  <TabsContent value="market" className="mt-0">
                    <MarketAnalysisTab />
                  </TabsContent>
                  <TabsContent value="products" className="mt-0">
                    <ProductSuiteTab />
                  </TabsContent>
                  <TabsContent value="architecture" className="mt-0">
                    <ArchitectureTab />
                  </TabsContent>
                  <TabsContent value="technical" className="mt-0">
                    <TechnicalDocsTab />
                  </TabsContent>
                  <TabsContent value="roadmap" className="mt-0">
                    <RoadmapTab />
                  </TabsContent>
                  <TabsContent value="investor" className="mt-0">
                    <InvestorDashboardTab />
                  </TabsContent>
                  <TabsContent value="stagegates" className="mt-0">
                    <StageGatesTab />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GenieCommandCenter;
