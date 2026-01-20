/**
 * Voice Provider Dropdown
 * Clean dropdown for selecting voice/TTS providers
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Mic, Check, Globe, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Voice provider options
const VOICE_PROVIDERS = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'ElevenLabs',
    icon: '🎙️',
    description: 'Premium voices with cloning',
    quality: 'ultra',
    languages: 29,
    voices: 24,
    features: ['voice-cloning', 'emotion', 'multilingual'],
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    shortName: 'OpenAI',
    icon: '🔊',
    description: 'Natural conversational voices',
    quality: 'high',
    languages: 57,
    voices: 6,
    features: ['fast', 'consistent'],
  },
  {
    id: 'google',
    name: 'Google Cloud TTS',
    shortName: 'Google',
    icon: '☁️',
    description: 'Wide language coverage',
    quality: 'high',
    languages: 80,
    voices: 220,
    features: ['multilingual', 'ssml'],
  },
  {
    id: 'azure',
    name: 'Azure Neural TTS',
    shortName: 'Azure',
    icon: '📡',
    description: 'Enterprise-grade synthesis',
    quality: 'high',
    languages: 75,
    voices: 400,
    features: ['neural', 'custom-voice'],
  },
  {
    id: 'aws',
    name: 'Amazon Polly',
    shortName: 'Polly',
    icon: '📢',
    description: 'Reliable cloud voices',
    quality: 'standard',
    languages: 29,
    voices: 60,
    features: ['ssml', 'lexicons'],
  },
];

const QUALITY_STYLES: Record<string, string> = {
  ultra: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30',
  high: 'bg-primary/20 text-primary border-primary/30',
  standard: 'bg-muted text-muted-foreground border-muted',
};

interface VoiceProviderDropdownProps {
  value: string;
  onChange: (provider: string) => void;
  className?: string;
}

export function VoiceProviderDropdown({
  value,
  onChange,
  className,
}: VoiceProviderDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedProvider = VOICE_PROVIDERS.find(p => p.id === value);

  const handleSelect = (providerId: string) => {
    onChange(providerId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-10 text-sm font-normal bg-background',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedProvider ? (
              <>
                <span className="text-base">{selectedProvider.icon}</span>
                <span className="truncate">{selectedProvider.shortName}</span>
                <Badge
                  variant="outline"
                  className={cn('text-[9px] px-1', QUALITY_STYLES[selectedProvider.quality])}
                >
                  {selectedProvider.quality}
                </Badge>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Select voice provider...</span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0 z-50 bg-popover border shadow-lg"
        align="start"
      >
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Voice Provider</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a provider for AI voiceover
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
            {VOICE_PROVIDERS.map(provider => {
              const isSelected = value === provider.id;

              return (
                <div
                  key={provider.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  )}
                  onClick={() => handleSelect(provider.id)}
                >
                  <div className="text-2xl shrink-0">{provider.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{provider.name}</p>
                      <Badge
                        variant="outline"
                        className={cn('text-[9px] px-1', QUALITY_STYLES[provider.quality])}
                      >
                        {provider.quality}
                      </Badge>
                      {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {provider.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {provider.languages} langs
                      </span>
                      <span>{provider.voices} voices</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.features.map(feature => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-[9px] px-1"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
