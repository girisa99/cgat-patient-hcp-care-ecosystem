/**
 * Studio Sound Panel - Controls for podcast-quality audio processing
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Radio, Mic2, ChevronDown, Volume2, Wand2, Monitor, Video } from 'lucide-react';
import type { StudioSoundSettings } from '../hooks/useStudioSound';

interface StudioSoundPanelProps {
  settings: StudioSoundSettings;
  activePreset: string;
  onPresetChange: (preset: string) => void;
  onSettingsChange: (settings: Partial<StudioSoundSettings>) => void;
}

export function StudioSoundPanel({
  settings,
  activePreset,
  onPresetChange,
  onSettingsChange,
}: StudioSoundPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  return (
    <div className="bg-card rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium">Studio Sound</Label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings.enabled ? 'default' : 'secondary'} className="text-[10px]">
            {settings.enabled ? 'ON' : 'OFF'}
          </Badge>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => onSettingsChange({ enabled })}
          />
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Preset Selector */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Audio Preset</Label>
            <Select value={activePreset} onValueChange={onPresetChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="podcast">
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-3 h-3" />
                    <div>
                      <div>Podcast</div>
                      <div className="text-[10px] text-muted-foreground">Warm, clear voice</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="broadcast">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3" />
                    <div>
                      <div>Broadcast</div>
                      <div className="text-[10px] text-muted-foreground">Radio-style processing</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="natural">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3 h-3" />
                    <div>
                      <div>Natural</div>
                      <div className="text-[10px] text-muted-foreground">Minimal processing</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="webcast">
                  <div className="flex items-center gap-2">
                    <Video className="w-3 h-3" />
                    <div>
                      <div>Webcast</div>
                      <div className="text-[10px] text-muted-foreground">Live streaming optimized</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="screen_demo">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3 h-3" />
                    <div>
                      <div>Screen Demo</div>
                      <div className="text-[10px] text-muted-foreground">Product demo narration</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-3 h-3" />
                    <div>
                      <div>Custom</div>
                      <div className="text-[10px] text-muted-foreground">Manual settings</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <Label className="text-xs">Compressor</Label>
              <Switch
                checked={settings.compressor.enabled}
                onCheckedChange={(enabled) => 
                  onSettingsChange({ 
                    compressor: { ...settings.compressor, enabled } 
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <Label className="text-xs">EQ</Label>
              <Switch
                checked={settings.eq.enabled}
                onCheckedChange={(enabled) => 
                  onSettingsChange({ 
                    eq: { ...settings.eq, enabled } 
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <Label className="text-xs">Noise Gate</Label>
              <Switch
                checked={settings.noiseGate.enabled}
                onCheckedChange={(enabled) => 
                  onSettingsChange({ 
                    noiseGate: { ...settings.noiseGate, enabled } 
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <Label className="text-xs">Limiter</Label>
              <Switch
                checked={settings.limiter.enabled}
                onCheckedChange={(enabled) => 
                  onSettingsChange({ 
                    limiter: { ...settings.limiter, enabled } 
                  })
                }
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1">
                Advanced Settings
                <ChevronDown className={`w-3 h-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              {/* Compressor Settings */}
              {settings.compressor.enabled && (
                <div className="space-y-2 p-2 bg-muted/30 rounded">
                  <Label className="text-xs font-medium">Compressor</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Threshold</span>
                      <span>{settings.compressor.threshold} dB</span>
                    </div>
                    <Slider
                      value={[settings.compressor.threshold]}
                      onValueChange={([threshold]) => 
                        onSettingsChange({ 
                          compressor: { ...settings.compressor, threshold } 
                        })
                      }
                      min={-60}
                      max={0}
                      step={1}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Ratio</span>
                      <span>{settings.compressor.ratio}:1</span>
                    </div>
                    <Slider
                      value={[settings.compressor.ratio]}
                      onValueChange={([ratio]) => 
                        onSettingsChange({ 
                          compressor: { ...settings.compressor, ratio } 
                        })
                      }
                      min={1}
                      max={20}
                      step={0.5}
                    />
                  </div>
                </div>
              )}

              {/* EQ Settings */}
              {settings.eq.enabled && (
                <div className="space-y-2 p-2 bg-muted/30 rounded">
                  <Label className="text-xs font-medium">EQ</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Low Cut</span>
                      <span>{settings.eq.lowCut} Hz</span>
                    </div>
                    <Slider
                      value={[settings.eq.lowCut]}
                      onValueChange={([lowCut]) => 
                        onSettingsChange({ 
                          eq: { ...settings.eq, lowCut } 
                        })
                      }
                      min={20}
                      max={200}
                      step={10}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Presence (3kHz)</span>
                      <span>{settings.eq.midPeak.gain > 0 ? '+' : ''}{settings.eq.midPeak.gain} dB</span>
                    </div>
                    <Slider
                      value={[settings.eq.midPeak.gain]}
                      onValueChange={([gain]) => 
                        onSettingsChange({ 
                          eq: { ...settings.eq, midPeak: { ...settings.eq.midPeak, gain } } 
                        })
                      }
                      min={-12}
                      max={12}
                      step={0.5}
                    />
                  </div>
                </div>
              )}

              {/* Noise Gate Settings */}
              {settings.noiseGate.enabled && (
                <div className="space-y-2 p-2 bg-muted/30 rounded">
                  <Label className="text-xs font-medium">Noise Gate</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Threshold</span>
                      <span>{settings.noiseGate.threshold} dB</span>
                    </div>
                    <Slider
                      value={[settings.noiseGate.threshold]}
                      onValueChange={([threshold]) => 
                        onSettingsChange({ 
                          noiseGate: { ...settings.noiseGate, threshold } 
                        })
                      }
                      min={-80}
                      max={-20}
                      step={1}
                    />
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
