/**
 * CHAPTER VISUAL ENGINE (v2)
 * 
 * Renders script-accurate visuals for each chapter using official logos:
 * - Beautiful animated Genie lamp with emerging character
 * - Official product logos from brand assets
 * - Avatar presenters with lip-sync visualization
 * - Live demo mockups per product
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Video, Presentation, Target, 
  MessageSquare, Globe, Wand2, FileText, Mic2,
  Play, Volume2, Layers, Zap, Monitor, Smartphone
} from 'lucide-react';
import { AnimatedGenieLamp } from './AnimatedGenieLamp';
import { ProductLogoDisplay, OrbitingProductLogos } from './ProductLogoDisplay';

interface ChapterVisualEngineProps {
  chapterId: string;
  isPlaying: boolean;
  isGenerating: boolean;
}

// Chapter-specific visual configuration
const CHAPTER_VISUALS: Record<string, {
  background: string;
  elements: string[];
  glowColor: string;
}> = {
  opening: {
    background: 'from-violet-950 via-purple-900 to-indigo-950',
    elements: ['Golden Lamp', 'Magic Smoke', 'All Products'],
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  spark: {
    background: 'from-orange-950 via-amber-900 to-yellow-950',
    elements: ['Script Generator', 'Input Types', 'AI Models'],
    glowColor: 'rgba(251, 146, 60, 0.4)',
  },
  mind: {
    background: 'from-blue-950 via-indigo-900 to-purple-950',
    elements: ['Neural Network', 'TTS Waveform', 'Voice Selector'],
    glowColor: 'rgba(96, 165, 250, 0.4)',
  },
  vibe: {
    background: 'from-pink-950 via-rose-900 to-red-950',
    elements: ['3D Studio', 'Avatar Model', 'Timeline'],
    glowColor: 'rgba(251, 113, 133, 0.4)',
  },
  deck: {
    background: 'from-emerald-950 via-teal-900 to-cyan-950',
    elements: ['Slide Canvas', '3D Charts', 'Presenter'],
    glowColor: 'rgba(52, 211, 153, 0.4)',
  },
  arc: {
    background: 'from-violet-950 via-purple-900 to-fuchsia-950',
    elements: ['Pipeline', 'Workflow', 'Analytics'],
    glowColor: 'rgba(167, 139, 250, 0.4)',
  },
  askGenie: {
    background: 'from-cyan-950 via-blue-900 to-indigo-950',
    elements: ['Chat Interface', 'Voice Mode', 'AI Assistant'],
    glowColor: 'rgba(34, 211, 238, 0.4)',
  },
  cast: {
    background: 'from-amber-950 via-orange-900 to-red-950',
    elements: ['Global Map', 'Channels', 'Scheduler'],
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  closing: {
    background: 'from-violet-950 via-purple-900 to-indigo-950',
    elements: ['All Products', 'Magic Sparkles', 'Logo'],
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
};

// Floating UI elements
const FloatingElements: React.FC<{ elements: string[]; isActive: boolean; glowColor: string }> = ({ 
  elements, 
  isActive,
  glowColor 
}) => (
  <div className="absolute inset-0 pointer-events-none">
    {isActive && elements.map((element, idx) => (
      <motion.div
        key={element}
        className="absolute bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/80 shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: [0, Math.sin(idx * 2) * 8, 0],
          y: [0, Math.cos(idx * 2) * 6, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          delay: idx * 0.3 
        }}
        style={{
          top: `${12 + (idx % 3) * 28}%`,
          left: idx % 2 === 0 ? '6%' : 'auto',
          right: idx % 2 === 1 ? '6%' : 'auto',
          boxShadow: `0 0 15px ${glowColor}`,
        }}
      >
        {element}
      </motion.div>
    ))}
  </div>
);

// Demo mockups for product chapters
const ProductDemoMockup: React.FC<{ 
  chapterId: string; 
  isActive: boolean;
}> = ({ chapterId, isActive }) => {
  if (!isActive) return null;

  const mockups: Record<string, React.ReactNode> = {
    spark: (
      <motion.div
        className="absolute left-4 md:left-8 bottom-24 md:bottom-32 w-48 md:w-64 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-3 md:p-4"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs text-white/60 mb-2">Script Generation</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['📄', '🎥', '🔗', '🎤'].map((icon, idx) => (
            <motion.div
              key={icon}
              className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
            >
              {icon}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="h-2 bg-gradient-to-r from-orange-500/40 to-transparent rounded"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 1 }}
        />
      </motion.div>
    ),
    mind: (
      <motion.div
        className="absolute right-4 md:right-8 top-24 md:top-32 w-40 md:w-56"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Audio waveform visualization */}
        <div className="flex items-end justify-center gap-0.5 h-16">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-400 rounded-t"
              animate={{
                height: [
                  Math.random() * 30 + 10,
                  Math.random() * 50 + 20,
                  Math.random() * 30 + 10,
                ],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
        <div className="text-center text-xs text-white/60 mt-2">TTS Waveform</div>
      </motion.div>
    ),
    vibe: (
      <motion.div
        className="absolute left-4 md:left-8 top-20 w-32 md:w-44 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="aspect-video bg-rose-900/30 rounded mb-2 flex items-center justify-center">
          <Play className="w-6 h-6 text-rose-400" />
        </div>
        <div className="h-1 bg-rose-500/30 rounded">
          <motion.div
            className="h-full bg-rose-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ duration: 2, delay: 0.8 }}
          />
        </div>
      </motion.div>
    ),
    deck: (
      <motion.div
        className="absolute right-4 md:right-8 bottom-24 md:bottom-32 w-40 md:w-52"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="aspect-video bg-emerald-900/40 border border-emerald-500/20 rounded flex items-center justify-center text-xs text-emerald-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              Slide {i}
            </motion.div>
          ))}
        </div>
      </motion.div>
    ),
  };

  return mockups[chapterId] || null;
};

