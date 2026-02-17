import React from 'react';
import { motion } from 'framer-motion';

// Enhanced animation variants for workflow components
export const flowAnimations = {
  // Node animations
  nodeEntry: {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: -90,
      filter: 'blur(10px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.6, 
      rotateY: 90,
      filter: 'blur(5px)',
      transition: { duration: 0.3 }
    }
  },

  // Connection line animations
  connectionDraw: {
    initial: { 
      pathLength: 0,
      opacity: 0
    },
    animate: { 
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.2, ease: 'easeInOut' as const },
        opacity: { duration: 0.3 }
      }
    }
  },

  // Process flow pulse
  processPulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.7)',
        '0 0 0 10px rgba(59, 130, 246, 0)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  },

  // Data flow animation
  dataFlow: {
    animate: {
      x: [0, 100, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear' as const
      }
    }
  },

  // Hover interactions
  nodeHover: {
    whileHover: {
      scale: 1.05,
      y: -2,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    },
    whileTap: {
      scale: 0.98
    }
  },

  // Loading states
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear' as const
      }
    }
  }
};

// Animated wrapper components
export const AnimatedNode: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}> = ({ children, isActive, className = '' }) => (
  <motion.div
    className={className}
    variants={flowAnimations.nodeEntry}
    initial="initial"
    animate="animate"
    exit="exit"
    {...flowAnimations.nodeHover}
    style={{
      transformStyle: 'preserve-3d'
    }}
  >
    {isActive && (
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-primary/50"
        variants={flowAnimations.processPulse}
        animate="animate"
      />
    )}
    {children}
  </motion.div>
);

export const AnimatedConnection: React.FC<{
  path: string;
  isActive?: boolean;
}> = ({ path, isActive }) => (
  <motion.svg className="absolute inset-0 pointer-events-none">
    <motion.path
      d={path}
      stroke={isActive ? '#3b82f6' : '#e5e7eb'}
      strokeWidth="2"
      fill="none"
      variants={flowAnimations.connectionDraw}
      initial="initial"
      animate="animate"
    />
    {isActive && (
      <motion.circle
        r="4"
        fill="#3b82f6"
        variants={flowAnimations.dataFlow}
        animate="animate"
      >
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href={`#${path}`} />
        </animateMotion>
      </motion.circle>
    )}
  </motion.svg>
);

export const ProcessFlowIndicator: React.FC<{
  isActive: boolean;
  children: React.ReactNode;
}> = ({ isActive, children }) => (
  <motion.div
    className="relative"
    animate={isActive ? {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.7)',
        '0 0 0 10px rgba(59, 130, 246, 0)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    } : {}}
  >
    {children}
  </motion.div>
);