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
  CheckCircle2, Star, Smartphone, Eye,
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
      { id: 'translation', label: 'Translation', shortLabel: 'Translate', icon: Languages, product: 'Genie Hub' },
      { id: 'transcreation', label: 'Transcreation', shortLabel: 'Transcreate', icon: Sparkles, product: 'Genie Suite' },
    ],
  },
};

// Industry-specific content context for pipeline groups and How It Works
const INDUSTRY_CONTEXT: Record<string, {
  create: { headline: string; subtitle: string; examples: string[] };
  localize: { headline: string; subtitle: string; examples: string[] };
  howItWorks: { title: string; subtitle: string; steps: { step: string; title: string; desc: string }[] };
}> = {
  healthcare: {
    create: {
      headline: 'Create Patient & HCP Content',
      subtitle: 'Generate compliant patient education decks, training videos, and clinical content in minutes',
      examples: ['Patient Onboarding Guide', 'HCP Training Module', 'Clinical Trial Summary'],
    },
    localize: {
      headline: 'Localize for Global Patient Populations',
      subtitle: 'Transcreate medical content with cultural sensitivity — from consent forms to discharge instructions',
      examples: ['Multilingual Consent Forms', 'Patient Portal in 22 Languages', 'Provider Notes Transcription'],
    },
    howItWorks: {
      title: 'Healthcare Content Pipeline',
      subtitle: 'From clinical input to compliant, multilingual patient-ready materials',
      steps: [
        { step: '01', title: 'Clinical Input', desc: 'Upload protocols, guidelines, or drug info — AI extracts key messaging' },
        { step: '02', title: 'Compliance Check', desc: 'Auto-validates against HIPAA, FDA labeling, and regional health authority standards' },
        { step: '03', title: 'Content Generation', desc: 'AI creates patient-friendly decks, explainer videos, and education guides' },
        { step: '04', title: 'Medical Transcreation', desc: 'Adapts to 22+ languages with culturally appropriate medical terminology' },
      ],
    },
  },
  education: {
    create: {
      headline: 'Create Course & Learning Content',
      subtitle: 'Build interactive course modules, avatar-led lectures, and assessment materials at scale',
      examples: ['Interactive Lesson Plan', 'Avatar Instructor Video', 'Student Assessment Deck'],
    },
    localize: {
      headline: 'Localize for Vernacular Learning',
      subtitle: 'Deliver education in mother tongues — from Hindi to Swahili — with dialect-perfect audio',
      examples: ['Vernacular Course Audio', 'Exam Transcription', 'Multilingual Textbook Translation'],
    },
    howItWorks: {
      title: 'EdTech Content Pipeline',
      subtitle: 'From curriculum to vernacular-ready, engaging course materials',
      steps: [
        { step: '01', title: 'Curriculum Input', desc: 'Upload syllabus, lesson plans, or raw lecture notes for AI structuring' },
        { step: '02', title: 'Adaptive Generation', desc: 'Creates slide decks, video scripts, and quizzes matched to learning levels' },
        { step: '03', title: 'Avatar & Voice', desc: 'AI instructor avatars deliver content with native-language lip-sync' },
        { step: '04', title: 'Vernacular Reach', desc: 'Transcreated into 35+ languages with regional dialect accuracy' },
      ],
    },
  },
  finance: {
    create: {
      headline: 'Create Investor & Compliance Content',
      subtitle: 'Generate pitch decks, regulatory reports, and market analysis with AI precision',
      examples: ['Investor Pitch Deck', 'Quarterly Compliance Report', 'Market Analysis Brief'],
    },
    localize: {
      headline: 'Localize for Global Markets',
      subtitle: 'Transcreate financial content with regional compliance and cultural context for every market',
      examples: ['Multilingual Annual Report', 'Regional Compliance Audio', 'Cross-Border Prospectus'],
    },
    howItWorks: {
      title: 'Finance Content Pipeline',
      subtitle: 'From data to investor-ready, compliant, multilingual financial content',
      steps: [
        { step: '01', title: 'Data Ingestion', desc: 'Feed financial data, earnings reports, or market research for AI analysis' },
        { step: '02', title: 'Smart Formatting', desc: 'Auto-generates charts, executive summaries, and regulatory-compliant layouts' },
        { step: '03', title: 'Compliance Layer', desc: 'Validates against SEC, MiFID II, and regional financial disclosure rules' },
        { step: '04', title: 'Market Adaptation', desc: 'Transcreated for 15+ markets with currency, dialect, and format localization' },
      ],
    },
  },
  government: {
    create: {
      headline: 'Create Citizen & Policy Content',
      subtitle: 'Generate public service announcements, policy explainers, and civic engagement materials',
      examples: ['Public Health PSA', 'Policy Explainer Video', 'Citizen Service Guide'],
    },
    localize: {
      headline: 'Reach Every Citizen in Their Language',
      subtitle: 'Deliver government communications in 40+ local languages and dialects — including 7 Arabic dialects',
      examples: ['Multilingual PSA Broadcast', 'Citizen Feedback Transcription', 'Regional Policy Translation'],
    },
    howItWorks: {
      title: 'Government Content Pipeline',
      subtitle: 'From policy documents to citizen-ready, multilingual public communications',
      steps: [
        { step: '01', title: 'Policy Input', desc: 'Upload legislation, guidelines, or briefings for AI simplification' },
        { step: '02', title: 'Citizen-Friendly Output', desc: 'Transforms complex policy into clear PSAs, infographics, and video explainers' },
        { step: '03', title: 'Accessibility Check', desc: 'Ensures plain language, ADA compliance, and readability standards' },
        { step: '04', title: 'Dialect-Level Reach', desc: 'Transcreated into 40+ languages including regional dialects and RTL formats' },
      ],
    },
  },
  tourism: {
    create: {
      headline: 'Create Destination & Travel Content',
      subtitle: 'Build stunning promo videos, virtual tours, and multilingual travel guides with AI',
      examples: ['Destination Promo Video', 'Virtual Hotel Tour', 'Travel Itinerary Guide'],
    },
    localize: {
      headline: 'Speak Every Traveler\'s Language',
      subtitle: 'Transcreate travel content with cultural nuance — from Arabic to Japanese to Portuguese',
      examples: ['Multilingual Audio Guide', 'Guest Review Transcription', 'Localized Booking Portal'],
    },
    howItWorks: {
      title: 'Travel Content Pipeline',
      subtitle: 'From destination assets to traveler-ready, globally localized content',
      steps: [
        { step: '01', title: 'Asset Upload', desc: 'Upload photos, property specs, or destination highlights for AI enhancement' },
        { step: '02', title: 'Visual Storytelling', desc: 'AI creates promo reels, virtual tours, and branded travel decks' },
        { step: '03', title: 'Cultural Adaptation', desc: 'Adjusts messaging for cultural preferences, holidays, and travel norms' },
        { step: '04', title: 'Global Distribution', desc: 'Transcreated into 25+ languages with native voiceovers for every market' },
      ],
    },
  },
  retail: {
    create: {
      headline: 'Create Product & Campaign Content',
      subtitle: 'Generate product videos, social ads, and influencer-ready content at campaign speed',
      examples: ['Product Launch Video', 'Social Media Ad Set', 'Influencer Brief Deck'],
    },
    localize: {
      headline: 'Localize for Every Shopper',
      subtitle: 'Adapt product content to local markets — tone, format, and cultural references included',
      examples: ['Regional Product Descriptions', 'Customer Review Audio', 'Marketplace Listing Translation'],
    },
    howItWorks: {
      title: 'Retail Content Pipeline',
      subtitle: 'From product catalog to market-ready, localized shopping experiences',
      steps: [
        { step: '01', title: 'Product Feed', desc: 'Import product data, images, and specs from your catalog or PIM system' },
        { step: '02', title: 'Creative Generation', desc: 'AI creates product videos, social ads, and listing content automatically' },
        { step: '03', title: 'Format Optimization', desc: 'Auto-resizes for Instagram, TikTok, Amazon, and marketplace standards' },
        { step: '04', title: 'Market Localization', desc: 'Transcreated for 20+ markets with local pricing, sizing, and cultural tone' },
      ],
    },
  },
  manufacturing: {
    create: {
      headline: 'Create Training & Safety Content',
      subtitle: 'Build safety training videos, multilingual SOPs, and equipment guides with AI',
      examples: ['Safety Protocol Video', 'Equipment Operation SOP', 'Compliance Training Deck'],
    },
    localize: {
      headline: 'Train Workers in Their Language',
      subtitle: 'Deliver safety-critical content in every worker\'s native language — no misunderstanding allowed',
      examples: ['Multilingual Safety Briefing', 'Floor Inspection Audio', 'Regional SOP Translation'],
    },
    howItWorks: {
      title: 'Manufacturing Content Pipeline',
      subtitle: 'From technical docs to worker-ready, safety-compliant multilingual materials',
      steps: [
        { step: '01', title: 'Technical Input', desc: 'Upload equipment manuals, safety protocols, or engineering specs' },
        { step: '02', title: 'Worker-Ready Output', desc: 'AI simplifies into visual SOPs, training videos, and quick-reference cards' },
        { step: '03', title: 'Safety Validation', desc: 'Cross-checks against OSHA, ISO, and regional safety standards' },
        { step: '04', title: 'Workforce Languages', desc: 'Transcreated into 18+ worker languages with clear, simple terminology' },
      ],
    },
  },
  realestate: {
    create: {
      headline: 'Create Property & Investor Content',
      subtitle: 'Generate virtual tours, listing videos, and investor presentations with AI precision',
      examples: ['Property Virtual Tour', 'Investor Pitch Deck', 'Luxury Listing Video'],
    },
    localize: {
      headline: 'Reach Global Investors & Buyers',
      subtitle: 'Transcreate property content for international buyers — from Gulf Arabic to Mandarin',
      examples: ['Multilingual Listing Portal', 'Investor Call Transcription', 'Regional Market Report'],
    },
    howItWorks: {
      title: 'Real Estate Content Pipeline',
      subtitle: 'From property assets to investor-ready, globally marketed content',
      steps: [
        { step: '01', title: 'Property Data', desc: 'Upload floor plans, photos, specs, and market comps for AI processing' },
        { step: '02', title: 'Visual Showcase', desc: 'AI creates virtual tours, drone-style videos, and branded listing decks' },
        { step: '03', title: 'Market Positioning', desc: 'Adapts pricing format, measurement units, and investment terminology per region' },
        { step: '04', title: 'Investor Reach', desc: 'Transcreated for 12+ markets with dialect-specific voiceovers and cultural tone' },
      ],
    },
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
  { label: '19 AI Providers, Auto-Routed', desc: 'Gemini, Azure, DeepL, Claude, Alibaba — the best model picked per task automatically.' },
  { label: '7 Arabic Dialects', desc: 'Gulf, Egyptian, Levantine, Maghrebi — true dialect support, not just MSA.' },
];

interface IndustryShowcasesProps {
  region?: string;
  config?: RegionalConfig;
}

// Regional stories data removed — Real Results tab eliminated per restructure
export const IndustryShowcases: React.FC<IndustryShowcasesProps> = ({ region, config }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(FEATURED_INDUSTRIES[0]);
  const [activePipeline, setActivePipeline] = useState('deck');
  const [showExtended, setShowExtended] = useState(false);
  const [showDifferentiators, setShowDifferentiators] = useState(false);

  return (
    <section className="py-20 sm:py-28 relative" id="languages">
      {/* Layered background for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* ── Hero Header Block ── */}
        <motion.div 
          className="text-center mb-14 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">Live AI — Not Mockups</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
            One Platform.{' '}
            <span className="block sm:inline">Every Market.</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_6s_ease_infinite]">
              The Only One You Need.
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pick your industry. Choose a pipeline. Generate real content.
          </p>

          {/* Stats ribbon */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
            {[
              { value: '15', label: 'AI Providers' },
              { value: '206', label: 'Pipelines' },
              { value: '140+', label: 'Languages' },
              { value: '50+', label: 'Industries' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <p className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide uppercase mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── "Only Here" Differentiators ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {ONLY_HERE.map((item, i) => (
            <div 
              key={item.label}
              className="relative group p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Industry Selector ── */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground scale-[1.03] shadow-lg shadow-primary/20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background' 
                      : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{industry.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Selected Industry Context ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndustry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-6"
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                {/* Industry info */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {React.createElement(selectedIndustry.icon, { className: 'h-6 w-6 text-primary' })}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{selectedIndustry.name}</h3>
                    <p className="text-xs text-muted-foreground leading-snug">{selectedIndustry.positioning}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-5 sm:gap-6">
                  {[
                    { value: selectedIndustry.stats.time, label: 'Avg Gen', color: 'text-primary' },
                    { value: selectedIndustry.stats.languages, label: 'Languages', color: 'text-accent' },
                    { value: selectedIndustry.stats.savings, label: 'Savings', color: 'text-primary' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Regions */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedIndustry.regions.map(r => (
                    <Badge key={r} variant="outline" className="text-[10px] gap-1 border-border/60">
                      <Globe className="w-2.5 h-2.5" />{r}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pipeline demo tabs — mobile-friendly, industry-contextualized */}
        {(() => {
          const ctx = INDUSTRY_CONTEXT[selectedIndustry.id] || INDUSTRY_CONTEXT.healthcare;
          return (
            <>
              <Tabs value={activePipeline} onValueChange={setActivePipeline} className="w-full">
                <div className="bg-card border border-border rounded-2xl mb-5 sm:mb-6 overflow-hidden">
                  {/* Create Content row — industry-specific */}
                  <div className="border-b border-border">
                    <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {PIPELINE_GROUPS.create.emoji} {ctx.create.headline}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 max-w-xl">{ctx.create.subtitle}</p>
                      <div className="flex gap-1.5 mt-1.5 mb-1">
                        {ctx.create.examples.map((ex) => (
                          <Badge key={ex} variant="outline" className="text-[9px] border-primary/20 text-primary/70 bg-primary/5">
                            {ex}
                          </Badge>
                        ))}
                      </div>
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

                  {/* Localize & Transcreate row — industry-specific */}
                  <div>
                    <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {PIPELINE_GROUPS.localize.emoji} {ctx.localize.headline}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 max-w-xl">{ctx.localize.subtitle}</p>
                      <div className="flex gap-1.5 mt-1.5 mb-1">
                        {ctx.localize.examples.map((ex) => (
                          <Badge key={ex} variant="outline" className="text-[9px] border-accent/20 text-accent/70 bg-accent/5">
                            {ex}
                          </Badge>
                        ))}
                      </div>
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

              {/* Industry-Specific "How It Works" Pipeline Steps */}
              <div className="mt-8 sm:mt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`how-${selectedIndustry.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          {ctx.howItWorks.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{ctx.howItWorks.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                        {selectedIndustry.name}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {ctx.howItWorks.steps.map((step, i) => (
                        <motion.div
                          key={step.step}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="relative group"
                        >
                          <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className="text-2xl font-black text-primary/20">{step.step}</span>
                              {i < ctx.howItWorks.steps.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground/40 hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10" />
                              )}
                            </div>
                            <p className="text-sm font-bold text-foreground mb-1">{step.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Outputs & Combinations */}
              <div className="mt-8 sm:mt-10">
                <Tabs defaultValue="outputs" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">
                        {selectedIndustry.name} — Output Gallery
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Real outputs and multi-pipeline combinations for {selectedIndustry.name.toLowerCase()}
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
                      excludePipeline={activePipeline}
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
            </>
          );
        })()}

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
            <span className="text-foreground font-medium">19 AI providers</span>,{' '}
            <span className="text-foreground font-medium">206 pipelines</span>, and{' '}
            <span className="text-foreground font-medium">140+ language</span> transcreation — 
            customized for your market, compliance, and audience.
          </p>
        </div>

        {/* ============================================ */}
        {/* CONSOLIDATED: Why Genie + Showcase + Transcreation + Global Stories */}
        {/* ============================================ */}
        {/* See How It Works section removed */}
      </div>
    </section>
  );
};


export default IndustryShowcases;
