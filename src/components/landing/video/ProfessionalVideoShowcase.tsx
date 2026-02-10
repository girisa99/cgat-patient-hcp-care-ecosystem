/**
 * PROFESSIONAL VIDEO SHOWCASE
 * 
 * Cinematic-quality video showcase for landing page featuring:
 * - AI-generated videos with avatar presenters
 * - Genie character transitions and 3D effects
 * - Regional language support with provider badges
 * - Professional overlay with chapter navigation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Film,
  Wand2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLandingVideos } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { GENIE_STUDIO_FULL_SCRIPT } from '@/config/genie-studio-video-script';

// Product logos
import genieStudioLogo from '@/assets/logos/genie-studio-combined-6.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined-2.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined-6.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined-7.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-presentation-6.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined-7.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo-2.png';

// Chapter configurations with premium styling
const CHAPTERS = [
  { id: 'opening', product: 'Genie Suite', tagline: 'Mind to Media', logo: genieStudioLogo, color: '#8B5CF6' },
  { id: 'spark', product: 'Genie Spark', tagline: 'Ignite Your Ideas', logo: genieSparkLogo, color: '#F97316' },
  { id: 'mind', product: 'Genie Mind', tagline: 'AI That Understands', logo: genieMindLogo, color: '#3B82F6' },
  { id: 'vibe', product: 'Genie Vibe', tagline: 'Script to Screen', logo: genieVibeLogo, color: '#10B981' },
  { id: 'deck', product: 'Genie Deck', tagline: 'Ideas to Impact', logo: genieDeckLogo, color: '#EAB308' },
  { id: 'arc', product: 'Genie Hub', tagline: 'Your Creative Command Center', logo: genieArcLogo, color: '#EC4899' },
  { id: 'askGenie', product: 'Ask Genie', tagline: 'Your Wish is My Command', logo: askGenieLogo, color: '#06B6D4' },
  { id: 'cast', product: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', logo: genieCastLogo, color: '#EF4444' },
  { id: 'closing', product: 'Genie Suite', tagline: 'Your Wish is Our Command', logo: genieStudioLogo, color: '#8B5CF6' },
];

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

interface ProfessionalVideoShowcaseProps {
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const ProfessionalVideoShowcase: React.FC<ProfessionalVideoShowcaseProps> = ({
  autoPlay = false,
  showControls = true,
  className = '',
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { selectedRegion, setRegion, isRTL } = useRegionalDetection();
  
  const { videos, loading: videosLoading, recordView } = useLandingVideos({
    placement: 'hero_showcase',
    region: selectedRegion,
  });

  const currentChapter = CHAPTERS[currentChapterIndex];
  const scriptChapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
  const currentScript = scriptChapters[currentChapterIndex];
  
  // Find matching video from database
  const currentVideo = videos.find(
    v => v.language_code === selectedRegion && v.content_type === currentChapter.id
  );

  const hasVideo = currentVideo && currentVideo.video_url && currentVideo.video_url.length > 0;

  // Video playback control
  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.src = currentVideo.video_url;
      videoRef.current.muted = isMuted;
      setVideoLoaded(false);
      
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
        recordView(currentVideo.id);
      }
    }
  }, [currentVideo, hasVideo, isPlaying, isMuted]);

  // Auto-advance for fallback (no video)
  useEffect(() => {
    if (hasVideo || !isPlaying) return;

    const duration = parseInt(currentScript?.duration || '30') * 1000;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (currentChapterIndex < CHAPTERS.length - 1) {
          setCurrentChapterIndex(prev => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentChapterIndex, hasVideo, currentScript]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isPlaying]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < CHAPTERS.length) {
      setCurrentChapterIndex(index);
      setProgress(0);
    }
  }, []);

  return (
    <div 
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Video Layer */}
      {hasVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-10"
          playsInline
          onEnded={() => {
            if (currentChapterIndex < CHAPTERS.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
            } else {
              setIsPlaying(false);
            }
          }}
          onTimeUpdate={e => {
            const video = e.currentTarget;
            if (video.duration) {
              setProgress((video.currentTime / video.duration) * 100);
            }
          }}
          onLoadedData={() => setVideoLoaded(true)}
        />
      )}

      {/* Professional Fallback - Premium Animated Scene */}
      {!hasVideo && (
        <div className="absolute inset-0 z-5">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${currentChapter.color}20 0%, transparent 50%, ${currentChapter.color}10 100%)`,
            }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Floating 3D elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4 + Math.random() * 8,
                  height: 4 + Math.random() * 8,
                  background: `radial-gradient(circle, ${currentChapter.color}80 0%, transparent 70%)`,
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: '120%', opacity: 0 }}
                animate={{ y: '-20%', opacity: [0, 0.8, 0] }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>

          {/* Center product logo with glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute -inset-8 rounded-full blur-2xl"
                style={{ background: `${currentChapter.color}30` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Logo container */}
              <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-center border border-white/20 shadow-2xl">
                <img
                  src={currentChapter.logo}
                  alt={currentChapter.product}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Magic lamp effect */}
              <motion.div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-t from-amber-500 to-amber-400 rounded-full blur-xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Wand2 className="absolute inset-0 m-auto w-6 h-6 text-amber-200" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* "Generating WoW content" message */}
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm text-white/80">
              Professional videos generating via Genie Cast...
            </span>
          </motion.div>
        </div>
      )}

      {/* Loading overlay */}
      {videosLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        </div>
      )}

      {/* Content Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChapterIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {/* Top bar - Provider badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
              <Film className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/80">Powered by 15 AI Providers</span>
            </div>
            
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm border-white/10 text-white/80"
            >
              {currentChapterIndex + 1} / {CHAPTERS.length}
            </Badge>
          </div>

          {/* Bottom overlay - Product info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {currentChapter.product}
              </h3>
              <p className="text-white/70 text-lg">{currentChapter.tagline}</p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          {/* Progress bar */}
          <Progress value={progress} className="h-1 rounded-none bg-white/20" />

          {/* Control bar */}
          <div className="p-3 bg-black/60 backdrop-blur-sm flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white hover:bg-white/10"
                onClick={() => goToChapter(currentChapterIndex - 1)}
                disabled={currentChapterIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-white hover:bg-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white hover:bg-white/10"
                onClick={() => goToChapter(currentChapterIndex + 1)}
                disabled={currentChapterIndex === CHAPTERS.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white hover:bg-white/10"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Chapter indicators */}
            <div className="hidden md:flex items-center gap-1">
              {CHAPTERS.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentChapterIndex 
                      ? 'w-6 bg-white' 
                      : idx < currentChapterIndex 
                        ? 'bg-white/60' 
                        : 'bg-white/30'
                  }`}
                  style={{
                    backgroundColor: idx === currentChapterIndex ? chapter.color : undefined,
                  }}
                />
              ))}
            </div>

            {/* Language selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-2"
                onClick={() => setShowLangSelector(!showLangSelector)}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {LANGUAGES.find(l => l.code === selectedRegion)?.flag}
                </span>
              </Button>

              <AnimatePresence>
                {showLangSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 grid grid-cols-2 gap-1 min-w-[200px]"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setRegion(lang.code as any);
                          setShowLangSelector(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                          selectedRegion === lang.code 
                            ? 'bg-primary/30 text-white' 
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalVideoShowcase;
