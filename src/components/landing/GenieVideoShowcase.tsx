/**
 * GENIE VIDEO SHOWCASE - Landing Page Video Component
 * 
 * Features:
 * - 9 chapters with unique visual styles per slide
 * - Voice-over with background music
 * - Genie character with smoke transitions
 * - Product logos and taglines
 * - Multi-language support
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
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GENIE_STUDIO_FULL_SCRIPT, ChapterScript } from '@/config/genie-studio-video-script';

// Product logos
import genieStudioLogo from '@/assets/logos/genie-studio-logo.png';
import genieSparkLogo from '@/assets/logos/genie-spark-logo.png';
import genieMindLogo from '@/assets/logos/genie-mind-logo.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-logo.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-logo.png';
import askGenieLogo from '@/assets/logos/ask-genie-logo.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo.png';

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

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [isGenieVisible, setIsGenieVisible] = useState(true);
  
  const chapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
  const currentChapter = chapters[currentChapterIndex];
  
  // Auto-advance chapters
  useEffect(() => {
    if (!isPlaying) return;
    
    const chapterDuration = parseInt(currentChapter.duration) * 1000 || 45000;
    const interval = 100; // Update every 100ms
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
  }, [isPlaying, currentChapterIndex, currentChapter, chapters.length]);
  
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
    }
  }, [chapters.length]);
  
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const getSlideStyle = (): React.CSSProperties => {
    const visualType = currentChapter.visual.type;
    return SLIDE_VISUALS[visualType] || SLIDE_VISUALS['3d_animated'];
  };

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}>
      {/* Background with visual type styling */}
      <motion.div 
        className="absolute inset-0"
        style={getSlideStyle()}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Animated stars/particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
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
          {/* Slide type indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium capitalize">
              {currentChapter.visual.type.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-purple-200 text-xs">
              {currentChapter.duration}
            </span>
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
                {LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </Button>
              
              <AnimatePresence>
                {showLangSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 min-w-[150px] z-50"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLangSelector(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedLanguage === lang.code
                            ? 'bg-purple-500/30 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Product Logo with Genie effect */}
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
          
          {/* Chapter title */}
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
          
          {/* Visual elements preview */}
          <motion.div
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {currentChapter.visual.elements.slice(0, 5).map((element, idx) => (
              <motion.div
                key={idx}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: idx * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
            
            <div className="text-white/80 text-sm">
              {currentChapterIndex + 1} / {chapters.length}
            </div>
            
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1.5] }}
            transition={{ duration: 2 }}
          >
            <Wand2 className="w-24 h-24 text-purple-300" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GenieVideoShowcase;
