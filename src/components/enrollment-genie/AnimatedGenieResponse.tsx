import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import genieAnimatedImg from '@/assets/genie-animated.png';

interface AnimatedGenieResponseProps {
  isVisible: boolean;
  message?: string;
}

const humoriousFumes = [
  "🧬 Analyzing DNA sequences...",
  "⚗️ Brewing some gene therapy!",
  "🔬 Consulting my biotech crystal ball",
  "🧪 Mixing knowledge molecules",
  "💡 Processing cellular wisdom",
  "🔋 Charging therapeutic insights",
  "🌟 Summoning clinical data",
  "🚀 Launching drug discovery mode",
  "🎯 Targeting therapeutic solutions",
  "💊 Formulating precision medicine",
  "🧠 Neurons firing at max capacity!",
  "⚡ Generating breakthrough insights"
];

export const AnimatedGenieResponse = ({ isVisible, message }: AnimatedGenieResponseProps) => {
  const [currentFume, setCurrentFume] = useState(0);
  const [showFumes, setShowFumes] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowFumes(true);
      const interval = setInterval(() => {
        setCurrentFume(prev => (prev + 1) % humoriousFumes.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setShowFumes(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex items-start gap-4 p-4">
      <div className="relative flex-shrink-0">
        {/* Animated Genie Character */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotate: [0, 2, -2, 0],
            y: [0, -5, 0]
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ 
            duration: 0.6,
            rotate: { duration: 3, repeat: Infinity },
            y: { duration: 2, repeat: Infinity }
          }}
          className="relative"
        >
          <img 
            src={genieAnimatedImg} 
            alt="GENIE - Your Technology Navigator" 
            className="w-20 h-20 rounded-full border-2 border-primary/20 shadow-lg"
          />
          
          {/* Magical Sparkles */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.2
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.5
            }}
          />
        </motion.div>

        {/* Animated Thought Fumes */}
        <AnimatePresence>
          {showFumes && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10"
            >
              <motion.div
                className="bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white text-xs px-3 py-2 rounded-full whitespace-nowrap shadow-lg border border-cyan-300/30"
                animate={{
                  y: [0, -5, 0],
                  rotate: [-1, 1, -1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⚡
                  </motion.span>
                  {humoriousFumes[currentFume]}
                </div>
                
                {/* Speech bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-500/90" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swirling Smoke Effect */}
        <motion.div
          className="absolute -inset-2 pointer-events-none"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full border border-dashed border-cyan-300/20 rounded-full" />
        </motion.div>
      </div>

      {/* Response Content */}
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex-1"
        >
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >
                🧞‍♂️
              </motion.div>
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  GENIE - Your Technology Navigator
                </p>
                <div className="text-sm text-foreground leading-relaxed">
                  {message}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};