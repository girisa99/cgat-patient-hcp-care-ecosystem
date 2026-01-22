/**
 * Layer 4: UNIFIED ACTIONS
 * Real-time Preview | Element Inspector | Credit Dashboard | One-Click Publish
 */

import React, { useState } from 'react';
import {
  Play, Pause, RotateCcw, Smartphone, Tablet, Monitor,
  Coins, TrendingUp, TrendingDown, Lightbulb, Sparkles,
  Upload, Calendar, Globe, Link2, Share2, Copy,
  ChevronDown, Check, ExternalLink, Settings, Eye,
  Twitter, Linkedin, Youtube, Instagram
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEditor } from '../context/EditorContext';
import type { PreviewConfig, PublishPlatform, CreditDashboard } from '../types';

// ============================================================================
// REAL-TIME PREVIEW PANEL
// ============================================================================

interface PreviewPanelProps {
  className?: string;
}

export function PreviewPanel({ className }: PreviewPanelProps) {
  const { project, setPreviewConfig } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const deviceFrames = [
    { id: 'none', label: 'None', icon: <Monitor className="h-4 w-4" /> },
    { id: 'desktop', label: 'Desktop', icon: <Monitor className="h-4 w-4" /> },
    { id: 'tablet', label: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="h-4 w-4" /> },
  ];

  const qualityOptions = [
    { value: 'draft', label: 'Draft', description: 'Fast preview' },
    { value: 'preview', label: 'Preview', description: 'Balanced' },
    { value: 'full', label: 'Full', description: 'High quality' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </CardTitle>
          <Select
            value={project.preview.quality}
            onValueChange={(v) => setPreviewConfig({ quality: v as any })}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Area */}
        <div className="aspect-video bg-black/90 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            <Play className="h-12 w-12" />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Progress value={currentTime} className="h-1" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">0:00 / 2:30</span>
        </div>

        {/* Device Frame */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Device Frame</span>
          <div className="flex gap-1">
            {deviceFrames.map((frame) => (
              <Button
                key={frame.id}
                variant={project.preview.deviceFrame === frame.id ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewConfig({ deviceFrame: frame.id as any })}
              >
                {frame.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh" className="text-xs">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={project.preview.autoRefresh}
              onCheckedChange={(checked) => setPreviewConfig({ autoRefresh: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="safe-zones" className="text-xs">Show Safe Zones</Label>
            <Switch
              id="safe-zones"
              checked={project.preview.showSafeZones}
              onCheckedChange={(checked) => setPreviewConfig({ showSafeZones: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ELEMENT INSPECTOR PANEL
// ============================================================================

interface ElementInspectorProps {
  className?: string;
}

export function ElementInspector({ className }: ElementInspectorProps) {
  const { project, updateInspector, getSelectedElements, updateElement } = useEditor();
  const selectedElements = getSelectedElements();
  const element = selectedElements[0];

  if (!element) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select an element to inspect</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Inspector
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] capitalize">
            {element.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={project.inspector.activeTab} onValueChange={(v) => updateInspector({ activeTab: v as any })}>
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="properties" className="text-xs">Props</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="animation" className="text-xs">Anim</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <Input
                  type="number"
                  value={element.position.x}
                  onChange={(e) => updateElement(element.id, { 
                    position: { ...element.position, x: Number(e.target.value) }
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  value={element.position.y}
                  onChange={(e) => updateElement(element.id, { 
                    position: { ...element.position, y: Number(e.target.value) }
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={element.position.width}
                  onChange={(e) => updateElement(element.id, { 
                    position: { ...element.position, width: Number(e.target.value) }
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={element.position.height}
                  onChange={(e) => updateElement(element.id, { 
                    position: { ...element.position, height: Number(e.target.value) }
                  })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground">Rotation</Label>
              <Input
                type="number"
                value={element.position.rotation || 0}
                onChange={(e) => updateElement(element.id, { 
                  position: { ...element.position, rotation: Number(e.target.value) }
                })}
                className="h-8 text-xs"
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="mt-4 space-y-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Opacity</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.style.opacity}
                  onChange={(e) => updateElement(element.id, {
                    style: { ...element.style, opacity: Number(e.target.value) }
                  })}
                  className="flex-1"
                />
                <span className="text-xs w-8">{Math.round(element.style.opacity * 100)}%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animation" className="mt-4">
            <p className="text-xs text-muted-foreground text-center py-4">
              Animation settings would go here
            </p>
          </TabsContent>

          <TabsContent value="ai" className="mt-4 space-y-3">
            <Button className="w-full gap-2" variant="outline" size="sm">
              <Sparkles className="h-4 w-4" />
              Enhance with AI
            </Button>
            <Button className="w-full gap-2" variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </Button>
            {element.metadata.generatedBy && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                <p className="font-medium">Generated by:</p>
                <p>{element.metadata.generatedBy.model}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CREDIT DASHBOARD
// ============================================================================

interface CreditDashboardPanelProps {
  className?: string;
}

export function CreditDashboardPanel({ className }: CreditDashboardPanelProps) {
  const { project } = useEditor();
  const { credits } = project;

  const usagePercent = ((credits.balance - credits.estimatedCost) / credits.balance) * 100;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Credits
          </CardTitle>
          <Badge variant={usagePercent > 20 ? 'secondary' : 'destructive'} className="text-[10px]">
            {credits.balance.toLocaleString()} available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Cost</span>
            <span className="font-medium">{credits.estimatedCost} credits</span>
          </div>
          <Progress value={100 - usagePercent} className="h-2" />
        </div>

        {/* Breakdown */}
        {credits.breakdown.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Cost Breakdown</p>
            {credits.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.stage}</span>
                <span>{item.credits}c</span>
              </div>
            ))}
          </div>
        )}

        {/* Optimization Suggestions */}
        {credits.optimizationSuggestions.length > 0 && (
          <div className="space-y-2 p-2 bg-amber-500/10 rounded-lg">
            <div className="flex items-center gap-2 text-amber-600">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs font-medium">Optimization Tips</span>
            </div>
            {credits.optimizationSuggestions.map((tip, index) => (
              <p key={index} className="text-xs text-muted-foreground">{tip}</p>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full">
          Get More Credits
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PUBLISH PANEL
// ============================================================================

interface PublishPanelProps {
  className?: string;
}

export function PublishPanel({ className }: PublishPanelProps) {
  const { project, publish } = useEditor();
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');

  const platforms: PublishPlatform[] = [
    { id: 'youtube', name: 'YouTube', icon: 'Youtube', isConnected: true },
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', isConnected: true },
    { id: 'twitter', name: 'Twitter/X', icon: 'Twitter', isConnected: false },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', isConnected: false },
  ];

  const PlatformIcons: Record<string, React.ReactNode> = {
    Youtube: <Youtube className="h-4 w-4" />,
    Linkedin: <Linkedin className="h-4 w-4" />,
    Twitter: <Twitter className="h-4 w-4" />,
    Instagram: <Instagram className="h-4 w-4" />,
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Publish
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Publish Your Content</SheetTitle>
          <SheetDescription>
            Export files or publish directly to platforms
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Files</h4>
            <div className="grid grid-cols-3 gap-2">
              {['MP4', 'PDF', 'PPTX'].map((format) => (
                <Button key={format} variant="outline" size="sm" className="h-16 flex-col gap-1">
                  <span className="text-lg">📄</span>
                  <span className="text-xs">{format}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Platform Publishing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Publish to Platforms</h4>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    platform.isConnected ? "bg-muted/30" : "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {PlatformIcons[platform.icon]}
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  {platform.isConnected ? (
                    <Badge variant="secondary" className="text-[10px]">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Schedule</h4>
            <div className="flex gap-2">
              <Button
                variant={scheduleType === 'immediate' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setScheduleType('immediate')}
              >
                Publish Now
              </Button>
              <Button
                variant={scheduleType === 'scheduled' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setScheduleType('scheduled')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            </div>
            {scheduleType === 'scheduled' && (
              <Input type="datetime-local" className="mt-2" />
            )}
          </div>

          <Separator />

          {/* Hosted Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Hosted Link</h4>
            <div className="flex gap-2">
              <Input
                readOnly
                value="https://genie.app/p/abc123"
                className="flex-1 text-xs"
              />
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="password-protect" />
              <Label htmlFor="password-protect" className="text-xs">Password protect</Label>
            </div>
          </div>

          {/* Publish Button */}
          <Button className="w-full" size="lg" onClick={() => publish({ platforms: [], schedule: { type: scheduleType } })}>
            <Upload className="h-4 w-4 mr-2" />
            {scheduleType === 'immediate' ? 'Publish Now' : 'Schedule Publish'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// COMPLETE LAYER 4 SIDEBAR
// ============================================================================

interface Layer4ActionsSidebarProps {
  className?: string;
}

export function Layer4ActionsSidebar({ className }: Layer4ActionsSidebarProps) {
  return (
    <div className={cn("w-72 border-l bg-background flex flex-col", className)}>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          <PreviewPanel />
          <ElementInspector />
          <CreditDashboardPanel />
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <PublishPanel />
      </div>
    </div>
  );
}

export default Layer4ActionsSidebar;
