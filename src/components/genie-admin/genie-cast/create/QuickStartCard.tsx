/**
 * QuickStartCard - 1-click smart defaults for Genie Cast CREATE
 * 
 * Auto-selects a popular template + default audience + basic styles
 * to get users to PRODUCE in seconds.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import type { VideoStyleType } from '../VideoStyleCards';

interface QuickStartCardProps {
  onQuickStart: (blueprint: VideoBlueprint, styles: VideoStyleType[]) => void;
  hasActiveSession: boolean;
  className?: string;
}

const DEFAULT_QUICK_STYLES: VideoStyleType[] = [
  'product_demo',
  'smart_storytelling',
  'hook_videos',
];

export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  onQuickStart,
  hasActiveSession,
  className,
}) => {
  const { blueprints, isLoading } = useVideoBlueprints();
  const [isStarting, setIsStarting] = useState(false);

  // Pick the most popular template (highest usage_count) 
  const topTemplate = React.useMemo(() => {
    if (!blueprints?.length) return null;
    return [...blueprints]
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .find(bp => bp.is_active);
  }, [blueprints]);

  const handleQuickStart = async () => {
    if (!topTemplate) return;
    setIsStarting(true);
    // Small delay to show animation
    await new Promise(r => setTimeout(r, 400));
    onQuickStart(topTemplate, DEFAULT_QUICK_STYLES);
    setIsStarting(false);
  };

  if (hasActiveSession) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Quick Start
                <Badge variant="secondary" className="text-[10px] h-4">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  Smart Defaults
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {topTemplate 
                  ? `Auto-selects "${topTemplate.name}" + 3 styles → ready to produce in 1 click`
                  : 'Loading best template...'
                }
              </p>
            </div>

            {/* CTA */}
            <Button
              size="sm"
              onClick={handleQuickStart}
              disabled={isLoading || !topTemplate || isStarting}
              className={cn(
                "gap-1.5 flex-shrink-0 h-9 px-4",
                "bg-gradient-to-r from-primary to-accent hover:opacity-90"
              )}
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Creating
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
