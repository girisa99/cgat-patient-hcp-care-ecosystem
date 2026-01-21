/**
 * Output Compatibility Warning Component
 * Shows warnings when visual features are incompatible with selected output types
 * Example: Data tables excluded from video-full, 3D mesh only for Premium tier
 */

import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Info, X, CheckCircle2, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GlobalTier } from './GlobalTierFilter';

export interface VisualFeatureSelection {
  id: string;
  label: string;
  subOptions?: string[];
}

export interface CompatibilityIssue {
  featureId: string;
  featureLabel: string;
  reason: string;
  severity: 'warning' | 'error' | 'info';
  suggestion?: string;
}

interface OutputCompatibilityConfig {
  id: string;
  category: 'doc' | 'static' | 'video' | '3d' | 'immersive';
  supportedVisualTypes: string[];
  excludedVisualTypes: string[];
  audioRequired?: boolean;
  minTier?: GlobalTier;
}

// Output type configurations with compatibility rules
const OUTPUT_COMPATIBILITY_CONFIGS: OutputCompatibilityConfig[] = [
  // Document formats - support all visuals
  {
    id: 'pptx',
    category: 'doc',
    supportedVisualTypes: ['all'],
    excludedVisualTypes: [],
  },
  {
    id: 'pdf',
    category: 'doc',
    supportedVisualTypes: ['all'],
    excludedVisualTypes: ['animation-3d', 'video-clip', 'interactive'],
  },
  // Static formats
  {
    id: 'image-png',
    category: 'static',
    supportedVisualTypes: ['chart', 'infographic', 'diagram', 'table', 'matrix'],
    excludedVisualTypes: ['animation-3d', 'video-clip', 'interactive', 'mesh-3d'],
  },
  // Video formats - exclude static-heavy elements
  {
    id: 'video-full',
    category: 'video',
    supportedVisualTypes: ['chart', 'animation-3d', 'video-clip', 'infographic', 'motion-graphic'],
    excludedVisualTypes: ['data-table', 'matrix', 'hierarchy', 'complex-table', 'spreadsheet'],
    audioRequired: true,
  },
  {
    id: 'video-short',
    category: 'video',
    supportedVisualTypes: ['chart', 'animation-3d', 'video-clip', 'motion-graphic'],
    excludedVisualTypes: ['data-table', 'matrix', 'hierarchy', 'complex-table'],
    audioRequired: true,
  },
  // 3D formats - require premium tier
  {
    id: '3d-animated',
    category: '3d',
    supportedVisualTypes: ['mesh-3d', 'animation-3d', 'video-clip', 'motion-graphic'],
    excludedVisualTypes: ['data-table', 'matrix', 'spreadsheet', 'static-diagram'],
    audioRequired: true,
    minTier: 2,
  },
  {
    id: '3d-interactive',
    category: '3d',
    supportedVisualTypes: ['mesh-3d', 'animation-3d', 'interactive', 'motion-graphic'],
    excludedVisualTypes: ['data-table', 'matrix', 'spreadsheet'],
    minTier: 3,
  },
  // Immersive formats
  {
    id: 'vr-experience',
    category: 'immersive',
    supportedVisualTypes: ['mesh-3d', 'animation-3d', 'interactive', 'spatial'],
    excludedVisualTypes: ['data-table', 'matrix', 'flat-chart', 'static-diagram'],
    minTier: 3,
  },
];

// Visual feature to category mapping
const VISUAL_FEATURE_CATEGORIES: Record<string, string[]> = {
  'data-visualization': ['chart', 'graph', 'infographic'],
  'tables-matrices': ['data-table', 'matrix', 'comparison-table', 'spreadsheet'],
  'diagrams': ['flowchart', 'hierarchy', 'process', 'static-diagram'],
  '3d-elements': ['mesh-3d', 'animation-3d', 'spatial'],
  'interactive': ['interactive', 'clickable', 'hover-effect'],
  'motion': ['video-clip', 'motion-graphic', 'animated-transition'],
};

interface OutputCompatibilityWarningProps {
  selectedOutputType: string;
  selectedVisualFeatures: VisualFeatureSelection[];
  globalTier: GlobalTier;
  onRemoveFeature?: (featureId: string) => void;
  onDismissWarning?: (issueId: string) => void;
  className?: string;
  compact?: boolean;
}

