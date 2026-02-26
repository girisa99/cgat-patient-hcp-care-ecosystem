/**
 * AnimatedMascot — Pixar-style Ori & Arc with framer-motion animations
 * 
 * Features:
 * - Idle breathing/floating animation loop
 * - Bounce-in entrance animation
 * - Step-aware character + pose selection
 * - Speech bubble with contextual message
 * - Responsive: larger on desktop, compact on mobile
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Character images
import oriWaving from '@/assets/characters/ori-waving.png';
import oriThinking from '@/assets/characters/ori-thinking.png';
import arcPointing from '@/assets/characters/arc-pointing.png';
import arcCelebrating from '@/assets/characters/arc-celebrating.png';

export type MascotPose = 'waving' | 'thinking' | 'pointing' | 'celebrating';
export type MascotCharacter = 'ori' | 'arc';

interface AnimatedMascotProps {
  character: MascotCharacter;
  pose: MascotPose;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Inline = in content flow; floating = absolute positioned */
  position?: 'inline' | 'floating';
}

const CHARACTER_IMAGES: Record<string, string> = {
  'ori-waving': oriWaving,
  'ori-thinking': oriThinking,
  'arc-pointing': arcPointing,
  'arc-celebrating': arcCelebrating,
};

const SIZE_MAP = {
  sm: { img: 'w-12 h-12', bubble: 'max-w-[160px] text-[10px]' },
  md: { img: 'w-20 h-20', bubble: 'max-w-[220px] text-xs' },
  lg: { img: 'w-28 h-28', bubble: 'max-w-[280px] text-sm' },
};

const CHARACTER_COLORS: Record<MascotCharacter, string> = {
  ori: 'from-cyan-500/20 to-cyan-600/10',
  arc: 'from-indigo-500/20 to-indigo-600/10',
};

const GLOW_COLORS: Record<MascotCharacter, string> = {
  ori: '0 0 30px rgba(6, 182, 212, 0.3)',
  arc: '0 0 30px rgba(99, 102, 241, 0.3)',
};

export const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  character,
  pose,
  message,
  size: sizeProp,
  className = '',
  position = 'inline',
}) => {
  const isMobile = useIsMobile();
  const size = sizeProp ?? (isMobile ? 'sm' : 'md');
  const sizeConfig = SIZE_MAP[size];
  const imgSrc = CHARACTER_IMAGES[`${character}-${pose}`] || CHARACTER_IMAGES['ori-waving'];

  return (
    <motion.div
      className={`flex items-end gap-2 ${position === 'floating' ? 'absolute z-20' : 'relative'} ${className}`}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      {/* Character image with idle float */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -6, 0],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${CHARACTER_COLORS[character]} blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <img
          src={imgSrc}
          alt={`${character} ${pose}`}
          className={`${sizeConfig.img} object-contain relative z-10 drop-shadow-lg`}
          style={{ filter: `drop-shadow(${GLOW_COLORS[character]})` }}
        />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`${sizeConfig.bubble} rounded-xl px-3 py-2 bg-background/80 backdrop-blur-md border border-border/30 shadow-lg`}
          >
            <p className="text-foreground/90 leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedMascot;
