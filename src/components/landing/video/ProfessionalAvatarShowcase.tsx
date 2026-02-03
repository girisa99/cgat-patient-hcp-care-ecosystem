/**
 * PROFESSIONAL AVATAR SHOWCASE (v3)
 * 
 * High-level product overview with:
 * - Simplified scripts focused on product VALUE (not UI details)
 * - Real AI video from DB when available, placeholder fallback
 * - 4-Zone TTS routing (ElevenLabs, Azure, Alibaba, Google)
 * - Regional languages: South Asian, SEA, African, Caribbean
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Loader2,
  ChevronDown,
  Mic,
  Video,
  Headphones,
  User,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CHAPTERS,
  AVAILABLE_LANGUAGES,
  getHighLevelScript,
  getTTSRouting,
  getFullLanguageCode,
} from '@/config/genie-video-high-level-scripts';

// Product logos
import genieStudioLogo from '@/assets/logos/genie-studio-combined-6.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined-2.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined-6.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined-7.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-presentation-6.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined-7.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo-2.png';

// Logo mapping
const PRODUCT_LOGOS: Record<string, string> = {
  'Genie Studio': genieStudioLogo,
  'Genie Spark': genieSparkLogo,
  'Genie Mind': genieMindLogo,
  'Genie Vibe': genieVibeLogo,
  'Genie Deck': genieDeckLogo,
  'Production Hub': genieArcLogo,
  'Ask Genie': askGenieLogo,
  'Genie Cast': genieCastLogo,
};

// Product colors
const PRODUCT_COLORS: Record<string, string> = {
  'opening': '#9333EA',
  'spark': '#F97316',
  'mind': '#3B82F6',
  'vibe': '#22C55E',
  'deck': '#EAB308',
  'arc': '#EC4899',
  'askGenie': '#06B6D4',
  'cast': '#EF4444',
  'closing': '#9333EA',
};

// Regional avatar configurations
const REGIONAL_AVATARS: Record<string, { male: string; female: string; provider: string }> = {
  en: { male: 'James', female: 'Sarah', provider: 'Vertex AI Veo' },
  hi: { male: 'Rahul', female: 'Priya', provider: 'Alibaba WAN' },
  bn: { male: 'Arjun', female: 'Ishita', provider: 'Alibaba WAN' },
  ur: { male: 'Ahmed', female: 'Fatima', provider: 'Alibaba WAN' },
  ar: { male: 'Omar', female: 'Layla', provider: 'Alibaba WAN' },
  id: { male: 'Budi', female: 'Sari', provider: 'Alibaba WAN' },
  sw: { male: 'Juma', female: 'Amina', provider: 'Alibaba WAN' },
  de: { male: 'Hans', female: 'Emma', provider: 'Vertex AI Veo' },
  fr: { male: 'Pierre', female: 'Sophie', provider: 'Vertex AI Veo' },
  es: { male: 'Carlos', female: 'Maria', provider: 'Vertex AI Veo' },
  pt: { male: 'Pedro', female: 'Ana', provider: 'Vertex AI Veo' },
  zh: { male: 'Wei', female: 'Mei', provider: 'Alibaba WAN' },
  ja: { male: 'Takeshi', female: 'Yuki', provider: 'Alibaba WAN' },
  ko: { male: 'Joon', female: 'Min-ji', provider: 'Alibaba WAN' },
};

interface ProfessionalAvatarShowcaseProps {
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const ProfessionalAvatarShowcase: React.FC<ProfessionalAvatarShowcaseProps> = ({
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
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [currentAvatarGender, setCurrentAvatarGender] = useState<'male' | 'female'>('female');
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [loadingVideo, setLoadingVideo] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = CHAPTERS[currentChapterIndex];
  const currentColor = PRODUCT_COLORS[currentChapter.id] || '#9333EA';
  const currentLogo = PRODUCT_LOGOS[currentChapter.product] || genieStudioLogo;
  const selectedLang = AVAILABLE_LANGUAGES.find(l => l.code === selectedLanguage) || AVAILABLE_LANGUAGES[0];
  const regionalAvatar = REGIONAL_AVATARS[selectedLanguage] || REGIONAL_AVATARS.en;
  const ttsConfig = getTTSRouting(selectedLanguage);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_page_videos')
          .select('video_url, language_code, title')
          .eq('is_active', true)
          .eq('placement', 'hero_showcase');

        if (error) throw error;

        const urls: Record<string, string> = {};
        data?.forEach((video: { video_url: string | null; language_code: string; title: string }) => {
          if (video.video_url) {
            const key = `${video.language_code}_${video.title.toLowerCase().includes('spark') ? 'spark' : 
              video.title.toLowerCase().includes('mind') ? 'mind' :
              video.title.toLowerCase().includes('vibe') ? 'vibe' :
              video.title.toLowerCase().includes('deck') ? 'deck' :
              video.title.toLowerCase().includes('arc') ? 'arc' :
              video.title.toLowerCase().includes('ask') ? 'askGenie' :
              video.title.toLowerCase().includes('cast') ? 'cast' : 'opening'}`;
            urls[key] = video.video_url;
          }
        });
        setVideoUrls(urls);
      } catch (err) {
        console.warn('[Video] Could not fetch videos from DB:', err);
      }
    };

    fetchVideos();
  }, []);

  // Get audio output devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(audioOutputs);
        
        // Auto-select headphones
        const headset = audioOutputs.find(d => 
          d.label.toLowerCase().includes('headphone') || 
          d.label.toLowerCase().includes('headset') ||
          d.label.toLowerCase().includes('airpod') ||
          d.label.toLowerCase().includes('earbud')
        );
        
        if (headset) {
          setSelectedAudioDevice(headset.deviceId);
          console.log('[Audio] Auto-selected headset:', headset.label);
        } else if (audioOutputs.length > 0) {
          setSelectedAudioDevice(audioOutputs[0].deviceId);
        }
      } catch (err) {
        console.warn('[Audio] Could not enumerate devices:', err);
      }
    };
    
    getAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
  }, []);

  // Set audio output device
  const setAudioOutput = useCallback(async (audio: HTMLAudioElement, deviceId: string) => {
    if (!deviceId) return;
    try {
      // @ts-ignore - setSinkId is not in all browser types
      if (typeof audio.setSinkId === 'function') {
        await audio.setSinkId(deviceId);
      }
    } catch (err) {
      console.warn('[Audio] Could not set output device:', err);
    }
  }, []);

  // Generate TTS voice - delegates to edge function for 4-zone routing
  const generateVoice = useCallback(async () => {
    if (isMuted) return;
    
    const script = getHighLevelScript(currentChapter.id, selectedLanguage);
    if (!script || script.length < 10) return;

    // Clean script for TTS
    const cleanText = script
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 800);

    const languageCode = getFullLanguageCode(selectedLanguage);

    try {
      setIsGeneratingVoice(true);
      
      console.log(`[TTS] Generating ${languageCode} voice via ${ttsConfig.provider} (${ttsConfig.zone})`);
      
      // Let edge function handle 4-zone routing - DON'T pass provider!
      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: cleanText,
          languageCode: languageCode,
          tier: 'premium',
        }
      });

      if (error) {
        console.warn('[TTS] Failed:', error.message);
        toast.error(`Voice generation failed: ${error.message}`);
        return;
      }

      if (data?.provider) {
        console.log(`[TTS] ✅ Generated via ${data.provider} (${data.zone || ttsConfig.zone})`);
      }

      if (data?.audioContent || data?.audio_base64) {
        await playAudio(data.audioContent || data.audio_base64);
      }
    } catch (err) {
      console.error('[TTS] Error:', err);
    } finally {
      setIsGeneratingVoice(false);
    }
  }, [currentChapter.id, isMuted, selectedLanguage, ttsConfig]);

  // Play audio
  const playAudio = useCallback(async (base64Audio: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioBlob = new Blob(
      [Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))],
      { type: 'audio/mp3' }
    );
    const audioUrl = URL.createObjectURL(audioBlob);

    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = 0.8;
    
    if (selectedAudioDevice) {
      await setAudioOutput(audioRef.current, selectedAudioDevice);
    }
    
    audioRef.current.onplay = () => setIsSpeaking(true);
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      // Auto-advance to next chapter
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
    toast.success(`${selectedLang.name} voiceover`, {
      description: `${ttsConfig.displayName} • ${ttsConfig.zone}`,
      duration: 2000,
    });
  }, [selectedAudioDevice, setAudioOutput, currentChapterIndex, isPlaying, selectedLang.name, ttsConfig]);

  // Generate voice when chapter changes (if not muted)
  useEffect(() => {
    if (isPlaying && !isMuted) {
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

  // Progress timer
  useEffect(() => {
    if (!isPlaying) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const duration = currentChapter.durationSeconds * 1000;
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
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentChapterIndex, currentChapter.durationSeconds]);

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
    if (!newMuted && isPlaying) {
      generateVoice();
    }
  }, [isMuted, isPlaying, generateVoice]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < CHAPTERS.length) {
      setCurrentChapterIndex(index);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
    }
  }, []);

  // Check if we have a real video for current chapter/language
  const currentVideoUrl = videoUrls[`${selectedLanguage}_${currentChapter.id}`];
  const hasRealVideo = Boolean(currentVideoUrl);

  // Current script text for display
  const currentScript = useMemo(() => {
    return getHighLevelScript(currentChapter.id, selectedLanguage);
  }, [currentChapter.id, selectedLanguage]);

  return (
    <div className={`relative w-full aspect-video bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-xl overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${currentColor}40, transparent 70%)`,
        }}
      />
      
      {/* Video or Placeholder Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentChapter.id}-${selectedLanguage}`}
          className="absolute inset-0 flex items-center justify-center p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {hasRealVideo ? (
            // Real AI-generated video from database
            <video
              ref={videoRef}
              src={currentVideoUrl}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              muted={isMuted}
              loop={false}
              playsInline
            />
          ) : (
            // Placeholder: Avatar + Product Card
            <div className="relative flex items-center gap-8 max-w-4xl mx-auto">
              {/* Avatar placeholder */}
              <motion.div
                className="relative"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div 
                  className="absolute -inset-4 rounded-full blur-2xl opacity-40"
                  style={{ background: currentColor }}
                />
                
                <div 
                  className="relative w-40 h-52 md:w-52 md:h-64 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor}30, #1a1a2e, ${currentColor}15)`,
                  }}
                >
                  {/* Avatar silhouette */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full mb-3"
                      style={{ background: `linear-gradient(135deg, ${currentColor}60, ${currentColor}30)` }}
                    />
                    <p className="text-white/90 font-medium text-sm md:text-base">
                      {currentAvatarGender === 'female' ? regionalAvatar.female : regionalAvatar.male}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-[10px] border-white/20 text-white/60"
                    >
                      {regionalAvatar.provider}
                    </Badge>
                  </div>
                  
                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <motion.div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 rounded-full"
                          style={{ background: currentColor }}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Product card */}
              <motion.div
                className="relative flex-1 max-w-md"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <img 
                    src={currentLogo} 
                    alt={currentChapter.product}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain mb-4"
                  />
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {currentChapter.product}
                  </h3>
                  <p 
                    className="text-lg font-medium mb-4"
                    style={{ color: currentColor }}
                  >
                    {currentChapter.tagline}
                  </p>
                  
                  {/* Script preview */}
                  {currentScript && (
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {currentScript.slice(0, 150)}...
                    </p>
                  )}
                </div>
              </motion.div>
              
              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top bar - Provider attribution */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <Video className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/80">
            {hasRealVideo ? 'AI Video' : 'Placeholder'} • {regionalAvatar.provider}
          </span>
        </div>
        
        {!isMuted && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/60 backdrop-blur-sm rounded-lg border border-purple-500/30">
            <Mic className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-200">
              {ttsConfig.displayName} • {ttsConfig.zone}
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
      <div className="absolute bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <img 
            src={currentLogo} 
            alt={currentChapter.product}
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {currentChapter.product}
            </h3>
            <p className="text-white/70">{currentChapter.tagline}</p>
          </div>

          {isSpeaking && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30"
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

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <Progress value={progress} className="h-1 rounded-none bg-white/20" />

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
            </div>

            {/* Center - Chapter dots */}
            <div className="hidden md:flex items-center gap-1.5">
              {CHAPTERS.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentChapterIndex 
                      ? 'w-6 bg-white' 
                      : idx < currentChapterIndex 
                        ? 'bg-white/60' 
                        : 'bg-white/30'
                  }`}
                  onClick={() => goToChapter(idx)}
                  title={chapter.product}
                />
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Avatar gender toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white hover:bg-white/10"
                onClick={() => setCurrentAvatarGender(g => g === 'male' ? 'female' : 'male')}
                title={`Switch to ${currentAvatarGender === 'male' ? 'female' : 'male'} avatar`}
              >
                <User className="w-4 h-4" />
              </Button>

              {/* Audio device selector */}
              {audioDevices.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-white hover:bg-white/10"
                    >
                      <Headphones className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Audio Output</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {audioDevices.map(device => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => setSelectedAudioDevice(device.deviceId)}
                        className={selectedAudioDevice === device.deviceId ? 'bg-primary/20' : ''}
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        <span className="truncate">{device.label || 'Audio Device'}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mute/unmute */}
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 hover:bg-white/10 ${
                  isMuted ? 'text-white/60' : 'text-white'
                }`}
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* Language selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-white hover:bg-white/10 gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-lg">{selectedLang.flag}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AVAILABLE_LANGUAGES.map(lang => {
                    const config = getTTSRouting(lang.code);
                    return (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          if (!isMuted && isPlaying) {
                            setTimeout(() => generateVoice(), 100);
                          }
                        }}
                        className={selectedLanguage === lang.code ? 'bg-primary/20' : ''}
                      >
                        <span className="text-lg mr-2">{lang.flag}</span>
                        <span className="flex-1">{lang.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          {config.displayName}
                        </Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isGeneratingVoice && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-black/60 rounded-full">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-sm text-white/80">
              Generating {selectedLang.name} voice via {ttsConfig.displayName}...
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfessionalAvatarShowcase;
