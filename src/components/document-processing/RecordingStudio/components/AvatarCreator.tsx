/**
 * Avatar Creator - AI-powered avatar generation for video presentations
 * Supports text-to-avatar with lip sync
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  User, Wand2, Play, Loader2, ChevronDown, 
  Upload, Sparkles, Video, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AvatarCreatorProps {
  onAvatarGenerated?: (avatarVideo: { url: string; duration: number; prompt: string }) => void;
  currentScriptContent?: string;
}

// Avatar style presets
const AVATAR_STYLES = [
  { id: 'professional', name: 'Professional', description: 'Business attire, neutral background' },
  { id: 'casual', name: 'Casual', description: 'Relaxed style, modern setting' },
  { id: 'presenter', name: 'Presenter', description: 'News anchor style' },
  { id: 'creative', name: 'Creative', description: 'Artistic, colorful background' },
];

// Avatar appearance options
const AVATAR_APPEARANCES = [
  { id: 'male-1', name: 'Alex', gender: 'male', thumbnail: '👨‍💼' },
  { id: 'female-1', name: 'Sarah', gender: 'female', thumbnail: '👩‍💼' },
  { id: 'male-2', name: 'Marcus', gender: 'male', thumbnail: '👨‍🔬' },
  { id: 'female-2', name: 'Lisa', gender: 'female', thumbnail: '👩‍🔬' },
  { id: 'custom', name: 'Custom', gender: 'custom', thumbnail: '✨' },
];

export function AvatarCreator({ 
  onAvatarGenerated,
  currentScriptContent 
}: AvatarCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Avatar settings
  const [selectedAvatar, setSelectedAvatar] = useState('female-1');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [scriptText, setScriptText] = useState('');
  const [voiceId, setVoiceId] = useState('EXAVITQu4vr4xnSDxMaL'); // Sarah voice
  
  // Advanced settings
  const [expressiveness, setExpressiveness] = useState(50);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Use script content if available
  const useCurrentScript = () => {
    if (currentScriptContent) {
      setScriptText(currentScriptContent);
      toast.success('Script loaded');
    }
  };

  const handleGenerate = async () => {
    if (!scriptText.trim()) {
      toast.error('Please enter script text for the avatar to speak');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Call avatar generation API (placeholder - would integrate with D-ID, HeyGen, or similar)
      const response = await supabase.functions.invoke('ai-avatar-generator', {
        body: {
          script: scriptText,
          avatarId: selectedAvatar,
          style: selectedStyle,
          voiceId,
          expressiveness: expressiveness / 100,
          backgroundColor,
          customImage: customImageUrl || undefined,
        },
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { videoUrl, duration } = response.data;

      if (onAvatarGenerated && videoUrl) {
        onAvatarGenerated({
          url: videoUrl,
          duration,
          prompt: scriptText.substring(0, 100),
        });
      }

      toast.success('Avatar video generated successfully!');
    } catch (error) {
      console.error('Avatar generation error:', error);
      
      // For demo purposes, show placeholder success
      toast.info('Avatar generation requires API integration (D-ID, HeyGen, or similar)');
      
      // Demo callback with placeholder
      if (onAvatarGenerated) {
        onAvatarGenerated({
          url: '',
          duration: Math.ceil(scriptText.split(' ').length / 2.5), // Estimate duration
          prompt: scriptText.substring(0, 100),
        });
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const estimatedDuration = Math.ceil(scriptText.split(' ').length / 2.5);
  const estimatedCost = (estimatedDuration * 0.10).toFixed(2); // ~$0.10/second estimate

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-9 text-sm"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            AI Avatar Creator
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-4">
        {/* Avatar Selection */}
        <div className="space-y-2">
          <Label className="text-xs">Choose Avatar</Label>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_APPEARANCES.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedAvatar === avatar.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl block mb-1">{avatar.thumbnail}</span>
                <span className="text-[10px] text-muted-foreground">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <Label className="text-xs">Avatar Style</Label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVATAR_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div>
                    <span className="font-medium">{style.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {style.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Script Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Script Text</Label>
            {currentScriptContent && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs gap-1"
                onClick={useCurrentScript}
              >
                <Sparkles className="w-3 h-3" />
                Use Current Script
              </Button>
            )}
          </div>
          <Textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Enter the text you want the avatar to speak..."
            className="min-h-[100px] text-sm resize-none"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{scriptText.split(' ').filter(Boolean).length} words</span>
            <span>~{estimatedDuration}s | Est. ${estimatedCost}</span>
          </div>
        </div>

        {/* Advanced Settings */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8">
              <Settings className="w-3.5 h-3.5" />
              Advanced Settings
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2 pl-2 border-l-2 border-muted">
            {/* Expressiveness */}
            <div className="space-y-1">
              <Label className="text-xs">Expressiveness</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[expressiveness]}
                  onValueChange={([v]) => setExpressiveness(v)}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs w-8">{expressiveness}%</span>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-1">
              <Label className="text-xs">Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-8 p-0.5"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Custom Image */}
            {selectedAvatar === 'custom' && (
              <div className="space-y-1">
                <Label className="text-xs">Custom Face Image URL</Label>
                <Input
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !scriptText.trim()}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating... {generationProgress}%
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Generate Avatar Video
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        )}

        {/* Info */}
        <p className="text-[10px] text-muted-foreground text-center">
          Requires D-ID, HeyGen, or similar API integration for video generation
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
