/**
 * CREATE CONTEXT SELECTOR
 * Reusable, database-driven Intent + Region + Product context picker
 * 
 * - Intent options are registry-driven (easily extensible)
 * - Region auto-detected via useRegionalDetection
 * - Product list fetched from useProductContext
 * 
 * This component is modular and can be reused anywhere context selection is needed.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Globe, LayoutTemplate } from 'lucide-react';
import type { UseRegionalDetectionReturn } from '@/hooks/useRegionalDetection';
import type { UseProductContextReturn } from '@/hooks/useProductContext';

// ============================================================================
// INTENT REGISTRY — Database-ready, extensible without code changes
// ============================================================================

export interface ContentIntent {
  id: string;
  label: string;
  description: string;
  category: 'marketing' | 'education' | 'enterprise' | 'social';
  defaultStyles?: string[];
}

/**
 * Content intent registry. In future, this will be loaded from a DB table
 * (e.g., `content_intents`). For now, defined as a typed constant for
 * immediate use with zero hardcoding in components.
 */
export const CONTENT_INTENT_REGISTRY: ContentIntent[] = [
  { id: 'product-demo', label: 'Product Demo', description: 'Showcase product features', category: 'marketing', defaultStyles: ['product_demo'] },
  { id: 'hero-banner', label: 'Hero Banner', description: 'Landing page hero video', category: 'marketing', defaultStyles: ['hook_videos'] },
  { id: 'educational', label: 'Educational', description: 'Training & learning content', category: 'education', defaultStyles: ['educational'] },
  { id: 'testimonial', label: 'Testimonial', description: 'Customer success stories', category: 'marketing', defaultStyles: ['ugc_avatar_photorealistic'] },
  { id: 'case-study', label: 'Case Study', description: 'In-depth customer stories', category: 'enterprise', defaultStyles: ['smart_storytelling'] },
  { id: 'social-short', label: 'Social Short', description: 'Short-form social content', category: 'social', defaultStyles: ['hook_videos'] },
  { id: 'how-to', label: 'How-To Guide', description: 'Step-by-step tutorials', category: 'education', defaultStyles: ['educational'] },
  { id: 'thought-leadership', label: 'Thought Leadership', description: 'Industry expert content', category: 'enterprise', defaultStyles: ['smart_storytelling'] },
  { id: 'explainer', label: 'Explainer', description: 'Concept explainer video', category: 'education', defaultStyles: ['educational', 'animation_3d_explainer'] },
  { id: 'internal-comms', label: 'Internal Comms', description: 'Company announcements', category: 'enterprise', defaultStyles: ['corporate_training'] },
  { id: 'event-promo', label: 'Event Promo', description: 'Event promotion & recap', category: 'marketing', defaultStyles: ['event_recap'] },
  { id: 'investor-update', label: 'Investor Update', description: 'Stakeholder communications', category: 'enterprise', defaultStyles: ['investor_pitch'] },
];

/** Get intent by ID */
export const getIntentById = (id: string): ContentIntent | undefined =>
  CONTENT_INTENT_REGISTRY.find(i => i.id === id);

/** Get intents by category */
export const getIntentsByCategory = (category: ContentIntent['category']): ContentIntent[] =>
  CONTENT_INTENT_REGISTRY.filter(i => i.category === category);

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface CreateContextSelectorProps {
  /** Current selected intent */
  selectedIntent: string | null;
  /** Current selected region */
  selectedRegion: string;
  /** Current selected product ID */
  selectedProductId: string | null;
  /** Regional detection data */
  regionalDetection: UseRegionalDetectionReturn;
  /** Product context data */
  productContext: UseProductContextReturn;
  /** Callbacks */
  onIntentChange: (intent: string | null) => void;
  onProductChange: (productId: string | null) => void;
  /** Optional: navigate to templates on intent selection */
  onIntentSelected?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CreateContextSelector: React.FC<CreateContextSelectorProps> = ({
  selectedIntent,
  selectedRegion,
  selectedProductId,
  regionalDetection,
  productContext,
  onIntentChange,
  onProductChange,
  onIntentSelected,
  className,
}) => {
  const selectedIntentData = selectedIntent ? getIntentById(selectedIntent) : null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className || ''}`}>
      {/* Intent Selector */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Content Intent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select
            value={selectedIntent || 'none'}
            onValueChange={(value) => {
              const intent = value === 'none' ? null : value;
              onIntentChange(intent);
              if (intent) onIntentSelected?.();
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select intent..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select Intent —</SelectItem>
              {CONTENT_INTENT_REGISTRY.map((intent) => (
                <SelectItem key={intent.id} value={intent.id}>
                  {intent.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedIntentData && (
            <p className="text-xs text-muted-foreground">
              ✓ <strong>{selectedIntentData.label}</strong> — {selectedIntentData.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Region Context */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">
              Detected: <span className="font-semibold">{regionalDetection.regionName}</span>
            </p>
            <p className="text-muted-foreground">
              Selected: <span className="font-semibold">{selectedRegion}</span>
            </p>
          </div>
          {regionalDetection.isRTL && (
            <Badge variant="outline" className="text-[10px]">RTL Layout</Badge>
          )}
        </CardContent>
      </Card>

      {/* Product Context */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select
            value={selectedProductId || 'full-suite'}
            onValueChange={(value) => {
              onProductChange(value === 'full-suite' ? null : value);
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select product..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-suite">Full Suite</SelectItem>
              {productContext.allProducts.map((prod) => (
                <SelectItem key={prod.id} value={prod.id}>
                  {prod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProductId && productContext.product && (
            <p className="text-xs text-muted-foreground">
              ✓ {productContext.summary.totalAssets} assets available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateContextSelector;
