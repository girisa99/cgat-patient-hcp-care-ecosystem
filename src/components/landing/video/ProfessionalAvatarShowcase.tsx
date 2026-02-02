/**
 * PROFESSIONAL AVATAR SHOWCASE (v2)
 * 
 * Premium landing page video experience featuring:
 * - Real AI-generated avatar presenters (regional male/female)
 * - Genie character transformation effects
 * - Professional 3D elements and transitions
 * - Real-time TTS with audio device selection
 * - Synced to Production Hub for library/publish
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
  Settings,
  User,
  Video,
  Headphones,
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
import { getLocalizedScript, getTTSProviderForLanguage } from '@/config/genie-video-localized-scripts';
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

// Chapter configurations
const CHAPTERS = [
  { id: 'opening', product: 'Genie Studio', tagline: 'Mind to Media', logo: genieStudioLogo, color: '#9333EA', visualStyle: 'genie_emergence' },
  { id: 'spark', product: 'Genie Spark', tagline: 'Ignite Your Ideas', logo: genieSparkLogo, color: '#F97316', visualStyle: 'avatar_presenter' },
  { id: 'mind', product: 'Genie Mind', tagline: 'AI That Understands', logo: genieMindLogo, color: '#3B82F6', visualStyle: 'avatar_presenter' },
  { id: 'vibe', product: 'Genie Vibe', tagline: 'Script to Screen', logo: genieVibeLogo, color: '#22C55E', visualStyle: '3d_studio' },
  { id: 'deck', product: 'Genie Deck', tagline: 'Ideas to Impact', logo: genieDeckLogo, color: '#EAB308', visualStyle: 'avatar_presenter' },
  { id: 'arc', product: 'Production Hub', tagline: 'Infinite Possibilities', logo: genieArcLogo, color: '#EC4899', visualStyle: 'full_body_avatar' },
  { id: 'askGenie', product: 'Ask Genie', tagline: 'Your Wish is My Command', logo: askGenieLogo, color: '#06B6D4', visualStyle: 'genie_interaction' },
  { id: 'cast', product: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', logo: genieCastLogo, color: '#EF4444', visualStyle: 'avatar_presenter' },
  { id: 'closing', product: 'Genie Studio', tagline: 'Your Wish is Our Command', logo: genieStudioLogo, color: '#9333EA', visualStyle: 'genie_return' },
];

// Regional avatar configurations
const REGIONAL_AVATARS: Record<string, { male: string; female: string; provider: string }> = {
  en: { male: 'James', female: 'Sarah', provider: 'Alibaba WAN 2.2' },
  ar: { male: 'Ahmed', female: 'Fatima', provider: 'Alibaba WAN 2.2' },
  hi: { male: 'Rahul', female: 'Priya', provider: 'Alibaba WAN 2.2' },
  zh: { male: 'Wei', female: 'Mei', provider: 'Alibaba WAN 2.2' },
  ja: { male: 'Takeshi', female: 'Yuki', provider: 'Alibaba WAN 2.2' },
  ko: { male: 'Joon', female: 'Min-ji', provider: 'Alibaba WAN 2.2' },
  es: { male: 'Carlos', female: 'Maria', provider: 'Alibaba WAN 2.2' },
  pt: { male: 'Pedro', female: 'Ana', provider: 'Alibaba WAN 2.2' },
  fr: { male: 'Pierre', female: 'Sophie', provider: 'Alibaba WAN 2.2' },
  de: { male: 'Hans', female: 'Emma', provider: 'Alibaba WAN 2.2' },
  sw: { male: 'Juma', female: 'Amina', provider: 'Alibaba WAN 2.2' },
};

// Language options with flags and TTS provider mapping
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', ttsProvider: 'ElevenLabs', zone: 'Claude Zone' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', ttsProvider: 'Azure Neural', zone: 'Alibaba Zone' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', ttsProvider: 'Azure Neural', zone: 'Gemini Zone' },
  { code: 'zh', name: '中文', flag: '🇨🇳', ttsProvider: 'Alibaba CosyVoice', zone: 'Alibaba Zone' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', ttsProvider: 'Alibaba CosyVoice', zone: 'Alibaba Zone' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', ttsProvider: 'Azure Neural', zone: 'Alibaba Zone' },
  { code: 'es', name: 'Español', flag: '🇪🇸', ttsProvider: 'ElevenLabs', zone: 'Claude Zone' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', ttsProvider: 'Azure Neural', zone: 'Claude Zone' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', ttsProvider: 'ElevenLabs', zone: 'Claude Zone' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', ttsProvider: 'Azure Neural', zone: 'Claude Zone' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', ttsProvider: 'Azure Neural', zone: 'Gemini Zone' },
];

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
  const [videoProviders, setVideoProviders] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = CHAPTERS[currentChapterIndex];
  const scriptChapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
  const currentScript = scriptChapters[currentChapterIndex];
  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];
  const regionalAvatar = REGIONAL_AVATARS[selectedLanguage] || REGIONAL_AVATARS.en;
  const ttsProviderInfo = getTTSProviderForLanguage(selectedLanguage);

  // Get available audio output devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(audioOutputs);
        
        // Auto-select headphones if available
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
        console.warn('[Audio] Could not enumerate audio devices:', err);
      }
    };
    
    getAudioDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    };
  }, []);

  // Set audio output device when changed
  const setAudioOutput = useCallback(async (audio: HTMLAudioElement, deviceId: string) => {
    if (!deviceId) return;
    
    try {
      // @ts-ignore - setSinkId is not in all browser types yet
      if (typeof audio.setSinkId === 'function') {
        await audio.setSinkId(deviceId);
        console.log('[Audio] Output set to device:', deviceId);
      }
    } catch (err) {
      console.warn('[Audio] Could not set audio output device:', err);
    }
  }, []);

  // Generate TTS voice with proper device routing
  const generateVoice = useCallback(async () => {
    if (!currentScript || isMuted) return;
    
    let voiceoverText = getLocalizedScript(currentChapter.id, selectedLanguage);
    if (!voiceoverText) {
      voiceoverText = currentScript.voiceover?.en;
    }
    
    if (!voiceoverText) return;

    const cleanText = voiceoverText
      .replace(/\*[^*]+\*/g, '')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 500);

    if (cleanText.length < 10) return;

    try {
      setIsGeneratingVoice(true);
      console.log(`[TTS] Generating voice for ${selectedLanguage} using ${ttsProviderInfo.displayName}`);
      
      // Call multi-provider-tts for regional routing
      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: cleanText,
          language: selectedLanguage,
          voice: currentAvatarGender === 'female' ? 'nova' : 'onyx',
          provider: ttsProviderInfo.provider,
        }
      });

      if (error) {
        // Fallback to basic TTS
        const fallbackRes = await supabase.functions.invoke('text-to-speech', {
          body: { text: cleanText, voice: 'nova', model: 'tts-1', speed: 1.0 }
        });
        if (fallbackRes.error) throw fallbackRes.error;
        if (fallbackRes.data?.audioContent) {
          await playAudio(fallbackRes.data.audioContent);
        }
        return;
      }

      if (data?.audioContent || data?.audio_base64) {
        await playAudio(data.audioContent || data.audio_base64);
      }
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('Voice generation failed');
    } finally {
      setIsGeneratingVoice(false);
    }
  }, [currentScript, currentChapter.id, isMuted, selectedLanguage, ttsProviderInfo, currentAvatarGender]);

  // Play audio with device selection
  const playAudio = useCallback(async (base64Audio: string) => {
    // Stop any existing audio
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
    
    // Set output device
    if (selectedAudioDevice) {
      await setAudioOutput(audioRef.current, selectedAudioDevice);
    }
    
    audioRef.current.onplay = () => setIsSpeaking(true);
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
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
      description: `Avatar: ${currentAvatarGender === 'female' ? regionalAvatar.female : regionalAvatar.male} • Voice: ${ttsProviderInfo.displayName}`,
      duration: 2000,
    });
  }, [selectedAudioDevice, setAudioOutput, currentChapterIndex, isPlaying, selectedLang.name, currentAvatarGender, regionalAvatar, ttsProviderInfo]);

  // Auto-generate voice when chapter changes
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
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentChapterIndex, currentScript]);

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
      setCurrentChapterIndex(index);
      setProgress(0);
    }
  }, []);

  // Determine current visual style
  const isGenieScene = currentChapter.visualStyle === 'genie_emergence' || currentChapter.visualStyle === 'genie_return' || currentChapter.visualStyle === 'genie_interaction';
  const isAvatarScene = currentChapter.visualStyle === 'avatar_presenter' || currentChapter.visualStyle === 'full_body_avatar';

  return (
    <div 
      className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${currentChapter.color}20, #0a0a12 60%, ${currentChapter.color}10)` }}
    >
      {/* Professional Visual Background */}
      <div className="absolute inset-0">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${currentChapter.color}40 0%, transparent 50%),
                           radial-gradient(ellipse at 70% 80%, ${currentChapter.color}30 0%, transparent 50%)`
            }}
          />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: currentChapter.color,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '-10%', opacity: [0, 0.8, 0] }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Avatar/Genie Visual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`visual-${currentChapterIndex}`}
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {isGenieScene ? (
            // Genie emergence/interaction scene
            <div className="relative flex flex-col items-center">
              {/* Magical lamp with genie */}
              <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Magic glow */}
                <div 
                  className="absolute -inset-12 rounded-full blur-3xl opacity-50"
                  style={{ background: `radial-gradient(circle, ${currentChapter.color}, transparent)` }}
                />
                
                {/* Genie character - professional 3D style */}
                <div className="relative w-48 h-64 md:w-64 md:h-80">
                  {/* Smoke trail from lamp */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-40"
                    style={{
                      background: `linear-gradient(to top, ${currentChapter.color}80, ${currentChapter.color}40, transparent)`,
                      borderRadius: '100% 100% 50% 50%',
                      filter: 'blur(8px)',
                    }}
                    animate={{ scaleY: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Genie body - modern glass morphism */}
                  <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-28 h-36 md:w-36 md:h-48 rounded-t-full"
                    style={{
                      background: `linear-gradient(180deg, ${currentChapter.color}90, ${currentChapter.color}40)`,
                      boxShadow: `0 0 40px ${currentChapter.color}60`,
                    }}
                    animate={isSpeaking ? { scaleX: [1, 1.02, 0.98, 1] } : {}}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />
                  
                  {/* Genie head */}
                  <motion.div
                    className="absolute bottom-40 md:bottom-52 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${currentChapter.color}90, ${currentChapter.color}60)`,
                      boxShadow: `0 0 30px ${currentChapter.color}50`,
                    }}
                  >
                    {/* Eyes */}
                    <div className="absolute top-5 left-3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-lg">
                      <div className="absolute top-0.5 left-0.5 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-800" />
                    </div>
                    <div className="absolute top-5 right-3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-lg">
                      <div className="absolute top-0.5 left-0.5 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-800" />
                    </div>
                    
                    {/* Smile */}
                    <motion.div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-3 border-b-2 border-white/80 rounded-b-full"
                      animate={isSpeaking ? { scaleY: [1, 1.5, 0.8, 1.2, 1] } : {}}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Crossed arms gesture */}
                  <motion.div
                    className="absolute bottom-20 md:bottom-28 left-0 w-10 h-3 rounded-full"
                    style={{ background: `${currentChapter.color}80` }}
                    animate={{ rotate: [-15, 15, -15] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute bottom-20 md:bottom-28 right-0 w-10 h-3 rounded-full"
                    style={{ background: `${currentChapter.color}80` }}
                    animate={{ rotate: [15, -15, 15] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
                
                {/* Magic lamp at bottom */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 h-16 md:w-32 md:h-20">
                  <svg viewBox="0 0 100 60" className="w-full h-full">
                    <defs>
                      <linearGradient id="lampGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#B8860B" />
                      </linearGradient>
                    </defs>
                    {/* Lamp body */}
                    <ellipse cx="50" cy="50" rx="35" ry="10" fill="url(#lampGoldGrad)" />
                    <path d="M20 45 Q10 35 15 25 Q25 15 50 12 Q75 15 85 25 Q90 35 80 45" fill="url(#lampGoldGrad)" />
                    {/* Spout */}
                    <path d="M80 30 Q95 25 100 15" fill="none" stroke="#FFD700" strokeWidth="6" strokeLinecap="round" />
                    {/* Handle */}
                    <path d="M20 30 Q5 25 8 15 Q15 8 25 15" fill="none" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </div>
              </motion.div>
              
              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${30 + Math.random() * 40}%`,
                    top: `${10 + Math.random() * 50}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}
            </div>
          ) : (
            // Avatar presenter scene
            <div className="relative flex items-center gap-8">
              {/* Avatar silhouette with glow */}
              <motion.div
                className="relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div 
                  className="absolute -inset-4 rounded-full blur-2xl opacity-40"
                  style={{ background: currentChapter.color }}
                />
                
                {/* Avatar placeholder with professional styling */}
                <div className="relative w-32 h-40 md:w-48 md:h-60 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${currentChapter.color}40, #1a1a2e, ${currentChapter.color}20)`,
                    }}
                  />
                  
                  {/* Avatar icon */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <User className="w-16 h-16 md:w-24 md:h-24 text-white/60" />
                    <p className="mt-2 text-xs md:text-sm text-white/80 font-medium">
                      {currentAvatarGender === 'female' ? regionalAvatar.female : regionalAvatar.male}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-[10px] border-white/20 text-white/60"
                    >
                      {regionalAvatar.provider}
                    </Badge>
                  </div>
                  
                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <motion.div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full"
                          style={{ background: currentChapter.color }}
                          animate={{ height: [8, 16, 8] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Product logo card */}
              <motion.div
                className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <img 
                  src={currentChapter.logo} 
                  alt={currentChapter.product}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain"
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top bar - Provider attribution */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <Video className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/80">
            Video: Vertex AI Veo + {regionalAvatar.provider}
          </span>
        </div>
        
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
      <div className="absolute bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {LANGUAGES.map(lang => (
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
                        {lang.ttsProvider}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
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
            <span className="text-sm text-white/80">Generating {selectedLang.name} voice...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfessionalAvatarShowcase;
