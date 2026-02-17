/**
 * ANIMATED GENIE LAMP COMPONENT
 * 
 * Beautiful purple/gold magic lamp matching the official brand
 * with emerging smoke, sparkles, and magical effects
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedGenieLampProps {
  isActive: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showGenie?: boolean;
}

export const AnimatedGenieLamp: React.FC<AnimatedGenieLampProps> = ({
  isActive,
  isSpeaking = false,
  size = 'lg',
  showGenie = true,
}) => {
  const sizeClasses = {
    sm: 'w-32 h-40',
    md: 'w-48 h-56',
    lg: 'w-64 h-72 md:w-80 md:h-96',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Magic glow behind lamp */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.4), transparent 70%)',
        }}
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        } : { opacity: 0.2 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating sparkles */}
      {isActive && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-300 rounded-full"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${10 + Math.random() * 40}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30 - Math.random() * 50],
                x: (Math.random() - 0.5) * 40,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </>
      )}

      {/* Emerging magical smoke */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-[55%] w-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Primary smoke trail */}
            <svg viewBox="0 0 100 120" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="smokeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
                </linearGradient>
                <filter id="smokeBlur">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>
              
              <motion.path
                d="M50 100 C40 80 60 60 45 40 C30 20 70 0 50 -20"
                fill="none"
                stroke="url(#smokeGradient)"
                strokeWidth="20"
                strokeLinecap="round"
                filter="url(#smokeBlur)"
                animate={{
                  d: [
                    "M50 100 C40 80 60 60 45 40 C30 20 70 0 50 -20",
                    "M50 100 C60 80 40 60 55 40 C70 20 30 0 50 -20",
                    "M50 100 C40 80 60 60 45 40 C30 20 70 0 50 -20",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Secondary smoke wisps */}
              <motion.path
                d="M45 90 C35 70 55 55 40 35"
                fill="none"
                stroke="url(#smokeGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                filter="url(#smokeBlur)"
                opacity="0.5"
                animate={{
                  d: [
                    "M45 90 C35 70 55 55 40 35",
                    "M55 90 C65 70 45 55 60 35",
                    "M45 90 C35 70 55 55 40 35",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Genie Character emerging from smoke */}
      <AnimatePresence>
        {isActive && showGenie && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-[70%]"
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Genie body - ethereal gradient */}
              <div className="relative w-20 h-28 md:w-28 md:h-36">
                {/* Tail fading into smoke */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 md:w-20 md:h-24 bg-gradient-to-t from-purple-600/80 via-violet-500/60 to-transparent rounded-b-[100px] blur-sm" />
                
                {/* Torso */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 md:w-18 md:h-18 bg-gradient-to-br from-purple-400 via-violet-400 to-indigo-500 rounded-full shadow-lg shadow-purple-500/30" />
                
                {/* Head */}
                <motion.div 
                  className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full shadow-xl"
                  animate={isSpeaking ? { scaleY: [1, 0.95, 1.02, 0.97, 1] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  {/* Eyes */}
                  <motion.div
                    className="absolute top-3 left-2 w-2.5 h-2.5 bg-white rounded-full shadow"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-purple-900 rounded-full" />
                  </motion.div>
                  <motion.div
                    className="absolute top-3 right-2 w-2.5 h-2.5 bg-white rounded-full shadow"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-purple-900 rounded-full" />
                  </motion.div>
                  
                  {/* Friendly smile */}
                  <motion.div
                    className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-2.5 border-b-2 border-purple-900 rounded-b-full"
                    animate={isSpeaking ? { scaleY: [1, 1.4, 0.8, 1.2, 1] } : {}}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  />
                </motion.div>
                
                {/* Arms with magical gestures */}
                <motion.div
                  className="absolute bottom-12 md:bottom-16 -left-4 w-10 h-2.5 bg-gradient-to-r from-transparent via-violet-400 to-purple-400 rounded-full origin-right"
                  animate={{ rotate: [-20, 20, -20] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-12 md:bottom-16 -right-4 w-10 h-2.5 bg-gradient-to-l from-transparent via-violet-400 to-purple-400 rounded-full origin-left"
                  animate={{ rotate: [20, -20, 20] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Magic Lamp - matching brand colors (purple/gold) */}
      <motion.svg
        viewBox="0 0 200 160"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto drop-shadow-2xl"
        animate={isActive ? {
          y: [0, -5, 0],
          rotate: [0, 1, -1, 0],
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          {/* Gold gradient for decorations */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="30%" stopColor="#FFA500" />
            <stop offset="70%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          
          {/* Purple gradient for lamp body */}
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="30%" stopColor="#6D28D9" />
            <stop offset="70%" stopColor="#5B21B6" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          
          {/* Shine effect */}
          <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="lampGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lamp base shadow */}
        <ellipse cx="100" cy="150" rx="45" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Lamp base - gold ring */}
        <ellipse cx="100" cy="145" rx="40" ry="10" fill="url(#goldGrad)" />
        <ellipse cx="100" cy="143" rx="35" ry="7" fill="url(#purpleGrad)" />

        {/* Lamp body - elegant curved shape */}
        <path
          d="M55 130 
             C35 115 40 85 50 70 
             Q60 55 80 45 
             Q95 38 100 38 
             Q105 38 120 45 
             Q140 55 150 70 
             C160 85 165 115 145 130 
             Q130 142 100 145 
             Q70 142 55 130 Z"
          fill="url(#purpleGrad)"
          filter={isActive ? "url(#lampGlow)" : undefined}
        />
        
        {/* Body shine highlight */}
        <path
          d="M65 95 Q70 70 90 55 Q100 48 100 50"
          fill="none"
          stroke="url(#shineGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Gold band decoration around body */}
        <path
          d="M60 100 Q65 90 100 85 Q135 90 140 100"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Spout - elegant curved */}
        <path
          d="M145 95 Q165 90 180 75 Q185 68 182 62 Q175 58 165 65 Q155 75 148 85"
          fill="url(#purpleGrad)"
        />
        <path
          d="M180 72 Q178 70 175 72"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Handle - ornate curved */}
        <path
          d="M55 90 Q30 85 25 60 Q22 35 45 40 Q55 42 58 55"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M55 90 Q30 85 25 60 Q22 35 45 40"
          fill="none"
          stroke="url(#shineGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Lamp lid - gold dome */}
        <ellipse cx="100" cy="40" rx="20" ry="6" fill="url(#goldGrad)" />
        <path
          d="M82 40 Q100 25 118 40"
          fill="url(#goldGrad)"
        />
        
        {/* Lid finial - gold tip */}
        <ellipse cx="100" cy="25" rx="5" ry="3" fill="url(#goldGrad)" />
        <path d="M97 25 Q100 15 103 25" fill="url(#goldGrad)" />
        
        {/* Magic glow at spout when active */}
        {isActive && (
          <motion.circle
            cx="182"
            cy="67"
            r="6"
            fill="#A855F7"
            animate={{
              r: [6, 10, 6],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.svg>
    </div>
  );
};

export default AnimatedGenieLamp;
