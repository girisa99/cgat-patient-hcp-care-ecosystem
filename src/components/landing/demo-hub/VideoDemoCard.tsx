/**
 * Video Script Demo Card — Generate AI video scripts per industry
 * 
 * Calls ai-universal-processor with rate limiting.
 * Shows real AI-generated video scripts with scene breakdowns and watermark.
 * Demonstrates the text-to-video pipeline concept.
 */

import React, { useState } from 'react';
import { Video, Loader2, Sparkles, Globe, Lock, ChevronRight, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { getIndustryExample } from './industryDemoExamples';

interface VideoDemoCardProps {
  industryId: string;
  region?: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

interface VideoScene {
  sceneNumber: number;
  visual: string;
  narration: string;
  duration: string;
  transition: string;
}

export const VideoDemoCard: React.FC<VideoDemoCardProps> = ({ industryId, region }) => {
  const example = getIndustryExample(industryId);
  const videoExample = example?.pipelines.video;

  const [selectedLang, setSelectedLang] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<VideoScene[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!videoExample) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setScenes(null);

    const langName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
    const prompt = `You are a professional video producer. Create a scene-by-scene breakdown for a ${videoExample.duration} ${videoExample.style} video.

Script concept: "${videoExample.script}"
Industry: ${example?.industryName}
Style: ${videoExample.style}
Language: ${langName}

Create 3-4 scenes. For each scene provide:
- sceneNumber (1-4)
- visual (describe what the viewer sees)
- narration (the voiceover text)
- duration (e.g., "8s")
- transition (e.g., "fade", "cut", "dissolve")

${selectedLang !== 'en' ? `IMPORTANT: Generate narration in ${langName}. Transcreate culturally — adapt the messaging for ${langName}-speaking audiences.` : ''}

Respond in valid JSON format: { "scenes": [{ "sceneNumber": 1, "visual": "...", "narration": "...", "duration": "...", "transition": "..." }] }`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt,
          systemPrompt: 'You are a professional video producer. Always respond with valid JSON only, no markdown code fences.',
          temperature: 0.7,
          maxTokens: 2000,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Generation failed');

      const responseText = data?.generatedText || data?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setScenes(parsed.scenes || []);
      } else {
        throw new Error('Could not parse scene data');
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
    <Card className="border-accent/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Video className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">AI Video Script</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {videoExample.title} — {videoExample.style}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <Film className="h-3 w-3" /> Genie Vibe
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Script preview */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">🎬 Script Concept</p>
          <p className="text-sm text-foreground italic">"{videoExample.script}"</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-[10px]">⏱ {videoExample.duration}</Badge>
            <Badge variant="outline" className="text-[10px]">🎨 {videoExample.style}</Badge>
          </div>
        </div>

        {/* Language + generate */}
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
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Script'}
            </Button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Script</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
            {selectedLang !== 'en' ? 'Transcreation' : 'Scene Breakdown'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">Video Storyboard</span>
        </div>

        {/* Loading */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-3 py-6 bg-accent/5 rounded-xl border border-accent/20">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <span className="text-sm text-accent font-medium">
              Creating scene breakdown in {selectedLangName}...
            </span>
          </div>
        )}

        {/* Generated scenes */}
        <AnimatePresence mode="wait">
          {scenes && scenes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Scene timeline */}
              <div className="relative">
                {scenes.map((scene, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-8 pb-4 last:pb-0"
                  >
                    {/* Timeline line */}
                    {idx < scenes.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />

                    <div className="relative bg-card rounded-lg border border-border p-4 overflow-hidden" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-2xl font-black text-foreground/5 rotate-[-20deg]">PREVIEW</p>
                      </div>

                      <div className="relative z-0">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="text-[10px] bg-accent/10 text-accent border-accent/20">
                            Scene {scene.sceneNumber} · {scene.duration}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{scene.transition}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground">Visual:</span> {scene.visual}
                        </p>
                        <p className="text-sm text-foreground italic">
                          🎙 "{scene.narration}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
                <Lock className="h-4 w-4 text-accent flex-shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  <strong className="text-foreground">Want the full video?</strong> Sign up to render AI videos with avatars, lip-sync, and regional TTS in 140+ languages.
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

export default VideoDemoCard;
