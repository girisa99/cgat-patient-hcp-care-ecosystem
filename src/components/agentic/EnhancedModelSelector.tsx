import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Database, Code, FileText, Image, Eye, Zap,
  Clock, Calendar, Globe, Shield, Activity, Layers,
  Brain, Camera, Mic, FileImage, Tag, Target, CheckCircle,
  Plus, X, Bot, MessageSquare, Search
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'large' | 'small' | 'vision' | 'multimodal' | 'specialized';
  capabilities: string[];
  description: string;
  useCase: string;
  performanceRating: number;
  costEfficiency: number;
  specialization: string[];
  maxTokens?: number;
  supportedFormats?: string[];
  benchmarkScores?: {
    reasoning?: number;
    coding?: number;
    math?: number;
    vision?: number;
    speed?: number;
  };
}

interface LabelingStudioConfig {
  enabled: boolean;
  projectType: 'text_classification' | 'image_annotation' | 'medical_nlp' | 'document_analysis';
  dataTypes: string[];
  annotationSchema: any;
  qualityThreshold: number;
  expertReviewRequired: boolean;
}

interface EnhancedModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  actionCategory?: string;
  labelingConfig?: LabelingStudioConfig;
  onLabelingConfigChange?: (config: LabelingStudioConfig) => void;
}

// Enhanced AI Models including small and vision models
const ENHANCED_AI_MODELS: AIModel[] = [
  // Large Language Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    type: 'large',
    capabilities: ['reasoning', 'analysis', 'writing', 'coding'],
    description: 'Advanced reasoning and analysis for complex healthcare scenarios',
    useCase: 'Complex decision-making, clinical analysis, research synthesis',
    performanceRating: 9.5,
    costEfficiency: 8.0,
    specialization: ['healthcare', 'clinical reasoning', 'compliance'],
    maxTokens: 200000,
    benchmarkScores: {
      reasoning: 9.5,
      coding: 9.0,
      math: 8.8,
      speed: 8.0
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'multimodal',
    capabilities: ['multimodal', 'reasoning', 'vision', 'real-time'],
    description: 'Multimodal AI with vision capabilities for comprehensive analysis',
    useCase: 'Document analysis, image processing, real-time conversations',
    performanceRating: 9.0,
    costEfficiency: 7.5,
    specialization: ['multimodal', 'real-time', 'document analysis'],
    maxTokens: 128000,
    supportedFormats: ['text', 'image', 'audio'],
    benchmarkScores: {
      reasoning: 9.0,
      vision: 9.2,
      coding: 8.8,
      speed: 8.5
    }
  },
  
  // Small Language Models
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    type: 'small',
    capabilities: ['fast_inference', 'edge_deployment', 'basic_reasoning'],
    description: 'Lightweight model optimized for fast responses and edge deployment',
    useCase: 'Quick responses, real-time chat, mobile deployment',
    performanceRating: 7.5,
    costEfficiency: 9.8,
    specialization: ['speed', 'efficiency', 'edge_computing'],
    maxTokens: 8192,
    benchmarkScores: {
      reasoning: 7.0,
      speed: 9.8,
      coding: 6.5
    }
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    type: 'small',
    capabilities: ['efficiency', 'reasoning', 'medical_knowledge'],
    description: 'Compact model with strong reasoning capabilities for healthcare',
    useCase: 'Medical Q&A, clinical decision support, patient education',
    performanceRating: 8.0,
    costEfficiency: 9.5,
    specialization: ['medical', 'efficiency', 'reasoning'],
    maxTokens: 4096,
    benchmarkScores: {
      reasoning: 8.2,
      math: 7.8,
      speed: 9.5
    }
  },
  {
    id: 'gemini-nano',
    name: 'Gemini Nano',
    provider: 'Google',
    type: 'small',
    capabilities: ['on_device', 'privacy', 'fast_inference'],
    description: 'On-device model for privacy-sensitive healthcare applications',
    useCase: 'Private data processing, offline analysis, patient privacy',
    performanceRating: 7.8,
    costEfficiency: 9.9,
    specialization: ['privacy', 'on_device', 'healthcare'],
    maxTokens: 2048,
    benchmarkScores: {
      reasoning: 7.5,
      speed: 9.9
    }
  },

  // Vision Language Models
  {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision',
    provider: 'OpenAI',
    type: 'vision',
    capabilities: ['image_analysis', 'medical_imaging', 'document_ocr'],
    description: 'Advanced vision model for medical image analysis and diagnostics',
    useCase: 'Radiology analysis, pathology review, medical document processing',
    performanceRating: 9.2,
    costEfficiency: 7.0,
    specialization: ['medical_imaging', 'diagnostics', 'ocr'],
    maxTokens: 128000,
    supportedFormats: ['image', 'text'],
    benchmarkScores: {
      vision: 9.5,
      reasoning: 8.8
    }
  },
  {
    id: 'claude-3-vision',
    name: 'Claude 3 Vision',
    provider: 'Anthropic',
    type: 'vision',
    capabilities: ['image_understanding', 'chart_analysis', 'diagram_interpretation'],
    description: 'Specialized in understanding medical charts, diagrams, and documentation',
    useCase: 'Chart analysis, medical form processing, diagram interpretation',
    performanceRating: 9.0,
    costEfficiency: 8.2,
    specialization: ['medical_charts', 'documentation', 'compliance'],
    maxTokens: 200000,
    supportedFormats: ['image', 'text'],
    benchmarkScores: {
      vision: 9.0,
      reasoning: 9.2
    }
  },
  {
    id: 'llava-med',
    name: 'LLaVA-Med',
    provider: 'Microsoft/UW',
    type: 'vision',
    capabilities: ['medical_imaging', 'biomedical_qa', 'clinical_reasoning'],
    description: 'Medical-specific vision-language model for healthcare applications',
    useCase: 'Medical image Q&A, clinical visual reasoning, biomedical analysis',
    performanceRating: 8.5,
    costEfficiency: 8.8,
    specialization: ['medical_imaging', 'biomedical', 'clinical'],
    maxTokens: 4096,
    supportedFormats: ['image', 'text'],
    benchmarkScores: {
      vision: 8.8,
      reasoning: 8.2
    }
  },

  // Specialized Models
  {
    id: 'biogpt',
    name: 'BioGPT',
    provider: 'Microsoft',
    type: 'specialized',
    capabilities: ['biomedical_text', 'literature_analysis', 'clinical_notes'],
    description: 'Specialized model trained on biomedical literature and clinical data',
    useCase: 'Literature review, clinical note analysis, biomedical research',
    performanceRating: 8.8,
    costEfficiency: 8.5,
    specialization: ['biomedical', 'literature', 'clinical_notes'],
    maxTokens: 4096,
    benchmarkScores: {
      reasoning: 8.5
    }
  },
  {
    id: 'clinicalbert',
    name: 'ClinicalBERT',
    provider: 'MIT',
    type: 'specialized',
    capabilities: ['clinical_nlp', 'ner', 'classification'],
    description: 'BERT model fine-tuned on clinical text for NLP tasks',
    useCase: 'Named entity recognition, clinical text classification, information extraction',
    performanceRating: 8.2,
    costEfficiency: 9.2,
    specialization: ['clinical_nlp', 'ner', 'classification'],
    maxTokens: 512,
    benchmarkScores: {
      reasoning: 7.8,
      speed: 9.0
    }
  }
];

