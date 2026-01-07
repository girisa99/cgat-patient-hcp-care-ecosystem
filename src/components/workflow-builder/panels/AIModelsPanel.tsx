import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Brain, Eye, MessageSquare, Code, Zap, Settings, 
  Plus, Play, Pause, Trash2, Edit, Star, Shield
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AIModelsPanelProps {
  onModelCreate?: (model: any) => void;
  onModelUpdate?: (model: any) => void;
}

export const AIModelsPanel: React.FC<AIModelsPanelProps> = ({
  onModelCreate,
  onModelUpdate
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [activeTab, setActiveTab] = useState('llm');

  const llmModels = [
    {
      id: 'gpt-5',
      name: 'GPT-5',
      provider: 'OpenAI',
      type: 'LLM',
      status: 'active',
      capabilities: ['Text Generation', 'Reasoning', 'Code'],
      pricing: '$0.03/1K tokens',
      performance: 95,
      latency: '2.1s avg',
      description: 'Most capable model for complex healthcare reasoning'
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      type: 'LLM',
      status: 'active',
      capabilities: ['Analysis', 'Writing', 'Safety'],
      pricing: '$0.015/1K tokens',
      performance: 92,
      latency: '1.8s avg',
      description: 'Excellent for detailed medical documentation and analysis'
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      provider: 'OpenAI',
      type: 'LLM',
      status: 'inactive',
      capabilities: ['Fast Processing', 'Cost Effective'],
      pricing: '$0.0015/1K tokens',
      performance: 78,
      latency: '0.6s avg',
      description: 'Efficient model for routine tasks and quick responses'
    }
  ];

  const vlmModels = [
    {
      id: 'gpt-5-vision',
      name: 'GPT-5 Vision',
      provider: 'OpenAI',
      type: 'VLM',
      status: 'active',
      capabilities: ['Image Analysis', 'OCR', 'Document Processing'],
      pricing: '$0.01/image',
      performance: 89,
      latency: '3.2s avg',
      description: 'Advanced vision model for medical imaging and document analysis'
    },
    {
      id: 'claude-4-vision',
      name: 'Claude 4 Vision',
      provider: 'Anthropic',
      type: 'VLM',
      status: 'active',
      capabilities: ['Chart Reading', 'Form Processing', 'Safety Analysis'],
      pricing: '$0.008/image',
      performance: 85,
      latency: '2.8s avg',
      description: 'Reliable vision model with strong safety features'
    }
  ];

  const specializedModels = [
    {
      id: 'medical-nlp',
      name: 'Medical NLP Specialist',
      provider: 'Custom',
      type: 'Specialized',
      status: 'active',
      capabilities: ['Medical Terminology', 'ICD-10', 'Clinical Notes'],
      pricing: 'Enterprise',
      performance: 94,
      latency: '1.2s avg',
      description: 'Specialized model trained on medical terminology and procedures'
    },
    {
      id: 'hipaa-compliant',
      name: 'HIPAA Compliant Model',
      provider: 'Azure Health',
      type: 'Specialized',
      status: 'active',
      capabilities: ['PHI Protection', 'Compliance', 'Audit Trail'],
      pricing: 'Enterprise',
      performance: 88,
      latency: '2.0s avg',
      description: 'Healthcare-specific model with built-in HIPAA compliance'
    }
  ];

  const handleModelAction = (model: any, action: string) => {
    switch (action) {
      case 'activate':
        showSuccess(`${model.name} activated`);
        break;
      case 'deactivate':
        showSuccess(`${model.name} deactivated`);
        break;
      case 'configure':
        onModelUpdate?.(model);
        break;
      case 'delete':
        showSuccess(`${model.name} removed`);
        break;
      default:
        break;
    }
  };

  const renderModelList = (models: any[], category: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{category} Models</h4>
        <Button size="sm" onClick={() => onModelCreate?.({ type: category })}>
          <Plus className="h-3 w-3 mr-1" />
          Add Model
        </Button>
      </div>
      
      {models.map((model) => (
        <Card key={model.id} className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  model.status === 'active' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-900'
                }`}>
                  {model.type === 'LLM' && <Brain className={`h-4 w-4 ${
                    model.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />}
                  {model.type === 'VLM' && <Eye className={`h-4 w-4 ${
                    model.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />}
                  {model.type === 'Specialized' && <Shield className={`h-4 w-4 ${
                    model.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{model.name}</p>
                    <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
              </div>
              <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {model.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Performance:</span>
                  <span className="font-medium">{model.performance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="font-medium">{model.latency}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pricing:</span>
                  <span className="font-medium">{model.pricing}</span>
                </div>
                <div className="text-muted-foreground">
                  Capabilities:
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {model.capabilities.map((cap: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={model.status === 'active'} 
                  onCheckedChange={(checked) => 
                    handleModelAction(model, checked ? 'activate' : 'deactivate')
                  }
                />
                <Label className="text-xs">Active</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => handleModelAction(model, 'configure')}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleModelAction(model, 'delete')}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Models</span>
          <Badge variant="secondary" className="text-xs">Healthcare Ready</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Configure and manage AI models for different healthcare use cases.
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pb-2 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="llm" className="text-xs px-2 h-7">
                <Brain className="h-3 w-3 mr-1" />
                LLM
              </TabsTrigger>
              <TabsTrigger value="vlm" className="text-xs px-2 h-7">
                <Eye className="h-3 w-3 mr-1" />
                Vision
              </TabsTrigger>
              <TabsTrigger value="specialized" className="text-xs px-2 h-7">
                <Shield className="h-3 w-3 mr-1" />
                Medical
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="pb-4">
                <TabsContent value="llm" className="mt-0 space-y-4">
                  {renderModelList(llmModels, 'Large Language')}
                </TabsContent>

                <TabsContent value="vlm" className="mt-0 space-y-4">
                  {renderModelList(vlmModels, 'Vision Language')}
                </TabsContent>

                <TabsContent value="specialized" className="mt-0 space-y-4">
                  {renderModelList(specializedModels, 'Medical Specialized')}
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};