/**
 * CHAPTER VISUAL ENGINE (v3)
 * 
 * Clean implementation showing only:
 * - Official product logos in white card
 * - Animated Genie lamp below
 * - Minimal floating elements
 * - NO duplicate text (text is in HeroScriptVideo overlay)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { AnimatedGenieLamp } from './AnimatedGenieLamp';
import { ProductLogoDisplay, OrbitingProductLogos } from './ProductLogoDisplay';

interface ChapterVisualEngineProps {
  chapterId: string;
  isPlaying: boolean;
  isGenerating: boolean;
}

// Chapter-specific visual configuration (background only)
const CHAPTER_VISUALS: Record<string, {
  background: string;
  glowColor: string;
}> = {
  opening: {
    background: 'from-violet-950 via-purple-900 to-indigo-950',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  spark: {
    background: 'from-orange-950 via-amber-900 to-yellow-950',
    glowColor: 'rgba(251, 146, 60, 0.4)',
  },
  mind: {
    background: 'from-blue-950 via-indigo-900 to-purple-950',
    glowColor: 'rgba(96, 165, 250, 0.4)',
  },
  vibe: {
    background: 'from-pink-950 via-rose-900 to-red-950',
    glowColor: 'rgba(251, 113, 133, 0.4)',
  },
  deck: {
    background: 'from-emerald-950 via-teal-900 to-cyan-950',
    glowColor: 'rgba(52, 211, 153, 0.4)',
  },
  arc: {
    background: 'from-violet-950 via-purple-900 to-fuchsia-950',
    glowColor: 'rgba(167, 139, 250, 0.4)',
  },
  askGenie: {
    background: 'from-cyan-950 via-blue-900 to-indigo-950',
    glowColor: 'rgba(34, 211, 238, 0.4)',
  },
  cast: {
    background: 'from-amber-950 via-orange-900 to-red-950',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  closing: {
    background: 'from-violet-950 via-purple-900 to-indigo-950',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
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
        {[...Array(20)].map((_, i) => (
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
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Central visual content - Logo + Lamp */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Opening/Closing: Full Lamp + Orbiting Products */}
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

        {/* Product chapters: Logo in white card + mini lamp */}
        {!isOpeningOrClosing && (
          <div className="relative flex flex-col items-center gap-4">
            {/* Product Logo - THE main visual, white card background */}
            <ProductLogoDisplay
              chapterId={chapterId}
              isActive={isActive}
              size="lg"
            />
            
            {/* Mini lamp below logo */}
            <motion.div
              className="scale-40 origin-top opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3 }}
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

      {/* AI Provider badge - bottom left */}
      {isActive && (
        <motion.div
          className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-white/80">Powered by 19 AI Providers</span>
        </motion.div>
      )}
    </div>
  );
};

export default ChapterVisualEngine;
