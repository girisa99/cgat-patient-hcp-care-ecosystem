import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  Bot, 
  Brain, 
  Zap, 
  Target, 
  Settings, 
  MessageSquare,
  Code,
  Image,
  Mic,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'language' | 'vision' | 'multimodal' | 'code' | 'speech';
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPer1kTokens: number;
  responseTime: string;
  availability: 'available' | 'limited' | 'beta';
  icon: React.ComponentType<any>;
}

const aiModels: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'language',
    description: 'Most capable GPT-4 model with improved instruction following',
    capabilities: ['Text Generation', 'Analysis', 'Code Generation', 'Reasoning'],
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    responseTime: '2-5s',
    availability: 'available',
    icon: Bot
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'language',
    description: 'Most intelligent Claude model for complex reasoning tasks',
    capabilities: ['Complex Reasoning', 'Analysis', 'Writing', 'Code Review'],
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    responseTime: '3-6s',
    availability: 'available',
    icon: Brain
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    type: 'multimodal',
    description: 'Google\'s advanced multimodal AI model',
    capabilities: ['Text Generation', 'Vision', 'Code Generation', 'Multimodal'],
    maxTokens: 30000,
    costPer1kTokens: 0.005,
    responseTime: '1-3s',
    availability: 'available',
    icon: Target
  },
  {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision',
    provider: 'OpenAI',
    type: 'vision',
    description: 'GPT-4 with vision capabilities for image analysis',
    capabilities: ['Text Generation', 'Image Analysis', 'Visual Reasoning'],
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    responseTime: '3-7s',
    availability: 'available',
    icon: Image
  },
  {
    id: 'codellama-70b',
    name: 'Code Llama 70B',
    provider: 'Meta',
    type: 'code',
    description: 'Specialized model for code generation and programming tasks',
    capabilities: ['Code Generation', 'Code Completion', 'Debugging', 'Code Review'],
    maxTokens: 4096,
    costPer1kTokens: 0.003,
    responseTime: '2-4s',
    availability: 'available',
    icon: Code
  },
  {
    id: 'whisper-large',
    name: 'Whisper Large',
    provider: 'OpenAI',
    type: 'speech',
    description: 'Advanced speech recognition and transcription model',
    capabilities: ['Speech Recognition', 'Transcription', 'Translation'],
    maxTokens: 448,
    costPer1kTokens: 0.006,
    responseTime: '1-2s',
    availability: 'available',
    icon: Mic
  }
];

interface AIModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: AIModel, config: any) => void;
  selectedModels?: string[];
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedModels = []
}) => {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    useStreaming: true,
    enableFunctionCalling: false,
    apiKey: '',
    customEndpoint: ''
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [isConfiguring, setIsConfiguring] = useState(false);

  const filteredModels = filterType === 'all' 
    ? aiModels 
    : aiModels.filter(model => model.type === filterType);

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    setModelConfig(prev => ({
      ...prev,
      maxTokens: Math.min(prev.maxTokens, model.maxTokens)
    }));
  };

  const handleConfigure = () => {
    if (!selectedModel) return;
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = () => {
    if (!selectedModel) return;
    
    if (!modelConfig.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to configure this model.",
        variant: "destructive"
      });
      return;
    }

    onSelect(selectedModel, modelConfig);
    
    toast({
      title: "Model Configured",
      description: `${selectedModel.name} has been configured and added to your agent.`,
    });
    
    setIsConfiguring(false);
    setSelectedModel(null);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'language': return <MessageSquare className="h-4 w-4" />;
      case 'vision': return <Image className="h-4 w-4" />;
      case 'multimodal': return <Target className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'speech': return <Mic className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Select AI Model
          </DialogTitle>
          <DialogDescription>
            Choose and configure AI models for your agent
          </DialogDescription>
        </DialogHeader>

        {!isConfiguring ? (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <Label>Filter by type:</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="language">Language Models</SelectItem>
                  <SelectItem value="vision">Vision Models</SelectItem>
                  <SelectItem value="multimodal">Multimodal</SelectItem>
                  <SelectItem value="code">Code Models</SelectItem>
                  <SelectItem value="speech">Speech Models</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredModels.map((model) => {
                const IconComponent = model.icon;
                      const isSelected = selectedModel?.id === model.id;
                const isAlreadyAdded = selectedModels.includes(model.id);
                
                return (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    } ${isAlreadyAdded ? 'opacity-50' : ''}`}
                    onClick={() => !isAlreadyAdded && handleModelSelect(model)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-sm">{model.name}</CardTitle>
                            <div className="text-xs text-muted-foreground">{model.provider}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(model.type)}
                          <Badge className={getAvailabilityColor(model.availability)}>
                            {model.availability}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CardDescription className="text-xs">
                        {model.description}
                      </CardDescription>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Max Tokens:</span>
                          <div className="font-medium">{model.maxTokens.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <div className="font-medium">${model.costPer1kTokens}/1k</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Response:</span>
                          <div className="font-medium">{model.responseTime}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium capitalize">{model.type}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Capabilities:</div>
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.slice(0, 3).map((cap, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {model.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{model.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {isAlreadyAdded && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Already added
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {selectedModel && <selectedModel.icon className="h-5 w-5" />}
              <div>
                <div className="font-medium">{selectedModel?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedModel?.provider}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={modelConfig.temperature}
                  onChange={(e) => setModelConfig({...modelConfig, temperature: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max={selectedModel?.maxTokens || 4000}
                  value={modelConfig.maxTokens}
                  onChange={(e) => setModelConfig({...modelConfig, maxTokens: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="topP">Top P</Label>
                <Input
                  id="topP"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={modelConfig.topP}
                  onChange={(e) => setModelConfig({...modelConfig, topP: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                <Input
                  id="frequencyPenalty"
                  type="number"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelConfig.frequencyPenalty}
                  onChange={(e) => setModelConfig({...modelConfig, frequencyPenalty: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={modelConfig.apiKey}
                onChange={(e) => setModelConfig({...modelConfig, apiKey: e.target.value})}
                placeholder="Enter your API key"
              />
            </div>
            
            <div>
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={modelConfig.systemPrompt}
                onChange={(e) => setModelConfig({...modelConfig, systemPrompt: e.target.value})}
                placeholder="Enter system prompt to guide model behavior..."
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="streaming">Enable Streaming</Label>
                <Switch
                  id="streaming"
                  checked={modelConfig.useStreaming}
                  onCheckedChange={(checked) => setModelConfig({...modelConfig, useStreaming: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="functionCalling">Enable Function Calling</Label>
                <Switch
                  id="functionCalling"
                  checked={modelConfig.enableFunctionCalling}
                  onCheckedChange={(checked) => setModelConfig({...modelConfig, enableFunctionCalling: checked})}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isConfiguring ? (
            <Button 
              onClick={handleConfigure}
              disabled={!selectedModel}
            >
              Configure Model
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Back
              </Button>
              <Button onClick={handleSaveConfiguration}>
                Add Model
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};