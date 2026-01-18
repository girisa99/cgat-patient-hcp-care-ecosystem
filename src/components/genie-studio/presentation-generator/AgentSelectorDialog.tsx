/**
 * Agent Selector Dialog - Shows agent details and allows model selection
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Cpu,
  Image as ImageIcon,
  Languages,
  BarChart3,
  Sparkles,
  Mic2,
  Check,
  Settings2,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// AI Models available for selection (matching Lovable AI gateway)
export const AI_MODEL_OPTIONS = [
  { 
    id: 'auto', 
    name: 'Auto (Recommended)', 
    description: 'AI selects optimal model per task',
    provider: 'auto'
  },
  { 
    id: 'google/gemini-3-flash-preview', 
    name: 'Gemini 3 Flash', 
    description: 'Fast & balanced (default)',
    provider: 'google'
  },
  { 
    id: 'google/gemini-3-pro-preview', 
    name: 'Gemini 3 Pro', 
    description: 'Next-gen high quality',
    provider: 'google'
  },
  { 
    id: 'google/gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    description: 'Strong reasoning + multimodal',
    provider: 'google'
  },
  { 
    id: 'google/gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    description: 'Balanced cost & quality',
    provider: 'google'
  },
  { 
    id: 'openai/gpt-5', 
    name: 'GPT-5', 
    description: 'Premium reasoning',
    provider: 'openai'
  },
  { 
    id: 'openai/gpt-5-mini', 
    name: 'GPT-5 Mini', 
    description: 'Cost-effective reasoning',
    provider: 'openai'
  },
  { 
    id: 'openai/gpt-5.2', 
    name: 'GPT-5.2', 
    description: 'Latest enhanced reasoning',
    provider: 'openai'
  },
];

// Image models for image generation agent
export const IMAGE_MODEL_OPTIONS = [
  { id: 'auto', name: 'Auto', description: 'AI selects best model' },
  { id: 'google/gemini-2.5-flash-image', name: 'Gemini Flash Image', description: 'Fast image generation' },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', description: 'High quality images' },
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI image generation' },
  { id: 'dall-e-2', name: 'DALL-E 2', description: 'Fast OpenAI images' },
];

// Voice models for voiceover agent
export const VOICE_MODEL_OPTIONS = [
  { id: 'openai', name: 'OpenAI TTS', description: 'High quality voices' },
  { id: 'elevenlabs', name: 'ElevenLabs', description: 'Premium natural voices' },
];

export interface AgentConfig {
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  defaultModel: string;
  supportsStreaming: boolean;
}

export interface AgentModelConfig {
  agentKey: string;
  enabled: boolean;
  model: string;
}

// Icons for each agent type
const AGENT_ICONS: Record<string, React.ReactNode> = {
  coordinator: <Cpu className="h-5 w-5" />,
  slide_generator: <Brain className="h-5 w-5" />,
  image_generator: <ImageIcon className="h-5 w-5" />,
  translator: <Languages className="h-5 w-5" />,
  content_analyzer: <BarChart3 className="h-5 w-5" />,
  enhancer: <Sparkles className="h-5 w-5" />,
  voiceover: <Mic2 className="h-5 w-5" />,
};

interface AgentSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentConfig | null;
  agentKey: string;
  config: AgentModelConfig | undefined;
  onConfirm: (config: AgentModelConfig) => void;
}

export function AgentSelectorDialog({
  open,
  onOpenChange,
  agent,
  agentKey,
  config,
  onConfirm,
}: AgentSelectorDialogProps) {
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [selectedModel, setSelectedModel] = useState(config?.model || agent?.defaultModel || 'auto');

  if (!agent) return null;

  // Determine which model options to show based on agent type
  const getModelOptions = () => {
    if (agent.type === 'image_generator') {
      return IMAGE_MODEL_OPTIONS;
    }
    if (agent.type === 'voiceover') {
      return VOICE_MODEL_OPTIONS;
    }
    return AI_MODEL_OPTIONS;
  };

  const modelOptions = getModelOptions();
  const icon = AGENT_ICONS[agent.type] || <Brain className="h-5 w-5" />;

  const handleConfirm = () => {
    onConfirm({
      agentKey,
      enabled,
      model: selectedModel,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg",
              enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <div>
              <DialogTitle className="text-lg">{agent.name}</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                {agent.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enable/Disable Agent */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Agent</Label>
              <p className="text-xs text-muted-foreground">
                Include this agent in the generation pipeline
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">CAPABILITIES</Label>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-[10px] capitalize">
                  {cap.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Settings2 className="h-3 w-3" />
              AI MODEL
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!enabled}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select AI model..." />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-[10px] text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Default: {agent.defaultModel}
            </p>
          </div>

          {/* Streaming Support Indicator */}
          {agent.supportsStreaming && (
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-green-500/5 border-green-500/20">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Supports real-time streaming</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-1" />
            {enabled ? 'Enable Agent' : 'Disable Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact Agent Card for the grid view
interface AgentCardProps {
  agentKey: string;
  agent: AgentConfig;
  isSelected: boolean;
  config?: AgentModelConfig;
  onClick: () => void;
}

export function AgentCard({ agentKey, agent, isSelected, config, onClick }: AgentCardProps) {
  const icon = AGENT_ICONS[agent.type] || <Brain className="h-4 w-4" />;
  const modelName = config?.model 
    ? AI_MODEL_OPTIONS.find(m => m.id === config.model)?.name || 
      IMAGE_MODEL_OPTIONS.find(m => m.id === config.model)?.name ||
      VOICE_MODEL_OPTIONS.find(m => m.id === config.model)?.name ||
      config.model
    : 'Default';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md overflow-hidden",
        isSelected
          ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
          : "bg-card hover:bg-muted/50 border-border"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "p-1.5 rounded-md flex-shrink-0",
          isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
            <span className="font-medium text-sm truncate block">{agent.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 break-words">
            {agent.description}
          </p>
          {isSelected && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <Badge variant="outline" className="text-[8px] px-1 py-0 max-w-full truncate">
                {modelName}
              </Badge>
              {agent.supportsStreaming && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 text-green-600 border-green-500/30 flex-shrink-0">
                  <Zap className="h-2 w-2 mr-0.5" />
                  Stream
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
