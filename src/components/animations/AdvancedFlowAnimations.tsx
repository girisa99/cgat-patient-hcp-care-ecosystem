import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// Advanced 3D Flow Animations
export const Advanced3DNodeAnimation: React.FC<{
  isActive?: boolean;
  nodeType?: string;
  children: React.ReactNode;
}> = ({ isActive, nodeType, children }) => {
  const getNodeColor = (type: string) => {
    const colors = {
      ai: '#3b82f6',
      data: '#10b981', 
      logic: '#f59e0b',
      api: '#ef4444',
      trigger: '#8b5cf6'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
      animate={{ 
        opacity: 1, 
        scale: isActive ? 1.1 : 1,
        rotateY: 0,
        boxShadow: isActive ? `0 0 30px ${getNodeColor(nodeType || 'default')}50` : '0 0 0px transparent'
      }}
      whileHover={{ 
        scale: 1.05,
        rotateX: 5,
        rotateY: 5,
        transition: { type: 'spring', stiffness: 300 }
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <Float speed={1.5} rotationIntensity={0.5}>
            <Sphere args={[0.5, 32, 32]} position={[-1, 0, 0]}>
              <meshStandardMaterial color={getNodeColor(nodeType || 'default')} />
            </Sphere>
          </Float>
          
          <Float speed={2} rotationIntensity={0.3}>
            <Box args={[0.3, 0.3, 0.3]} position={[1, 0, 0]}>
              <meshStandardMaterial color={getNodeColor(nodeType || 'default')} wireframe />
            </Box>
          </Float>
          
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 bg-card/90 backdrop-blur-sm rounded-lg border h-full">
        {children}
      </div>

      {/* Particle Effects */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Physics-based Connection Animation
export const PhysicsConnectionLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive?: boolean;
  data?: any;
}> = ({ from, to, isActive, data }) => {
  const [pathLength, setPathLength] = React.useState(0);
  
  const path = `M ${from.x},${from.y} Q ${(from.x + to.x) / 2},${from.y - 50} ${to.x},${to.y}`;
  
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d={path}
        stroke="url(#connectionGradient)"
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        filter={isActive ? "url(#glow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isActive ? 1 : 0.6,
          strokeDasharray: isActive ? "5,5" : "none"
        }}
        transition={{
          pathLength: { duration: 1, ease: "easeInOut" },
          strokeDasharray: { duration: 0.5 }
        }}
      />
      
      {/* Data Flow Animation */}
      {isActive && data && (
        <motion.circle
          r="4"
          fill="#fff"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href={`#${path}`} />
          </animateMotion>
        </motion.circle>
      )}
    </svg>
  );
};

// Micro-interaction Animations
export const MicroInteractionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}> = ({ children, onClick, variant = 'primary' }) => {
  const [isPressed, setIsPressed] = React.useState(false);
  
  const variants = {
    primary: { 
      bg: 'from-blue-500 to-purple-600',
      shadow: '0 0 20px rgba(59, 130, 246, 0.5)'
    },
    secondary: { 
      bg: 'from-gray-500 to-gray-600',
      shadow: '0 0 20px rgba(107, 114, 128, 0.5)'
    },
    success: { 
      bg: 'from-green-500 to-emerald-600',
      shadow: '0 0 20px rgba(34, 197, 94, 0.5)'
    },
    warning: { 
      bg: 'from-yellow-500 to-orange-600',
      shadow: '0 0 20px rgba(245, 158, 11, 0.5)'
    }
  };

  return (
    <motion.button
      className={`relative px-6 py-3 rounded-lg bg-gradient-to-r ${variants[variant].bg} text-white font-medium overflow-hidden`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow: variants[variant].shadow,
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
    >
      {/* Ripple Effect */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={isPressed ? { scale: 2, opacity: 0 } : { scale: 0, opacity: 0.5 }}
        transition={{ duration: 0.6 }}
        style={{ borderRadius: '50%' }}
      />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'linear'
        }}
      />
    </motion.button>
  );
};

// Complex Workflow State Animation
export const WorkflowStateVisualizer: React.FC<{
  state: 'idle' | 'running' | 'success' | 'error' | 'paused';
  progress?: number;
}> = ({ state, progress = 0 }) => {
  const stateConfig = {
    idle: { color: '#6b7280', icon: '⏸️', animation: 'pulse' },
    running: { color: '#3b82f6', icon: '⚡', animation: 'spin' },
    success: { color: '#10b981', icon: '✅', animation: 'bounce' },
    error: { color: '#ef4444', icon: '❌', animation: 'shake' },
    paused: { color: '#f59e0b', icon: '⏸️', animation: 'pulse' }
  };

  const config = stateConfig[state];

  const animationVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 2, repeat: Infinity }
    },
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: 'linear' }
    },
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.6, repeat: 3 }
    },
    shake: {
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.5, repeat: 2 }
    }
  };

  return (
    <div className="relative w-16 h-16 mx-auto">
      {/* Background Circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-4"
        style={{ borderColor: config.color }}
        animate={animationVariants[config.animation as keyof typeof animationVariants] as any}
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeDasharray={`${progress * 2.83} 283`}
            strokeLinecap="round"
            opacity={0.3}
          />
        </svg>
      </motion.div>

      {/* Center Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-2xl"
        animate={animationVariants[config.animation as keyof typeof animationVariants] as any}
      >
        {config.icon}
      </motion.div>

      {/* Particle Effects for Running State */}
      {state === 'running' && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ 
                x: 32, 
                y: 32,
                scale: 0 
              }}
              animate={{
                x: 32 + Math.cos(i * 0.785) * 40,
                y: 32 + Math.sin(i * 0.785) * 40,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Export enhanced animation system
export const enhancedAnimations = {
  Advanced3DNodeAnimation,
  PhysicsConnectionLine,
  MicroInteractionButton, 
  WorkflowStateVisualizer
};