import React from 'react';
import { Brain, Zap, Eye, Wrench } from 'lucide-react';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/multi-select-dropdown';
import { SelectedModelConfig } from '@/components/ai';

interface GenieModelDropdownProps {
  selectedModels: SelectedModelConfig[];
  onModelsChange: (models: SelectedModelConfig[]) => void;
  mode: 'single' | 'multi' | 'system';
  maxSelections?: number;
}

export const GenieModelDropdown: React.FC<GenieModelDropdownProps> = ({
  selectedModels,
  onModelsChange,
  mode,
  maxSelections = 6
}) => {
  
  const modelOptions: MultiSelectOption[] = [
    // LLM Models
    {
      id: 'gpt-5-2025-08-07',
      label: 'GPT-5 (2025)',
      value: 'gpt-5-2025-08-07',
      category: 'LLM',
      description: 'Latest flagship model from OpenAI',
      icon: <Brain className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'gpt-4.1-2025-04-14',
      label: 'GPT-4.1',
      value: 'gpt-4.1-2025-04-14',
      category: 'LLM',
      description: 'Reliable flagship GPT-4 model',
      icon: <Brain className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'claude-opus-4-1-20250805',
      label: 'Claude Opus 4.1',
      value: 'claude-opus-4-1-20250805',
      category: 'LLM',
      description: 'Most capable Claude model',
      icon: <Brain className="h-4 w-4 text-orange-600" />
    },
    {
      id: 'claude-sonnet-4-20250514',
      label: 'Claude Sonnet 4',
      value: 'claude-sonnet-4-20250514',
      category: 'LLM',
      description: 'Balanced performance and speed',
      icon: <Brain className="h-4 w-4 text-orange-600" />
    },
    {
      id: 'gemini-pro',
      label: 'Gemini Pro',
      value: 'gemini-pro',
      category: 'LLM',
      description: 'Google\'s advanced language model',
      icon: <Brain className="h-4 w-4 text-green-600" />
    },

    // Small Language Models
    {
      id: 'gpt-5-mini-2025-08-07',
      label: 'GPT-5 Mini',
      value: 'gpt-5-mini-2025-08-07',
      category: 'Small',
      description: 'Faster, cost-efficient GPT-5',
      icon: <Zap className="h-4 w-4 text-blue-500" />
    },
    {
      id: 'gpt-5-nano-2025-08-07',
      label: 'GPT-5 Nano',
      value: 'gpt-5-nano-2025-08-07',
      category: 'Small',
      description: 'Fastest, cheapest GPT-5 variant',
      icon: <Zap className="h-4 w-4 text-blue-400" />
    },
    {
      id: 'claude-3-5-haiku-20241022',
      label: 'Claude Haiku 3.5',
      value: 'claude-3-5-haiku-20241022',
      category: 'Small',
      description: 'Fast and efficient Claude model',
      icon: <Zap className="h-4 w-4 text-orange-500" />
    },
    {
      id: 'gpt-4o-mini',
      label: 'GPT-4o Mini',
      value: 'gpt-4o-mini',
      category: 'Small',
      description: 'Fast and cheap with vision',
      icon: <Zap className="h-4 w-4 text-blue-400" />
    },

    // Vision Models
    {
      id: 'gpt-4o',
      label: 'GPT-4o Vision',
      value: 'gpt-4o',
      category: 'Vision',
      description: 'Advanced vision and image analysis',
      icon: <Eye className="h-4 w-4 text-purple-600" />
    },
    {
      id: 'claude-opus-vision',
      label: 'Claude Opus Vision',
      value: 'claude-opus-4-1-20250805',
      category: 'Vision',
      description: 'Claude with vision capabilities',
      icon: <Eye className="h-4 w-4 text-purple-600" />
    },
    {
      id: 'gemini-pro-vision',
      label: 'Gemini Pro Vision',
      value: 'gemini-pro-vision',
      category: 'Vision',
      description: 'Multimodal Gemini with vision',
      icon: <Eye className="h-4 w-4 text-purple-600" />
    },

    // Reasoning Models
    {
      id: 'o3-2025-04-16',
      label: 'O3 Reasoning',
      value: 'o3-2025-04-16',
      category: 'Reasoning',
      description: 'Powerful multi-step reasoning',
      icon: <Brain className="h-4 w-4 text-indigo-600" />
    },
    {
      id: 'o4-mini-2025-04-16',
      label: 'O4 Mini Reasoning',
      value: 'o4-mini-2025-04-16',
      category: 'Reasoning',
      description: 'Fast reasoning for coding',
      icon: <Brain className="h-4 w-4 text-indigo-500" />
    }
  ];

  const mcpToolOptions: MultiSelectOption[] = [
    {
      id: 'filesystem',
      label: 'File System',
      value: 'filesystem',
      category: 'MCP Tools',
      description: 'File operations and management',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'memory',
      label: 'Memory',
      value: 'memory',
      category: 'MCP Tools',
      description: 'Context and memory management',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'web-search',
      label: 'Web Search',
      value: 'web-search',
      category: 'MCP Tools',
      description: 'Real-time web information',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'database',
      label: 'Database',
      value: 'database',
      category: 'MCP Tools',
      description: 'Database operations',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'api-client',
      label: 'API Client',
      value: 'api-client',
      category: 'MCP Tools',
      description: 'External API integration',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'document-processor',
      label: 'Document Processor',
      value: 'document-processor',
      category: 'MCP Tools',
      description: 'Document analysis and processing',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'image-analyzer',
      label: 'Image Analyzer',
      value: 'image-analyzer',
      category: 'MCP Tools',
      description: 'Advanced image analysis',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'code-executor',
      label: 'Code Executor',
      value: 'code-executor',
      category: 'MCP Tools',
      description: 'Safe code execution environment',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    },
    {
      id: 'calculator',
      label: 'Calculator',
      value: 'calculator',
      category: 'MCP Tools',
      description: 'Mathematical calculations',
      icon: <Wrench className="h-4 w-4 text-gray-600" />
    }
  ];

  const allOptions = [...modelOptions, ...mcpToolOptions];

  const selectedValues = selectedModels.map(model => model.model);

  const handleSelectionChange = (newValues: string[]) => {
    const newModels: SelectedModelConfig[] = newValues.map((value, index) => {
      const option = allOptions.find(opt => opt.value === value);
      if (!option) return null;

      // Determine provider from model name
      let provider: 'openai' | 'claude' | 'gemini' = 'openai';
      if (value.includes('claude')) provider = 'claude';
      else if (value.includes('gemini')) provider = 'gemini';

      // Determine category
      let category: 'llm' | 'small' | 'vision' | 'reasoning' | 'mcp' = 'llm';
      if (option.category === 'Small') category = 'small';
      else if (option.category === 'Vision') category = 'vision';
      else if (option.category === 'Reasoning') category = 'reasoning';
      else if (option.category === 'MCP Tools') category = 'mcp';

      return {
        provider,
        model: value,
        category,
        name: option.label,
        role: index === 0 ? 'primary' : 'secondary',
        weight: index === 0 ? 0.6 : 0.4
      } as SelectedModelConfig;
    }).filter(Boolean) as SelectedModelConfig[];

    onModelsChange(newModels);
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'single':
        return 'Select one model...';
      case 'multi':
        return 'Select multiple models across categories...';
      case 'system':
        return 'Select system models and tools...';
      default:
        return 'Select models...';
    }
  };

  const getMaxSelections = () => {
    if (mode === 'single') return 1;
    return maxSelections;
  };

  return (
    <MultiSelectDropdown
      options={allOptions}
      selectedValues={selectedValues}
      onSelectionChange={handleSelectionChange}
      placeholder={getPlaceholder()}
      maxSelections={getMaxSelections()}
      groupByCategory={true}
      searchable={true}
      className="w-full"
    />
  );
};