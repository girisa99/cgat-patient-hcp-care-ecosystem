/**
 * Genie Spark Logo Component
 * "Ignite Your Ideas" - AI-powered content generation engine
 * Part of Genie Studio
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface GenieSparkLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
}

export function GenieSparkLogo({
  size = 'md',
  showTagline = true,
  variant = 'full',
  className,
}: GenieSparkLogoProps) {
  const sizeConfig = {
    sm: { lamp: 32, text: 'text-lg', tagline: 'text-[10px]', spark: 12 },
    md: { lamp: 48, text: 'text-xl', tagline: 'text-xs', spark: 16 },
    lg: { lamp: 64, text: 'text-2xl', tagline: 'text-sm', spark: 20 },
    xl: { lamp: 80, text: 'text-3xl', tagline: 'text-base', spark: 24 },
  };

  const config = sizeConfig[size];

  // Genie Lamp with Spark SVG
  const LampIcon = () => (
    <svg
      viewBox="0 0 64 64"
      width={config.lamp}
      height={config.lamp}
      className="flex-shrink-0"
    >
      <defs>
        {/* Gold gradient for lamp */}
        <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        {/* Spark gradient - electric orange/yellow */}
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="50%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
        {/* Glow filter for spark */}
        <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Lamp Base */}
      <ellipse cx="32" cy="52" rx="18" ry="6" fill="url(#lampGold)" />
      
      {/* Lamp Body */}
      <path
        d="M20 48 C16 42, 14 34, 18 26 C22 18, 42 18, 46 26 C50 34, 48 42, 44 48 Z"
        fill="url(#lampGold)"
        stroke="#8B6914"
        strokeWidth="1"
      />
      
      {/* Lamp Spout */}
      <path
        d="M44 32 L58 24 L56 28 L44 34 Z"
        fill="url(#lampGold)"
        stroke="#8B6914"
        strokeWidth="0.5"
      />
      
      {/* Lamp Handle */}
      <path
        d="M20 30 Q10 30, 12 38 Q14 44, 18 44"
        fill="none"
        stroke="url(#lampGold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Spark/Lightning emerging from spout */}
      <g filter="url(#sparkGlow)">
        {/* Main spark bolt */}
        <path
          d="M56 20 L48 14 L52 12 L44 4 L50 10 L46 12 L54 16 Z"
          fill="url(#sparkGradient)"
        />
        {/* Secondary sparks */}
        <circle cx="42" cy="8" r="1.5" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="58" cy="12" r="1" fill="#FF6B00">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="2" r="1.2" fill="#FFB800">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Lamp lid/cap */}
      <ellipse cx="32" cy="26" rx="8" ry="2" fill="#8B6914" />
      
      {/* Decorative band */}
      <rect x="24" y="40" width="16" height="2" rx="1" fill="#8B6914" opacity="0.6" />
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
          <span className={cn("font-bold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent", config.text)}>
            Genie Spark
          </span>
          {showTagline && (
            <span className={cn("text-muted-foreground italic", config.tagline)}>
              Ignite Your Ideas
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
        <span className={cn("font-bold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent", config.text)}>
          Genie Spark
        </span>
        {showTagline && (
          <span className={cn("text-muted-foreground italic", config.tagline)}>
            Ignite Your Ideas
          </span>
        )}
      </div>
    </div>
  );
}

// Export a standalone spark icon for smaller use cases
export function SparkIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("text-amber-500", className)}
    >
      <defs>
        <linearGradient id="miniSparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="50%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
      </defs>
      {/* Lightning bolt */}
      <path
        d="M13 2L4 14h7l-2 8 11-12h-7l2-8z"
        fill="url(#miniSparkGradient)"
        stroke="#B8860B"
        strokeWidth="0.5"
      />
    </svg>
  );
}