export const ChapterVisualEngine: React.FC<ChapterVisualEngineProps> = ({
  chapterId,
  isPlaying,
  isGenerating,
}) => {
  const visual = CHAPTER_VISUALS[chapterId] || CHAPTER_VISUALS.opening;
  const isActive = isPlaying || isGenerating;
  const isOpeningOrClosing = chapterId === 'opening' || chapterId === 'closing';

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${visual.background} overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: visual.glowColor,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ 
              y: '-10%', 
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Central visual content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Opening/Closing: Lamp + Genie + Orbiting Products */}
        {isOpeningOrClosing && (
          <div className="relative">
            <AnimatedGenieLamp
              isActive={isActive}
              isSpeaking={isPlaying}
              size="lg"
              showGenie={isActive}
            />
            <OrbitingProductLogos
              currentProduct={chapterId}
              isActive={isActive}
            />
          </div>
        )}

        {/* Product chapters: Show product logo + lamp */}
        {!isOpeningOrClosing && (
          <div className="relative flex flex-col items-center">
            {/* Product Logo - main focus */}
            <ProductLogoDisplay
              chapterId={chapterId}
              isActive={isActive}
              size="lg"
            />
            
            {/* Mini lamp below logo */}
            <motion.div
              className="mt-4 scale-50 origin-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
            >
              <AnimatedGenieLamp
                isActive={isActive}
                isSpeaking={isPlaying}
                size="sm"
                showGenie={false}
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating UI elements */}
      <FloatingElements 
        elements={visual.elements} 
        isActive={isActive}
        glowColor={visual.glowColor}
      />

      {/* Product-specific demo mockups */}
      <ProductDemoMockup chapterId={chapterId} isActive={isActive} />

      {/* AI Provider powered badge */}
      {isActive && (
        <motion.div
          className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-white/80">Powered by 12 AI Providers</span>
        </motion.div>
      )}
    </div>
  );
};

export default ChapterVisualEngine;
