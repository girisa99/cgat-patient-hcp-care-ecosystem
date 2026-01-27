/**
 * PREVIEW PANEL
 * 
 * Multi-language preview system:
 * - Preview individual chapters
 * - Compare side-by-side languages
 * - Full composition preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Columns, Globe, CheckCircle2, AlertCircle,
  Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompositionChapter, CompositionProject } from './types';
import { SUPPORTED_LANGUAGES } from './types';

interface PreviewPanelProps {
  project: CompositionProject;
  chapters: CompositionChapter[];
  onGeneratePreview: (chapterId: string, language: string) => Promise<void>;
  onGenerateAll: () => Promise<void>;
  isGenerating: boolean;
  generationProgress: number;
}

type PreviewMode = 'single' | 'side-by-side' | 'all-languages';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  project,
  chapters,
  onGeneratePreview,
  onGenerateAll,
  isGenerating,
  generationProgress,
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('single');
  const [selectedChapter, setSelectedChapter] = useState<string>(chapters[0]?.id || '');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(project.primaryLanguage);
  const [compareLanguage, setCompareLanguage] = useState<string>(
    project.targetLanguages.find(l => l !== project.primaryLanguage) || 'es'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentChapter = chapters.find(c => c.id === selectedChapter);
  
  const getTotalDuration = () => chapters.reduce((sum, c) => sum + c.duration, 0);

  const getChapterStatus = (chapter: CompositionChapter, language: string) => {
    if (chapter.previewUrls[language]) return 'ready';
    if (chapter.status === 'generating') return 'generating';
    if (chapter.status === 'error') return 'error';
    return 'pending';
  };

  const renderPreviewPlaceholder = (status: string, chapter: CompositionChapter) => (
    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center">
      {status === 'generating' ? (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Generating preview...</span>
          {chapter.progress && (
            <Progress value={chapter.progress} className="w-32 mt-2" />
          )}
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="w-8 h-8 text-destructive mb-2" />
          <span className="text-sm text-destructive">{chapter.error || 'Generation failed'}</span>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => onGeneratePreview(chapter.id, selectedLanguage)}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </>
      ) : (
        <>
          <Play className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to generate preview</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => onGeneratePreview(chapter.id, selectedLanguage)}
          >
            Generate
          </Button>
        </>
      )}
    </div>
  );

  const renderVideoPlayer = (url: string) => (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={url}
        className="w-full h-full object-contain"
        controls={false}
        muted={isMuted}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(currentTime / (currentChapter?.duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/80">
            {Math.floor(currentTime)}s / {currentChapter?.duration || 0}s
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="w-4 h-4" />
              Preview
            </CardTitle>
            <CardDescription>
              Preview your composition before publishing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Preview Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={previewMode === 'single' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setPreviewMode('single')}
              >
                Single
              </Button>
              <Button
                variant={previewMode === 'side-by-side' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setPreviewMode('side-by-side')}
              >
                <Columns className="w-3.5 h-3.5 mr-1" />
                Compare
              </Button>
              <Button
                variant={previewMode === 'all-languages' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setPreviewMode('all-languages')}
              >
                <Globe className="w-3.5 h-3.5 mr-1" />
                All
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Chapter & Language Selection */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger>
                <SelectValue placeholder="Select chapter..." />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    <div className="flex items-center gap-2">
                      <span>#{chapter.order} {chapter.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {chapter.duration}s
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {previewMode === 'single' && (
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {project.targetLanguages.map((code) => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                  return (
                    <SelectItem key={code} value={code}>
                      {lang?.name || code}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          {previewMode === 'side-by-side' && (
            <>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {project.targetLanguages.map((code) => {
                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                    return (
                      <SelectItem key={code} value={code}>
                        {lang?.name || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <span className="flex items-center text-muted-foreground">vs</span>
              <Select value={compareLanguage} onValueChange={setCompareLanguage}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {project.targetLanguages.filter(l => l !== selectedLanguage).map((code) => {
                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                    return (
                      <SelectItem key={code} value={code}>
                        {lang?.name || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1">
          {previewMode === 'single' && currentChapter && (
            <div>
              {currentChapter.previewUrls[selectedLanguage] ? (
                renderVideoPlayer(currentChapter.previewUrls[selectedLanguage])
              ) : (
                renderPreviewPlaceholder(
                  getChapterStatus(currentChapter, selectedLanguage), 
                  currentChapter
                )
              )}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentChapter.visual.type}</Badge>
                  <Badge variant="outline">{currentChapter.voiceover.type}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Chapter {currentChapter.order} of {chapters.length}
                </span>
              </div>
            </div>
          )}

          {previewMode === 'side-by-side' && currentChapter && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Badge className="mb-2">
                  {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </Badge>
                {currentChapter.previewUrls[selectedLanguage] ? (
                  renderVideoPlayer(currentChapter.previewUrls[selectedLanguage])
                ) : (
                  renderPreviewPlaceholder(
                    getChapterStatus(currentChapter, selectedLanguage), 
                    currentChapter
                  )
                )}
              </div>
              <div>
                <Badge className="mb-2">
                  {SUPPORTED_LANGUAGES.find(l => l.code === compareLanguage)?.name}
                </Badge>
                {currentChapter.previewUrls[compareLanguage] ? (
                  renderVideoPlayer(currentChapter.previewUrls[compareLanguage])
                ) : (
                  renderPreviewPlaceholder(
                    getChapterStatus(currentChapter, compareLanguage), 
                    currentChapter
                  )
                )}
              </div>
            </div>
          )}

          {previewMode === 'all-languages' && currentChapter && (
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {project.targetLanguages.map((code) => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                  const status = getChapterStatus(currentChapter, code);
                  return (
                    <div key={code} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {lang?.name || code}
                        </Badge>
                        {status === 'ready' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                      <div className="aspect-video">
                        {currentChapter.previewUrls[code] ? (
                          <video
                            src={currentChapter.previewUrls[code]}
                            className="w-full h-full object-cover rounded"
                            controls
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                            {status === 'generating' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onGeneratePreview(currentChapter.id, code)}
                              >
                                Generate
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Generate All Button */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            {chapters.length} chapters • {project.targetLanguages.length} languages • {getTotalDuration()}s total
          </div>
          <Button 
            onClick={onGenerateAll}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating ({generationProgress}%)
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate All Previews
              </>
            )}
          </Button>
        </div>

        {isGenerating && (
          <Progress value={generationProgress} className="w-full" />
        )}
      </CardContent>
    </Card>
  );
};

export default PreviewPanel;
