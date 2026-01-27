/**
 * VIDEO GENERATION STUDIO
 * 
 * Admin interface for generating landing page videos with AI:
 * - Select language/region
 * - Choose chapters to generate
 * - Preview TTS audio and visuals
 * - Publish to landing_page_videos table
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, Play, Pause, Loader2, Upload, Check, 
  Globe, Mic2, Box, Wand2, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Available languages for generation
const LANGUAGES = [
  { code: 'en', name: 'English', zone: 'West/EU' },
  { code: 'es', name: 'Spanish', zone: 'West/EU' },
  { code: 'fr', name: 'French', zone: 'West/EU' },
  { code: 'de', name: 'German', zone: 'West/EU' },
  { code: 'ar', name: 'Arabic', zone: 'MENA' },
  { code: 'hi', name: 'Hindi', zone: 'India/SEA' },
  { code: 'zh', name: 'Chinese', zone: 'CJK' },
  { code: 'ja', name: 'Japanese', zone: 'CJK' },
  { code: 'ko', name: 'Korean', zone: 'CJK' },
  { code: 'pt', name: 'Portuguese', zone: 'West/EU' },
];

// Chapter definitions
const CHAPTERS = [
  { id: 'opening', title: 'The Genie Awakens', duration: 45 },
  { id: 'spark', title: 'Genie Spark', duration: 50 },
  { id: 'mind', title: 'Genie Mind', duration: 50 },
  { id: 'vibe', title: 'Genie Vibe', duration: 55 },
  { id: 'deck', title: 'Genie Deck', duration: 45 },
  { id: 'arc', title: 'Genie Arc', duration: 50 },
  { id: 'askGenie', title: 'Ask Genie', duration: 40 },
  { id: 'cast', title: 'Genie Cast', duration: 50 },
  { id: 'closing', title: 'Your Story Awaits', duration: 35 },
];

interface GeneratedChapter {
  chapterId: string;
  title: string;
  audioBase64?: string;
  ttsProvider: string;
  ttsVoice: string;
  zone: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

export const VideoGenerationStudio: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedChapters, setSelectedChapters] = useState<string[]>(CHAPTERS.map(c => c.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedChapters, setGeneratedChapters] = useState<GeneratedChapter[]>([]);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleGenerate = async () => {
    if (selectedChapters.length === 0) {
      toast.error('Please select at least one chapter');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedChapters([]);

    try {
      // Initialize chapters as pending
      const initialChapters = selectedChapters.map(id => ({
        chapterId: id,
        title: CHAPTERS.find(c => c.id === id)?.title || id,
        ttsProvider: '',
        ttsVoice: '',
        zone: '',
        status: 'pending' as const,
      }));
      setGeneratedChapters(initialChapters);

      // Call edge function to generate
      const { data, error } = await supabase.functions.invoke('landing-video-generator', {
        body: { 
          language: selectedLanguage,
          chapter: 'all',
          includeAvatar: true,
          include3D: true,
        },
      });

      if (error) throw error;

      if (data?.chapters) {
        const updatedChapters = data.chapters.map((ch: any) => ({
          chapterId: ch.chapterId,
          title: ch.title,
          audioBase64: ch.audioBase64,
          ttsProvider: ch.ttsProvider,
          ttsVoice: ch.ttsVoice,
          zone: ch.zone,
          status: ch.error ? 'error' : 'complete',
          error: ch.error,
        }));
        setGeneratedChapters(updatedChapters);
        setProgress(100);
        toast.success(`Generated ${updatedChapters.filter((c: GeneratedChapter) => c.status === 'complete').length} chapters`);
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (chapter: GeneratedChapter) => {
    if (audioRef) {
      audioRef.pause();
    }

    if (chapter.audioBase64) {
      const audio = new Audio(`data:audio/mpeg;base64,${chapter.audioBase64}`);
      audio.play();
      setAudioRef(audio);
      setCurrentPreview(chapter.chapterId);
      
      audio.onended = () => {
        setCurrentPreview(null);
      };
    }
  };

  const handlePublish = async () => {
    const successfulChapters = generatedChapters.filter(c => c.status === 'complete');
    if (successfulChapters.length === 0) {
      toast.error('No completed chapters to publish');
      return;
    }

    try {
      const language = LANGUAGES.find(l => l.code === selectedLanguage);
      const totalDuration = successfulChapters.reduce((sum, c) => 
        sum + (CHAPTERS.find(ch => ch.id === c.chapterId)?.duration || 0), 0
      );

      // Generate video URL from the successful chapters' audio/video data
      // For now, use a placeholder URL - real implementation would upload to storage
      const videoUrl = `https://storage.supabase.co/genie-videos/${selectedLanguage}-${Date.now()}.mp4`;

      const { error } = await supabase.from('landing_page_videos').insert([{
        title: `Genie Studio Demo - ${language?.name || selectedLanguage}`,
        description: 'AI-generated product showcase with 9 chapters',
        video_url: videoUrl,
        language_code: selectedLanguage,
        language_name: language?.name || selectedLanguage,
        region: language?.zone || 'Global',
        placement: 'hero_showcase',
        content_type: 'product_demo',
        is_active: true,
        is_featured: true,
        view_count: 0,
        duration_seconds: totalDuration,
        ai_confidence: 0.95,
        generation_pipeline: 'landing-video-generator',
      }]);

      if (error) throw error;
      
      toast.success('Video published to landing page!');
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Failed to publish video');
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Configuration */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generation Settings
          </CardTitle>
          <CardDescription>
            Configure language, chapters, and AI providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{lang.name}</span>
                      <Badge variant="outline" className="text-xs">{lang.zone}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLang && (
              <p className="text-xs text-muted-foreground">
                Using {selectedLang.zone} zone routing
              </p>
            )}
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chapters to Generate</label>
            <ScrollArea className="h-[280px] border rounded-lg p-3">
              <div className="space-y-2">
                {CHAPTERS.map(chapter => (
                  <div 
                    key={chapter.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                  >
                    <Checkbox
                      id={chapter.id}
                      checked={selectedChapters.includes(chapter.id)}
                      onCheckedChange={() => toggleChapter(chapter.id)}
                    />
                    <label htmlFor={chapter.id} className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium">{chapter.title}</p>
                      <p className="text-xs text-muted-foreground">{chapter.duration}s</p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{selectedChapters.length} chapters selected</span>
              <span>
                {selectedChapters.reduce((sum, id) => 
                  sum + (CHAPTERS.find(c => c.id === id)?.duration || 0), 0
                )}s total
              </span>
            </div>
          </div>

          {/* AI Provider Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Providers</label>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                <Mic2 className="w-3 h-3 mr-1" />
                ElevenLabs/Azure TTS
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Box className="w-3 h-3 mr-1" />
                Meshy AI 3D
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Video className="w-3 h-3 mr-1" />
                ModelsLab Video
              </Badge>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerating || selectedChapters.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {isGenerating && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* Right: Results */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Generated Content
          </CardTitle>
          <CardDescription>
            Preview and publish generated chapters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedChapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">
                No content generated yet. Configure settings and click "Generate Video".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chapter list */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {generatedChapters.map(chapter => (
                    <div 
                      key={chapter.chapterId}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{chapter.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {chapter.status === 'complete' ? (
                            <>
                              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                <Check className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {chapter.ttsProvider}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {chapter.zone}
                              </Badge>
                            </>
                          ) : chapter.status === 'error' ? (
                            <Badge variant="destructive" className="text-xs">
                              Error: {chapter.error}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Generating...
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {chapter.status === 'complete' && chapter.audioBase64 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(chapter)}
                        >
                          {currentPreview === chapter.chapterId ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button 
                  onClick={handlePublish}
                  disabled={generatedChapters.filter(c => c.status === 'complete').length === 0}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Publish to Landing Page
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenerationStudio;
