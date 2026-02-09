/**
 * Deck Demo Card — Generate a watermarked AI presentation outline per industry
 * 
 * Supports both custom prompts and "Create from Template" selection.
 * Calls ai-universal-processor with rate limiting (5 tries/min per visitor).
 */

import React, { useState, useEffect } from 'react';
import { Presentation, Loader2, Sparkles, Globe, Lock, ChevronRight } from 'lucide-react';
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

interface GeneratedSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
}

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
    
    const prompt = `You are a professional presentation designer. Create a ${slideCount}-slide presentation outline.

Topic/Brief: "${effectivePrompt}"
Industry: ${example?.industryName}
Target Audience: ${deckExample.audience}
Language: ${langName}

For each slide, provide:
- slideNumber (1-${slideCount})
- title (concise, impactful)
- bullets (3-4 key points)
- speakerNotes (1-2 sentences)

${selectedLang !== 'en' ? `IMPORTANT: Generate ALL content in ${langName}. Transcreate the content culturally — don't just translate, adapt idioms and context for ${langName}-speaking audiences.` : ''}

Respond in valid JSON format: { "slides": [{ "slideNumber": 1, "title": "...", "bullets": ["..."], "speakerNotes": "..." }] }`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt,
          systemPrompt: 'You are a professional presentation designer. Always respond with valid JSON only, no markdown code fences.',
          temperature: 0.7,
          maxTokens: 2000,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Generation failed');

      const responseText = data?.generatedText || data?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSlides(parsed.slides || []);
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

        {/* Pipeline indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium text-[11px]">
            {selectedTemplateId ? '📋 Template' : '✍️ Prompt'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium text-[11px]">
            {selectedLang !== 'en' ? '🌍 Transcreation' : '🤖 AI Generation'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium text-[11px]">
            📊 {deckExample.slideCount}-Slide Deck
          </span>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-3 py-6 bg-accent/5 rounded-xl border border-accent/20">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <span className="text-sm text-accent font-medium">
              Generating {deckExample.slideCount} slides in {selectedLangName}...
            </span>
          </div>
        )}

        {/* Generated slides with watermark */}
        <AnimatePresence mode="wait">
          {slides && slides.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                      activeSlide === idx
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    Slide {slide.slideNumber}
                  </button>
                ))}
              </div>

              <div className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-xl border border-border p-4 sm:p-6 min-h-[200px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="rotate-[-25deg] opacity-10">
                    <p className="text-4xl sm:text-5xl font-black text-foreground tracking-widest">PREVIEW</p>
                    <p className="text-sm sm:text-lg font-bold text-foreground text-center">Genie Studio</p>
                  </div>
                </div>

                <div className="relative z-0" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px]">
                      Slide {slides[activeSlide].slideNumber} / {slides.length}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Globe className="h-2.5 w-2.5" /> {selectedLangName}
                    </Badge>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                    {slides[activeSlide].title}
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {slides[activeSlide].bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Speaker Notes</p>
                    <p className="text-xs text-muted-foreground italic">{slides[activeSlide].speakerNotes}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  <strong className="text-foreground">Want the full deck?</strong> Sign up to generate complete presentations with custom branding, animations, and PowerPoint export.
                </p>
              </div>
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