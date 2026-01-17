/**
 * Genie Deck Logo Component
 * "Ideas to Impact" - AI-powered presentation generator
 * Purple lamp with presentation slides emerging
 * Part of Genie Studio
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface GenieDeckLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
}

export function GenieDeckLogo({
  size = 'md',
  showTagline = true,
  variant = 'full',
  className,
}: GenieDeckLogoProps) {
  const sizeConfig = {
    sm: { lamp: 32, text: 'text-lg', tagline: 'text-[10px]', slides: 10 },
    md: { lamp: 48, text: 'text-xl', tagline: 'text-xs', slides: 14 },
    lg: { lamp: 64, text: 'text-2xl', tagline: 'text-sm', slides: 18 },
    xl: { lamp: 80, text: 'text-3xl', tagline: 'text-base', slides: 22 },
  };

  const config = sizeConfig[size];

  // Genie Lamp with Presentation Slides SVG
  const LampIcon = () => (
    <svg
      viewBox="0 0 64 64"
      width={config.lamp}
      height={config.lamp}
      className="flex-shrink-0"
    >
      <defs>
        {/* Purple gradient for lamp */}
        <linearGradient id="deckLampPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        {/* Lighter purple for accents */}
        <linearGradient id="deckLampLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        {/* Slide gradient - white/light */}
        <linearGradient id="slideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
        {/* Glow filter for slides */}
        <filter id="slideGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Magic sparkle filter */}
        <filter id="deckSparkle" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Lamp Base */}
      <ellipse cx="32" cy="52" rx="18" ry="6" fill="url(#deckLampPurple)" />
      
      {/* Lamp Body */}
      <path
        d="M20 48 C16 42, 14 34, 18 26 C22 18, 42 18, 46 26 C50 34, 48 42, 44 48 Z"
        fill="url(#deckLampPurple)"
        stroke="#6B21A8"
        strokeWidth="1"
      />
      
      {/* Lamp Spout */}
      <path
        d="M44 32 L58 24 L56 28 L44 34 Z"
        fill="url(#deckLampPurple)"
        stroke="#6B21A8"
        strokeWidth="0.5"
      />
      
      {/* Lamp Handle */}
      <path
        d="M20 30 Q10 30, 12 38 Q14 44, 18 44"
        fill="none"
        stroke="url(#deckLampLight)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Presentation Slides emerging from spout */}
      <g filter="url(#slideGlow)">
        {/* Back slide */}
        <rect 
          x="44" y="6" 
          width="14" height="10" 
          rx="1" 
          fill="url(#slideGradient)"
          stroke="#A855F7"
          strokeWidth="0.5"
          transform="rotate(-15 51 11)"
        />
        {/* Middle slide */}
        <rect 
          x="48" y="4" 
          width="12" height="9" 
          rx="1" 
          fill="url(#slideGradient)"
          stroke="#8B5CF6"
          strokeWidth="0.5"
          transform="rotate(-5 54 8)"
        />
        {/* Front slide with content lines */}
        <rect 
          x="50" y="2" 
          width="11" height="8" 
          rx="1" 
          fill="#FFFFFF"
          stroke="#7C3AED"
          strokeWidth="0.6"
        />
        {/* Content lines on front slide */}
        <line x1="52" y1="4" x2="59" y2="4" stroke="#C084FC" strokeWidth="1" />
        <line x1="52" y1="6" x2="58" y2="6" stroke="#DDD6FE" strokeWidth="0.5" />
        <line x1="52" y1="7.5" x2="57" y2="7.5" stroke="#DDD6FE" strokeWidth="0.5" />
      </g>
      
      {/* Magic sparkles */}
      <g filter="url(#deckSparkle)">
        <circle cx="45" cy="14" r="1" fill="#E9D5FF">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="62" cy="6" r="0.8" fill="#C084FC">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="56" cy="0" r="1" fill="#A855F7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Lamp lid/cap */}
      <ellipse cx="32" cy="26" rx="8" ry="2" fill="#6B21A8" />
      
      {/* Decorative band */}
      <rect x="24" y="40" width="16" height="2" rx="1" fill="#6B21A8" opacity="0.6" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <LampIcon />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        <LampIcon />
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 bg-clip-text text-transparent", config.text)}>
            Genie Deck
          </span>
          {showTagline && (
            <span className={cn("text-muted-foreground italic", config.tagline)}>
              Ideas to Impact
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full variant (vertical)
  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <LampIcon />
      <div className="flex flex-col items-center">
        <span className={cn("font-bold tracking-tight bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 bg-clip-text text-transparent", config.text)}>
          Genie Deck
        </span>
        {showTagline && (
          <span className={cn("text-muted-foreground italic", config.tagline)}>
            Ideas to Impact
          </span>
        )}
      </div>
    </div>
  );
}

// Export a standalone deck/slide icon for smaller use cases
export function DeckIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("text-purple-500", className)}
    >
      <defs>
        <linearGradient id="miniDeckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* Presentation slide stack */}
      <rect x="4" y="6" width="16" height="12" rx="1.5" fill="url(#miniDeckGradient)" stroke="#6B21A8" strokeWidth="0.5" />
      <rect x="6" y="4" width="14" height="10" rx="1" fill="#E9D5FF" stroke="#A855F7" strokeWidth="0.3" />
      <rect x="8" y="2" width="12" height="8" rx="1" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="0.5" />
      {/* Content lines */}
      <line x1="10" y1="4" x2="18" y2="4" stroke="#C084FC" strokeWidth="1" />
      <line x1="10" y1="6" x2="16" y2="6" stroke="#DDD6FE" strokeWidth="0.5" />
      <line x1="10" y1="8" x2="14" y2="8" stroke="#DDD6FE" strokeWidth="0.5" />
    </svg>
  );
}

export default GenieDeckLogo;
