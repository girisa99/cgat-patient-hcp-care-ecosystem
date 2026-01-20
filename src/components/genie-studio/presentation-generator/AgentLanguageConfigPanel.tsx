/**
 * Enhanced Agent & Language Configuration Panel
 * Refactored: Clean dropdowns, all providers, structured layout
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Brain,
  Languages,
  Sparkles,
  Globe,
  Volume2,
  Bot,
  Network,
  Cpu,
  ImageIcon,
  BarChart3,
  Mic2,
  Settings2,
  ChevronDown,
  Check,
  Zap,
  Star,
  Info,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AGENT_CATALOG, ARCHITECTURE_TYPE_INFO, AgentArchitectureType } from './AgentArchitecture';
import { AgentModelConfig } from './AgentSelectorDialog';
import { LanguageMultiSelectDropdown } from './components/LanguageMultiSelectDropdown';
import { AgentProviderSelector } from './components/AgentProviderSelector';
import {
  TEXT_PROVIDERS,
  IMAGE_PROVIDERS,
  VIDEO_PROVIDERS,
  VOICE_PROVIDERS,
  TRANSLATION_PROVIDERS,
  TIER_COLORS,
  TIER_LABELS,
  getRecommendedProvider,
} from './constants/aiProviderConstants';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Architecture icons
const ARCH_ICONS: Record<AgentArchitectureType, React.ReactNode> = {
  single: <Bot className="h-4 w-4" />,
  agentic: <Brain className="h-4 w-4" />,
  a2a: <Network className="h-4 w-4" />,
};

// Agent type icons
const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  coordinator: <Cpu className="h-4 w-4" />,
  slide_generator: <Brain className="h-4 w-4" />,
  image_generator: <ImageIcon className="h-4 w-4" />,
  translator: <Languages className="h-4 w-4" />,
  content_analyzer: <BarChart3 className="h-4 w-4" />,
  enhancer: <Sparkles className="h-4 w-4" />,
  voiceover: <Mic2 className="h-4 w-4" />,
  video_generator: <Video className="h-4 w-4" />,
};

interface AgentLanguageConfigPanelProps {
  useAgenticGeneration: boolean;
  onUseAgenticGenerationChange: (use: boolean) => void;
  selectedAgents: string[];
  onSelectedAgentsChange: (agents: string[]) => void;
  agentModelConfigs: AgentModelConfig[];
  onAgentModelConfigsChange: (configs: AgentModelConfig[]) => void;
  selectedLanguages: string[];
  onSelectedLanguagesChange: (languages: string[]) => void;
  primaryLanguage: string;
  onPrimaryLanguageChange: (language: string) => void;
  includeVoiceover: boolean;
  onIncludeVoiceoverChange: (include: boolean) => void;
  className?: string;
}

export function AgentLanguageConfigPanel({
  useAgenticGeneration,
  onUseAgenticGenerationChange,
  selectedAgents,
  onSelectedAgentsChange,
  agentModelConfigs,
  onAgentModelConfigsChange,
  selectedLanguages,
  onSelectedLanguagesChange,
  primaryLanguage,
  onPrimaryLanguageChange,
  includeVoiceover,
  onIncludeVoiceoverChange,
  className,
}: AgentLanguageConfigPanelProps) {
  const [selectedArchitecture, setSelectedArchitecture] = useState<AgentArchitectureType>('agentic');
  const [expandedSection, setExpandedSection] = useState<string | null>('agents');

  // Get agents filtered by architecture
  const agentsByArchitecture = useMemo(() => {
    const all = Object.entries(AGENT_CATALOG);
    return {
      single: all.filter(([_, a]) => a.architectureType === 'single'),
      agentic: all.filter(([_, a]) => a.architectureType === 'agentic'),
      a2a: all.filter(([_, a]) => a.architectureType === 'a2a'),
    };
  }, []);

  // Get all available agents for current architecture (includes compatible agents)
  const availableAgents = useMemo(() => {
    if (selectedArchitecture === 'a2a') {
      return Object.entries(AGENT_CATALOG); // A2A can use all agents
    }
    if (selectedArchitecture === 'agentic') {
      return Object.entries(AGENT_CATALOG).filter(
        ([_, a]) => a.architectureType === 'agentic' || a.architectureType === 'single'
      );
    }
    return agentsByArchitecture.single;
  }, [selectedArchitecture, agentsByArchitecture]);

  // Handle architecture selection
  const handleArchitectureSelect = useCallback((archType: AgentArchitectureType) => {
    setSelectedArchitecture(archType);
    
    // Auto-select recommended agents for architecture
    let recommendedAgents: string[] = [];
    if (archType === 'single') {
      recommendedAgents = ['slide_generator'];
    } else if (archType === 'agentic') {
      recommendedAgents = ['slide_generator', 'image_generator', 'translator', 'enhancer'];
    } else {
      recommendedAgents = Object.keys(AGENT_CATALOG);
    }
    
    onSelectedAgentsChange(recommendedAgents);
    onUseAgenticGenerationChange(archType !== 'single');
    toast.success(`Switched to ${ARCHITECTURE_TYPE_INFO[archType].label}`);
  }, [onSelectedAgentsChange, onUseAgenticGenerationChange]);

  // Handle agent toggle
  const handleAgentToggle = useCallback((agentKey: string) => {
    if (selectedAgents.includes(agentKey)) {
      onSelectedAgentsChange(selectedAgents.filter(a => a !== agentKey));
    } else {
      onSelectedAgentsChange([...selectedAgents, agentKey]);
    }
  }, [selectedAgents, onSelectedAgentsChange]);

  // Handle provider change for agent
  const handleProviderChange = useCallback((agentKey: string, providerId: string) => {
    const existing = agentModelConfigs.find(c => c.agentKey === agentKey);
    if (existing) {
      onAgentModelConfigsChange(
        agentModelConfigs.map(c => 
          c.agentKey === agentKey ? { ...c, model: providerId } : c
        )
      );
    } else {
      onAgentModelConfigsChange([
        ...agentModelConfigs,
        { agentKey, model: providerId, enabled: true }
      ]);
    }
  }, [agentModelConfigs, onAgentModelConfigsChange]);

  // Get current provider for agent
  const getAgentProvider = useCallback((agentKey: string, agentType: string) => {
    const config = agentModelConfigs.find(c => c.agentKey === agentKey);
    if (config?.model) return config.model;
    return getRecommendedProvider(agentType)?.id || 'gemini-3-flash';
  }, [agentModelConfigs]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Agents & Languages</h3>
            <p className="text-sm text-muted-foreground">Configure multi-agent architecture</p>
          </div>
        </div>
        <Badge variant={useAgenticGeneration ? "default" : "secondary"} className="gap-1">
          {useAgenticGeneration ? <Zap className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          {ARCHITECTURE_TYPE_INFO[selectedArchitecture].label}
        </Badge>
      </div>

      {/* Architecture Dropdown */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Agent Architecture
        </Label>
        <Select value={selectedArchitecture} onValueChange={(v) => handleArchitectureSelect(v as AgentArchitectureType)}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue>
              <div className="flex items-center gap-2">
                {ARCH_ICONS[selectedArchitecture]}
                <span>{ARCHITECTURE_TYPE_INFO[selectedArchitecture].label}</span>
                <Badge variant="secondary" className="text-[10px] ml-2">
                  {availableAgents.length} agents
                </Badge>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50">
            {(Object.keys(ARCHITECTURE_TYPE_INFO) as AgentArchitectureType[]).map(arch => {
              const info = ARCHITECTURE_TYPE_INFO[arch];
              const count = arch === 'a2a' 
                ? Object.keys(AGENT_CATALOG).length 
                : arch === 'agentic'
                  ? Object.entries(AGENT_CATALOG).filter(([_, a]) => a.architectureType !== 'a2a').length
                  : agentsByArchitecture.single.length;
              
              return (
                <SelectItem key={arch} value={arch}>
                  <div className="flex items-center gap-3 py-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedArchitecture === arch ? "bg-primary/10" : "bg-muted"
                    )}>
                      {ARCH_ICONS[arch]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{info.label}</span>
                        <Badge variant="outline" className="text-[9px]">{count} agents</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Agents Configuration */}
      <Collapsible 
        open={expandedSection === 'agents'} 
        onOpenChange={(open) => setExpandedSection(open ? 'agents' : null)}
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Configure Agents</span>
            <Badge variant="secondary" className="text-xs">{selectedAgents.length} active</Badge>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSection === 'agents' && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[280px] mt-3">
            <div className="space-y-2 pr-3">
              {availableAgents.map(([key, agent]) => {
                const isSelected = selectedAgents.includes(key);
                const currentProvider = getAgentProvider(key, agent.type);
                const recommended = getRecommendedProvider(agent.type);
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-xl border transition-all",
                      isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Switch
                        checked={isSelected}
                        onCheckedChange={() => handleAgentToggle(key)}
                        className="mt-0.5"
                      />
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {AGENT_TYPE_ICONS[agent.type] || <Bot className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{agent.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-[9px] px-1.5", ARCHITECTURE_TYPE_INFO[agent.architectureType].color)}
                          >
                            {ARCHITECTURE_TYPE_INFO[agent.architectureType].label}
                          </Badge>
                          {agent.supportsStreaming && (
                            <Badge variant="outline" className="text-[9px] px-1.5 text-green-600 border-green-500/30">
                              <Zap className="h-2 w-2 mr-0.5" />
                              Stream
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                        
                        {/* Provider Selection - Only when selected */}
                        {isSelected && (
                          <div className="flex items-center gap-2 pt-1">
                            <AgentProviderSelector
                              agentType={agent.type}
                              value={currentProvider}
                              onChange={(v) => handleProviderChange(key, v)}
                              showLabel={false}
                              className="flex-1 max-w-[180px]"
                            />
                            {recommended && currentProvider === recommended.id && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-[9px] gap-1 text-yellow-600 border-yellow-500/30">
                                      <Star className="h-2.5 w-2.5 fill-yellow-500" />
                                      Recommended
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Best provider for this agent type</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Multi-Language Generation */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          Multi-Language Generation
        </Label>
        
        <LanguageMultiSelectDropdown
          value={selectedLanguages}
          onChange={onSelectedLanguagesChange}
          primaryLanguage={primaryLanguage}
          onPrimaryChange={onPrimaryLanguageChange}
          maxLanguages={7}
        />

        {/* Voiceover Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Volume2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Include Voiceover</p>
              <p className="text-xs text-muted-foreground">Generate audio for each language</p>
            </div>
          </div>
          <Switch 
            checked={includeVoiceover} 
            onCheckedChange={onIncludeVoiceoverChange} 
          />
        </div>

        {/* Voice Provider Info */}
        {includeVoiceover && (
          <div className="p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Mic2 className="h-4 w-4 text-primary" />
              <Label className="text-xs font-medium">Available Voice Providers</Label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_PROVIDERS.slice(0, 6).map(p => (
                <TooltipProvider key={p.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] gap-1 cursor-default", TIER_COLORS[p.tier])}
                      >
                        <span>{p.icon}</span>
                        {p.shortName}
                        {p.recommended && <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Configuration Summary */}
      <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Configuration Summary</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Architecture */}
          <div className="p-2.5 rounded-lg bg-background border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Architecture</p>
            <div className="flex items-center gap-2">
              {ARCH_ICONS[selectedArchitecture]}
              <span className="text-sm font-medium">{ARCHITECTURE_TYPE_INFO[selectedArchitecture].label}</span>
            </div>
          </div>
          
          {/* Agents */}
          <div className="p-2.5 rounded-lg bg-background border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Active Agents</p>
            <span className="text-sm font-medium">{selectedAgents.length} of {availableAgents.length}</span>
          </div>
          
          {/* Languages */}
          <div className="p-2.5 rounded-lg bg-background border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Languages</p>
            <span className="text-sm font-medium">{selectedLanguages.length} selected</span>
          </div>
          
          {/* Voiceover */}
          <div className="p-2.5 rounded-lg bg-background border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Voiceover</p>
            <span className="text-sm font-medium">{includeVoiceover ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        {/* Active Agents List */}
        {selectedAgents.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Active Agents & Providers</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgents.map(key => {
                const agent = AGENT_CATALOG[key as keyof typeof AGENT_CATALOG];
                if (!agent) return null;
                const provider = getAgentProvider(key, agent.type);
                const providerInfo = [...TEXT_PROVIDERS, ...IMAGE_PROVIDERS, ...VOICE_PROVIDERS, ...TRANSLATION_PROVIDERS]
                  .find(p => p.id === provider);
                
                return (
                  <Badge key={key} variant="secondary" className="text-[10px] gap-1">
                    {AGENT_TYPE_ICONS[agent.type]}
                    <span className="truncate max-w-[80px]">{agent.name.replace(' Agent', '')}</span>
                    {providerInfo && (
                      <span className="text-muted-foreground">• {providerInfo.icon}</span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
