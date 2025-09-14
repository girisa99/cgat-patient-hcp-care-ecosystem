import React from 'react';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';

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
  // Determine enabled features based on mode and selections
  const enabledFeatures: string[] = [];
  if (selectedModels.some(m => m.category === 'vision')) enabledFeatures.push('vision');
  if (mode === 'system' || mode === 'multi') enabledFeatures.push('medical', 'tools');

  return (
    <UniversalModelSelector
      onModelsSelect={onModelsChange}
      selectedModels={selectedModels}
      mode={mode === 'single' ? 'single' : 'multi'}
      enabledFeatures={enabledFeatures}
      allowModeSwitch={mode !== 'single'}
      defaultSelectionMode={mode === 'single' ? 'single' : 'cross-category'}
      maxSelections={maxSelections}
    />
  );
};