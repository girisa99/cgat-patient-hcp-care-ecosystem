/**
 * OutputFormatShowcase — "What You Can Create" section
 * All 16 formats in a glassmorphism auto-scroll marquee.
 * Direction is region-aware: LTR for US/Europe, RTL for Arabic/Hebrew regions.
 * Pauses on hover.
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Video, Mic, FileText, Globe, Share2, BookOpen, Presentation, Radio,
  MonitorPlay, Newspaper, Mail, GraduationCap, Users, Clapperboard,
  BarChart3, Megaphone,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAutoScrollOnHover } from '@/hooks/useAutoScrollOnHover';

const FORMAT_CARDS = [
  {
    icon: Video,
    title: 'Short Video',
    subFormats: ['Social Clip', 'Explainer', 'Brand Anthem'],
    pipeline: 'Vertex Veo + Azure TTS',
    gradient: 'from-sky-500/80 to-cyan-600/80',
    emoji: '🎬',
  },
  {
    icon: Clapperboard,
    title: 'Long Video',
    subFormats: ['Tutorial', 'Documentary', 'Product Demo'],
    pipeline: 'ModelsLab + ElevenLabs',
    gradient: 'from-blue-500/80 to-indigo-600/80',
    emoji: '🎞️',
  },
  {
    icon: Mic,
    title: 'Audio Podcast',
    subFormats: ['Expert Interview', 'Audio Drama', 'Roundtable'],
    pipeline: 'ElevenLabs + Deepgram',
    gradient: 'from-violet-500/80 to-purple-600/80',
    emoji: '🎙️',
  },
  {
    icon: MonitorPlay,
    title: 'Video Podcast',
    subFormats: ['Talking Head', 'Split Screen', 'Panel'],
    pipeline: 'HeyGen + ElevenLabs',
    gradient: 'from-fuchsia-500/80 to-pink-600/80',
    emoji: '📹',
  },
  {
    icon: Radio,
    title: 'Webcast',
    subFormats: ['Live Webinar', 'Keynote', 'AMA Session'],
    pipeline: 'Azure + Gemini',
    gradient: 'from-rose-500/80 to-red-600/80',
    emoji: '📡',
  },
  {
    icon: Presentation,
    title: 'Presentation',
    subFormats: ['Investor Pitch', 'Sales Deck', 'Onboarding'],
    pipeline: 'GPT-4o + Gemini 3',
    gradient: 'from-amber-500/80 to-orange-600/80',
    emoji: '📊',
  },
  {
    icon: Globe,
    title: 'Website',
    subFormats: ['Landing Page', 'Microsite', 'Product Page'],
    pipeline: 'Claude 4 + Gemini',
    gradient: 'from-emerald-500/80 to-teal-600/80',
    emoji: '🌐',
  },
  {
    icon: Share2,
    title: 'Social',
    subFormats: ['Instagram Reel', 'LinkedIn Post', 'TikTok'],
    pipeline: 'ModelsLab + RunPod FFmpeg',
    gradient: 'from-pink-500/80 to-rose-600/80',
    emoji: '📱',
  },
  {
    icon: BookOpen,
    title: 'Document',
    subFormats: ['Whitepaper', 'Case Study', 'Newsletter'],
    pipeline: 'GPT-4o + DeepL',
    gradient: 'from-indigo-500/80 to-blue-600/80',
    emoji: '📄',
  },
  {
    icon: GraduationCap,
    title: 'Training',
    subFormats: ['E-Learning', 'Course Series', 'Tutorial'],
    pipeline: 'Gemini + ElevenLabs',
    gradient: 'from-lime-500/80 to-green-600/80',
    emoji: '🎓',
  },
  {
    icon: BarChart3,
    title: 'Infographic',
    subFormats: ['Animated', 'Data Viz', 'Process Flow'],
    pipeline: 'GPT-4o + D3.js',
    gradient: 'from-cyan-500/80 to-sky-600/80',
    emoji: '📈',
  },
  {
    icon: Mail,
    title: 'Email Campaign',
    subFormats: ['Drip Series', 'Newsletter', 'A/B Variants'],
    pipeline: 'Claude 4 + DeepL',
    gradient: 'from-orange-500/80 to-amber-600/80',
    emoji: '✉️',
  },
  {
    icon: Newspaper,
    title: 'Blog & Articles',
    subFormats: ['Long-form', 'SEO Content', 'Thought Leadership'],
    pipeline: 'GPT-4o + Gemini',
    gradient: 'from-teal-500/80 to-emerald-600/80',
    emoji: '📰',
  },
  {
    icon: Users,
    title: 'Meeting Intel',
    subFormats: ['MoM', 'Task Board', 'Architecture Diagram'],
    pipeline: 'Deepgram + GPT-4o',
    gradient: 'from-slate-500/80 to-zinc-600/80',
    emoji: '🤝',
  },
  {
    icon: FileText,
    title: 'Investor Deck',
    subFormats: ['Live Demo', 'Pitch Deck', 'Data Story'],
    pipeline: 'GPT-4o + PPTXGenJS',
    gradient: 'from-yellow-500/80 to-amber-600/80',
    emoji: '💼',
  },
  {
    icon: Megaphone,
    title: 'Event Recap',
    subFormats: ['Highlight Reel', 'Best Moments', 'Social Clips'],
    pipeline: 'ModelsLab + Replicate',
    gradient: 'from-red-500/80 to-orange-600/80',
    emoji: '🎪',
  },
];

/** RTL region slugs that should scroll right-to-left */
const RTL_REGIONS = new Set(['mena', 'central_asia']);

