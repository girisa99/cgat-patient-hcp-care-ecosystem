/**
 * Mode Switcher Component
 * Enhanced UI for switching between Canvas, Timeline, and Document modes
 * with data preservation warnings and AI recommendations
 */

import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Layout, Film, FileText, Layers, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { transformMode, type TransformResult, type LossyConversion } from '../services/elementTransformService';
import type { EditorMode } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface ModeConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  bestFor: string[];
}

const MODE_CONFIG: Record<EditorMode, ModeConfig> = {
  canvas: {
    icon: <Layout className="h-4 w-4" />,
    label: 'Canvas',
    description: 'Free-form editing for presentations and graphics',
    bestFor: ['Presentations', 'Infographics', 'Social posts', 'Posters'],
  },
  timeline: {
    icon: <Film className="h-4 w-4" />,
    label: 'Timeline',
    description: 'Track-based editing for video and audio',
    bestFor: ['Videos', 'Podcasts', 'Animations', 'Music'],
  },
  document: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Document',
    description: 'Linear editing for documents and scripts',
    bestFor: ['Reports', 'Scripts', 'Articles', 'Manuals'],
  },
  hybrid: {
    icon: <Layers className="h-4 w-4" />,
    label: 'Hybrid',
    description: 'Combined view with split panels',
    bestFor: ['Video + Script', 'Presentation + Notes', 'Mixed content'],
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ModeSwitcher() {
  const { project, setMode, getRecommendedMode } = useEditor();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<EditorMode | null>(null);
  const [transformResult, setTransformResult] = useState<TransformResult | null>(null);

  const recommendedMode = getRecommendedMode();

  const handleModeChange = useCallback((newMode: EditorMode) => {
    if (newMode === project.mode) return;

    // Check if conversion will lose data
    const result = transformMode(
      project.mode,
      newMode,
      project.elements,
      project.slides,
      project.timeline
    );

    if (result.lossyConversions.length > 0 || result.warnings.some(w => w.severity === 'warning')) {
      setPendingMode(newMode);
      setTransformResult(result);
      setShowWarningDialog(true);
    } else {
      setMode(newMode);
    }
  }, [project.mode, project.elements, project.slides, project.timeline, setMode]);

  const confirmModeChange = useCallback(() => {
    if (pendingMode) {
      setMode(pendingMode);
    }
    setShowWarningDialog(false);
    setPendingMode(null);
    setTransformResult(null);
  }, [pendingMode, setMode]);

  const cancelModeChange = useCallback(() => {
    setShowWarningDialog(false);
    setPendingMode(null);
    setTransformResult(null);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tabs value={project.mode} onValueChange={(v) => handleModeChange(v as EditorMode)}>
          <TabsList className="h-9 bg-muted/50">
            {(Object.entries(MODE_CONFIG) as [EditorMode, ModeConfig][]).map(([mode, config]) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value={mode} 
                    className="h-8 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {config.icon}
                    <span className="hidden sm:inline text-xs font-medium">{config.label}</span>
                    {mode === recommendedMode && mode !== project.mode && (
                      <Badge 
                        variant="secondary" 
                        className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-0"
                      >
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                        AI
                      </Badge>
                    )}
                    {mode === project.mode && (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    )}
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {config.bestFor.map(item => (
                        <Badge key={item} variant="outline" className="text-[10px]">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </Tabs>

        {/* Warning Dialog */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Mode Conversion Warning
              </DialogTitle>
              <DialogDescription>
                Switching from <strong>{MODE_CONFIG[project.mode].label}</strong> to{' '}
                <strong>{pendingMode && MODE_CONFIG[pendingMode].label}</strong> may affect some elements.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Lossy Conversions */}
              {transformResult?.lossyConversions && transformResult.lossyConversions.length > 0 && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertDescription>
                    <p className="font-medium text-destructive mb-2">
                      Properties that will be modified:
                    </p>
                    <ul className="text-sm space-y-1">
                      {transformResult.lossyConversions.slice(0, 5).map((conv, i) => (
                        <LossyConversionItem key={i} conversion={conv} />
                      ))}
                      {transformResult.lossyConversions.length > 5 && (
                        <li className="text-muted-foreground">
                          +{transformResult.lossyConversions.length - 5} more elements affected
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {transformResult?.warnings && transformResult.warnings.length > 0 && (
                <div className="space-y-2">
                  {transformResult.warnings.slice(0, 3).map((warning, i) => (
                    <Alert 
                      key={i} 
                      variant={warning.severity === 'error' ? 'destructive' : 'default'}
                      className="py-2"
                    >
                      <AlertDescription className="text-xs">
                        {warning.message}
                        {warning.suggestion && (
                          <span className="block text-muted-foreground mt-0.5">
                            Tip: {warning.suggestion}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Recovery Note */}
              <Alert className="bg-muted/50 border-muted">
                <AlertDescription className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Original properties are preserved and can be recovered if you switch back.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={cancelModeChange}>
                Cancel
              </Button>
              <Button onClick={confirmModeChange}>
                Switch Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LossyConversionItem({ conversion }: { conversion: LossyConversion }) {
  return (
    <li className="flex items-start gap-1 text-destructive">
      <span className="font-mono text-[10px] bg-muted px-1 rounded">
        {conversion.originalType}
      </span>
      <span className="text-xs">
        loses: {conversion.lostProperties.slice(0, 3).join(', ')}
        {conversion.lostProperties.length > 3 && ` +${conversion.lostProperties.length - 3}`}
      </span>
    </li>
  );
}

export default ModeSwitcher;
