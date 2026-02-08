/**
 * PRODUCT DETAIL SHOWCASE
 * 
 * Well-organized single-view product card that communicates:
 * 1. What the product IS (positioning + tagline)
 * 2. How it HELPS you (StoryBrand narrative + JTBD outcome)
 * 3. Key CAPABILITIES & FEATURES (visual grid)
 * 4. AI Providers powering it
 * 5. Regional context (transcreation use-cases)
 * 
 * Uses messaging framework: StoryBrand (narrative), JTBD (outcomes), AIDA (structure)
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Globe, Zap, Sparkles, ArrowRight, 
  Play, Languages, Brain, Target, Rocket,
  BarChart3, Shield, Workflow, ChevronRight,
  Cpu, Mic, Video, FileText, Presentation,
  Send, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { GENIE_PRODUCTS, ASK_GENIE, type GenieProduct } from '@/constants/genie-products';

// Product logos
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';
import genieArcLogo from '@/assets/logos/products/genie-arc.png';
import genieCastLogo from '@/assets/logos/products/genie-cast.png';
import askGenieLogo from '@/assets/logos/products/ask-genie.png';

const PRODUCT_LOGOS: Record<string, string> = {
  spark: genieSparkLogo,
  mind: genieMindLogo,
  vibe: genieVibeLogo,
  deck: genieDeckLogo,
  arc: genieArcLogo,
  cast: genieCastLogo,
  ask: askGenieLogo,
};

// Product-specific icons for hero visual
const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  spark: <FileText className="h-5 w-5" />,
  mind: <Brain className="h-5 w-5" />,
  vibe: <Video className="h-5 w-5" />,
  deck: <Presentation className="h-5 w-5" />,
  arc: <Workflow className="h-5 w-5" />,
  cast: <Send className="h-5 w-5" />,
};

// Extended product data: messaging + benefits + capabilities + regional
const PRODUCT_EXTENDED: Record<string, {
  pipelines: number;
  positioning: string; // Clear "what it does" statement
  storyBrand: string; // Transformation narrative
  jtbd: string; // Jobs-to-be-done outcome
  keyBenefits: { icon: React.ReactNode; title: string; detail: string }[];
  coreCapabilities: string[];
  aiProviders: string[];
  regionalHighlights: { region: string; flag: string; useCase: string }[];
  idealFor: string[];
}> = {
  spark: {
    pipelines: 28,
    positioning: 'Transforms any raw content — documents, presentations, audio, video, URLs, or images — into structured, production-ready scripts using AI.',
    storyBrand: 'You have brilliant ideas trapped in documents. Spark sets them free.',
    jtbd: 'Help me turn raw content into a structured, production-ready script — fast.',
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
      { region: 'MENA', flag: '🇦🇪', useCase: 'Arabic PDFs → RTL-aware video scripts' },
      { region: 'India', flag: '🇮🇳', useCase: 'Hindi documents → 22-language scripts' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK presentations → localized content' },
    ],
    idealFor: ['Content Creators', 'L&D Teams', 'Marketing', 'Educators', 'Research Teams'],
  },
  mind: {
    pipelines: 30,
    positioning: 'Enhances scripts with AI editing, Text-to-Speech voiceovers in 140+ languages, voice cloning with emotion control, and background music — the intelligent layer between script and production.',
    storyBrand: 'Your scripts deserve a voice that resonates. Mind makes every word count in every language.',
    jtbd: 'Enhance my scripts with the right voice, tone, and language for any audience.',
    keyBenefits: [
      { icon: <Mic className="h-4 w-4" />, title: 'Neural TTS in 140+ Languages', detail: 'Azure Neural voices with native prosody and regional accent matching' },
      { icon: <Brain className="h-4 w-4" />, title: 'AI Script Editing', detail: 'Tone, style, and audience-aware AI suggestions to refine your content' },
      { icon: <Sparkles className="h-4 w-4" />, title: 'Voice Cloning + Emotion', detail: 'Clone any voice with emotion control and dialect-specific nuances' },
      { icon: <Globe className="h-4 w-4" />, title: 'Zone-Routed AI', detail: 'Claude for Western, Qwen for CJK, Gemini for India/SEA — always the optimal provider' },
    ],
    coreCapabilities: ['AI Script Editing', 'Text-to-Speech', 'Voice Cloning', 'AI Music Generation', 'Tone Adjustment', 'Language Translation', 'Content Enhancement', 'Smart Suggestions'],
    aiProviders: ['Azure Neural', 'ElevenLabs', 'DeepL', 'Claude', 'Alibaba CosyVoice'],
    regionalHighlights: [
      { region: 'Europe', flag: '🇪🇺', useCase: 'Compliant financial scripts in 25 EU languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: '7 Arabic dialects with region-appropriate terminology' },
      { region: 'Africa', flag: '🌍', useCase: 'Swahili, Amharic, Yoruba TTS with local accents' },
      { region: 'LATAM', flag: '🌎', useCase: 'Brazilian vs. European Portuguese nuances' },
    ],
    idealFor: ['Voiceover Artists', 'Podcasters', 'Global Brands', 'Localization Teams', 'E-Learning'],
  },
  vibe: {
    pipelines: 74,
    positioning: 'Full audio and video production studio — record podcasts, produce 4K video with AI avatars, lip-sync dubbing, trim, stitch, and multi-track edit — all without a physical studio.',
    storyBrand: 'Hollywood quality, startup speed. Vibe turns your script into screen-ready content.',
    jtbd: 'Produce professional video and audio without a studio — in any language.',
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
      { region: 'India', flag: '🇮🇳', useCase: 'Vernacular EdTech courses in 22 languages' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL video production with Arabic lip-sync' },
      { region: 'APAC', flag: '🌏', useCase: 'CJK-optimized e-commerce product demos' },
    ],
    idealFor: ['Video Producers', 'Podcasters', 'EdTech', 'E-Commerce', 'Corporate Training'],
  },
  deck: {
    pipelines: 34,
    positioning: 'Creates stunning AI-powered presentations with smart layouts, brand compliance, 3D visualizations, infographics, and multi-language export — from script to stage-ready slides.',
    storyBrand: 'Your ideas deserve stunning visuals. Deck transforms words into visual impact.',
    jtbd: 'Create presentations that persuade — beautifully designed, in any language.',
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
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL Arabic presentations with Islamic design' },
      { region: 'Africa', flag: '🌍', useCase: 'NGO impact reports with regional infographics' },
    ],
    idealFor: ['Sales Teams', 'Executives', 'Educators', 'Consultants', 'Startups'],
  },
  arc: {
    pipelines: 14,
    positioning: 'Enterprise production management hub — project scheduling, Kanban workflows, multi-team collaboration, approval chains, and resource management for complex content operations.',
    storyBrand: 'From chaos to clarity. Arc gives your production the structure it deserves.',
    jtbd: 'Orchestrate teams and deadlines for complex productions without the chaos.',
    keyBenefits: [
      { icon: <Workflow className="h-4 w-4" />, title: 'Production Pipeline', detail: 'End-to-end tracking from script to final delivery with stage gates' },
      { icon: <BarChart3 className="h-4 w-4" />, title: 'Kanban & Scheduling', detail: 'Visual boards with drag-and-drop task management and deadline tracking' },
      { icon: <Shield className="h-4 w-4" />, title: 'Approval Workflows', detail: 'Multi-stakeholder review chains with automated notifications' },
      { icon: <Cpu className="h-4 w-4" />, title: 'Smart Task Assignment', detail: 'AI-powered task allocation based on project complexity and team capacity' },
    ],
    coreCapabilities: ['Project Scheduling', 'Kanban Boards', 'Team Collaboration', 'Production Pipeline', 'Resource Management', 'Task Assignment', 'Progress Tracking', 'Review Workflows', 'Approval Chains'],
    aiProviders: ['Supabase', 'Claude', 'GPT-4o'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Enterprise content ops with SSO/SAML' },
      { region: 'Europe', flag: '🇪🇺', useCase: 'GDPR-aware production workflows' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'Multi-stakeholder approval for government content' },
      { region: 'APAC', flag: '🌏', useCase: 'Cross-border team coordination across timezones' },
    ],
    idealFor: ['Enterprise Teams', 'Agency Producers', 'Content Ops', 'Project Managers', 'Studios'],
  },
  cast: {
    pipelines: 26,
    positioning: 'Global distribution and marketing engine — publish to YouTube, LinkedIn, TikTok, Instagram, X, and Blogs with 14-region localization, automated scheduling, and cross-platform analytics.',
    storyBrand: 'Create once, reach everywhere. Cast takes your content global without the grind.',
    jtbd: 'Publish everywhere — localized for every market — automatically.',
    keyBenefits: [
      { icon: <Send className="h-4 w-4" />, title: 'One-Click Distribution', detail: 'Publish to YouTube, LinkedIn, TikTok, Instagram, X, and Blogs simultaneously' },
      { icon: <Globe className="h-4 w-4" />, title: '14-Region Localization', detail: 'Transcreated metadata, thumbnails, and captions for every target market' },
      { icon: <BarChart3 className="h-4 w-4" />, title: 'Cross-Platform Analytics', detail: 'Unified performance dashboard across all channels and regions' },
      { icon: <Rocket className="h-4 w-4" />, title: 'Timezone-Aware Scheduling', detail: 'Automated publishing optimized for peak engagement in each region' },
    ],
    coreCapabilities: ['Multi-platform Publishing', '14-Region Localization', 'Automated Scheduling', 'YouTube Distribution', 'LinkedIn Publishing', 'TikTok Optimization', 'Instagram Reels', 'X/Twitter Posts', 'Blog Integration', 'Analytics Dashboard'],
    aiProviders: ['JSON2Video', 'Azure Neural', 'DeepL', 'Claude'],
    regionalHighlights: [
      { region: 'NAM', flag: '🇺🇸', useCase: 'Multi-platform social media campaigns' },
      { region: 'India', flag: '🇮🇳', useCase: 'Vernacular distribution across 22 states' },
      { region: 'MENA', flag: '🇦🇪', useCase: 'RTL social content with Arabic hashtags & SEO' },
      { region: 'LATAM', flag: '🌎', useCase: 'Spanish & Portuguese campaigns across 20+ markets' },
    ],
    idealFor: ['Social Media Teams', 'Growth Marketers', 'Global Brands', 'Agencies', 'Publishers'],
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

  // Ask Genie — simplified view
  if (!productData || !extendedData) {
    return (
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
    );
  }

  return (
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

              {/* ─── SECTION 1: Product Identity + Positioning ─── */}
              <div className={`bg-gradient-to-r ${productData.color} bg-opacity-5 p-6 md:p-8`}>
                <div className="flex items-start gap-5">
                  <img 
                    src={logo} 
                    alt={productData.name} 
                    className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl bg-background/80 p-2 shadow-md flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white">{productData.name}</h3>
                      <Badge className="bg-white/20 text-white border-white/30 font-semibold">
                        {extendedData.pipelines} Pipelines
                      </Badge>
                    </div>
                    <p className="text-white/90 font-medium text-lg mb-2">
                      "{productData.tagline}"
                    </p>
                    <p className="text-white/75 text-sm md:text-base leading-relaxed">
                      {extendedData.positioning}
                    </p>
                  </div>
                </div>

                {/* Ideal For tags */}
                <div className="flex flex-wrap gap-2 mt-4 ml-0 md:ml-[6.5rem]">
                  <span className="text-xs text-white/60 font-medium uppercase tracking-wide mr-1 self-center">Ideal for:</span>
                  {extendedData.idealFor.map(persona => (
                    <Badge key={persona} className="bg-white/15 text-white border-white/20 text-xs">
                      {persona}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* ─── SECTION 2: StoryBrand Narrative + JTBD ─── */}
              <div className="px-6 md:px-8 py-4 bg-muted/30 border-b border-border/50">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                  <div className="flex items-start gap-2 flex-1">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground font-medium italic">
                      "{extendedData.storyBrand}"
                    </p>
                  </div>
                  <div className="flex items-start gap-2 flex-1">
                    <Target className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Your goal:</span> {extendedData.jtbd}
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── SECTION 3: Key Benefits (How It Helps) ─── */}
              <div className="px-6 md:px-8 py-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-primary" />
                  How {productData.name} Helps You
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {extendedData.keyBenefits.map((benefit, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/60 transition-all"
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

              {/* ─── SECTION 4: Capabilities & AI Providers ─── */}
              <div className="px-6 md:px-8 py-5 bg-muted/20 border-t border-border/40">
                <div className="grid md:grid-cols-[1fr,auto] gap-6">
                  {/* Capabilities */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-primary" />
                      Core Capabilities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extendedData.coreCapabilities.map(cap => (
                        <span 
                          key={cap}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-background border border-border/60 text-foreground"
                        >
                          <Check className="h-3 w-3 text-green-500" />
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* AI Providers */}
                  <div className="md:min-w-[200px]">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                      <Cpu className="h-4 w-4 text-primary" />
                      Powered By
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extendedData.aiProviders.map(provider => (
                        <Badge key={provider} variant="outline" className="text-xs font-medium">
                          <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pipeline categories */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Categories:</span>
                    {productData.pipelineCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-[11px] capitalize">
                        {cat.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── SECTION 5: Regional How It Works ─── */}
              <div className="px-6 md:px-8 py-5 border-t border-border/40">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  How It Works Across Regions
                  <Badge variant="outline" className="text-[10px] ml-1 border-primary/30 text-primary">
                    Transcreation — Not Translation
                  </Badge>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {extendedData.regionalHighlights.map((ctx) => (
                    <div
                      key={ctx.region}
                      className="p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-base">{ctx.flag}</span>
                        <span className="font-semibold text-foreground text-xs">{ctx.region}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{ctx.useCase}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── SECTION 6: CTA ─── */}
              <div className="px-6 md:px-8 py-5 bg-muted/20 border-t border-border/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{extendedData.pipelines} pipelines</span>
                  <span>•</span>
                  <span>{extendedData.coreCapabilities.length} capabilities</span>
                  <span>•</span>
                  <span>{extendedData.aiProviders.length} AI providers</span>
                  <span>•</span>
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
  );
};

export default ProductDetailShowcase;
