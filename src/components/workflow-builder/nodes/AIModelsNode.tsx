import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Bot, Settings, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const AIModelsNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    model: data.model || 'gpt-4o',
    temperature: data.temperature || [0.7],
    max_tokens: data.max_tokens || 1000,
    top_p: data.top_p || [1.0],
    frequency_penalty: data.frequency_penalty || [0.0],
    presence_penalty: data.presence_penalty || [0.0]
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof data?.configOpen !== 'undefined') {
      setIsExpanded(!!data.configOpen);
    }
  }, [data?.configOpen]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig({ ...config, ...updates });
  };

  const models = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
  ];

  const handleToggleConfig = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Bot}
      title={data.label || "AI Agent"}
      className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 min-w-[200px]"
    >
      <div className="space-y-2">
        {/* Inline Model Display - Always Visible */}
        <div className="flex items-center gap-2 bg-white/80 rounded px-2 py-1">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <Bot className="h-3 w-3 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{config.model}</div>
            <div className="text-[10px] text-muted-foreground">T:{config.temperature[0]} | {config.max_tokens} tokens</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] px-1">
            {data.status || 'Ready'}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleConfig}
            className="h-6 px-2 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            {isExpanded ? 'Close' : 'Config'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              Temperature: {config.temperature[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              Max Tokens: {config.max_tokens}
            </div>
          </div>
        )}

        {isExpanded && (
          <TooltipProvider>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-xs">Model</Label>
                <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Temperature: {config.temperature[0]}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Controls creativity: lower = precise, higher = creative.</TooltipContent>
                  </Tooltip>
                </div>
                <Slider
                  value={config.temperature}
                  onValueChange={(value) => updateConfig({ temperature: value })}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Max Tokens</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Maximum length of the response.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={config.max_tokens}
                  onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) || 0 })}
                  className="h-6 text-xs"
                  min={1}
                  max={4000}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Top P: {config.top_p[0]}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Samples from most likely tokens only (nucleus sampling).</TooltipContent>
                  </Tooltip>
                </div>
                <Slider
                  value={config.top_p}
                  onValueChange={(value) => updateConfig({ top_p: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Frequency Penalty: {config.frequency_penalty[0]}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Reduces repeated phrases in output.</TooltipContent>
                  </Tooltip>
                </div>
                <Slider
                  value={config.frequency_penalty}
                  onValueChange={(value) => updateConfig({ frequency_penalty: value })}
                  max={2}
                  min={-2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Presence Penalty: {config.presence_penalty?.[0] ?? 0}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Encourages mentioning new topics.</TooltipContent>
                  </Tooltip>
                </div>
                <Slider
                  value={config.presence_penalty || [0]}
                  onValueChange={(value) => updateConfig({ presence_penalty: value })}
                  max={2}
                  min={-2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </TooltipProvider>
        )}
      </div>
    </BaseWorkflowNode>
  );
};