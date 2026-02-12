/**
 * Deck Demo Card — Rich AI presentation generator with diverse slide layouts
 * 
 * Slide types: title+avatar, chart, timeline/journey, 3D scene, standard bullets
 * Each layout has unique animations, gradients, and visual elements.
 */

import React, { useState, useEffect } from 'react';
import { 
  Presentation, Loader2, Sparkles, Globe, Lock, ChevronRight, 
  BarChart3, Users, Box, Footprints, User, Mic, Play, Volume2
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
import { getRegionalConfig, DEMO_LANGUAGE_OPTIONS, isRTLLanguage, toLangBCP47, type RegionalProviderConfig } from './regionalDemoRouting';

interface DeckDemoCardProps {
  industryId: string;
  region?: string;
}

const LANGUAGE_OPTIONS = DEMO_LANGUAGE_OPTIONS;

type SlideLayout = 'title' | 'bullets' | 'chart' | 'timeline' | '3d' | 'avatar';

interface GeneratedSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  narration: string;
  layoutType: SlideLayout;
  imagePrompt?: string;
  chartData?: { label: string; value: number }[];
  timelineSteps?: { step: string; description: string }[];
}

// ── Industry Color Palettes ──
interface IndustryPalette {
  primary: string;      // Main gradient start
  secondary: string;    // Main gradient end
  accent: string;       // Accent color
  titleBg: string;      // Title slide dark bg
  chartBg: string;      // Chart slide - lighter
  bulletBg: string;     // Bullet slide bg
  glow1: string;        // Glow orb 1
  glow2: string;        // Glow orb 2
  barColors: string[];  // Chart bar gradients
  text: string;         // Primary text on dark
  textMuted: string;    // Secondary text
}

const INDUSTRY_PALETTES: Record<string, IndustryPalette> = {
  healthcare: {
    primary: 'from-teal-500 to-cyan-500', secondary: 'from-teal-600 to-emerald-500', accent: 'from-cyan-400 to-teal-400',
    titleBg: 'from-[#011a1a] via-[#0a2525] to-[#001515]', chartBg: 'from-[#f0fdf9] via-[#f5fffe] to-[#ecfdf5]',
    bulletBg: 'from-[#021c1c] via-[#0c2828] to-[#001212]',
    glow1: 'bg-teal-500/20', glow2: 'bg-cyan-500/15',
    barColors: ['from-teal-400 to-cyan-500', 'from-emerald-400 to-teal-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500', 'from-teal-300 to-teal-500'],
    text: 'text-teal-50', textMuted: 'text-teal-200/60',
  },
  education: {
    primary: 'from-indigo-500 to-blue-500', secondary: 'from-indigo-600 to-violet-500', accent: 'from-blue-400 to-indigo-400',
    titleBg: 'from-[#0a0a2e] via-[#111140] to-[#050520]', chartBg: 'from-[#eef2ff] via-[#f5f7ff] to-[#e8ecff]',
    bulletBg: 'from-[#0c0c30] via-[#141450] to-[#060618]',
    glow1: 'bg-indigo-500/20', glow2: 'bg-blue-500/15',
    barColors: ['from-indigo-400 to-blue-500', 'from-violet-400 to-indigo-500', 'from-blue-400 to-cyan-500', 'from-purple-400 to-indigo-500', 'from-indigo-300 to-indigo-500'],
    text: 'text-indigo-50', textMuted: 'text-indigo-200/60',
  },
  finance: {
    primary: 'from-amber-500 to-yellow-500', secondary: 'from-amber-600 to-orange-500', accent: 'from-yellow-400 to-amber-400',
    titleBg: 'from-[#1a1400] via-[#251c05] to-[#0f0a00]', chartBg: 'from-[#fffbeb] via-[#fefce8] to-[#fef9c3]',
    bulletBg: 'from-[#1c1600] via-[#2a2008] to-[#0d0800]',
    glow1: 'bg-amber-500/20', glow2: 'bg-yellow-500/15',
    barColors: ['from-amber-400 to-yellow-500', 'from-orange-400 to-amber-500', 'from-yellow-400 to-lime-500', 'from-amber-300 to-orange-500', 'from-yellow-300 to-amber-500'],
    text: 'text-amber-50', textMuted: 'text-amber-200/60',
  },
  technology: {
    primary: 'from-violet-500 to-purple-500', secondary: 'from-purple-600 to-pink-500', accent: 'from-violet-400 to-fuchsia-400',
    titleBg: 'from-[#0a0118] via-[#1a0a2e] to-[#0d001a]', chartBg: 'from-[#faf5ff] via-[#f5f0ff] to-[#ede9fe]',
    bulletBg: 'from-[#0c0320] via-[#1c0c35] to-[#08001a]',
    glow1: 'bg-violet-500/20', glow2: 'bg-purple-500/15',
    barColors: ['from-violet-400 to-purple-500', 'from-fuchsia-400 to-pink-500', 'from-purple-400 to-indigo-500', 'from-pink-400 to-rose-500', 'from-violet-300 to-violet-500'],
    text: 'text-violet-50', textMuted: 'text-violet-200/60',
  },
  default: {
    primary: 'from-blue-500 to-cyan-500', secondary: 'from-blue-600 to-indigo-500', accent: 'from-cyan-400 to-blue-400',
    titleBg: 'from-[#020617] via-[#0c1629] to-[#030712]', chartBg: 'from-[#eff6ff] via-[#f0f9ff] to-[#e0f2fe]',
    bulletBg: 'from-[#040820] via-[#0e1835] to-[#02050f]',
    glow1: 'bg-blue-500/20', glow2: 'bg-cyan-500/15',
    barColors: ['from-blue-400 to-cyan-500', 'from-sky-400 to-blue-500', 'from-cyan-400 to-teal-500', 'from-indigo-400 to-blue-500', 'from-blue-300 to-blue-500'],
    text: 'text-blue-50', textMuted: 'text-blue-200/60',
  },
};

