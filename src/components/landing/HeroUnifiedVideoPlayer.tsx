/**
 * HERO UNIFIED VIDEO PLAYER
 * 
 * Unified video player supporting both:
 * 1. Live-generated videos using 6-zone routing infrastructure
 * 2. Admin-uploaded pre-generated videos from landing_page_videos table
 * 
 * Features:
 * - Language/region selector with IP detection
 * - Video dropdown for multiple videos
 * - Provider attribution badges
 * - Connected to unified provider routing for other landing sections
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Loader2, RefreshCw,
  Globe, Sparkles, Zap, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Video, ChevronDown, Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLiveVideoGeneration, ChapterResult } from '@/hooks/useLiveVideoGeneration';
import { useLandingVideos, LandingVideo } from '@/hooks/useLandingVideos';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { SUPPORTED_REGIONS } from '@/config/genie-sitemap';

interface HeroUnifiedVideoPlayerProps {
  className?: string;
  onLanguageChange?: (langCode: string) => void;
  onVideoSelect?: (video: LandingVideo | null) => void;
}

// Visual backgrounds based on content type
const CHAPTER_BACKGROUNDS: Record<string, string> = {
  '3d_animated': 'from-purple-900/80 via-indigo-900/60 to-purple-800/80',
  'live_demo': 'from-orange-900/80 via-amber-900/60 to-orange-800/80',
  'ppt_slide': 'from-blue-900/80 via-cyan-900/60 to-blue-800/80',
  'avatar_presenter': 'from-emerald-900/80 via-teal-900/60 to-emerald-800/80',
  'full_body_avatar': 'from-rose-900/80 via-pink-900/60 to-rose-800/80',
  'immersive': 'from-violet-900/80 via-purple-900/60 to-violet-800/80',
  'default': 'from-slate-900/80 via-slate-800/60 to-slate-900/80',
};

// Provider color badges
const PROVIDER_COLORS: Record<string, string> = {
  'ElevenLabs': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Azure Neural': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Azure': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Alibaba Qwen3-TTS': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Alibaba': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Claude': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'GPT-4o': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Gemini': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'ModelsLab': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Meshy AI': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Meshy': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'DeepL': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

type VideoMode = 'admin' | 'live';

export const HeroUnifiedVideoPlayer: React.FC<HeroUnifiedVideoPlayerProps> = ({
  className = '',
  onLanguageChange,
  onVideoSelect,
}) => {
  // Live generation state
  const {
    isGenerating,
    progress,
    result,
    error: liveError,
    isPlaying: isLiveAudioPlaying,
    currentPlayingChapter,
    generateVideo,
    playChapter,
    pausePlayback,
    resumePlayback,
    reset: resetLive,
    chapters,
  } = useLiveVideoGeneration();
  
  // Admin videos state
  const { selectedRegion, setRegion, regionName } = useRegionalDetection();
  const { 
    videos: adminVideos, 
    loading: loadingAdminVideos,
    recordView,
  } = useLandingVideos({ 
    placement: 'hero_showcase', 
    region: selectedRegion 
  });
  
  // UI state
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LandingVideo | null>(null);
  const [videoMode, setVideoMode] = useState<VideoMode>('admin');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Auto-select first admin video when available
  useEffect(() => {
    if (adminVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(adminVideos[0]);
      setVideoMode('admin');
    } else if (adminVideos.length === 0 && !selectedVideo) {
      // No admin videos, switch to live mode
      setVideoMode('live');
    }
  }, [adminVideos, selectedVideo]);

  // Notify parent of language changes
  useEffect(() => {
    onLanguageChange?.(selectedRegion);
  }, [selectedRegion, onLanguageChange]);

  // Notify parent of video selection
  useEffect(() => {
    onVideoSelect?.(selectedVideo);
  }, [selectedVideo, onVideoSelect]);

  const handleLanguageChange = async (langCode: string) => {
    setRegion(langCode as any);
    setShowLanguageSelector(false);
    setSelectedVideo(null);
    
    if (videoMode === 'live') {
      resetLive();
      await generateVideo(langCode);
    }
  };

  const handleVideoSelect = (video: LandingVideo) => {
    setSelectedVideo(video);
    setVideoMode('admin');
    setShowVideoDropdown(false);
    recordView(video.id);
    
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleGenerateLive = async () => {
    setVideoMode('live');
    setSelectedVideo(null);
    await generateVideo(selectedRegion);
  };

  const handlePlayPause = () => {
    if (videoMode === 'admin' && videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    } else if (videoMode === 'live') {
      if (!result) {
        generateVideo();
        return;
      }
      
      if (isLiveAudioPlaying) {
        pausePlayback();
      } else {
        if (currentPlayingChapter === 0 && !isLiveAudioPlaying) {
          playChapter(0);
        } else {
          resumePlayback();
        }
      }
    }
  };

  const handlePrevChapter = () => {
    if (videoMode === 'live') {
      const prevIndex = Math.max(0, currentPlayingChapter - 1);
      playChapter(prevIndex);
    }
  };

  const handleNextChapter = () => {
    if (videoMode === 'live') {
      const nextIndex = Math.min(chapters.length - 1, currentPlayingChapter + 1);
      playChapter(nextIndex);
    }
  };

  const currentChapter = chapters[currentPlayingChapter];
  const currentBackground = videoMode === 'admin' 
    ? CHAPTER_BACKGROUNDS['default']
    : currentChapter 
      ? CHAPTER_BACKGROUNDS[currentChapter.visualType] || CHAPTER_BACKGROUNDS['3d_animated']
      : CHAPTER_BACKGROUNDS['3d_animated'];

  const isPlaying = videoMode === 'admin' ? isVideoPlaying : isLiveAudioPlaying;
  const error = liveError;

  // Get providers for current content
  const currentProviders = videoMode === 'admin' && selectedVideo?.generation_pipeline
    ? ['Alibaba', 'Meshy', 'ElevenLabs', 'Azure'] // Default for admin videos
    : currentChapter?.providers || [];

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}>
      {/* Background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentBackground}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Admin video element (hidden when in live mode) */}
      {videoMode === 'admin' && selectedVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={selectedVideo.video_url}
          poster={selectedVideo.thumbnail_url || undefined}
          muted={isMuted}
          playsInline
          onEnded={() => setIsVideoPlaying(false)}
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
        />
      )}
      
      {/* Animated particles for live mode */}
      {videoMode === 'live' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      )}
      
      {/* Main content overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-black/60 via-transparent to-black/40">
        {/* Top bar - Language & Video selectors */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language selector */}
            <div className="relative z-50">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/20 text-white hover:bg-black/70 text-xs md:text-sm"
                onClick={() => {
                  setShowLanguageSelector(!showLanguageSelector);
                  setShowVideoDropdown(false);
                }}
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
            
            {/* Video dropdown */}
            {adminVideos.length > 0 && (
              <div className="relative z-40">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70 text-xs md:text-sm"
                  onClick={() => {
                    setShowVideoDropdown(!showVideoDropdown);
                    setShowLanguageSelector(false);
                  }}
                >
                  <Film className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">
                    {selectedVideo?.title || 'Select Video'}
                  </span>
                  <span className="sm:hidden">Videos</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                
                <AnimatePresence>
                  {showVideoDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur-md rounded-lg border border-border shadow-xl p-2 min-w-[220px] max-h-[300px] overflow-y-auto z-50"
                    >
                      {adminVideos.map((video) => (
                        <button
                          key={video.id}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedVideo?.id === video.id 
                              ? 'bg-primary/20 text-primary' 
                              : 'text-foreground/80 hover:bg-muted'
                          }`}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="font-medium truncate">{video.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {video.language_name} • {video.industry || 'General'}
                          </div>
                        </button>
                      ))}
                      
                      {/* Generate Live option */}
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          className="w-full text-left px-3 py-2 rounded text-sm text-purple-400 hover:bg-purple-500/10 transition-colors"
                          onClick={handleGenerateLive}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Live Demo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Real-time AI with 6-zone routing
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Mode badge */}
            <Badge 
              variant="outline" 
              className={`bg-black/40 border-white/20 text-white/80 text-xs ${
                videoMode === 'live' ? 'border-purple-500/50' : ''
              }`}
            >
              {videoMode === 'live' ? (
                <>
                  <Zap className="w-3 h-3 mr-1 text-purple-400" />
                  Live
                </>
              ) : (
                <>
                  <Video className="w-3 h-3 mr-1" />
                  Pre-rendered
                </>
              )}
            </Badge>
          </div>
          
          {/* Provider badges */}
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {currentProviders.slice(0, 3).map((provider, idx) => (
              <Badge 
                key={idx}
                className={`text-xs ${PROVIDER_COLORS[provider] || 'bg-white/10 text-white border-white/20'}`}
              >
                {provider}
              </Badge>
            ))}
            {currentProviders.length > 3 && (
              <Badge className="bg-white/10 text-white border-white/20 text-xs">
                +{currentProviders.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Center content */}
        <div className="flex-1 flex items-center justify-center">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-lg md:text-xl font-medium text-white mb-2">
                Generating Live Content
              </p>
              <p className="text-white/60 text-sm md:text-base mb-4">
                Using 6-zone routing for {regionName}...
              </p>
              <Progress value={progress} className="w-48 md:w-64 mx-auto" />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-400 mx-auto mb-4" />
              <p className="text-lg md:text-xl font-medium text-white mb-2">Generation Error</p>
              <p className="text-white/60 text-sm mb-4">{error}</p>
              <Button onClick={() => generateVideo()} variant="outline" className="border-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          ) : videoMode === 'live' && result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlayingChapter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge className="mb-3 md:mb-4 bg-white/10 text-white border-white/20">
                    Chapter {currentPlayingChapter + 1} of {chapters.length}
                  </Badge>
                  
                  <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                    {currentChapter?.title || 'Ready to Play'}
                  </h3>
                  
                  {currentChapter?.technicalHighlights && (
                    <div className="flex flex-wrap justify-center gap-2 mb-3 md:mb-4">
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
                </motion.div>
              </AnimatePresence>
              
              {isLiveAudioPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 md:mt-6 flex items-center justify-center gap-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-purple-400 rounded-full"
                        animate={{ height: [12, 24, 12] }}
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
          ) : videoMode === 'live' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Experience Genie Studio Live
              </h3>
              <p className="text-white/60 text-sm md:text-base mb-4 md:mb-6 max-w-md px-4">
                Generate a personalized demo in {regionName} with AI voiceover and regional routing.
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
          ) : null}
        </div>
        
        {/* Bottom bar - Playback controls */}
        <div className="flex items-center justify-between">
          {/* Chapter navigation (live mode only) */}
          {videoMode === 'live' && result && (
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={handlePrevChapter}
                disabled={currentPlayingChapter === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {chapters.slice(0, 9).map((_, idx) => (
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
                className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={handleNextChapter}
                disabled={currentPlayingChapter >= chapters.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {videoMode === 'admin' && <div />}
          
          {/* Center play button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={handlePlayPause}
              disabled={isGenerating || (videoMode === 'live' && !result && !isGenerating)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
              )}
            </Button>
          </div>
          
          {/* Volume & status */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            {videoMode === 'live' && result && (
              <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>
                  {result.metadata.successfulChapters}/{result.metadata.totalChapters}
                </span>
              </div>
            )}
            
            {videoMode === 'admin' && selectedVideo && (
              <div className="hidden md:flex items-center gap-2 text-white/60 text-xs">
                <span>{selectedVideo.view_count || 0} views</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUnifiedVideoPlayer;
