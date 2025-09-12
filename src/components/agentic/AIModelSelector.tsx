import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';

interface AIModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: any, config?: any) => void;
  selectedModels?: string[];
  enabledFeatures?: string[];
  mode?: 'single' | 'multi' | 'system';
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedModels = [],
  enabledFeatures = [],
  mode = 'single'
}) => {
  const handleModelsSelect = (models: SelectedModelConfig[]) => {
    // Maintain backward compatibility with the old interface
    if (models.length > 0) {
      const primaryModel = models.find(m => m.role === 'primary') || models[0];
      onSelect({
        id: primaryModel.model,
        name: primaryModel.name,
        provider: primaryModel.provider,
        category: primaryModel.category,
        type: primaryModel.category === 'llm' ? 'language' : 
              primaryModel.category === 'vision' ? 'vision' : 
              primaryModel.category === 'small' ? 'language' : 'multimodal',
        description: `${primaryModel.provider} ${primaryModel.category} model`,
        capabilities: ['text-generation', 'chat'],
        maxTokens: 4000,
        costPer1kTokens: 0.01,
        responseTime: '2-5s',
        availability: 'available'
      }, {
        role: primaryModel.role,
        weight: primaryModel.weight,
        allModels: models,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        useStreaming: true,
        enableFunctionCalling: primaryModel.category === 'mcp'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>AI Model Configuration</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <UniversalModelSelector
            onModelsSelect={handleModelsSelect}
            selectedModels={[]}
            mode={mode}
            enabledFeatures={enabledFeatures}
            allowModeSwitch={true}
            maxSelections={mode === 'single' ? 1 : 6}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};