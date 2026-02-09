/**
 * INDUSTRY SHOWCASES — Unified "Everything You Need" Hub
 * 
 * THE SINGLE consolidated section for the landing page, merging:
 * - Interactive "Try It Live" demos (Deck, Video, TTS, etc.)
 * - Why Genie differentiators (First-to-Market + Only Here)
 * - See It In Action showcase cards (Input → Pipeline → Output)
 * - Transcreation vs Translation comparison
 * - Global Inspiration stories
 * - Cross-functional capabilities
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
  CheckCircle2, Star, Smartphone, Eye, Trophy, Quote,
  TrendingUp, Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DeckDemoCard } from './demo-hub/DeckDemoCard';
import { VideoDemoCard } from './demo-hub/VideoDemoCard';
import { ContentDemoCard } from './demo-hub/ContentDemoCard';
import { TTSDemoCard } from './demo-hub/TTSDemoCard';
import { STTDemoCard } from './demo-hub/STTDemoCard';
import { TranslationDemoCard } from './demo-hub/TranslationDemoCard';
import { TranscreationDemoCard } from './demo-hub/TranscreationDemoCard';
import { PipelineOutputGallery } from './demo-hub/PipelineOutputGallery';
import { CombinationShowcase } from './demo-hub/CombinationShowcase';
import type { RegionalConfig, RegionalShowcaseExample } from '@/config/regionalLandingConfig';

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
    id: 'government', name: 'Govt', icon: Landmark,
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
      { id: 'tts', label: 'Text-to-Speech', shortLabel: 'TTS', icon: Volume2, product: 'Genie Cast' },
      { id: 'stt', label: 'Speech-to-Text', shortLabel: 'STT', icon: Mic, product: 'Genie Mind' },
      { id: 'translation', label: 'Translation', shortLabel: 'Translate', icon: Languages, product: 'Genie Arc' },
      { id: 'transcreation', label: 'Transcreation', shortLabel: 'Transcreate', icon: Sparkles, product: 'Genie Studio' },
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
  config?: RegionalConfig;
}

// ============================================
// REGIONAL STORIES — previously GlobalInspirationSection
// ============================================
const REGIONAL_STORIES = [
  {
    region: 'MENA', flag: '🇸🇦', company: 'Government Education Initiative', industry: 'Government & Education',
    useCase: 'Launched nationwide educational content across all 7 Arabic dialects — from Gulf to Levantine — with full RTL support.',
    stats: { reach: '5M students', languages: '7 dialects', time: '3 weeks' },
    quote: 'We went from months of agency work to weeks of self-service. Every dialect felt authentic.',
    outcomes: ['80% faster delivery', 'Zero dialect complaints', 'Full MENA compliance'],
  },
  {
    region: 'India', flag: '🇮🇳', company: 'EdTech Learning Platform', industry: 'EdTech & Training',
    useCase: 'Course content transcreated into 22 Indian languages with Hinglish code-mixing for urban audiences.',
    stats: { reach: '140M learners', languages: '22', time: '6 weeks' },
    quote: 'Hinglish transcreation doubled our engagement in metro cities.',
    outcomes: ['2x engagement uplift', '22 language variants', 'Native prosody'],
  },
  {
    region: 'Africa', flag: '🌍', company: 'Mobile Financial Services', industry: 'Fintech & Banking',
    useCase: 'Financial literacy videos in 10 African languages including Swahili, Yoruba, and Amharic.',
    stats: { reach: '50M users', languages: '10', time: '4 weeks' },
    quote: 'First time our customers heard financial advice in their mother tongue.',
    outcomes: ['40% trust increase', '10 native languages', 'Mobile-first delivery'],
  },
  {
    region: 'Europe', flag: '🇪🇺', company: 'Industrial Manufacturing Group', industry: 'Manufacturing & Safety',
    useCase: 'Factory safety training across 15 European facilities — GDPR-compliant, culturally adapted.',
    stats: { reach: '100K workers', languages: '12', time: '2 weeks' },
    quote: 'We reduced training localization costs by 80% while comprehension scores went up.',
    outcomes: ['80% cost reduction', 'GDPR compliant', '15 facilities covered'],
  },
  {
    region: 'APAC', flag: '🌏', company: 'Cloud Technology Provider', industry: 'Technology & SaaS',
    useCase: 'Technical docs and developer tutorials with CJK-optimized voices and proper honorific adaptation.',
    stats: { reach: '10M developers', languages: '8', time: '1 week' },
    quote: 'Natural Mandarin, proper Japanese keigo, contextual Korean — developers finally engage.',
    outcomes: ['3x doc engagement', 'CJK-native voices', 'Honorific accuracy'],
  },
  {
    region: 'LATAM', flag: '🌎', company: 'Digital Banking Platform', industry: 'Fintech & Consumer',
    useCase: 'Customer onboarding videos transcreated between Brazilian Portuguese and 5 Spanish dialects.',
    stats: { reach: '80M customers', languages: '6 variants', time: '2 weeks' },
    quote: 'Our Mexican customers noticed we stopped sounding "Spanish" and started sounding local.',
    outcomes: ['30% onboarding uplift', '6 dialect variants', 'Regional slang support'],
  },
];

export const IndustryShowcases: React.FC<IndustryShowcasesProps> = ({ region, config }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(FEATURED_INDUSTRIES[0]);
  const [activePipeline, setActivePipeline] = useState('deck');
  const [showExtended, setShowExtended] = useState(false);
  const [showDifferentiators, setShowDifferentiators] = useState(false);

  return (
    <section className="py-16 sm:py-24 relative" id="languages">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge variant="outline" className="mb-3 sm:mb-4 gap-2 border-primary/30 text-primary">
            <Zap className="w-3 h-3" />
            Try It Live — Real AI Generation
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Everything You Need.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            25+ production capabilities under one roof — pick your industry, choose a pipeline, 
            and <span className="text-primary font-bold">try it now</span>. 
            Not mockups. <span className="text-primary font-bold">Real AI generation</span>.
          </p>
        </div>

        {/* "Only Here" differentiators strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-10">
          {ONLY_HERE.map((item) => (
            <div 
              key={item.label}
              className="flex items-start gap-2.5 p-3 sm:p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group"
            >
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Industry selector — scrollable on mobile */}
        <div className="mb-5 sm:mb-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Select Your Industry
          </p>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide justify-start sm:justify-center sm:flex-wrap">
            {FEATURED_INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              const isSelected = selectedIndustry.id === industry.id;
              
              return (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/25' 
                      : 'bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            className="mb-5 sm:mb-6"
          >
            <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 md:p-5">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                {/* Industry info */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  {React.createElement(selectedIndustry.icon, { className: 'h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0' })}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{selectedIndustry.name}</h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{selectedIndustry.positioning}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-primary">{selectedIndustry.stats.time}</p>
                    <p className="text-[10px] text-muted-foreground">Avg Gen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-accent">{selectedIndustry.stats.languages}</p>
                    <p className="text-[10px] text-muted-foreground">Languages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-primary">{selectedIndustry.stats.savings}</p>
                    <p className="text-[10px] text-muted-foreground">Savings</p>
                  </div>
                </div>

                {/* Regions + Pipelines */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedIndustry.regions.map(r => (
                    <Badge key={r} variant="outline" className="text-[10px] gap-1">
                      <Globe className="w-2.5 h-2.5" />{r}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pipeline demo tabs — mobile-friendly */}
        <Tabs value={activePipeline} onValueChange={setActivePipeline} className="w-full">
          <div className="bg-card border border-border rounded-2xl mb-5 sm:mb-6 overflow-hidden">
            {/* Create Content row */}
            <div className="border-b border-border">
              <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1">
                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {PIPELINE_GROUPS.create.emoji} {PIPELINE_GROUPS.create.label}
                </p>
              </div>
              <TabsList className="bg-transparent h-auto w-full p-1.5 sm:p-2 pt-0 gap-1.5 sm:gap-2 justify-start flex-nowrap sm:flex-wrap overflow-x-auto scrollbar-hide">
                {PIPELINE_GROUPS.create.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium shrink-0
                        bg-muted text-foreground border border-border/50
                        data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted
                        hover:bg-accent/10 hover:border-primary/30
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                        data-[state=active]:border-primary data-[state=active]:shadow-md
                        transition-all duration-200"
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="text-[9px] sm:text-[10px] opacity-70 hidden md:inline">· {tab.product}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Localize & Transcreate row */}
            <div>
              <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1">
                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {PIPELINE_GROUPS.localize.emoji} {PIPELINE_GROUPS.localize.label}
                </p>
              </div>
              <TabsList className="bg-transparent h-auto w-full p-1.5 sm:p-2 pt-0 gap-1.5 sm:gap-2 justify-start flex-nowrap sm:flex-wrap overflow-x-auto scrollbar-hide">
                {PIPELINE_GROUPS.localize.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium shrink-0
                        bg-muted text-foreground border border-border/50
                        data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted
                        hover:bg-accent/10 hover:border-primary/30
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                        data-[state=active]:border-primary data-[state=active]:shadow-md
                        transition-all duration-200"
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="text-[9px] sm:text-[10px] opacity-70 hidden md:inline">· {tab.product}</span>
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

        {/* Integrated Industry Outputs — Two paths: See Outputs + Try Combinations */}
        <div className="mt-8 sm:mt-10">
          <Tabs defaultValue="outputs" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedIndustry.name} — How It Works
                </h3>
                <p className="text-xs text-muted-foreground">
                  See real outputs or explore multi-pipeline combinations → convert anything to 140+ languages
                </p>
              </div>
              <TabsList level="child" className="shrink-0">
                <TabsTrigger value="outputs" level="child" className="gap-1.5">
                  <Eye className="h-3 w-3" /> Outputs
                </TabsTrigger>
                <TabsTrigger value="combinations" level="child" className="gap-1.5">
                  <Layers className="h-3 w-3" /> Combinations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="outputs" className="mt-0">
              <PipelineOutputGallery 
                industryId={selectedIndustry.id} 
                industryName={selectedIndustry.name} 
              />
            </TabsContent>
            <TabsContent value="combinations" className="mt-0">
              <CombinationShowcase 
                industryId={selectedIndustry.id} 
                industryName={selectedIndustry.name} 
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Cross-functional capabilities — integrated from CrossFunctionalSection */}
        <div className="mt-8 sm:mt-10">
          <button
            onClick={() => setShowDifferentiators(!showDifferentiators)}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm sm:text-base text-foreground">25+ Cross-Functional Capabilities</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
                  {DIFFERENTIATORS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.name}
                        className="flex items-start gap-3 p-3 sm:p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">{item.name}</p>
                            <Badge variant={item.tier === 'Free' ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0">
                              {item.tier}
                            </Badge>
                          </div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[11px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
                  All capabilities included. No plugins. No third-party tools. No hidden costs.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cross-pipeline value prop */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { title: 'Same Industry', desc: 'One context, multiple outputs', icon: Zap },
            { title: '7 Pipelines', desc: 'Deck + Video + Content + TTS + Translate', icon: Layers },
            { title: 'Every Language', desc: 'Transcreated, not translated', icon: Languages },
            { title: 'All Regions', desc: 'Zone-routed AI providers', icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/30 rounded-xl border border-border">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="text-center mt-5 sm:mt-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-xs sm:text-sm">
              All demos use <strong>real AI providers</strong> — Azure Neural TTS, DeepL, Gemini, Whisper STT
            </span>
          </div>
        </div>

        {/* Extended industries */}
        <div className="text-center mt-8 sm:mt-10">
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

          <p className="text-muted-foreground text-xs sm:text-sm mt-4">
            Every industry gets the same{' '}
            <span className="text-foreground font-medium">15 AI providers</span>,{' '}
            <span className="text-foreground font-medium">206 pipelines</span>, and{' '}
            <span className="text-foreground font-medium">140+ language</span> transcreation — 
            customized for your market, compliance, and audience.
          </p>
        </div>

        {/* ============================================ */}
        {/* CONSOLIDATED: Why Genie + Showcase + Transcreation + Global Stories */}
        {/* ============================================ */}
        {config && (
          <div className="mt-12 sm:mt-16 pt-12 border-t border-border/50">
            <Tabs defaultValue="why-genie" className="w-full">
              <div className="text-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                  Explore What's Included
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Differentiators, live showcases, transcreation depth, and real results — all under one roof.
                </p>
              </div>

              <TabsList className="w-full h-auto p-1 bg-card border border-border rounded-xl mb-8 grid grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger
                  value="why-genie"
                  className="flex items-center gap-1.5 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm font-semibold"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Why Genie</span>
                  <span className="sm:hidden">Why</span>
                </TabsTrigger>
                <TabsTrigger
                  value="showcase"
                  className="flex items-center gap-1.5 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm font-semibold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">See It In Action</span>
                  <span className="sm:hidden">In Action</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transcreation"
                  className="flex items-center gap-1.5 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm font-semibold"
                >
                  <Languages className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Transcreation vs Translation</span>
                  <span className="sm:hidden">Compare</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stories"
                  className="flex items-center gap-1.5 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm font-semibold"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Real Results</span>
                  <span className="sm:hidden">Results</span>
                </TabsTrigger>
              </TabsList>

              {/* WHY GENIE TAB */}
              <TabsContent value="why-genie" className="mt-0 space-y-6">
                <div className="p-5 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl border border-primary/20 text-center">
                  <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    We Speak Your Language. We Understand Your Market.
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    Your content deserves more than word-for-word translation. Genie adapts tone, idioms, cultural references,
                    and regional compliance — so your audience feels you were{' '}
                    <span className="text-primary font-semibold">built for them</span>.
                  </p>
                </div>
                {/* First to Market */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">First to Market</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {config.differentiators.firstToMarket.map((claim, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <Trophy className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground">{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Only Here */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Only Here</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {config.differentiators.capabilityDepth.map((claim, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground">{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* SEE IT IN ACTION TAB */}
              <TabsContent value="showcase" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.showcaseExamples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="h-full border-border/60 bg-card/80 hover:border-primary/40 transition-all hover:shadow-lg">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{example.icon}</span>
                            <h4 className="font-bold text-foreground text-sm">{example.industry}</h4>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-14 shrink-0 text-[10px] font-semibold text-muted-foreground uppercase mt-1">Input</span>
                            <div className="flex-1 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-foreground">{example.input}</div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-14 shrink-0 text-[10px] font-semibold text-muted-foreground uppercase mt-1">Pipeline</span>
                            <div className="flex flex-wrap gap-1">
                              {example.pipeline.split(' → ').map((step, i, arr) => (
                                <React.Fragment key={i}>
                                  <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary font-semibold px-1.5 py-0.5">
                                    {step}
                                  </Badge>
                                  {i < arr.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground self-center" />}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-14 shrink-0 text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase mt-1">Output</span>
                            <div className="flex-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-foreground font-medium">
                              {example.output}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Globe className="h-3 w-3" /> {example.languages}
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> {example.impact}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* TRANSCREATION vs TRANSLATION TAB */}
              <TabsContent value="transcreation" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Real examples from <span className="text-primary font-semibold">{config.hero.regionName}</span> — 
                    notice how Genie preserves intent, not just words.
                  </p>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">{config.languageShowcase.tabLabel}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" /> Transcreated
                        </span>
                        <span className="flex items-center gap-1 text-destructive">✗ Literal</span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {config.languageShowcase.languages.map((lang, i) => (
                        <div key={lang.code} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">{lang.nativeName}</span>
                              <Badge variant="outline" className="text-[10px]">{lang.region}</Badge>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">
                              <Volume2 className="h-3 w-3 mr-1" />
                              {lang.azureVoice.split('-').slice(0, 2).join('-')}
                            </Badge>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase mb-1">✓ Transcreated</p>
                              <p className={`text-sm text-foreground ${config.hero.isRTL ? 'text-right' : ''}`}>
                                {lang.transcreation}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-destructive uppercase mb-1">✗ Literal Translation</p>
                              <p className={`text-sm text-muted-foreground line-through ${config.hero.isRTL ? 'text-right' : ''}`}>
                                {lang.literal}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* REAL RESULTS TAB — Global Inspiration Stories */}
              <TabsContent value="stories" className="mt-0">
                <RegionalStoriesPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================
// REGIONAL STORIES PANEL
// ============================================
const RegionalStoriesPanel: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState(REGIONAL_STORIES[0]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {REGIONAL_STORIES.map((story) => (
          <button
            key={story.region}
            onClick={() => setSelectedStory(story)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition ${
              selectedStory.region === story.region
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            <span>{story.flag}</span>
            <span>{story.region}</span>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedStory.flag}</span>
              <div>
                <h4 className="text-lg font-bold text-foreground">{selectedStory.company}</h4>
                <Badge variant="secondary">{selectedStory.industry}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{selectedStory.useCase}</p>
            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <Quote className="h-5 w-5 text-primary mb-2" />
              <p className="text-foreground italic text-sm">"{selectedStory.quote}"</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStory.outcomes.map((outcome) => (
                <span key={outcome} className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {outcome}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 sm:p-8 flex flex-col justify-center">
            <h4 className="text-sm font-semibold text-foreground mb-4">Results Achieved</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{selectedStory.stats.reach}</p>
                <p className="text-xs text-muted-foreground">Reached</p>
              </div>
              <div className="text-center">
                <Globe className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{selectedStory.stats.languages}</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{selectedStory.stats.time}</p>
                <p className="text-xs text-muted-foreground">Time to Market</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryShowcases;
