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
  const [currentModels, setCurrentModels] = useState<SelectedModelConfig[]>([]);

  const handleModelsSelect = (models: SelectedModelConfig[]) => {
    setCurrentModels(models);
    
    // Maintain backward compatibility with the old interface
    // Convert SelectedModelConfig back to the expected format
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