import React, { useState } from 'react';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';

interface PromptBasedModelSelectorProps {
  onModelSelect: (model: any) => void;
  selectedModels?: string[];
  enabledFeatures?: string[];
  mode?: 'single' | 'multi' | 'system';
}

export const PromptBasedModelSelector: React.FC<PromptBasedModelSelectorProps> = ({
  onModelSelect,
  selectedModels = [],
  enabledFeatures = [],
  mode = 'single'
}) => {
  const [currentModels, setCurrentModels] = useState<SelectedModelConfig[]>(
    // Convert legacy selectedModels to SelectedModelConfig if they're just strings
    selectedModels.map((model, index) => typeof model === 'string' ? {
      provider: (model.includes('claude') ? 'claude' : model.includes('gemini') ? 'gemini' : 'openai') as 'openai' | 'claude' | 'gemini',
      model,
      category: 'llm' as const,
      name: model,
      role: 'primary' as const,
      weight: 1.0
    } : model)
  );

  const handleModelsSelect = (models: SelectedModelConfig[]) => {
    setCurrentModels(models);
    
    // Maintain backward compatibility with the old interface
    if (models.length > 0) {
      const primaryModel = models.find(m => m.role === 'primary') || models[0];
      onModelSelect({
        id: primaryModel.model,
        name: primaryModel.name,
        provider: primaryModel.provider,
        category: primaryModel.category,
        // Include all selected models for advanced workflows
        allModels: models
      });
    }
  };

  return (
    <UniversalModelSelector
      onModelsSelect={handleModelsSelect}
      selectedModels={currentModels}
      mode={mode}
      enabledFeatures={enabledFeatures}
      allowModeSwitch={mode !== 'single'}
      defaultSelectionMode={mode === 'single' ? 'single' : 'cross-category'}
      maxSelections={mode === 'single' ? 1 : 6}
    />
  );
};