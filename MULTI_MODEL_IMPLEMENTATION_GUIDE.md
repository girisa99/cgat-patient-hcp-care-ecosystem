# Multi-Model Implementation Guide

## Overview
This guide explains how to implement the cross-category multi-model approach across all components in the application.

## Components That Need Updates

### 1. Agent Creation Wizard
**File**: `src/components/agentic/AgentCreationWizard.tsx`
**Current**: Uses `AIModelSelector`
**Update**: Replace with `UniversalModelSelector`

```tsx
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';

// Replace AIModelSelector with:
<UniversalModelSelector
  onModelsSelect={(models) => setSelectedAIModels(models)}
  selectedModels={selectedAIModels}
  mode="single"
  allowModeSwitch={true}
  maxSelections={4}
/>
```

### 2. Workflow Builder
**File**: `src/components/workflow-builder/PromptBasedModelSelector.tsx`
**Current**: Custom implementation
**Update**: Replace with `UniversalModelSelector`

### 3. Model Management Dashboard
**File**: `src/components/ModelManagement/ModelManagementDashboard.tsx`
**Current**: Uses custom `ModelSelector`
**Update**: Add cross-category option

### 4. Enhanced Agent Canvas
**File**: `src/components/agentic/EnhancedAgentCanvas.tsx`
**Current**: Multiple different selectors
**Update**: Standardize with `UniversalModelSelector`

## Implementation Steps

### Step 1: Import Universal Components
```tsx
import { 
  UniversalModelSelector, 
  SelectedModelConfig,
  CrossCategoryModelSelector,
  MultiModelConversationInterface 
} from '@/components/ai';
```

### Step 2: Update State Management
```tsx
// Replace single model state
const [selectedModel, setSelectedModel] = useState<{provider: string, model: string}>();

// With multi-model state
const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>([]);
const [selectionMode, setSelectionMode] = useState<'single' | 'cross-category'>('single');
```

### Step 3: Handle Feature Integration
```tsx
const handleFeatureToggle = (featureId: string) => {
  // Auto-suggest optimized models for medical/publication features
  if (featureId === 'medical' && selectionMode === 'cross-category') {
    autoSuggestMedicalModels();
  }
};
```

## Universal Patterns

### For Agent Builders
```tsx
<UniversalModelSelector
  onModelsSelect={setSelectedModels}
  selectedModels={selectedModels}
  mode="single"
  enabledFeatures={enabledFeatures}
  allowModeSwitch={true}
/>
```

### For Conversation Interfaces
```tsx
<UniversalModelSelector
  onModelsSelect={setSelectedModels}
  selectedModels={selectedModels}
  mode="multi"
  enabledFeatures={['medical', 'publication']}
  maxSelections={6}
/>
```

### For System Configuration
```tsx
<UniversalModelSelector
  onModelsSelect={setSelectedModels}
  selectedModels={selectedModels}
  mode="system"
  defaultSelectionMode="cross-category"
  allowModeSwitch={false}
/>
```

## Feature Integration Patterns

### Medical Feature
- Automatically suggests medical-optimized models
- Includes vision models for medical imaging
- Adds specialized biomedical models

### Publication Feature  
- Suggests writing and research models
- Includes editing and structure optimization
- Adds content validation models

### Cross-Category Benefits
- **LLM**: Main reasoning and content generation
- **Small**: Fast classification and preprocessing  
- **Vision**: Image analysis and document processing
- **MCP**: External tool integration and data access

## Migration Checklist

- [ ] Update `AgentCreationWizard.tsx`
- [ ] Update `PromptBasedModelSelector.tsx`
- [ ] Update `ModelManagementDashboard.tsx`
- [ ] Update `EnhancedAgentCanvas.tsx`
- [ ] Update `AIModelSelector.tsx`
- [ ] Test medical feature integration
- [ ] Test publication feature integration
- [ ] Verify system mode functionality
- [ ] Test cross-component consistency

## Testing Strategy

1. **Single Model Selection**: Verify traditional single model selection works
2. **Cross-Category Selection**: Test multi-model selection across categories
3. **Feature Integration**: Test medical and publication auto-suggestions
4. **Component Consistency**: Ensure all components use same patterns
5. **Mode Switching**: Verify users can switch between traditional and cross-category

## Performance Considerations

- Lazy load cross-category components when not needed
- Cache model configurations per feature
- Optimize parallel model calls
- Implement intelligent response merging
- Monitor model selection preferences