/**
 * Agent Architecture Dropdown
 * Clean dropdown for selecting agent architecture with agent configuration
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChevronDown,
  Bot,
  Brain,
  Network,
  Settings2,
  Check,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AGENT_CATALOG,
  ARCHITECTURE_TYPE_INFO,
  AgentArchitectureType,
} from '../AgentArchitecture';
import { AI_MODEL_OPTIONS, AgentModelConfig } from '../AgentSelectorDialog';

// Architecture icons
const ARCH_ICONS: Record<AgentArchitectureType, React.ElementType> = {
  single: Bot,
  agentic: Brain,
  a2a: Network,
};

interface AgentArchitectureDropdownProps {
  selectedArchitecture: AgentArchitectureType;
  onArchitectureChange: (arch: AgentArchitectureType) => void;
  selectedAgents: string[];
  onSelectedAgentsChange: (agents: string[]) => void;
  agentModelConfigs: AgentModelConfig[];
  onAgentModelConfigsChange: (configs: AgentModelConfig[]) => void;
  className?: string;
}

export function AgentArchitectureDropdown({
  selectedArchitecture,
  onArchitectureChange,
  selectedAgents,
  onSelectedAgentsChange,
  agentModelConfigs,
  onAgentModelConfigsChange,
  className,
}: AgentArchitectureDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const archInfo = ARCHITECTURE_TYPE_INFO[selectedArchitecture];
  const ArchIcon = ARCH_ICONS[selectedArchitecture];

  // Get agents filtered by architecture
  const getAgentsByArchitecture = (archType: AgentArchitectureType) => {
    return Object.entries(AGENT_CATALOG).filter(
      ([_, agent]) => agent.architectureType === archType
    );
  };

  const handleArchitectureSelect = (archType: AgentArchitectureType) => {
    onArchitectureChange(archType);
    const agentsForArch = getAgentsByArchitecture(archType).map(([key]) => key);
    onSelectedAgentsChange(agentsForArch);
  };

  const handleAgentToggle = (agentKey: string) => {
    if (selectedAgents.includes(agentKey)) {
      onSelectedAgentsChange(selectedAgents.filter(a => a !== agentKey));
    } else {
      onSelectedAgentsChange([...selectedAgents, agentKey]);
    }
  };

  const handleAgentModelChange = (agentKey: string, model: string) => {
    const existing = agentModelConfigs.find(c => c.agentKey === agentKey);
    if (existing) {
      onAgentModelConfigsChange(
        agentModelConfigs.map(c =>
          c.agentKey === agentKey ? { ...c, model } : c
        )
      );
    } else {
      onAgentModelConfigsChange([
        ...agentModelConfigs,
        { agentKey, model, enabled: true },
      ]);
    }
  };

  const getAgentModel = (agentKey: string) => {
    const config = agentModelConfigs.find(c => c.agentKey === agentKey);
    const agent = AGENT_CATALOG[agentKey as keyof typeof AGENT_CATALOG];
    return config?.model || agent?.defaultModel || 'gemini-2.5-pro';
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
            <ArchIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{archInfo.label}</span>
            <Badge variant="secondary" className="text-[10px]">
              {selectedAgents.length} agents
            </Badge>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0 z-50 bg-popover border shadow-lg"
        align="start"
        sideOffset={4}
      >
        <div className="p-3 border-b">
          <span className="text-sm font-medium">Agent Architecture</span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how AI agents collaborate
          </p>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2 space-y-3">
            {/* Architecture Selection */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground px-1">
                Architecture Type
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ARCHITECTURE_TYPE_INFO) as AgentArchitectureType[]).map(
                  archType => {
                    const info = ARCHITECTURE_TYPE_INFO[archType];
                    const Icon = ARCH_ICONS[archType];
                    const isSelected = selectedArchitecture === archType;
                    const agentCount = getAgentsByArchitecture(archType).length;

                    return (
                      <button
                        key={archType}
                        onClick={() => handleArchitectureSelect(archType)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                          {isSelected && <Check className="h-3 w-3 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs font-medium truncate">{info.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {agentCount} agents
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Architecture Description */}
            <div className="px-1">
              <p className="text-xs text-muted-foreground">{archInfo.description}</p>
            </div>

            {/* Agent List */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground px-1">
                Configure Agents
              </Label>
              <div className="space-y-1">
                {Object.entries(AGENT_CATALOG).map(([key, agent]) => {
                  const isSelected = selectedAgents.includes(key);
                  const isExpanded = expandedAgent === key;
                  const agentArchInfo = ARCHITECTURE_TYPE_INFO[agent.architectureType];

                  return (
                    <div
                      key={key}
                      className={cn(
                        'rounded-lg border transition-all overflow-hidden',
                        isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-2 p-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleAgentToggle(key)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            <Badge
                              variant="outline"
                              className={cn('text-[9px] px-1', agentArchInfo.color)}
                            >
                              {agent.architectureType}
                            </Badge>
                            {agent.supportsStreaming && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 text-green-600 border-green-500/30"
                              >
                                <Zap className="h-2 w-2 mr-0.5" />
                                Stream
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {agent.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() =>
                              setExpandedAgent(isExpanded ? null : key)
                            }
                          >
                            <Settings2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Agent Model Config */}
                      {isSelected && isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-muted-foreground shrink-0">
                              MODEL:
                            </Label>
                            <Select
                              value={getAgentModel(key)}
                              onValueChange={val => handleAgentModelChange(key, val)}
                            >
                              <SelectTrigger className="h-7 text-xs flex-1 bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border shadow-lg z-[60]">
                                {AI_MODEL_OPTIONS.map(opt => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    <span className="text-xs">{opt.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Summary Footer */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <ArchIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{archInfo.label}</span>
            <Badge variant="secondary" className="ml-auto">
              {selectedAgents.length} active
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
