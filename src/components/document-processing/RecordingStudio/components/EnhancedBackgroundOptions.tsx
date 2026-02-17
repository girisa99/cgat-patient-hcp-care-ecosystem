/**
 * Enhanced Background Options for Recording Studio
 * Supports blur, virtual backgrounds, AI-generated backgrounds, and Label Studio training
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CircleDot, Image, Sparkles, Upload, Palette, 
  ChevronDown, Loader2, Camera, Wand2, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type BackgroundMode = 'none' | 'blur' | 'virtual' | 'ai-generated' | 'color';

export interface BackgroundSettings {
  mode: BackgroundMode;
  blurIntensity: number;
  virtualBackgroundUrl?: string;
  backgroundColor?: string;
  aiPrompt?: string;
}

interface EnhancedBackgroundOptionsProps {
  settings: BackgroundSettings;
  onSettingsChange: (settings: BackgroundSettings) => void;
  onToggleBlur?: (enabled: boolean) => void;
  isBlurEnabled?: boolean;
  isModelLoading?: boolean;
  onTrainingDataCapture?: (imageData: string, segmentationType: string) => void;
}

// Pre-built virtual backgrounds
const VIRTUAL_BACKGROUNDS = [
  { id: 'office', name: 'Modern Office', url: '/backgrounds/office.jpg', category: 'professional' },
  { id: 'home', name: 'Cozy Home', url: '/backgrounds/home.jpg', category: 'casual' },
  { id: 'studio', name: 'Recording Studio', url: '/backgrounds/studio.jpg', category: 'professional' },
  { id: 'nature', name: 'Nature Scene', url: '/backgrounds/nature.jpg', category: 'casual' },
  { id: 'abstract', name: 'Abstract Gradient', url: '/backgrounds/abstract.jpg', category: 'creative' },
  { id: 'healthcare', name: 'Healthcare Setting', url: '/backgrounds/healthcare.jpg', category: 'medical' },
];

// AI-generated background prompts
const AI_BACKGROUND_PRESETS = [
  { id: 'professional-office', prompt: 'Modern minimalist office with soft natural lighting, clean desk, plant in corner', category: 'professional' },
  { id: 'podcast-studio', prompt: 'Professional podcast studio with acoustic panels, LED lighting, microphone visible', category: 'creative' },
  { id: 'medical-office', prompt: 'Clean medical consultation room with neutral colors, professional healthcare setting', category: 'medical' },
  { id: 'creative-space', prompt: 'Artistic creative workspace with colorful elements, inspiration boards, warm lighting', category: 'creative' },
  { id: 'virtual-conference', prompt: 'Futuristic virtual conference room with holographic displays, sleek design', category: 'tech' },
  { id: 'library', prompt: 'Elegant home library with bookshelves, warm lighting, comfortable atmosphere', category: 'casual' },
];

// Solid color backgrounds
const COLOR_BACKGROUNDS = [
  { id: 'green-screen', color: '#00FF00', name: 'Green Screen' },
  { id: 'blue-screen', color: '#0000FF', name: 'Blue Screen' },
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'black', color: '#000000', name: 'Black' },
  { id: 'gray', color: '#808080', name: 'Gray' },
  { id: 'navy', color: '#1a1a2e', name: 'Navy' },
  { id: 'teal', color: '#14b8a6', name: 'Teal' },
  { id: 'purple', color: '#8b5cf6', name: 'Purple' },
];

export function EnhancedBackgroundOptions({
  settings,
  onSettingsChange,
  onToggleBlur,
  isBlurEnabled = false,
  isModelLoading = false,
  onTrainingDataCapture,
}: EnhancedBackgroundOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customAIPrompt, setCustomAIPrompt] = useState('');
  const [isCapturingTraining, setIsCapturingTraining] = useState(false);

  const handleModeChange = useCallback((mode: BackgroundMode) => {
    onSettingsChange({ ...settings, mode });
    
    if (mode === 'blur' && onToggleBlur) {
      onToggleBlur(true);
    } else if (onToggleBlur && settings.mode === 'blur') {
      onToggleBlur(false);
    }
  }, [settings, onSettingsChange, onToggleBlur]);

  const handleBlurIntensityChange = useCallback((value: number[]) => {
    onSettingsChange({ ...settings, blurIntensity: value[0] });
  }, [settings, onSettingsChange]);

  const handleVirtualBackgroundSelect = useCallback((url: string) => {
    onSettingsChange({ ...settings, mode: 'virtual', virtualBackgroundUrl: url });
  }, [settings, onSettingsChange]);

  const handleColorSelect = useCallback((color: string) => {
    onSettingsChange({ ...settings, mode: 'color', backgroundColor: color });
  }, [settings, onSettingsChange]);

  const generateAIBackground = useCallback(async (prompt: string) => {
    setIsGeneratingAI(true);
    try {
      const response = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_image',
          prompt: `Background image for video recording: ${prompt}. High quality, suitable for virtual background, no people, professional lighting.`,
          aspectRatio: '16:9',
        },
      });

      if (response.error) throw response.error;

      const imageUrl = response.data?.imageUrl;
      if (imageUrl) {
        onSettingsChange({ 
          ...settings, 
          mode: 'ai-generated', 
          virtualBackgroundUrl: imageUrl,
          aiPrompt: prompt 
        });
        toast.success('AI background generated!');
      }
    } catch (error) {
      console.error('AI background generation error:', error);
      toast.error('Failed to generate AI background');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [settings, onSettingsChange]);

  const captureTrainingData = useCallback(async () => {
    if (!onTrainingDataCapture) return;
    
    setIsCapturingTraining(true);
    try {
      // This would capture the current frame and send to Label Studio for annotation
      toast.info('Capturing frame for segmentation training...');
      
      // Placeholder - actual implementation would grab canvas frame
      const canvas = document.querySelector('canvas.recording-canvas') as HTMLCanvasElement;
      if (canvas) {
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onTrainingDataCapture(imageData, 'person_segmentation');
        toast.success('Frame captured for Label Studio training');
      } else {
        toast.info('Start recording to capture training data');
      }
    } catch (error) {
      console.error('Training data capture error:', error);
      toast.error('Failed to capture training data');
    } finally {
      setIsCapturingTraining(false);
    }
  }, [onTrainingDataCapture]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-9 text-sm"
        >
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Background Options
            {settings.mode !== 'none' && (
              <Badge variant="secondary" className="text-[10px]">
                {settings.mode === 'blur' ? 'Blur' : 
                 settings.mode === 'virtual' ? 'Virtual' :
                 settings.mode === 'ai-generated' ? 'AI' :
                 settings.mode === 'color' ? 'Color' : 'Off'}
              </Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-4">
        <Tabs defaultValue="blur" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="blur" className="text-xs gap-1">
              <CircleDot className="w-3 h-3" /> Blur
            </TabsTrigger>
            <TabsTrigger value="virtual" className="text-xs gap-1">
              <Image className="w-3 h-3" /> Virtual
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" /> AI
            </TabsTrigger>
            <TabsTrigger value="color" className="text-xs gap-1">
              <Palette className="w-3 h-3" /> Color
            </TabsTrigger>
          </TabsList>

          {/* Blur Tab */}
          <TabsContent value="blur" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Enable Background Blur</Label>
              <Switch
                checked={settings.mode === 'blur'}
                onCheckedChange={(checked) => handleModeChange(checked ? 'blur' : 'none')}
              />
            </div>
            
            {settings.mode === 'blur' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Blur Intensity</Label>
                    <span className="text-xs text-muted-foreground">{settings.blurIntensity}px</span>
                  </div>
                  <Slider
                    value={[settings.blurIntensity]}
                    onValueChange={handleBlurIntensityChange}
                    min={5}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                {isModelLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading ML segmentation model...
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Virtual Backgrounds Tab */}
          <TabsContent value="virtual" className="space-y-3 mt-3">
            <Label className="text-xs">Choose Virtual Background</Label>
            <div className="grid grid-cols-3 gap-2">
              {VIRTUAL_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleVirtualBackgroundSelect(bg.url)}
                  className={`relative aspect-video rounded-lg border overflow-hidden transition-all ${
                    settings.virtualBackgroundUrl === bg.url
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                    <span className="text-[10px] text-center px-1">{bg.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Upload */}
            <div className="space-y-2">
              <Label className="text-xs">Or Upload Custom</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="h-8 text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      handleVirtualBackgroundSelect(url);
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* AI Generated Tab */}
          <TabsContent value="ai" className="space-y-3 mt-3">
            <Label className="text-xs">AI-Generated Backgrounds</Label>
            
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {AI_BACKGROUND_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 text-left justify-start"
                  onClick={() => generateAIBackground(preset.prompt)}
                  disabled={isGeneratingAI}
                >
                  <div>
                    <div className="text-xs font-medium">{preset.id.replace(/-/g, ' ')}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{preset.category}</div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label className="text-xs">Custom AI Prompt</Label>
              <div className="flex gap-2">
                <Input
                  value={customAIPrompt}
                  onChange={(e) => setCustomAIPrompt(e.target.value)}
                  placeholder="Describe your ideal background..."
                  className="h-8 text-xs flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => generateAIBackground(customAIPrompt)}
                  disabled={isGeneratingAI || !customAIPrompt.trim()}
                  className="h-8"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {isGeneratingAI && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating AI background...
              </div>
            )}
          </TabsContent>

          {/* Color Tab */}
          <TabsContent value="color" className="space-y-3 mt-3">
            <Label className="text-xs">Solid Color Background</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_BACKGROUNDS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.color)}
                  className={`aspect-square rounded-lg border transition-all ${
                    settings.backgroundColor === color.color
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-1 hover:ring-primary/50'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Custom Color */}
            <div className="flex gap-2 items-center">
              <Label className="text-xs">Custom:</Label>
              <Input
                type="color"
                value={settings.backgroundColor || '#000000'}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-12 h-8 p-0.5"
              />
              <Input
                value={settings.backgroundColor || '#000000'}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#000000"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Label Studio Training Integration */}
        {onTrainingDataCapture && (
          <Card className="mt-4">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xs font-medium">Label Studio Training</div>
                    <div className="text-[10px] text-muted-foreground">
                      Capture frames to improve segmentation
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={captureTrainingData}
                  disabled={isCapturingTraining}
                  className="h-7 text-xs"
                >
                  {isCapturingTraining ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Camera className="w-3 h-3 mr-1" />
                  )}
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleModeChange('none')}
          className="w-full h-7 text-xs"
        >
          Disable Background Effects
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
