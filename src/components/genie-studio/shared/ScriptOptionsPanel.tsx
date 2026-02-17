/**
 * Script Options Panel
 * Standardized options for script generation (format, tone, duration, audience)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OutputFormatOption, ToneOption, DurationOption } from './types';

interface ScriptOptionsPanelProps {
  // Format options
  outputFormats: OutputFormatOption[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  
  // Tone options
  toneOptions: ToneOption[];
  selectedTone: string;
  onToneChange: (tone: string) => void;
  
  // Duration options
  durationOptions: DurationOption[];
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  
  // Audience
  targetAudience: string;
  onAudienceChange: (audience: string) => void;
  
  // Knowledge search toggle
  enableKnowledgeSearch?: boolean;
  onKnowledgeSearchChange?: (enabled: boolean) => void;
  showKnowledgeSearch?: boolean;
  
  className?: string;
  compact?: boolean;
}

export function ScriptOptionsPanel({
  outputFormats,
  selectedFormat,
  onFormatChange,
  toneOptions,
  selectedTone,
  onToneChange,
  durationOptions,
  selectedDuration,
  onDurationChange,
  targetAudience,
  onAudienceChange,
  enableKnowledgeSearch,
  onKnowledgeSearchChange,
  showKnowledgeSearch = true,
  className,
  compact = false,
}: ScriptOptionsPanelProps) {
  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="grid grid-cols-2 gap-3">
          {/* Format */}
          <div className="space-y-1.5">
            <Label className="text-xs">Output Format</Label>
            <Select value={selectedFormat} onValueChange={onFormatChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      {format.icon}
                      <span>{format.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tone</Label>
            <Select value={selectedTone} onValueChange={onToneChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs">Duration</Label>
            <Select 
              value={selectedDuration.toString()} 
              onValueChange={(v) => onDurationChange(parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <Label className="text-xs">Target Audience</Label>
            <Input
              placeholder="e.g., Healthcare professionals"
              value={targetAudience}
              onChange={(e) => onAudienceChange(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Knowledge Search Toggle */}
        {showKnowledgeSearch && onKnowledgeSearchChange && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Knowledge Base Enhancement</span>
            </div>
            <Switch
              checked={enableKnowledgeSearch}
              onCheckedChange={onKnowledgeSearchChange}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Script Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select value={selectedFormat} onValueChange={onFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      {format.icon}
                      <span>{format.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={selectedTone} onValueChange={onToneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select 
              value={selectedDuration.toString()} 
              onValueChange={(v) => onDurationChange(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input
              placeholder="e.g., Healthcare professionals"
              value={targetAudience}
              onChange={(e) => onAudienceChange(e.target.value)}
            />
          </div>
        </div>

        {/* Knowledge Search Toggle */}
        {showKnowledgeSearch && onKnowledgeSearchChange && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <span className="text-sm font-medium">Knowledge Base Enhancement</span>
                <p className="text-xs text-muted-foreground">
                  Enhance with relevant knowledge
                </p>
              </div>
            </div>
            <Switch
              checked={enableKnowledgeSearch}
              onCheckedChange={onKnowledgeSearchChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
