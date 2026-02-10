/**
 * PRODUCT DETAIL SHOWCASE — Video-First Layout
 * 
 * Each product card prominently features:
 * 1. VIDEO PLAYER — Product demo/explainer video (placeholder until generated)
 * 2. IDENTITY — Logo, name, tagline, positioning statement
 * 3. MESSAGING — StoryBrand narrative + JTBD outcome
 * 4. KEY FEATURES & BENEFITS — Visual grid of what the product does
 * 5. CORE CAPABILITIES — Categorized capability pills
 * 6. POWERED BY — AI providers powering the product
 * 7. PIPELINE CATEGORIES — What pipeline types the product covers
 * 8. REGIONAL — How each product works across 8 global regions
 * 
 * Messaging frameworks: StoryBrand (narrative), JTBD (outcomes), AIDA (structure)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Globe, Zap, Sparkles, ArrowRight, 
  Play, Languages, Brain, Target, Rocket,
  BarChart3, Shield, Workflow, 
  Cpu, Mic, Video, FileText, Presentation,
  Send, Layers, MonitorPlay, ImageIcon, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { GENIE_PRODUCTS, ASK_GENIE, type GenieProduct } from '@/constants/genie-products';
import type { RegionSlug } from '@/config/regionalLandingConfig';

// Map display region names → route slugs
const REGION_SLUG_MAP: Record<string, RegionSlug> = {
  'NAM': 'nam',
  'Europe': 'europe',
  'MENA': 'mena',
  'India': 'india',
  'Africa': 'africa',
  'APAC': 'apac',
  'LATAM': 'latam',
  'Caribbean': 'caribbean',
};

// Product logos
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';
import genieArcLogo from '@/assets/logos/products/genie-arc.png';
import genieCastLogo from '@/assets/logos/products/genie-cast.png';
import askGenieLogo from '@/assets/logos/products/ask-genie.png';

import genieStudioLogo from '@/assets/logos/genie-studio-banner.png';

const PRODUCT_LOGOS: Record<string, string> = {
  spark: genieSparkLogo,
  mind: genieMindLogo,
  vibe: genieVibeLogo,
  deck: genieDeckLogo,
  arc: genieArcLogo,
  cast: genieCastLogo,
  studio: genieStudioLogo,
  ask: askGenieLogo,
};

// Product display order for the tab selector (uses PRODUCT_LOGOS for icons)
const PRODUCT_TAB_ORDER: { key: string; label: string }[] = [
  { key: 'studio', label: 'Studio' },
  { key: 'arc', label: 'Arc' },
  { key: 'spark', label: 'Spark' },
  { key: 'mind', label: 'Mind' },
  { key: 'deck', label: 'Deck' },
  { key: 'vibe', label: 'Vibe' },
  { key: 'cast', label: 'Cast' },
  { key: 'ask', label: 'Ask Genie' },
];

// Extended product data with full messaging, capabilities, and regional context
const PRODUCT_EXTENDED: Record<string, {
  pipelines: number;
  positioning: string;
  storyBrand: string;
  jtbd: string;
  videoPlaceholderTitle: string;
  keyBenefits: { icon: React.ReactNode; title: string; detail: string }[];
  coreCapabilities: string[];
  aiProviders: string[];
  regionalHighlights: { region: string; flag: string; useCase: string }[];
  idealFor: string[];
  screenshots: string[];
}> = {
  spark: {
    pipelines: 28,
    positioning: 'Transforms any raw content — documents, presentations, audio, video, URLs, or images — into structured, production-ready scripts using AI.',
    storyBrand: 'You have brilliant ideas trapped in documents. Spark sets them free.',
    jtbd: 'Help me turn raw content into a structured, production-ready script — fast.',
    videoPlaceholderTitle: 'See how Genie Spark converts any input into a polished script in under 2 minutes',
    keyBenefits: [
      { icon: <Zap className="h-4 w-4" />, title: 'Any Input → Script', detail: 'PDF, PPTX, MP4, MP3, URLs, Images — all converted into structured scripts automatically' },
      { icon: <Target className="h-4 w-4" />, title: 'Smart Structure Detection', detail: 'AI analyzes your content and generates scene breakdowns, chapters, and visual cues' },
      { icon: <Sparkles className="h-4 w-4" />, title: 'AI Image Generation', detail: 'When no visuals exist, AI generates context-aware images for each scene' },
      { icon: <Rocket className="h-4 w-4" />, title: 'Under 2 Minutes', detail: 'From raw document to production-ready script in under 2 minutes' },
    ],
    coreCapabilities: ['Document to Script', 'PPT to Script', 'Video to Script', 'Audio to Script', 'URL to Script', 'Image to Script', 'Auto-structure Detection', 'Multi-format Processing'],
    aiProviders: ['Claude', 'GPT-4o', 'Gemini', 'Qwen'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Research papers → training scripts in minutes' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'EU compliance docs → multilingual scripts in 25 languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'Arabic PDFs → RTL-aware video scripts across 7 dialects' },
      { region: 'India', flag: '🇮🇳', useCase: 'Hindi documents → 22-language regional scripts' },
      { region: 'Africa', flag: '🌍', useCase: 'NGO reports → Swahili & Amharic training scripts' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK presentations → localized content with tonal accuracy' },
      { region: 'LATAM', flag: '🌎', useCase: 'Spanish & Portuguese docs → region-specific scripts' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Tourism & hospitality docs → multilingual content' },
    ],
    idealFor: ['Content Creators', 'L&D Teams', 'Marketing', 'Educators', 'Research Teams'],
    screenshots: ['Script Editor', 'Input Processing', 'Scene Breakdown'],
  },
  mind: {
    pipelines: 30,
    positioning: 'Enhances scripts with AI editing, Text-to-Speech voiceovers in 140+ languages, voice cloning with emotion control, and background music — the intelligent layer between script and production.',
    storyBrand: 'Your scripts deserve a voice that resonates. Mind makes every word count in every language.',
    jtbd: 'Enhance my scripts with the right voice, tone, and language for any audience.',
    videoPlaceholderTitle: 'Watch Genie Mind transform scripts with neural TTS and voice cloning',
    keyBenefits: [
      { icon: <Mic className="h-4 w-4" />, title: 'Neural TTS in 140+ Languages', detail: 'Azure Neural voices with native prosody and regional accent matching' },
      { icon: <Brain className="h-4 w-4" />, title: 'AI Script Editing', detail: 'Tone, style, and audience-aware AI suggestions to refine your content' },
      { icon: <Sparkles className="h-4 w-4" />, title: 'Voice Cloning + Emotion', detail: 'Clone any voice with emotion control and dialect-specific nuances' },
      { icon: <Globe className="h-4 w-4" />, title: 'Zone-Routed AI', detail: 'Claude for Western, Qwen for CJK, Gemini for India/SEA — always the optimal provider' },
    ],
    coreCapabilities: ['AI Script Editing', 'Text-to-Speech', 'Voice Cloning', 'AI Music Generation', 'Tone Adjustment', 'Language Translation', 'Content Enhancement', 'Smart Suggestions'],
    aiProviders: ['Azure Neural', 'ElevenLabs', 'DeepL', 'Claude', 'Alibaba Qwen3-TTS'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'English neural TTS with American accent precision' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'Compliant financial scripts in 25 EU languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: '7 Arabic dialects with Azure Neural viseme lip-sync' },
      { region: 'India', flag: '🇮🇳', useCase: '22-language TTS with Hindi, Tamil & Bengali accents' },
      { region: 'Africa', flag: '🌍', useCase: 'Swahili, Amharic, Yoruba TTS with local accents' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK voice cloning via Alibaba Qwen3-TTS with tonal fidelity' },
      { region: 'LATAM', flag: '🌎', useCase: 'Brazilian vs. European Portuguese nuances' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Creole & regional English voiceovers for tourism' },
    ],
    idealFor: ['Voiceover Artists', 'Podcasters', 'Global Brands', 'Localization Teams', 'E-Learning'],
    screenshots: ['TTS Studio', 'Voice Cloning', 'Script Editor'],
  },
  vibe: {
    pipelines: 74,
    positioning: 'Full audio and video production studio — record podcasts, produce 4K video with AI avatars, lip-sync dubbing, trim, stitch, and multi-track edit — all without a physical studio.',
    storyBrand: 'Hollywood quality, startup speed. Vibe turns your script into screen-ready content.',
    jtbd: 'Produce professional video and audio without a studio — in any language.',
    videoPlaceholderTitle: 'Explore Genie Vibe\'s full production studio with 4K AI video and avatar lip-sync',
    keyBenefits: [
      { icon: <Video className="h-4 w-4" />, title: '4K AI Video Production', detail: 'AI avatars, lip-sync, dubbing, and professional-grade video output' },
      { icon: <Mic className="h-4 w-4" />, title: 'Podcast & Audio Studio', detail: 'Record, trim, stitch, add TTS & background music — complete audio workflow' },
      { icon: <Layers className="h-4 w-4" />, title: 'Multi-Track Editing', detail: 'Professional timeline editor with audio/video layering and transitions' },
      { icon: <Sparkles className="h-4 w-4" />, title: 'Avatar + Lip-Sync', detail: 'Real-time voice-to-video with AI avatar lip synchronization in any language' },
    ],
    coreCapabilities: ['Podcast Recording', 'Video Recording', 'Trim & Crop', 'Stitch Clips', 'Add Audio/TTS', 'Background Music', 'STT Transcription', 'Multi-track Editing', 'Dubbing', 'Lip-sync', 'Avatar Video'],
    aiProviders: ['Google Veo 3', 'Alibaba Wan', 'JSON2Video', 'Azure Neural', 'Deepgram'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Compliant training videos with AI avatars' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'GDPR-compliant video production in 25 EU languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL video production with Arabic lip-sync dubbing' },
      { region: 'India', flag: '🇮🇳', useCase: 'Vernacular EdTech courses in 22 regional languages' },
      { region: 'Africa', flag: '🌍', useCase: 'Low-bandwidth optimized videos for mobile-first markets' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK-optimized e-commerce product demos' },
      { region: 'LATAM', flag: '🌎', useCase: 'Spanish & Portuguese video localization for 20+ markets' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Tourism & hospitality promotional video content' },
    ],
    idealFor: ['Video Producers', 'Podcasters', 'EdTech', 'E-Commerce', 'Corporate Training'],
    screenshots: ['Video Editor', 'Podcast Studio', 'Avatar Generator'],
  },
  deck: {
    pipelines: 34,
    positioning: 'Creates stunning AI-powered presentations with smart layouts, brand compliance, 3D visualizations, infographics, and multi-language export — from script to stage-ready slides.',
    storyBrand: 'Your ideas deserve stunning visuals. Deck transforms words into visual impact.',
    jtbd: 'Create presentations that persuade — beautifully designed, in any language.',
    videoPlaceholderTitle: 'See Genie Deck generate stunning AI presentations with 3D visuals and brand compliance',
    keyBenefits: [
      { icon: <Presentation className="h-4 w-4" />, title: 'AI Slide Generation', detail: 'Smart layouts that adapt to your content type — data, narrative, or pitch' },
      { icon: <BarChart3 className="h-4 w-4" />, title: '3D & Infographics', detail: 'Dynamic data visualizations, charts, diagrams, and 3D presentations' },
      { icon: <Shield className="h-4 w-4" />, title: 'Brand Compliance', detail: 'Automatically apply your brand colors, fonts, logos, and guidelines' },
      { icon: <Globe className="h-4 w-4" />, title: 'Multi-Language Export', detail: 'Culturally-adapted visual design for any language and region' },
    ],
    coreCapabilities: ['AI Slide Generation', 'Smart Visual Layouts', 'Brand Customization', 'Multi-language Export', 'Template Library', 'Infographics', 'Charts & Diagrams', '3D Presentations', 'Interactive Slides'],
    aiProviders: ['Meshy AI', 'ModelsLab', 'DALL-E', 'Claude', 'Gemini'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Investor pitch decks with data visualizations' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'EU regulatory presentations in 25 languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL Arabic presentations with Islamic design patterns' },
      { region: 'India', flag: '🇮🇳', useCase: 'Government & enterprise decks in Hindi, Tamil & more' },
      { region: 'Africa', flag: '🌍', useCase: 'NGO impact reports with regional infographics' },
      { region: 'APAC', flag: '🌏', useCase: 'Corporate presentations for CJK markets with localized charts' },
      { region: 'LATAM', flag: '🌎', useCase: 'Sales decks in Spanish & Portuguese for regional markets' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Investment & tourism presentations with local context' },
    ],
    idealFor: ['Sales Teams', 'Executives', 'Educators', 'Consultants', 'Startups'],
    screenshots: ['Slide Editor', 'Brand Settings', 'Template Gallery'],
  },
  arc: {
    pipelines: 14,
    positioning: 'Enterprise production management hub — project scheduling, Kanban workflows, multi-team collaboration, approval chains, and resource management for complex content operations.',
    storyBrand: 'From chaos to clarity. Arc gives your production the structure it deserves.',
    jtbd: 'Orchestrate teams and deadlines for complex productions without the chaos.',
    videoPlaceholderTitle: 'Discover how Genie Arc manages complex multi-team production workflows end-to-end',
    keyBenefits: [
      { icon: <Workflow className="h-4 w-4" />, title: 'Production Pipeline', detail: 'End-to-end tracking from script to final delivery with stage gates' },
      { icon: <BarChart3 className="h-4 w-4" />, title: 'Kanban & Scheduling', detail: 'Visual boards with drag-and-drop task management and deadline tracking' },
      { icon: <Shield className="h-4 w-4" />, title: 'Approval Workflows', detail: 'Multi-stakeholder review chains with automated notifications' },
      { icon: <Cpu className="h-4 w-4" />, title: 'Smart Task Assignment', detail: 'AI-powered task allocation based on project complexity and team capacity' },
    ],
    coreCapabilities: ['Project Scheduling', 'Kanban Boards', 'Team Collaboration', 'Production Pipeline', 'Resource Management', 'Task Assignment', 'Progress Tracking', 'Review Workflows', 'Approval Chains'],
    aiProviders: ['Supabase', 'Claude', 'GPT-4o'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Enterprise content ops with SSO/SAML integration' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'GDPR-aware production workflows with audit trails' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'Multi-stakeholder approval for government content' },
      { region: 'India', flag: '🇮🇳', useCase: 'Multi-language production tracking across 22 states' },
      { region: 'Africa', flag: '🌍', useCase: 'NGO & development project coordination workflows' },
      { region: 'APAC', flag: '🌏', useCase: 'Cross-border team coordination across timezones' },
      { region: 'LATAM', flag: '🌎', useCase: 'Agency production management for regional campaigns' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Multi-island content production coordination' },
    ],
    idealFor: ['Enterprise Teams', 'Agency Producers', 'Content Ops', 'Project Managers', 'Studios'],
    screenshots: ['Kanban Board', 'Pipeline View', 'Approvals'],
  },
  cast: {
    pipelines: 26,
    positioning: 'Global distribution and marketing engine — publish to YouTube, LinkedIn, TikTok, Instagram, X, and Blogs with 14-region localization, automated scheduling, and cross-platform analytics.',
    storyBrand: 'Create once, reach everywhere. Cast takes your content global without the grind.',
    jtbd: 'Publish everywhere — localized for every market — automatically.',
    videoPlaceholderTitle: 'Watch Genie Cast distribute content to 6+ platforms across 14 regions simultaneously',
    keyBenefits: [
      { icon: <Send className="h-4 w-4" />, title: 'One-Click Distribution', detail: 'Publish to YouTube, LinkedIn, TikTok, Instagram, X, and Blogs simultaneously' },
      { icon: <Globe className="h-4 w-4" />, title: '14-Region Localization', detail: 'Transcreated metadata, thumbnails, and captions for every target market' },
      { icon: <BarChart3 className="h-4 w-4" />, title: 'Cross-Platform Analytics', detail: 'Unified performance dashboard across all channels and regions' },
      { icon: <Rocket className="h-4 w-4" />, title: 'Timezone-Aware Scheduling', detail: 'Automated publishing optimized for peak engagement in each region' },
    ],
    coreCapabilities: ['Multi-platform Publishing', '14-Region Localization', 'Automated Scheduling', 'YouTube Distribution', 'LinkedIn Publishing', 'TikTok Optimization', 'Instagram Reels', 'X/Twitter Posts', 'Blog Integration', 'Analytics Dashboard'],
    aiProviders: ['JSON2Video', 'Azure Neural', 'DeepL', 'Claude'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Multi-platform social media campaigns at scale' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'EU-compliant distribution with GDPR metadata' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL social content with Arabic hashtags & SEO' },
      { region: 'India', flag: '🇮🇳', useCase: 'Vernacular distribution across 22 states & platforms' },
      { region: 'Africa', flag: '🌍', useCase: 'Mobile-first distribution optimized for low bandwidth' },
      { region: 'APAC', flag: '🌏', useCase: 'WeChat, LINE & regional platform integration' },
      { region: 'LATAM', flag: '🌎', useCase: 'Spanish & Portuguese campaigns across 20+ markets' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Tourism & hospitality cross-platform campaigns' },
    ],
    idealFor: ['Social Media Teams', 'Growth Marketers', 'Global Brands', 'Agencies', 'Publishers'],
    screenshots: ['Distribution Hub', 'Analytics', 'Scheduler'],
  },
  studio: {
    pipelines: 206,
    positioning: 'The master orchestrator that unifies all Genie products — Spark, Mind, Vibe, Deck, Arc, and Cast — into a single, seamless creative workflow. From idea to global distribution, every tool, every pipeline, one platform.',
    storyBrand: 'You shouldn\'t need 10 tools. Studio gives you one platform for everything.',
    jtbd: 'Orchestrate my entire content workflow — from ideation to global distribution — in one place.',
    videoPlaceholderTitle: 'See how Genie Studio orchestrates all 7 products and 206 pipelines into one unified workflow',
    keyBenefits: [
      { icon: <Layers className="h-4 w-4" />, title: 'All Products, One Platform', detail: 'Spark + Mind + Vibe + Deck + Arc + Cast — unified under a single orchestrator' },
      { icon: <Workflow className="h-4 w-4" />, title: 'Cross-Product Workflows', detail: 'Seamlessly chain pipelines across products — script → voice → video → slides → publish' },
      { icon: <Globe className="h-4 w-4" />, title: '206 Pipelines, 140+ Languages', detail: 'Access every pipeline across all products with 5-zone AI routing for optimal performance' },
      { icon: <Cpu className="h-4 w-4" />, title: 'A2A Agent Coordination', detail: 'AI agents from each product collaborate intelligently to deliver end-to-end results' },
    ],
    coreCapabilities: ['Master Orchestration', 'Cross-Product Workflows', 'Unified Asset Library', 'Project Organization', '206 Pipeline Access', 'A2A Agent Coordination', '5-Zone Regional Routing', 'Enterprise Integration', 'Team Collaboration', 'Analytics Dashboard'],
    aiProviders: ['Claude', 'GPT-4o', 'Gemini', 'Qwen', 'Azure Neural', 'ElevenLabs', 'Google Veo 3', 'Alibaba', 'Meshy AI', 'DeepL', 'Deepgram'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Enterprise content operations at scale with SSO/SAML' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'GDPR-compliant end-to-end production in 25 EU languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'Full RTL production pipeline across 7 Arabic dialects' },
      { region: 'India', flag: '🇮🇳', useCase: 'Vernacular content factory for 22 regional languages' },
      { region: 'Africa', flag: '🌍', useCase: 'Mobile-first content production optimized for low bandwidth' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK-optimized production with Alibaba & Qwen routing' },
      { region: 'LATAM', flag: '🌎', useCase: 'Spanish & Portuguese end-to-end content operations' },
      { region: 'Caribbean', flag: '🏝️', useCase: 'Tourism & hospitality full-stack content platform' },
    ],
    idealFor: ['Enterprise Teams', 'Content Studios', 'Global Brands', 'Media Companies', 'Agencies'],
    screenshots: ['Orchestrator Dashboard', 'Pipeline Builder', 'Analytics'],
  },
};

interface ProductDetailShowcaseProps {
  activeProduct: string;
  onProductChange: (id: string) => void;
}

export const ProductDetailShowcase: React.FC<ProductDetailShowcaseProps> = ({
  activeProduct,
  onProductChange,
}) => {
  const genieProductKey = activeProduct === 'ask' ? null : activeProduct as GenieProduct;
  const productData = genieProductKey ? GENIE_PRODUCTS[genieProductKey] : null;
  const extendedData = PRODUCT_EXTENDED[activeProduct];
  const logo = PRODUCT_LOGOS[activeProduct];

  return (
    <div>
      {/* ─── Product Selector Tabs ─── */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRODUCT_TAB_ORDER.map((tab) => {
          const isActive = activeProduct === tab.key;
          const productInfo = tab.key !== 'ask' ? GENIE_PRODUCTS[tab.key as GenieProduct] : null;
          const combinedLogo = productInfo ? productInfo.logos.combined : PRODUCT_LOGOS.ask;
          const tagline = productInfo ? productInfo.tagline : ASK_GENIE.tagline;
          return (
            <button
              key={tab.key}
              onClick={() => onProductChange(tab.key)}
              className={`
                flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50'
                }
              `}
              title={tagline}
            >
              <img 
                src={combinedLogo} 
                alt={tab.label} 
                className="h-6 w-auto object-contain flex-shrink-0" 
              />
              <span>{tab.label}</span>
              {isActive && PRODUCT_EXTENDED[tab.key] && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary-foreground/20 text-primary-foreground border-0">
                  {PRODUCT_EXTENDED[tab.key]?.pipelines ?? '—'}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Product Detail Content ─── */}
      {activeProduct === 'ask' || !productData || !extendedData ? (
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-[1px] rounded-2xl">
            <div className="bg-card rounded-2xl p-8 text-center">
              <img src={PRODUCT_LOGOS.ask} alt="Ask Genie" className="w-24 h-24 object-contain mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground">{ASK_GENIE.name}</h3>
              <p className="text-primary font-medium text-lg mb-2">"{ASK_GENIE.tagline}"</p>
              <p className="text-muted-foreground max-w-xl mx-auto">{ASK_GENIE.description}</p>
              <Badge variant="outline" className="mt-4 border-amber-500 text-amber-600">
                Available in every Genie product
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`bg-gradient-to-r ${productData.color} p-[1px] rounded-2xl shadow-xl`}>
                <div className="bg-card rounded-2xl overflow-hidden">

                  {/* ─── SECTION 1: Video Player + Product Identity ─── */}
                  <div className="grid md:grid-cols-[1fr,1fr] gap-0">
                    <ProductVideoPlayer 
                      productName={productData.name}
                      color={productData.color}
                      videoTitle={extendedData.videoPlaceholderTitle}
                      screenshots={extendedData.screenshots}
                    />
                    <div className={`bg-gradient-to-br ${productData.color} p-6 md:p-8 flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={logo} 
                            alt={productData.name} 
                            className="w-14 h-14 object-contain rounded-xl bg-background/80 p-1.5 shadow-md flex-shrink-0" 
                          />
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white">{productData.name}</h3>
                            <p className="text-white/80 font-medium text-sm">"{productData.tagline}"</p>
                          </div>
                        </div>
                        <p className="text-white/75 text-sm leading-relaxed mb-4">
                          {extendedData.positioning}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Ideal for</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {extendedData.idealFor.map(persona => (
                            <Badge key={persona} className="bg-white/15 text-white border-white/20 text-[11px]">
                              {persona}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── SECTION 2: Messaging — StoryBrand + JTBD ─── */}
                  <div className="px-6 md:px-8 py-4 bg-muted/30 border-b border-border/50">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">The Story</span>
                          <p className="text-sm text-foreground font-medium italic mt-0.5">
                            "{extendedData.storyBrand}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your Goal</span>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {extendedData.jtbd}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── SECTION 3: Key Features & Benefits ─── */}
                  <div className="px-6 md:px-8 py-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary" />
                      What {productData.name} Does For You
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {extendedData.keyBenefits.map((benefit, i) => (
                        <div 
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/60 transition-all"
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${productData.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                            {benefit.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm">{benefit.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{benefit.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── SECTION 4: Core Capabilities + AI Providers + Pipeline Categories ─── */}
                  <div className="px-6 md:px-8 py-5 bg-muted/20 border-t border-border/40">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                          <Layers className="h-4 w-4 text-primary" />
                          Core Capabilities
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {extendedData.coreCapabilities.map(cap => (
                            <span 
                              key={cap}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-background border border-border/60 text-foreground"
                            >
                              <Check className="h-3 w-3 text-green-500" />
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                          <Cpu className="h-4 w-4 text-primary" />
                          Powered By
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {extendedData.aiProviders.map(provider => (
                            <Badge key={provider} variant="outline" className="text-xs font-medium">
                              <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                              {provider}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/30">
                      <h4 className="font-semibold text-foreground mb-2.5 flex items-center gap-2 text-sm">
                        <Workflow className="h-4 w-4 text-primary" />
                        Pipeline Categories
                        <Badge variant="secondary" className="text-[10px] ml-1">
                          {extendedData.pipelines} total
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {productData.pipelineCategories.map(cat => (
                          <span 
                            key={cat}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r ${productData.color} bg-opacity-10 text-foreground border border-border/40`}
                          >
                            {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ─── SECTION 5: Regional ─── */}
                  <div className="px-6 md:px-8 py-5 border-t border-border/40 overflow-hidden">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      How {productData.name} Works Across Regions
                      <Badge variant="outline" className="text-[10px] ml-1 border-primary/30 text-primary">
                        Transcreation — Not Translation
                      </Badge>
                    </h4>
                    <RegionalMarquee regions={extendedData.regionalHighlights} productId={productData.id} />
                  </div>

                  {/* ─── SECTION 6: CTA Bar ─── */}
                  <div className="px-6 md:px-8 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">{extendedData.pipelines} pipelines</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{extendedData.coreCapabilities.length} capabilities</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{extendedData.aiProviders.length} AI providers</span>
                      <span className="hidden sm:inline">•</span>
                      <span>140+ languages</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to="/explore">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          Try {productData.name}
                        </Button>
                      </Link>
                      <Link to="/products" className="text-primary hover:text-primary/80 transition font-medium text-xs flex items-center gap-1">
                        All products <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ─── Regional Marquee Sub-Component ───
interface RegionalMarqueeProps {
  regions: { region: string; flag: string; useCase: string }[];
  productId: string;
}

const RegionalMarquee: React.FC<RegionalMarqueeProps> = ({ regions, productId }) => {
  const navigate = useNavigate();
  // Duplicate for seamless loop
  const duplicated = [...regions, ...regions];

  const handleRegionClick = (regionName: string) => {
    const slug = REGION_SLUG_MAP[regionName];
    if (slug) {
      // Navigate to regional landing with product context so the page can auto-focus the right video
      navigate(`/genie-landing/${slug}?product=${productId}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
        whileHover={{ animationPlayState: 'paused' }}
        style={{ willChange: 'transform' }}
      >
        {duplicated.map((ctx, i) => (
          <div
            key={`${ctx.region}-${i}`}
            onClick={() => handleRegionClick(ctx.region)}
            className="min-w-[200px] max-w-[220px] flex-shrink-0 p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer"
            title={`Explore ${ctx.region} regional demo →`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{ctx.flag}</span>
                <span className="font-semibold text-foreground text-xs">{ctx.region}</span>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
              {ctx.useCase}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Video Player Sub-Component ───
interface ProductVideoPlayerProps {
  productName: string;
  color: string;
  videoTitle: string;
  screenshots: string[];
}

const ProductVideoPlayer: React.FC<ProductVideoPlayerProps> = ({
  productName,
  color,
  videoTitle,
  screenshots,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative aspect-video md:aspect-auto bg-gradient-to-br from-muted/80 to-muted/40 flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-8">
        {/* Play button */}
        <motion.div 
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-5 shadow-xl`}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Play className="h-7 w-7 md:h-8 md:w-8 text-white ml-1" fill="white" />
        </motion.div>
        
        {/* Video title */}
        <p className="text-sm md:text-base font-medium text-foreground max-w-xs mx-auto leading-snug mb-4">
          {videoTitle}
        </p>

        {/* Screenshot previews */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {screenshots.map((name, i) => (
            <div 
              key={name}
              className="flex items-center gap-1 px-2 py-1 bg-background/70 rounded text-[10px] text-muted-foreground border border-border/40"
            >
              <ImageIcon className="h-3 w-3" />
              {name}
            </div>
          ))}
        </div>

        {/* Coming soon label */}
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-background/60">
          <MonitorPlay className="h-3 w-3 mr-1" />
          Product Demo Video — Coming Soon
        </Badge>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
};

export default ProductDetailShowcase;
