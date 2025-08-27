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
import { useAIModelManager } from '@/hooks/useAIModelManager';

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
  // All hooks must be declared before any conditional returns
  const [nodeEvaluation, setNodeEvaluation] = useState<NodeEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<Record<string, any>>({});
  const { aiModels, modelIntegrations } = useAIModelManager();

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
        const inferredProvider = (() => {
          const explicit = String(node.data?.provider || '').trim();
          if (explicit) return explicit;
          const tk = String((node.data as any)?.type_key || node.type || '').toLowerCase();
          if (tk.includes('openai') || tk.includes('gpt')) return 'OpenAI';
          if (tk.includes('anthropic') || tk.includes('claude')) return 'Anthropic';
          if (tk.includes('llama') || tk.includes('meta')) return 'Meta';
          if (tk.includes('gemini') || tk.includes('google')) return 'Google';
          if (tk.includes('azure')) return 'Azure';
          if (tk.includes('cohere')) return 'Cohere';
          if (tk.includes('mistral')) return 'Mistral';
          return 'Unknown';
        })();
        const logoUrl = NodeRequirementEvaluator.getProviderLogo(inferredProvider);
        
        return (
          <div key={req.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt={String(inferredProvider)} className="w-5 h-5" onError={(e) => {
                (e.target as HTMLImageElement).src = '/logos/default-ai.svg';
              }} />
              <Label className={isMissing ? 'text-red-500' : ''}>{req.label}</Label>
              {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
            </div>
            <Select value={currentValue || ''} onValueChange={(value) => updateConfig(req.field, value)}>
              <SelectTrigger className={isMissing ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${req.label}`} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover text-popover-foreground">
                {getModelOptions(String(inferredProvider)).map(option => (
                  <SelectItem key={option.value} value={option.value} disabled={option.value === '__none__'}>
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

      case 'top_p':
        return (
          <div key={req.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{req.label}</Label>
              <span className="text-sm text-muted-foreground">{currentValue ?? req.defaultValue ?? 0.9}</span>
            </div>
            <Slider
              value={[currentValue ?? req.defaultValue ?? 0.9]}
              onValueChange={(value) => updateConfig(req.field, value[0])}
              max={1}
              min={0}
              step={0.05}
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
              placeholder={`function(input) {\n  // Your code here\n  return output;\n}`}
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
    const p = String(provider || '').toLowerCase();
    const aliasMap: Record<string, string[]> = {
      openai: ['openai', 'gpt'],
      anthropic: ['anthropic', 'claude'],
      meta: ['meta', 'llama', 'llama3', 'llama-3', 'llama 3', 'meta ai'],
      google: ['google', 'gemini'],
      azure: ['azure', 'microsoft', 'azure openai', 'azure-openai'],
      cohere: ['cohere'],
      mistral: ['mistral'],
    };

    const norm = (s?: string) => String(s || '').toLowerCase();

    // If no models, show a helpful message
    if (!aiModels || aiModels.length === 0) {
      return [{ value: '__none__', label: 'No active AI models found' }];
    }

    // If provider unknown, show all models to avoid an empty list
    if (!p || p === 'unknown') {
      return aiModels.map(m => ({ value: m.model_id, label: m.name || m.model_id }));
    }

    const candidates = new Set([p, ...(aliasMap[p] || [])]);

    // Primary: match by provider aliases
    let options = aiModels
      .filter(m => {
        const prov = norm(m.provider);
        return prov && Array.from(candidates).some(c => prov.includes(c));
      })
      .map(m => ({ value: m.model_id, label: m.name || m.model_id }));

    // Fallback: fuzzy match by model_id
    if (!options.length) {
      options = aiModels
        .filter(m => {
          const id = norm(m.model_id);
          return Array.from(candidates).some(c => c && id.includes(c));
        })
        .map(m => ({ value: m.model_id, label: m.name || m.model_id }));
    }

    // Final fallback: return all models
    if (!options.length) {
      return aiModels.map(m => ({ value: m.model_id, label: m.name || m.model_id }));
    }

    return options;
  };
  const categories = ['credentials', 'input_schema', 'functions', 'variables', 'advanced'];
  const availableCategories = categories.filter(cat => 
    nodeEvaluation.requirements.some(req => req.category === cat)
  );
  const resolvedActiveTab = availableCategories.includes(activeTab) ? activeTab : (availableCategories[0] || 'credentials');

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
        <Tabs value={resolvedActiveTab} onValueChange={setActiveTab}>
          <TabsList level="child" className="sticky top-0 z-50 grid w-full grid-cols-5 h-auto p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b relative">
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
                  level="child"
                  className="flex items-center gap-1 text-xs hover:scale-100 data-[state=active]:scale-100"
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