const getIndustryPalette = (industryId: string): IndustryPalette => {
  const directMatch = INDUSTRY_PALETTES[industryId];
  if (directMatch) return directMatch;
  // Map related industries
  if (['pharma', 'biotech', 'medical-devices'].includes(industryId)) return INDUSTRY_PALETTES.healthcare;
  if (['edtech', 'training', 'academic'].includes(industryId)) return INDUSTRY_PALETTES.education;
  if (['banking', 'insurance', 'fintech', 'investment'].includes(industryId)) return INDUSTRY_PALETTES.finance;
  if (['saas', 'ai', 'cybersecurity', 'cloud', 'enterprise-tech'].includes(industryId)) return INDUSTRY_PALETTES.technology;
  return INDUSTRY_PALETTES.default;
};

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
  title: { providers: ['Gemini 3 Pro', 'Alibaba Qwen'], colors: ['from-blue-500/80 to-blue-600/80', 'from-orange-500/80 to-orange-600/80'] },
  avatar: { providers: ['Azure Neural', 'Alibaba Wan 2.2', 'ElevenLabs'], colors: ['from-sky-500/80 to-sky-600/80', 'from-orange-500/80 to-orange-600/80', 'from-violet-500/80 to-violet-600/80'] },
  chart: { providers: ['Gemini 3 Pro', 'Recharts'], colors: ['from-blue-500/80 to-blue-600/80', 'from-teal-500/80 to-teal-600/80'] },
  timeline: { providers: ['Claude 4', 'DeepSeek'], colors: ['from-amber-500/80 to-amber-600/80', 'from-green-500/80 to-green-600/80'] },
  '3d': { providers: ['Meshy AI', 'ModelsLab'], colors: ['from-purple-500/80 to-purple-600/80', 'from-pink-500/80 to-pink-600/80'] },
  bullets: { providers: ['Gemini 3 Pro', 'DeepL'], colors: ['from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'] },
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
const CinematicBG: React.FC<{ bg: string }> = ({ bg }) => (
  <div className="absolute inset-0">
    <div className={`absolute inset-0 bg-gradient-to-br ${bg}`} />
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
    <motion.div
      animate={{ opacity: [0.03, 0.08, 0.03], rotate: [0, 2, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      className="absolute -top-1/4 -right-1/4 w-full h-full"
      style={{ background: 'conic-gradient(from 220deg at 70% 30%, rgba(255,255,255,0.06), transparent 40%, rgba(255,255,255,0.04), transparent 70%)' }}
    />
  </div>
);

// ── Light chart background ──
const LightChartBG: React.FC<{ bg: string }> = ({ bg }) => (
  <div className="absolute inset-0">
    <div className={`absolute inset-0 bg-gradient-to-br ${bg}`} />
    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, #00000008 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
  </div>
);

const GlowOrb: React.FC<{ color: string; size: string; position: string; delay?: number }> = ({ color, size, position, delay = 0 }) => (
  <motion.div
    animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.3, 0.15] }}
    transition={{ repeat: Infinity, duration: 5 + delay, delay, ease: 'easeInOut' }}
    className={`absolute ${position} ${size} rounded-full ${color} blur-3xl pointer-events-none`}
  />
);

