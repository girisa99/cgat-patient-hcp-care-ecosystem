/**
 * PRODUCT DETAIL SHOWCASE
 * 
 * Shows full capabilities, features, pipelines, benefits, and regional context
 * for each selected Genie product. Uses data from genie-products.ts constants.
 * 
 * Integrates messaging framework: StoryBrand (narrative), JTBD (outcomes), AIDA (structure)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Globe, Zap, Layers, Sparkles, ArrowRight, 
  Play, Languages, Mic, Video, Brain, FileText, 
  BarChart3, Users, Shield, Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { GENIE_PRODUCTS, ASK_GENIE, type GenieProduct } from '@/constants/genie-products';

// Product logos from landing page
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

// Extended product data with messaging framework, benefits, and regional context
const PRODUCT_EXTENDED: Record<string, {
  pipelines: number;
  benefits: string[];
  regionalContext: { region: string; useCase: string }[];
  jtbd: string; // Jobs-to-be-done outcome
  storyBrand: string; // Customer transformation narrative
  aiProviders: string[];
}> = {
  spark: {
    pipelines: 28,
    benefits: [
      'Turn any document, URL, or media into a production-ready script in under 2 minutes',
      'Auto-detect content structure and generate scene breakdowns',
      'Multi-format input: PDF, PPTX, MP4, MP3, Images, URLs',
      'AI-powered image generation when no visuals exist',
    ],
    regionalContext: [
      { region: '🇺🇸 NAM', useCase: 'Research papers → training scripts' },
      { region: '🇦🇪 MENA', useCase: 'Arabic PDFs → RTL video scripts' },
      { region: '🇮🇳 India', useCase: 'Hindi documents → 22-language scripts' },
      { region: '🌏 APAC', useCase: 'CJK presentations → localized scripts' },
    ],
    jtbd: 'When I have raw content, help me turn it into a structured, production-ready script — fast.',
    storyBrand: 'You have brilliant ideas trapped in documents. Spark sets them free.',
    aiProviders: ['Claude', 'GPT-4o', 'Gemini', 'Qwen'],
  },
  mind: {
    pipelines: 30,
    benefits: [
      'AI script editing with tone, style, and audience-aware suggestions',
      'Azure Neural TTS in 140+ languages with native prosody',
      'Voice cloning with emotion control and regional dialect matching',
      'Zone-routed transcreation — Claude for Western, Qwen for CJK, Gemini for India/SEA',
    ],
    regionalContext: [
      { region: '🇪🇺 Europe', useCase: 'MiFID II compliant financial scripts in 25 EU languages' },
      { region: '🇦🇪 MENA', useCase: '7 Arabic dialects with Sharia-compliant terminology' },
      { region: '🌍 Africa', useCase: 'Swahili, Amharic, Yoruba TTS with local accents' },
      { region: '🌎 LATAM', useCase: 'Brazilian Portuguese vs. European Portuguese nuances' },
    ],
    jtbd: 'When I need polished, culturally-aware content, enhance my scripts with the right voice and language.',
    storyBrand: 'Your scripts deserve a voice that resonates. Mind makes every word count in every language.',
    aiProviders: ['Azure Neural', 'ElevenLabs', 'DeepL', 'Claude', 'Alibaba CosyVoice'],
  },
  vibe: {
    pipelines: 74,
    benefits: [
      '4K video production with AI avatars, lip-sync, and dubbing',
      'Record podcasts, trim, stitch, add TTS & background music',
      'Multi-track editing with professional-grade output',
      'Real-time voice-to-video with avatar lip synchronization',
    ],
    regionalContext: [
      { region: '🇺🇸 NAM', useCase: 'HIPAA-compliant training videos with avatars' },
      { region: '🇮🇳 India', useCase: 'Vernacular EdTech courses in 22 languages' },
      { region: '🇦🇪 MENA', useCase: 'RTL video production with Arabic lip-sync' },
      { region: '🌏 APAC', useCase: 'CJK-optimized e-commerce product demos' },
    ],
    jtbd: 'When I need professional video or audio, produce it without a studio — in any language.',
    storyBrand: 'Hollywood quality, startup speed. Vibe turns your script into screen-ready content.',
    aiProviders: ['Google Veo 3', 'Alibaba Wan', 'JSON2Video', 'Azure Neural', 'Deepgram'],
  },
  deck: {
    pipelines: 34,
    benefits: [
      'AI-generated presentations with smart layouts and brand compliance',
      '3D visualizations, infographics, and interactive slides',
      'Multi-language export with culturally-adapted visual design',
      'Template library with industry-specific and region-aware designs',
    ],
    regionalContext: [
      { region: '🇺🇸 NAM', useCase: 'Investor pitch decks with data visualizations' },
      { region: '🇪🇺 Europe', useCase: 'EU regulatory presentations in 25 languages' },
      { region: '🇦🇪 MENA', useCase: 'RTL Arabic presentations with Islamic design' },
      { region: '🌍 Africa', useCase: 'NGO impact reports with regional infographics' },
    ],
    jtbd: 'When I need impactful visuals, create presentations that persuade — in any language.',
    storyBrand: 'Your ideas deserve stunning visuals. Deck transforms words into visual impact.',
    aiProviders: ['Meshy AI', 'ModelsLab', 'DALL-E', 'Claude', 'Gemini'],
  },
  arc: {
    pipelines: 14,
    benefits: [
      'Enterprise production hub with Kanban, scheduling, and resource management',
      'Multi-team collaboration with approval chains and review workflows',
      'Production pipeline tracking from script to final delivery',
      'Automated task assignment based on project complexity and deadlines',
    ],
    regionalContext: [
      { region: '🇺🇸 NAM', useCase: 'Enterprise content ops with SSO/SAML' },
      { region: '🇪🇺 Europe', useCase: 'GDPR-aware production workflows' },
      { region: '🇦🇪 MENA', useCase: 'Multi-stakeholder approval for government content' },
      { region: '🌏 APAC', useCase: 'Cross-border team coordination across timezones' },
    ],
    jtbd: 'When I manage complex productions, orchestrate teams and deadlines without chaos.',
    storyBrand: 'From chaos to clarity. Arc gives your production the structure it deserves.',
    aiProviders: ['Supabase', 'Claude', 'GPT-4o'],
  },
  cast: {
    pipelines: 26,
    benefits: [
      'One-click distribution to YouTube, LinkedIn, TikTok, Instagram, X, and Blogs',
      '14-region localization with transcreated metadata and thumbnails',
      'Automated scheduling with timezone-aware publishing',
      'Analytics dashboard with cross-platform performance insights',
    ],
    regionalContext: [
      { region: '🇺🇸 NAM', useCase: 'Multi-platform social media campaigns' },
      { region: '🇮🇳 India', useCase: 'Vernacular content distribution across 22 states' },
      { region: '🇦🇪 MENA', useCase: 'RTL social content with Arabic hashtags & SEO' },
      { region: '🌎 LATAM', useCase: 'Spanish & Portuguese campaigns across 20+ markets' },
    ],
    jtbd: 'When I need global reach, publish everywhere — localized for every market — automatically.',
    storyBrand: 'Create once, reach everywhere. Cast takes your content global without the grind.',
    aiProviders: ['JSON2Video', 'Azure Neural', 'DeepL', 'Claude'],
  },
};

interface ProductDetailShowcaseProps {
  activeProduct: string;
  onProductChange: (id: string) => void;
}

// Tab type for detail section
type DetailTab = 'overview' | 'features' | 'regional';

export const ProductDetailShowcase: React.FC<ProductDetailShowcaseProps> = ({
  activeProduct,
  onProductChange,
}) => {
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  
  // Map product id to GenieProduct key
  const genieProductKey = activeProduct === 'ask' ? null : activeProduct as GenieProduct;
  const productData = genieProductKey ? GENIE_PRODUCTS[genieProductKey] : null;
  const extendedData = PRODUCT_EXTENDED[activeProduct];
  const logo = PRODUCT_LOGOS[activeProduct];

  // For Ask Genie, show a simplified view
  if (!productData || !extendedData) {
    return (
      <div className="mt-8 max-w-4xl mx-auto">
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

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & Benefits', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'features', label: `Features & ${extendedData.pipelines} Pipelines`, icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'regional', label: 'Regional How It Works', icon: <Globe className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      <div className={`bg-gradient-to-r ${productData.color} p-[1px] rounded-2xl`}>
        <div className="bg-card rounded-2xl overflow-hidden">
          {/* Product header */}
          <div className="p-6 pb-4 flex items-center gap-6 border-b border-border/50">
            <img src={logo} alt={productData.name} className="w-20 h-20 object-contain" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-bold text-foreground">{productData.name}</h3>
                <Badge variant="secondary" className="font-semibold">
                  {extendedData.pipelines} Pipelines
                </Badge>
              </div>
              <p className={`bg-gradient-to-r ${productData.color} bg-clip-text text-transparent font-medium text-lg`}>
                "{productData.tagline}"
              </p>
              {/* JTBD statement */}
              <p className="text-sm text-muted-foreground mt-1 italic">
                {extendedData.jtbd}
              </p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-border/50 px-6 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                  detailTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {detailTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Benefits (AIDA — Interest/Desire) */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Why {productData.name}
                      </h4>
                      {/* StoryBrand narrative */}
                      <p className="text-muted-foreground text-sm mb-4 bg-muted/40 rounded-lg p-3 border-l-2 border-primary">
                        {extendedData.storyBrand}
                      </p>
                      <div className="space-y-3">
                        {extendedData.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: AI Providers + Pipeline categories */}
                    <div className="space-y-5">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Powered By
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {extendedData.aiProviders.map(provider => (
                            <Badge key={provider} variant="outline" className="text-xs">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              {provider}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Workflow className="h-4 w-4 text-primary" />
                          Pipeline Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {productData.pipelineCategories.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs capitalize">
                              {cat.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Cross-Functional Capabilities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {productData.capabilities.map(cap => (
                            <Badge key={cap} variant="outline" className="text-xs capitalize border-primary/30 text-primary">
                              {cap.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {detailTab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productData.features.map((feature, i) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${productData.color} flex items-center justify-center flex-shrink-0`}>
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground font-semibold">{extendedData.pipelines} pre-built pipelines</span> across{' '}
                      <span className="text-foreground font-semibold">{productData.pipelineCategories.length} categories</span> —{' '}
                      all powered by <span className="text-primary font-semibold">15 AI providers</span> with{' '}
                      <span className="text-primary font-semibold">zone-based routing</span> for optimal results.
                    </p>
                  </div>
                </motion.div>
              )}

              {detailTab === 'regional' && (
                <motion.div
                  key="regional"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    {extendedData.regionalContext.map((ctx, i) => (
                      <div
                        key={ctx.region}
                        className="p-4 bg-muted/40 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{ctx.region.split(' ')[0]}</span>
                          <span className="font-semibold text-foreground text-sm">{ctx.region.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{ctx.useCase}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" />
                      Transcreation, Not Translation
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {productData.name} adapts content culturally for each region — adjusting idioms, compliance terms, 
                      and visual design. Zone-routed through the optimal AI provider for each language and dialect.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Play className="h-4 w-4 mr-2" />
                  Try {productData.name}
                </Button>
              </Link>
              <Link to="/products" className="text-primary hover:text-primary/80 transition font-medium text-sm flex items-center gap-1">
                Explore all products <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailShowcase;