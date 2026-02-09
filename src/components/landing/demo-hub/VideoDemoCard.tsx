/**
 * Video Script Demo Card — Generate AI video scripts per industry
 * 
 * Calls ai-universal-processor with rate limiting.
 * Shows real AI-generated video storyboard with visual scene cards, provider info,
 * and watermarked preview. Supports custom prompt input from user.
 * 
 * Provider routing: Vertex Veo 3 (primary), Sora 2 (secondary), Alibaba Wan 2.6 (fallback)
 */

import React, { useState, useEffect } from 'react';
import { Video, Loader2, Lock, ChevronRight, Film, Play, Monitor, Smartphone, Palette, Clock, Volume2, Shield, Zap, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
];

// Video pipeline provider chain
const VIDEO_PROVIDERS = [
  { name: 'Vertex Veo 3', role: 'primary' as const, badge: 'Text-to-Video' },
  { name: 'Sora 2', role: 'secondary' as const, badge: 'High quality' },
  { name: 'Alibaba Wan 2.6', role: 'fallback' as const, badge: 'Motion control' },
];

// Scene visual style hints for storyboard cards
const SCENE_VISUALS = [
  { gradient: 'from-blue-500/20 to-purple-500/20', emoji: '🎬' },
  { gradient: 'from-emerald-500/20 to-teal-500/20', emoji: '📹' },
  { gradient: 'from-amber-500/20 to-orange-500/20', emoji: '🎥' },
  { gradient: 'from-rose-500/20 to-pink-500/20', emoji: '🎞️' },
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
  const [customPrompt, setCustomPrompt] = useState('');

  // Reset when industry changes
  useEffect(() => {
    setCustomPrompt('');
    setScenes(null);
    setError(null);
  }, [industryId]);

  if (!videoExample) return null;

  const effectivePrompt = customPrompt.trim() || videoExample.script;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setScenes(null);

    const langName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
    const prompt = `You are a professional video producer. Create a scene-by-scene breakdown for a ${videoExample.duration} ${videoExample.style} video.

Script concept: "${effectivePrompt}"
Industry: ${example?.industryName}
Style: ${videoExample.style}
Language: ${langName}

Create 3-4 scenes. For each scene provide:
- sceneNumber (1-4)
- visual (describe what the viewer sees — be specific about camera angle, subjects, and setting)
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
            <h3 className="text-base sm:text-lg font-bold text-foreground">AI Video Storyboard</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              {videoExample.title} — {videoExample.style}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
            <Film className="h-3 w-3" /> Genie Vibe
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Provider chain — shows which AI powers video generation */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> Video Generation Pipeline
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {VIDEO_PROVIDERS.map((p, i) => (
              <React.Fragment key={p.name}>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    p.role === 'primary' ? 'bg-green-500' : p.role === 'secondary' ? 'bg-yellow-500' : 'bg-muted-foreground'
                  }`} />
                  <span className="text-xs text-foreground">{p.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{p.badge}</Badge>
                </div>
                {i < VIDEO_PROVIDERS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Full pipeline visual */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium text-[11px]">📝 Script</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-1 bg-accent/10 text-accent rounded-full font-medium text-[11px]">
            {selectedLang !== 'en' ? '🌍 Transcreation' : '🎬 Scene Breakdown'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium text-[11px]">🖼️ Storyboard</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full font-medium text-[11px]">🎬 Video Render</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full font-medium text-[11px]">🔊 TTS + Lip-sync</span>
        </div>

        {/* Editable prompt area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            🎬 Your Script Concept
            <span className="text-[10px] font-normal normal-case text-muted-foreground/70">
              (edit or use the example)
            </span>
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={videoExample.script}
            className="min-h-[70px] text-sm bg-muted/30 border-border resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">⏱ {videoExample.duration}</Badge>
            <Badge variant="outline" className="text-[10px]">🎨 {videoExample.style}</Badge>
            <Badge variant="outline" className="text-[10px]">
              <Monitor className="h-2.5 w-2.5 mr-0.5" /> Desktop + Mobile
            </Badge>
            {customPrompt.trim() && (
              <button
                onClick={() => setCustomPrompt('')}
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
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isGenerating ? 'Creating Storyboard...' : 'Generate Storyboard'}
          </Button>
        </div>

        {/* Loading */}
        {isGenerating && (
          <div className="flex flex-col items-center gap-3 py-8 bg-accent/5 rounded-xl border border-accent/20">
            <div className="relative">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Film className="h-8 w-8 text-accent animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                Creating visual storyboard in {selectedLangName}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Script → AI Scene Analysis → Visual Storyboard
              </p>
            </div>
          </div>
        )}

        {/* Generated storyboard with visual scene cards */}
        <AnimatePresence mode="wait">
          {scenes && scenes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Storyboard header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-bold text-foreground">AI Storyboard — {scenes.length} Scenes</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[9px] gap-1">
                    <Zap className="h-2.5 w-2.5" /> Gemini 2.0
                  </Badge>
                  {selectedLang !== 'en' && (
                    <Badge variant="outline" className="text-[9px] gap-1">
                      🌍 Transcreated
                    </Badge>
                  )}
                </div>
              </div>

              {/* Scene cards — visual storyboard layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenes.map((scene, idx) => {
                  const visual = SCENE_VISUALS[idx % SCENE_VISUALS.length];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.15 }}
                      className="relative rounded-xl border border-border overflow-hidden bg-card group hover:border-accent/40 transition-colors"
                    >
                      {/* Visual frame — simulated video frame */}
                      <div className={`relative bg-gradient-to-br ${visual.gradient} aspect-video flex items-center justify-center`}>
                        {/* Watermark overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-3xl font-black text-foreground/[0.06] rotate-[-15deg] select-none">PREVIEW</p>
                        </div>
                        
                        {/* Scene visual description */}
                        <div className="relative z-10 text-center px-4">
                          <span className="text-3xl mb-2 block">{visual.emoji}</span>
                          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{scene.visual}</p>
                        </div>

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-accent/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <Play className="h-5 w-5 text-accent-foreground ml-0.5" />
                          </div>
                        </div>

                        {/* Scene badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className="text-[10px] bg-background/80 backdrop-blur-sm text-foreground border-0">
                            Scene {scene.sceneNumber} · {scene.duration}
                          </Badge>
                        </div>

                        {/* Transition badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="text-[9px] bg-background/60 backdrop-blur-sm border-0 text-muted-foreground">
                            {scene.transition}
                          </Badge>
                        </div>
                      </div>

                      {/* Narration below the visual frame */}
                      <div className="p-3" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="flex items-start gap-2">
                          <Volume2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                          <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                            "{scene.narration}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* What happens next — full pipeline CTA */}
              <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Want the full video? Sign up to unlock:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {[
                        { icon: '🎬', label: 'AI Video Render', desc: 'Vertex Veo 3' },
                        { icon: '🗣️', label: 'Voice + Lip-sync', desc: 'Azure Neural TTS' },
                        { icon: '👤', label: 'AI Presenter', desc: 'Alibaba Wan 2.2' },
                        { icon: '🌍', label: '140+ Languages', desc: 'Transcreated' },
                        { icon: '📱', label: 'Mobile Export', desc: '9:16 format' },
                        { icon: '🎵', label: 'Music + SFX', desc: 'AI-generated' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 text-xs">
                          <span>{item.icon}</span>
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
