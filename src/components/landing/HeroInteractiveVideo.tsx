/**
 * HERO INTERACTIVE VIDEO COMPONENT
 * 
 * Complete interactive video player with:
 * - Auto-generation on load (no click needed)
 * - Visual Genie lamp/avatar animations
 * - Product branding (Vibe, Deck, etc.)
 * - Full 12-provider matrix display
 * - Chapter navigation
 * - Language selector with true localization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Loader2, RefreshCw,
  Globe, Sparkles, ChevronLeft, ChevronRight,
  AlertCircle, ChevronDown, SkipForward, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLiveVideoGeneration, ChapterResult } from '@/hooks/useLiveVideoGeneration';
import { useLandingVideos, LandingVideo } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { SUPPORTED_REGIONS } from '@/config/genie-sitemap';
import { GenieLampVisual } from './GenieLampVisual';
import { VideoProviderMatrix } from './VideoProviderMatrix';

interface HeroInteractiveVideoProps {
  className?: string;
  onLanguageChange?: (langCode: string) => void;
  autoStart?: boolean;
}

// Chapter to product mapping
const CHAPTER_PRODUCTS: Record<string, string> = {
  opening: 'Genie Studio',
  spark: 'Genie Spark',
  mind: 'Genie Mind',
  vibe: 'Genie Vibe',
  deck: 'Genie Deck',
  arc: 'Genie Arc',
  askGenie: 'Ask Genie',
  cast: 'Genie Cast',
  closing: 'Genie Studio',
};

// Visual content types with animations
const VISUAL_TYPES: Record<string, {
  bg: string;
  animation: string;
  description: string;
}> = {
  '3d_animated': {
    bg: 'from-purple-900/90 via-indigo-900/80 to-violet-900/90',
    animation: 'animate-pulse',
    description: '3D Animation',
  },
  'live_demo': {
    bg: 'from-orange-900/90 via-amber-900/80 to-yellow-900/90',
    animation: '',
    description: 'Live Demo',
  },
  'ppt_slide': {
    bg: 'from-blue-900/90 via-cyan-900/80 to-blue-800/90',
    animation: '',
    description: 'Presentation',
  },
  'avatar_presenter': {
    bg: 'from-emerald-900/90 via-teal-900/80 to-green-900/90',
    animation: 'animate-pulse',
    description: 'AI Avatar',
  },
  'full_body_avatar': {
    bg: 'from-rose-900/90 via-pink-900/80 to-red-900/90',
    animation: 'animate-pulse',
    description: 'Full Body Avatar',
  },
  'immersive': {
    bg: 'from-violet-900/90 via-purple-900/80 to-fuchsia-900/90',
    animation: '',
    description: 'Immersive',
  },
};

export const HeroInteractiveVideo: React.FC<HeroInteractiveVideoProps> = ({
  className = '',
  onLanguageChange,
  autoStart = true,
}) => {
  const {
    isGenerating,
    progress,
    result,
    error,
    isPlaying,
    currentPlayingChapter,
    generateVideo,
    playChapter,
    pausePlayback,
    resumePlayback,
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
  const [isMuted, setIsMuted] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [showProviderMatrix, setShowProviderMatrix] = useState(false);

  // Auto-start generation on mount
  useEffect(() => {
    if (autoStart && !hasAutoStarted && !isGenerating && !result && adminVideos.length === 0) {
      setHasAutoStarted(true);
      generateVideo(selectedRegion);
    }
  }, [autoStart, hasAutoStarted, isGenerating, result, adminVideos.length, selectedRegion, generateVideo]);

  // Auto-play when generation completes
  useEffect(() => {
    if (result && chapters.length > 0 && !isPlaying && hasAutoStarted) {
      playChapter(0);
    }
  }, [result, chapters.length, isPlaying, hasAutoStarted, playChapter]);

  const handleLanguageChange = useCallback(async (langCode: string) => {
    setRegion(langCode as any);
    setShowLanguageSelector(false);
    onLanguageChange?.(langCode);
    reset();
    await generateVideo(langCode);
  }, [setRegion, onLanguageChange, reset, generateVideo]);

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

  const handlePrevChapter = useCallback(() => {
    const prevIndex = Math.max(0, currentPlayingChapter - 1);
    playChapter(prevIndex);
  }, [currentPlayingChapter, playChapter]);

  const handleNextChapter = useCallback(() => {
    const nextIndex = Math.min(chapters.length - 1, currentPlayingChapter + 1);
    playChapter(nextIndex);
  }, [currentPlayingChapter, chapters.length, playChapter]);

  const currentChapter = chapters[currentPlayingChapter];
  const visualType = currentChapter?.visualType || '3d_animated';
  const visualConfig = VISUAL_TYPES[visualType] || VISUAL_TYPES['3d_animated'];
  const currentProduct = CHAPTER_PRODUCTS[currentChapter?.chapterId || 'opening'];

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}>
      {/* Animated background based on visual type */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${visualConfig.bg}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Genie Lamp Visual */}
      <div className="absolute inset-0 flex items-center justify-center">
        <GenieLampVisual 
          isActive={isPlaying || isGenerating}
          currentProduct={currentChapter?.chapterId || 'opening'}
        />
      </div>
      
      {/* Floating particles for atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      
      {/* Main UI overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-black/70 via-transparent to-black/50">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language selector */}
            <div className="relative z-50">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/20 text-white hover:bg-black/70 text-xs md:text-sm"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{regionName}</span>
                <span className="sm:hidden">{selectedRegion.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              
              <AnimatePresence>
                {showLanguageSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur-md rounded-lg border border-border shadow-xl p-2 min-w-[180px] max-h-[300px] overflow-y-auto z-50"
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
            
            {/* Current product badge */}
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-200"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              {currentProduct}
            </Badge>
            
            {/* Visual type badge */}
            <Badge 
              variant="outline"
              className="bg-black/40 border-white/20 text-white/80 text-xs"
            >
              {visualConfig.description}
            </Badge>
          </div>
          
          {/* Provider toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setShowProviderMatrix(!showProviderMatrix)}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span className="text-xs">12 AI Providers</span>
          </Button>
        </div>
        
        {/* Provider matrix overlay */}
        <AnimatePresence>
          {showProviderMatrix && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-4 right-4 md:left-6 md:right-6 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10 z-40"
            >
              <VideoProviderMatrix
                activeProviders={currentChapter?.providers || activeProviders}
                currentCapability={visualType === 'avatar_presenter' ? 'avatar' : 'video'}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Center content */}
        <div className="flex-1 flex items-center justify-center">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-lg md:text-xl font-medium text-white mb-2">
                The Genie is Awakening...
              </p>
              <p className="text-white/60 text-sm md:text-base mb-4">
                Using 6-zone routing for {regionName}
              </p>
              <Progress value={progress} className="w-48 md:w-64 mx-auto" />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-white mb-2">Generation Error</p>
              <p className="text-white/60 text-sm mb-4">{error}</p>
              <Button onClick={() => generateVideo(selectedRegion)} variant="outline" className="border-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          ) : result && currentChapter ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-2xl px-4"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlayingChapter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge className="mb-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-200">
                    Chapter {currentPlayingChapter + 1} of {chapters.length}
                  </Badge>
                  
                  <h3 className="text-xl md:text-3xl font-bold text-white mb-3">
                    {currentChapter.title}
                  </h3>
                  
                  {/* Technical highlights */}
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {currentChapter.technicalHighlights?.slice(0, 4).map((highlight, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white/80 text-xs"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Active providers for this chapter */}
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {currentChapter.providers?.slice(0, 5).map((provider, idx) => (
                      <Badge 
                        key={idx}
                        className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-lg text-white/60 mb-4">
                Click play to experience the magic
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Bottom controls */}
        <div className="space-y-3">
          {/* Chapter progress */}
          {result && chapters.length > 0 && (
            <div className="flex gap-1">
              {chapters.map((chapter, idx) => (
                <button
                  key={chapter.chapterId}
                  onClick={() => playChapter(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    idx === currentPlayingChapter
                      ? 'bg-amber-400'
                      : idx < currentPlayingChapter
                        ? 'bg-white/40'
                        : 'bg-white/20'
                  }`}
                  title={chapter.title}
                />
              ))}
            </div>
          )}
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black rounded-full w-12 h-12 p-0"
                onClick={handlePlayPause}
                disabled={isGenerating}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              {/* Prev/Next */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={handlePrevChapter}
                disabled={currentPlayingChapter === 0 || !result}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={handleNextChapter}
                disabled={currentPlayingChapter >= chapters.length - 1 || !result}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              {/* Skip to end */}
              {result && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:text-white"
                  onClick={() => playChapter(chapters.length - 1)}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* TTS provider indicator */}
              {currentChapter && (
                <Badge 
                  variant="outline"
                  className="bg-black/40 border-white/20 text-white/80 text-xs hidden sm:flex"
                >
                  TTS: {currentChapter.ttsProvider} • {currentChapter.zone}
                </Badge>
              )}
              
              {/* Mute */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              
              {/* Regenerate */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => {
                  reset();
                  generateVideo(selectedRegion);
                }}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroInteractiveVideo;