interface SlideLayoutProps { slide: GeneratedSlide; lang: string; palette: IndustryPalette; imageUrl?: string; }

const TitleSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette, imageUrl }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative" dir={isRTLLanguage(lang) ? 'rtl' : 'ltr'}>
    <CinematicBG bg={palette.titleBg} />
    
    {/* AI-generated background image */}
    {imageUrl && (
      <div className="absolute inset-0 z-[1]">
        <img src={imageUrl} alt="AI generated visual" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      </div>
    )}
    
    {!imageUrl && (
      <>
        <GlowOrb color={palette.glow1} size="w-48 h-48" position="top-1/4 right-1/4" />
        <GlowOrb color={palette.glow2} size="w-36 h-36" position="bottom-1/3 left-1/4" delay={2} />
      </>
    )}

    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-white/[0.06] pointer-events-none" />

    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10">
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3.5 }}
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${palette.primary} flex items-center justify-center mb-6 mx-auto shadow-2xl border border-white/10`}
      >
        <Presentation className="h-10 w-10 text-white" />
      </motion.div>
      <h4 className={`text-2xl sm:text-3xl lg:text-4xl font-black ${palette.text} leading-tight mb-3 drop-shadow-lg`}>
        {slide.title}
      </h4>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className={`text-sm ${palette.textMuted} max-w-md mx-auto mb-5`}>{slide.bullets[0]}</motion.p>
      <ProviderRibbon layout="title" />
    </motion.div>
  </div>
);

const AvatarSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette }) => (
  <div className="h-full flex gap-4 p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <CinematicBG bg={palette.bulletBg} />
    <GlowOrb color={palette.glow1} size="w-40 h-40" position="top-0 left-0" />
    <GlowOrb color={palette.glow2} size="w-32 h-32" position="bottom-1/4 right-1/4" delay={3} />

    <motion.div
      initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-[35%] flex flex-col items-center justify-center relative z-10"
    >
      <div className="absolute inset-2 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-3">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute -inset-3 rounded-full border-2 border-dashed border-white/10" />
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute -inset-1 rounded-full bg-gradient-to-br ${palette.primary} opacity-30 blur-md`} />
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${palette.primary} border-2 border-white/20 flex items-center justify-center shadow-2xl`}>
            <User className="h-10 w-10 sm:h-12 sm:w-12 text-white/70" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${palette.accent} flex items-center justify-center shadow-lg`}
          >
            <Mic className="h-3.5 w-3.5 text-white" />
          </motion.div>
        </div>
        <AudioWaveform />
        <Badge variant="outline" className="text-[8px] gap-1 border-white/10 bg-white/5 text-white/70 mt-2">
          <Play className="h-2 w-2" /> AI Avatar • Azure Neural TTS
        </Badge>
      </div>
    </motion.div>

    <div className="flex-1 flex flex-col justify-center space-y-3 relative z-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className={`w-14 h-1 bg-gradient-to-r ${palette.primary} rounded-full mb-2`} />
        <h4 className={`text-lg sm:text-xl font-bold ${palette.text} leading-tight`}>{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2">
        {slide.bullets.map((b, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.1 }}
            className={`flex items-start gap-2.5 text-xs sm:text-sm ${palette.textMuted}`}>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-br ${palette.accent} flex-shrink-0`} />
            <span className="leading-relaxed">{b}</span>
          </motion.li>
        ))}
      </ul>
      {/* Narration preview */}
      {slide.narration && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider mb-0.5">🎙 Narration Script</p>
          <p className="text-[10px] text-white/50 italic line-clamp-2">{slide.narration}</p>
        </motion.div>
      )}
      <ProviderRibbon layout="avatar" />
    </div>
  </div>
);

const ChartSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette }) => {
  const chartData = slide.chartData || slide.bullets.map((b) => ({ label: b.slice(0, 18), value: 30 + Math.round(Math.random() * 60) }));
  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* LIGHT background for chart readability */}
      <LightChartBG bg={palette.chartBg} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-start justify-between relative z-10">
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-slate-800">{slide.title}</h4>
          <p className="text-[9px] text-slate-500 mt-0.5">AI-generated data visualization</p>
        </div>
        <Badge variant="outline" className="text-[8px] gap-1 border-slate-300 bg-white/80 text-slate-600">
          <BarChart3 className="h-2.5 w-2.5" /> Smart Chart
        </Badge>
      </motion.div>

      <div className="flex-1 relative rounded-xl bg-white/60 border border-slate-200/60 p-3 pt-6 z-10 backdrop-blur-sm shadow-inner">
        {[25, 50, 75, 100].map(v => (
          <div key={v} className="absolute left-3 right-3 border-t border-dashed border-slate-200/60"
            style={{ bottom: `${(v / 100) * 80 + 10}%` }}>
            <span className="absolute -left-1 -top-2 text-[7px] text-slate-400">{v}</span>
          </div>
        ))}

        <div className="flex items-end gap-2 sm:gap-3 h-full pb-5 relative z-10">
          {chartData.slice(0, 5).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${(d.value / maxVal) * 85}%`, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-t-xl bg-gradient-to-t ${palette.barColors[i] || palette.barColors[0]} relative shadow-lg min-h-[12px]`}
              >
                <div className="absolute top-0 left-0 right-0 h-2 rounded-t-xl bg-gradient-to-t from-transparent to-white/30" />
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.15 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-black text-slate-700 bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
                    {d.value}%
                  </span>
                </motion.div>
              </motion.div>
              <span className="text-[7px] sm:text-[8px] text-slate-500 text-center leading-tight line-clamp-2 font-medium mt-1">
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

const TimelineSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette }) => {
  const steps = slide.timelineSteps || slide.bullets.map((b, i) => ({ step: `Step ${i + 1}`, description: b }));
  const STEP_COLORS = palette.barColors.slice(0, 4);

  return (
    <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CinematicBG bg={palette.titleBg} />
      <GlowOrb color={palette.glow1} size="w-44 h-44" position="top-1/4 right-0" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start justify-between relative z-10">
        <div>
          <h4 className={`text-lg sm:text-xl font-bold ${palette.text}`}>{slide.title}</h4>
          <p className={`text-[9px] ${palette.textMuted} mt-0.5`}>Journey workflow</p>
        </div>
        <Badge variant="outline" className="text-[8px] gap-1 border-white/10 bg-white/5 text-white/70">
          <Footprints className="h-2.5 w-2.5" /> Journey Map
        </Badge>
      </motion.div>

      <div className="flex-1 flex items-center relative z-10">
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="absolute top-[40px] left-[10%] right-[10%] h-[2px] origin-left overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-r ${palette.primary} opacity-30`} />
          <motion.div animate={{ x: ['-100%', '300%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </motion.div>

        <div className="w-full flex items-start gap-1 relative z-10">
          {steps.slice(0, 4).map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${STEP_COLORS[i] || STEP_COLORS[0]}`} />
                  <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${STEP_COLORS[i] || STEP_COLORS[0]} flex items-center justify-center text-sm font-black text-white shadow-xl`}>
                    {i + 1}
                  </div>
                </div>
                <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-lg p-2 w-full max-w-[110px]">
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

const ThreeDSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette, imageUrl }) => (
  <div className="h-full flex gap-4 p-5 sm:p-7 relative" dir={isRTLLanguage(lang) ? 'rtl' : 'ltr'}>
    <CinematicBG bg={palette.titleBg} />
    <GlowOrb color={palette.glow1} size="w-44 h-44" position="top-0 left-1/4" />
    <GlowOrb color={palette.glow2} size="w-36 h-36" position="bottom-1/4 right-1/4" delay={2} />

    <div className="w-[45%] flex items-center justify-center relative z-10">
      {imageUrl ? (
        <motion.div
          animate={{ rotateY: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ perspective: 1200 }}
        >
          <img src={imageUrl} alt="AI generated 3D visual" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="absolute bottom-2 left-0 right-0 text-center">
            <Badge variant="outline" className="text-[7px] gap-0.5 border-white/10 bg-black/50 text-white/80">
              <Box className="h-2 w-2" /> AI Generated • Meshy AI
            </Badge>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <div className={`absolute bottom-4 left-4 right-4 h-16 bg-gradient-to-t ${palette.primary} opacity-10 rounded-b-2xl blur-sm`} />
          <motion.div
            animate={{ rotateY: [0, 15, -15, 0], rotateX: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="relative w-36 h-36 sm:w-44 sm:h-44"
            style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-white/[0.06] rounded-2xl border border-white/[0.1] backdrop-blur-md shadow-2xl" />
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4 }}
              className={`absolute inset-6 bg-gradient-to-br ${palette.primary} opacity-20 rounded-xl border border-white/10 flex flex-col items-center justify-center`}>
              <Box className="h-12 w-12 text-white/40 mb-1" />
              <span className="text-[8px] font-bold text-white/50">3D Model</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="absolute -bottom-3 left-0 right-0 text-center">
              <Badge variant="outline" className="text-[7px] gap-0.5 border-white/10 bg-white/5 text-white/60">
                <Box className="h-2 w-2" /> Meshy AI • Interactive 3D
              </Badge>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>

    <div className="flex-1 flex flex-col justify-center space-y-3 relative z-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h4 className={`text-lg sm:text-xl font-bold ${palette.text}`}>{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2">
        {slide.bullets.map((b, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
            className={`flex items-start gap-2 text-xs sm:text-sm ${palette.textMuted}`}>
            <span className={`mt-1.5 w-2 h-2 rounded-sm bg-gradient-to-br ${palette.accent} flex-shrink-0`} />
            <span className="leading-relaxed">{b}</span>
          </motion.li>
        ))}
      </ul>
      <ProviderRibbon layout="3d" />
    </div>
  </div>
);

const BulletsSlideLayout: React.FC<SlideLayoutProps> = ({ slide, lang, palette, imageUrl }) => (
  <div className="h-full flex flex-col p-5 sm:p-7 relative" dir={isRTLLanguage(lang) ? 'rtl' : 'ltr'}>
    <CinematicBG bg={palette.bulletBg} />
    <GlowOrb color={palette.glow1} size="w-36 h-36" position="top-1/4 right-1/4" delay={1} />

    <div className="my-auto space-y-4 relative z-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-14 h-1.5 bg-gradient-to-r ${palette.primary} rounded-full`} />
          <div className={`w-4 h-1.5 bg-gradient-to-r ${palette.accent} opacity-30 rounded-full`} />
        </div>
        <h4 className={`text-xl sm:text-2xl font-bold ${palette.text} leading-tight`}>{slide.title}</h4>
      </motion.div>
      <ul className="space-y-3 max-w-lg">
        {slide.bullets.map((bullet, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`flex items-start gap-3 text-sm ${palette.textMuted} group`}
          >
            <span className="mt-1 flex-shrink-0 relative">
              <span className={`block w-3 h-3 rounded-md bg-gradient-to-br ${palette.primary} shadow-sm group-hover:scale-110 transition-transform`} />
              <span className={`absolute inset-0 w-3 h-3 rounded-md bg-gradient-to-br ${palette.primary} opacity-20 animate-ping`} style={{ animationDuration: `${3 + i}s` }} />
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
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});

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
    const regionalConfig = getRegionalConfig(region, selectedLang);

    const prompt = `You are a world-class ${example?.industryName || ''} industry presentation designer. Create content that is deeply relevant, data-driven, and uses real-world metrics for this industry.

CONTEXT:
- Topic: "${effectivePrompt}"
- Industry: ${example?.industryName} (use real industry terminology, frameworks, KPIs, and benchmarks)
- Audience: ${deckExample.audience}
- Language: ${langName}
- Slides: ${slideCount}
- AI Provider Zone: ${regionalConfig.llmProvider} (${regionalConfig.llmModel})

CRITICAL CONTENT RULES:
1. Every slide MUST be deeply relevant to "${effectivePrompt}" — no generic filler
2. Use REAL industry metrics, statistics, and benchmarks (e.g., "78% patient adherence improvement" for healthcare, "3.2x ROI" for finance)
3. Chart data must reflect realistic ${example?.industryName} metrics with proper labels
4. Timeline steps must reflect actual ${example?.industryName} workflows and processes
5. Speaker notes should be full narration scripts (2-3 sentences), not just headings
6. The "narration" field must contain a complete voiceover script for TTS (3-4 sentences covering all slide content)
7. For each slide, provide an "imagePrompt" field with a vivid, Pixar-quality visual description for AI image generation

LAYOUT VARIETY (use these layoutTypes — at least 4 different ones):
- "title" — Cinematic opening with hero image (slide 1). imagePrompt: describe a stunning, Pixar-quality hero visual
- "avatar" — AI avatar narrator presenting key insights. imagePrompt: describe the avatar scene
- "chart" — Data visualization with chartData: [{ "label": "specific metric name", "value": 10-100 }] (4-5 items with REAL labels)
- "timeline" — Process/journey with timelineSteps: [{ "step": "Phase Name", "description": "specific detail" }] (3-4 steps)
- "3d" — 3D product/concept showcase. imagePrompt: describe the 3D scene composition
- "bullets" — Rich content with actionable insights. imagePrompt: describe an illustration for this content

${selectedLang !== 'en' ? `TRANSCREATION: Generate ALL content natively in ${langName}. Adapt culturally — use local idioms, references, metrics standards, and cultural context. Do NOT translate English content.` : ''}

Respond ONLY in valid JSON (no markdown): { "slides": [{ "slideNumber": 1, "layoutType": "title", "title": "...", "bullets": ["..."], "speakerNotes": "full narration...", "narration": "Complete TTS voiceover script covering all slide content...", "imagePrompt": "Pixar-quality visual description...", "chartData": [...], "timelineSteps": [...] }] }`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: regionalConfig.llmProvider,
          model: regionalConfig.llmModel,
          prompt,
          systemPrompt: `You are a ${example?.industryName || 'professional'} presentation expert. Generate deeply contextual, data-rich slides with full narration scripts and vivid image prompts. Always respond with valid JSON only. Every data point must be realistic and industry-specific.`,
          temperature: 0.7,
          maxTokens: 4000,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Generation failed');

      const responseText = data?.generatedText || data?.content || data?.text || '';
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const rawSlides = (parsed.slides || []) as GeneratedSlide[];
        const validLayouts: SlideLayout[] = ['title', 'bullets', 'chart', 'timeline', '3d', 'avatar'];
        const sanitized = rawSlides.map(s => ({
          ...s,
          layoutType: validLayouts.includes(s.layoutType) ? s.layoutType : 'bullets',
          narration: s.narration || s.speakerNotes || '',
        }));
        setSlides(sanitized);
        setActiveSlide(0);

        // Generate AI images for title and 3D slides
        sanitized.forEach((slide, idx) => {
          if (slide.imagePrompt && ['title', '3d', 'avatar'].includes(slide.layoutType)) {
            generateSlideImage(idx, slide.imagePrompt);
          }
        });

        // Auto-generate TTS for first slide with regional routing
        if (sanitized[0]?.narration) {
          generateVoiceover(sanitized[0].narration, regionalConfig);
        }
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

  // ── AI Image Generation for slides ──
  const generateSlideImage = async (slideIdx: number, imagePrompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.5-flash-image',
          action: 'generate_image',
          prompt: `Ultra high quality, Pixar-grade 3D rendered illustration, cinematic lighting: ${imagePrompt}. Professional presentation visual, clean composition, vibrant colors.`,
          maxTokens: 1000,
        },
      });
      if (!error && data?.imageUrl) {
        setSlideImages(prev => ({ ...prev, [slideIdx]: data.imageUrl }));
      }
    } catch {
      // Image generation is optional — gracefully degrade
    }
  };

  // ── TTS Voiceover with regional routing ──
  const generateVoiceover = async (text: string, config?: RegionalProviderConfig) => {
    if (!text || text.length < 10) return;
    setIsPlayingTTS(true);
    try {
      // Use dialect-tts-demo for proper regional routing
      const { data, error } = await supabase.functions.invoke('dialect-tts-demo', {
        body: {
          action: 'custom_tts',
          text: text.slice(0, 500),
          language: toLangBCP47(selectedLang),
          mode: selectedLang !== 'en' ? 'transcreation' : 'literal',
        },
      });
      if (error) throw error;
      
      // dialect-tts-demo returns base64 audio
      const audioBase64 = data?.audio_base64 || data?.audioBase64;
      if (audioBase64) {
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlayingTTS(false);
        audio.onerror = () => setIsPlayingTTS(false);
        await audio.play();
      } else if (data instanceof ArrayBuffer || data instanceof Blob) {
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { setIsPlayingTTS(false); URL.revokeObjectURL(url); };
        audio.onerror = () => { setIsPlayingTTS(false); URL.revokeObjectURL(url); };
        await audio.play();
      } else {
        setIsPlayingTTS(false);
      }
    } catch {
      setIsPlayingTTS(false);
    }
  };

  const selectedLangName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
  const palette = getIndustryPalette(industryId);

  const renderSlideContent = (slide: GeneratedSlide, slideIdx: number) => {
    const imgUrl = slideImages[slideIdx];
    switch (slide.layoutType) {
      case 'title': return <TitleSlideLayout slide={slide} lang={selectedLang} palette={palette} imageUrl={imgUrl} />;
      case 'avatar': return <AvatarSlideLayout slide={slide} lang={selectedLang} palette={palette} imageUrl={imgUrl} />;
      case 'chart': return <ChartSlideLayout slide={slide} lang={selectedLang} palette={palette} />;
      case 'timeline': return <TimelineSlideLayout slide={slide} lang={selectedLang} palette={palette} />;
      case '3d': return <ThreeDSlideLayout slide={slide} lang={selectedLang} palette={palette} imageUrl={imgUrl} />;
      default: return <BulletsSlideLayout slide={slide} lang={selectedLang} palette={palette} imageUrl={imgUrl} />;
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
                {getRegionalConfig(region, selectedLang).displayProviders.map((p, i) => (
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
                  <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${palette.primary} overflow-hidden z-20`}>
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
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${palette.primary} flex items-center justify-center shadow-lg`}>
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
                    {renderSlideContent(slides[activeSlide], activeSlide)}
                  </div>

                  {/* Speaker notes + TTS footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/70 backdrop-blur-md border-t border-white/[0.06] z-[5] flex items-center gap-3"
                  >
                    <button
                      onClick={() => {
                        const narr = slides[activeSlide].narration || slides[activeSlide].speakerNotes;
                        if (narr) generateVoiceover(narr, getRegionalConfig(region, selectedLang));
                      }}
                      disabled={isPlayingTTS}
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isPlayingTTS
                          ? `bg-gradient-to-br ${palette.primary} shadow-lg animate-pulse`
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {isPlayingTTS ? <AudioWaveform /> : <Play className="h-3 w-3 text-white/70 ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider">
                        {isPlayingTTS ? '🎙 Playing Narration...' : '🎙 Narration'}
                      </p>
                      <p className="text-[10px] text-white/50 italic line-clamp-1">
                        {slides[activeSlide].narration || slides[activeSlide].speakerNotes}
                      </p>
                    </div>
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
                  <strong className="text-foreground">Unlock the full experience.</strong> Custom branding, real avatars, interactive 3D, PPTX/PDF export & 50+ languages.
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
