/**
 * Product Feature Teaser Component
 * 
 * Shows Genie Suite product features and capabilities as marketing teasers
 * Educates users on cross-product workflows and drives feature discovery
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, ArrowRight, Sparkles, Zap, 
  CheckCircle, ExternalLink, Info, ChevronRight,
  LayoutGrid, Clock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ProductFeatureTeaser as FeatureTeaserType,
  GenieProduct,
  useProductMarketingTeaser
} from '@/services/productMarketingTeaserService';

// ============================================
// PRODUCT ICONS
// ============================================

const PRODUCT_ICONS: Record<GenieProduct, string> = {
  spark: '✨',
  mind: '🧠',
  vibe: '🎬',
  deck: '📊',
  arc: '🎯',
  hub: '🧞',
  askGenie: '🧞'
};

const PRODUCT_COLORS: Record<GenieProduct, string> = {
  spark: 'from-amber-500 to-orange-500',
  mind: 'from-purple-500 to-violet-500',
  vibe: 'from-rose-500 to-pink-500',
  deck: 'from-emerald-500 to-teal-500',
  arc: 'from-blue-500 to-indigo-500',
  hub: 'from-indigo-500 to-purple-500',
  askGenie: 'from-indigo-500 to-purple-500'
};

// ============================================
// FEATURE TEASER CARD
// ============================================

interface FeatureTeaserCardProps {
  feature: FeatureTeaserType;
  variant?: 'compact' | 'full' | 'inline';
  onAction: (action: 'interested' | 'dismiss' | 'try_now' | 'view') => void;
  showHowItWorks?: boolean;
}

export const FeatureTeaserCard: React.FC<FeatureTeaserCardProps> = ({
  feature,
  variant = 'full',
  onAction,
  showHowItWorks = false
}) => {
  const [expanded, setExpanded] = useState(showHowItWorks);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTryNow = () => {
    onAction('try_now');
  };

  const handleDismiss = () => {
    onAction('dismiss');
  };

  const handleInterested = () => {
    onAction('interested');
  };

  if (variant === 'compact') {
    return (
      <Card className="bg-background/80 backdrop-blur border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
        <CardContent className="p-3" onClick={() => onAction('view')}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PRODUCT_COLORS[feature.product]} flex items-center justify-center shrink-0`}>
              <span className="text-xl">{PRODUCT_ICONS[feature.product]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{feature.title}</h4>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {feature.tier}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{feature.tagline}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border hover:bg-muted/80 transition-colors">
        <div className={`w-8 h-8 rounded bg-gradient-to-br ${PRODUCT_COLORS[feature.product]} flex items-center justify-center`}>
          <span className="text-lg">{PRODUCT_ICONS[feature.product]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{feature.featureName}</p>
          <p className="text-[10px] text-muted-foreground">{feature.keyMetric.value} {feature.keyMetric.label}</p>
        </div>
        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={handleInterested}>
          Learn more
        </Button>
      </div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-background border border-border rounded-xl overflow-hidden shadow-lg"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${PRODUCT_COLORS[feature.product]} p-4 text-white relative`}>
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-2xl">{PRODUCT_ICONS[feature.product]}</span>
          </div>
          <div>
            <Badge className="bg-white/20 text-white border-0 text-[10px] mb-1">
              {feature.product.toUpperCase()}
            </Badge>
            <h3 className="font-bold text-lg">{feature.title}</h3>
            <p className="text-white/90 text-sm">{feature.tagline}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{feature.description}</p>

        {/* Key Metric + Use Case */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-xl font-bold text-primary">{feature.keyMetric.value}</div>
            <div className="text-xs text-muted-foreground">{feature.keyMetric.label}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{feature.useCaseExample.from}</span>
              <ArrowRight className="h-3 w-3 text-primary" />
              <span className="font-medium">{feature.useCaseExample.to}</span>
            </div>
            <div className="text-xs text-primary font-medium mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {feature.useCaseExample.time}
            </div>
          </div>
        </div>

        {/* How It Works (expandable) */}
        <div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Info className="h-4 w-4" />
            How it works
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {feature.howItWorks.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Works with:</span>
          <div className="flex gap-1">
            {feature.relatedProducts.map(product => (
              <div 
                key={product}
                className="w-6 h-6 rounded bg-muted flex items-center justify-center"
                title={product}
              >
                <span className="text-sm">{PRODUCT_ICONS[product]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleInterested}
          >
            <Star className="h-3 w-3 mr-1" />
            Save for later
          </Button>
          <Button 
            size="sm" 
            className={`flex-1 bg-gradient-to-r ${PRODUCT_COLORS[feature.product]} text-white border-0`}
            onClick={handleTryNow}
          >
            Try it now
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Tier badge */}
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground">
            {feature.tier === 'free' 
              ? '✓ Included in all plans' 
              : `Available in ${feature.tier.charAt(0).toUpperCase() + feature.tier.slice(1)} and above`
            }
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// PRODUCT DISCOVERY PANEL
// ============================================

interface ProductDiscoveryPanelProps {
  currentProduct: GenieProduct;
  onFeatureSelect: (feature: FeatureTeaserType) => void;
}

export const ProductDiscoveryPanel: React.FC<ProductDiscoveryPanelProps> = ({
  currentProduct,
  onFeatureSelect
}) => {
  const { getProductOverview, getDiscoveryProgress, getCrossProductSuggestions } = useProductMarketingTeaser();
  const products = getProductOverview();
  const progress = getDiscoveryProgress();
  const suggestions = getCrossProductSuggestions(currentProduct);

  return (
    <div className="space-y-4">
      {/* Discovery Progress */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Suite Discovery</span>
          <Badge variant="outline">{progress.discoveryScore}%</Badge>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
            style={{ width: `${progress.discoveryScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Explored {progress.viewedCount} of {progress.totalFeatures} features
        </p>
      </div>

      {/* Cross-product suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Works great with {currentProduct}
          </h4>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map(feature => (
              <FeatureTeaserCard
                key={feature.id}
                feature={feature}
                variant="compact"
                onAction={() => onFeatureSelect(feature)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Genie Suite
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {products.map(product => (
            <div 
              key={product.product}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                product.product === currentProduct 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-background border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{product.icon}</span>
                <span className="font-medium text-sm">{product.name.replace('Genie ', '')}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{product.tagline}</p>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${(product.viewedCount / product.featureCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {product.viewedCount}/{product.featureCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// FLOATING PRODUCT TEASER
// ============================================

interface FloatingProductTeaserProps {
  feature: FeatureTeaserType;
  onClose: () => void;
  onAction: (action: 'interested' | 'dismiss' | 'try_now') => void;
}

export const FloatingProductTeaser: React.FC<FloatingProductTeaserProps> = ({
  feature,
  onClose,
  onAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
    >
      <FeatureTeaserCard
        feature={feature}
        variant="full"
        onAction={(action) => {
          if (action === 'dismiss') {
            onClose();
          }
          onAction(action as 'interested' | 'dismiss' | 'try_now');
        }}
      />
    </motion.div>
  );
};

export default FeatureTeaserCard;
