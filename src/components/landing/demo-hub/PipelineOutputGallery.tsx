/**
 * PipelineOutputGallery — Case study cards showing Input → Pipeline → Output
 * 
 * Displays curated examples for all 7 pipelines plus combination workflows.
 * Each card shows: what went in, which AI pipeline processed it, and what came out.
 * Users can expand to view full output details in a blog-like view.
 */

import React, { useState } from 'react';
import {
  Presentation, Video, FileText, Volume2, Mic, Languages, Sparkles,
  ArrowRight, Eye, ChevronDown, ChevronUp, ExternalLink, Zap,
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
  combination?: string; // If part of a combo flow
}

// ── Curated Output Examples ──

const CURATED_OUTPUTS: PipelineOutput[] = [
  // Deck pipeline
  {
    id: 'out-deck-1',
    pipeline: 'AI Deck',
    pipelineIcon: Presentation,
    pipelineColor: 'text-blue-500',
    product: 'Genie Deck',
    industry: 'Healthcare',
    industryEmoji: '🩺',
    input: {
      label: 'Prompt',
      preview: 'Create a patient education deck about managing Type 2 Diabetes including lifestyle changes, medication adherence, and when to seek emergency care.',
    },
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
    tags: ['Patient Education', 'Compliance-Ready', 'Multilingual'],
  },
  // Video pipeline
  {
    id: 'out-video-1',
    pipeline: 'Video Script',
    pipelineIcon: Video,
    pipelineColor: 'text-purple-500',
    product: 'Genie Vibe',
    industry: 'Finance',
    industryEmoji: '💼',
    input: {
      label: 'Script Concept',
      preview: 'Create a 30-second explainer video for a new AI-powered savings account that auto-optimizes interest rates across currencies.',
    },
    aiProviders: ['Vertex Veo 3', 'Azure Neural TTS', 'Gemini 2.0'],
    output: {
      label: '4-Scene Storyboard',
      preview: 'Professional financial product explainer with data visualizations, animated UI mockups, and a compelling call-to-action.',
      details: [
        'Scene 1 (8s): Problem — money sitting idle in low-yield accounts',
        'Scene 2 (8s): Solution — AI scanning 50+ rate options in real-time',
        'Scene 3 (8s): Proof — animated dashboard showing 3.2x return improvement',
        'Scene 4 (6s): CTA — "Start optimizing today" with app download QR',
      ],
      format: 'MP4 / Storyboard',
    },
    stats: { time: '60s', scenes: 4 },
    tags: ['Product Explainer', 'Data Viz', 'Multi-Currency'],
  },
  // Content pipeline
  {
    id: 'out-content-1',
    pipeline: 'Content Writer',
    pipelineIcon: FileText,
    pipelineColor: 'text-emerald-500',
    product: 'Genie Spark',
    industry: 'EdTech',
    industryEmoji: '🎓',
    input: {
      label: 'Topic',
      preview: 'Write an insightful blog post about how AI tutors and vernacular content are closing the education gap in developing countries.',
    },
    aiProviders: ['Claude 4', 'Gemini 2.0'],
    output: {
      label: 'Blog Article',
      preview: '1,200-word thought leadership article with SEO optimization, structured headers, embedded statistics, and a strong conclusion.',
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
  },
  // TTS pipeline
  {
    id: 'out-tts-1',
    pipeline: 'Text-to-Speech',
    pipelineIcon: Volume2,
    pipelineColor: 'text-orange-500',
    product: 'Azure Neural',
    industry: 'Government',
    industryEmoji: '🏛️',
    input: {
      label: 'Text',
      preview: 'Important public safety announcement: Residents in Zone 4 should prepare for severe weather conditions this weekend. Stock essential supplies and follow evacuation routes.',
    },
    aiProviders: ['Azure Neural TTS'],
    output: {
      label: 'Audio Files',
      preview: 'Natural, native-sounding audio in 7 Arabic dialects + 4 Indian languages — each with proper regional prosody and pronunciation.',
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
    tags: ['Multi-Dialect', 'Government', 'Emergency'],
  },
  // STT pipeline
  {
    id: 'out-stt-1',
    pipeline: 'Speech-to-Text',
    pipelineIcon: Mic,
    pipelineColor: 'text-rose-500',
    product: 'Deepgram Nova 2',
    industry: 'Manufacturing',
    industryEmoji: '⚙️',
    input: {
      label: 'Audio Input',
      preview: '45-second factory floor recording with equipment noise, multiple speakers, and technical terminology in mixed Hindi-English.',
    },
    aiProviders: ['Deepgram Nova 2', 'Whisper v3'],
    output: {
      label: 'Transcript',
      preview: 'Noise-filtered, speaker-diarized transcript with technical term recognition and timestamp markers.',
      details: [
        '[0:00-0:12] Speaker 1: "CNC machine unit 4 calibration report — pressure at 42 PSI"',
        '[0:12-0:25] Speaker 2: "Confirmed. Temperature holding steady at 180°C"',
        '[0:25-0:38] Speaker 1: "Running quality check on batch #4892..."',
        '[0:38-0:45] Speaker 2: "All clear. Logging to maintenance system."',
        'Confidence: 94.2% | Noise filtered: 68dB ambient',
      ],
      format: 'TXT / SRT / VTT',
    },
    stats: { time: '8s' },
    tags: ['Noise-Filtered', 'Speaker ID', 'Technical'],
  },
  // Translation pipeline
  {
    id: 'out-translation-1',
    pipeline: 'Translation',
    pipelineIcon: Languages,
    pipelineColor: 'text-cyan-500',
    product: 'DeepL / Azure',
    industry: 'Retail',
    industryEmoji: '🛍️',
    input: {
      label: 'Source Text',
      preview: 'Flash Sale! 48 hours only — Get 40% off our entire premium collection. Free shipping on orders over $50. Use code SUMMER2026.',
    },
    aiProviders: ['DeepL', 'Azure Translator'],
    output: {
      label: '8 Translations',
      preview: 'Literal translations optimized for marketing tone, preserving urgency and promotional language across all target markets.',
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
  },
  // Transcreation pipeline
  {
    id: 'out-transcreation-1',
    pipeline: 'Transcreation',
    pipelineIcon: Sparkles,
    pipelineColor: 'text-yellow-500',
    product: 'Zone-Routed LLM',
    industry: 'Tourism',
    industryEmoji: '✈️',
    input: {
      label: 'Source Copy',
      preview: 'Escape to paradise. Crystal-clear waters, white sandy beaches, and unforgettable sunsets await you. Book your dream vacation today.',
    },
    aiProviders: ['Qwen-Max (MENA)', 'Claude 4 (EU)', 'Gemini 3 Pro (India)'],
    output: {
      label: 'Cultural Adaptations',
      preview: 'Context-aware cultural adaptations — not just words, but imagery, values, and emotional triggers adapted per market.',
      details: [
        '🇸🇦 Gulf Arabic: Emphasizes family-friendly luxury, halal dining, private beach access — cultural modesty values',
        '🇮🇳 Hindi: References monsoon escape, spiritual rejuvenation, Ayurvedic wellness — resonates with Indian travelers',
        '🇯🇵 Japanese: Highlights harmony with nature, seasonal beauty (四季), attention to detail — wa (和) aesthetic',
        '🇧🇷 Brazilian Portuguese: Energy, carnival spirit, group experiences — collectivist cultural framing',
        '🇫🇷 French: Refined elegance, gastronomic experiences, art of living — "l\'art de vivre" positioning',
      ],
      format: 'Localized Copy',
    },
    stats: { time: '18s', languages: 5 },
    tags: ['Cultural Context', 'Zone-Routed', 'Emotional'],
  },
];

// ── Component ──

interface PipelineOutputGalleryProps {
  industryFilter?: string;
}

export const PipelineOutputGallery: React.FC<PipelineOutputGalleryProps> = ({ industryFilter }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPipeline, setFilterPipeline] = useState<string | null>(null);

  const filteredOutputs = CURATED_OUTPUTS.filter(o => {
    if (filterPipeline && o.pipeline !== filterPipeline) return false;
    return true;
  });

  const pipelineFilters = [
    { label: 'All', value: null },
    { label: 'Deck', value: 'AI Deck', icon: Presentation },
    { label: 'Video', value: 'Video Script', icon: Video },
    { label: 'Content', value: 'Content Writer', icon: FileText },
    { label: 'TTS', value: 'Text-to-Speech', icon: Volume2 },
    { label: 'STT', value: 'Speech-to-Text', icon: Mic },
    { label: 'Translate', value: 'Translation', icon: Languages },
    { label: 'Transcreate', value: 'Transcreation', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-3 gap-1.5 border-accent/30 text-accent">
          <Eye className="w-3 h-3" />
          Real AI Outputs — Not Mockups
        </Badge>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          See What Gets{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Generated
          </span>
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Input → AI Pipeline → Output. Every card shows exactly what our AI produces.
          Browse by pipeline or expand for full output details.
        </p>
      </div>

      {/* Pipeline filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
        {pipelineFilters.map((f) => {
          const isActive = filterPipeline === f.value;
          const Icon = f.icon;
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
              {Icon && <Icon className="h-3 w-3" />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Output cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOutputs.map((output) => {
          const Icon = output.pipelineIcon;
          const isExpanded = expandedId === output.id;

          return (
            <motion.div
              key={output.id}
              layout
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Card header */}
              <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-border bg-muted/30">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted ${output.pipelineColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{output.pipeline}</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{output.product}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {output.industryEmoji} {output.industry}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[9px] gap-1">
                    <Clock className="h-2.5 w-2.5" /> {output.stats.time}
                  </Badge>
                </div>
              </div>

              {/* Input → Output flow */}
              <div className="p-3 sm:p-4 space-y-3">
                {/* INPUT */}
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                    Input
                  </span>
                  <p className="text-xs text-foreground line-clamp-2">{output.input.preview}</p>
                </div>

                {/* Arrow + Providers */}
                <div className="flex items-center gap-2 pl-1">
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {output.aiProviders.map((p) => (
                      <Badge key={p} variant="outline" className="text-[8px] px-1.5 py-0 h-4 gap-0.5">
                        <Zap className="h-2 w-2" /> {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* OUTPUT */}
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                    Output
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground mb-0.5">{output.output.label}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{output.output.preview}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {output.stats.slides && (
                    <Badge variant="secondary" className="text-[9px]">{output.stats.slides} slides</Badge>
                  )}
                  {output.stats.scenes && (
                    <Badge variant="secondary" className="text-[9px]">{output.stats.scenes} scenes</Badge>
                  )}
                  {output.stats.words && (
                    <Badge variant="secondary" className="text-[9px]">{output.stats.words} words</Badge>
                  )}
                  {output.stats.languages && (
                    <Badge variant="secondary" className="text-[9px]">{output.stats.languages} languages</Badge>
                  )}
                  {output.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[8px]">{tag}</Badge>
                  ))}
                </div>

                {/* Expand/collapse */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : output.id)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors w-full justify-center py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10"
                >
                  <Eye className="h-3 w-3" />
                  {isExpanded ? 'Hide Details' : 'View Full Output'}
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {/* Expanded detail view */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-muted/40 rounded-xl p-3 sm:p-4 space-y-2 border border-border mt-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-foreground">📋 Output Breakdown</p>
                          <Badge variant="outline" className="text-[9px]">{output.output.format}</Badge>
                        </div>
                        {output.output.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 bg-primary/10 rounded text-[9px] font-bold text-primary flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-[11px] text-foreground">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineOutputGallery;