interface OutputFormatShowcaseProps {
  regionSlug?: string;
}

export const OutputFormatShowcase: React.FC<OutputFormatShowcaseProps> = ({ regionSlug = 'nam' }) => {
  const isRTL = RTL_REGIONS.has(regionSlug);
  const { scrollRef, onMouseEnter, onMouseLeave } = useAutoScrollOnHover({
    speed: 1.2,
    direction: isRTL ? 'rtl' : 'ltr',
  });

  return (
    <section id="formats" className="py-20 relative overflow-hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1 backdrop-blur-sm bg-secondary/50 border border-white/10">
            16 Formats · 62+ Content Types
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            What You Can Create
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From video to podcast, PPT to social — one platform produces everything, transcreated for every market.
          </p>
        </div>

        {/* Auto-scroll marquee container */}
        <div
          ref={scrollRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="flex gap-5 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {FORMAT_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 150 }}
                className="group relative min-w-[260px] max-w-[280px] flex-shrink-0 rounded-2xl p-6
                  backdrop-blur-xl bg-card/20 border border-white/10
                  hover:border-primary/40 transition-all duration-300
                  hover:shadow-2xl hover:shadow-primary/15
                  hover:bg-card/40"
              >
                {/* Glassmorphism inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none" />

                {/* Icon thumbnail with emoji overlay */}
                <div className="relative mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm`}>
                    <Icon className="w-8 h-8 text-white/90" strokeWidth={1.5} />
                  </div>
                  {/* Emoji badge */}
                  <span className="absolute -top-1 -right-1 text-lg drop-shadow-md">
                    {card.emoji}
                  </span>
                </div>

                <h3 className="relative text-lg font-bold text-foreground mb-2">{card.title}</h3>

                <div className="relative flex flex-wrap gap-1.5 mb-4">
                  {card.subFormats.map((sf) => (
                    <span
                      key={sf}
                      className="text-xs px-2.5 py-1 rounded-full
                        backdrop-blur-sm bg-white/[0.06] text-muted-foreground
                        border border-white/10 font-medium"
                    >
                      {sf}
                    </span>
                  ))}
                </div>

                <p className="relative text-[11px] text-muted-foreground/70 font-medium">
                  Powered by {card.pipeline}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Fade edges for glassmorphism continuity */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
};

export default OutputFormatShowcase;
