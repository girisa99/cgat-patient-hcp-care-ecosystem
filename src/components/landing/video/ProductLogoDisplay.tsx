/**
 * PRODUCT LOGO DISPLAY COMPONENT
 * 
 * Shows the official Genie product logos with animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import official logos
import genieSparkLogo from '@/assets/logos/genie-spark.png';
import genieMindLogo from '@/assets/logos/genie-mind.png';
import genieVibeLogo from '@/assets/logos/genie-vibe.png';
import genieArcLogo from '@/assets/logos/genie-arc.png';
import askGenieLogo from '@/assets/logos/ask-genie.png';
import genieCastLogo from '@/assets/logos/genie-cast.png';
import genieStudioLogo from '@/assets/logos/genie-studio.png';

// Product to logo mapping
const PRODUCT_LOGOS: Record<string, string> = {
  opening: genieStudioLogo,
  spark: genieSparkLogo,
  mind: genieMindLogo,
  vibe: genieVibeLogo,
  deck: genieStudioLogo, // Use studio for deck (no dedicated logo uploaded)
  arc: genieArcLogo,
  askGenie: askGenieLogo,
  cast: genieCastLogo,
  closing: genieStudioLogo,
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
  
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32 md:w-40 md:h-40',
    lg: 'w-48 h-48 md:w-64 md:h-64',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapterId}
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect behind logo */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Logo image */}
        <motion.img
          src={logo}
          alt={`Genie ${chapterId}`}
          className="w-full h-full object-contain drop-shadow-xl"
          animate={isActive ? {
            y: [0, -5, 0],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
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
    { id: 'spark', logo: genieSparkLogo },
    { id: 'mind', logo: genieMindLogo },
    { id: 'vibe', logo: genieVibeLogo },
    { id: 'arc', logo: genieArcLogo },
    { id: 'askGenie', logo: askGenieLogo },
    { id: 'cast', logo: genieCastLogo },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {isActive && products.map((product, idx) => {
        const angle = (idx / products.length) * Math.PI * 2;
        const radius = 160;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.35;
        const isCurrentProduct = product.id === currentProduct;
        
        return (
          <motion.div
            key={product.id}
            className={`absolute left-1/2 top-1/2 w-14 h-14 md:w-18 md:h-18 rounded-xl flex items-center justify-center ${
              isCurrentProduct 
                ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30' 
                : ''
            }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isCurrentProduct ? 1 : 0.6,
              scale: isCurrentProduct ? 1.1 : 1,
              x: x - 28,
              y: y - 28,
            }}
            transition={{ 
              duration: 0.6, 
              delay: idx * 0.1 
            }}
          >
            <img
              src={product.logo}
              alt={product.id}
              className="w-full h-full object-contain rounded-lg"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductLogoDisplay;
