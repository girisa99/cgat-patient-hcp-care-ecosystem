/**
 * Content Fit Indicator Component
 * Visual feedback for content overflow and fitting issues
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Wand2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentFitResult, 
  ContentIssue, 
  ContentSuggestion 
} from '../utils/contentFitting';

interface ContentFitIndicatorProps {
  result: ContentFitResult;
  onAutoFix?: () => void;
  onAIEnhance?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function ContentFitIndicator({
  result,
  onAutoFix,
  onAIEnhance,
  showDetails = true,
  compact = false,
  className
}: ContentFitIndicatorProps) {
  const { isValid, issues, suggestions } = result;
  
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;
  
  const hasAutoFixable = suggestions.some(s => s.autoFixable);
  
  if (issues.length === 0) {
    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn("gap-1 text-green-600 border-green-200 bg-green-50", className)}>
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Content fits perfectly</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <Badge variant="outline" className={cn("gap-1 text-green-600 border-green-200 bg-green-50", className)}>
        <CheckCircle2 className="h-3 w-3" />
        Content fits
      </Badge>
    );
  }
  
  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error': return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'info': return <Info className="h-3 w-3 text-blue-500" />;
    }
  };
  
  const getBadgeVariant = () => {
    if (errorCount > 0) return "destructive";
    if (warningCount > 0) return "outline";
    return "secondary";
  };
  
  const getBadgeClasses = () => {
    if (errorCount > 0) return "";
    if (warningCount > 0) return "text-yellow-700 border-yellow-300 bg-yellow-50";
    return "text-blue-600 border-blue-200 bg-blue-50";
  };
  
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge 
            variant={getBadgeVariant() as any}
            className={cn("gap-1 cursor-pointer", getBadgeClasses(), className)}
          >
            {errorCount > 0 && <AlertCircle className="h-3 w-3" />}
            {errorCount === 0 && warningCount > 0 && <AlertTriangle className="h-3 w-3" />}
            {errorCount === 0 && warningCount === 0 && <Info className="h-3 w-3" />}
            {issues.length}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <ContentFitDetails 
            issues={issues}
            suggestions={suggestions}
            onAutoFix={onAutoFix}
            onAIEnhance={onAIEnhance}
            hasAutoFixable={hasAutoFixable}
          />
        </PopoverContent>
      </Popover>
    );
  }
  
  if (!showDetails) {
    return (
      <Badge 
        variant={getBadgeVariant() as any}
        className={cn("gap-1", getBadgeClasses(), className)}
      >
        {errorCount > 0 && <AlertCircle className="h-3 w-3" />}
        {errorCount === 0 && warningCount > 0 && <AlertTriangle className="h-3 w-3" />}
        {issues.length} issue{issues.length > 1 ? 's' : ''}
      </Badge>
    );
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Badge 
          variant={getBadgeVariant() as any}
          className={cn("gap-1", getBadgeClasses())}
        >
          {errorCount > 0 && <AlertCircle className="h-3 w-3" />}
          {errorCount === 0 && warningCount > 0 && <AlertTriangle className="h-3 w-3" />}
          {issues.length} issue{issues.length > 1 ? 's' : ''} found
        </Badge>
        
        {hasAutoFixable && onAutoFix && (
          <Button size="sm" variant="outline" onClick={onAutoFix} className="h-6 text-xs gap-1">
            <Minimize2 className="h-3 w-3" />
            Auto-fit
          </Button>
        )}
        
        {onAIEnhance && (
          <Button size="sm" variant="outline" onClick={onAIEnhance} className="h-6 text-xs gap-1">
            <Wand2 className="h-3 w-3" />
            AI Fix
          </Button>
        )}
      </div>
      
      <ContentFitDetails 
        issues={issues}
        suggestions={suggestions}
        onAutoFix={onAutoFix}
        onAIEnhance={onAIEnhance}
        hasAutoFixable={hasAutoFixable}
        inline
      />
    </div>
  );
}

interface ContentFitDetailsProps {
  issues: ContentIssue[];
  suggestions: ContentSuggestion[];
  onAutoFix?: () => void;
  onAIEnhance?: () => void;
  hasAutoFixable: boolean;
  inline?: boolean;
}

function ContentFitDetails({
  issues,
  suggestions,
  onAutoFix,
  onAIEnhance,
  hasAutoFixable,
  inline = false
}: ContentFitDetailsProps) {
  return (
    <div className={cn(inline ? "" : "p-3 space-y-3")}>
      {!inline && (
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium">Content Fit Issues</span>
          <div className="flex gap-1">
            {hasAutoFixable && onAutoFix && (
              <Button size="sm" variant="ghost" onClick={onAutoFix} className="h-6 text-xs gap-1">
                <Minimize2 className="h-3 w-3" />
                Auto-fit
              </Button>
            )}
            {onAIEnhance && (
              <Button size="sm" variant="ghost" onClick={onAIEnhance} className="h-6 text-xs gap-1">
                <Wand2 className="h-3 w-3" />
                AI Fix
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-1.5">
        {issues.map((issue, idx) => (
          <div 
            key={idx}
            className={cn(
              "flex items-start gap-2 text-xs p-1.5 rounded",
              issue.severity === 'error' && "bg-destructive/10",
              issue.severity === 'warning' && "bg-yellow-50",
              issue.severity === 'info' && "bg-blue-50"
            )}
          >
            {issue.severity === 'error' && <AlertCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />}
            {issue.severity === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-600 shrink-0 mt-0.5" />}
            {issue.severity === 'info' && <Info className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <span className={cn(
                issue.severity === 'error' && "text-destructive",
                issue.severity === 'warning' && "text-yellow-700",
                issue.severity === 'info' && "text-blue-600"
              )}>
                {issue.message}
              </span>
              {issue.originalLength && issue.maxLength && (
                <span className="text-muted-foreground ml-1">
                  ({issue.originalLength}/{issue.maxLength})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length > 0 && (
        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          <ul className="mt-1 space-y-1">
            {suggestions.slice(0, 3).map((suggestion, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                {suggestion.description}
                {suggestion.autoFixable && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    auto
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ContentFitIndicator;
