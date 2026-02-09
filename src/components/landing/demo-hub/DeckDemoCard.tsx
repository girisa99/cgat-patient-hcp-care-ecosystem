/**
 * Deck Demo Card — Generate a watermarked AI presentation outline per industry
 * 
 * Calls ai-universal-processor with rate limiting (5 tries/min per visitor).
 * Shows real AI-generated slide outlines with watermark overlay.
 * Region-aware: adapts language context based on detected region.
 */

import React, { useState } from 'react';
import { Presentation, Loader2, Sparkles, Globe, Lock, Languages, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { getIndustryExample, type DeckExample } from './industryDemoExamples';

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

  const [selectedLang, setSelectedLang] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<GeneratedSlide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!deckExample) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSlides(null);

    const langName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
    const prompt = `You are a professional presentation designer. Create a ${deckExample.slideCount}-slide presentation outline.

Topic: "${deckExample.topic}"
Industry: ${example?.industryName}
Target Audience: ${deckExample.audience}
Language: ${langName}

For each slide, provide:
- slideNumber (1-${deckExample.slideCount})
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
      
      // Parse JSON from response
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
        setError('Demo limit reached — each visitor gets limited free tries per minute. Everyone has access to limited tries. Please wait a moment.');
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
            <h3 className="text-lg font-bold text-foreground">AI Deck Generator</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {deckExample.title} — {deckExample.slideCount} slides
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" /> Genie Deck
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Prompt preview */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
            📋 Topic
          </p>
          <p className="text-sm text-foreground font-medium">{deckExample.topic}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Audience: {deckExample.audience}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-3">
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
          <div className="pt-5">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Deck'}
            </Button>
          </div>
        </div>

        {/* Pipeline indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Prompt</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
            {selectedLang !== 'en' ? 'Transcreation' : 'AI Generation'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">
            {deckExample.slideCount}-Slide Deck
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
              {/* Slide tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeSlide === idx
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Slide {slide.slideNumber}
                  </button>
                ))}
              </div>

              {/* Active slide preview with watermark */}
              <div className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-xl border border-border p-6 min-h-[200px] overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="rotate-[-25deg] opacity-10">
                    <p className="text-5xl font-black text-foreground tracking-widest">PREVIEW</p>
                    <p className="text-lg font-bold text-foreground text-center">Genie Studio</p>
                  </div>
                </div>

                <div className="relative z-0" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px]">
                      Slide {slides[activeSlide].slideNumber} / {slides.length}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Globe className="h-2.5 w-2.5" />
                      {selectedLangName}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">
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

              {/* CTA */}
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  <strong className="text-foreground">Want the full deck?</strong> Sign up to generate complete presentations with custom branding, animations, and export to PowerPoint.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign up for unlimited access to all AI features ✨
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeckDemoCard;
