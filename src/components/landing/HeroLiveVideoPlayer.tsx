/**
 * HERO LIVE VIDEO PLAYER
 * 
 * Live-generated video player for the landing page hero section.
 * Uses 6-zone TTS routing and displays provider badges.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Loader2, RefreshCw,
  Globe, Sparkles, Zap, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLiveVideoGeneration, ChapterResult } from '@/hooks/useLiveVideoGeneration';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { SUPPORTED_REGIONS } from '@/config/genie-sitemap';

interface HeroLiveVideoPlayerProps {
  className?: string;
  autoGenerate?: boolean;
}

// Visual backgrounds based on chapter type
const CHAPTER_BACKGROUNDS: Record<string, string> = {
  '3d_animated': 'from-purple-900/80 via-indigo-900/60 to-purple-800/80',
  'live_demo': 'from-orange-900/80 via-amber-900/60 to-orange-800/80',
  'ppt_slide': 'from-blue-900/80 via-cyan-900/60 to-blue-800/80',
  'avatar_presenter': 'from-emerald-900/80 via-teal-900/60 to-emerald-800/80',
  'full_body_avatar': 'from-rose-900/80 via-pink-900/60 to-rose-800/80',
  'immersive': 'from-violet-900/80 via-purple-900/60 to-violet-800/80',
};

// Provider color badges
const PROVIDER_COLORS: Record<string, string> = {
  'ElevenLabs': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Azure Neural': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Alibaba CosyVoice': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Claude': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'GPT-4o': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Gemini': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'ModelsLab': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Meshy AI': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export const HeroLiveVideoPlayer: React.FC<HeroLiveVideoPlayerProps> = ({
  className = '',
  autoGenerate = false,
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
    stopPlayback,
    reset,
    chapters,
    activeProviders,
  } = useLiveVideoGeneration();
  
  const { selectedRegion, setRegion, regionName } = useRegionalDetection();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Auto-generate on mount if enabled
  useEffect(() => {
    if (autoGenerate && !result && !isGenerating) {
      generateVideo();
    }
  }, [autoGenerate, result, isGenerating, generateVideo]);
  
  const handleLanguageChange = async (langCode: string) => {
    setRegion(langCode as any);
    setShowLanguageSelector(false);
    reset();
    await generateVideo(langCode);
  };
  
  const handlePlayPause = () => {
    if (!result) {
      generateVideo();
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
  };
  
  const handlePrevChapter = () => {
    const prevIndex = Math.max(0, currentPlayingChapter - 1);
    playChapter(prevIndex);
  };
  
  const handleNextChapter = () => {
    const nextIndex = Math.min(chapters.length - 1, currentPlayingChapter + 1);
    playChapter(nextIndex);
  };
  
  const currentChapter = chapters[currentPlayingChapter];
  const currentBackground = currentChapter 
    ? CHAPTER_BACKGROUNDS[currentChapter.visualType] || CHAPTER_BACKGROUNDS['3d_animated']
    : CHAPTER_BACKGROUNDS['3d_animated'];
  
  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}>
      {/* Background gradient based on chapter type */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentBackground}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Animated particles/effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ 
              y: '-20%',
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Main content area */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        {/* Top bar - Language selector & Zone info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/40 border-white/20 text-white hover:bg-black/60"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                <Globe className="w-4 h-4 mr-2" />
                {regionName}
              </Button>
              
              <AnimatePresence>
                {showLanguageSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-black/90 rounded-lg border border-white/20 p-2 min-w-[200px] z-50"
                  >
                    {SUPPORTED_REGIONS.slice(0, 10).map((region) => (
                      <button
                        key={region.code}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedRegion === region.code 
                            ? 'bg-primary/30 text-primary' 
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
            
            {/* Zone badge */}
            {result?.routing && (
              <Badge variant="outline" className="bg-black/40 border-white/20 text-white/80">
                <Zap className="w-3 h-3 mr-1" />
                {result.routing.zone} Zone
              </Badge>
            )}
          </div>
          
          {/* Provider badges */}
          {result && (
            <div className="flex items-center gap-2">
              {result.routing && (
                <Badge className={PROVIDER_COLORS[result.routing.provider] || 'bg-white/10 text-white'}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {result.routing.provider}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Center - Chapter content or loading */}
        <div className="flex-1 flex items-center justify-center">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-xl font-medium text-white mb-2">
                Generating Live Content
              </p>
              <p className="text-white/60 mb-4">
                Using 6-zone routing for {regionName}...
              </p>
              <Progress value={progress} className="w-64 mx-auto" />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-white mb-2">Generation Error</p>
              <p className="text-white/60 mb-4">{error}</p>
              <Button onClick={() => generateVideo()} variant="outline" className="border-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-2xl"
            >
              {/* Chapter title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlayingChapter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge className="mb-4 bg-white/10 text-white border-white/20">
                    Chapter {currentPlayingChapter + 1} of {chapters.length}
                  </Badge>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {currentChapter?.title || 'Ready to Play'}
                  </h3>
                  
                  {currentChapter?.technicalHighlights && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {currentChapter.technicalHighlights.slice(0, 4).map((highlight, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="bg-black/30 border-white/20 text-white/80 text-xs"
                        >
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Chapter providers */}
                  {currentChapter?.providers && currentChapter.providers.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentChapter.providers.slice(0, 5).map((provider, idx) => (
                        <Badge 
                          key={idx} 
                          className={PROVIDER_COLORS[provider] || 'bg-white/10 text-white'}
                        >
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Playback status */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center gap-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-purple-400 rounded-full"
                        animate={{ 
                          height: [12, 24, 12],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-sm ml-2">Playing voiceover...</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Experience Genie Studio Live
              </h3>
              <p className="text-white/60 mb-6 max-w-md">
                Generate a personalized demo video in {regionName} with 
                AI voiceover, regional routing, and live provider attribution.
              </p>
              <Button 
                onClick={() => generateVideo()}
                size="lg"
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                Generate Live Video
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Bottom bar - Playback controls */}
        <div className="flex items-center justify-between">
          {/* Chapter navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={handlePrevChapter}
              disabled={!result || currentPlayingChapter === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Chapter dots */}
            <div className="flex items-center gap-1">
              {chapters.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentPlayingChapter 
                      ? 'bg-purple-400' 
                      : idx < currentPlayingChapter 
                        ? 'bg-white/40' 
                        : 'bg-white/20'
                  }`}
                  onClick={() => playChapter(idx)}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleNextChapter}
              disabled={!result || currentPlayingChapter >= chapters.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Center controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={handlePlayPause}
              disabled={isGenerating}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
          </div>
          
          {/* Volume & info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            
            {result && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>
                  {result.metadata.successfulChapters}/{result.metadata.totalChapters} chapters
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroLiveVideoPlayer;