const LABELING_STUDIO_PROJECTS = [
  {
    type: 'text_classification',
    name: 'Clinical Text Classification',
    description: 'Classify clinical notes, reports, and patient communications',
    dataTypes: ['clinical_notes', 'patient_messages', 'reports'],
    benefits: ['Automated triage', 'Quality assurance', 'Compliance monitoring']
  },
  {
    type: 'image_annotation',
    name: 'Medical Image Annotation',
    description: 'Annotate X-rays, MRIs, CT scans for AI training',
    dataTypes: ['xray', 'mri', 'ct_scan', 'pathology'],
    benefits: ['Diagnostic AI training', 'Quality control', 'Research datasets']
  },
  {
    type: 'medical_nlp',
    name: 'Medical NLP Training',
    description: 'Extract entities and relationships from medical text',
    dataTypes: ['symptoms', 'medications', 'procedures', 'diagnoses'],
    benefits: ['Information extraction', 'Clinical decision support', 'Research insights']
  },
  {
    type: 'document_analysis',
    name: 'Healthcare Document Analysis',
    description: 'Analyze forms, prescriptions, and administrative documents',
    dataTypes: ['forms', 'prescriptions', 'insurance_documents', 'reports'],
    benefits: ['Automated processing', 'Error detection', 'Workflow optimization']
  }
];

