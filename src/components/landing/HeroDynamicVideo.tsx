/**
 * HERO DYNAMIC VIDEO PLAYER
 * Plays videos from database with language dropdown selector
 * Videos are managed via admin panel
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLandingVideos, LandingVideo } from '@/hooks/useLandingVideos';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroDynamicVideoProps {
  region: string;
  placement?: string;
}

export const HeroDynamicVideo: React.FC<HeroDynamicVideoProps> = ({ 
  region, 
  placement = 'hero' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videos, loading, availableLanguages, getFeaturedVideo, recordView } = useLandingVideos({ 
    placement,
  });
  
  const [selectedVideo, setSelectedVideo] = useState<LandingVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set initial video based on region
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      const featuredVideo = getFeaturedVideo(region) || videos[0];
      setSelectedVideo(featuredVideo);
    }
  }, [videos, region]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedVideo) return;

    const handleTimeUpdate = () => {
      const prog = (video.currentTime / video.duration) * 100;
      setProgress(prog);
    };

    const handleLoaded = () => {
      setIsLoaded(true);
      recordView(selectedVideo.id);
    };
    
    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('ended', handleEnded);

    // Auto-play on mount
    setIsLoaded(false);
    video.load();
    video.play().catch(() => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const handleVideoChange = (video: LandingVideo) => {
    setSelectedVideo(video);
    setIsLoaded(false);
    setIsPlaying(true);
    setProgress(0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border">
        <Skeleton className="w-full aspect-video" />
      </div>
    );
  }

  // No videos available - fallback
  if (!selectedVideo) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border bg-muted">
        <div className="w-full aspect-video flex items-center justify-center">
          <p className="text-muted-foreground">No videos available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={selectedVideo.video_url}
        poster={selectedVideo.thumbnail_url || undefined}
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
            <span className="text-sm text-muted-foreground">Loading {selectedVideo.language_name} demo...</span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Center play button */}
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

      {/* Language Dropdown - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur gap-2"
            >
              <Globe className="h-4 w-4" />
              {selectedVideo.language_name}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-card border-border z-50">
            {videos.map((video) => (
              <DropdownMenuItem
                key={video.id}
                onClick={() => handleVideoChange(video)}
                className={`cursor-pointer ${selectedVideo.id === video.id ? 'bg-primary/10 text-primary' : ''}`}
              >
                <span className="flex items-center gap-2 w-full">
                  <span className="flex-1">{video.language_name}</span>
                  {video.industry && (
                    <span className="text-xs text-muted-foreground">{video.industry}</span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AI Confidence Badge - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full backdrop-blur">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">{selectedVideo.ai_confidence}% AI</span>
        </div>
        {selectedVideo.industry && (
          <div className="px-3 py-1 bg-primary/80 rounded-full backdrop-blur">
            <span className="text-xs text-primary-foreground font-medium">{selectedVideo.industry}</span>
          </div>
        )}
      </div>

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
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {selectedVideo.duration_seconds && (
              <span className="text-xs text-white/80">
                {Math.floor(selectedVideo.duration_seconds / 60)}:{String(selectedVideo.duration_seconds % 60).padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">4K</span>
            {selectedVideo.generation_pipeline && (
              <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">
                {selectedVideo.generation_pipeline}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleFullscreen} className="h-8 w-8 text-white hover:bg-white/20">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Title */}
      <div className="absolute bottom-16 left-4 right-4">
        <p className="text-white font-medium text-sm truncate">{selectedVideo.title}</p>
        {selectedVideo.description && (
          <p className="text-white/70 text-xs truncate">{selectedVideo.description}</p>
        )}
      </div>
    </div>
  );
};

export default HeroDynamicVideo;
