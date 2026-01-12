/**
 * Auto-Editor Agent Panel
 * UI for AI-powered automatic video editing using client-side FFmpeg
 * Integrates with Phase 4: Edit in Guided Experience
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wand2, 
  Scissors, 
  Music2, 
  Video, 
  Palette, 
  Zap,
  RefreshCw,
  CheckCircle2,
  X,
  Play,
  Eye,
  Clock,
  Gauge,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutoEditorAgent, EditOperation, EditRequest, EditResult, EditStyle, VideoClip } from '@/hooks/useAutoEditorAgent';

interface AutoEditorPanelProps {
  videoFile?: File;
  videoUrl?: string;
  videoDuration?: number;
  onEditComplete?: (result: EditResult) => void;
  onApplyEdit?: (editedVideoUrl: string) => void;
  onClose?: () => void;
  className?: string;
}

export const AutoEditorPanel: React.FC<AutoEditorPanelProps> = ({
  videoFile,
  videoUrl,
  videoDuration = 30,
  onEditComplete,
  onApplyEdit,
  onClose,
  className,
}) => {
  const [selectedOperations, setSelectedOperations] = useState<EditOperation[]>([]);
  const [silenceThreshold, setSilenceThreshold] = useState(-30);
  const [enablePreview, setEnablePreview] = useState(true);
  const [editResult, setEditResult] = useState<EditResult | null>(null);
  const [editStyle, setEditStyle] = useState<EditStyle>('dynamic');

  const { autoEdit, isProcessing, progress, currentOperation, error } = useAutoEditorAgent();

  const operations: { 
    id: EditOperation; 
    label: string; 
    icon: React.ReactNode; 
    description: string;
    category: 'trim' | 'enhance' | 'creative';
  }[] = [
    { 
      id: 'auto_trim', 
      label: 'Auto Trim', 
      icon: <Scissors className="h-4 w-4" />, 
      description: 'Remove dead space & pauses',
      category: 'trim'
    },
    { 
      id: 'remove_silence', 
      label: 'Remove Silence', 
      icon: <Clock className="h-4 w-4" />, 
      description: 'Cut silent segments',
      category: 'trim'
    },
    { 
      id: 'smart_cuts', 
      label: 'Smart Cuts', 
      icon: <Zap className="h-4 w-4" />, 
      description: 'AI-detected scene cuts',
      category: 'trim'
    },
    { 
      id: 'beat_sync', 
      label: 'Beat Sync', 
      icon: <Music2 className="h-4 w-4" />, 
      description: 'Sync cuts to music beats',
      category: 'creative'
    },
    { 
      id: 'scene_detection', 
      label: 'Scene Detection', 
      icon: <Video className="h-4 w-4" />, 
      description: 'Find scene boundaries',
      category: 'creative'
    },
    { 
      id: 'color_correction', 
      label: 'Color Correct', 
      icon: <Palette className="h-4 w-4" />, 
      description: 'Auto color grading',
      category: 'enhance'
    },
    { 
      id: 'stabilize', 
      label: 'Stabilize', 
      icon: <Gauge className="h-4 w-4" />, 
      description: 'Reduce camera shake',
      category: 'enhance'
    },
    { 
      id: 'auto_crop', 
      label: 'Auto Crop', 
      icon: <Eye className="h-4 w-4" />, 
      description: 'Smart subject framing',
      category: 'enhance'
    },
    { 
      id: 'speed_ramp', 
      label: 'Speed Ramp', 
      icon: <RefreshCw className="h-4 w-4" />, 
      description: 'Dynamic speed changes',
      category: 'creative'
    },
  ];

  const toggleOperation = useCallback((op: EditOperation) => {
    setSelectedOperations(prev => 
      prev.includes(op) 
        ? prev.filter(o => o !== op)
        : [...prev, op]
    );
  }, []);

  const handleAutoEdit = useCallback(async () => {
    if (!videoFile && !videoUrl) return;
    if (selectedOperations.length === 0) return;

    // Create a VideoClip from the file
    const clip: VideoClip = {
      id: 'input-clip',
      blob: videoFile || new Blob(),
      url: videoUrl || '',
      duration: videoDuration,
    };

    const request: EditRequest = {
      clips: [clip],
      operations: selectedOperations,
      style: editStyle,
      preferences: {
        preserveAudio: true,
        maintainAspectRatio: true,
        outputFormat: 'mp4',
        outputQuality: 'high',
      },
    };

    const result = await autoEdit(request);
    if (result) {
      setEditResult(result);
      onEditComplete?.(result);
    }
  }, [videoFile, videoUrl, videoDuration, selectedOperations, editStyle, autoEdit, onEditComplete]);

  const handleApply = useCallback(() => {
    if (editResult?.outputUrl) {
      onApplyEdit?.(editResult.outputUrl);
      onClose?.();
    }
  }, [editResult, onApplyEdit, onClose]);

  const quickPresets = [
    { 
      name: 'Quick Clean', 
      operations: ['auto_trim', 'remove_silence'] as EditOperation[],
      description: 'Fast cleanup'
    },
    { 
      name: 'Social Ready', 
      operations: ['auto_trim', 'remove_silence', 'color_correction', 'auto_crop'] as EditOperation[],
      description: 'Perfect for social'
    },
    { 
      name: 'Music Video', 
      operations: ['beat_sync', 'scene_detection', 'speed_ramp', 'color_correction'] as EditOperation[],
      description: 'Synced to beat'
    },
    { 
      name: 'Full Polish', 
      operations: ['auto_trim', 'remove_silence', 'color_correction', 'stabilize', 'smart_cuts'] as EditOperation[],
      description: 'Complete enhance'
    },
  ];

  const groupedOperations = {
    trim: operations.filter(o => o.category === 'trim'),
    enhance: operations.filter(o => o.category === 'enhance'),
    creative: operations.filter(o => o.category === 'creative'),
  };

  return (
    <Card className={cn("w-full bg-card/95 backdrop-blur-sm shadow-xl border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-sm">Auto-Editor Agent</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered automatic editing</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Presets */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSelectedOperations(preset.operations)}
                className={cn(
                  "p-2 rounded-lg border text-left transition-all",
                  selectedOperations.length > 0 && 
                  preset.operations.every(op => selectedOperations.includes(op))
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                )}
              >
                <p className="text-xs font-medium">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Operations by Category */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-4 pr-2">
            {/* Trim Operations */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Scissors className="h-3 w-3" /> Trim & Cut
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {groupedOperations.trim.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => toggleOperation(op.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all",
                      selectedOperations.includes(op.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    {op.icon}
                    <span className="text-[10px] font-medium">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhance Operations */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" /> Enhance
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {groupedOperations.enhance.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => toggleOperation(op.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all",
                      selectedOperations.includes(op.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    {op.icon}
                    <span className="text-[10px] font-medium">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Creative Operations */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> Creative
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {groupedOperations.creative.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => toggleOperation(op.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all",
                      selectedOperations.includes(op.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    {op.icon}
                    <span className="text-[10px] font-medium">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Settings */}
        {selectedOperations.includes('remove_silence') && (
          <div className="space-y-2 p-3 rounded-lg border border-muted bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium flex items-center gap-1">
                <Settings2 className="h-3 w-3" /> Silence Threshold
              </p>
              <span className="text-xs text-muted-foreground">{silenceThreshold} dB</span>
            </div>
            <Slider
              value={[silenceThreshold]}
              onValueChange={([v]) => setSilenceThreshold(v)}
              min={-60}
              max={-10}
              step={5}
            />
          </div>
        )}

        {/* Preview Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-muted">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">Generate preview</span>
          </div>
          <Switch checked={enablePreview} onCheckedChange={setEnablePreview} />
        </div>

        {/* Selected Operations Summary */}
        {selectedOperations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedOperations.map((op) => (
              <Badge key={op} variant="secondary" className="text-[10px]">
                {operations.find(o => o.id === op)?.label}
                <button
                  onClick={() => toggleOperation(op)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {currentOperation || 'Processing...'}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {/* Process Button */}
        <Button
          className="w-full"
          onClick={handleAutoEdit}
          disabled={selectedOperations.length === 0 || isProcessing || (!videoFile && !videoUrl)}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Edit ({selectedOperations.length} operations)
            </>
          )}
        </Button>

        {/* Result */}
        {editResult && (
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium">Edit Complete</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {editResult.appliedOperations?.length} operations
              </Badge>
            </div>
            {editResult.metadata && (
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>Duration: {editResult.duration?.toFixed(1)}s</span>
                <span>Cuts: {editResult.metadata.cutsApplied}</span>
              </div>
            )}
            <Button className="w-full" size="sm" onClick={handleApply}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply Edits
            </Button>
          </div>
        )}

        {/* No Video Warning */}
        {!videoFile && !videoUrl && (
          <p className="text-xs text-center text-muted-foreground">
            Add a video to start auto-editing
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoEditorPanel;