export const EnhancedModelSelector: React.FC<EnhancedModelSelectorProps> = ({
  selectedModelId,
  onModelSelect,
  actionCategory,
  labelingConfig,
  onLabelingConfigChange
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const selectedModel = ENHANCED_AI_MODELS.find(m => m.id === selectedModelId);
  
  const filteredModels = ENHANCED_AI_MODELS.filter(model => {
    if (filterType === 'all') return true;
    return model.type === filterType;
  });

  const getRecommendedModels = () => {
    switch (actionCategory) {
      case 'analysis':
        return ENHANCED_AI_MODELS.filter(m => 
          m.specialization.includes('clinical reasoning') || 
          m.specialization.includes('biomedical')
        );
      case 'data_processing':
        return ENHANCED_AI_MODELS.filter(m => 
          m.type === 'vision' || 
          m.capabilities.includes('document_ocr')
        );
      case 'communication':
        return ENHANCED_AI_MODELS.filter(m => 
          m.type === 'small' || 
          m.capabilities.includes('real-time')
        );
      default:
        return ENHANCED_AI_MODELS.slice(0, 3);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'large': return <Brain className="h-4 w-4" />;
      case 'small': return <Zap className="h-4 w-4" />;
      case 'vision': return <Eye className="h-4 w-4" />;
      case 'multimodal': return <Layers className="h-4 w-4" />;
      case 'specialized': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'large': return 'bg-blue-100 text-blue-800';
      case 'small': return 'bg-green-100 text-green-800';
      case 'vision': return 'bg-purple-100 text-purple-800';
      case 'multimodal': return 'bg-orange-100 text-orange-800';
      case 'specialized': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enhanced AI Model Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="labeling">Labeling Studio</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            {/* Model Type Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All Models
              </Button>
              {['large', 'small', 'vision', 'multimodal', 'specialized'].map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {getTypeIcon(type)}
                  <span className="ml-1">{type}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-benchmarks"
                checked={showBenchmarks}
                onCheckedChange={setShowBenchmarks}
              />
              <Label htmlFor="show-benchmarks">Show Performance Benchmarks</Label>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModels.map((model) => (
                  <Card
                    key={model.id}
                    className={`cursor-pointer transition-all ${
                      selectedModelId === model.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => onModelSelect(model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{model.name}</h4>
                              <Badge className={getTypeColor(model.type)}>
                                {getTypeIcon(model.type)}
                                <span className="ml-1 capitalize">{model.type}</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {model.provider}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>

                        <div className="text-xs text-muted-foreground">
                          <strong>Best for:</strong> {model.useCase}
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <span>Performance: {model.performanceRating}/10</span>
                          <span>Cost Efficiency: {model.costEfficiency}/10</span>
                        </div>

                        {model.maxTokens && (
                          <div className="text-xs text-muted-foreground">
                            Max Tokens: {model.maxTokens.toLocaleString()}
                          </div>
                        )}

                        {showBenchmarks && model.benchmarkScores && (
                          <div className="space-y-1">
                            <Label className="text-xs">Benchmark Scores:</Label>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {Object.entries(model.benchmarkScores).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key}:</span>
                                  <span>{value}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended for "{actionCategory}" actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getRecommendedModels().slice(0, 4).map((model) => (
                  <Card key={model.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{model.name}</h5>
                        <Badge className={getTypeColor(model.type)}>
                          {model.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {model.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Score: {model.performanceRating}/10
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onModelSelect(model.id)}
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="labeling" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Labeling Studio Integration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Enhance your AI models with human-in-the-loop data annotation and quality assurance
              </p>
            </div>

            {labelingConfig && onLabelingConfigChange && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-labeling"
                    checked={labelingConfig.enabled}
                    onCheckedChange={(enabled) => 
                      onLabelingConfigChange({ ...labelingConfig, enabled })
                    }
                  />
                  <Label htmlFor="enable-labeling">Enable Labeling Studio Integration</Label>
                </div>

                {labelingConfig.enabled && (
                  <>
                    <div>
                      <Label htmlFor="project-type">Project Type</Label>
                      <Select
                        value={labelingConfig.projectType}
                        onValueChange={(value: any) => 
                          onLabelingConfigChange({
                            ...labelingConfig, 
                            projectType: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LABELING_STUDIO_PROJECTS.map((project) => (
                            <SelectItem key={project.type} value={project.type}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quality-threshold">Quality Threshold (%)</Label>
                      <Input
                        id="quality-threshold"
                        type="number"
                        min="50"
                        max="100"
                        value={labelingConfig.qualityThreshold}
                        onChange={(e) => 
                          onLabelingConfigChange({
                            ...labelingConfig,
                            qualityThreshold: parseInt(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="expert-review"
                        checked={labelingConfig.expertReviewRequired}
                        onCheckedChange={(expertReviewRequired) => 
                          onLabelingConfigChange({
                            ...labelingConfig, 
                            expertReviewRequired
                          })
                        }
                      />
                      <Label htmlFor="expert-review">Require Expert Review</Label>
                    </div>

                    {/* Benefits Display */}
                    <div>
                      <Label className="text-sm font-medium">Benefits of This Configuration:</Label>
                      <div className="mt-2 space-y-2">
                        {LABELING_STUDIO_PROJECTS
                          .find(p => p.type === labelingConfig.projectType)
                          ?.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Labeling Studio Project Templates */}
            <div>
              <Label className="text-sm font-medium">Available Project Templates:</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                {LABELING_STUDIO_PROJECTS.map((project) => (
                  <Card key={project.type} className="p-3">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">{project.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.dataTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Model Summary */}
        {selectedModel && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Selected Model: {selectedModel.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Provider:</Label>
                <p>{selectedModel.provider}</p>
              </div>
              <div>
                <Label>Type:</Label>
                <p className="capitalize">{selectedModel.type}</p>
              </div>
              <div>
                <Label>Performance:</Label>
                <p>{selectedModel.performanceRating}/10</p>
              </div>
              <div>
                <Label>Cost Efficiency:</Label>
                <p>{selectedModel.costEfficiency}/10</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};