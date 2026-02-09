/**
 * CombinationShowcase — Industry-aware differentiator combination workflows
 * 
 * Shows multi-pipeline chains contextualized to the selected industry.
 * Each combination shows: steps → providers → example input/output.
 * Includes "Convert to Multi-Language" on every combination output.
 */

import React, { useState } from 'react';
import {
  Presentation, Video, Languages, Sparkles, User, Box, Type,
  ArrowRight, ArrowLeft, ChevronRight, Layers, Zap, Globe, Star,
  FileText, Volume2, Mic, Image, Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──

interface CombinationStep {
  icon: React.ElementType;
  label: string;
  provider: string;
  output: string;
  color: string;
}

interface CombinationFlow {
  id: string;
  title: string;
  subtitle: string;
  differentiator: string;
  steps: CombinationStep[];
  tags: string[];
  tier: string;
  isHighlight: boolean;
  industries: string[]; // which industries this is relevant for
  example: {
    input: string;
    finalOutput: string;
  };
  multiLangPreview: string[];
}

// ── Combination Flows (with industry mapping) ──

const COMBINATION_FLOWS: CombinationFlow[] = [
  {
    id: 'deck-to-video-translate',
    title: 'Deck → Video → Translate',
    subtitle: 'End-to-end content pipeline in one platform',
    differentiator: 'Create a deck, convert it to a narrated video, then transcreate into 5+ languages — all without leaving the platform.',
    steps: [
      { icon: Presentation, label: 'AI Deck', provider: 'Gemini 2.0', output: '6-slide PPTX', color: 'bg-blue-500' },
      { icon: Video, label: 'Deck-to-Video', provider: 'Vertex Veo 3', output: 'Narrated MP4', color: 'bg-purple-500' },
      { icon: Volume2, label: 'AI Voiceover', provider: 'Azure Neural', output: 'Native TTS', color: 'bg-orange-500' },
      { icon: Languages, label: 'Transcreation', provider: 'Zone-Routed LLM', output: '5 Languages', color: 'bg-cyan-500' },
    ],
    tags: ['Full Pipeline', 'Zero Plugins', '5-Language Output'],
    tier: 'Creator',
    isHighlight: true,
    industries: ['healthcare', 'finance', 'education', 'government', 'manufacturing', 'realestate'],
    example: {
      input: '"Create a quarterly earnings presentation for investors"',
      finalOutput: 'Narrated investor video in English, Arabic, Hindi, Spanish, and Japanese — each culturally transcreated.',
    },
    multiLangPreview: ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇪🇸 Spanish', '🇯🇵 Japanese', '🇫🇷 French'],
  },
  {
    id: 'avatar-kinetic-3d',
    title: 'Avatar + Kinetic + 3D',
    subtitle: 'Premium visual storytelling stack',
    differentiator: 'AI presenter narrating kinetic typography slides with 3D product models — Hollywood-quality from a text prompt.',
    steps: [
      { icon: User, label: 'AI Avatar', provider: 'Alibaba Wan 2.2', output: 'Digital Presenter', color: 'bg-pink-500' },
      { icon: Type, label: 'Kinetic Typography', provider: 'ModelsLab', output: 'Animated Text', color: 'bg-amber-500' },
      { icon: Box, label: '3D Product Model', provider: 'Meshy AI', output: 'Interactive 3D', color: 'bg-emerald-500' },
      { icon: Volume2, label: 'Lip-Synced Audio', provider: 'Azure Viseme', output: 'Synced Voice', color: 'bg-orange-500' },
    ],
    tags: ['Premium Visual', 'AI Presenter', '3D Integration'],
    tier: 'Pro',
    isHighlight: true,
    industries: ['retail', 'realestate', 'tourism', 'manufacturing'],
    example: {
      input: '"Product launch video for our new smartwatch"',
      finalOutput: 'AI presenter demonstrating a rotating 3D smartwatch model with kinetic feature callouts — lip-synced in 5+ languages.',
    },
    multiLangPreview: ['🇬🇧 English', '🇸🇦 Arabic', '🇯🇵 Japanese', '🇩🇪 German', '🇧🇷 Portuguese'],
  },
  {
    id: 'content-to-multiformat',
    title: 'Content → Multi-Format',
    subtitle: 'One prompt, every output format',
    differentiator: 'A single topic generates a blog, video script, social captions, email copy, and a deck — all consistent and on-brand.',
    steps: [
      { icon: FileText, label: 'Blog Article', provider: 'Claude 4', output: '1,200 words', color: 'bg-emerald-500' },
      { icon: Video, label: 'Video Script', provider: 'Gemini 2.0', output: '4-Scene Script', color: 'bg-purple-500' },
      { icon: Image, label: 'Social Captions', provider: 'GPT-4o', output: '5 Platforms', color: 'bg-rose-500' },
      { icon: Presentation, label: 'Slide Deck', provider: 'Gemini 2.0', output: '5-Slide PPTX', color: 'bg-blue-500' },
    ],
    tags: ['Content Repurposing', 'Cross-Platform', 'Brand Consistent'],
    tier: 'Creator',
    isHighlight: true,
    industries: ['healthcare', 'education', 'finance', 'retail', 'tourism'],
    example: {
      input: '"AI in healthcare: How telemedicine is changing patient outcomes"',
      finalOutput: 'Blog + video storyboard + social captions + investor deck — all from one prompt, all on-message.',
    },
    multiLangPreview: ['🇫🇷 French', '🇪🇸 Spanish', '🇮🇳 Hindi', '🇸🇦 Arabic', '🇩🇪 German'],
  },
  {
    id: 'voice-clone-multilingual',
    title: 'Voice Clone → 40 Languages',
    subtitle: 'Your voice, every market',
    differentiator: 'Clone your brand voice once, then generate TTS in 40+ languages that sound like YOU.',
    steps: [
      { icon: Mic, label: 'Voice Sample', provider: 'ElevenLabs', output: 'Voice Clone', color: 'bg-rose-500' },
      { icon: Sparkles, label: 'Transcreation', provider: 'Zone-Routed LLM', output: 'Cultural Adapt', color: 'bg-yellow-500' },
      { icon: Volume2, label: 'Cloned TTS', provider: 'Azure Neural', output: '40 Languages', color: 'bg-orange-500' },
      { icon: Globe, label: 'Regional Deploy', provider: '7-Zone Routing', output: 'Global Reach', color: 'bg-cyan-500' },
    ],
    tags: ['Voice Cloning', 'Brand Consistency', '40+ Languages'],
    tier: 'Pro',
    isHighlight: false,
    industries: ['retail', 'finance', 'tourism', 'education'],
    example: {
      input: '"30-second voice sample of CEO\'s keynote"',
      finalOutput: 'CEO\'s cloned voice narrating product videos in Arabic, Hindi, Spanish, French, and Mandarin.',
    },
    multiLangPreview: ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇪🇸 Spanish', '🇫🇷 French', '🇨🇳 Mandarin'],
  },
  {
    id: 'stt-translate-tts',
    title: 'STT → Translate → TTS',
    subtitle: 'Audio-to-audio in any language',
    differentiator: 'Upload audio in one language, get transcribed, translated, and re-voiced in another — full audio-to-audio.',
    steps: [
      { icon: Mic, label: 'Speech-to-Text', provider: 'Deepgram Nova 2', output: 'Transcript', color: 'bg-rose-500' },
      { icon: Languages, label: 'Translation', provider: 'DeepL', output: 'Translated Text', color: 'bg-cyan-500' },
      { icon: Volume2, label: 'Text-to-Speech', provider: 'Azure Neural', output: 'New Audio', color: 'bg-orange-500' },
    ],
    tags: ['Audio Pipeline', 'Real-Time', 'Dialect Support'],
    tier: 'Starter',
    isHighlight: false,
    industries: ['government', 'healthcare', 'manufacturing', 'education'],
    example: {
      input: '"Meeting recording in English (45 minutes)"',
      finalOutput: 'Transcribed, translated to Gulf Arabic and Hindi, then re-voiced with natural TTS for regional teams.',
    },
    multiLangPreview: ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇩🇪 German', '🇯🇵 Japanese'],
  },
];

// ── Component ──

interface CombinationShowcaseProps {
  industryId: string;
  industryName: string;
}

export const CombinationShowcase: React.FC<CombinationShowcaseProps> = ({ industryId, industryName }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter combos relevant to selected industry, then show rest as "Also Available"
  const relevantCombos = COMBINATION_FLOWS.filter(c => c.industries.includes(industryId));
  const otherCombos = COMBINATION_FLOWS.filter(c => !c.industries.includes(industryId));
  const combos = [...relevantCombos, ...otherCombos];

  return (
    <div className="space-y-4">
      {/* Combo cards */}
      <div className="space-y-3">
        {combos.map((combo, comboIdx) => {
          const isExpanded = expandedId === combo.id;
          const isRelevant = combo.industries.includes(industryId);

          return (
            <motion.div
              key={combo.id}
              layout
              className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                isRelevant && combo.isHighlight
                  ? 'border-primary/30 shadow-lg shadow-primary/5'
                  : isRelevant
                  ? 'border-border hover:border-primary/20'
                  : 'border-border/50 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Card header */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm sm:text-base font-bold text-foreground">{combo.title}</h4>
                      {combo.isHighlight && isRelevant && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] gap-0.5">
                          <Star className="h-2 w-2" /> Best for {industryName}
                        </Badge>
                      )}
                      {!isRelevant && (
                        <Badge variant="outline" className="text-[8px] text-muted-foreground">Also Available</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{combo.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] shrink-0">{combo.tier}</Badge>
                </div>

                {/* Visual pipeline flow — compact */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {combo.steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[70px]">
                          <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center shadow-sm`}>
                            <StepIcon className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-[9px] font-semibold text-foreground text-center leading-tight">{step.label}</p>
                          <p className="text-[7px] text-muted-foreground">{step.provider}</p>
                        </div>
                        {idx < combo.steps.length - 1 && (
                          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Tags + Multi-lang strip */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {combo.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[7px]">{tag}</Badge>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <Globe className="h-3 w-3 text-accent" />
                    <span className="text-[8px] text-accent font-medium">→ 140+ Languages</span>
                  </div>
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : combo.id)}
                  className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors mt-2"
                >
                  <Eye className="h-3 w-3" />
                  {isExpanded ? 'Hide Example' : 'See Example + Multi-Language Output'}
                  <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Expanded example with multi-language */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
                      <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                        <p className="text-[11px] text-foreground italic">💡 {combo.differentiator}</p>
                        <div className="flex items-start gap-2">
                          <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">Input</span>
                          <p className="text-xs text-foreground">{combo.example.input}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[8px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">Result</span>
                          <p className="text-xs text-foreground">{combo.example.finalOutput}</p>
                        </div>
                      </div>

                      {/* Multi-language conversion */}
                      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-3 border border-accent/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Globe className="h-3.5 w-3.5 text-accent" />
                          <p className="text-xs font-bold text-foreground">Convert Entire Pipeline to Multi-Language</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          Every step output — deck, video, voiceover — gets transcreated into your target languages with zone-routed AI.
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {combo.multiLangPreview.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-[9px]">{lang}</Badge>
                          ))}
                          <Badge variant="secondary" className="text-[9px]">+ 135 more</Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CombinationShowcase;
