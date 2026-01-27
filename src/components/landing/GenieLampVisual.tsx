/**
 * GENIE LAMP VISUAL COMPONENT
 * 
 * Animated Genie lamp with character/avatar for video presentation
 * Uses Three.js-inspired CSS animations without heavy 3D library
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GenieLampVisualProps {
  isActive: boolean;
  currentProduct?: string;
  className?: string;
}

// Product-specific colors and effects
const PRODUCT_THEMES: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  icon: string;
}> = {
  spark: {
    primary: 'from-yellow-400 to-orange-500',
    secondary: 'bg-yellow-500/20',
    glow: 'shadow-yellow-500/50',
    icon: '⚡',
  },
  mind: {
    primary: 'from-purple-400 to-indigo-500',
    secondary: 'bg-purple-500/20',
    glow: 'shadow-purple-500/50',
    icon: '🧠',
  },
  vibe: {
    primary: 'from-pink-400 to-rose-500',
    secondary: 'bg-pink-500/20',
    glow: 'shadow-pink-500/50',
    icon: '🎬',
  },
  deck: {
    primary: 'from-blue-400 to-cyan-500',
    secondary: 'bg-blue-500/20',
    glow: 'shadow-blue-500/50',
    icon: '📊',
  },
  arc: {
    primary: 'from-green-400 to-emerald-500',
    secondary: 'bg-green-500/20',
    glow: 'shadow-green-500/50',
    icon: '🎯',
  },
  askGenie: {
    primary: 'from-amber-400 to-yellow-500',
    secondary: 'bg-amber-500/20',
    glow: 'shadow-amber-500/50',
    icon: '💬',
  },
  cast: {
    primary: 'from-violet-400 to-purple-500',
    secondary: 'bg-violet-500/20',
    glow: 'shadow-violet-500/50',
    icon: '🌍',
  },
  opening: {
    primary: 'from-amber-400 via-yellow-500 to-orange-500',
    secondary: 'bg-amber-500/20',
    glow: 'shadow-amber-500/50',
    icon: '✨',
  },
  closing: {
    primary: 'from-amber-400 via-yellow-500 to-orange-500',
    secondary: 'bg-amber-500/20',
    glow: 'shadow-amber-500/50',
    icon: '🌟',
  },
};

export const GenieLampVisual: React.FC<GenieLampVisualProps> = ({
  isActive,
  currentProduct = 'opening',
  className = '',
}) => {
  const theme = PRODUCT_THEMES[currentProduct] || PRODUCT_THEMES.opening;
  
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* Background magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isActive && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${theme.primary}`}
            initial={{ 
              x: '50%',
              y: '80%',
              scale: 0,
              opacity: 0,
            }}
            animate={{ 
              x: `${20 + Math.random() * 60}%`,
              y: `${10 + Math.random() * 40}%`,
              scale: [0, 1, 0.5],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      
      {/* Central Genie lamp */}
      <motion.div
        className="relative z-10"
        animate={isActive ? {
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Lamp glow effect */}
        <motion.div
          className={`absolute inset-0 blur-3xl ${theme.secondary} rounded-full`}
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          } : { scale: 1, opacity: 0.3 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: 'translate(-20%, -20%)', width: '140%', height: '140%' }}
        />
        
        {/* Lamp SVG representation */}
        <motion.div
          className={`relative w-32 h-40 md:w-48 md:h-56 ${theme.glow} shadow-2xl`}
          whileHover={{ scale: 1.05 }}
        >
          {/* Lamp body */}
          <svg viewBox="0 0 200 250" className="w-full h-full">
            <defs>
              <linearGradient id={`lampGradient-${currentProduct}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#CD853F" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Lamp base */}
            <ellipse cx="100" cy="220" rx="60" ry="15" fill={`url(#lampGradient-${currentProduct})`} opacity="0.8"/>
            
            {/* Lamp body */}
            <path 
              d="M50 200 Q30 180 35 150 Q40 120 60 100 Q80 80 100 75 Q120 80 140 100 Q160 120 165 150 Q170 180 150 200 Z" 
              fill={`url(#lampGradient-${currentProduct})`}
              filter="url(#glow)"
            />
            
            {/* Lamp spout */}
            <path 
              d="M155 150 Q175 145 190 130 Q195 125 190 120 Q180 115 165 125" 
              fill={`url(#lampGradient-${currentProduct})`}
              stroke="#FFD700"
              strokeWidth="2"
            />
            
            {/* Lamp handle */}
            <path 
              d="M45 140 Q25 130 30 110 Q35 90 55 95" 
              fill="none"
              stroke={`url(#lampGradient-${currentProduct})`}
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Lamp lid */}
            <ellipse cx="100" cy="75" rx="25" ry="8" fill="#FFD700"/>
            <path d="M85 75 Q100 55 115 75" fill="#FFD700"/>
            
            {/* Magic smoke/genie emerging */}
            {isActive && (
              <motion.g
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.path
                  d="M100 50 Q90 30 100 10 Q110 -10 95 -30"
                  fill="none"
                  stroke="url(#smokeGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  opacity="0.6"
                  animate={{
                    d: [
                      "M100 50 Q90 30 100 10 Q110 -10 95 -30",
                      "M100 50 Q110 30 100 10 Q90 -10 105 -30",
                      "M100 50 Q90 30 100 10 Q110 -10 95 -30",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <defs>
                  <linearGradient id="smokeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </motion.g>
            )}
          </svg>
          
          {/* Product icon floating above */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl md:text-4xl"
              initial={{ opacity: 0, y: 20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme.icon}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Sparkle effects around lamp */}
        {isActive && (
          <>
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -left-6"
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GenieLampVisual;
