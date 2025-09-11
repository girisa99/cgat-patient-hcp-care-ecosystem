/**
 * GENIE CONVERSATION INTERFACE
 * New conversation interface with System, Single, Multi, Medical, and Publication modes
 */
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversalAI } from '@/hooks/useUniversalAI';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
}

type ConversationMode = 'system' | 'single' | 'multi';

const availableModels = [
  // Large Language Models
  'GEMINI',
  'GPT',
  'CLAUDE',
  'LLAMA',
  'MIXTRAL',
  'ANTHROPIC'
];

const smallLanguageModels = [
  'PHI-3-MINI',
  'QWEN-2.5',
  'LLAMA-3.1-8B',
  'MISTRAL-7B',
  'GEMMA-2B',
  'TINYLLAMA-1.1B'
];

const visionLanguageModels = [
  'GPT-4-VISION',
  'GEMINI-PRO-VISION',
  'CLAUDE-3-VISION',
  'LLAVA-1.5',
  'BLIP-2',
  'FUYU-8B'
];

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
    id: 'label-studio-mcp',
    name: 'Label Studio Integration',
    description: 'Data annotation, labeling workflows, ML dataset creation',
    capabilities: ['Data Annotation', 'Model Training', 'Quality Control', 'Export Management'],
    status: 'configurable'
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
  const [selectedMode, setSelectedMode] = useState<ConversationMode>('system');
  const [selectedModel, setSelectedModel] = useState('GEMINI');
  const [leftModel, setLeftModel] = useState('GEMINI');
  const [rightModel, setRightModel] = useState('GPT');
  const [message, setMessage] = useState('');
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState<'llm' | 'slm' | 'vlm'>('llm');
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Initialize Universal AI hook
  const { generateResponse, isLoading, error } = useUniversalAI();

  const getModelsForType = (type: 'llm' | 'slm' | 'vlm') => {
    switch (type) {
      case 'llm':
        return availableModels;
      case 'slm':
        return smallLanguageModels;
      case 'vlm':
        return visionLanguageModels;
      default:
        return availableModels;
    }
  };

  const handleMCPToolToggle = (toolId: string) => {
    setSelectedMCPTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const conversationModes = [
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Utilizes all available models (Gemini, GPT, and Claude) for comprehensive and optimized responses.',
      active: selectedMode === 'system'
    },
    {
      id: 'single',
      label: 'Single',
      icon: <User className="h-4 w-4" />,
      description: 'Single model conversation for focused responses.',
      active: selectedMode === 'single'
    },
    {
      id: 'multi',
      label: 'Multi',
      icon: <Users className="h-4 w-4" />,
      description: 'Split screen with multiple models for comparative analysis.',
      active: selectedMode === 'multi'
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
      description: 'Generate content for review and publication in the knowledge base.',
      active: false,
      isFeature: true
    }
  ];

  const handleModeSelect = (mode: ConversationMode) => {
    setSelectedMode(mode);
  };

  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

  const handleFeatureToggle = (featureId: string) => {
    setEnabledFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleStartChat = () => {
    // Initialize conversation based on selected mode and enabled features
    const conversationConfig = {
      mode: selectedMode,
      modelType: selectedModelType,
      enabledFeatures,
      selectedMCPTools,
      models: selectedMode === 'single' ? [selectedModel] : 
              selectedMode === 'multi' ? [leftModel, rightModel] : 
              ['GEMINI', 'GPT', 'CLAUDE'] // System mode uses all models
    };
    console.log('Starting chat with config:', conversationConfig);
    setChatStarted(true);

    // If the user already typed a message, send it immediately
    if (message.trim()) {
      queueMicrotask(() => handleSendMessage());
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!chatStarted) setChatStarted(true);
    
    const userMessage = { 
      role: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    
    try {
      // Determine provider based on selected mode
      let provider: 'openai' | 'claude' | 'gemini' = 'openai'; // default
      if (selectedMode === 'single' || selectedMode === 'multi') {
        const targetModel = selectedMode === 'multi' ? leftModel : selectedModel;
        const modelId = targetModel.toLowerCase();
        if (modelId.includes('gemini')) provider = 'gemini';
        else if (modelId.includes('claude') || modelId.includes('anthropic')) provider = 'claude';
        else provider = 'openai';
      }
      
      // Create system prompt based on enabled features and model type
      let systemPrompt = "You are a helpful AI assistant.";
      
      // Add model type specific instructions
      if (selectedModelType === 'slm') {
        systemPrompt += " You are optimized for efficiency and speed while maintaining accuracy.";
      } else if (selectedModelType === 'vlm') {
        systemPrompt += " You have vision capabilities and can analyze images, charts, and visual content.";
      }
      
      // Add feature-specific context
      if (enabledFeatures.includes('medical')) {
        systemPrompt += " You have access to medical data, FDA information, ICD codes, and HCPCS codes. Provide medical information when relevant.";
      }
      if (enabledFeatures.includes('publication')) {
        systemPrompt += " Generate content suitable for review and publication in knowledge bases.";
      }

      // Add MCP tools context
      if (selectedMCPTools.length > 0) {
        const toolNames = selectedMCPTools.map(id => mcpTools.find(t => t.id === id)?.name).filter(Boolean);
        systemPrompt += ` You have access to the following external tools and integrations: ${toolNames.join(', ')}. Use these tools when relevant to provide enhanced responses.`;
      }
      
      // Build and send request; in System mode, try providers in order
      let response: any = null;
      if (selectedMode === 'system') {
        const providersToTry: Array<'openai' | 'claude' | 'gemini'> = ['openai', 'claude', 'gemini'];
        for (const p of providersToTry) {
          try {
            const r = await generateResponse({
              prompt: currentMessage,
              systemPrompt,
              provider: p,
              temperature: 0.7,
              maxTokens: 1000
            });
            if (r) { response = r; break; }
          } catch (e) {
            console.warn(`Provider ${p} failed:`, e);
          }
        }
      } else {
        const request: any = {
          prompt: currentMessage,
          systemPrompt,
          provider,
          model: selectedMode === 'multi' ? leftModel : selectedModel,
          temperature: 0.7,
          maxTokens: 1000
        };
        response = await generateResponse(request);
      }
      
      if (response) {
        const aiMessage = {
          role: 'assistant',
          content: response.content,
          provider: response.provider,
          timestamp: new Date().toISOString(),
          model: response.model
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderModeSpecificContent = () => {
    switch (selectedMode) {
      case 'single':
        return (
          <div className="mt-4 space-y-4">
            {/* Model Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Type</label>
              <div className="flex gap-2">
                {[
                  { key: 'llm', label: 'Large LM', icon: '🤖' },
                  { key: 'slm', label: 'Small LM', icon: '⚡' },
                  { key: 'vlm', label: 'Vision LM', icon: '👁️' }
                ].map((type) => (
                  <Button
                    key={type.key}
                    variant={selectedModelType === type.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedModelType(type.key as 'llm' | 'slm' | 'vlm');
                      setSelectedModel(getModelsForType(type.key as 'llm' | 'slm' | 'vlm')[0]);
                    }}
                    className="flex items-center gap-1"
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getModelsForType(selectedModelType).map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'multi':
        return (
          <div className="mt-4 space-y-4">
            {/* Model Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Type</label>
              <div className="flex gap-2">
                {[
                  { key: 'llm', label: 'Large LM', icon: '🤖' },
                  { key: 'slm', label: 'Small LM', icon: '⚡' },
                  { key: 'vlm', label: 'Vision LM', icon: '👁️' }
                ].map((type) => (
                  <Button
                    key={type.key}
                    variant={selectedModelType === type.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedModelType(type.key as 'llm' | 'slm' | 'vlm');
                      const models = getModelsForType(type.key as 'llm' | 'slm' | 'vlm');
                      setLeftModel(models[0]);
                      setRightModel(models[1] || models[0]);
                    }}
                    className="flex items-center gap-1"
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Left Model</label>
                <Select value={leftModel} onValueChange={setLeftModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsForType(selectedModelType).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Right Model</label>
                <Select value={rightModel} onValueChange={setRightModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsForType(selectedModelType).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );


      case 'system':
      default:
        return (
          <div className="mt-4">
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="p-4">
                <div className="text-sm text-green-700 font-medium mb-1">
                  System Mode: Utilizes all available models (Gemini, GPT, and Claude) for comprehensive and optimized responses.
                </div>
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
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Genie</h2>
              <p className="text-sm text-gray-600">I am your Technical Navigator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header Text */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold mb-2">How can I help you today, Guest?</h3>
            <p className="text-gray-600">Choose how you'd like me to assist you:</p>
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
                variant={enabledFeatures.includes(feature.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeatureToggle(feature.id)}
                className={`flex items-center gap-2 px-4 py-2 h-auto ${
                  enabledFeatures.includes(feature.id)
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
              {conversationModes.find(mode => mode.id === selectedMode)?.description}
            </p>
          </div>

          {/* Mode-specific Content */}
          {renderModeSpecificContent()}

          {/* Advanced Options Toggle */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          {/* Advanced Options - MCP Tools */}
          {showAdvancedOptions && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                MCP Tools & Integrations
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                Connect to external tools and services through Model Context Protocol
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mcpTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className={`cursor-pointer border-2 transition-all ${
                      selectedMCPTools.includes(tool.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMCPToolToggle(tool.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{tool.name}</h5>
                        <Badge 
                          variant={tool.status === 'available' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{tool.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {tool.capabilities.map((capability, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedMCPTools.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-700 font-medium mb-1">
                    Selected MCP Tools ({selectedMCPTools.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMCPTools.map((toolId) => {
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
            </div>
          )}

          {/* Feature Status Display */}
          {enabledFeatures.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-800 mb-2">Active Features:</h4>
              <div className="flex flex-wrap gap-2">
                {enabledFeatures.includes('medical') && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Medical Data Access
                  </Badge>
                )}
                {enabledFeatures.includes('publication') && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <FileText className="h-3 w-3 mr-1" />
                    Publication Mode
                  </Badge>
                )}
              </div>
              {enabledFeatures.includes('medical') && (
                <p className="text-xs text-blue-700 mt-2">
                  Access to FDA data, ICD codes, and HCPCS codes enabled
                </p>
              )}
              {enabledFeatures.includes('publication') && (
                <p className="text-xs text-green-700 mt-2">
                  Content will be queued for review and knowledge base publication
                </p>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is an AI assistant for demonstration purposes. The responses generated should not be considered as medical advice. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </div>

          {/* Start Chat Button */}
          {!chatStarted && (
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
          {chatStarted && (
            <div className="mt-6">
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Chat started! Send your first message below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : msg.error 
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.model && (
                            <p className="text-xs opacity-75 mt-1">
                              {msg.provider?.toUpperCase()} • {msg.model}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Message Input */}
          {chatStarted && (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};