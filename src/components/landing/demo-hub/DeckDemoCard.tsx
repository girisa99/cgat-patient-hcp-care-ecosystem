/**
 * Deck Demo Card — Rich AI presentation generator with diverse slide layouts
 * 
 * Slide types: title+avatar, chart, timeline/journey, 3D scene, standard bullets
 * Each layout has unique animations, gradients, and visual elements.
 */

import React, { useState, useEffect } from 'react';
import { 
  Presentation, Loader2, Sparkles, Globe, Lock, ChevronRight, 
  BarChart3, Users, Box, Footprints, User, Mic, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { getIndustryExample } from './industryDemoExamples';
import { DemoTemplatePicker, getDemoTemplates, type DemoTemplate } from './DemoTemplatePicker';

interface DeckDemoCardProps {
  industryId: string;
  region?: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

type SlideLayout = 'title' | 'bullets' | 'chart' | 'timeline' | '3d' | 'avatar';

interface GeneratedSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  layoutType: SlideLayout;
  chartData?: { label: string; value: number }[];
  timelineSteps?: { step: string; description: string }[];
}

const LAYOUT_ICONS: Record<SlideLayout, React.ReactNode> = {
  title: <Presentation className="h-3 w-3" />,
  bullets: <Sparkles className="h-3 w-3" />,
  chart: <BarChart3 className="h-3 w-3" />,
  timeline: <Footprints className="h-3 w-3" />,
  '3d': <Box className="h-3 w-3" />,
  avatar: <User className="h-3 w-3" />,
};

const LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: 'Title',
  bullets: 'Content',
  chart: 'Chart',
  timeline: 'Journey',
  '3d': '3D Scene',
  avatar: 'Avatar',
};

// ── Provider Ribbon ──
const SLIDE_PROVIDERS: Record<SlideLayout, { providers: string[]; colors: string[] }> = {
  title: { providers: ['Gemini 2.0', 'GPT-4o'], colors: ['from-blue-500/80 to-blue-600/80', 'from-emerald-500/80 to-emerald-600/80'] },
  avatar: { providers: ['Azure Neural', 'Alibaba Wan 2.2', 'ElevenLabs'], colors: ['from-sky-500/80 to-sky-600/80', 'from-orange-500/80 to-orange-600/80', 'from-violet-500/80 to-violet-600/80'] },
  chart: { providers: ['Gemini 2.0', 'Recharts'], colors: ['from-blue-500/80 to-blue-600/80', 'from-teal-500/80 to-teal-600/80'] },
  timeline: { providers: ['Gemini 2.0', 'Claude 4'], colors: ['from-blue-500/80 to-blue-600/80', 'from-amber-500/80 to-amber-600/80'] },
  '3d': { providers: ['Meshy AI', 'Tripo3D'], colors: ['from-purple-500/80 to-purple-600/80', 'from-pink-500/80 to-pink-600/80'] },
  bullets: { providers: ['Gemini 2.0', 'DeepL'], colors: ['from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'] },
};

const ProviderRibbon: React.FC<{ layout: SlideLayout }> = ({ layout }) => {
  const config = SLIDE_PROVIDERS[layout];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex items-center gap-1.5 flex-wrap"
    >
      <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-widest">Powered by</span>
      {config.providers.map((p, i) => (
        <span key={p} className={`text-[7px] font-bold text-white/90 px-1.5 py-0.5 rounded-md bg-gradient-to-r ${config.colors[i] || 'from-muted to-muted'} shadow-sm`}>
          {p}
        </span>
      ))}
    </motion.div>
  );
};

// ── Audio Waveform Animation ──
const AudioWaveform: React.FC<{ active?: boolean }> = ({ active = true }) => (
  <div className="flex items-end gap-[2px] h-5">
    {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 1, 0.6, 0.4].map((h, i) => (
      <motion.div
        key={i}
        animate={active ? { height: [`${h * 100}%`, `${(1 - h) * 80 + 20}%`, `${h * 100}%`] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 + i * 0.1, ease: 'easeInOut' }}
        className="w-[2px] rounded-full bg-gradient-to-t from-cyan-500 to-purple-400"
        style={{ height: `${h * 100}%` }}
      />
    ))}
  </div>
);

