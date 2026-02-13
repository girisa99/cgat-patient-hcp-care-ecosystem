/**
 * INTENT SELECTOR - First step in CREATE workflow
 * 
 * Shows all 12 content intents grouped by category.
 * User selects intent → auto-advances to Templates.
 * Returns immediately to naive users (no Apply button).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTENT_INTENT_REGISTRY, type ContentIntent, getIntentsByCategory } from '../CreateContextSelector';

interface IntentSelectorProps {
  selectedIntent: string | null;
  onIntentSelect: (intentId: string) => void;
  onIntentConfirmed: () => void;
  className?: string;
}

const CATEGORY_ORDER = ['marketing', 'education', 'enterprise', 'social'] as const;
const CATEGORY_LABELS: Record<ContentIntent['category'], { label: string; description: string }> = {
  marketing: { label: '🎯 Marketing', description: 'Drive awareness & conversions' },
  education: { label: '📚 Educational', description: 'Teach & train audiences' },
  enterprise: { label: '🏢 Enterprise', description: 'Corporate & stakeholder comms' },
  social: { label: '📱 Social', description: 'Short-form social content' },
};

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onIntentSelect,
  onIntentConfirmed,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const groupedIntents = CATEGORY_ORDER.map(category => ({
    category,
    label: CATEGORY_LABELS[category].label,
    description: CATEGORY_LABELS[category].description,
    intents: getIntentsByCategory(category),
  })).filter(g => g.intents.length > 0);

  const selectedIntentData = selectedIntent 
    ? CONTENT_INTENT_REGISTRY.find(i => i.id === selectedIntent)
    : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">What are you creating?</h2>
            <p className="text-sm text-muted-foreground">Choose your content intent to auto-filter templates</p>
          </div>
        </div>
      </div>

      {/* Intent Groups */}
      <div className="space-y-5">
        {groupedIntents.map((group) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Category Header */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{group.label}</h3>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            {/* Intent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.intents.map((intent) => {
                const isSelected = selectedIntent === intent.id;
                const isHovered = hoveredId === intent.id;

                return (
                  <motion.button
                    key={intent.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setHoveredId(intent.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      onIntentSelect(intent.id);
                      // Auto-advance to templates on selection
                      setTimeout(onIntentConfirmed, 200);
                    }}
                    className="text-left"
                  >
                    <Card
                      className={cn(
                        'cursor-pointer transition-all h-full',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border/50 hover:border-primary/50 hover:shadow-md'
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{intent.label}</CardTitle>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                              >
                                <Check className="w-5 h-5 text-primary" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <CardDescription className="text-xs">
                          {intent.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        {/* Default styles badge */}
                        {intent.defaultStyles && intent.defaultStyles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {intent.defaultStyles.slice(0, 2).map((style) => (
                              <Badge
                                key={style}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {style.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                            {intent.defaultStyles.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{intent.defaultStyles.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Hover state: show action */}
                        <AnimatePresence>
                          {(isHovered || isSelected) && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="pt-1"
                            >
                              <Button
                                variant={isSelected ? 'default' : 'ghost'}
                                size="sm"
                                className="w-full h-7 text-xs gap-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onIntentSelect(intent.id);
                                  setTimeout(onIntentConfirmed, 200);
                                }}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Intent Summary */}
      <AnimatePresence>
        {selectedIntentData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-lg border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  ✓ {selectedIntentData.label} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-filtering templates & assets for this intent. Jump to templates to continue.
                </p>
              </div>
              <Button
                onClick={onIntentConfirmed}
                size="sm"
                className="gap-1 text-xs"
              >
                Go to Templates
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntentSelector;
