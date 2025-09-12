/**
 * ENHANCED GENIE CONVERSATION INTERFACE
 * Refactored with proper state management, RAG integration, and dropdown options
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  X, 
  Monitor, 
  User, 
  Users, 
  Stethoscope, 
  FileText, 
  Send,
  ChevronRight,
  Loader2,
  RefreshCw,
  Settings,
  Database,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState, ConversationMessage } from '@/hooks/useConversationState';
import { ragService } from '@/services/ragService';
import { EnhancedModelSelector } from '@/components/ai/EnhancedModelSelector';
import { CrossCategoryModelSelector, SelectedModelConfig } from '@/components/ai/CrossCategoryModelSelector';
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
}

type ConversationMode = 'system' | 'single' | 'multi';

const mcpTools = [
  {
    id: 'healthcare-mcp',
    name: 'Healthcare MCP Server',
    description: 'Clinical decision support, patient records, compliance tools',
    capabilities: ['Patient Records', 'Clinical Decision Support', 'Drug Interactions', 'Compliance Audit'],
    status: 'available'
  },
  {
    id: 'filesystem-mcp',
    name: 'Filesystem MCP Server', 
    description: 'File operations, document management, data processing',
    capabilities: ['File Operations', 'Document Processing', 'Data Analysis', 'Search'],
    status: 'available'
  },
  {
    id: 'web-search-mcp',
    name: 'Web Search & Research',
    description: 'Real-time web search, research assistance, fact checking',
    capabilities: ['Web Search', 'Research', 'Fact Checking', 'Content Analysis'],
    status: 'available'
  }
];

export const GenieConversationInterface: React.FC<GenieConversationInterfaceProps> = ({
  isOpen,
  onClose,
  tenantId,
  userId
}) => {
  const [message, setMessage] = useState('');
  const [ragStatus, setRagStatus] = useState({ available: false, documentsCount: 0, labelStudioConnected: false });
  const [modelSelectionMode, setModelSelectionMode] = useState<'single' | 'cross-category'>('single'); // New selection mode
  
  // Single model selection (existing functionality)
  const [selectedModel, setSelectedModel] = useState<{ provider: string; model: string; category: string }>({
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    category: 'llm'
  });
  
  // Multi-model selections for split view
  const [selectedModelLeft, setSelectedModelLeft] = useState<{ provider: string; model: string; category: string }>({
    provider: 'openai',
    model: 'gpt-5-2025-08-07',
    category: 'llm'
  });
  const [selectedModelRight, setSelectedModelRight] = useState<{ provider: string; model: string; category: string }>({
    provider: 'claude',
    model: 'claude-opus-4-1-20250805',
    category: 'llm'
  });
  
  // Cross-category model selection (new functionality)
  const [selectedCrossModels, setSelectedCrossModels] = useState<SelectedModelConfig[]>([]);
  
  // Use conversation state management
  const { state: conversationState, resetConversation, startConversation, addMessage, updateConversationConfig, switchMode } = useConversationState();
  
  // Initialize Universal AI hooks
  const { generateResponse, isLoading, error, getModelsByCategory, isProviderAvailable } = useUniversalAI();

  // Check RAG status on component mount
  useEffect(() => {
    if (isOpen) {
      ragService.checkRAGStatus().then(setRagStatus);
    }
  }, [isOpen]);

  const conversationModes = [
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Utilizes all available models (Gemini, GPT, and Claude) with RAG-enhanced responses for comprehensive and optimized answers.',
      active: conversationState.selectedMode === 'system'
    },
    {
      id: 'single',
      label: 'Single',
      icon: <User className="h-4 w-4" />,
      description: 'Single model conversation with choice of traditional category selection or cross-category intelligence for specialized tasks.',
      active: conversationState.selectedMode === 'single'
    },
    {
      id: 'multi',
      label: 'Multi',
      icon: <Users className="h-4 w-4" />,
      description: 'Compare models side-by-side or use multi-category intelligent merging for comprehensive analysis.',
      active: conversationState.selectedMode === 'multi'
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: <Stethoscope className="h-4 w-4" />,
      description: 'Access to FDA data, ICD codes, and HCPCS codes. Responses are enriched with medical references and regulatory information.',
      active: false,
      isFeature: true
    },
    {
      id: 'publication',
      label: 'Publication', 
      icon: <FileText className="h-4 w-4" />,
      description: 'Generate content for review and publication in the knowledge base with automatic RAG integration.',
      active: false,
      isFeature: true
    }
  ];

  const handleModelSelect = (provider: string, model: string, category: string) => {
    setSelectedModel({ provider, model, category });
  };
  const handleModelSelectLeft = (provider: string, model: string, category: string) => {
    setSelectedModelLeft({ provider, model, category });
  };
  const handleModelSelectRight = (provider: string, model: string, category: string) => {
    setSelectedModelRight({ provider, model, category });
  };

  const handleModeSelect = (mode: ConversationMode) => {
    switchMode(mode);
  };

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = conversationState.enabledFeatures.includes(featureId) 
      ? conversationState.enabledFeatures.filter(id => id !== featureId)
      : [...conversationState.enabledFeatures, featureId];
    
    updateConversationConfig({ enabledFeatures: newFeatures });
  };

  const handleMCPToolToggle = (toolId: string) => {
    const newTools = conversationState.selectedMCPTools.includes(toolId) 
      ? conversationState.selectedMCPTools.filter(id => id !== toolId)
      : [...conversationState.selectedMCPTools, toolId];
    
    updateConversationConfig({ selectedMCPTools: newTools });
  };

  const handleStartChat = () => {
    startConversation();
    
    // If the user already typed a message, send it immediately
    if (message.trim()) {
      queueMicrotask(() => handleSendMessage());
    }
  };

  const handleResetConversation = () => {
    resetConversation();
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!conversationState.isActive) startConversation();
    
    const userMessageId = addMessage({ 
      role: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    });
    
    const currentMessage = message;
    setMessage('');
    
    try {
      // Use the selected model from the ModelCategorySelector
      const provider = selectedModel.provider as 'openai' | 'claude' | 'gemini';
      
      // Enhanced system prompt with RAG context for natural conversation
      let systemPrompt = `You are Genie, a helpful and intelligent Technical Navigator AI assistant. You have access to a comprehensive knowledge base and should provide responses that are:
- Well-structured and easy to read
- Conversational and friendly in tone
- Detailed but not overwhelming
- Use bullet points, numbered lists, and paragraphs for clarity
- Always maintain a helpful, professional demeanor
- Reference relevant context when available`;
      
      // Add model category specific instructions
      if (selectedModel.category === 'small') {
        systemPrompt += " You are optimized for efficiency and speed while maintaining accuracy.";
      } else if (selectedModel.category === 'vision') {
        systemPrompt += " You have vision capabilities and can analyze images, charts, and visual content.";
      }
      
      // Add feature-specific context
      if (conversationState.enabledFeatures.includes('medical')) {
        systemPrompt += " You have access to medical data, FDA information, ICD codes, and HCPCS codes. Provide medical information when relevant.";
      }
      if (conversationState.enabledFeatures.includes('publication')) {
        systemPrompt += " Generate content suitable for review and publication in knowledge bases.";
      }

      // Add MCP tools context (Label Studio is always included)
      const allActiveTools = ['label-studio-mcp', ...conversationState.selectedMCPTools];
      if (allActiveTools.length > 0) {
        const labelStudioName = 'Label Studio Integration';
        const otherToolNames = conversationState.selectedMCPTools.map(id => mcpTools.find(t => t.id === id)?.name).filter(Boolean);
        const allToolNames = [labelStudioName, ...otherToolNames];
        systemPrompt += ` You have access to the following external tools and integrations: ${allToolNames.join(', ')}. Label Studio RAG knowledge base is always available. Use these tools when relevant to provide enhanced responses.`;
      } else {
        systemPrompt += " You have access to Label Studio RAG knowledge base for enhanced, context-aware responses.";
      }

      // Enhance prompt with RAG context (Label Studio is always included)
      const { enhancedPrompt, contextSources } = await ragService.enhancePromptWithRAG(
        currentMessage, 
        ['label-studio-mcp', ...conversationState.enabledFeatures, ...conversationState.selectedMCPTools]
      );

      // Build and send request(s)
      const targets = conversationState.selectedMode === 'multi'
        ? [selectedModelLeft, selectedModelRight]
        : [selectedModel];

      const results = await Promise.all(targets.map(async (m) => {
        try {
          const request: any = {
            prompt: enhancedPrompt,
            systemPrompt,
            provider: m.provider,
            model: m.model,
            temperature: 0.7,
            maxTokens: 1000
          };
          const res = await generateResponse(request);
          return { ok: true as const, res };
        } catch (e: any) {
          console.error(`Provider ${m.provider} with model ${m.model} failed:`, e?.message || e);
          return { ok: false as const, err: e, m };
        }
      }));

      // Add messages for all successful responses
      const successCount = results.reduce((acc, r) => acc + (r.ok ? 1 : 0), 0);
      results.forEach(r => {
        if (r.ok) {
          let content = (r.res as any).content;
          if (contextSources.length > 0) {
            content += `\n\n*Sources: ${contextSources.join(', ')}*`;
          }
          addMessage({
            role: 'assistant',
            content,
            provider: (r.res as any).provider,
            model: (r.res as any).model,
            timestamp: new Date().toISOString(),
            metadata: { contextSources, ragEnhanced: contextSources.length > 0 }
          });
        }
      });

      if (successCount === 0) {
        throw new Error('All model calls failed. Please check providers and try again.');
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // Show error message to user
    }
  };

  const renderModelSelectionContent = () => {
    switch (conversationState.selectedMode) {
      case 'single':
        return (
          <div className="mt-4 space-y-4">
            {/* Model Selection Mode Picker */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selection Mode:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={modelSelectionMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('single')}
                >
                  Single Model
                </Button>
                <Button
                  variant={modelSelectionMode === 'cross-category' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('cross-category')}
                >
                  Cross-Category
                </Button>
              </div>
            </div>
            
            {/* Render appropriate selector based on mode */}
            {modelSelectionMode === 'single' ? (
              <EnhancedModelSelector
                onModelSelect={handleModelSelect}
                selectedModel={selectedModel}
              />
            ) : (
              <CrossCategoryModelSelector
                onModelsSelect={(models) => {
                  setSelectedCrossModels(models);
                  // Set the primary model for conversation state
                  const primaryModel = models.find(m => m.role === 'primary') || models[0];
                  if (primaryModel) {
                    handleModelSelect(primaryModel.provider, primaryModel.model, primaryModel.category);
                  }
                }}
                selectedModels={selectedCrossModels}
                mode="single"
                maxSelections={4}
              />
            )}
          </div>
        );

      case 'multi':
        return (
          <div className="mt-4 space-y-4">
            {/* Model Selection Mode Picker */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selection Mode:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={modelSelectionMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('single')}
                >
                  Traditional Split
                </Button>
                <Button
                  variant={modelSelectionMode === 'cross-category' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('cross-category')}
                >
                  Multi-Category
                </Button>
              </div>
            </div>
            
            {modelSelectionMode === 'single' ? (
              <>
                <p className="text-sm text-muted-foreground">Select models for side-by-side comparison</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium mb-2">Left Panel Model</p>
                    <EnhancedModelSelector
                      onModelSelect={handleModelSelectLeft}
                      selectedModel={selectedModelLeft}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2">Right Panel Model</p>
                    <EnhancedModelSelector
                      onModelSelect={handleModelSelectRight}
                      selectedModel={selectedModelRight}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">You can compare outputs from different providers/models in a split view.</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Select multiple models across categories for intelligent comparison</p>
                <CrossCategoryModelSelector
                  onModelsSelect={setSelectedCrossModels}
                  selectedModels={selectedCrossModels}
                  mode="multi"
                  maxSelections={6}
                />
                <p className="text-xs text-muted-foreground">Models will be processed in parallel and results intelligently merged.</p>
              </>
            )}
          </div>
        );

      case 'system':
      default:
        return (
          <div className="mt-4">
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="p-4">
                <div className="text-sm text-green-700 font-medium mb-1">
                  System Mode: Utilizes all available models (Gemini, GPT, and Claude) with RAG-enhanced knowledge base for comprehensive and optimized responses.
                </div>
                {ragStatus.available && (
                  <div className="flex items-center gap-2 mt-2">
                    <Database className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      RAG Active: {ragStatus.documentsCount} documents, Label Studio: {ragStatus.labelStudioConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-0.5">
              <img 
                src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
                alt="Genie" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Genie</h2>
              <p className="text-sm text-gray-600">I am your Technical Navigator</p>
              {conversationState.isActive && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {conversationState.conversationId}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {conversationState.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetConversation}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {/* Conversation ID and Status */}
          {conversationState.isActive && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Active Conversation: {conversationState.selectedMode.toUpperCase()} Mode
                  </span>
                </div>
                <Badge variant="secondary">{conversationState.messages.length} messages</Badge>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              How can I help you today, Guest?
            </h3>
            <p className="text-gray-600 mb-4">Choose how you'd like me to assist you:</p>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {conversationModes.filter(mode => !mode.isFeature).map((mode) => (
              <Button
                key={mode.id}
                variant={mode.active ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleModeSelect(mode.id as ConversationMode)}
                className={`flex items-center gap-2 px-6 py-3 h-auto ${
                  mode.active 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {mode.icon}
                {mode.label}
              </Button>
            ))}
          </div>

          {/* Feature Toggles */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {conversationModes.filter(mode => mode.isFeature).map((feature) => (
              <Button
                key={feature.id}
                variant={conversationState.enabledFeatures.includes(feature.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeatureToggle(feature.id)}
                className={`flex items-center gap-2 px-4 py-2 h-auto ${
                  conversationState.enabledFeatures.includes(feature.id)
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {feature.icon}
                {feature.label}
              </Button>
            ))}
          </div>

          {/* Mode Description */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {conversationModes.find(mode => mode.id === conversationState.selectedMode)?.description}
            </p>
          </div>

          {/* Mode-specific Content */}
          {renderModelSelectionContent()}

          {/* Advanced Options Popover (scrollable, non-transparent) */}
          <div className="mt-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Select MCP Tools & Integrations ({conversationState.selectedMCPTools.length} selected)</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(720px,90vw)] p-0 bg-popover z-[100] shadow-lg border">
                <div className="p-3 border-b sticky top-0 bg-popover z-10">
                  <p className="text-xs text-muted-foreground">
                    Connect to external tools and services through Model Context Protocol
                  </p>
                </div>
                {/* Tabbed, scrollable content to prevent background scroll and ensure interactivity */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList level="child">
                    <TabsTrigger value="all" level="child">All</TabsTrigger>
                    <TabsTrigger value="healthcare" level="child">Healthcare</TabsTrigger>
                    <TabsTrigger value="filesystem" level="child">Filesystem</TabsTrigger>
                    <TabsTrigger value="research" level="child">Research</TabsTrigger>
                  </TabsList>

                  {/* All */}
                  <TabsContent value="all" level="child" className="p-0">
                    <ScrollArea className="h-72 md:h-80 pointer-events-auto">
                      <div className="p-3 space-y-3">
                        {mcpTools.map((tool) => (
                          <div key={tool.id} className="p-3 border rounded-md bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{tool.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={tool.status === 'available' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {tool.status}
                                </Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  onMouseDown={(e) => e.preventDefault()}
                                  variant={conversationState.selectedMCPTools.includes(tool.id) ? 'default' : 'outline'}
                                  onClick={(e) => { e.stopPropagation(); handleMCPToolToggle(tool.id); }}
                                >
                                  {conversationState.selectedMCPTools.includes(tool.id) ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{tool.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.capabilities.slice(0, 3).map((capability, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                  {capability}
                                </Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{tool.capabilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Healthcare */}
                  <TabsContent value="healthcare" level="child" className="p-0">
                    <ScrollArea className="h-72 md:h-80 pointer-events-auto">
                      <div className="p-3 space-y-3">
                        {mcpTools.filter(t => t.id.includes('healthcare')).map((tool) => (
                          <div key={tool.id} className="p-3 border rounded-md bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{tool.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge variant={tool.status === 'available' ? 'default' : 'secondary'} className="text-xs">{tool.status}</Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  onMouseDown={(e) => e.preventDefault()}
                                  variant={conversationState.selectedMCPTools.includes(tool.id) ? 'default' : 'outline'}
                                  onClick={(e) => { e.stopPropagation(); handleMCPToolToggle(tool.id); }}
                                >
                                  {conversationState.selectedMCPTools.includes(tool.id) ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{tool.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.capabilities.slice(0, 3).map((capability, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-1 py-0">{capability}</Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">+{tool.capabilities.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Filesystem */}
                  <TabsContent value="filesystem" level="child" className="p-0">
                    <ScrollArea className="h-72 md:h-80 pointer-events-auto">
                      <div className="p-3 space-y-3">
                        {mcpTools.filter(t => t.id.includes('filesystem')).map((tool) => (
                          <div key={tool.id} className="p-3 border rounded-md bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{tool.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge variant={tool.status === 'available' ? 'default' : 'secondary'} className="text-xs">{tool.status}</Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  onMouseDown={(e) => e.preventDefault()}
                                  variant={conversationState.selectedMCPTools.includes(tool.id) ? 'default' : 'outline'}
                                  onClick={(e) => { e.stopPropagation(); handleMCPToolToggle(tool.id); }}
                                >
                                  {conversationState.selectedMCPTools.includes(tool.id) ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{tool.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.capabilities.slice(0, 3).map((capability, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-1 py-0">{capability}</Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">+{tool.capabilities.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Research */}
                  <TabsContent value="research" level="child" className="p-0">
                    <ScrollArea className="h-72 md:h-80 pointer-events-auto">
                      <div className="p-3 space-y-3">
                        {mcpTools.filter(t => t.id.includes('web')).map((tool) => (
                          <div key={tool.id} className="p-3 border rounded-md bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{tool.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge variant={tool.status === 'available' ? 'default' : 'secondary'} className="text-xs">{tool.status}</Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  onMouseDown={(e) => e.preventDefault()}
                                  variant={conversationState.selectedMCPTools.includes(tool.id) ? 'default' : 'outline'}
                                  onClick={(e) => { e.stopPropagation(); handleMCPToolToggle(tool.id); }}
                                >
                                  {conversationState.selectedMCPTools.includes(tool.id) ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{tool.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.capabilities.slice(0, 3).map((capability, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-1 py-0">{capability}</Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">+{tool.capabilities.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected MCP Tools Display */}
          {conversationState.selectedMCPTools.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 font-medium mb-1">
                Active MCP Tools ({conversationState.selectedMCPTools.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {conversationState.selectedMCPTools.map((toolId) => {
                  const tool = mcpTools.find(t => t.id === toolId);
                  return (
                    <Badge key={toolId} variant="secondary" className="text-xs">
                      {tool?.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feature Status Display */}
          {conversationState.enabledFeatures.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-800 mb-2">Active Features:</h4>
              <div className="flex flex-wrap gap-2">
                {conversationState.enabledFeatures.includes('medical') && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Medical Data Access
                  </Badge>
                )}
                {conversationState.enabledFeatures.includes('publication') && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <FileText className="h-3 w-3 mr-1" />
                    Publication Mode
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is an AI assistant with RAG-enhanced knowledge base for demonstration purposes. The responses generated should not be considered as medical advice. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </div>

          {/* Start Chat Button */}
          {!conversationState.isActive && (
            <div className="mt-6 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleStartChat}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium"
              >
                Start Chat
              </Button>
            </div>
          )}

          {/* Conversation Area */}
          {conversationState.isActive && (
            <div className="mt-6">
              <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-gray-50">
                {conversationState.messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-1 mx-auto mb-4">
                      <img 
                        src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
                        alt="Genie" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Hello! I'm Genie, your Technical Navigator</p>
                    <p className="text-sm text-gray-500">Send me a message and I'll provide you with comprehensive, context-aware responses.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversationState.messages.map((msg, index) => (
                      <MessageComponent
                        key={msg.id}
                        message={msg}
                        isLast={index === conversationState.messages.length - 1}
                      />
                    ))}
                    {isLoading && <TypingIndicator />}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Message Input */}
          {conversationState.isActive && (
            <div className="mt-6">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[100px] resize-none"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  className="self-end bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};