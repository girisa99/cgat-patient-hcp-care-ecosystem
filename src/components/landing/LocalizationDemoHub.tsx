/**
 * LOCALIZATION DEMO HUB — Unified TTS / STT / Translation / Transcreation
 * 
 * Single tabbed component that consolidates all localization demos.
 * Region-aware: auto-defaults languages based on user's detected region.
 * Showcases Translation vs Transcreation difference throughout.
 * 
 * Uses existing hooks:
 * - useDynamicLanguageRegistry (DB + edge function language data)
 * - useTTSDemo (TTS audio playback with caching)
 * - useRegionalDetection (IP-based region detection)
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2, Mic, Languages, Sparkles, Globe, Shield,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TTSDemoCard } from './demo-hub/TTSDemoCard';
import { STTDemoCard } from './demo-hub/STTDemoCard';
import { TranslationDemoCard } from './demo-hub/TranslationDemoCard';
import { TranscreationDemoCard } from './demo-hub/TranscreationDemoCard';

// ============================================
// REGION DEFAULTS — what each region sees first
// ============================================
const REGION_TAB_DEFAULTS: Record<string, string> = {
  mena: 'transcreation',
  india: 'tts',
  africa: 'tts',
  apac: 'translation',
  latam: 'translation',
  europe: 'translation',
  nam: 'tts',
  caribbean: 'tts',
};

// ============================================
// COMPONENT
// ============================================
interface LocalizationDemoHubProps {
  region?: string;
  className?: string;
  nativeSections?: {
    demoHubHeadline?: string;
    demoHubSubheadline?: string;
    statsLanguagesLabel?: string;
    statsDialectsLabel?: string;
    statsRegionsLabel?: string;
  };
}

export const LocalizationDemoHub: React.FC<LocalizationDemoHubProps> = ({
  region,
  className = '',
  nativeSections,
}) => {
  const defaultTab = region ? (REGION_TAB_DEFAULTS[region] || 'tts') : 'tts';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = useMemo(() => [
    { 
      id: 'tts', 
      label: 'Text-to-Speech', 
      shortLabel: 'TTS',
      icon: Volume2, 
      description: 'Type text → hear it in any language',
      badge: '70+ voices',
    },
    { 
      id: 'stt', 
      label: 'Speech-to-Text', 
      shortLabel: 'STT',
      icon: Mic, 
      description: 'Speak → see real-time transcription',
      badge: 'Multi-provider',
    },
    { 
      id: 'translation', 
      label: 'Translation', 
      shortLabel: 'Translate',
      icon: Languages, 
      description: 'Instant DeepL translation',
      badge: 'DeepL powered',
    },
    { 
      id: 'transcreation', 
      label: 'Transcreation', 
      shortLabel: 'Transcreate',
      icon: Sparkles, 
      description: 'Cultural adaptation vs literal translation',
      badge: 'Our moat',
    },
  ], []);

  return (
    <section className={`py-20 relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              {region ? `Try It Live — ${getRegionDisplayName(region)}` : 'Try It Live'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {nativeSections?.demoHubHeadline || 'True Localization. Not Translation.'}
          </h2>
          {nativeSections?.demoHubHeadline && (
            <p className="text-sm text-muted-foreground/60 italic mb-3">
              True Localization. Not Translation.
            </p>
          )}
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto font-medium mb-1">
            {nativeSections?.demoHubSubheadline || ''}
          </p>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            We adapt meaning, culture, and context — this is{' '}
            <span className="text-primary font-bold">transcreation</span>. 
            Try all our AI capabilities below.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {[
            { value: '70+', label: 'TTS Voices', Icon: Volume2 },
            { value: '30+', label: 'STT Languages', Icon: Mic },
            { value: '249+', label: 'Translation Pairs', Icon: Languages },
            { value: '7', label: 'Arabic Dialects', Icon: Sparkles },
            { value: '19', label: 'AI Providers', Icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
              <stat.Icon className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Tabbed Demo Hub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="w-full h-auto p-1.5 bg-card border border-border rounded-2xl mb-8 grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl transition-all data-[state=active]:shadow-md ${
                      isActive 
                        ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold text-sm hidden sm:inline">{tab.label}</span>
                      <span className="font-semibold text-sm sm:hidden">{tab.shortLabel}</span>
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {tab.badge}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="tts" className="mt-0">
              <TTSDemoCard region={region} />
            </TabsContent>
            
            <TabsContent value="stt" className="mt-0">
              <STTDemoCard region={region} />
            </TabsContent>
            
            <TabsContent value="translation" className="mt-0">
              <TranslationDemoCard region={region} />
            </TabsContent>
            
            <TabsContent value="transcreation" className="mt-0">
              <TranscreationDemoCard region={region} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Bottom insight */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 dark:text-green-400 text-sm">
              All demos use <strong>real AI providers</strong> — Azure Neural TTS, DeepL, Whisper STT
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function getRegionDisplayName(region: string): string {
  const names: Record<string, string> = {
    mena: 'Middle East & North Africa',
    india: 'India & South Asia',
    africa: 'Africa',
    apac: 'Asia Pacific',
    latam: 'Latin America',
    europe: 'Europe',
    nam: 'North America',
    caribbean: 'Caribbean',
  };
  return names[region] || region;
}

export default LocalizationDemoHub;
