import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle2, Settings, Key, Code, Zap, X } from 'lucide-react';
import { NodeRequirementEvaluator, NodeEvaluation } from './nodes/NodeRequirementEvaluator';

interface SmartNodeConfiguratorProps {
  node: Node | null;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onClose: () => void;
}

export const SmartNodeConfigurator: React.FC<SmartNodeConfiguratorProps> = ({
  node,
  onNodeUpdate,
  onClose
}) => {
  const [nodeEvaluation, setNodeEvaluation] = useState<NodeEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      const evaluation = NodeRequirementEvaluator.evaluateNode(node);
      setNodeEvaluation(evaluation);
      setConfig(node.data || {});
      
      // Auto-select tab with missing requirements
      if (evaluation.missingRequired.length > 0) {
        const firstMissingCategory = evaluation.requirements.find(
          req => req.type === 'required' && !node.data?.[req.field]
        )?.category;
        if (firstMissingCategory) {
          setActiveTab(firstMissingCategory);
        }
      }
    }
  }, [node]);

  if (!node || !nodeEvaluation) {
    return null;
  }

  const updateConfig = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onNodeUpdate(node.id, newConfig);
  };

  const getTabIcon = (category: string) => {
    const icons = {
      credentials: Key,
      input_schema: Settings,
      functions: Code,
      variables: Zap,
      advanced: Settings
    };
    return icons[category as keyof typeof icons] || Settings;
  };

  const renderRequirementField = (req: any) => {
    const currentValue = config[req.field];
    const hasValue = currentValue !== undefined && currentValue !== null && currentValue !== '';
    const isRequired = req.type === 'required';
    const isMissing = isRequired && !hasValue;

    switch (req.field) {
      case 'model':
        // Special handling for AI model selection with provider logos
        const provider = String(node.data?.provider || 'Unknown');
        const logoUrl = NodeRequirementEvaluator.getProviderLogo(provider);
        
        return (
          <div key={req.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt={String(provider)} className="w-5 h-5" onError={(e) => {
                (e.target as HTMLImageElement).src = '/logos/default-ai.svg';
              }} />
              <Label className={isMissing ? 'text-red-500' : ''}>{req.label}</Label>
              {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
            </div>
            <Select value={currentValue || ''} onValueChange={(value) => updateConfig(req.field, value)}>
              <SelectTrigger className={isMissing ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${req.label}`} />
              </SelectTrigger>
              <SelectContent>
                {getModelOptions(String(provider)).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{req.description}</p>
          </div>
        );

      case 'temperature':
        return (
          <div key={req.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{req.label}</Label>
              <span className="text-sm text-muted-foreground">{currentValue || req.defaultValue || 0.7}</span>
            </div>
            <Slider
              value={[currentValue || req.defaultValue || 0.7]}
              onValueChange={(value) => updateConfig(req.field, value[0])}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">{req.description}</p>
          </div>
        );

      case 'function_code':
        return (
          <div key={req.id} className="space-y-2">
            <Label className={isMissing ? 'text-red-500' : ''}>{req.label}</Label>
            {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
            <Textarea
              value={currentValue || ''}
              onChange={(e) => updateConfig(req.field, e.target.value)}
              placeholder="function(input) {\n  // Your code here\n  return output;\n}"
              className={`font-mono text-sm ${isMissing ? 'border-red-500' : ''}`}
              rows={8}
            />
            <p className="text-sm text-muted-foreground">{req.description}</p>
          </div>
        );

      case 'max_tokens':
        return (
          <div key={req.id} className="space-y-2">
            <Label>{req.label}</Label>
            <Input
              type="number"
              value={currentValue || req.defaultValue || ''}
              onChange={(e) => updateConfig(req.field, parseInt(e.target.value))}
              placeholder={`Default: ${req.defaultValue || 1000}`}
            />
            <p className="text-sm text-muted-foreground">{req.description}</p>
          </div>
        );

      default:
        // Generic field handling
        if (req.field.includes('key') || req.field.includes('token') || req.field.includes('secret')) {
          return (
            <div key={req.id} className="space-y-2">
              <Label className={isMissing ? 'text-red-500' : ''}>{req.label}</Label>
              {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
              <Input
                type="password"
                value={currentValue || ''}
                onChange={(e) => updateConfig(req.field, e.target.value)}
                placeholder={`Enter ${req.label}`}
                className={isMissing ? 'border-red-500' : ''}
              />
              <p className="text-sm text-muted-foreground">{req.description}</p>
            </div>
          );
        }

        return (
          <div key={req.id} className="space-y-2">
            <Label className={isMissing ? 'text-red-500' : ''}>{req.label}</Label>
            {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
            <Input
              value={currentValue || ''}
              onChange={(e) => updateConfig(req.field, e.target.value)}
              placeholder={req.defaultValue ? `Default: ${req.defaultValue}` : `Enter ${req.label}`}
              className={isMissing ? 'border-red-500' : ''}
            />
            <p className="text-sm text-muted-foreground">{req.description}</p>
          </div>
        );
    }
  };

  const getModelOptions = (provider: string) => {
    const modelOptions: Record<string, Array<{value: string, label: string}>> = {
      'OpenAI': [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ],
      'Anthropic': [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
      ],
      'Google': [
        { value: 'gemini-pro', label: 'Gemini Pro' },
        { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
      ],
      'Meta': [
        { value: 'llama-3.2-3b', label: 'Llama 3.2 3B' },
        { value: 'llama-3.2-1b', label: 'Llama 3.2 1B' },
        { value: 'llama-3.1-8b', label: 'Llama 3.1 8B' }
      ]
    };
    return modelOptions[provider] || [{ value: 'default', label: 'Default Model' }];
  };

  const categories = ['credentials', 'input_schema', 'functions', 'variables', 'advanced'];
  const availableCategories = categories.filter(cat => 
    nodeEvaluation.requirements.some(req => req.category === cat)
  );

  return (
    <Card className="w-full h-full border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {nodeEvaluation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle className="text-lg">Configure {String(node.data?.display_name || node.data?.label || 'Node')}</CardTitle>
              </div>
              <Badge variant={nodeEvaluation.isValid ? "default" : "destructive"}>
                {nodeEvaluation.completeness}% Complete
              </Badge>
            </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {nodeEvaluation.missingRequired.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            Missing required: {nodeEvaluation.missingRequired.join(', ')}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          {availableCategories.map(category => {
            const Icon = getTabIcon(category);
            const categoryReqs = nodeEvaluation.requirements.filter(req => req.category === category);
            const missingCount = categoryReqs.filter(req => 
              req.type === 'required' && !config[req.field]
            ).length;
              
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {category.replace('_', ' ')}
                  {missingCount > 0 && (
                    <Badge variant="destructive" className="h-4 w-4 p-0 text-xs rounded-full">
                      {missingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {availableCategories.map(category => (
            <TabsContent key={category} value={category} className="p-4 space-y-4">
              <div className="space-y-4">
                {nodeEvaluation.requirements
                  .filter(req => req.category === category)
                  .map(renderRequirementField)}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {nodeEvaluation.suggestions.length > 0 && (
          <div className="p-4 border-t bg-blue-50/50">
            <h4 className="font-medium text-sm mb-2">Suggestions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {nodeEvaluation.suggestions.map((suggestion, idx) => (
                <li key={idx}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};