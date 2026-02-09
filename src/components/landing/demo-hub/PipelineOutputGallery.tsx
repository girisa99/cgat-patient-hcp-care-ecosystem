/**
 * PipelineOutputGallery — Industry-aware case study cards
 * 
 * Shows Input → Pipeline → Output cards filtered by selected industry.
 * Features:
 * - Blog-style expanded detail view with Back button
 * - "Convert to Multi-Language" CTA on every output
 * - Filterable by pipeline type
 * - Industry-contextualized examples
 */

import React, { useState } from 'react';
import {
  Presentation, Video, FileText, Volume2, Mic, Languages, Sparkles,
  ArrowRight, ArrowLeft, Eye, ChevronDown, ChevronUp, Zap,
  Globe, Clock, Layers, Play, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──

interface PipelineOutput {
  id: string;
  pipeline: string;
  pipelineIcon: React.ElementType;
  pipelineColor: string;
  product: string;
  industry: string;
  industryEmoji: string;
  input: {
    label: string;
    preview: string;
  };
  aiProviders: string[];
  output: {
    label: string;
    preview: string;
    details: string[];
    format: string;
  };
  stats: {
    time: string;
    languages?: number;
    slides?: number;
    scenes?: number;
    words?: number;
  };
  tags: string[];
  multiLangPreview?: string[];
}

// ── Curated Output Examples (industry-keyed) ──

const CURATED_OUTPUTS: PipelineOutput[] = [
  // Healthcare
  {
    id: 'out-deck-healthcare',
    pipeline: 'AI Deck',
    pipelineIcon: Presentation,
    pipelineColor: 'text-blue-500',
    product: 'Genie Deck',
    industry: 'healthcare',
    industryEmoji: '🩺',
    input: { label: 'Prompt', preview: 'Create a patient education deck about managing Type 2 Diabetes including lifestyle changes, medication adherence, and when to seek emergency care.' },
    aiProviders: ['Gemini 2.0', 'Azure Neural TTS'],
    output: {
      label: '6-Slide Deck',
      preview: 'Complete patient education presentation with evidence-based guidance, visual infographics, and actionable self-management steps.',
      details: [
        'Slide 1: Understanding Type 2 Diabetes — clear visual of glucose metabolism',
        'Slide 2: Daily Management Checklist — medication schedule with reminders',
        'Slide 3: Nutrition Guidelines — plate method with regional food examples',
        'Slide 4: Exercise & Activity — safe workout protocols by fitness level',
        'Slide 5: Warning Signs — when to call 911 vs visit your doctor',
        'Slide 6: Support Resources — apps, helplines, and community groups',
      ],
      format: 'PPTX / PDF',
    },
    stats: { time: '45s', slides: 6 },
    tags: ['Patient Education', 'Compliance-Ready'],
    multiLangPreview: ['🇸🇦 Arabic (Gulf)', '🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇹🇷 Turkish'],
  },
  {
    id: 'out-tts-healthcare',
    pipeline: 'Text-to-Speech',
    pipelineIcon: Volume2,
    pipelineColor: 'text-orange-500',
    product: 'Azure Neural',
    industry: 'healthcare',
    industryEmoji: '🩺',
    input: { label: 'Text', preview: 'Take your medication with food every morning. If you experience dizziness, chest pain, or shortness of breath, call your healthcare provider immediately.' },
    aiProviders: ['Azure Neural TTS'],
    output: {
      label: 'Patient Audio Guides',
      preview: 'Natural, native-sounding audio in 7 Arabic dialects + 4 Indian languages for patient communication.',
      details: [
        '🇸🇦 Gulf Arabic — Riyadh dialect with empathetic tone',
        '🇪🇬 Egyptian Arabic — Cairo dialect for hospital PA systems',
        '🇮🇳 Hindi — Standard with medical register',
        '🇮🇳 Tamil — Chennai dialect for southern hospitals',
        '🇹🇷 Turkish — Standard with formal medical terminology',
      ],
      format: 'MP3 / WAV',
    },
    stats: { time: '12s', languages: 11 },
    tags: ['Multi-Dialect', 'Patient Safety'],
    multiLangPreview: ['🇸🇦 7 Arabic Dialects', '🇮🇳 4 Indian Languages', '🇹🇷 Turkish', '🇫🇷 French'],
  },
  // Finance
  {
    id: 'out-video-finance',
    pipeline: 'Video Script',
    pipelineIcon: Video,
    pipelineColor: 'text-purple-500',
    product: 'Genie Vibe',
    industry: 'finance',
    industryEmoji: '💼',
    input: { label: 'Script Concept', preview: 'Create a 30-second explainer video for a new AI-powered savings account that auto-optimizes interest rates across currencies.' },
    aiProviders: ['Vertex Veo 3', 'Azure Neural TTS', 'Gemini 2.0'],
    output: {
      label: '4-Scene Storyboard',
      preview: 'Professional financial product explainer with data visualizations and compelling call-to-action.',
      details: [
        'Scene 1 (8s): Problem — money sitting idle in low-yield accounts',
        'Scene 2 (8s): Solution — AI scanning 50+ rate options in real-time',
        'Scene 3 (8s): Proof — animated dashboard showing 3.2x return improvement',
        'Scene 4 (6s): CTA — "Start optimizing today" with app download QR',
      ],
      format: 'MP4 / Storyboard',
    },
    stats: { time: '60s', scenes: 4 },
    tags: ['Product Explainer', 'Data Viz'],
    multiLangPreview: ['🇸🇦 Arabic', '🇩🇪 German', '🇫🇷 French', '🇯🇵 Japanese', '🇧🇷 Portuguese'],
  },
  {
    id: 'out-transcreation-finance',
    pipeline: 'Transcreation',
    pipelineIcon: Sparkles,
    pipelineColor: 'text-yellow-500',
    product: 'Zone-Routed LLM',
    industry: 'finance',
    industryEmoji: '💼',
    input: { label: 'Source Copy', preview: 'Grow your wealth with AI-powered portfolio management. Start investing with just $50.' },
    aiProviders: ['Qwen-Max (MENA)', 'Claude 4 (EU)', 'Gemini 3 Pro (India)'],
    output: {
      label: 'Cultural Adaptations',
      preview: 'Context-aware financial messaging adapted for regulatory language and cultural investment attitudes per market.',
      details: [
        '🇸🇦 Gulf Arabic: Emphasizes Sharia-compliant investing, family wealth preservation — uses "حلال" (halal) framing',
        '🇮🇳 Hindi: References SIP (Systematic Investment Plan), uses ₹50 equivalent — relatable to Indian retail investors',
        '🇯🇵 Japanese: Highlights stability and long-term planning (安定) — conservative framing for Japanese market',
        '🇩🇪 German: Emphasizes regulatory compliance, DSGVO data protection — trust-first positioning',
      ],
      format: 'Localized Copy',
    },
    stats: { time: '18s', languages: 4 },
    tags: ['Cultural Context', 'Zone-Routed', 'Regulatory'],
    multiLangPreview: ['🇸🇦 Sharia-Compliant', '🇮🇳 SIP-Aware', '🇯🇵 Conservative', '🇩🇪 DSGVO-Ready'],
  },
  // Education
  {
    id: 'out-content-education',
    pipeline: 'Content Writer',
    pipelineIcon: FileText,
    pipelineColor: 'text-emerald-500',
    product: 'Genie Spark',
    industry: 'education',
    industryEmoji: '🎓',
    input: { label: 'Topic', preview: 'Write an insightful blog post about how AI tutors and vernacular content are closing the education gap in developing countries.' },
    aiProviders: ['Claude 4', 'Gemini 2.0'],
    output: {
      label: 'Blog Article',
      preview: '1,200-word thought leadership article with SEO optimization, structured headers, and embedded statistics.',
      details: [
        'H1: How AI Tutors Are Bridging the Education Gap in 35+ Languages',
        'Section: The Vernacular Content Challenge — 6.2B people lack native-language learning',
        'Section: AI-Powered Personalization — adaptive learning paths per student',
        'Section: Case Study — 40% improvement in rural India test scores',
        'Conclusion: The Future is Multilingual and AI-Driven',
        'SEO: 8 target keywords, meta description, alt texts for 3 images',
      ],
      format: 'HTML / Markdown',
    },
    stats: { time: '35s', words: 1200 },
    tags: ['Blog', 'SEO-Optimized', 'Thought Leadership'],
    multiLangPreview: ['🇮🇳 Hindi', '🇧🇩 Bengali', '🇰🇪 Swahili', '🇧🇷 Portuguese', '🇫🇷 French'],
  },
  // Government
  {
    id: 'out-tts-government',
    pipeline: 'Text-to-Speech',
    pipelineIcon: Volume2,
    pipelineColor: 'text-orange-500',
    product: 'Azure Neural',
    industry: 'government',
    industryEmoji: '🏛️',
    input: { label: 'Text', preview: 'Important public safety announcement: Residents in Zone 4 should prepare for severe weather. Stock essential supplies and follow evacuation routes.' },
    aiProviders: ['Azure Neural TTS'],
    output: {
      label: 'Multi-Dialect Audio',
      preview: 'Natural, native-sounding audio in 7 Arabic dialects + 4 Indian languages for public broadcast.',
      details: [
        '🇸🇦 Gulf Arabic — Riyadh dialect with formal government tone',
        '🇪🇬 Egyptian Arabic — Cairo dialect for mass broadcast',
        '🇱🇧 Levantine Arabic — Damascus/Beirut variant',
        '🇮🇳 Hindi — Standard with government register',
        '🇮🇳 Tamil — Chennai dialect for southern broadcast',
        '🇰🇪 Swahili — East African variant with clear diction',
      ],
      format: 'MP3 / WAV',
    },
    stats: { time: '12s', languages: 11 },
    tags: ['Multi-Dialect', 'Emergency', 'Government'],
    multiLangPreview: ['🇸🇦 7 Arabic Dialects', '🇮🇳 Hindi & Tamil', '🇰🇪 Swahili', '🇫🇷 French'],
  },
  // Tourism
  {
    id: 'out-transcreation-tourism',
    pipeline: 'Transcreation',
    pipelineIcon: Sparkles,
    pipelineColor: 'text-yellow-500',
    product: 'Zone-Routed LLM',
    industry: 'tourism',
    industryEmoji: '✈️',
    input: { label: 'Source Copy', preview: 'Escape to paradise. Crystal-clear waters, white sandy beaches, and unforgettable sunsets await you. Book your dream vacation today.' },
    aiProviders: ['Qwen-Max (MENA)', 'Claude 4 (EU)', 'Gemini 3 Pro (India)'],
    output: {
      label: 'Cultural Adaptations',
      preview: 'Context-aware cultural adaptations — imagery, values, and emotional triggers adapted per market.',
      details: [
        '🇸🇦 Gulf Arabic: Family-friendly luxury, halal dining, private beach access — cultural modesty values',
        '🇮🇳 Hindi: Monsoon escape, spiritual rejuvenation, Ayurvedic wellness — resonates with Indian travelers',
        '🇯🇵 Japanese: Harmony with nature, seasonal beauty (四季), attention to detail — wa (和) aesthetic',
        '🇧🇷 Brazilian Portuguese: Energy, carnival spirit, group experiences — collectivist cultural framing',
      ],
      format: 'Localized Copy',
    },
    stats: { time: '18s', languages: 4 },
    tags: ['Cultural Context', 'Zone-Routed', 'Emotional'],
    multiLangPreview: ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese', '🇫🇷 French'],
  },
  // Retail
  {
    id: 'out-translation-retail',
    pipeline: 'Translation',
    pipelineIcon: Languages,
    pipelineColor: 'text-cyan-500',
    product: 'DeepL / Azure',
    industry: 'retail',
    industryEmoji: '🛍️',
    input: { label: 'Source Text', preview: 'Flash Sale! 48 hours only — Get 40% off our entire premium collection. Free shipping on orders over $50. Use code SUMMER2026.' },
    aiProviders: ['DeepL', 'Azure Translator'],
    output: {
      label: '8 Translations',
      preview: 'Literal translations optimized for marketing tone, preserving urgency and promotional language.',
      details: [
        '🇫🇷 French: "Vente Flash ! 48 heures seulement — Profitez de -40% sur toute..."',
        '🇩🇪 German: "Blitzverkauf! Nur 48 Stunden — 40% Rabatt auf die gesamte..."',
        '🇯🇵 Japanese: "フラッシュセール！48時間限定 — プレミアムコレクション全品40%OFF..."',
        '🇧🇷 Portuguese: "Promoção Relâmpago! Só 48 horas — 40% de desconto em toda..."',
        '🇸🇦 Arabic: "تخفيضات خاطفة! 48 ساعة فقط — خصم 40% على مجموعتنا..."',
        '🇰🇷 Korean: "플래시 세일! 48시간 한정 — 프리미엄 컬렉션 전 제품 40% 할인..."',
      ],
      format: 'JSON / CSV',
    },
    stats: { time: '6s', languages: 8 },
    tags: ['Marketing', 'Multi-Market', 'RTL Support'],
    multiLangPreview: ['🇫🇷 French', '🇩🇪 German', '🇯🇵 Japanese', '🇸🇦 Arabic', '🇰🇷 Korean'],
  },
  // Manufacturing
  {
    id: 'out-stt-manufacturing',
    pipeline: 'Speech-to-Text',
    pipelineIcon: Mic,
    pipelineColor: 'text-rose-500',
    product: 'Deepgram Nova 2',
    industry: 'manufacturing',
    industryEmoji: '⚙️',
    input: { label: 'Audio Input', preview: '45-second factory floor recording with equipment noise, multiple speakers, and technical terminology in mixed Hindi-English.' },
    aiProviders: ['Deepgram Nova 2', 'Whisper v3'],
    output: {
      label: 'Transcript',
      preview: 'Noise-filtered, speaker-diarized transcript with technical term recognition.',
      details: [
        '[0:00-0:12] Speaker 1: "CNC machine unit 4 calibration — pressure at 42 PSI"',
        '[0:12-0:25] Speaker 2: "Confirmed. Temperature steady at 180°C"',
        '[0:25-0:38] Speaker 1: "Running quality check on batch #4892..."',
        '[0:38-0:45] Speaker 2: "All clear. Logging to maintenance system."',
        'Confidence: 94.2% | Noise filtered: 68dB ambient',
      ],
      format: 'TXT / SRT / VTT',
    },
    stats: { time: '8s' },
    tags: ['Noise-Filtered', 'Speaker ID', 'Technical'],
    multiLangPreview: ['🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇹🇷 Turkish'],
  },
  // Real Estate
  {
    id: 'out-video-realestate',
    pipeline: 'Video Script',
    pipelineIcon: Video,
    pipelineColor: 'text-purple-500',
    product: 'Genie Vibe',
    industry: 'realestate',
    industryEmoji: '🏢',
    input: { label: 'Concept', preview: 'Create a 45-second virtual tour narration for a luxury waterfront penthouse targeting Gulf investors.' },
    aiProviders: ['Vertex Veo 3', 'Azure Neural TTS', 'Meshy AI'],
    output: {
      label: '5-Scene Tour Script',
      preview: 'Luxury property showcase with 3D product visualization and AI avatar presenter.',
      details: [
        'Scene 1: Aerial approach — drone shot with city skyline context',
        'Scene 2: Grand entrance — marble lobby with 3D furniture staging',
        'Scene 3: Living space — panoramic ocean view with lighting simulation',
        'Scene 4: Amenities — pool, gym, spa with AI avatar walkthrough',
        'Scene 5: Investment CTA — ROI projections with regional pricing',
      ],
      format: 'MP4 / Storyboard',
    },
    stats: { time: '50s', scenes: 5 },
    tags: ['Virtual Tour', '3D Staging', 'Luxury'],
    multiLangPreview: ['🇸🇦 Arabic (Gulf)', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇬🇧 English', '🇫🇷 French'],
  },
];

// ── Fallback outputs for industries without specific examples ──
const GENERIC_OUTPUTS: PipelineOutput[] = [
  {
    id: 'out-deck-generic',
    pipeline: 'AI Deck',
    pipelineIcon: Presentation,
    pipelineColor: 'text-blue-500',
    product: 'Genie Deck',
    industry: '_generic',
    industryEmoji: '📊',
    input: { label: 'Prompt', preview: 'Generate a professional presentation about our quarterly performance and growth strategy for the next fiscal year.' },
    aiProviders: ['Gemini 2.0'],
    output: {
      label: '8-Slide Deck',
      preview: 'Data-driven presentation with charts, executive summary, and strategic roadmap.',
      details: [
        'Slide 1: Executive Summary — key highlights and KPIs',
        'Slide 2: Revenue Performance — quarterly comparison charts',
        'Slide 3: Market Position — competitive landscape analysis',
        'Slide 4-6: Growth Strategy — 3 strategic pillars with timelines',
        'Slide 7: Financial Projections — 12-month forecast',
        'Slide 8: Q&A / Next Steps',
      ],
      format: 'PPTX / PDF',
    },
    stats: { time: '50s', slides: 8 },
    tags: ['Business', 'Data-Driven'],
    multiLangPreview: ['🇸🇦 Arabic', '🇫🇷 French', '🇩🇪 German', '🇯🇵 Japanese', '🇪🇸 Spanish'],
  },
  {
    id: 'out-content-generic',
    pipeline: 'Content Writer',
    pipelineIcon: FileText,
    pipelineColor: 'text-emerald-500',
    product: 'Genie Spark',
    industry: '_generic',
    industryEmoji: '✍️',
    input: { label: 'Topic', preview: 'Write a thought leadership article about digital transformation trends for 2026.' },
    aiProviders: ['Claude 4', 'Gemini 2.0'],
    output: {
      label: 'Blog Article',
      preview: '1,500-word SEO-optimized article with structured headers and actionable insights.',
      details: [
        'H1: 5 Digital Transformation Trends Reshaping Business in 2026',
        'Section: AI-First Operations — 78% of enterprises adopting AI workflows',
        'Section: Edge Computing Expansion — real-time processing at scale',
        'Section: Sustainability Tech — carbon-aware cloud infrastructure',
        'Conclusion: The companies that adapt fastest win',
        'SEO: 10 target keywords, meta description, social snippets',
      ],
      format: 'HTML / Markdown',
    },
    stats: { time: '40s', words: 1500 },
    tags: ['Thought Leadership', 'SEO-Optimized'],
    multiLangPreview: ['🇫🇷 French', '🇩🇪 German', '🇪🇸 Spanish', '🇵🇹 Portuguese', '🇯🇵 Japanese'],
  },
];

// ── Helper ──

const getOutputsForIndustry = (industryId: string): PipelineOutput[] => {
  const industryOutputs = CURATED_OUTPUTS.filter(o => o.industry === industryId);
  if (industryOutputs.length >= 2) return industryOutputs;
  // Supplement with generic if industry has fewer than 2 examples
  return [...industryOutputs, ...GENERIC_OUTPUTS].slice(0, 4);
};

const PIPELINE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Deck', value: 'AI Deck', icon: Presentation },
  { label: 'Video', value: 'Video Script', icon: Video },
  { label: 'Content', value: 'Content Writer', icon: FileText },
  { label: 'TTS', value: 'Text-to-Speech', icon: Volume2 },
  { label: 'STT', value: 'Speech-to-Text', icon: Mic },
  { label: 'Translate', value: 'Translation', icon: Languages },
  { label: 'Transcreate', value: 'Transcreation', icon: Sparkles },
];

// ── Component ──

interface PipelineOutputGalleryProps {
  industryId: string;
  industryName: string;
}

export const PipelineOutputGallery: React.FC<PipelineOutputGalleryProps> = ({ industryId, industryName }) => {
  const [filterPipeline, setFilterPipeline] = useState<string | null>(null);
  const [blogViewId, setBlogViewId] = useState<string | null>(null);

  const outputs = getOutputsForIndustry(industryId);
  const filtered = filterPipeline ? outputs.filter(o => o.pipeline === filterPipeline) : outputs;
  const blogItem = blogViewId ? outputs.find(o => o.id === blogViewId) : null;

  // ── Blog detail view ──
  if (blogItem) {
    const Icon = blogItem.pipelineIcon;
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="space-y-5"
      >
        {/* Back button */}
        <button
          onClick={() => setBlogViewId(null)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {industryName} Outputs
        </button>

        {/* Blog header */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted ${blogItem.pipelineColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{blogItem.pipeline} — {industryName}</h3>
                <p className="text-xs text-muted-foreground">Powered by {blogItem.aiProviders.join(' + ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{blogItem.product}</Badge>
              <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" />{blogItem.stats.time}</Badge>
              {blogItem.stats.slides && <Badge variant="outline" className="text-xs">{blogItem.stats.slides} slides</Badge>}
              {blogItem.stats.scenes && <Badge variant="outline" className="text-xs">{blogItem.stats.scenes} scenes</Badge>}
              {blogItem.stats.words && <Badge variant="outline" className="text-xs">{blogItem.stats.words} words</Badge>}
              {blogItem.stats.languages && <Badge variant="outline" className="text-xs">{blogItem.stats.languages} languages</Badge>}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Input section */}
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">📥 {blogItem.input.label}</p>
              <div className="bg-muted/40 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground">{blogItem.input.preview}</p>
              </div>
            </div>

            {/* AI Pipeline */}
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-1.5 flex-wrap">
                {blogItem.aiProviders.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px] gap-1">
                    <Zap className="h-2.5 w-2.5" /> {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Output section */}
            <div>
              <p className="text-xs font-bold uppercase text-primary mb-2">📤 {blogItem.output.label} — {blogItem.output.format}</p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-foreground mb-3">{blogItem.output.preview}</p>
                <div className="space-y-2">
                  {blogItem.output.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-xs text-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Convert to Multi-Language CTA */}
            {blogItem.multiLangPreview && (
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-accent" />
                  <p className="text-sm font-bold text-foreground">Convert to Multi-Language</p>
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px]">1-Click</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  This output can be transcreated into 140+ languages with zone-routed AI — not just translated, but culturally adapted.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {blogItem.multiLangPreview.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-[10px]">{lang}</Badge>
                  ))}
                  <Badge variant="secondary" className="text-[10px]">+ 135 more</Badge>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {blogItem.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Gallery grid view ──
  return (
    <div className="space-y-4">
      {/* Pipeline filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {PIPELINE_FILTERS.map((f) => {
          const isActive = filterPipeline === f.value;
          const FilterIcon = f.icon;
          return (
            <button
              key={f.label}
              onClick={() => setFilterPipeline(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent/10 hover:text-foreground border border-border'
              }`}
            >
              {FilterIcon && <FilterIcon className="h-3 w-3" />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Output cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((output) => {
          const Icon = output.pipelineIcon;
          return (
            <motion.div
              key={output.id}
              layout
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group"
            >
              {/* Card header */}
              <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-muted ${output.pipelineColor}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{output.pipeline}</p>
                  <p className="text-[9px] text-muted-foreground">{output.product}</p>
                </div>
                <Badge variant="outline" className="text-[9px] gap-1">
                  <Clock className="h-2.5 w-2.5" /> {output.stats.time}
                </Badge>
              </div>

              {/* Input → Output compact */}
              <div className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">IN</span>
                  <p className="text-[11px] text-foreground line-clamp-2">{output.input.preview}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {output.aiProviders.slice(0, 2).map((p) => (
                      <Badge key={p} variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5">
                        <Zap className="h-2 w-2" /> {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[8px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">OUT</span>
                  <p className="text-[11px] text-foreground line-clamp-2">{output.output.preview}</p>
                </div>

                {/* Multi-language mini strip */}
                {output.multiLangPreview && (
                  <div className="flex items-center gap-1 pt-1">
                    <Globe className="h-3 w-3 text-accent shrink-0" />
                    <div className="flex items-center gap-1 overflow-hidden">
                      {output.multiLangPreview.slice(0, 3).map((l) => (
                        <span key={l} className="text-[8px] text-muted-foreground whitespace-nowrap">{l}</span>
                      ))}
                      <span className="text-[8px] text-accent font-medium">+more</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex items-center gap-2">
                <button
                  onClick={() => setBlogViewId(output.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium py-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View Full Output
                </button>
                <button
                  onClick={() => setBlogViewId(output.id)}
                  className="flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 font-medium py-2 px-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <Languages className="h-3 w-3" />
                  Multi-Lang
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No examples for this pipeline in {industryName}. Try "All" to see available outputs.
        </div>
      )}
    </div>
  );
};

export default PipelineOutputGallery;
