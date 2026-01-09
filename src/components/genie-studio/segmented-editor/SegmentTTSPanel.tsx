/**
 * Segment TTS Panel - TTS options for per-segment and batch generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Volume2, 
  Play,
  Pause,
  Download,
  Loader2,
  Settings2,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TTSOptions, BatchTTSProgress, ScriptSegment } from './types';

// Voice options - matching existing implementation
const TTS_PROVIDERS = [
  { value: 'elevenlabs', label: 'ElevenLabs', description: 'Premium quality' },
  { value: 'openai', label: 'OpenAI', description: 'Fast & reliable' },
  { value: 'google', label: 'Google', description: 'Many languages' },
];

const ELEVENLABS_VOICES = [
  { value: 'rachel', label: 'Rachel', description: 'Warm, professional' },
  { value: 'drew', label: 'Drew', description: 'Deep, authoritative' },
  { value: 'clyde', label: 'Clyde', description: 'Friendly, conversational' },
  { value: 'paul', label: 'Paul', description: 'Clear, narrator' },
  { value: 'domi', label: 'Domi', description: 'Energetic, youthful' },
  { value: 'dave', label: 'Dave', description: 'British, refined' },
  { value: 'fin', label: 'Fin', description: 'Irish, storyteller' },
  { value: 'sarah', label: 'Sarah', description: 'Soft, soothing' },
];

const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral' },
  { value: 'echo', label: 'Echo', description: 'Warm' },
  { value: 'fable', label: 'Fable', description: 'British' },
  { value: 'onyx', label: 'Onyx', description: 'Deep' },
  { value: 'nova', label: 'Nova', description: 'Energetic' },
  { value: 'shimmer', label: 'Shimmer', description: 'Calm' },
];

interface SegmentTTSPanelProps {
  segments: ScriptSegment[];
  ttsOptions: TTSOptions;
  onTTSOptionsChange: (options: TTSOptions) => void;
  onGenerateSegment: (segmentId: string) => Promise<void>;
  onGenerateBatch: () => Promise<void>;
  onPreviewAll: () => void;
  onDownloadAll: () => void;
  batchProgress?: BatchTTSProgress;
  isGeneratingBatch?: boolean;
  className?: string;
}

export function SegmentTTSPanel({
  segments,
  ttsOptions,
  onTTSOptionsChange,
  onGenerateSegment,
  onGenerateBatch,
  onPreviewAll,
  onDownloadAll,
  batchProgress,
  isGeneratingBatch = false,
  className,
}: SegmentTTSPanelProps) {
  const [showSettings, setShowSettings] = useState(false);

  const completedCount = segments.filter(s => s.audioUrl).length;
  const totalCount = segments.length;
  const allComplete = completedCount === totalCount;

  const getVoiceOptions = () => {
    if (ttsOptions.provider === 'elevenlabs') return ELEVENLABS_VOICES;
    if (ttsOptions.provider === 'openai') return OPENAI_VOICES;
    return OPENAI_VOICES; // fallback
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Text-to-Speech</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalCount} generated
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Settings */}
        {showSettings && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
            {/* Provider */}
            <div className="space-y-1.5">
              <Label className="text-xs">Provider</Label>
              <Select
                value={ttsOptions.provider}
                onValueChange={(value) => 
                  onTTSOptionsChange({ 
                    ...ttsOptions, 
                    provider: value as TTSOptions['provider'],
                    voice: value === 'elevenlabs' ? 'rachel' : 'alloy'
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTS_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <span>{p.label}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {p.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice */}
            <div className="space-y-1.5">
              <Label className="text-xs">Voice</Label>
              <Select
                value={ttsOptions.voice}
                onValueChange={(value) => 
                  onTTSOptionsChange({ ...ttsOptions, voice: value })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getVoiceOptions().map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex items-center gap-2">
                        <span>{v.label}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {v.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Speed</Label>
                <span className="text-xs text-muted-foreground">
                  {ttsOptions.speed?.toFixed(1) || '1.0'}x
                </span>
              </div>
              <Slider
                value={[ttsOptions.speed || 1.0]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={([value]) => 
                  onTTSOptionsChange({ ...ttsOptions, speed: value })
                }
              />
            </div>

            {/* ElevenLabs specific settings */}
            {ttsOptions.provider === 'elevenlabs' && (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Stability</Label>
                    <span className="text-xs text-muted-foreground">
                      {((ttsOptions.stability || 0.5) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[ttsOptions.stability || 0.5]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) => 
                      onTTSOptionsChange({ ...ttsOptions, stability: value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Similarity</Label>
                    <span className="text-xs text-muted-foreground">
                      {((ttsOptions.similarityBoost || 0.75) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[ttsOptions.similarityBoost || 0.75]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) => 
                      onTTSOptionsChange({ ...ttsOptions, similarityBoost: value })
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Batch Progress */}
        {batchProgress && isGeneratingBatch && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Generating audio for all segments...
              </span>
              <span>
                {batchProgress.completed}/{batchProgress.total}
              </span>
            </div>
            <Progress 
              value={(batchProgress.completed / batchProgress.total) * 100} 
              className="h-2"
            />
            {batchProgress.failed > 0 && (
              <p className="text-xs text-destructive">
                {batchProgress.failed} failed
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Generate All */}
          <Button
            onClick={onGenerateBatch}
            disabled={isGeneratingBatch || allComplete}
            size="sm"
            className="text-xs"
          >
            {isGeneratingBatch ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : allComplete ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                All Generated
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Generate All ({totalCount - completedCount})
              </>
            )}
          </Button>

          {/* Preview All */}
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviewAll}
              disabled={isGeneratingBatch}
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Preview All
            </Button>
          )}

          {/* Download All */}
          {allComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadAll}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Download All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
