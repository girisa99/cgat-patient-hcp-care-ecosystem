/**
 * INDUSTRY SHOWCASES SECTION — Unified "Try It" Demo Hub
 * 
 * Consolidates ALL demo capabilities into one industry-aware section:
 * - Content generation: Deck, Video, Content
 * - Localization: TTS, STT, Translation, Transcreation
 * 
 * Each industry gets curated examples across all pipelines.
 * Shows cross-pipeline capabilities with live edge function calls.
 */
import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Heart, 
  Wallet, 
  Plane, 
  ShoppingBag,
  Factory,
  Landmark,
  Globe,
  Sparkles,
  ArrowRight,
  Layers,
  Mic,
  Languages,
  Video,
  Presentation,
  FileText,
  Zap,
  Volume2,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DeckDemoCard } from './demo-hub/DeckDemoCard';
import { VideoDemoCard } from './demo-hub/VideoDemoCard';
import { ContentDemoCard } from './demo-hub/ContentDemoCard';
import { TTSDemoCard } from './demo-hub/TTSDemoCard';
import { STTDemoCard } from './demo-hub/STTDemoCard';
import { TranslationDemoCard } from './demo-hub/TranslationDemoCard';
import { TranscreationDemoCard } from './demo-hub/TranscreationDemoCard';

// Featured industries with icons and metadata
const FEATURED_INDUSTRIES = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    pipelines: ['Patient Education Decks', 'HCP Training Videos', 'Multilingual Patient Guides'],
    stats: { time: '4 min', languages: 22, savings: '85%' },
    regions: ['NAM', 'India', 'Europe'],
    positioning: 'Transcreated patient education in 22+ languages with compliance-ready pipelines',
  },
  {
    id: 'education',
    name: 'EdTech',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    pipelines: ['Course Videos', 'Interactive Modules', 'Avatar Instructors'],
    stats: { time: '6 min', languages: 35, savings: '90%' },
    regions: ['India', 'Africa', 'LATAM'],
    positioning: 'Vernacular course creation in 35+ languages — from Hindi to Swahili',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    pipelines: ['Pitch Decks', 'Compliance Training', 'Market Reports'],
    stats: { time: '5 min', languages: 15, savings: '75%' },
    regions: ['MENA', 'Europe', 'NAM'],
    positioning: 'Investor decks and compliance reporting transcreated across regional dialects',
  },
  {
    id: 'government',
    name: 'Government',
    icon: Landmark,
    color: 'from-purple-500 to-indigo-500',
    pipelines: ['PSA Videos', 'Policy Explainers', 'Citizen Engagement'],
    stats: { time: '3 min', languages: 40, savings: '80%' },
    regions: ['MENA', 'India', 'Africa'],
    positioning: 'Public service content transcreated in 40+ local dialects and languages',
  },
  {
    id: 'tourism',
    name: 'Travel',
    icon: Plane,
    color: 'from-orange-500 to-amber-500',
    pipelines: ['Promo Videos', 'Virtual Tours', 'Multilingual Guides'],
    stats: { time: '4 min', languages: 25, savings: '70%' },
    regions: ['Caribbean', 'APAC', 'MENA'],
    positioning: 'Destination content transcreated for traveler languages and cultural context',
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    pipelines: ['Product Videos', 'Social Ads', 'Influencer Demos'],
    stats: { time: '2 min', languages: 20, savings: '85%' },
    regions: ['APAC', 'NAM', 'Europe'],
    positioning: 'Localized product content with region-specific social formats',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    color: 'from-slate-500 to-zinc-500',
    pipelines: ['Safety Training', 'Multilingual SOPs', 'Equipment Guides'],
    stats: { time: '5 min', languages: 18, savings: '75%' },
    regions: ['Europe', 'APAC', 'India'],
    positioning: 'Equipment training transcreated into worker languages with compliance',
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: Building2,
    color: 'from-teal-500 to-cyan-500',
    pipelines: ['Virtual Tours', 'Listing Videos', 'Investor Presentations'],
    stats: { time: '3 min', languages: 12, savings: '80%' },
    regions: ['MENA', 'APAC', 'NAM'],
    positioning: 'Property showcases with AI presenters, transcreated for investor dialects',
  },
];

