/**
 * QuadrantProductHeader - Unified Product Header for 4-Quadrant Architecture
 * 
 * Provides consistent branding within each quadrant while preserving
 * individual product identity (logo, tagline, colors).
 * 
 * Includes back navigation to the main Genie Studio dashboard.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

// Product branding configuration
export interface ProductBranding {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  gradientFrom: string;
  gradientTo: string;
  badgeColor: string;
  quadrant: 'create' | 'produce' | 'manage' | 'publish';
}

// Import product logos
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';

// Product branding registry - single source of truth
export const PRODUCT_BRANDING: Record<string, ProductBranding> = {
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    logo: genieSparkLogo,
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-500',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    quadrant: 'create',
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    logo: genieMindLogo,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    quadrant: 'create',
  },
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    logo: genieDeckLogo,
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    quadrant: 'create',
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    logo: genieVibeLogo,
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-purple-500',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    quadrant: 'produce',
  },
};

// Quadrant mapping for products
export const QUADRANT_PRODUCTS = {
  create: ['spark', 'mind', 'deck'],
  produce: ['vibe'],
  manage: ['arc', 'hub'],
  publish: ['cast'],
};

// Quadrant labels for breadcrumb
const QUADRANT_LABELS = {
  create: 'CREATE',
  produce: 'PRODUCE',
  manage: 'MANAGE',
  publish: 'PUBLISH',
};

interface QuadrantProductHeaderProps {
  productId: keyof typeof PRODUCT_BRANDING;
  showAIBadge?: boolean;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

/**
 * Compact product header with logo, name, tagline, and back navigation
 * Designed to work within QuadrantLayout (which handles global nav)
 */
export const QuadrantProductHeader: React.FC<QuadrantProductHeaderProps> = ({
  productId,
  showAIBadge = true,
  showBackButton = true,
  rightContent,
  className,
}) => {
  const navigate = useNavigate();
  const product = PRODUCT_BRANDING[productId];
  
  if (!product) {
    console.warn(`Unknown product: ${productId}`);
    return null;
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: Back button + Product branding */}
        <div className="flex items-center gap-3">
          {/* Back to Dashboard Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/genie-studio')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}

          {/* Separator */}
          {showBackButton && (
            <div className="h-6 w-px bg-border hidden sm:block" />
          )}

          {/* Quadrant badge */}
          <Badge variant="outline" className="hidden md:flex text-xs">
            {QUADRANT_LABELS[product.quadrant]}
          </Badge>

          {/* Logo */}
          <div className="h-10 w-10 rounded-lg bg-card border border-border/50 flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
            <img 
              src={product.logo} 
              alt={product.name} 
              className="h-full w-full object-contain" 
            />
          </div>
          
          {/* Name & Tagline */}
          <div>
            <h1 className={cn(
              "text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent",
              product.gradientFrom,
              product.gradientTo
            )}>
              {product.name}
            </h1>
            <p className="text-xs text-muted-foreground">{product.tagline}</p>
          </div>
        </div>

        {/* Right: Badge + custom content */}
        <div className="flex items-center gap-2">
          {showAIBadge && (
            <Badge className={cn("gap-1 hidden sm:flex", product.badgeColor)}>
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  );
};

/**
 * Minimal product identifier for use in tight spaces
 */
export const ProductBadge: React.FC<{ productId: string; size?: 'sm' | 'md' }> = ({ 
  productId, 
  size = 'md' 
}) => {
  const product = PRODUCT_BRANDING[productId];
  if (!product) return null;

  const sizeClasses = size === 'sm' 
    ? 'h-6 w-6 p-1' 
    : 'h-8 w-8 p-1.5';

  return (
    <div className={cn(
      "rounded-md bg-card border border-border/50 flex items-center justify-center overflow-hidden",
      sizeClasses
    )}>
      <img 
        src={product.logo} 
        alt={product.name} 
        className="h-full w-full object-contain" 
      />
    </div>
  );
};

export default QuadrantProductHeader;
