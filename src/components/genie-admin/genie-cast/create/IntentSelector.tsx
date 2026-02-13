/**
 * INTENT SELECTOR - Compact guided step for CREATE workflow
 * 
 * Renders as a compact card with a dropdown selector (not full-screen cards).
 * Designed for naive users: pick from dropdown → auto-advance to Templates.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CONTENT_INTENT_REGISTRY, type ContentIntent, getIntentsByCategory } from '../CreateContextSelector';

interface IntentSelectorProps {
  selectedIntent: string | null;
  onIntentSelect: (intentId: string) => void;
  onIntentConfirmed: () => void;
  className?: string;
}

const CATEGORY_ORDER = ['marketing', 'education', 'enterprise', 'social'] as const;
const CATEGORY_LABELS: Record<ContentIntent['category'], string> = {
  marketing: '🎯 Marketing',
  education: '📚 Educational',
  enterprise: '🏢 Enterprise',
  social: '📱 Social',
};

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onIntentSelect,
  onIntentConfirmed,
  className,
}) => {
  const selectedIntentData = selectedIntent
    ? CONTENT_INTENT_REGISTRY.find(i => i.id === selectedIntent)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('max-w-xl mx-auto', className)}
    >
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="pt-6 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold">What are you creating?</h3>
              <p className="text-sm text-muted-foreground">Pick a content type to get started</p>
            </div>
          </div>

          {/* Compact dropdown selector */}
          <Select
            value={selectedIntent || ''}
            onValueChange={(value) => {
              onIntentSelect(value);
            }}
          >
            <SelectTrigger className="h-12 text-base bg-background">
              <SelectValue placeholder="Choose content type..." />
            </SelectTrigger>
            <SelectContent className="z-[100000]">
              {CATEGORY_ORDER.map((category) => {
                const intents = getIntentsByCategory(category);
                if (intents.length === 0) return null;
                return (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs font-semibold">
                      {CATEGORY_LABELS[category]}
                    </SelectLabel>
                    {intents.map((intent) => (
                      <SelectItem key={intent.id} value={intent.id}>
                        <div className="flex items-center gap-2">
                          <span>{intent.label}</span>
                          <span className="text-muted-foreground text-xs">— {intent.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>

          {/* Selection confirmation + next step */}
          {selectedIntentData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between gap-3 pt-2 border-t"
            >
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium">{selectedIntentData.label}</span>
                {selectedIntentData.defaultStyles?.slice(0, 1).map(s => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={onIntentConfirmed}
                size="sm"
                className="gap-1.5"
              >
                Next: Choose Template
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IntentSelector;