// Extended industries list
const EXTENDED_INDUSTRIES = [
  'Oil & Gas', 'Pharma', 'Legal', 'Consulting', 'NGO & Non-Profit',
  'Automotive', 'Aerospace', 'Telecom', 'Agriculture', 'Media & Entertainment',
  'Insurance', 'Logistics', 'Food & Beverage', 'Fashion', 'Sports',
  'Energy & Utilities', 'Mining', 'Professional Services', 'FMCG',
  'Architecture', 'Maritime', 'Defence', 'Biotech', 'Crypto & Web3',
  'Luxury Brands', 'Museums & Culture', 'Recruitment', 'SaaS',
  'Veterinary', 'Wellness & Fitness', 'Gaming', 'Event Management',
  'Supply Chain', 'Sustainability & ESG', 'Smart Cities',
  'Transportation', 'Coworking & PropTech', 'Digital Marketing Agencies',
  'Dental & Orthodontics', 'Nutrition & Dietetics', 'Elderly Care',
  'Mental Health', 'Fertility & IVF',
];

// Pipeline demo tabs — grouped by category
const PIPELINE_TABS = [
  // Content Generation
  { id: 'deck', label: 'AI Deck', shortLabel: 'Deck', icon: Presentation, product: 'Genie Deck', group: 'create' },
  { id: 'video', label: 'Video Script', shortLabel: 'Video', icon: Video, product: 'Genie Vibe', group: 'create' },
  { id: 'content', label: 'Content Writer', shortLabel: 'Content', icon: FileText, product: 'Genie Spark', group: 'create' },
  // Localization
  { id: 'tts', label: 'Text-to-Speech', shortLabel: 'TTS', icon: Volume2, product: '70+ Voices', group: 'localize' },
  { id: 'stt', label: 'Speech-to-Text', shortLabel: 'STT', icon: Mic, product: 'Multi-provider', group: 'localize' },
  { id: 'translation', label: 'Translation', shortLabel: 'Translate', icon: Languages, product: 'DeepL Powered', group: 'localize' },
  { id: 'transcreation', label: 'Transcreation', shortLabel: 'Transcreate', icon: Sparkles, product: 'Our Moat', group: 'localize' },
];

// Platform capabilities
const PLATFORM_CAPABILITIES = [
  { icon: Video, label: '206 Pipelines' },
  { icon: Sparkles, label: '15 AI Providers' },
  { icon: Languages, label: '140+ Languages' },
  { icon: Globe, label: '8 Regional Zones' },
  { icon: Volume2, label: '70+ TTS Voices' },
  { icon: Shield, label: '7 Arabic Dialects' },
  { icon: Layers, label: '7 Products' },
];

interface IndustryShowcasesProps {
  region?: string;
}

