/**
 * Recording Quality Settings Component
 * Allows users to select video quality/bitrate
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings2 } from 'lucide-react';

export type RecordingQuality = 'low' | 'medium' | 'high' | 'ultra';

interface QualityOption {
  value: RecordingQuality;
  label: string;
  resolution: string;
  bitrate: string;
  description: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    value: 'low',
    label: 'Low',
    resolution: '480p',
    bitrate: '1 Mbps',
    description: 'Smaller file size, faster upload',
  },
  {
    value: 'medium',
    label: 'Medium',
    resolution: '720p',
    bitrate: '2.5 Mbps',
    description: 'Balanced quality and size',
  },
  {
    value: 'high',
    label: 'High',
    resolution: '1080p',
    bitrate: '5 Mbps',
    description: 'HD quality, recommended',
  },
  {
    value: 'ultra',
    label: 'Ultra',
    resolution: '1080p+',
    bitrate: '8 Mbps',
    description: 'Maximum quality, large files',
  },
];

export const QUALITY_SETTINGS: Record<RecordingQuality, { 
  videoBitsPerSecond: number;
  width: number;
  height: number;
}> = {
  low: { videoBitsPerSecond: 1000000, width: 854, height: 480 },
  medium: { videoBitsPerSecond: 2500000, width: 1280, height: 720 },
  high: { videoBitsPerSecond: 5000000, width: 1920, height: 1080 },
  ultra: { videoBitsPerSecond: 8000000, width: 1920, height: 1080 },
};

interface RecordingQualitySettingsProps {
  quality: RecordingQuality;
  onQualityChange: (quality: RecordingQuality) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function RecordingQualitySettings({
  quality,
  onQualityChange,
  disabled = false,
  compact = false,
}: RecordingQualitySettingsProps) {
  const selectedOption = QUALITY_OPTIONS.find(o => o.value === quality);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
        <Select value={quality} onValueChange={(v) => onQualityChange(v as RecordingQuality)} disabled={disabled}>
          <SelectTrigger className="h-7 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUALITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                  <span className="text-muted-foreground text-[10px]">{option.resolution}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          Recording Quality
        </Label>
        {selectedOption && (
          <Badge variant="outline" className="text-[10px]">
            {selectedOption.resolution} • {selectedOption.bitrate}
          </Badge>
        )}
      </div>
      
      <Select value={quality} onValueChange={(v) => onQualityChange(v as RecordingQuality)} disabled={disabled}>
        <SelectTrigger className="h-9">
          <SelectValue>
            {selectedOption ? `${selectedOption.label} (${selectedOption.resolution})` : 'Select quality'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {QUALITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground text-xs">{option.resolution}</span>
                </div>
                <span className="text-muted-foreground text-[10px]">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
