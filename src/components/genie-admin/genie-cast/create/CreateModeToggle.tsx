/**
 * CreateModeToggle - Simple/Advanced mode switch
 * 
 * Compact toggle that persists user preference.
 * Shows contextual tooltip explaining each mode.
 */

import React from 'react';
import { Zap, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CreateMode } from '@/hooks/useCreateMode';

interface CreateModeToggleProps {
  mode: CreateMode;
  onToggle: () => void;
  className?: string;
}

export const CreateModeToggle: React.FC<CreateModeToggleProps> = ({
  mode,
  onToggle,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className={cn(
              "gap-1.5 text-xs h-7 px-2.5 transition-colors",
              mode === 'simple' 
                ? "border-primary/30 text-primary hover:bg-primary/5"
                : "border-accent/30 text-accent-foreground hover:bg-accent/10",
              className
            )}
          >
            {mode === 'simple' ? (
              <>
                <Zap className="w-3 h-3" />
                Simple
              </>
            ) : (
              <>
                <Settings2 className="w-3 h-3" />
                Advanced
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs">
            {mode === 'simple'
              ? 'Simple mode: Curated options, smart defaults. Switch to Advanced for full control.'
              : 'Advanced mode: Full library, all filters, matrix view. Switch to Simple for quick workflow.'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