export const IndustryShowcases: React.FC<IndustryShowcasesProps> = ({ region }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(FEATURED_INDUSTRIES[0]);
  const [activePipeline, setActivePipeline] = useState('deck');
  const [showExtended, setShowExtended] = useState(false);

  const createTabs = PIPELINE_TABS.filter(t => t.group === 'create');
  const localizeTabs = PIPELINE_TABS.filter(t => t.group === 'localize');

  return (
    <section className="py-24 relative" id="languages">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-4 gap-2">
            <Zap className="w-3 h-3" />
            Try It Live — Real AI Generation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Industry. Your Language.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Try It Now.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pick your industry, choose a pipeline — <span className="text-primary font-bold">create decks, videos, content</span> or 
            try <span className="text-primary font-bold">TTS, STT, translation & transcreation</span> — all from one place.
            Not mockups. <span className="text-primary font-bold">Real AI generation</span>.
          </p>
        </div>

        {/* Platform capabilities bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {PLATFORM_CAPABILITIES.map(({ icon: CapIcon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-full text-sm text-muted-foreground">
              <CapIcon className="h-3.5 w-3.5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Industry selector — compact pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FEATURED_INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry.id === industry.id;
            
            return (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
                    : 'bg-card border border-border hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{industry.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected industry header + stats */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndustry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className={`bg-gradient-to-r ${selectedIndustry.color} p-[1px] rounded-2xl`}>
              <div className="bg-card rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Industry info */}
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    {React.createElement(selectedIndustry.icon, { className: 'h-7 w-7 text-primary' })}
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedIndustry.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedIndustry.positioning}</p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{selectedIndustry.stats.time}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Gen</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent">{selectedIndustry.stats.languages}</p>
                      <p className="text-[10px] text-muted-foreground">Languages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-500">{selectedIndustry.stats.savings}</p>
                      <p className="text-[10px] text-muted-foreground">Savings</p>
                    </div>
                  </div>

                  {/* Regions */}
                  <div className="flex items-center gap-1.5">
                    {selectedIndustry.regions.map(r => (
                      <Badge key={r} variant="outline" className="text-[10px] gap-1">
                        <Globe className="w-2.5 h-2.5" />{r}
                      </Badge>
                    ))}
                  </div>

                  {/* Pipelines */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.pipelines.map(p => (
                      <Badge key={p} className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pipeline demo tabs — two groups */}
        <Tabs value={activePipeline} onValueChange={setActivePipeline} className="w-full">
          <div className="bg-card border border-border rounded-2xl mb-6 p-2 space-y-2">
            {/* Create row */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                ✨ Create Content
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {createTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePipeline === tab.id;
                  return (
                    <TabsList key={tab.id} className="bg-transparent p-0 h-auto">
                      <TabsTrigger
                        value={tab.id}
                        className={`w-full flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all data-[state=active]:shadow-md ${
                          isActive 
                            ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="font-semibold text-xs hidden sm:inline">{tab.label}</span>
                          <span className="font-semibold text-xs sm:hidden">{tab.shortLabel}</span>
                        </div>
                        <span className={`text-[9px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {tab.product}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  );
                })}
              </div>
            </div>

            {/* Localize row */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                🌍 Localize & Transcreate
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {localizeTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePipeline === tab.id;
                  return (
                    <TabsList key={tab.id} className="bg-transparent p-0 h-auto">
                      <TabsTrigger
                        value={tab.id}
                        className={`w-full flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all data-[state=active]:shadow-md ${
                          isActive 
                            ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="font-semibold text-xs hidden sm:inline">{tab.label}</span>
                          <span className="font-semibold text-xs sm:hidden">{tab.shortLabel}</span>
                        </div>
                        <span className={`text-[9px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {tab.product}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demo cards per pipeline */}
          <TabsContent value="deck" className="mt-0">
            <DeckDemoCard industryId={selectedIndustry.id} region={region} />
          </TabsContent>
          
          <TabsContent value="video" className="mt-0">
            <VideoDemoCard industryId={selectedIndustry.id} region={region} />
          </TabsContent>
          
          <TabsContent value="content" className="mt-0">
            <ContentDemoCard industryId={selectedIndustry.id} region={region} />
          </TabsContent>

          <TabsContent value="tts" className="mt-0">
            <TTSDemoCard region={region} industryId={selectedIndustry.id} />
          </TabsContent>

          <TabsContent value="stt" className="mt-0">
            <STTDemoCard region={region} industryId={selectedIndustry.id} />
          </TabsContent>

          <TabsContent value="translation" className="mt-0">
            <TranslationDemoCard region={region} industryId={selectedIndustry.id} />
          </TabsContent>

          <TabsContent value="transcreation" className="mt-0">
            <TranscreationDemoCard region={region} industryId={selectedIndustry.id} />
          </TabsContent>
        </Tabs>

        {/* Cross-pipeline value prop */}
        <motion.div
          className="mt-8 p-4 bg-muted/30 rounded-xl border border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Same Industry</p>
              <p className="text-xs text-muted-foreground">One context, multiple outputs</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary hidden md:block" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">7 Pipelines</p>
              <p className="text-xs text-muted-foreground">Deck + Video + Content + TTS + STT + Translate</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary hidden md:block" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Every Language</p>
              <p className="text-xs text-muted-foreground">Transcreated, not translated</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary hidden md:block" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">All Regions</p>
              <p className="text-xs text-muted-foreground">Zone-routed AI providers</p>
            </div>
          </div>
        </motion.div>

        {/* Live indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 dark:text-green-400 text-sm">
              All demos use <strong>real AI providers</strong> — Azure Neural TTS, DeepL, Gemini, Whisper STT
            </span>
          </div>
        </div>

        {/* Extended industries */}
        <div className="text-center mt-10">
          <button 
            onClick={() => setShowExtended(!showExtended)}
            className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1 transition-colors"
          >
            {showExtended ? 'Show fewer' : `+ ${EXTENDED_INDUSTRIES.length} more industries we serve`}
            <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showExtended ? 'rotate-90' : ''}`} />
          </button>

          {showExtended && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto"
            >
              {EXTENDED_INDUSTRIES.map(name => (
                <Badge key={name} variant="outline" className="text-xs text-muted-foreground">
                  {name}
                </Badge>
              ))}
            </motion.div>
          )}

          <p className="text-muted-foreground text-sm mt-4">
            Every industry gets the same{' '}
            <span className="text-foreground font-medium">15 AI providers</span>,{' '}
            <span className="text-foreground font-medium">206 pipelines</span>, and{' '}
            <span className="text-foreground font-medium">140+ language</span> transcreation — 
            customized for your market, compliance, and audience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndustryShowcases;