export function OutputCompatibilityWarning({
  selectedOutputType,
  selectedVisualFeatures,
  globalTier,
  onRemoveFeature,
  onDismissWarning,
  className,
  compact = false,
}: OutputCompatibilityWarningProps) {
  const issues = useMemo(() => {
    const outputConfig = OUTPUT_COMPATIBILITY_CONFIGS.find(c => c.id === selectedOutputType);
    if (!outputConfig) return [];

    const detectedIssues: CompatibilityIssue[] = [];

    // Check tier requirements
    if (outputConfig.minTier && globalTier < outputConfig.minTier) {
      detectedIssues.push({
        featureId: 'tier-requirement',
        featureLabel: selectedOutputType,
        reason: `Requires Tier ${outputConfig.minTier} or higher (current: Tier ${globalTier})`,
        severity: 'error',
        suggestion: `Upgrade to ${outputConfig.minTier === 2 ? 'Advanced' : 'Premium'} tier`,
      });
    }

    // Check each selected visual feature
    selectedVisualFeatures.forEach(feature => {
      const featureCategory = Object.entries(VISUAL_FEATURE_CATEGORIES).find(
        ([_, types]) => types.some(t => feature.id.toLowerCase().includes(t.toLowerCase()))
      );

      // Check if feature is explicitly excluded
      const isExcluded = outputConfig.excludedVisualTypes.some(excluded =>
        feature.id.toLowerCase().includes(excluded.toLowerCase()) ||
        feature.label.toLowerCase().includes(excluded.toLowerCase())
      );

      if (isExcluded) {
        detectedIssues.push({
          featureId: feature.id,
          featureLabel: feature.label,
          reason: `Not compatible with ${selectedOutputType} format`,
          severity: 'warning',
          suggestion: `Consider removing or using a different output format`,
        });
      }

      // Check for 3D elements in non-3D outputs
      if (
        feature.id.includes('3d') &&
        !['3d', 'immersive'].includes(outputConfig.category)
      ) {
        detectedIssues.push({
          featureId: feature.id,
          featureLabel: feature.label,
          reason: `3D elements require 3D/Immersive output format`,
          severity: 'warning',
          suggestion: `Switch to 3D-animated or VR Experience format`,
        });
      }

      // Check tier restrictions for premium features
      if (feature.id.includes('mesh-3d') && globalTier < 2) {
        detectedIssues.push({
          featureId: feature.id,
          featureLabel: feature.label,
          reason: `3D Mesh requires Advanced tier or higher`,
          severity: 'error',
          suggestion: `Upgrade to Advanced or Premium tier`,
        });
      }
    });

    // Check audio requirement
    if (outputConfig.audioRequired) {
      detectedIssues.push({
        featureId: 'audio-required',
        featureLabel: 'Audio Required',
        reason: `${selectedOutputType} requires voiceover - ensure voice is enabled`,
        severity: 'info',
      });
    }

    return detectedIssues;
  }, [selectedOutputType, selectedVisualFeatures, globalTier]);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  if (issues.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {errors.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="gap-1 text-[10px]">
                  <Ban className="h-3 w-3" />
                  {errors.length} Blocking
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <ul className="text-xs space-y-1">
                  {errors.map(e => (
                    <li key={e.featureId}>{e.featureLabel}: {e.reason}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {warnings.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-[10px] border-amber-500 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {warnings.length} Warnings
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <ul className="text-xs space-y-1">
                  {warnings.map(w => (
                    <li key={w.featureId}>{w.featureLabel}: {w.reason}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {infos.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-[10px] border-blue-500 text-blue-600">
                  <Info className="h-3 w-3" />
                  {infos.length} Notes
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <ul className="text-xs space-y-1">
                  {infos.map(i => (
                    <li key={i.featureId}>{i.reason}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Errors - Blocking issues */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <Ban className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">
            {errors.length} Blocking Issue{errors.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {errors.map(issue => (
              <div key={issue.featureId} className="flex items-start justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium">{issue.featureLabel}:</span>{' '}
                  <span className="text-muted-foreground">{issue.reason}</span>
                  {issue.suggestion && (
                    <span className="block text-red-600 dark:text-red-400 mt-0.5">
                      → {issue.suggestion}
                    </span>
                  )}
                </div>
                {onRemoveFeature && issue.featureId !== 'tier-requirement' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => onRemoveFeature(issue.featureId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {warnings.length} Compatibility Warning{warnings.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {warnings.map(issue => (
              <div key={issue.featureId} className="flex items-start justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium">{issue.featureLabel}:</span>{' '}
                  <span className="text-muted-foreground">{issue.reason}</span>
                  {issue.suggestion && (
                    <span className="block text-amber-600 dark:text-amber-400 mt-0.5">
                      → {issue.suggestion}
                    </span>
                  )}
                </div>
                {onRemoveFeature && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => onRemoveFeature(issue.featureId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Info notes */}
      {infos.length > 0 && (
        <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Requirements
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-1">
            {infos.map(issue => (
              <div key={issue.featureId} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">{issue.reason}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Hook to check output compatibility
 */
export function useOutputCompatibility(
  outputType: string,
  visualFeatures: VisualFeatureSelection[],
  globalTier: GlobalTier
) {
  return useMemo(() => {
    const outputConfig = OUTPUT_COMPATIBILITY_CONFIGS.find(c => c.id === outputType);
    if (!outputConfig) {
      return { isCompatible: true, issues: [], hasErrors: false, hasWarnings: false };
    }

    const issues: CompatibilityIssue[] = [];
    
    // Check tier
    if (outputConfig.minTier && globalTier < outputConfig.minTier) {
      issues.push({
        featureId: 'tier',
        featureLabel: 'Tier Requirement',
        reason: `Requires Tier ${outputConfig.minTier}+`,
        severity: 'error',
      });
    }

    // Check features
    visualFeatures.forEach(feature => {
      const isExcluded = outputConfig.excludedVisualTypes.some(excluded =>
        feature.id.toLowerCase().includes(excluded.toLowerCase())
      );
      if (isExcluded) {
        issues.push({
          featureId: feature.id,
          featureLabel: feature.label,
          reason: `Incompatible with ${outputType}`,
          severity: 'warning',
        });
      }
    });

    return {
      isCompatible: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      hasErrors: issues.some(i => i.severity === 'error'),
      hasWarnings: issues.some(i => i.severity === 'warning'),
      requiresAudio: outputConfig.audioRequired,
    };
  }, [outputType, visualFeatures, globalTier]);
}

export { OUTPUT_COMPATIBILITY_CONFIGS };
