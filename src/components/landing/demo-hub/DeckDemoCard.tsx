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

// ── Slide Layout Renderers ──

const TitleSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    {/* Decorative rings */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/10 pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-accent/10 pointer-events-none" />
    
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 mx-auto shadow-lg shadow-primary/20">
        <Presentation className="h-7 w-7 text-primary-foreground" />
      </div>
      <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-tight mb-3">
        {slide.title}
      </h4>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{slide.bullets[0]}</p>
    </motion.div>
  </div>
);

const AvatarSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex gap-4 p-5 sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    {/* Avatar column */}
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-1/3 flex flex-col items-center justify-center"
    >
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center">
          <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary/60" />
        </div>
        {/* Lip-sync indicator */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-md"
        >
          <Mic className="h-3.5 w-3.5 text-accent-foreground" />
        </motion.div>
      </div>
      <Badge variant="outline" className="mt-3 text-[9px] gap-1 border-primary/30">
        <Play className="h-2.5 w-2.5" /> AI Avatar
      </Badge>
      <p className="text-[9px] text-muted-foreground mt-1">Azure Neural TTS</p>
    </motion.div>
    
    {/* Content column */}
    <div className="flex-1 flex flex-col justify-center space-y-3">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="w-10 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full mb-2" />
        <h4 className="text-lg sm:text-xl font-bold text-foreground">{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2">
        {slide.bullets.map((b, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
            className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span>{b}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  </div>
);

const ChartSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => {
  const chartData = slide.chartData || slide.bullets.map((b, i) => ({ label: b.slice(0, 20), value: 40 + Math.round(Math.random() * 50) }));
  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <div className="h-full flex flex-col p-5 sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Badge variant="outline" className="text-[9px] gap-1 mb-2 border-primary/30">
          <BarChart3 className="h-2.5 w-2.5" /> Data Visualization
        </Badge>
        <h4 className="text-lg sm:text-xl font-bold text-foreground">{slide.title}</h4>
      </motion.div>
      
      {/* Animated bar chart */}
      <div className="flex-1 flex items-end gap-3 sm:gap-4 pb-6">
        {chartData.slice(0, 5).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / maxVal) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent relative min-h-[8px] shadow-sm shadow-primary/20"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.12 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary"
              >
                {d.value}%
              </motion.span>
            </motion.div>
            <span className="text-[8px] sm:text-[9px] text-muted-foreground text-center leading-tight line-clamp-2">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => {
  const steps = slide.timelineSteps || slide.bullets.map((b, i) => ({ step: `Step ${i + 1}`, description: b }));

  return (
    <div className="h-full flex flex-col p-5 sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Badge variant="outline" className="text-[9px] gap-1 mb-2 border-accent/30">
          <Footprints className="h-2.5 w-2.5" /> Journey Map
        </Badge>
        <h4 className="text-lg sm:text-xl font-bold text-foreground">{slide.title}</h4>
      </motion.div>

      {/* Horizontal timeline */}
      <div className="flex-1 flex items-center">
        <div className="w-full flex items-start gap-1">
          {steps.slice(0, 4).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
              className="flex-1 relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && i < 3 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.3 }}
                  className="absolute top-4 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/40 to-accent/40 origin-left"
                />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                  i === 0 ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' : 'bg-card border-2 border-primary/30 text-primary'
                }`}>
                  {i + 1}
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold text-foreground mt-2 leading-tight">{s.step}</p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 leading-snug line-clamp-3 max-w-[100px]">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ThreeDSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex flex-col p-5 sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
      <Badge variant="outline" className="text-[9px] gap-1 mb-2 border-primary/30">
        <Box className="h-2.5 w-2.5" /> 3D Interactive
      </Badge>
      <h4 className="text-lg sm:text-xl font-bold text-foreground">{slide.title}</h4>
    </motion.div>

    {/* 3D scene placeholder */}
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        animate={{ rotateY: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative w-40 h-40 sm:w-52 sm:h-52"
        style={{ perspective: 800 }}
      >
        {/* Floating 3D cube faces */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/15 rounded-2xl border border-primary/20 backdrop-blur-sm" />
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-accent/20 flex items-center justify-center"
        >
          <Box className="h-12 w-12 text-primary/40" />
        </motion.div>
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="text-[9px] text-muted-foreground">Meshy AI • Interactive</p>
        </div>
      </motion.div>
    </div>

    <ul className="space-y-1.5 mt-2">
      {slide.bullets.slice(0, 2).map((b, i) => (
        <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
          className="flex items-start gap-2 text-xs text-muted-foreground">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span className="line-clamp-1">{b}</span>
        </motion.li>
      ))}
    </ul>
  </div>
);

const BulletsSlideLayout: React.FC<{ slide: GeneratedSlide; lang: string }> = ({ slide, lang }) => (
  <div className="h-full flex flex-col p-5 sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div className="my-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mb-3" />
        <h4 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{slide.title}</h4>
      </motion.div>
      <ul className="space-y-2.5 max-w-lg">
        {slide.bullets.map((bullet, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
            className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="mt-1.5 flex-shrink-0">
              <span className="block w-2 h-2 rounded-full bg-gradient-to-br from-primary to-accent shadow-sm shadow-primary/30" />
            </span>
            <span className="leading-relaxed">{bullet}</span>
          </motion.li>
        ))}
      </ul>
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
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                Generating rich deck in {selectedLangName}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avatar • Charts • 3D • Timeline • {deckExample.slideCount} slides
              </p>
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
                  className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10"
                  style={{ aspectRatio: '16/9' }}
                >
                  {/* Slide background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted/60" />
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/[0.03] to-transparent" />

                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="rotate-[-20deg] opacity-[0.04]">
                      <p className="text-5xl sm:text-7xl font-black text-foreground tracking-[0.3em]">PREVIEW</p>
                    </div>
                  </div>

                  {/* Top bar */}
                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-[5]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Presentation className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase">Genie Deck</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[8px] gap-0.5 border-primary/30 bg-primary/5 h-5">
                        {LAYOUT_ICONS[slides[activeSlide].layoutType]}
                        {LAYOUT_LABELS[slides[activeSlide].layoutType]}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] gap-0.5 h-5">
                        <Globe className="h-2 w-2" /> {selectedLangName}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] h-5">
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
                    className="absolute bottom-0 left-0 right-0 px-5 py-2 bg-muted/80 backdrop-blur-sm border-t border-border/50 z-[5]"
                  >
                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">Speaker Notes</p>
                    <p className="text-[10px] text-muted-foreground/70 italic line-clamp-1">{slides[activeSlide].speakerNotes}</p>
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
