/**
 * HERO VIDEO PLAYER
 * Auto-playing, muted video with regional content and fallback
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Regional demo videos - using reliable video sources
const REGIONAL_VIDEOS: Record<string, { src: string; poster: string; title: string }> = {
  NAM: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    title: 'AI Content Creation Demo',
  },
  EUR: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    title: 'European Multilingual Production',
  },
  MENA: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=450&fit=crop',
    title: 'Arabic Dialect AI Demo',
  },
  IND: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop',
    title: 'Indian Languages EdTech',
  },
  AFR: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=450&fit=crop',
    title: 'African Fintech Content',
  },
  APAC: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop',
    title: 'Asia Pacific Tech Demo',
  },
  LATAM: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=450&fit=crop',
    title: 'Latin America Creator Economy',
  },
  CARIB: {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop',
    title: 'Caribbean Tourism Tech',
  },
};

interface HeroVideoPlayerProps {
  region: string;
  theme: string;
  languageCount: string;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = ({ region, theme, languageCount }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const videoData = REGIONAL_VIDEOS[region] || REGIONAL_VIDEOS.NAM;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleLoaded = () => setIsLoaded(true);
    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('ended', handleEnded);

    // Auto-play on mount
    video.play().catch(() => {
      // Autoplay blocked, show play button
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('ended', handleEnded);
    };
  }, [region]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
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

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoData.src}
        poster={videoData.poster}
        muted={isMuted}
        playsInline
        loop
        className="w-full aspect-video object-cover"
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading {region} demo...</span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Center play button - shown when paused */}
      {!isPlaying && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={togglePlay}
            className="w-20 h-20 bg-primary/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-primary transition shadow-lg"
          >
            <Play className="h-8 w-8 ml-1 text-primary-foreground" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
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
            <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">4K</span>
            <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">AI Avatar</span>
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
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full backdrop-blur">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-green-400">95% AI Confidence</span>
      </div>

      {/* Region badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/80 rounded-full backdrop-blur">
        <span className="text-xs text-primary-foreground font-medium">{theme}</span>
      </div>
    </div>
  );
};

export default HeroVideoPlayer;
