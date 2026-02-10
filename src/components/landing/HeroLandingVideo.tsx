/**
 * HERO LANDING VIDEO
 * Pre-generated video player with AI provider attribution
 * 
 * Features:
 * - Fetches videos from landing_page_videos table (admin-managed)
 * - IP-based regional video selection
 * - Provider badges showing which AI powers each element
 * - Fallback to animated showcase if no video available
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Globe,
  ChevronDown,
  Sparkles,
  Film,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLandingVideos, LandingVideo } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';

// Provider logos for attribution badges
import alibabaLogo from '@/assets/logos/providers/alibaba.jpg';
import azureLogo from '@/assets/logos/providers/azure.svg';
import elevenlabsLogo from '@/assets/logos/providers/elevenlabs-official.png';
import meshyLogo from '@/assets/logos/providers/meshy-official.png';
import modelslabLogo from '@/assets/logos/providers/modelslab.jpg';
import deeplLogo from '@/assets/logos/providers/deepl.svg';

// Language options with flags
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'NAM' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', region: 'MENA' },
  { code: 'zh', name: '中文', flag: '🇨🇳', region: 'APAC' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', region: 'IND' },
  { code: 'es', name: 'Español', flag: '🇪🇸', region: 'LATAM' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', region: 'EUR' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', region: 'APAC' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', region: 'APAC' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', region: 'LATAM' },
];

// Provider attribution based on video generation_pipeline
const PROVIDER_ATTRIBUTION: Record<string, { name: string; logo: string; role: string }[]> = {
  avatar_3d: [
    { name: 'Alibaba', logo: alibabaLogo, role: 'WAN 2.2 Avatar' },
    { name: 'Meshy', logo: meshyLogo, role: '3D Generation' },
    { name: 'Azure', logo: azureLogo, role: 'Lip-sync Visemes' },
    { name: 'ElevenLabs', logo: elevenlabsLogo, role: 'Voiceover' },
  ],
  animated: [
    { name: 'ModelsLab', logo: modelslabLogo, role: 'AnimateDiff' },
    { name: 'ElevenLabs', logo: elevenlabsLogo, role: 'Voiceover' },
  ],
  voiceover_only: [
    { name: 'ElevenLabs', logo: elevenlabsLogo, role: 'Voiceover' },
    { name: 'Azure', logo: azureLogo, role: 'Neural TTS' },
  ],
  localized: [
    { name: 'DeepL', logo: deeplLogo, role: 'Translation' },
    { name: 'Alibaba', logo: alibabaLogo, role: 'Qwen3-TTS' },
  ],
  default: [
    { name: 'Alibaba', logo: alibabaLogo, role: 'Avatar' },
    { name: 'ElevenLabs', logo: elevenlabsLogo, role: 'Voice' },
    { name: 'Meshy', logo: meshyLogo, role: '3D' },
  ],
};

// Fallback demo video (pre-rendered sample)
const FALLBACK_VIDEO = {
  src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
  title: 'Genie Studio Demo',
};

interface HeroLandingVideoProps {
  className?: string;
}

export const HeroLandingVideo: React.FC<HeroLandingVideoProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { selectedRegion, setRegion } = useRegionalDetection();
  
  // State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showProviderBadges, setShowProviderBadges] = useState(true);

  // Fetch videos from database
  const { 
    videos, 
    loading, 
    getFeaturedVideo,
    recordView,
    availableLanguages 
  } = useLandingVideos({ 
    placement: 'hero_showcase',
    region: selectedLanguage 
  });

  // Get current video based on selected language
  const currentVideo = videos.find(v => v.language_code === selectedLanguage) 
    || videos[0] 
    || null;

  // Map language code to region on selection
  useEffect(() => {
    const lang = LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage);
    if (lang) {
      setRegion(lang.code as any);
    }
  }, [selectedLanguage, setRegion]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const prog = (video.currentTime / video.duration) * 100;
      setProgress(prog);
    };

    const handleLoaded = () => setIsLoaded(true);
    const handleEnded = () => {
      video.currentTime = 0;
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      if (currentVideo) {
        recordView(currentVideo.id);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  // Get providers for current video
  const getProviders = () => {
    if (!currentVideo?.generation_pipeline) return PROVIDER_ATTRIBUTION.default;
    return PROVIDER_ATTRIBUTION[currentVideo.generation_pipeline] || PROVIDER_ATTRIBUTION.default;
  };

  // Check which languages have videos available
  const hasVideo = (code: string) => {
    return videos.some(v => v.language_code === code);
  };

  const videoSrc = currentVideo?.video_url || FALLBACK_VIDEO.src;
  const videoPoster = currentVideo?.thumbnail_url || FALLBACK_VIDEO.poster;
  const videoTitle = currentVideo?.title || FALLBACK_VIDEO.title;

  return (
    <div className={`relative ${className}`}>
      {/* Language Selector */}
      <div className="absolute top-4 left-4 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-background/80 backdrop-blur border-border hover:bg-background gap-2"
            >
              <Globe className="h-4 w-4" />
              <span>{LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.flag}</span>
              <span className="hidden sm:inline">
                {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-border">
            {LANGUAGE_OPTIONS.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {hasVideo(lang.code) && (
                  <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="Video available" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Video Container */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={videoPoster}
          muted={isMuted}
          playsInline
          className="w-full aspect-video object-cover"
        />

        {/* Loading overlay */}
        {(loading || !isLoaded) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name} demo...
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Center play button */}
        {!isPlaying && isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button 
              onClick={togglePlay}
              className="w-20 h-20 bg-primary/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-primary transition shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="h-8 w-8 ml-1 text-primary-foreground" fill="currentColor" />
            </motion.button>
          </div>
        )}

        {/* Controls overlay */}
        <AnimatePresence>
          {(showControls || !isPlaying) && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {/* Progress bar */}
              <div className="w-full h-1 bg-white/30 rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {currentVideo && (
                    <>
                      <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">
                        {currentVideo.content_type === 'avatar_demo' ? 'AI Avatar' : 'Demo'}
                      </span>
                      <span className="px-2 py-1 bg-primary/80 rounded text-xs backdrop-blur text-primary-foreground">
                        {currentVideo.ai_confidence}% AI
                      </span>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live indicator */}
        {currentVideo && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full backdrop-blur">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Pre-rendered</span>
          </div>
        )}

        {/* No video available indicator */}
        {!currentVideo && !loading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No video available for {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Playing sample demo instead
            </p>
          </div>
        )}
      </div>

      {/* Provider Attribution Badges */}
      <AnimatePresence>
        {showProviderBadges && (
          <motion.div 
            className="mt-4 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-xs text-muted-foreground">Powered by:</span>
            {getProviders().map((provider, idx) => (
              <motion.div
                key={provider.name}
                className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img 
                  src={provider.logo} 
                  alt={provider.name} 
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-xs text-foreground font-medium">{provider.name}</span>
                <span className="text-xs text-muted-foreground">({provider.role})</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle provider badges */}
      <div className="mt-2 text-center">
        <button
          onClick={() => setShowProviderBadges(!showProviderBadges)}
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          {showProviderBadges ? 'Hide' : 'Show'} AI providers
        </button>
      </div>

      {/* Video title and stats */}
      {currentVideo && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-foreground">{currentVideo.title}</h3>
          {currentVideo.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentVideo.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{currentVideo.view_count?.toLocaleString() || 0} views</span>
            {currentVideo.duration_seconds && (
              <span>{Math.floor(currentVideo.duration_seconds / 60)}:{String(currentVideo.duration_seconds % 60).padStart(2, '0')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroLandingVideo;