// ── Slide Layout Renderers ──

// ── Cinematic Slide Backgrounds ──
const CinematicBG: React.FC<{ variant?: 'hero' | 'cool' | 'warm' | 'neon' | 'deep' | 'aurora' }> = ({ variant = 'hero' }) => {
  const bgs: Record<string, string> = {
    hero: 'from-[#0a0118] via-[#1a0a2e] to-[#0d001a]',
    cool: 'from-[#020617] via-[#0c1629] to-[#030712]',
    warm: 'from-[#1a0a00] via-[#1c0f05] to-[#0a0500]',
    neon: 'from-[#000a1a] via-[#0a0025] to-[#001020]',
    deep: 'from-[#0f0720] via-[#150a30] to-[#050210]',
    aurora: 'from-[#001a1a] via-[#0a1025] to-[#000d1a]',
  };
  return (
    <div className="absolute inset-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgs[variant]}`} />
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
      {/* Cinematic light beams */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03], rotate: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute -top-1/4 -right-1/4 w-full h-full"
        style={{ background: 'conic-gradient(from 220deg at 70% 30%, rgba(139,92,246,0.12), transparent 40%, rgba(59,130,246,0.08), transparent 70%)' }}
      />
    </div>
  );
};

// ── Glowing Orb component ──
const GlowOrb: React.FC<{ color: string; size: string; position: string; delay?: number }> = ({ color, size, position, delay = 0 }) => (
  <motion.div
    animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.3, 0.15] }}
    transition={{ repeat: Infinity, duration: 5 + delay, delay, ease: 'easeInOut' }}
    className={`absolute ${position} ${size} rounded-full ${color} blur-3xl pointer-events-none`}
  />
);

const TitleSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <CinematicBG variant="hero" />
    <GlowOrb color="bg-purple-500/20" size="w-48 h-48" position="top-1/4 right-1/4" />
    <GlowOrb color="bg-blue-500/15" size="w-36 h-36" position="bottom-1/3 left-1/4" delay={2} />
    <GlowOrb color="bg-pink-500/10" size="w-28 h-28" position="top-1/3 left-1/3" delay={4} />

    {/* Animated rings */}
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-purple-500/10 pointer-events-none" />
    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-blue-400/10 pointer-events-none" />

    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10">
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3.5 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-purple-500/40 border border-white/10"
      >
        <Presentation className="h-10 w-10 text-white" />
      </motion.div>
      <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 drop-shadow-lg">
        {slide.title}
      </h4>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="text-sm text-purple-200/70 max-w-md mx-auto mb-5">{slide.bullets[0]}</motion.p>
      <ProviderRibbon layout="title" />
    </motion.div>
  </div>
);

const AvatarSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex gap-4 p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <CinematicBG variant="deep" />
    <GlowOrb color="bg-violet-500/20" size="w-40 h-40" position="top-0 left-0" />
    <GlowOrb color="bg-cyan-500/10" size="w-32 h-32" position="bottom-1/4 right-1/4" delay={3} />

    {/* Avatar column */}
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-[35%] flex flex-col items-center justify-center relative z-10"
    >
      <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] shadow-inner" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-3">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute -inset-3 rounded-full border-2 border-dashed border-purple-400/20" />
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/20 blur-md"
          />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 border-2 border-white/20 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <User className="h-10 w-10 sm:h-12 sm:w-12 text-white/70" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], boxShadow: ['0 0 0 0 rgba(168,85,247,0.5)', '0 0 0 10px rgba(168,85,247,0)', '0 0 0 0 rgba(168,85,247,0)'] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          >
            <Mic className="h-3.5 w-3.5 text-white" />
          </motion.div>
        </div>
        <AudioWaveform />
        <div className="flex flex-col items-center gap-1 mt-2">
          <Badge variant="outline" className="text-[8px] gap-1 border-purple-400/30 bg-purple-500/10 text-purple-300">
            <Play className="h-2 w-2" /> AI Avatar Presenter
          </Badge>
          <span className="text-[7px] text-purple-300/50 font-medium">Azure Neural TTS • Lip-Sync</span>
        </div>
      </div>
    </motion.div>

    {/* Content */}
    <div className="flex-1 flex flex-col justify-center space-y-3 relative z-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="w-14 h-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 rounded-full mb-2" />
        <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2">
        {slide.bullets.map((b, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-purple-200/70">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex-shrink-0 shadow-sm shadow-cyan-400/40"
            />
            <span className="leading-relaxed">{b}</span>
          </motion.li>
        ))}
      </ul>
      <ProviderRibbon layout="avatar" />
    </div>
  </div>
);

const ChartSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => {
  const chartData = slide.chartData || slide.bullets.map((b) => ({ label: b.slice(0, 18), value: 30 + Math.round(Math.random() * 60) }));
  const maxVal = Math.max(...chartData.map(d => d.value));
  const CHART_COLORS = [
    'from-cyan-400 to-blue-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500',
  ];

  return (
    <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CinematicBG variant="cool" />
      <GlowOrb color="bg-blue-500/15" size="w-40 h-40" position="top-0 right-0" />
      <GlowOrb color="bg-teal-500/10" size="w-32 h-32" position="bottom-0 left-1/4" delay={2} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-start justify-between relative z-10">
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white">{slide.title}</h4>
          <p className="text-[9px] text-blue-300/50 mt-0.5">AI-generated data visualization</p>
        </div>
        <Badge variant="outline" className="text-[8px] gap-1 border-blue-400/30 bg-blue-500/10 text-blue-300">
          <BarChart3 className="h-2.5 w-2.5" /> Smart Chart
        </Badge>
      </motion.div>

      <div className="flex-1 relative rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 pt-6 z-10 backdrop-blur-sm">
        {[25, 50, 75, 100].map(v => (
          <div key={v} className="absolute left-3 right-3 border-t border-dashed border-white/[0.06]"
            style={{ bottom: `${(v / 100) * 80 + 10}%` }}>
            <span className="absolute -left-1 -top-2 text-[7px] text-blue-300/30">{v}</span>
          </div>
        ))}

        <div className="flex items-end gap-2 sm:gap-3 h-full pb-5 relative z-10">
          {chartData.slice(0, 5).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${(d.value / maxVal) * 85}%`, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-t-xl bg-gradient-to-t ${CHART_COLORS[i]} relative shadow-lg shadow-blue-500/10 min-h-[12px]`}
              >
                <div className="absolute top-0 left-0 right-0 h-2 rounded-t-xl bg-gradient-to-t from-transparent to-white/20" />
                {/* Glow on bar */}
                <div className={`absolute inset-0 rounded-t-xl bg-gradient-to-t ${CHART_COLORS[i]} blur-md opacity-30`} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                >
                  <span className="text-[10px] font-black text-white bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/10 shadow-sm">
                    {d.value}%
                  </span>
                </motion.div>
              </motion.div>
              <span className="text-[7px] sm:text-[8px] text-blue-200/50 text-center leading-tight line-clamp-2 font-medium mt-1">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 relative z-10"><ProviderRibbon layout="chart" /></div>
    </div>
  );
};

const TimelineSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => {
  const steps = slide.timelineSteps || slide.bullets.map((b, i) => ({ step: `Step ${i + 1}`, description: b }));
  const STEP_COLORS = ['from-cyan-400 to-blue-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500'];
  const STEP_GLOWS = ['shadow-cyan-500/30', 'shadow-emerald-500/30', 'shadow-amber-500/30', 'shadow-rose-500/30'];

  return (
    <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CinematicBG variant="aurora" />
      <GlowOrb color="bg-teal-500/15" size="w-44 h-44" position="top-1/4 right-0" />
      <GlowOrb color="bg-blue-500/10" size="w-32 h-32" position="bottom-0 left-1/3" delay={2} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start justify-between relative z-10">
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white">{slide.title}</h4>
          <p className="text-[9px] text-teal-300/50 mt-0.5">Journey workflow</p>
        </div>
        <Badge variant="outline" className="text-[8px] gap-1 border-teal-400/30 bg-teal-500/10 text-teal-300">
          <Footprints className="h-2.5 w-2.5" /> Journey Map
        </Badge>
      </motion.div>

      <div className="flex-1 flex items-center relative z-10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="absolute top-[40px] left-[10%] right-[10%] h-[2px] origin-left overflow-hidden"
        >
          <div className="w-full h-full bg-gradient-to-r from-cyan-500/30 via-teal-500/40 to-cyan-500/30" />
          {/* Animated pulse traveling along the line */}
          <motion.div
            animate={{ x: ['-100%', '300%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          />
        </motion.div>

        <div className="w-full flex items-start gap-1 relative z-10">
          {steps.slice(0, 4).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${STEP_COLORS[i]}`}
                  />
                  <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${STEP_COLORS[i]} flex items-center justify-center text-sm font-black text-white shadow-xl ${STEP_GLOWS[i]}`}>
                    {i + 1}
                  </div>
                </div>
                <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-lg p-2 w-full max-w-[110px] shadow-sm">
                  <p className="text-[9px] sm:text-[10px] font-bold text-white/90 leading-tight">{s.step}</p>
                  <p className="text-[7px] sm:text-[8px] text-white/40 mt-0.5 leading-snug line-clamp-3">{s.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-1 relative z-10"><ProviderRibbon layout="timeline" /></div>
    </div>
  );
};

const ThreeDSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex gap-4 p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <CinematicBG variant="neon" />
    <GlowOrb color="bg-purple-500/20" size="w-44 h-44" position="top-0 left-1/4" />
    <GlowOrb color="bg-pink-500/15" size="w-36 h-36" position="bottom-1/4 right-1/4" delay={2} />

    {/* 3D scene */}
    <div className="w-[45%] flex items-center justify-center relative z-10">
      {/* Reflective floor */}
      <div className="absolute bottom-4 left-4 right-4 h-16 bg-gradient-to-t from-purple-500/10 to-transparent rounded-b-2xl blur-sm" />

      <motion.div
        animate={{ rotateY: [0, 15, -15, 0], rotateX: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="relative w-36 h-36 sm:w-44 sm:h-44"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      >
        {/* Outer glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/15 rounded-3xl blur-xl"
        />
        {/* Outer shell */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl border border-white/[0.1] backdrop-blur-md shadow-2xl shadow-purple-500/20" />
        {/* Inner element */}
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-6 bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-pink-500/15 rounded-xl border border-white/10 flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <motion.div animate={{ scale: [0.9, 1.1, 0.9], rotateZ: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}>
            <Box className="h-12 w-12 text-purple-300/60 mb-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          </motion.div>
          <span className="text-[8px] font-bold text-purple-300/70">3D Model</span>
          {/* Particle sparkles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [-20, -40], x: [-5 + i * 8, -10 + i * 10], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.4 }}
              className="absolute w-1 h-1 rounded-full bg-purple-400/60"
              style={{ top: '40%', left: `${30 + i * 12}%` }}
            />
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="absolute -bottom-3 left-0 right-0 text-center">
          <Badge variant="outline" className="text-[7px] gap-0.5 border-purple-400/30 bg-purple-500/10 text-purple-300">
            <Box className="h-2 w-2" /> Meshy AI • Interactive 3D
          </Badge>
        </motion.div>
      </motion.div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col justify-center space-y-3 relative z-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h4 className="text-lg sm:text-xl font-bold text-white">{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2">
        {slide.bullets.map((b, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
            className="flex items-start gap-2 text-xs sm:text-sm text-purple-200/60">
            <span className="mt-1.5 w-2 h-2 rounded-sm bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 shadow-sm shadow-purple-400/30" />
            <span className="leading-relaxed">{b}</span>
          </motion.li>
        ))}
      </ul>
      <ProviderRibbon layout="3d" />
    </div>
  </div>
);

const BulletsSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <CinematicBG variant="warm" />
    <GlowOrb color="bg-amber-500/10" size="w-36 h-36" position="top-1/4 right-1/4" delay={1} />
    <GlowOrb color="bg-orange-500/10" size="w-28 h-28" position="bottom-1/3 left-1/4" delay={3} />

    <div className="my-auto space-y-4 relative z-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-14 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-full" />
          <div className="w-4 h-1.5 bg-amber-400/30 rounded-full" />
        </div>
        <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight">{slide.title}</h4>
      </motion.div>
      <ul className="space-y-3 max-w-lg">
        {slide.bullets.map((bullet, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3 text-sm text-amber-100/60 group"
          >
            <span className="mt-1 flex-shrink-0 relative">
              <span className="block w-3 h-3 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30 group-hover:scale-110 transition-transform" />
              <span className="absolute inset-0 w-3 h-3 rounded-md bg-amber-400/20 animate-ping" style={{ animationDuration: `${3 + i}s` }} />
            </span>
            <span className="leading-relaxed">{bullet}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-3"><ProviderRibbon layout="bullets" /></div>
    </div>
  </div>
);

// ── Main Component ──

export const DeckDemoCard: React.FC<DeckDemoCardProps> = ({ industryId, region }) => {
  const example = getIndustryExample(industryId);
  const deckExample = example?.pipelines.deck;
  const templates = getDemoTemplates(industryId, 'deck');

  const [selectedLang, setSelectedLang] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<GeneratedSlide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  useEffect(() => {
    setCustomPrompt('');
    setSlides(null);
    setError(null);
    setSelectedTemplateId(undefined);
  }, [industryId]);

  if (!deckExample) return null;

  const effectivePrompt = customPrompt.trim() || deckExample.prompt;

  const handleTemplateSelect = (tpl: DemoTemplate) => {
    setSelectedTemplateId(tpl.id);
    setCustomPrompt(tpl.prompt);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSlides(null);

    const langName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
    const slideCount = deckExample.slideCount;
    
    const prompt = `You are a professional presentation designer creating a visually rich, multi-layout deck.

Topic/Brief: "${effectivePrompt}"
Industry: ${example?.industryName}
Target Audience: ${deckExample.audience}
Language: ${langName}
Total Slides: ${slideCount}

Create ${slideCount} slides. Each slide MUST have a different layoutType to create visual variety:
- "title" — Opening/closing cinematic title slide (use for slide 1)
- "avatar" — Slide presented by an AI avatar narrator
- "chart" — Data visualization slide with chartData array
- "timeline" — Journey/process with timelineSteps
- "3d" — 3D interactive product/concept showcase
- "bullets" — Standard content slide

For EACH slide provide:
- slideNumber (1-${slideCount})
- layoutType (one of: title, avatar, chart, timeline, 3d, bullets — vary them!)
- title (concise, impactful)
- bullets (3-4 key points)
- speakerNotes (1-2 sentences)
- If layoutType is "chart": add chartData: [{ "label": "...", "value": <number 10-100> }] with 4-5 items
- If layoutType is "timeline": add timelineSteps: [{ "step": "Step Name", "description": "..." }] with 3-4 items

IMPORTANT: Use AT LEAST 3 different layoutTypes across the deck. Slide 1 should be "title". Include at least one "chart" or "timeline" and one "avatar" or "3d".

${selectedLang !== 'en' ? `CRITICAL: Generate ALL content in ${langName}. Transcreate culturally — don't just translate.` : ''}

Respond in valid JSON: { "slides": [{ "slideNumber": 1, "layoutType": "title", "title": "...", "bullets": ["..."], "speakerNotes": "...", "chartData": [...], "timelineSteps": [...] }] }`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt,
          systemPrompt: 'You are a professional presentation designer. Always respond with valid JSON only, no markdown code fences. Use diverse slide layouts.',
          temperature: 0.7,
          maxTokens: 3000,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Generation failed');

      const responseText = data?.generatedText || data?.content || data?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const rawSlides = (parsed.slides || []) as GeneratedSlide[];
        // Ensure valid layoutType
        const validLayouts: SlideLayout[] = ['title', 'bullets', 'chart', 'timeline', '3d', 'avatar'];
        const sanitized = rawSlides.map(s => ({
          ...s,
          layoutType: validLayouts.includes(s.layoutType) ? s.layoutType : 'bullets',
        }));
        setSlides(sanitized);
        setActiveSlide(0);
      } else {
        throw new Error('Could not parse slide data');
      }
    } catch (err: any) {
      const msg = err?.message || 'Generation failed';
      if (msg.includes('429') || msg.includes('rate') || msg.toLowerCase().includes('limit')) {
        setError('Demo limit reached — each visitor gets limited free tries per minute. Please wait a moment.');
      } else {
        setError(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedLangName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';

  const renderSlideContent = (slide: GeneratedSlide) => {
    switch (slide.layoutType) {
      case 'title': return <TitleSlideLayout slide={slide} lang={selectedLang} />;
      case 'avatar': return <AvatarSlideLayout slide={slide} lang={selectedLang} />;
      case 'chart': return <ChartSlideLayout slide={slide} lang={selectedLang} />;
      case 'timeline': return <TimelineSlideLayout slide={slide} lang={selectedLang} />;
      case '3d': return <ThreeDSlideLayout slide={slide} lang={selectedLang} />;
      default: return <BulletsSlideLayout slide={slide} lang={selectedLang} />;
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Presentation className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground">AI Deck Generator</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              {deckExample.title} — {deckExample.slideCount} slides
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
            <Sparkles className="h-3 w-3" /> Genie Deck
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Template Picker */}
        <DemoTemplatePicker
          templates={templates}
          onSelect={handleTemplateSelect}
          selectedId={selectedTemplateId}
          pipelineLabel="Deck"
        />

        {/* Editable prompt area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            📋 Your Prompt
            <span className="text-[10px] font-normal normal-case text-muted-foreground/70">
              (select a template above or write your own)
            </span>
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => { setCustomPrompt(e.target.value); setSelectedTemplateId(undefined); }}
            placeholder={deckExample.prompt}
            className="min-h-[70px] text-sm bg-muted/30 border-border resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">🎯 {deckExample.audience}</Badge>
            <Badge variant="outline" className="text-[10px]">📊 {deckExample.slideCount} slides</Badge>
            {customPrompt.trim() && (
              <button
                onClick={() => { setCustomPrompt(''); setSelectedTemplateId(undefined); }}
                className="text-[10px] text-primary hover:underline ml-auto"
              >
                Reset to example
              </button>
            )}
          </div>
        </div>

        {/* Language + generate */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
              Generate in Language
            </label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Generating...' : 'Generate Deck'}
          </Button>
        </div>

        {/* Pipeline indicator with feature badges */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium text-[11px]">
            {selectedTemplateId ? '📋 Template' : '✍️ Prompt'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium text-[11px]">
            {selectedLang !== 'en' ? '🌍 Transcreation' : '🤖 AI Generation'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium text-[11px]">📊 Rich Deck</span>
        </div>

        {/* Feature badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { icon: <User className="h-2.5 w-2.5" />, label: 'Avatar' },
            { icon: <BarChart3 className="h-2.5 w-2.5" />, label: 'Charts' },
            { icon: <Box className="h-2.5 w-2.5" />, label: '3D Scenes' },
            { icon: <Footprints className="h-2.5 w-2.5" />, label: 'Journeys' },
            { icon: <Mic className="h-2.5 w-2.5" />, label: 'TTS Narration' },
          ].map(f => (
            <Badge key={f.label} variant="outline" className="text-[9px] gap-1 border-primary/20 bg-primary/5 text-primary">
              {f.icon} {f.label}
            </Badge>
          ))}
        </div>

        {/* Loading state */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-primary/20"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Presentation className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
              >
                <Loader2 className="h-3.5 w-3.5 text-accent-foreground" />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Generating rich deck in {selectedLangName}...
              </p>
              <p className="text-xs text-muted-foreground">
                Avatar • Charts • 3D • Timeline • {deckExample.slideCount} slides
              </p>
              {/* Provider chain animation */}
              <div className="flex items-center justify-center gap-1 pt-1">
                {['Gemini 2.0', 'Azure Neural', 'Meshy AI', 'DeepL'].map((p, i) => (
                  <motion.span
                    key={p}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                    transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity }}
                    className="text-[8px] font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded"
                  >
                    {p}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Generated slides — cinematic multi-layout preview */}
        <AnimatePresence mode="wait">
          {slides && slides.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Slide navigation with layout icons */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {slides.map((slide, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
                      activeSlide === idx
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {LAYOUT_ICONS[slide.layoutType]}
                    <span>{LAYOUT_LABELS[slide.layoutType]}</span>
                  </motion.button>
                ))}
              </div>

              {/* Main slide canvas */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl overflow-hidden border border-border/80 shadow-2xl shadow-primary/15"
                  style={{ aspectRatio: '16/9' }}
                >
                  {/* Dark cinematic base — each slide layout has its own CinematicBG */}
                  <div className="absolute inset-0 bg-[#0a0118]" />

                  {/* Accent bar with shimmer */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 overflow-hidden z-20">
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    />
                  </div>

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="rotate-[-20deg] opacity-[0.04]">
                      <p className="text-5xl sm:text-7xl font-black text-white tracking-[0.3em]">PREVIEW</p>
                    </div>
                  </div>

                  {/* Top bar */}
                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-[15]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Presentation className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[9px] font-bold text-white/40 tracking-wider uppercase">Genie Deck</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[8px] gap-0.5 border-white/10 bg-white/5 text-white/70 h-5">
                        {LAYOUT_ICONS[slides[activeSlide].layoutType]}
                        {LAYOUT_LABELS[slides[activeSlide].layoutType]}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] gap-0.5 border-white/10 bg-white/5 text-white/70 h-5">
                        <Globe className="h-2 w-2" /> {selectedLangName}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] border-white/10 bg-white/5 text-white/70 h-5">
                        {slides[activeSlide].slideNumber}/{slides.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Slide content — layout-specific */}
                  <div className="relative z-[5] h-full pt-10">
                    {renderSlideContent(slides[activeSlide])}
                  </div>

                  {/* Speaker notes footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 px-5 py-2 bg-black/60 backdrop-blur-md border-t border-white/[0.06] z-[5]"
                  >
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Speaker Notes</p>
                    <p className="text-[10px] text-white/40 italic line-clamp-1">{slides[activeSlide].speakerNotes}</p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={activeSlide === 0}
                  onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                  className="rounded-full h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <span className="text-xs text-muted-foreground font-medium">
                  {activeSlide + 1} of {slides.length}
                </span>
                <Button variant="outline" size="sm" disabled={activeSlide === slides.length - 1}
                  onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                  className="rounded-full h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-xl border border-primary/20"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Lock className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="text-xs text-muted-foreground flex-1">
                  <strong className="text-foreground">Unlock the full experience.</strong> Custom branding, real avatars, interactive 3D, PPTX/PDF export & 140+ languages.
                </p>
                <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs shrink-0">
                  Sign Up
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Sign up for unlimited access ✨</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeckDemoCard;
