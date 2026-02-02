/**
 * GENIE VIDEO SHOWCASE - Landing Page Video Component
 * 
 * Features:
 * - Pre-generated video library from Supabase (admin-managed)
 * - IP-based regional video delivery
 * - AI Provider badges showing which providers powered each video
 * - Multi-language support with dynamic video switching
 * - Fallback to animated slides when no video available
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
  Cpu,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GENIE_STUDIO_FULL_SCRIPT, ChapterScript } from '@/config/genie-studio-video-script';
import { useLandingVideos, LandingVideo } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';

// Product logos - using uploaded combined versions
import genieStudioLogo from '@/assets/logos/genie-studio-combined-6.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined-2.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined-6.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined-7.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-presentation-6.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined-7.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo-2.png';

// AI Provider configurations with colors and icons
const AI_PROVIDERS: Record<string, { name: string; color: string; shortName: string }> = {
  alibaba: { name: 'Alibaba Cloud', color: 'bg-orange-500', shortName: 'Alibaba' },
  azure: { name: 'Azure AI', color: 'bg-blue-500', shortName: 'Azure' },
  elevenlabs: { name: 'ElevenLabs', color: 'bg-purple-500', shortName: 'ElevenLabs' },
  openai: { name: 'OpenAI', color: 'bg-green-500', shortName: 'OpenAI' },
  claude: { name: 'Claude', color: 'bg-orange-400', shortName: 'Claude' },
  deepseek: { name: 'DeepSeek', color: 'bg-cyan-500', shortName: 'DeepSeek' },
  gemini: { name: 'Google Gemini', color: 'bg-blue-400', shortName: 'Gemini' },
  meshy: { name: 'Meshy AI', color: 'bg-pink-500', shortName: 'Meshy' },
  modelslab: { name: 'ModelsLab', color: 'bg-indigo-500', shortName: 'ModelsLab' },
  deepl: { name: 'DeepL', color: 'bg-teal-500', shortName: 'DeepL' },
  replicate: { name: 'Replicate', color: 'bg-gray-500', shortName: 'Replicate' },
  gcp: { name: 'Google Cloud', color: 'bg-red-500', shortName: 'GCP' }
};

// Regional provider routing - which providers are used for which region
const REGIONAL_PROVIDER_ROUTING: Record<string, { tts: string; avatar: string; llm: string; translation: string }> = {
  en: { tts: 'elevenlabs', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  ar: { tts: 'azure', avatar: 'alibaba', llm: 'openai', translation: 'azure' },
  zh: { tts: 'alibaba', avatar: 'alibaba', llm: 'deepseek', translation: 'alibaba' },
  hi: { tts: 'azure', avatar: 'alibaba', llm: 'gemini', translation: 'azure' },
  ja: { tts: 'alibaba', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  ko: { tts: 'azure', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  es: { tts: 'elevenlabs', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  fr: { tts: 'elevenlabs', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  pt: { tts: 'azure', avatar: 'alibaba', llm: 'claude', translation: 'deepl' },
  de: { tts: 'azure', avatar: 'alibaba', llm: 'claude', translation: 'deepl' }
};

// Logo mapping
const PRODUCT_LOGOS: Record<string, string> = {
  opening: genieStudioLogo,
  spark: genieSparkLogo,
  mind: genieMindLogo,
  vibe: genieVibeLogo,
  deck: genieDeckLogo,
  arc: genieArcLogo,
  'ask-genie': askGenieLogo,
  cast: genieCastLogo,
  closing: genieStudioLogo
};

// Product taglines
const PRODUCT_TAGLINES: Record<string, string> = {
  opening: 'Mind to Media — AI-Powered Production Suite',
  spark: 'Ignite Your Ideas',
  mind: 'AI That Understands',
  vibe: 'Script to Screen',
  deck: 'Ideas to Impact',
  arc: 'Your Production Journey With Infinite Possibilities',
  'ask-genie': 'Your Wish is My Command',
  cast: 'Make It. Show It. Scale It.',
  closing: 'Your Wish is Our Command'
};

// Slide type visual configurations
const SLIDE_VISUALS: Record<string, React.CSSProperties> = {
  '3d_animated': {
    background: 'linear-gradient(135deg, hsl(270, 70%, 15%) 0%, hsl(280, 60%, 25%) 50%, hsl(270, 50%, 20%) 100%)'
  },
  'live_demo': {
    background: 'linear-gradient(135deg, hsl(35, 90%, 20%) 0%, hsl(25, 80%, 30%) 50%, hsl(35, 70%, 15%) 100%)'
  },
  'ppt_slide': {
    background: 'linear-gradient(135deg, hsl(220, 70%, 15%) 0%, hsl(230, 60%, 25%) 50%, hsl(220, 50%, 20%) 100%)'
  },
  'avatar_presenter': {
    background: 'linear-gradient(135deg, hsl(280, 60%, 15%) 0%, hsl(300, 50%, 25%) 50%, hsl(280, 40%, 20%) 100%)'
  },
  'full_body_avatar': {
    background: 'linear-gradient(135deg, hsl(200, 60%, 15%) 0%, hsl(210, 50%, 25%) 50%, hsl(200, 40%, 20%) 100%)'
  },
  'immersive': {
    background: 'linear-gradient(135deg, hsl(250, 80%, 10%) 0%, hsl(260, 70%, 20%) 50%, hsl(270, 60%, 15%) 100%)'
  }
};

// Language options with proper locale codes for Azure TTS
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', locale: 'ar-SA' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', locale: 'hi-IN' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', locale: 'te-IN' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', locale: 'ta-IN' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', locale: 'bn-IN' },
  { code: 'zh', name: '中文', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', locale: 'ko-KR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', locale: 'sw-KE' },
];

interface GenieVideoShowcaseProps {
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const GenieVideoShowcase: React.FC<GenieVideoShowcaseProps> = ({
  autoPlay = false,
  showControls = true,
  className = ''
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [isGenieVisible, setIsGenieVisible] = useState(true);
  const [showProviderBadges, setShowProviderBadges] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get regional detection for IP-based video serving
  const { selectedRegion, detectedRegion, setRegion, isRTL } = useRegionalDetection();
  
  // Fetch pre-generated videos from Supabase
  const { 
    videos, 
    loading: videosLoading, 
    getVideosByLanguage, 
    getFeaturedVideo,
    recordView 
  } = useLandingVideos({ 
    placement: 'hero_showcase',
    region: selectedRegion 
  });
  
  const chapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
  const currentChapter = chapters[currentChapterIndex];
  
  // Get current video for language/chapter
  const currentVideo = videos.find(v => 
    v.language_code === selectedRegion && 
    v.content_type === currentChapter.id
  ) || getFeaturedVideo(selectedRegion);
  
  // Get provider routing for current language
  const currentProviders = REGIONAL_PROVIDER_ROUTING[selectedRegion] || REGIONAL_PROVIDER_ROUTING.en;
  
  // Handle video playback
  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.src = currentVideo.video_url;
      videoRef.current.muted = isMuted;
      
      if (isPlaying) {
        videoRef.current.play().catch(() => setVideoError(true));
      }
      
      // Record view for analytics
      recordView(currentVideo.id);
    }
  }, [currentVideo, isPlaying, isMuted, recordView]);
  
  // Fallback: Auto-advance chapters when no video
  useEffect(() => {
    if (currentVideo || !isPlaying) return;
    
    const chapterDuration = parseInt(currentChapter.duration) * 1000 || 45000;
    const interval = 100;
    let elapsed = 0;
    
    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = (elapsed / chapterDuration) * 100;
      setProgress(newProgress);
      
      if (elapsed >= chapterDuration) {
        if (currentChapterIndex < chapters.length - 1) {
          setCurrentChapterIndex(prev => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
          setProgress(100);
        }
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, currentChapterIndex, currentChapter, chapters.length, currentVideo]);
  
  // Genie smoke effect on chapter change
  useEffect(() => {
    setIsGenieVisible(false);
    const timer = setTimeout(() => setIsGenieVisible(true), 300);
    return () => clearTimeout(timer);
  }, [currentChapterIndex]);
  
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
      setProgress(0);
      setVideoError(false);
    }
  }, [chapters.length]);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setVideoError(true));
      }
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  const handleLanguageChange = (langCode: string) => {
    setRegion(langCode as any);
    setShowLangSelector(false);
    setVideoError(false);
  };
  
  const getSlideStyle = (): React.CSSProperties => {
    const visualType = currentChapter.visual.type;
    return SLIDE_VISUALS[visualType] || SLIDE_VISUALS['3d_animated'];
  };

  // Provider Badge Component
  const ProviderBadge: React.FC<{ type: string; providerId: string }> = ({ type, providerId }) => {
    const provider = AI_PROVIDERS[providerId];
    if (!provider) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1"
      >
        <span className={`w-2 h-2 rounded-full ${provider.color}`} />
        <span className="text-[10px] text-white/60 uppercase">{type}</span>
        <span className="text-[10px] text-white/80">{provider.shortName}</span>
      </motion.div>
    );
  };

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Pre-generated Video Layer */}
      {currentVideo && !videoError && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-5"
          playsInline
          loop={false}
          onEnded={() => {
            if (currentChapterIndex < chapters.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
            } else {
              setIsPlaying(false);
            }
          }}
          onError={() => setVideoError(true)}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (video.duration) {
              setProgress((video.currentTime / video.duration) * 100);
            }
          }}
        />
      )}
      
      {/* Fallback: Enhanced Animated Background when no video */}
      {(!currentVideo || videoError) && (
        <>
          <motion.div 
            className="absolute inset-0"
            style={getSlideStyle()}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Dynamic particle system based on chapter */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating orbs - different colors per product */}
            {[...Array(20)].map((_, i) => {
              const colors = {
                opening: 'bg-purple-400',
                spark: 'bg-orange-400',
                mind: 'bg-blue-400',
                vibe: 'bg-green-400',
                deck: 'bg-yellow-400',
                arc: 'bg-pink-400',
                'ask-genie': 'bg-cyan-400',
                cast: 'bg-red-400',
                closing: 'bg-purple-400',
              };
              const color = colors[currentChapter.id as keyof typeof colors] || 'bg-white';
              return (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 ${color} rounded-full blur-sm`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.5, 1.5, 0.5],
                    y: [0, -30, 0],
                    x: [0, Math.random() > 0.5 ? 20 : -20, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
            
            {/* Floating screenshot mockups for live_demo chapters */}
            {currentChapter.visual.type === 'live_demo' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`screenshot-${i}`}
                    className="absolute bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl"
                    style={{
                      width: 150 + i * 30,
                      height: 100 + i * 20,
                      right: `${10 + i * 15}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3], 
                      scale: [0.95, 1, 0.95],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <div className="p-2">
                      <div className="flex gap-1 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-400/60" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                        <div className="w-2 h-2 rounded-full bg-green-400/60" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-white/20 rounded w-3/4" />
                        <div className="h-2 bg-white/10 rounded w-1/2" />
                        <div className="h-2 bg-purple-400/30 rounded w-2/3" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}

            {/* 3D rotating elements for 3d_animated chapters */}
            {currentChapter.visual.type === '3d_animated' && (
              <>
                <motion.div
                  className="absolute left-10 top-1/4 w-16 h-16"
                  animate={{
                    rotateY: 360,
                    rotateX: [0, 15, 0],
                  }}
                  transition={{
                    rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
                    rotateX: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-xl backdrop-blur-sm border border-white/20" />
                </motion.div>
                <motion.div
                  className="absolute right-16 bottom-1/3 w-12 h-12"
                  animate={{
                    rotateZ: -360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotateZ: { duration: 12, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400/40 to-blue-400/40 rounded-full backdrop-blur-sm border border-white/20" />
                </motion.div>
              </>
            )}

            {/* Avatar silhouette for avatar_presenter chapters */}
            {currentChapter.visual.type === 'avatar_presenter' && (
              <motion.div
                className="absolute right-8 bottom-20 w-32 h-48"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 0.6, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative w-full h-full">
                  {/* Head */}
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-300/40 to-purple-500/40 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Body */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-32 bg-gradient-to-b from-purple-400/30 to-transparent rounded-t-3xl" />
                  {/* Glow */}
                  <motion.div
                    className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full"
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {/* Presentation slides for ppt_slide chapters */}
            {currentChapter.visual.type === 'ppt_slide' && (
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ perspective: 1000 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`slide-${i}`}
                    className="absolute bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                    style={{
                      width: 200,
                      height: 120,
                      transformStyle: 'preserve-3d',
                    }}
                    initial={{ 
                      x: -100 + i * 30,
                      y: -60 + i * 20,
                      rotateY: -25 + i * 5,
                      z: -i * 50,
                    }}
                    animate={{
                      y: [-60 + i * 20, -70 + i * 20, -60 + i * 20],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <div className="p-3 h-full flex flex-col justify-between">
                      <div className="h-2 bg-white/30 rounded w-1/2" />
                      <div className="space-y-1">
                        <div className="h-1.5 bg-white/15 rounded w-full" />
                        <div className="h-1.5 bg-white/15 rounded w-3/4" />
                        <div className="h-1.5 bg-white/15 rounded w-1/2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Genie Lamp Effect - Enhanced */}
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              {/* Magic smoke particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`smoke-${i}`}
                  className="absolute -top-32 left-1/2 w-4 h-4 bg-purple-400/30 rounded-full blur-lg"
                  animate={{
                    y: [-20, -80, -120],
                    x: [0, (i % 2 ? 30 : -30) * (i / 3), 0],
                    opacity: [0.6, 0.3, 0],
                    scale: [0.5, 1.5, 2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
              
              {/* Lamp glow with pulsing rings */}
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-60"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-amber-400/30 rounded-full"
                animate={{
                  scale: [1, 2, 2.5],
                  opacity: [0.6, 0.2, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </>
      )}
      
      {/* Loading overlay */}
      {videosLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}
      
      {/* Main content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChapterIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 h-full flex flex-col items-center justify-center p-8"
        >
          {/* AI Provider Badges - Top Left - FIXED: Proper spacing to avoid overlap */}
          {showProviderBadges && (
            <motion.div 
              className="absolute top-4 left-4 flex flex-col gap-1 z-30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="text-[10px] text-white/70 uppercase font-medium">Powered by</span>
              </div>
              <div className="flex flex-col gap-1.5 px-2 py-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                <ProviderBadge type="Voice" providerId={currentProviders.tts} />
                <ProviderBadge type="Avatar" providerId={currentProviders.avatar} />
                <ProviderBadge type="LLM" providerId={currentProviders.llm} />
                <ProviderBadge type="Trans" providerId={currentProviders.translation} />
              </div>
            </motion.div>
          )}
          
          {/* Slide type indicator & duration - FIXED: Better positioning */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-30 max-w-[50%] flex-wrap justify-end">
            <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white/90 text-xs font-medium capitalize border border-white/10 whitespace-nowrap">
              {currentChapter.visual.type.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1.5 bg-purple-500/30 backdrop-blur-md rounded-full text-purple-200 text-xs border border-purple-500/20 whitespace-nowrap">
              {currentChapter.duration}
            </span>
            {currentVideo && (
              <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400 bg-green-500/20 whitespace-nowrap">
                Pre-rendered
              </Badge>
            )}
          </div>
          
          {/* Language selector */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLangSelector(!showLangSelector)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-2" />
                {LANGUAGES.find(l => l.code === selectedRegion)?.flag || '🌐'}
              </Button>
              
              <AnimatePresence>
                {showLangSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 min-w-[150px] z-50"
                  >
                    {LANGUAGES.map(lang => {
                      const hasVideo = videos.some(v => v.language_code === lang.code);
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedRegion === lang.code
                              ? 'bg-purple-500/30 text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                          {hasVideo && (
                            <span className="w-2 h-2 bg-green-400 rounded-full" title="Video available" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Product Logo with Genie effect - only show when no video */}
          {(!currentVideo || videoError) && (
            <motion.div
              animate={{
                opacity: isGenieVisible ? 1 : 0,
                scale: isGenieVisible ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
              className="relative mb-6"
            >
              {/* Smoke effect */}
              <motion.div
                className="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <img
                src={PRODUCT_LOGOS[currentChapter.id] || genieStudioLogo}
                alt={currentChapter.title}
                className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
              />
              
              {/* Orbiting sparkles for opening/closing */}
              {(currentChapter.id === 'opening' || currentChapter.id === 'closing') && (
                <>
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-8 h-8"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * (10 / 7),
                      }}
                    >
                      <motion.img
                        src={Object.values(PRODUCT_LOGOS)[i + 1]}
                        alt=""
                        className="w-8 h-8 object-contain"
                        style={{
                          transform: `translateX(${80 + i * 10}px)`,
                        }}
                        animate={{
                          scale: [0.8, 1, 0.8],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}
          
          {/* Chapter title - only show when no video */}
          {(!currentVideo || videoError) && (
            <>
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-white text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentChapter.title}
              </motion.h2>
              
              {/* Tagline */}
              <motion.p
                className="text-lg md:text-xl text-purple-200 text-center mb-6 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                "{PRODUCT_TAGLINES[currentChapter.id]}"
              </motion.p>
              
              {/* Technical highlights */}
              <motion.div
                className="flex flex-wrap justify-center gap-2 max-w-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentChapter.technicalHighlights.slice(0, 4).map((highlight, idx) => (
                  <motion.span
                    key={idx}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {highlight}
                  </motion.span>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
          {/* Progress bar */}
          <Progress value={progress} className="h-1 mb-4" />
          
          {/* Chapter indicators */}
          <div className="flex justify-center gap-1 mb-4">
            {chapters.map((chapter, idx) => (
              <button
                key={chapter.id}
                onClick={() => goToChapter(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentChapterIndex
                    ? 'bg-purple-500 w-8'
                    : idx < currentChapterIndex
                    ? 'bg-purple-400/60'
                    : 'bg-white/30'
                }`}
                title={chapter.title}
              />
            ))}
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToChapter(currentChapterIndex - 1)}
                disabled={currentChapterIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToChapter(currentChapterIndex + 1)}
                disabled={currentChapterIndex === chapters.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <span>{currentChapterIndex + 1} / {chapters.length}</span>
              {detectedRegion !== selectedRegion && (
                <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-400">
                  {LANGUAGES.find(l => l.code === detectedRegion)?.flag} detected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProviderBadges(!showProviderBadges)}
                className="text-white/60 hover:bg-white/20 text-xs"
              >
                <Cpu className="w-3 h-3 mr-1" />
                AI
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Closing smoke effect */}
      {currentChapter.id === 'closing' && progress > 90 && (
        <motion.div
          className="absolute inset-0 bg-purple-900/50 backdrop-blur-sm z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <img src={genieStudioLogo} alt="Genie Studio" className="w-32 h-32 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Your Wish is Our Command</h3>
              <p className="text-purple-200 mt-2">7 Products • 206 Pipelines • 14 Providers</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GenieVideoShowcase;
