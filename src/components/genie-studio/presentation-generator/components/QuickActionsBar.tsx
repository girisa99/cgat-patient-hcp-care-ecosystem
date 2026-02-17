/**
 * QUICK ACTIONS BAR
 * 
 * Presentation-wide quick actions for Accept All, Skip Remaining, Enhance All, etc.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCheck,
  FastForward,
  Wand2,
  Wrench,
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PresentationReviewState, QuickActionKey } from '../types/reviewActions';
import { SlideEnhancementType } from '../types';

interface QuickActionsBarProps {
  reviewState: PresentationReviewState | null;
  isProcessing: boolean;
  currentAction: string | null;
  onAcceptAll: () => Promise<void>;
  onSkipRemaining: () => Promise<void>;
  onEnhanceAll: (type?: SlideEnhancementType) => Promise<void>;
  onFixAllIssues: () => Promise<void>;
  onAnalyzeQuality: () => Promise<void>;
  onRefreshSuggestions: () => Promise<void>;
  className?: string;
}

const ENHANCEMENT_TYPES: { type: SlideEnhancementType; label: string; icon: React.ReactNode }[] = [
  { type: 'polish', label: 'Polish & Refine', icon: <Sparkles className="h-4 w-4" /> },
  { type: 'expand', label: 'Expand Content', icon: <Wand2 className="h-4 w-4" /> },
  { type: 'simplify', label: 'Simplify', icon: <RefreshCw className="h-4 w-4" /> },
  { type: 'rewrite', label: 'Rewrite', icon: <CheckCheck className="h-4 w-4" /> },
];

export function QuickActionsBar({
  reviewState,
  isProcessing,
  currentAction,
  onAcceptAll,
  onSkipRemaining,
  onEnhanceAll,
  onFixAllIssues,
  onAnalyzeQuality,
  onRefreshSuggestions,
  className,
}: QuickActionsBarProps) {
  const pendingCount = reviewState?.pendingSlides || 0;
  const acceptedCount = reviewState?.acceptedSlides || 0;
  const totalCount = reviewState?.totalSlides || 0;
  const issueCount = reviewState?.totalIssues || 0;
  const autoFixableCount = reviewState?.autoFixableIssues || 0;
  const progress = reviewState?.reviewProgress || 0;
  
  return (
    <div className={cn(
      "flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border",
      className
    )}>
      {/* Progress Overview */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Review Progress</span>
          <Badge variant="secondary" className="text-xs">
            {acceptedCount} / {totalCount} slides
          </Badge>
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        
        {issueCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">
              {issueCount} issues ({autoFixableCount} auto-fixable)
            </span>
          </div>
        )}
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          {/* Accept All */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcceptAll()}
                disabled={isProcessing || pendingCount === 0}
                className="gap-2"
              >
                {isProcessing && currentAction === 'accept' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 text-primary" />
                )}
                Accept All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Accept all {pendingCount} pending slides</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Skip Remaining */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSkipRemaining()}
                disabled={isProcessing || pendingCount === 0}
                className="gap-2"
              >
                {isProcessing && currentAction === 'skip' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FastForward className="h-4 w-4" />
                )}
                Skip Remaining
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Skip all remaining pending slides</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Enhance All Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing || pendingCount === 0}
                className="gap-2"
              >
                {isProcessing && currentAction === 'enhance' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 text-accent-foreground" />
                )}
                Enhance All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Enhancement Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ENHANCEMENT_TYPES.map(({ type, label, icon }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onEnhanceAll(type)}
                  className="gap-2"
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Fix All Issues */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFixAllIssues()}
                disabled={isProcessing || autoFixableCount === 0}
                className="gap-2"
              >
                {isProcessing && currentAction === 'fix' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4 text-secondary-foreground" />
                )}
                Auto-Fix ({autoFixableCount})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Automatically fix {autoFixableCount} issues</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Analyze Quality */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnalyzeQuality()}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing && currentAction === 'analyze' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Analyze
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Analyze quality across all slides</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Refresh Suggestions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefreshSuggestions()}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing && currentAction === 'refresh' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get fresh AI suggestions for all slides</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default QuickActionsBar;
