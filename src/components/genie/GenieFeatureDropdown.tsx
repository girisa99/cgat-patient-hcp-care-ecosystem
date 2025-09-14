import React from 'react';
import { Database, FileText, Microscope, Wrench, Eye, Globe } from 'lucide-react';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/multi-select-dropdown';

interface GenieFeatureDropdownProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
}

export const GenieFeatureDropdown: React.FC<GenieFeatureDropdownProps> = ({
  selectedFeatures,
  onFeaturesChange
}) => {
  
  const featureOptions: MultiSelectOption[] = [
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      value: 'knowledge',
      category: 'Data Sources',
      description: 'Access to curated knowledge repositories',
      icon: <Database className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'rag',
      label: 'RAG Search',
      value: 'rag',
      category: 'Data Sources',
      description: 'Retrieval-Augmented Generation capabilities',
      icon: <FileText className="h-4 w-4 text-green-600" />
    },
    {
      id: 'web',
      label: 'Web Search',
      value: 'web',
      category: 'Data Sources',
      description: 'Real-time web information retrieval',
      icon: <Globe className="h-4 w-4 text-purple-600" />
    },
    {
      id: 'medical',
      label: 'Medical Context',
      value: 'medical',
      category: 'Specialized',
      description: 'Healthcare and medical expertise',
      icon: <Microscope className="h-4 w-4 text-red-600" />
    },
    {
      id: 'tools',
      label: 'MCP Tools',
      value: 'tools',
      category: 'Integration',
      description: 'Model Context Protocol tool integration',
      icon: <Wrench className="h-4 w-4 text-orange-600" />
    },
    {
      id: 'vision',
      label: 'Vision Analysis',
      value: 'vision',
      category: 'Processing',
      description: 'Image and document processing',
      icon: <Eye className="h-4 w-4 text-indigo-600" />
    }
  ];

  return (
    <MultiSelectDropdown
      options={featureOptions}
      selectedValues={selectedFeatures}
      onSelectionChange={onFeaturesChange}
      placeholder="Select features to enable..."
      groupByCategory={true}
      searchable={true}
      className="w-full"
    />
  );
};