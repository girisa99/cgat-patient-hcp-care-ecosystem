/**
 * HERO SCRIPT VIDEO COMPONENT (v3)
 * 
 * Clean implementation:
 * - Single text layer (no duplicates)
 * - Product logos displayed via ChapterVisualEngine
 * - Correct "Powered by" badge synced to current chapter
 * - Audio cleanup on unmount/visibility change
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Loader2, RefreshCw,
  Globe, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLiveVideoGeneration } from '@/hooks/useLiveVideoGeneration';
import { useLandingVideos } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { SUPPORTED_REGIONS } from '@/config/genie-sitemap';
import { ChapterVisualEngine } from './video/ChapterVisualEngine';
import { ProviderAttribution } from './video/ProviderAttribution';

interface HeroScriptVideoProps {
  className?: string;
  autoStart?: boolean;
}

// Chapter titles from script
const CHAPTER_TITLES: Record<string, { title: string; subtitle: string }> = {
  opening: { title: 'The Genie Awakens', subtitle: '7 Products • 206 Pipelines • 15 AI Providers' },
  spark: { title: 'Genie Spark', subtitle: 'Ignite Your Ideas' },
  mind: { title: 'Genie Mind', subtitle: 'AI That Understands' },
  vibe: { title: 'Genie Vibe', subtitle: 'Script to Screen' },
  deck: { title: 'Genie Deck', subtitle: 'Ideas to Impact' },
  arc: { title: 'Genie Hub', subtitle: 'Your Creative Command Center' },
  askGenie: { title: 'Ask Genie', subtitle: 'Your Wish is My Command' },
  cast: { title: 'Genie Cast', subtitle: 'Make It. Show It. Scale It.' },
  closing: { title: 'Your Story Awaits', subtitle: 'Start Creating Today' },
};

// Technical highlights per chapter
const CHAPTER_HIGHLIGHTS: Record<string, string[]> = {
  opening: ['7 Products', '206 Pipelines', '15 AI Providers'],
  spark: ['28 Pipelines', 'Multi-modal Input', '6-zone LLM Routing'],
  mind: ['30 Pipelines', 'Multi-provider TTS', '7 Arabic Dialects'],
  vibe: ['74 Pipelines', 'AI Teleprompter', '3D Avatars'],
  deck: ['34 Pipelines', '3D Charts', 'AI Avatar Presenter'],
  arc: ['14 Pipelines', 'Kanban Boards', 'Team Scheduling'],
  askGenie: ['Universal AI Hub', 'Voice Mode', 'Context-Aware'],
  cast: ['26 Pipelines', '14-Region Distribution', 'Auto-Localization'],
  closing: ['Start Free', 'No Credit Card', 'Enterprise Ready'],
};

export const HeroScriptVideo: React.FC<HeroScriptVideoProps> = ({
  className = '',
  autoStart = false,
}) => {
  const {
    isGenerating,
    progress,
    result,
    error,
    isPlaying,
    currentPlayingChapter,
    isMuted,
    generateVideo,
    playChapter,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setMuted,
    reset,
    chapters,
    activeProviders,
  } = useLiveVideoGeneration();
  
  const { selectedRegion, setRegion, regionName } = useRegionalDetection();
  const { videos: adminVideos } = useLandingVideos({ 
    placement: 'hero_showcase', 
    region: selectedRegion 
  });
  
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Cleanup audio when component unmounts or page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPlayback();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPlayback();
    };
  }, [stopPlayback]);

  const handleLanguageChange = useCallback(async (langCode: string) => {
    setRegion(langCode as any);
    setShowLanguageSelector(false);
    reset();
    await generateVideo(langCode);
  }, [setRegion, reset, generateVideo]);

  const handlePlayPause = useCallback(() => {
    if (!result) {
      generateVideo(selectedRegion);
      return;
    }
    
    if (isPlaying) {
      pausePlayback();
    } else {
      if (currentPlayingChapter === 0 && !isPlaying) {
        playChapter(0);
      } else {
        resumePlayback();
      }
    }
  }, [result, isPlaying, currentPlayingChapter, generateVideo, selectedRegion, pausePlayback, playChapter, resumePlayback]);

  const currentChapter = chapters[currentPlayingChapter];
  const chapterId = currentChapter?.chapterId || 'opening';
  const chapterInfo = CHAPTER_TITLES[chapterId];
  const highlights = CHAPTER_HIGHLIGHTS[chapterId] || [];

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Visual Engine - renders product logos and lamp animations */}
      <ChapterVisualEngine
        chapterId={chapterId}
        isPlaying={isPlaying}
        isGenerating={isGenerating}
      />
      
      {/* UI Overlay - semi-transparent, only ONE text layer */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
        {/* Top bar - language + provider attribution */}
        <div className="flex items-center justify-between gap-2 flex-wrap z-20">
          {/* Language selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <Globe className="w-4 h-4 mr-2" />
              {regionName}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            <AnimatePresence>
              {showLanguageSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur-md rounded-lg border border-border shadow-xl p-2 min-w-[180px] max-h-[280px] overflow-y-auto z-50"
                >
                  {SUPPORTED_REGIONS.slice(0, 12).map((region) => (
                    <button
                      key={region.code}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedRegion === region.code 
                          ? 'bg-primary/20 text-primary' 
                          : 'text-foreground/80 hover:bg-muted'
                      }`}
                      onClick={() => handleLanguageChange(region.code)}
                    >
                      {region.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Provider attribution - shows correct product name */}
          <div className="hidden md:block">
            <ProviderAttribution
              chapterId={chapterId}
              providers={currentChapter?.providers || activeProviders}
              isActive={isPlaying || isGenerating}
            />
          </div>
          
          {/* Mute toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
            onClick={() => setMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Center - loading state or chapter badge only */}
        <div className="flex-1 flex items-end justify-center pb-20 z-10">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-white mb-2">
                The Genie is Awakening...
              </p>
              <p className="text-white/60 mb-4 text-sm">
                Generating {regionName} version
              </p>
              <Progress value={progress} className="w-48 mx-auto" />
            </motion.div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <p className="text-lg text-red-400 mb-4">{error}</p>
              <Button onClick={() => generateVideo(selectedRegion)} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </motion.div>
          ) : result && currentChapter ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPlayingChapter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <Badge className="mb-2 bg-amber-500/20 border-amber-500/30 text-amber-200">
                  Chapter {currentPlayingChapter + 1} of {chapters.length}
                </Badge>
                
                {/* Technical highlights as badges */}
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {highlights.map((highlight, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className="bg-black/40 border-white/30 text-white text-xs"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <p className="text-lg text-white/60 mb-4">Ready to experience the magic</p>
              <Button 
                onClick={handlePlayPause}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Play className="w-5 h-5 mr-2" /> Watch Demo
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Bottom controls */}
        <div className="space-y-3 z-20">
          {/* Mobile provider attribution */}
          <div className="md:hidden">
            <ProviderAttribution
              chapterId={chapterId}
              providers={currentChapter?.providers || []}
              isActive={isPlaying}
            />
          </div>
          
          {/* Chapter progress bar */}
          {result && chapters.length > 0 && (
            <div className="flex gap-1">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.chapterId}
                  onClick={() => playChapter(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    idx === currentPlayingChapter
                      ? 'bg-amber-400'
                      : idx < currentPlayingChapter
                        ? 'bg-white/40'
                        : 'bg-white/20'
                  }`}
                  title={CHAPTER_TITLES[ch.chapterId]?.title || ch.title}
                />
              ))}
            </div>
          )}
          
          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black rounded-full w-12 h-12 p-0"
                onClick={handlePlayPause}
                disabled={isGenerating}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => playChapter(Math.max(0, currentPlayingChapter - 1))}
                disabled={currentPlayingChapter === 0 || !result}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => playChapter(Math.min(chapters.length - 1, currentPlayingChapter + 1))}
                disabled={currentPlayingChapter >= chapters.length - 1 || !result}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Current TTS provider indicator */}
            {currentChapter && (
              <Badge variant="outline" className="bg-black/40 border-white/20 text-white/80">
                🔊 {currentChapter.ttsProvider}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroScriptVideo;
