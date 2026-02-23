/**
 * CreateHeroBanner — Animated hero banner for each CREATE sub-page
 * 
 * Features:
 * - Parallax background with subtle motion
 * - Gradient overlay with glassmorphism
 * - Integrated AnimatedMascot
 * - Responsive: full-width on mobile, contained on desktop
 * - Active particles/sparkle effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Hero images
import discoverHero from '@/assets/create-heroes/discover-hero.jpg';
import intentHero from '@/assets/create-heroes/intent-hero.jpg';
import configureHero from '@/assets/create-heroes/configure-hero.jpg';
import templatesHero from '@/assets/create-heroes/templates-hero.jpg';
import assetsHero from '@/assets/create-heroes/assets-hero.jpg';

export type CreatePageId = 'discover' | 'intent' | 'configure' | 'templates' | 'assets';

interface HeroConfig {
  image: string;
  message: string;
  title: string;
  subtitle: string;
  gradient: string;
}

const HERO_CONFIG: Record<CreatePageId, HeroConfig> = {
  discover: {
    image: discoverHero,
    message: "Hey! What shall we create today? Pick a category to explore! 🎯",
    title: 'Discover',
    subtitle: 'Explore categories, pipelines & AI capabilities',
    gradient: 'from-cyan-500/30 via-transparent to-purple-500/20',
  },
  intent: {
    image: intentHero,
    message: "Choose your content format — I'll set up the perfect AI pipeline! ⚡",
    title: 'Content Intent',
    subtitle: 'Pick your format: Video, Banner, Social or Landing',
    gradient: 'from-indigo-500/30 via-transparent to-cyan-500/20',
  },
  configure: {
    image: configureHero,
    message: "Let's fine-tune your settings — platform, languages, visual style... 🎨",
    title: 'Style & Configure',
    subtitle: 'Platform, languages, visual style & AI enrichment',
    gradient: 'from-purple-500/30 via-transparent to-emerald-500/20',
  },
  templates: {
    image: templatesHero,
    message: "Great picks! Now select a blueprint that matches your vision 🎬",
    title: 'Templates',
    subtitle: 'Choose a blueprint with pre-configured scenes & AI routing',
    gradient: 'from-amber-500/30 via-transparent to-cyan-500/20',
  },
  assets: {
    image: assetsHero,
    message: "Almost ready! Add your brand assets and we're off to production! 🚀",
    title: 'Assets & Brand',
    subtitle: 'Upload brand assets, hero banners & regional config',
    gradient: 'from-emerald-500/30 via-transparent to-indigo-500/20',
  },
};

// Sparkle particles
const SPARKLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 2,
  duration: 1.5 + Math.random() * 2,
}));

interface CreateHeroBannerProps {
  pageId: CreatePageId;
  className?: string;
}

export const CreateHeroBanner: React.FC<CreateHeroBannerProps> = ({
  pageId,
  className = '',
}) => {
  const config = HERO_CONFIG[pageId];
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border border-border/20 ${isMobile ? 'h-36' : 'h-48'} ${className}`}
    >
      {/* Background image with parallax motion */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={config.image}
          alt={config.title}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />

      {/* Animated sparkle particles */}
      {SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white/60"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-end justify-between p-4 md:p-6">
        <div className="flex-1 min-w-0">
          <motion.h2
            className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {config.title}
          </motion.h2>
          <motion.p
            className={`text-muted-foreground mt-0.5 ${isMobile ? 'text-[10px]' : 'text-sm'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {config.subtitle}
          </motion.p>
        </div>

        {/* Mascot message only (mascot visual is in sidebar progress) */}
        {!isMobile && config.message && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-[280px] rounded-xl px-3 py-2 bg-background/70 backdrop-blur-md border border-border/30 shadow-lg"
          >
            <p className="text-xs text-foreground/80 leading-relaxed">{config.message}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CreateHeroBanner;
