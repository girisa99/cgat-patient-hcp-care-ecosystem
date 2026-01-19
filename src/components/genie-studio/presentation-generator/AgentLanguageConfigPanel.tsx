/**
 * Enhanced Agent & Language Configuration Panel
 * Provides full agent architecture selection with provider configuration and multi-language generation
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Brain,
  Bot,
  Network,
  Languages,
  Mic2,
  Image as ImageIcon,
  Sparkles,
  BarChart3,
  Cpu,
  Settings2,
  ChevronDown,
  ChevronRight,
  Check,
  Zap,
  Plus,
  Globe,
  Volume2,
  CircleDot,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AGENT_CATALOG, AGENT_TYPES, ARCHITECTURE_TYPE_INFO, AgentArchitectureType } from './AgentArchitecture';
import { 
  AgentModelConfig, 
  AI_MODEL_OPTIONS, 
  IMAGE_MODEL_OPTIONS, 
  VOICE_MODEL_OPTIONS,
  AgentSelectorDialog 
} from './AgentSelectorDialog';
import { SUPPORTED_LANGUAGES } from './MultiLanguageGenerator';

// Provider categories
const PROVIDER_CATEGORIES = {
  text: [
    { id: 'gemini', name: 'Google Gemini', icon: '🔮', color: 'bg-blue-500/10 text-blue-600' },
    { id: 'openai', name: 'OpenAI', icon: '🤖', color: 'bg-green-500/10 text-green-600' },
    { id: 'claude', name: 'Anthropic Claude', icon: '🧠', color: 'bg-purple-500/10 text-purple-600' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🔍', color: 'bg-orange-500/10 text-orange-600' },
  ],
  image: [
    { id: 'gemini', name: 'Gemini Image', icon: '🎨', color: 'bg-blue-500/10 text-blue-600' },
    { id: 'dalle', name: 'DALL-E', icon: '🖼️', color: 'bg-green-500/10 text-green-600' },
    { id: 'flux', name: 'Flux', icon: '⚡', color: 'bg-purple-500/10 text-purple-600' },
    { id: 'modelslab', name: 'ModelsLab', icon: '🔬', color: 'bg-orange-500/10 text-orange-600' },
  ],
  voice: [
    { id: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️', color: 'bg-pink-500/10 text-pink-600' },
    { id: 'openai', name: 'OpenAI TTS', icon: '🔊', color: 'bg-green-500/10 text-green-600' },
    { id: 'google', name: 'Google Cloud', icon: '☁️', color: 'bg-blue-500/10 text-blue-600' },
    { id: 'azure', name: 'Azure Neural', icon: '📡', color: 'bg-cyan-500/10 text-cyan-600' },
    { id: 'aws', name: 'Amazon Polly', icon: '📢', color: 'bg-amber-500/10 text-amber-600' },
  ],
  translation: [
    { id: 'deepl', name: 'DeepL', icon: '🌐', color: 'bg-blue-500/10 text-blue-600' },
    { id: 'google', name: 'Google Translate', icon: '🔤', color: 'bg-green-500/10 text-green-600' },
    { id: 'azure', name: 'Azure Translator', icon: '📝', color: 'bg-cyan-500/10 text-cyan-600' },
  ],
};

// Architecture type icons
const ARCH_ICONS: Record<AgentArchitectureType, React.ReactNode> = {
  single: <Bot className="h-5 w-5" />,
  agentic: <Brain className="h-5 w-5" />,
  a2a: <Network className="h-5 w-5" />,
};

// Language with voice configuration
interface LanguageVoiceConfig {
  code: string;
  name: string;
  voiceProvider?: string;
  voiceModel?: string;
  textModel?: string;
  enabled: boolean;
}

interface AgentLanguageConfigPanelProps {
  useAgenticGeneration: boolean;
  onUseAgenticGenerationChange: (value: boolean) => void;
  selectedAgents: string[];
  onSelectedAgentsChange: (agents: string[]) => void;
  agentModelConfigs: AgentModelConfig[];
  onAgentModelConfigsChange: (configs: AgentModelConfig[]) => void;
  selectedLanguages: string[];
  onSelectedLanguagesChange: (languages: string[]) => void;
  primaryLanguage: string;
  onPrimaryLanguageChange: (language: string) => void;
  includeVoiceover: boolean;
  onIncludeVoiceoverChange: (value: boolean) => void;
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
  className
}: AgentLanguageConfigPanelProps) {
  const [selectedArchitecture, setSelectedArchitecture] = useState<AgentArchitectureType>('agentic');
  const [showAgentConfig, setShowAgentConfig] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState(false);
  const [expandedLanguages, setExpandedLanguages] = useState(false);
  const [languageVoiceConfigs, setLanguageVoiceConfigs] = useState<LanguageVoiceConfig[]>([]);

  // Get agents by architecture type
  const getAgentsByArchitecture = (archType: AgentArchitectureType) => {
    return Object.entries(AGENT_CATALOG).filter(([_, agent]) => agent.architectureType === archType);
  };

  // Handle architecture selection
  const handleArchitectureSelect = (archType: AgentArchitectureType) => {
    setSelectedArchitecture(archType);
    
    // Auto-select agents based on architecture
    const archAgents = getAgentsByArchitecture(archType);
    const agentKeys = archAgents.map(([key]) => key);
    
    if (archType === 'a2a') {
      // A2A includes coordinator + all agents
      onSelectedAgentsChange(Object.keys(AGENT_CATALOG));
    } else if (archType === 'agentic') {
      // Agentic excludes coordinator
      onSelectedAgentsChange(agentKeys.filter(k => k !== 'coordinator'));
    } else {
      // Single agent - just content generator
      onSelectedAgentsChange(['slide_generator']);
    }
    
    toast.success(`Architecture: ${ARCHITECTURE_TYPE_INFO[archType].label}`);
  };

  // Handle agent toggle
  const handleAgentToggle = (agentKey: string) => {
    onSelectedAgentsChange(
      selectedAgents.includes(agentKey)
        ? selectedAgents.filter(a => a !== agentKey)
        : [...selectedAgents, agentKey]
    );
  };

  // Get agent model config
  const getAgentConfig = (agentKey: string) => {
    return agentModelConfigs.find(c => c.agentKey === agentKey);
  };

  // Update agent model
  const handleAgentModelChange = (agentKey: string, model: string) => {
    const existing = agentModelConfigs.find(c => c.agentKey === agentKey);
    if (existing) {
      onAgentModelConfigsChange(
        agentModelConfigs.map(c => c.agentKey === agentKey ? { ...c, model } : c)
      );
    } else {
      onAgentModelConfigsChange([...agentModelConfigs, { agentKey, enabled: true, model }]);
    }
  };

  // Handle language selection
  const handleLanguageToggle = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      if (langCode === primaryLanguage) {
        toast.error('Cannot remove primary language');
        return;
      }
      onSelectedLanguagesChange(selectedLanguages.filter(l => l !== langCode));
    } else {
      onSelectedLanguagesChange([...selectedLanguages, langCode]);
    }
  };

  // Get icon for agent type
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'coordinator': return <Cpu className="h-4 w-4" />;
      case 'slide_generator': return <Brain className="h-4 w-4" />;
      case 'image_generator': return <ImageIcon className="h-4 w-4" />;
      case 'translator': return <Languages className="h-4 w-4" />;
      case 'content_analyzer': return <BarChart3 className="h-4 w-4" />;
      case 'enhancer': return <Sparkles className="h-4 w-4" />;
      case 'voiceover': return <Mic2 className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  // Get model options for agent
  const getModelOptions = (agentType: string) => {
    if (agentType === 'image_generator') return IMAGE_MODEL_OPTIONS;
    if (agentType === 'voiceover') return VOICE_MODEL_OPTIONS;
    return AI_MODEL_OPTIONS;
  };

  // Agent config being edited
  const editingAgent = showAgentConfig ? AGENT_CATALOG[showAgentConfig as keyof typeof AGENT_CATALOG] : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Agents & Languages</h3>
            <p className="text-sm text-muted-foreground">Configure agent architecture and multi-language generation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={useAgenticGeneration ? "default" : "secondary"} className="gap-1">
            {useAgenticGeneration ? <Zap className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            {useAgenticGeneration ? 'Agentic' : 'Simple'}
          </Badge>
        </div>
      </div>

      {/* Architecture Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Agent Architecture
          </CardTitle>
          <CardDescription className="text-xs">
            Choose how AI agents collaborate to generate your presentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Architecture Type Cards - Clean Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(ARCHITECTURE_TYPE_INFO) as AgentArchitectureType[]).map(archType => {
              const info = ARCHITECTURE_TYPE_INFO[archType];
              const isSelected = selectedArchitecture === archType;
              const agentCount = getAgentsByArchitecture(archType).length;

              return (
                <button
                  key={archType}
                  onClick={() => handleArchitectureSelect(archType)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2.5 rounded-lg shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {ARCH_ICONS[archType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{info.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px]">
                          {agentCount} agents
                        </Badge>
                        {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Separator />

          {/* Agent Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Enable Agentic Generation</p>
                <p className="text-xs text-muted-foreground">Multi-agent collaboration for higher quality</p>
              </div>
            </div>
            <Switch 
              checked={useAgenticGeneration} 
              onCheckedChange={onUseAgenticGenerationChange} 
            />
          </div>

          {/* Agents List - Collapsible */}
          {useAgenticGeneration && (
            <Collapsible open={expandedAgents} onOpenChange={setExpandedAgents}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Configure Agents</span>
                    <Badge variant="secondary" className="text-xs">{selectedAgents.length} active</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expandedAgents && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  {Object.entries(AGENT_CATALOG).map(([key, agent]) => {
                    const isSelected = selectedAgents.includes(key);
                    const config = getAgentConfig(key);
                    const archInfo = ARCHITECTURE_TYPE_INFO[agent.architectureType];
                    const modelOptions = getModelOptions(agent.type);
                    const currentModel = config?.model || agent.defaultModel;

                    return (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all",
                          isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Toggle */}
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => handleAgentToggle(key)}
                            className="mt-0.5"
                          />
                          
                          {/* Icon */}
                          <div className={cn(
                            "p-1.5 rounded-lg flex-shrink-0",
                            isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {getAgentIcon(agent.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm text-foreground">{agent.name}</p>
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0 gap-0.5", archInfo.color)}>
                                {archInfo.label}
                              </Badge>
                              {agent.supportsStreaming && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 text-green-600 border-green-500/30">
                                  <Zap className="h-2 w-2 mr-0.5" />
                                  Stream
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>

                            {/* Provider Selection */}
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-2">
                                <Label className="text-[10px] text-muted-foreground">MODEL:</Label>
                                <Select
                                  value={currentModel}
                                  onValueChange={(value) => handleAgentModelChange(key, value)}
                                >
                                  <SelectTrigger className="h-7 text-xs flex-1 max-w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {modelOptions.map(opt => (
                                      <SelectItem key={opt.id} value={opt.id}>
                                        <div className="flex flex-col">
                                          <span className="text-xs">{opt.name}</span>
                                          <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Provider Badges */}
                                {agent.providers && (
                                  <div className="flex gap-1 ml-auto">
                                    {agent.providers.slice(0, 3).map(provider => {
                                      const providerInfo = PROVIDER_CATEGORIES.text.find(p => p.id === provider);
                                      return (
                                        <span
                                          key={provider}
                                          className={cn("text-[10px] px-1.5 py-0.5 rounded-full", providerInfo?.color || "bg-muted")}
                                          title={providerInfo?.name || provider}
                                        >
                                          {providerInfo?.icon || '•'}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Multi-Language Generation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Languages className="h-4 w-4 text-primary" />
            Multi-Language Generation
          </CardTitle>
          <CardDescription className="text-xs">
            Generate presentations in multiple languages simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Language */}
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-primary/5 border-primary/20">
            <Globe className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">PRIMARY LANGUAGE</Label>
              <Select value={primaryLanguage} onValueChange={onPrimaryLanguageChange}>
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="default" className="bg-primary">Primary</Badge>
          </div>

          {/* Language Selection Grid */}
          <Collapsible open={expandedLanguages} onOpenChange={setExpandedLanguages}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Add Languages</span>
                  <Badge variant="secondary" className="text-xs">{selectedLanguages.length} selected</Badge>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedLanguages && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 rounded-xl bg-card border">
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isSelected = selectedLanguages.includes(lang.code);
                  const isPrimary = primaryLanguage === lang.code;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageToggle(lang.code)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? isPrimary
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-primary/50 bg-primary/5"
                          : "border-transparent bg-muted/50 hover:border-primary/30 hover:bg-muted"
                      )}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{lang.name}</p>
                        {isPrimary && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0 mt-1">Primary</Badge>
                        )}
                      </div>
                      {isSelected && !isPrimary && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Voiceover Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Volume2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Include Voiceover</p>
                <p className="text-xs text-muted-foreground">Generate audio narration for each language</p>
              </div>
            </div>
            <Switch 
              checked={includeVoiceover} 
              onCheckedChange={onIncludeVoiceoverChange} 
            />
          </div>

          {/* Voice Provider Selection - Clean Grid */}
          {includeVoiceover && (
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voice Providers</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {PROVIDER_CATEGORIES.voice.map(provider => (
                  <button
                    key={provider.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <span className="text-xl">{provider.icon}</span>
                    <span className="text-xs font-medium text-foreground">{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">Configuration Summary</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={ARCHITECTURE_TYPE_INFO[selectedArchitecture].color}>
                  {ARCHITECTURE_TYPE_INFO[selectedArchitecture].label}
                </Badge>
                <Badge variant="secondary">{selectedAgents.length} Agents</Badge>
                <Badge variant="secondary">{selectedLanguages.length} Languages</Badge>
                {includeVoiceover && <Badge variant="secondary">Voiceover</Badge>}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedLanguages.map(code => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                  return lang && (
                    <span key={code} className="text-base" title={lang.name}>{lang.flag}</span>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Config Dialog */}
      {showAgentConfig && editingAgent && (
        <AgentSelectorDialog
          open={!!showAgentConfig}
          onOpenChange={(open) => !open && setShowAgentConfig(null)}
          agent={editingAgent}
          agentKey={showAgentConfig}
          config={getAgentConfig(showAgentConfig)}
          onConfirm={(config) => {
            const existing = agentModelConfigs.find(c => c.agentKey === config.agentKey);
            if (existing) {
              onAgentModelConfigsChange(
                agentModelConfigs.map(c => c.agentKey === config.agentKey ? config : c)
              );
            } else {
              onAgentModelConfigsChange([...agentModelConfigs, config]);
            }
            setShowAgentConfig(null);
          }}
        />
      )}
    </div>
  );
}
