/**
 * CHAPTER VISUAL ENGINE
 * 
 * Renders script-accurate visuals for each chapter:
 * - 3D Genie lamp with emerging character
 * - Product-specific animations and elements
 * - Avatar presenters with lip-sync visualization
 * - Live demo mockups
 * - Floating UI elements per script
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Video, Presentation, Target, 
  MessageSquare, Globe, Wand2, FileText, Mic2,
  Play, Volume2, Layers, Zap, Monitor, Smartphone
} from 'lucide-react';

interface ChapterVisualEngineProps {
  chapterId: string;
  isPlaying: boolean;
  isGenerating: boolean;
}

// Product icons mapping
const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  spark: <Zap className="w-8 h-8" />,
  mind: <Brain className="w-8 h-8" />,
  vibe: <Video className="w-8 h-8" />,
  deck: <Presentation className="w-8 h-8" />,
  arc: <Target className="w-8 h-8" />,
  askGenie: <MessageSquare className="w-8 h-8" />,
  cast: <Globe className="w-8 h-8" />,
  opening: <Wand2 className="w-8 h-8" />,
  closing: <Sparkles className="w-8 h-8" />,
};

// Chapter-specific visual elements
const CHAPTER_VISUALS: Record<string, {
  background: string;
  elements: string[];
  color: string;
  glowColor: string;
}> = {
  opening: {
    background: 'from-purple-900 via-indigo-900 to-violet-900',
    elements: ['Golden Lamp', 'Magic Smoke', 'Cosmic Dust', 'Product Logos'],
    color: 'amber',
    glowColor: 'rgba(251, 191, 36, 0.5)',
  },
  spark: {
    background: 'from-orange-900 via-amber-900 to-yellow-900',
    elements: ['Script Generator', 'Input Types', 'Confidence Score', 'AI Models'],
    color: 'orange',
    glowColor: 'rgba(251, 146, 60, 0.5)',
  },
  mind: {
    background: 'from-blue-900 via-indigo-900 to-purple-900',
    elements: ['Neural Network', 'TTS Waveform', 'Enhancement UI', 'Voice Selector'],
    color: 'blue',
    glowColor: 'rgba(96, 165, 250, 0.5)',
  },
  vibe: {
    background: 'from-pink-900 via-rose-900 to-red-900',
    elements: ['3D Studio', 'Teleprompter', 'Avatar Model', 'Timeline'],
    color: 'rose',
    glowColor: 'rgba(251, 113, 133, 0.5)',
  },
  deck: {
    background: 'from-emerald-900 via-teal-900 to-cyan-900',
    elements: ['Slide Canvas', '3D Charts', 'Template Gallery', 'Presenter Avatar'],
    color: 'emerald',
    glowColor: 'rgba(52, 211, 153, 0.5)',
  },
  arc: {
    background: 'from-violet-900 via-purple-900 to-fuchsia-900',
    elements: ['Production Pipeline', 'Workflow Canvas', 'Publishing Grid', 'Analytics'],
    color: 'violet',
    glowColor: 'rgba(167, 139, 250, 0.5)',
  },
  askGenie: {
    background: 'from-cyan-900 via-blue-900 to-indigo-900',
    elements: ['Chat Interface', 'Voice Mode', 'Knowledge Base', 'Context Memory'],
    color: 'cyan',
    glowColor: 'rgba(34, 211, 238, 0.5)',
  },
  cast: {
    background: 'from-amber-900 via-orange-900 to-red-900',
    elements: ['Global Map', 'Publishing Channels', 'Analytics Dashboard', 'Scheduler'],
    color: 'amber',
    glowColor: 'rgba(251, 191, 36, 0.5)',
  },
  closing: {
    background: 'from-purple-900 via-indigo-900 to-violet-900',
    elements: ['All Products', 'Magic Sparkles', 'CTA Button', 'Logo'],
    color: 'amber',
    glowColor: 'rgba(251, 191, 36, 0.5)',
  },
};

// Genie Lamp SVG Component
const GenieLamp: React.FC<{ isActive: boolean; color: string }> = ({ isActive, color }) => (
  <motion.svg
    viewBox="0 0 200 180"
    className="w-40 h-36 md:w-56 md:h-48"
    animate={isActive ? { y: [0, -8, 0], rotate: [0, 2, -2, 0] } : {}}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <defs>
      <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#CD853F" />
      </linearGradient>
      <filter id="lampGlow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Lamp base */}
    <ellipse cx="100" cy="160" rx="55" ry="12" fill="url(#lampGold)" opacity="0.9" />
    
    {/* Lamp body */}
    <path
      d="M55 145 Q35 125 40 95 Q45 65 70 50 Q90 38 100 35 Q110 38 130 50 Q155 65 160 95 Q165 125 145 145 Z"
      fill="url(#lampGold)"
      filter={isActive ? "url(#lampGlow)" : undefined}
    />
    
    {/* Lamp spout */}
    <path
      d="M150 100 Q170 95 185 80 Q190 75 185 70 Q175 65 160 75"
      fill="url(#lampGold)"
      stroke="#FFD700"
      strokeWidth="2"
    />
    
    {/* Lamp handle */}
    <path
      d="M50 90 Q30 80 35 60 Q40 40 60 45"
      fill="none"
      stroke="url(#lampGold)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    
    {/* Lamp lid */}
    <ellipse cx="100" cy="35" rx="22" ry="7" fill="#FFD700" />
    <path d="M85 35 Q100 18 115 35" fill="#FFD700" />
    
    {/* Magic smoke emerging */}
    {isActive && (
      <motion.path
        d="M100 20 Q90 0 100 -20 Q110 -40 95 -55"
        fill="none"
        stroke={`url(#smoke-${color})`}
        strokeWidth="15"
        strokeLinecap="round"
        opacity="0.7"
        animate={{
          d: [
            "M100 20 Q90 0 100 -20 Q110 -40 95 -55",
            "M100 20 Q110 0 100 -20 Q90 -40 105 -55",
            "M100 20 Q90 0 100 -20 Q110 -40 95 -55",
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    )}
    
    <defs>
      <linearGradient id={`smoke-${color}`} x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9333EA" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
      </linearGradient>
    </defs>
  </motion.svg>
);

// Genie Character Component
const GenieCharacter: React.FC<{ isActive: boolean; emotion?: string }> = ({ isActive, emotion = 'happy' }) => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, scale: 0 }}
    animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    {/* Ethereal Genie body */}
    <motion.div
      className="relative w-24 h-32 md:w-32 md:h-44"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Genie torso - magical gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 md:w-28 md:h-32 bg-gradient-to-t from-purple-500/80 via-indigo-400/60 to-transparent rounded-t-full blur-sm" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 md:w-24 md:h-28 bg-gradient-to-t from-purple-400/90 via-violet-300/70 to-transparent rounded-t-full" />
      
      {/* Genie head */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full shadow-lg"
        animate={emotion === 'speaking' ? { scaleY: [1, 0.95, 1] } : {}}
        transition={{ duration: 0.15, repeat: Infinity }}
      >
        {/* Eyes */}
        <motion.div 
          className="absolute top-4 left-2 w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"
          animate={{ scaleY: [1, 0.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="absolute top-0.5 left-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-900 rounded-full" />
        </motion.div>
        <motion.div 
          className="absolute top-4 right-2 w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"
          animate={{ scaleY: [1, 0.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="absolute top-0.5 left-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-900 rounded-full" />
        </motion.div>
        
        {/* Smile */}
        <motion.div 
          className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 md:w-6 md:h-3 border-b-2 border-purple-900 rounded-b-full"
          animate={emotion === 'speaking' ? { scaleY: [1, 1.5, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Arms gesturing */}
      <motion.div
        className="absolute top-14 -left-6 md:top-20 md:-left-8 w-10 h-3 md:w-14 md:h-4 bg-gradient-to-r from-purple-300 to-transparent rounded-full origin-right"
        animate={{ rotate: [-15, 15, -15] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-14 -right-6 md:top-20 md:-right-8 w-10 h-3 md:w-14 md:h-4 bg-gradient-to-l from-purple-300 to-transparent rounded-full origin-left"
        animate={{ rotate: [15, -15, 15] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  </motion.div>
);

// Floating UI Elements for each chapter
const FloatingElements: React.FC<{ chapterId: string; isActive: boolean }> = ({ chapterId, isActive }) => {
  const elements = CHAPTER_VISUALS[chapterId]?.elements || [];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {isActive && elements.map((element, idx) => (
        <motion.div
          key={element}
          className="absolute bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/80"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: [0, Math.sin(idx * 2) * 10, 0],
            y: [0, Math.cos(idx * 2) * 8, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: idx * 0.2 
          }}
          style={{
            top: `${15 + (idx % 3) * 25}%`,
            left: idx % 2 === 0 ? '5%' : 'auto',
            right: idx % 2 === 1 ? '5%' : 'auto',
          }}
        >
          {element}
        </motion.div>
      ))}
    </div>
  );
};

// Product logos orbiting
const OrbitingProducts: React.FC<{ isActive: boolean; currentProduct: string }> = ({ isActive, currentProduct }) => {
  const products = ['spark', 'mind', 'vibe', 'deck', 'arc', 'askGenie', 'cast'];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {isActive && products.map((product, idx) => {
        const angle = (idx / products.length) * Math.PI * 2;
        const radius = 140;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.4;
        const isCurrentProduct = product === currentProduct;
        
        return (
          <motion.div
            key={product}
            className={`absolute left-1/2 top-1/2 w-10 h-10 rounded-full flex items-center justify-center ${
              isCurrentProduct 
                ? 'bg-amber-500/30 border-amber-400' 
                : 'bg-white/10 border-white/20'
            } border`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: x - 20,
              y: y - 20,
            }}
            transition={{ 
              duration: 0.5, 
              delay: idx * 0.1 
            }}
          >
            <span className="text-lg">{
              product === 'spark' ? '⚡' :
              product === 'mind' ? '🧠' :
              product === 'vibe' ? '🎬' :
              product === 'deck' ? '📊' :
              product === 'arc' ? '🎯' :
              product === 'askGenie' ? '💬' :
              '🌍'
            }</span>
          </motion.div>
        );
      })}
    </div>
  );
};

// Live Demo Mockup for Spark
const SparkDemoMockup: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <motion.div
    className="absolute inset-8 md:inset-12 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
  >
    <div className="flex h-full">
      {/* Input panel */}
      <div className="w-1/2 p-4 border-r border-white/10">
        <div className="text-xs text-white/60 mb-2">Input</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {['📄 Doc', '🎥 Video', '🔗 URL', '🎤 Voice'].map((item, idx) => (
            <motion.div
              key={item}
              className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-300"
              initial={{ opacity: 0, x: -10 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + idx * 0.1 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="h-20 bg-white/5 rounded border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 text-sm"
          animate={isActive ? { borderColor: ['rgba(255,255,255,0.2)', 'rgba(251,146,60,0.5)', 'rgba(255,255,255,0.2)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Drop content here...
        </motion.div>
      </div>
      
      {/* Output panel */}
      <div className="w-1/2 p-4">
        <div className="text-xs text-white/60 mb-2">Generated Script</div>
        <div className="space-y-2">
          {['Welcome to your story...', 'Where ideas become...', 'Reality in seconds.'].map((line, idx) => (
            <motion.div
              key={idx}
              className="h-4 bg-gradient-to-r from-orange-500/20 to-transparent rounded"
              initial={{ width: 0 }}
              animate={isActive ? { width: '100%' } : { width: 0 }}
              transition={{ duration: 0.8, delay: 1 + idx * 0.3 }}
            />
          ))}
        </div>
        <motion.div
          className="mt-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="text-xs text-green-400">✓ 96% confidence</div>
          <div className="text-xs text-blue-400">Claude + GPT-4o</div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

// Avatar Presenter for Deck
const AvatarPresenter: React.FC<{ isActive: boolean; isSpeaking: boolean }> = ({ isActive, isSpeaking }) => (
  <motion.div
    className="absolute bottom-20 right-8 md:right-16"
    initial={{ opacity: 0, x: 50 }}
    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
  >
    <div className="relative">
      {/* Avatar body */}
      <div className="w-20 h-28 md:w-28 md:h-40 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-full rounded-b-3xl shadow-2xl">
        {/* Head */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full">
          {/* Eyes */}
          <motion.div 
            className="absolute top-4 left-2 w-2 h-2 bg-gray-800 rounded-full"
            animate={isSpeaking ? {} : { scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div 
            className="absolute top-4 right-2 w-2 h-2 bg-gray-800 rounded-full"
            animate={isSpeaking ? {} : { scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          {/* Mouth */}
          <motion.div 
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-400 rounded-full"
            animate={isSpeaking ? { scaleY: [1, 0.5, 1.2, 0.7, 1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </div>
        
        {/* Arm gesturing */}
        <motion.div
          className="absolute top-10 -right-4 w-8 h-3 bg-emerald-500 rounded-full origin-left"
          animate={{ rotate: [0, 30, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      {/* Name badge */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
        AI Presenter
      </div>
    </div>
  </motion.div>
);

export const ChapterVisualEngine: React.FC<ChapterVisualEngineProps> = ({
  chapterId,
  isPlaying,
  isGenerating,
}) => {
  const visual = CHAPTER_VISUALS[chapterId] || CHAPTER_VISUALS.opening;
  const isActive = isPlaying || isGenerating;
  
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${visual.background} overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
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
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Central visual content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Opening/Closing: Lamp + Genie */}
        {(chapterId === 'opening' || chapterId === 'closing') && (
          <div className="relative flex flex-col items-center">
            <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
            <GenieLamp isActive={isActive} color={visual.color} />
            <OrbitingProducts isActive={isActive} currentProduct={chapterId} />
          </div>
        )}
        
        {/* Spark: Live Demo */}
        {chapterId === 'spark' && (
          <>
            <div className="relative flex flex-col items-center z-10">
              <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
            </div>
            <SparkDemoMockup isActive={isActive} />
          </>
        )}
        
        {/* Mind: Neural patterns + TTS waveform */}
        {chapterId === 'mind' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${visual.glowColor} 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
            
            {/* TTS Waveform */}
            {isActive && (
              <motion.div 
                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full"
                    animate={{ 
                      height: isPlaying ? [8, 24 + Math.random() * 20, 8] : 8 
                    }}
                    transition={{ 
                      duration: 0.3, 
                      repeat: Infinity, 
                      delay: i * 0.05 
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
        
        {/* Vibe: 3D Studio */}
        {chapterId === 'vibe' && (
          <div className="relative w-full h-full">
            {/* Floating screens */}
            {isActive && (
              <>
                <motion.div
                  className="absolute top-10 left-10 w-32 h-20 bg-black/40 rounded border border-white/20 flex items-center justify-center"
                  initial={{ opacity: 0, rotateY: -30 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Monitor className="w-6 h-6 text-rose-400" />
                  <span className="text-xs text-white/60 ml-2">Teleprompter</span>
                </motion.div>
                <motion.div
                  className="absolute top-10 right-10 w-32 h-20 bg-black/40 rounded border border-white/20 flex items-center justify-center"
                  initial={{ opacity: 0, rotateY: 30 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Layers className="w-6 h-6 text-rose-400" />
                  <span className="text-xs text-white/60 ml-2">Timeline</span>
                </motion.div>
                <motion.div
                  className="absolute bottom-20 left-10 w-20 h-32 bg-black/40 rounded border border-white/20 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Smartphone className="w-6 h-6 text-rose-400 mb-1" />
                  <span className="text-xs text-white/60">Mobile</span>
                </motion.div>
              </>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
            </div>
          </div>
        )}
        
        {/* Deck: Avatar Presenter */}
        {chapterId === 'deck' && (
          <div className="relative w-full h-full">
            {/* Floating slides */}
            {isActive && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
                {[1, 2, 3].map((slide, idx) => (
                  <motion.div
                    key={slide}
                    className="w-24 h-16 bg-white/10 rounded border border-white/20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.15 }}
                  >
                    <div className="p-2">
                      <div className="h-2 w-12 bg-emerald-400/40 rounded mb-1" />
                      <div className="h-1 w-16 bg-white/20 rounded mb-1" />
                      <div className="h-1 w-10 bg-white/20 rounded" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
            </div>
            
            <AvatarPresenter isActive={isActive} isSpeaking={isPlaying} />
          </div>
        )}
        
        {/* Arc, AskGenie, Cast: Generic with floating elements */}
        {['arc', 'askGenie', 'cast'].includes(chapterId) && (
          <div className="relative">
            <GenieCharacter isActive={isActive} emotion={isPlaying ? 'speaking' : 'happy'} />
          </div>
        )}
      </div>
      
      {/* Floating UI elements */}
      <FloatingElements chapterId={chapterId} isActive={isActive} />
      
      {/* Product icon overlay */}
      <motion.div
        className="absolute top-4 left-4 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className={`w-10 h-10 rounded-full bg-${visual.color}-500/20 border border-${visual.color}-500/40 flex items-center justify-center text-${visual.color}-400`}>
          {PRODUCT_ICONS[chapterId]}
        </div>
      </motion.div>
    </div>
  );
};

export default ChapterVisualEngine;
