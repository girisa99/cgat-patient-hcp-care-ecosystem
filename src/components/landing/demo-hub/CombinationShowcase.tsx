/**
 * CombinationShowcase — Differentiator combination workflows
 * 
 * Showcases unique multi-pipeline combinations that competitors can't match:
 * - Deck → Video → Translate (end-to-end content pipeline)
 * - Avatar + Kinetic Typography + 3D (premium visual stack)
 * - Content → Multi-format (one input, many outputs)
 * - Individual pipeline highlights
 * 
 * Each combination is shown as a visual flow with connected steps.
 */

import React, { useState } from 'react';
import {
  Presentation, Video, Languages, Sparkles, User, Box, Type,
  ArrowRight, ChevronRight, Layers, Zap, Globe, Star,
  FileText, Volume2, Mic, Image, Play, Monitor, Eye,
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
  example: {
    input: string;
    finalOutput: string;
  };
}

// ── Combination Flows ──

const COMBINATION_FLOWS: CombinationFlow[] = [
  {
    id: 'deck-to-video-translate',
    title: 'Deck → Video → Translate',
    subtitle: 'End-to-end content pipeline in one platform',
    differentiator: 'Create a deck, convert it to a narrated video, then transcreate into 5+ languages — all without leaving the platform.',
    steps: [
      { icon: Presentation, label: 'AI Deck Generation', provider: 'Gemini 2.0', output: '6-slide PPTX', color: 'bg-blue-500' },
      { icon: Video, label: 'Deck-to-Video', provider: 'Vertex Veo 3', output: 'Narrated MP4', color: 'bg-purple-500' },
      { icon: Volume2, label: 'AI Voiceover', provider: 'Azure Neural', output: 'Native TTS', color: 'bg-orange-500' },
      { icon: Languages, label: 'Transcreation', provider: 'Zone-Routed LLM', output: '5 Languages', color: 'bg-cyan-500' },
    ],
    tags: ['Full Pipeline', 'Zero Plugins', '5-Language Output'],
    tier: 'Creator',
    isHighlight: true,
    example: {
      input: '"Create a quarterly earnings presentation for investors"',
      finalOutput: 'Narrated investor video in English, Arabic, Hindi, Spanish, and Japanese — each culturally transcreated with regional data formatting.',
    },
  },
  {
    id: 'avatar-kinetic-3d',
    title: 'Avatar + Kinetic + 3D',
    subtitle: 'Premium visual storytelling stack',
    differentiator: 'AI-generated presenter narrating kinetic typography slides with embedded 3D product models — Hollywood-quality from a text prompt.',
    steps: [
      { icon: User, label: 'AI Avatar', provider: 'Alibaba Wan 2.2', output: 'Digital Presenter', color: 'bg-pink-500' },
      { icon: Type, label: 'Kinetic Typography', provider: 'ModelsLab', output: 'Animated Text', color: 'bg-amber-500' },
      { icon: Box, label: '3D Product Model', provider: 'Meshy AI', output: 'Interactive 3D', color: 'bg-emerald-500' },
      { icon: Volume2, label: 'Lip-Synced Audio', provider: 'Azure Viseme', output: 'Synced Voice', color: 'bg-orange-500' },
    ],
    tags: ['Premium Visual', 'AI Presenter', '3D Integration'],
    tier: 'Pro',
    isHighlight: true,
    example: {
      input: '"Product launch video for our new smartwatch"',
      finalOutput: 'AI presenter demonstrating a rotating 3D smartwatch model with kinetic feature callouts — all lip-synced in the viewer\'s language.',
    },
  },
  {
    id: 'content-to-multiformat',
    title: 'Content → Multi-Format',
    subtitle: 'One prompt, every output format',
    differentiator: 'A single topic generates a blog post, video script, social captions, email copy, and a presentation deck — all consistent and on-brand.',
    steps: [
      { icon: FileText, label: 'Blog Article', provider: 'Claude 4', output: '1,200 words', color: 'bg-emerald-500' },
      { icon: Video, label: 'Video Script', provider: 'Gemini 2.0', output: '4-Scene Script', color: 'bg-purple-500' },
      { icon: Image, label: 'Social Captions', provider: 'GPT-4o', output: '5 Platforms', color: 'bg-rose-500' },
      { icon: Presentation, label: 'Slide Deck', provider: 'Gemini 2.0', output: '5-Slide PPTX', color: 'bg-blue-500' },
    ],
    tags: ['Content Repurposing', 'Cross-Platform', 'Brand Consistent'],
    tier: 'Creator',
    isHighlight: true,
    example: {
      input: '"AI in healthcare: How telemedicine is changing patient outcomes"',
      finalOutput: 'Blog post + video storyboard + LinkedIn/Twitter/Instagram captions + investor deck — all from one prompt, all on-message.',
    },
  },
  {
    id: 'voice-clone-multilingual',
    title: 'Voice Clone → 40 Languages',
    subtitle: 'Your voice, every market',
    differentiator: 'Clone your brand voice once, then generate TTS in 40+ languages that sound like YOU — preserving tone, pace, and personality.',
    steps: [
      { icon: Mic, label: 'Voice Sample', provider: 'ElevenLabs', output: 'Voice Clone', color: 'bg-rose-500' },
      { icon: Sparkles, label: 'Transcreation', provider: 'Zone-Routed LLM', output: 'Cultural Adapt', color: 'bg-yellow-500' },
      { icon: Volume2, label: 'Cloned TTS', provider: 'Azure Neural', output: '40 Languages', color: 'bg-orange-500' },
      { icon: Globe, label: 'Regional Deploy', provider: '7-Zone Routing', output: 'Global Reach', color: 'bg-cyan-500' },
    ],
    tags: ['Voice Cloning', 'Brand Consistency', '40+ Languages'],
    tier: 'Pro',
    isHighlight: false,
    example: {
      input: '"30-second voice sample of CEO\'s keynote address"',
      finalOutput: 'CEO\'s cloned voice narrating product videos in Arabic, Hindi, Spanish, French, and Mandarin — each with native prosody.',
    },
  },
  {
    id: 'stt-translate-tts',
    title: 'STT → Translate → TTS',
    subtitle: 'Audio-to-audio in any language',
    differentiator: 'Upload audio in one language, get transcribed, translated, and re-voiced in another language — full audio-to-audio pipeline.',
    steps: [
      { icon: Mic, label: 'Speech-to-Text', provider: 'Deepgram Nova 2', output: 'Transcript', color: 'bg-rose-500' },
      { icon: Languages, label: 'Translation', provider: 'DeepL', output: 'Translated Text', color: 'bg-cyan-500' },
      { icon: Volume2, label: 'Text-to-Speech', provider: 'Azure Neural', output: 'New Audio', color: 'bg-orange-500' },
    ],
    tags: ['Audio Pipeline', 'Real-Time', 'Dialect Support'],
    tier: 'Starter',
    isHighlight: false,
    example: {
      input: '"Meeting recording in English (45 minutes)"',
      finalOutput: 'Meeting summary transcribed, translated to Gulf Arabic and Hindi, then re-voiced with natural TTS — ready for regional teams.',
    },
  },
];

