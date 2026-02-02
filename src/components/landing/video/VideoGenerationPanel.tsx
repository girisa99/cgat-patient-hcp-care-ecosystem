/**
 * VIDEO GENERATION PANEL
 * 
 * Admin panel for generating professional landing page videos
 * using Genie Cast with avatars, 3D, and regional variants
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader2,
  Film,
  User,
  Globe,
  Wand2,
  CheckCircle,
  XCircle,
  Sparkles,
  Box,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  landingVideoGenerationService,
  REGIONAL_AVATARS,
  CHAPTER_VISUAL_CONFIGS,
  type VideoGenerationResult,
} from '@/services/landing/videoGenerationService';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', zone: 'Claude Zone' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', zone: 'Alibaba Zone' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', zone: 'Gemini Zone' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', zone: 'Alibaba Zone' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', zone: 'Alibaba Zone' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', zone: 'Alibaba Zone' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', zone: 'Claude Zone' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', zone: 'Claude Zone' },
  { code: 'fr', name: 'French', flag: '🇫🇷', zone: 'Claude Zone' },
  { code: 'de', name: 'German', flag: '🇩🇪', zone: 'Claude Zone' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', zone: 'Gemini Zone' },
];

const QUALITY_OPTIONS = [
  { value: 'preview', label: 'Preview (Fast)', description: '480p, quick generation' },
  { value: 'production', label: 'Production (Balanced)', description: '1080p, standard quality' },
  { value: 'cinematic', label: 'Cinematic (Premium)', description: '4K, highest quality' },
];

export const VideoGenerationPanel: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [quality, setQuality] = useState<'preview' | 'production' | 'cinematic'>('production');
  const [includeGenie, setIncludeGenie] = useState(true);
  const [include3D, setInclude3D] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Map<string, VideoGenerationResult>>(new Map());

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
  const avatars = REGIONAL_AVATARS[selectedLanguage] || REGIONAL_AVATARS.en;

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(new Map());

    try {
      for (let i = 0; i < CHAPTER_VISUAL_CONFIGS.length; i++) {
        const config = CHAPTER_VISUAL_CONFIGS[i];
        setCurrentChapter(config.id);
        setProgress((i / CHAPTER_VISUAL_CONFIGS.length) * 100);

        const avatar = avatars[i % avatars.length];

        const result = await landingVideoGenerationService.generateChapterVideo({
          chapterId: config.id,
          language: selectedLanguage,
          avatar,
          quality,
          includeSubtitles: true,
          includeGenie,
          include3D,
        });

        setResults(prev => new Map(prev).set(config.id, result));

        // Brief pause between generations
        if (i < CHAPTER_VISUAL_CONFIGS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
      setCurrentChapter(null);
    }
  };

  const getResultIcon = (chapterId: string) => {
    const result = results.get(chapterId);
    if (!result) return null;
    return result.success ? (
      <CheckCircle className="w-4 h-4 text-emerald-500" />
    ) : (
      <XCircle className="w-4 h-4 text-destructive" />
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/90 backdrop-blur-sm border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Video Generation Studio</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate professional marketing videos using Genie Cast
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Powered by Cast
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Regional Language
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <Badge variant="secondary" className="text-[10px] ml-auto">
                        {lang.zone}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Video Quality
            </Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap gap-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch checked={includeGenie} onCheckedChange={setIncludeGenie} id="genie" />
            <Label htmlFor="genie" className="text-sm flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              Genie Character Transitions
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={include3D} onCheckedChange={setInclude3D} id="3d" />
            <Label htmlFor="3d" className="text-sm flex items-center gap-1">
              <Box className="w-3 h-3" />
              3D Elements & Animations
            </Label>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Regional Avatars ({selectedLang?.name})
          </Label>
          <div className="flex gap-4">
            {avatars.map(avatar => (
              <div
                key={avatar.id}
                className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {avatar.name.charAt(0)}
                </div>
                <span className="text-sm mt-2">{avatar.name}</span>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {avatar.gender}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    <Mic className="w-2 h-2 mr-1" />
                    {avatar.voiceProvider}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter List with Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chapters to Generate ({CHAPTER_VISUAL_CONFIGS.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CHAPTER_VISUAL_CONFIGS.map(config => (
              <motion.div
                key={config.id}
                className={`p-3 rounded-lg border transition-colors ${
                  currentChapter === config.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/20'
                }`}
                animate={currentChapter === config.id ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <span className="text-xs font-medium truncate">{config.product}</span>
                  </div>
                  {currentChapter === config.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    getResultIcon(config.id)
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {config.duration}s • {config.visualStyle.replace('_', ' ')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Generating: {currentChapter ? CHAPTER_VISUAL_CONFIGS.find(c => c.id === currentChapter)?.product : '...'}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full"
          variant="default"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Videos...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate All {CHAPTER_VISUAL_CONFIGS.length} Chapter Videos
            </>
          )}
        </Button>

        {/* Results Summary */}
        {results.size > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Generation Complete</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                  {Array.from(results.values()).filter(r => r.success).length} success
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="w-4 h-4" />
                  {Array.from(results.values()).filter(r => !r.success).length} failed
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Videos have been saved to the database and will appear in the landing page showcase.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoGenerationPanel;
