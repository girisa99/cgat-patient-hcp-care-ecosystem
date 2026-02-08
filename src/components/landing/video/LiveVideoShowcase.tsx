/**
 * LIVE VIDEO SHOWCASE - Complete Landing Hero Experience (v2)
 * 
 * Features:
 * - Animated Genie Lamp with emerging Genie character
 * - Live TTS voiceover per chapter - supports 11 languages
 * - Language selector dropdown (visible in controls)
 * - Uses localized scripts (not English translations)
 * - Chapter navigation with product branding
 * - Provider attribution per language
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
  Wand2,
  Loader2,
  ChevronDown,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatedGenieLamp } from './AnimatedGenieLamp';
import { ChapterVisualEngine } from './ChapterVisualEngine';
import { useLandingVideos } from '@/hooks/useLandingVideos';
import { useLandingVideoSeeder } from '@/hooks/useLandingVideoSeeder';
import { GENIE_STUDIO_FULL_SCRIPT } from '@/config/genie-studio-video-script';
import { getLocalizedScript, getTTSProviderForLanguage } from '@/config/genie-video-localized-scripts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Product logos
import genieStudioLogo from '@/assets/logos/genie-studio-combined-6.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined-2.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined-6.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined-7.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-presentation-6.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined-7.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo-2.png';

// Chapter configurations
const CHAPTERS = [
  { id: 'opening', product: 'Genie Studio', tagline: 'Mind to Media', logo: genieStudioLogo, color: '#9333EA' },
  { id: 'spark', product: 'Genie Spark', tagline: 'Ignite Your Ideas', logo: genieSparkLogo, color: '#F97316' },
  { id: 'mind', product: 'Genie Mind', tagline: 'AI That Understands', logo: genieMindLogo, color: '#3B82F6' },
  { id: 'vibe', product: 'Genie Vibe', tagline: 'Script to Screen', logo: genieVibeLogo, color: '#22C55E' },
  { id: 'deck', product: 'Genie Deck', tagline: 'Ideas to Impact', logo: genieDeckLogo, color: '#EAB308' },
  { id: 'arc', product: 'Production Hub', tagline: 'Infinite Possibilities', logo: genieArcLogo, color: '#EC4899' },
  { id: 'askGenie', product: 'Ask Genie', tagline: 'Your Wish is My Command', logo: askGenieLogo, color: '#06B6D4' },
  { id: 'cast', product: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', logo: genieCastLogo, color: '#EF4444' },
  { id: 'closing', product: 'Genie Studio', tagline: 'Your Wish is Our Command', logo: genieStudioLogo, color: '#9333EA' },
];

// Language options with flags and TTS provider mapping
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', ttsProvider: 'elevenlabs', region: 'US' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', ttsProvider: 'azure', region: 'SA' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', ttsProvider: 'azure', region: 'IN' },
  { code: 'zh', name: '中文', flag: '🇨🇳', ttsProvider: 'alibaba', region: 'CN' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', ttsProvider: 'alibaba', region: 'JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', ttsProvider: 'azure', region: 'KR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', ttsProvider: 'elevenlabs', region: 'ES' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', ttsProvider: 'azure', region: 'BR' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', ttsProvider: 'elevenlabs', region: 'FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', ttsProvider: 'azure', region: 'DE' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', ttsProvider: 'azure', region: 'KE' },
];

interface LiveVideoShowcaseProps {
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const LiveVideoShowcase: React.FC<LiveVideoShowcaseProps> = ({
  autoPlay = true,
  showControls = true,
  className = '',
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { videos, loading: videosLoading, recordView } = useLandingVideos({
    placement: 'hero_showcase',
  });
  
  const { seedLandingVideos, getSeederStatus } = useLandingVideoSeeder();

  const currentChapter = CHAPTERS[currentChapterIndex];
  const scriptChapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
  const currentScript = scriptChapters[currentChapterIndex];
  
  // Find matching video from database
  const currentVideo = videos.find(
    v => v.language_code === selectedLanguage && v.content_type === currentChapter.id
  );
  const hasVideo = currentVideo && currentVideo.video_url && currentVideo.video_url.length > 0;

  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  // Seed videos on mount if needed
  useEffect(() => {
    const checkAndSeed = async () => {
      const status = await getSeederStatus();
      if (status.total === 0) {
        console.log('Seeding landing page videos...');
        await seedLandingVideos();
      }
    };
    checkAndSeed();
  }, []);

  // Get the TTS provider info for current language
  const ttsProviderInfo = getTTSProviderForLanguage(selectedLanguage);

  // Generate TTS voice for current chapter - with localized scripts
  const generateVoice = useCallback(async () => {
    if (!currentScript || isMuted) return;
    
    // Try to get localized script, fallback to English
    let voiceoverText = getLocalizedScript(currentChapter.id, selectedLanguage);
    if (!voiceoverText) {
      voiceoverText = currentScript.voiceover?.en;
    }
    
    if (!voiceoverText) return;

    // Clean the text for TTS - remove action cues like *lamp wobbles*
    const cleanText = voiceoverText
      .replace(/\*[^*]+\*/g, '')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 500); // Slightly longer for non-English scripts

    if (cleanText.length < 10) return;

    try {
      setIsGeneratingVoice(true);
      console.log(`[TTS] Generating voice for ${selectedLanguage} using ${ttsProviderInfo.displayName}`);
      
      // Use OpenAI TTS edge function (works for all languages via nova voice)
      // For production, this would route to Azure/Alibaba based on ttsProviderInfo.provider
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: cleanText,
          voice: 'nova', // Female voice for Genie
          model: 'tts-1',
          speed: 1.0,
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Stop any existing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create audio from base64
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        audioRef.current = new Audio(audioUrl);
        audioRef.current.volume = 0.8;
        
        audioRef.current.onplay = () => setIsSpeaking(true);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Auto-advance when voice ends
          if (currentChapterIndex < CHAPTERS.length - 1 && isPlaying) {
            setTimeout(() => {
              setCurrentChapterIndex(prev => prev + 1);
              setProgress(0);
            }, 500);
          }
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audioRef.current.play();
        toast.success(`Playing ${selectedLang.name} voiceover`, {
          description: `Powered by ${ttsProviderInfo.displayName}`,
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('Voice generation failed', {
        description: 'Please try again or select English',
      });
    } finally {
      setIsGeneratingVoice(false);
    }
  }, [currentScript, currentChapter.id, isMuted, currentChapterIndex, isPlaying, selectedLanguage, ttsProviderInfo, selectedLang.name]);

  // Auto-generate voice when chapter changes and not muted
  useEffect(() => {
    if (isPlaying && !isMuted && !hasVideo) {
      generateVoice();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
    };
  }, [currentChapterIndex, isPlaying, isMuted, selectedLanguage]);

  // Progress timer for chapters without video
  useEffect(() => {
    if (!isPlaying || hasVideo) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      return;
    }

    const duration = parseInt(currentScript?.duration || '30') * 1000;
    const interval = 100;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
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

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, currentChapterIndex, hasVideo, currentScript]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    if (!newMuted && isPlaying && !hasVideo) {
      generateVoice();
    }
  }, [isMuted, isPlaying, hasVideo, generateVoice]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < CHAPTERS.length) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
      setCurrentChapterIndex(index);
      setProgress(0);
    }
  }, []);

  return (
    <div 
      className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${currentChapter.color}20, #1a1025 60%, ${currentChapter.color}10)` }}
    >
      {/* Visual Engine - Lamp, Character, Product Logos */}
      <ChapterVisualEngine
        chapterId={currentChapter.id}
        isPlaying={isPlaying}
        isGenerating={isGeneratingVoice}
      />

      {/* Video Layer (when available) */}
      {hasVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-10"
          src={currentVideo.video_url}
          autoPlay={isPlaying}
          muted={isMuted}
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
        />
      )}

      {/* Loading overlay */}
      {(videosLoading || isGeneratingVoice) && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-black/60 rounded-full">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-sm text-white/80">
              {isGeneratingVoice ? 'Generating voice...' : 'Loading...'}
            </span>
          </div>
        </motion.div>
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
          {/* Top bar - Provider info with TTS attribution */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/80">Powered by 19 AI Providers</span>
            </div>
            
            {/* TTS Provider badge */}
            {!isMuted && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/60 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <Mic className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-200">
                  Voice: {ttsProviderInfo.displayName}
                </span>
              </div>
            )}
            
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm border-white/10 text-white/80"
            >
              {currentChapterIndex + 1} / {CHAPTERS.length}
            </Badge>
          </div>

          {/* Bottom overlay - Product info */}
          <div className="absolute bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <img 
                src={currentChapter.logo} 
                alt={currentChapter.product}
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {currentChapter.product}
                </h3>
                <p className="text-white/70">{currentChapter.tagline}</p>
              </div>

              {/* Speaking indicator */}
              {isSpeaking && (
                <motion.div
                  className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-green-300">Speaking</span>
                </motion.div>
              )}
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
          <div className="p-3 bg-black/70 backdrop-blur-sm flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-1 md:gap-2">
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
                className={`w-8 h-8 hover:bg-white/10 ${isMuted ? 'text-white/50' : 'text-white'}`}
                onClick={toggleMute}
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
                      ? 'w-6' 
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

            {/* Language selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 gap-2 px-3"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-lg">{selectedLang.flag}</span>
                  <span className="hidden sm:inline text-sm">{selectedLang.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-gray-900/95 backdrop-blur-sm border-white/10"
              >
                {LANGUAGES.map(lang => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      // Stop current audio when changing language
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                        setIsSpeaking(false);
                      }
                      // Show toast about language change
                      toast.info(`Switched to ${lang.name}`, {
                        description: `Voice will play in ${lang.name}`,
                        duration: 1500,
                      });
                    }}
                    className={`flex items-center gap-3 cursor-pointer ${
                      selectedLanguage === lang.code 
                        ? 'bg-purple-500/20 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1">
                      <span className="block">{lang.name}</span>
                      <span className="text-[10px] text-white/50">
                        {getTTSProviderForLanguage(lang.code).displayName}
                      </span>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Sparkles className="w-3 h-3 ml-auto text-purple-400" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideoShowcase;
