/**
 * PRODUCT LOGO DISPLAY COMPONENT
 * 
 * Shows the official Genie product logos with animations
 * Uses the latest uploaded brand assets
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import official logos - latest versions
import genieSparkLogo from '@/assets/logos/genie-spark-combined-3.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined-7.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined-8.png';
import genieArcLogo from '@/assets/logos/genie-arc-presentation-7.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined-8.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo-3.png';
import genieStudioLogo from '@/assets/logos/genie-studio-combined-7.png';

// Product to logo mapping with latest assets
const PRODUCT_LOGOS: Record<string, string> = {
  opening: genieStudioLogo,
  spark: genieSparkLogo,
  mind: genieMindLogo,
  vibe: genieVibeLogo,
  deck: genieStudioLogo, // Deck uses studio logo
  arc: genieArcLogo,
  askGenie: askGenieLogo,
  cast: genieCastLogo,
  closing: genieStudioLogo,
};

// Product names for alt text
const PRODUCT_NAMES: Record<string, string> = {
  opening: 'Genie Studio',
  spark: 'Genie Spark',
  mind: 'Genie Mind',
  vibe: 'Genie Vibe',
  deck: 'Genie Deck',
  arc: 'Genie Arc',
  askGenie: 'Ask Genie',
  cast: 'Genie Cast',
  closing: 'Genie Studio',
};

interface ProductLogoDisplayProps {
  chapterId: string;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProductLogoDisplay: React.FC<ProductLogoDisplayProps> = ({
  chapterId,
  isActive,
  size = 'md',
  showLabel = false,
}) => {
  const logo = PRODUCT_LOGOS[chapterId] || genieStudioLogo;
  const productName = PRODUCT_NAMES[chapterId] || 'Genie Studio';
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40 md:w-52 md:h-52',
    lg: 'w-56 h-56 md:w-72 md:h-72',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapterId}
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Glow effect behind logo */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3), rgba(147, 51, 234, 0.2), transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {/* White background card for better logo visibility */}
        <motion.div
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 border border-white/50"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Logo image */}
          <motion.img
            src={logo}
            alt={productName}
            className="w-full h-full object-contain max-w-[180px] md:max-w-[240px] max-h-[180px] md:max-h-[240px]"
            animate={isActive ? {
              y: [0, -4, 0],
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Sparkle effects */}
        {isActive && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full"
                style={{
                  top: `${10 + i * 20}%`,
                  left: i % 2 === 0 ? '-10%' : 'auto',
                  right: i % 2 === 1 ? '-10%' : 'auto',
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Orbiting product logos for opening/closing chapters
export const OrbitingProductLogos: React.FC<{
  currentProduct: string;
  isActive: boolean;
}> = ({ currentProduct, isActive }) => {
  const products = [
    { id: 'spark', logo: genieSparkLogo, name: 'Spark' },
    { id: 'mind', logo: genieMindLogo, name: 'Mind' },
    { id: 'vibe', logo: genieVibeLogo, name: 'Vibe' },
    { id: 'arc', logo: genieArcLogo, name: 'Arc' },
    { id: 'askGenie', logo: askGenieLogo, name: 'Ask Genie' },
    { id: 'cast', logo: genieCastLogo, name: 'Cast' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {isActive && products.map((product, idx) => {
        const angle = (idx / products.length) * Math.PI * 2;
        const radius = 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.35;
        const isCurrentProduct = product.id === currentProduct;
        
        return (
          <motion.div
            key={product.id}
            className={`absolute left-1/2 top-1/2 w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-xl flex items-center justify-center shadow-lg ${
              isCurrentProduct 
                ? 'ring-2 ring-amber-400 shadow-amber-500/30' 
                : ''
            }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isCurrentProduct ? 1 : 0.7,
              scale: isCurrentProduct ? 1.1 : 1,
              x: x - 32,
              y: y - 32,
            }}
            transition={{ 
              duration: 0.6, 
              delay: idx * 0.1 
            }}
          >
            <img
              src={product.logo}
              alt={product.name}
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductLogoDisplay;
