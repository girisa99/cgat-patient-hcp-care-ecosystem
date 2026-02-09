/**
 * INDUSTRY SHOWCASES — Unified "Try It" Demo Hub
 * 
 * Consolidates ALL demo capabilities into one industry-aware section:
 * - Content generation: Deck, Video, Content
 * - Localization: TTS, STT, Translation, Transcreation
 * - Cross-functional: Avatar, 3D, Voice Clone, Animation (showcase only)
 * 
 * Each industry gets curated examples across all pipelines.
 * Shows cross-pipeline capabilities with live edge function calls.
 */
import React, { useState } from 'react';
import { 
  Building2, GraduationCap, Heart, Wallet, Plane, ShoppingBag,
  Factory, Landmark, Globe, Sparkles, ArrowRight, Layers,
  Mic, Languages, Video, Presentation, FileText, Zap,
  Volume2, Shield, User, Box, Music, Image, Wand2,
  CheckCircle2, Star,
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
    id: 'healthcare', name: 'Healthcare', icon: Heart,
    pipelines: ['Patient Education Decks', 'HCP Training Videos', 'Multilingual Patient Guides'],
    stats: { time: '4 min', languages: 22, savings: '85%' },
    regions: ['NAM', 'India', 'Europe'],
    positioning: 'Transcreated patient education in 22+ languages with compliance-ready pipelines',
  },
  {
    id: 'education', name: 'EdTech', icon: GraduationCap,
    pipelines: ['Course Videos', 'Interactive Modules', 'Avatar Instructors'],
    stats: { time: '6 min', languages: 35, savings: '90%' },
    regions: ['India', 'Africa', 'LATAM'],
    positioning: 'Vernacular course creation in 35+ languages — from Hindi to Swahili',
  },
  {
    id: 'finance', name: 'Finance', icon: Wallet,
    pipelines: ['Pitch Decks', 'Compliance Training', 'Market Reports'],
    stats: { time: '5 min', languages: 15, savings: '75%' },
    regions: ['MENA', 'Europe', 'NAM'],
    positioning: 'Investor decks and compliance reporting transcreated across regional dialects',
  },
  {
    id: 'government', name: 'Government', icon: Landmark,
    pipelines: ['PSA Videos', 'Policy Explainers', 'Citizen Engagement'],
    stats: { time: '3 min', languages: 40, savings: '80%' },
    regions: ['MENA', 'India', 'Africa'],
    positioning: 'Public service content transcreated in 40+ local dialects and languages',
  },
  {
    id: 'tourism', name: 'Travel', icon: Plane,
    pipelines: ['Promo Videos', 'Virtual Tours', 'Multilingual Guides'],
    stats: { time: '4 min', languages: 25, savings: '70%' },
    regions: ['Caribbean', 'APAC', 'MENA'],
    positioning: 'Destination content transcreated for traveler languages and cultural context',
  },
  {
    id: 'retail', name: 'Retail', icon: ShoppingBag,
    pipelines: ['Product Videos', 'Social Ads', 'Influencer Demos'],
    stats: { time: '2 min', languages: 20, savings: '85%' },
    regions: ['APAC', 'NAM', 'Europe'],
    positioning: 'Localized product content with region-specific social formats',
  },
  {
    id: 'manufacturing', name: 'Manufacturing', icon: Factory,
    pipelines: ['Safety Training', 'Multilingual SOPs', 'Equipment Guides'],
    stats: { time: '5 min', languages: 18, savings: '75%' },
    regions: ['Europe', 'APAC', 'India'],
    positioning: 'Equipment training transcreated into worker languages with compliance',
  },
  {
    id: 'realestate', name: 'Real Estate', icon: Building2,
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
const PIPELINE_GROUPS = {
  create: {
    label: 'Create Content',
    emoji: '✨',
    tabs: [
      { id: 'deck', label: 'AI Deck', shortLabel: 'Deck', icon: Presentation, product: 'Genie Deck' },
      { id: 'video', label: 'Video Script', shortLabel: 'Video', icon: Video, product: 'Genie Vibe' },
      { id: 'content', label: 'Content Writer', shortLabel: 'Content', icon: FileText, product: 'Genie Spark' },
    ],
  },
  localize: {
    label: 'Localize & Transcreate',
    emoji: '🌍',
    tabs: [
      { id: 'tts', label: 'Text-to-Speech', shortLabel: 'TTS', icon: Volume2, product: '70+ Voices' },
      { id: 'stt', label: 'Speech-to-Text', shortLabel: 'STT', icon: Mic, product: 'Multi-provider' },
      { id: 'translation', label: 'Translation', shortLabel: 'Translate', icon: Languages, product: 'DeepL Powered' },
      { id: 'transcreation', label: 'Transcreation', shortLabel: 'Transcreate', icon: Sparkles, product: 'Cultural AI' },
    ],
  },
};

// Unique capabilities that set the platform apart
const DIFFERENTIATORS = [
  { icon: User, name: 'AI Avatars', desc: 'Photorealistic digital presenters in 140+ languages — lip-synced natively', tier: 'Pro' },
  { icon: Box, name: 'Text-to-3D', desc: 'Product descriptions → interactive 3D models in minutes', tier: 'Pro' },
  { icon: Music, name: 'Voice Clone', desc: 'Your brand voice, cloned and ready for every language and region', tier: 'Pro' },
  { icon: Image, name: 'AI Image Gen', desc: 'Studio-quality visuals from text — no stock photos needed', tier: 'Free' },
  { icon: Sparkles, name: 'Animation', desc: 'Static assets → motion with AI-driven animation', tier: 'Creator' },
  { icon: Layers, name: 'AR/VR Export', desc: 'Deploy immersive experiences directly to AR/VR channels', tier: 'Enterprise' },
];

// What makes this platform unique (competitor-free messaging)
const ONLY_HERE = [
  { label: 'End-to-End in One Platform', desc: 'Idea → Script → Visual → Voice → Video → Translate → Publish. No plugins needed.' },
  { label: 'Transcreation, Not Translation', desc: 'AI adapts cultural context, idioms, and tone — not just words.' },
  { label: '15 AI Providers, Auto-Routed', desc: 'Gemini, Azure, DeepL, Claude — the best model picked per task automatically.' },
  { label: '7 Arabic Dialects', desc: 'Gulf, Egyptian, Levantine, Maghrebi — true dialect support, not just MSA.' },
];

interface IndustryShowcasesProps {
  region?: string;
}

export const IndustryShowcases: React.FC<IndustryShowcasesProps> = ({ region }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(FEATURED_INDUSTRIES[0]);
  const [activePipeline, setActivePipeline] = useState('deck');
  const [showExtended, setShowExtended] = useState(false);
  const [showDifferentiators, setShowDifferentiators] = useState(false);

  return (
    <section className="py-24 relative" id="languages">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 gap-2 border-primary/30 text-primary">
            <Zap className="w-3 h-3" />
            Try It Live — Real AI Generation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Everything You Need.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            25+ production capabilities under one roof — pick your industry, choose a pipeline, 
            and <span className="text-primary font-bold">try it now</span>. 
            Not mockups. <span className="text-primary font-bold">Real AI generation</span>.
          </p>
        </div>

        {/* "Only Here" differentiators strip */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {ONLY_HERE.map((item) => (
            <div 
              key={item.label}
              className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group"
            >
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Industry selector */}
        <div className="mb-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Select Your Industry
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURED_INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              const isSelected = selectedIndustry.id === industry.id;
              
              return (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/25' 
                      : 'bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{industry.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected industry context bar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndustry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
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
                    <p className="text-xl font-bold text-primary">{selectedIndustry.stats.savings}</p>
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
          </motion.div>
        </AnimatePresence>

        {/* Pipeline demo tabs — FIXED STYLING */}
        <Tabs value={activePipeline} onValueChange={setActivePipeline} className="w-full">
          <div className="bg-card border border-border rounded-2xl mb-6 overflow-hidden">
            {/* Create Content row */}
            <div className="border-b border-border">
              <div className="px-4 pt-3 pb-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {PIPELINE_GROUPS.create.emoji} {PIPELINE_GROUPS.create.label}
                </p>
              </div>
              <TabsList className="bg-transparent h-auto w-full p-2 pt-0 gap-2 justify-start flex-wrap">
                {PIPELINE_GROUPS.create.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                        bg-muted text-foreground border border-border/50
                        data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted
                        hover:bg-accent/10 hover:border-primary/30
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                        data-[state=active]:border-primary data-[state=active]:shadow-md
                        transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="text-[10px] opacity-70 hidden md:inline">· {tab.product}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Localize & Transcreate row */}
            <div>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {PIPELINE_GROUPS.localize.emoji} {PIPELINE_GROUPS.localize.label}
                </p>
              </div>
              <TabsList className="bg-transparent h-auto w-full p-2 pt-0 gap-2 justify-start flex-wrap">
                {PIPELINE_GROUPS.localize.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                        bg-muted text-foreground border border-border/50
                        data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted
                        hover:bg-accent/10 hover:border-primary/30
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                        data-[state=active]:border-primary data-[state=active]:shadow-md
                        transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="text-[10px] opacity-70 hidden md:inline">· {tab.product}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Demo cards per pipeline */}
          <div className="min-h-[300px]">
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
          </div>
        </Tabs>

        {/* Cross-functional capabilities — integrated from CrossFunctionalSection */}
        <div className="mt-10">
          <button
            onClick={() => setShowDifferentiators(!showDifferentiators)}
            className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">25+ Cross-Functional Capabilities</p>
                <p className="text-xs text-muted-foreground">
                  AI Avatars · Voice Clone · Text-to-3D · Animation · AR/VR Export — all included
                </p>
              </div>
            </div>
            <ArrowRight className={`h-5 w-5 text-primary transition-transform duration-200 ${showDifferentiators ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showDifferentiators && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {DIFFERENTIATORS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.name}
                        className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors"
                      >
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-foreground">{item.name}</p>
                            <Badge variant={item.tier === 'Free' ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0">
                              {item.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  All capabilities included. No plugins. No third-party tools. No hidden costs.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cross-pipeline value prop */}
        <div className="mt-8 grid sm:grid-cols-4 gap-3">
          {[
            { title: 'Same Industry', desc: 'One context, multiple outputs', icon: Zap },
            { title: '7 Pipelines', desc: 'Deck + Video + Content + TTS + Translate', icon: Layers },
            { title: 'Every Language', desc: 'Transcreated, not translated', icon: Languages },
            { title: 'All Regions', desc: 'Zone-routed AI providers', icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm">
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
