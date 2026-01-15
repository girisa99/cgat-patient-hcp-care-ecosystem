/**
 * Genie Command Center - Enterprise Dashboard
 * Clean, professional investor-ready dashboard
 * Using proper design system tokens with WOW animations
 * DYNAMIC DATA: All metrics sourced from governance-data.ts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, 
  Rocket, Settings, DollarSign,
  Shield, Layers, FileText,
  Sparkles, CheckCircle, Clock, Database
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
import { GovernanceTab } from './tabs/GovernanceTab';
import { PricingStrategyTab } from './tabs/PricingStrategyTab';

// Import governance data for dynamic metrics
import { masterScenarioCounts } from './data/governance-data';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'market', label: 'Market Analysis', icon: TrendingUp },
  { id: 'products', label: 'Product Suite', icon: Layers },
  { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
  { id: 'architecture', label: 'Architecture', icon: Settings },
  { id: 'technical', label: 'Technical Docs', icon: FileText },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket },
  { id: 'investor', label: 'Investor Dashboard', icon: Sparkles },
  { id: 'stagegates', label: 'Stage Gates', icon: Shield },
  { id: 'governance', label: 'Governance', icon: Database },
];

export const GenieCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dynamic metrics from single source of truth
  const totalScenarios = masterScenarioCounts.totalScenarios;
  const implementedScenarios = masterScenarioCounts.implementedScenarios;
  const completionPercentage = masterScenarioCounts.completionPercentage;
  const progressOffset = 100 - completionPercentage;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Clean Enterprise Style */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-[1920px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Animated Logo */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 blur-lg"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Genie Suite Command Center
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Enterprise Content Production Platform • {totalScenarios} Scenarios Defined
                </p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 text-sm font-semibold">P0-P2 Complete</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              >
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-300 text-sm font-semibold">P3 In Progress</span>
              </motion.div>
              
              {/* Progress Indicator */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                    <motion.circle 
                      cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                      className="text-primary"
                      strokeDasharray={100}
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: progressOffset }}
                      transition={{ duration: 1.5, delay: 0.6 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{completionPercentage}%</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">{implementedScenarios} / {totalScenarios}</div>
                  <div className="text-xs text-muted-foreground">Scenarios Done</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-[1920px] mx-auto px-6">
            <TabsList className="h-auto p-0 bg-transparent border-0 flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TabsTrigger
                    value={tab.id}
                    className="flex items-center gap-2 px-5 py-4 rounded-none border-b-2 border-transparent 
                      data-[state=active]:border-primary data-[state=active]:bg-transparent
                      data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground
                      hover:text-foreground hover:bg-muted/50 transition-all whitespace-nowrap"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Content - Stable rendering without animation flickering */}
        <div className="max-w-[1920px] mx-auto py-8 px-6">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="market" className="mt-0">
            <MarketAnalysisTab />
          </TabsContent>
          <TabsContent value="products" className="mt-0">
            <ProductSuiteTab />
          </TabsContent>
          <TabsContent value="pricing" className="mt-0">
            <PricingStrategyTab />
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
          <TabsContent value="governance" className="mt-0">
            <GovernanceTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default GenieCommandCenter;