// ── Component ──

export const CombinationShowcase: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-3 gap-1.5 border-primary/30 text-primary">
          <Layers className="w-3 h-3" />
          Only Here — Combination Workflows
        </Badge>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Combinations That{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            No One Else Offers
          </span>
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Chain multiple AI pipelines into powerful workflows — deck to video, voice clone to 40 languages, 
          one prompt to every format. This is what sets us apart.
        </p>
      </div>

      {/* Combination cards */}
      <div className="space-y-4">
        {COMBINATION_FLOWS.map((combo, comboIdx) => {
          const isExpanded = expandedId === combo.id;

          return (
            <motion.div
              key={combo.id}
              layout
              className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                combo.isHighlight 
                  ? 'border-primary/30 shadow-lg shadow-primary/5' 
                  : 'border-border hover:border-primary/20'
              }`}
            >
              {/* Card header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base sm:text-lg font-bold text-foreground">{combo.title}</h4>
                      {combo.isHighlight && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] gap-0.5">
                          <Star className="h-2.5 w-2.5" /> Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{combo.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{combo.tier}</Badge>
                </div>

                {/* Visual pipeline flow */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {combo.steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center gap-1 shrink-0 min-w-[80px] sm:min-w-[100px]">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                            <StepIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <p className="text-[10px] sm:text-xs font-semibold text-foreground text-center leading-tight">
                            {step.label}
                          </p>
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">{step.provider}</Badge>
                          <p className="text-[9px] text-muted-foreground">{step.output}</p>
                        </div>
                        {idx < combo.steps.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-[-12px]" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {combo.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[8px]">{tag}</Badge>
                  ))}
                </div>

                {/* Expand for example */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : combo.id)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors mt-3"
                >
                  <Eye className="h-3 w-3" />
                  {isExpanded ? 'Hide Example' : 'See Example Output'}
                  <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Expanded example */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                      <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border space-y-3">
                        {/* Differentiator text */}
                        <p className="text-xs text-foreground italic">
                          💡 {combo.differentiator}
                        </p>

                        {/* Example input */}
                        <div className="flex items-start gap-2">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                            Input
                          </span>
                          <p className="text-xs text-foreground">{combo.example.input}</p>
                        </div>

                        {/* Example output */}
                        <div className="flex items-start gap-2">
                          <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                            Result
                          </span>
                          <p className="text-xs text-foreground">{combo.example.finalOutput}</p>
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
