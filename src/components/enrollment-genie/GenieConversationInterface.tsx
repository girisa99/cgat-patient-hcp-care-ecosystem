/**
 * ENHANCED GENIE CONVERSATION INTERFACE
 * Refactored with proper state management, RAG integration, and dropdown options
 */
import React, { useState, useEffect } from 'react';
import { NonModalDialogRoot as Dialog, NonModalDialogContent as DialogContent } from '@/components/ui/non-modal-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
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
  Zap,
  MessageSquare,
  Download,
  AlertTriangle,
  Mic
} from 'lucide-react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState, ConversationMessage } from '@/hooks/useConversationState';
import { ragService } from '@/services/ragService';
import { EnhancedModelSelector } from '@/components/ai/EnhancedModelSelector';
import { CrossCategoryModelSelector, SelectedModelConfig } from '@/components/ai/CrossCategoryModelSelector';
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';
import { EnrollmentJourneySteps } from '@/components/patient-enrollment/EnrollmentJourneySteps';
import { EnhancedEnrollmentInterface } from '@/components/patient-enrollment/EnhancedEnrollmentInterface';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
  context?: string;
  mode?: 'general' | 'enrollment';
  onModeChange?: (mode: 'general' | 'enrollment') => void;
}

const mcpTools = [
  {
    id: 'filesystem-mcp',
    name: 'File System Access',
    description: 'Read, write, and manage files and directories',
    capabilities: ['File Operations', 'Directory Listing', 'File Search', 'Content Analysis'],
    status: 'available'
  },
  {
    id: 'memory-mcp',
    name: 'Memory & Context',
    description: 'Long-term memory and context management',
    capabilities: ['Context Storage', 'Memory Retrieval', 'Session Management', 'Pattern Recognition'],
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
  userId,
  context = 'general',
  mode = 'general',
  onModeChange
}) => {
  const [message, setMessage] = useState('');
  const [modelSelectionMode, setModelSelectionMode] = useState<'enhanced' | 'cross-category'>('enhanced');
  const [selectedCrossModels, setSelectedCrossModels] = useState<SelectedModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [singleModel, setSingleModel] = useState<{ provider: string; model: string; category: 'llm' | 'small' | 'vision' | 'mcp' }>({
    provider: 'openai',
    model: 'o4-mini-2025-04-16',
    category: 'llm'
  });
  const [resetCounter, setResetCounter] = useState(0);

  // Page awareness integration
  const pageAware = usePageAwareEnrollment();

  // Determine if enrollment toggle should be visible
  const shouldShowEnrollmentToggle = () => {
    const pageContext = pageAware.getPageContext();
    return pageContext.isPageSpecific && pageContext.config?.moduleType === 'patient';
  };

  // Keep user's chosen mode; do not auto-switch based on page context


  // Use conversation state management
  const conv = useConversationState();
  const conversationState = conv.state;

  // Initialize Universal AI hooks
  const { generateResponse } = useUniversalAI();

  const { resetConversation, startConversation, addMessage, updateConversationConfig, switchMode } = conv;

  // Debug render and mode changes
  useEffect(() => {
    console.log('GenieConversationInterface render', { uiMode: mode, convMode: conversationState.selectedMode });
  }, [mode, conversationState.selectedMode]);

  // Auto-reset conversation when popup opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Genie popup opened - auto-resetting conversation');
      handleResetConversation();
    }
  }, [isOpen]);

  const handleResetConversation = () => {
    console.log('🔄 Starting new session - resetting all states');
    resetConversation();
    setMessage('');
    setResetCounter((c) => c + 1);
    setIsLoading(false);
    
    // Show confirmation
    toast({
      title: "New Session Started",
      description: "Ready for a fresh conversation"
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    console.log('🚀 Sending message:', message);
    
    if (!conversationState.isActive) {
      console.log('🔥 Starting conversation');
      startConversation();
    }
    
    const userMessage = { 
      role: 'user' as const, 
      content: message,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      console.log('🤖 Processing with mode:', conversationState.selectedMode);
      
      if (conversationState.selectedMode === 'single') {
        // Single model response
        console.log('📡 Calling AI with:', { provider: singleModel.provider, model: singleModel.model });
        
        const systemPrompt = mode === 'enrollment' 
          ? 'You are an AI enrollment assistant. Help users through patient enrollment by asking relevant questions and guiding them through the process. Extract structured data from their responses and provide helpful guidance.'
          : 'You are a helpful AI assistant.';
          
        const resp = await generateResponse({
          provider: singleModel.provider as any,
          model: singleModel.model,
          prompt: message,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 1000
        });
        
        console.log('✅ AI Response received:', resp);
        
        addMessage({ 
          role: 'assistant', 
          content: resp?.content || 'I apologize, but I didn\'t receive a proper response. Please try again.',
          timestamp: new Date().toISOString(),
          provider: singleModel.provider,
          model: singleModel.model
        });
      } else if (conversationState.selectedMode === 'multi') {
        // Multi-model responses
        const models = selectedCrossModels.length > 0 ? selectedCrossModels : [
          { provider: 'openai', model: 'gpt-4.1-2025-04-14', category: 'llm', name: 'OpenAI GPT', role: 'primary' as const, weight: 1 },
          { provider: 'claude', model: 'claude-sonnet-4-20250514', category: 'llm', name: 'Claude Sonnet', role: 'secondary' as const, weight: 1 }
        ];

        console.log('🔀 Multi-model request with:', models);

        const systemPrompt = mode === 'enrollment' 
          ? 'You are an AI enrollment assistant. Help users through patient enrollment by asking relevant questions and guiding them through the process.'
          : 'You are a helpful AI assistant.';

        const results = await Promise.allSettled(models.map(async (m) => {
          const r = await generateResponse({
            provider: m.provider as any,
            model: m.model,
            prompt: message,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 1000
          });
          return { r, m };
        }));

        results.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value.r) {
            addMessage({
              role: 'assistant',
              content: res.value.r.content || 'No response received',
              timestamp: new Date().toISOString(),
              provider: res.value.m.provider,
              model: res.value.m.model
            });
          } else {
            console.error(`Model ${models[index].name} failed:`, res.status === 'rejected' ? res.reason : 'Unknown error');
          }
        });
      }
    } catch (error) {
      console.error('❌ Error generating response:', error);
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please check your connection and try again.",
        variant: "destructive"
      });
      
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
        error: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    startConversation();
  };

  const handleMCPToolToggle = (toolId: string) => {
    const current = conversationState.selectedMCPTools || [];
    const updated = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];
    updateConversationConfig({ selectedMCPTools: updated });
  };

  const renderModelSelectionContent = () => {
    switch (conversationState.selectedMode) {
      case 'single':
        return (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selection Mode:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={modelSelectionMode === 'enhanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('enhanced')}
                >
                  Enhanced
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

            {modelSelectionMode === 'enhanced' && (
              <EnhancedModelSelector
                onModelSelect={(provider, model, category) =>
                  setSingleModel({ provider, model, category: category as any })
                }
                selectedModel={singleModel}
              />
            )}

            {modelSelectionMode === 'cross-category' && (
              <CrossCategoryModelSelector 
                selectedModels={selectedCrossModels}
                onModelsSelect={setSelectedCrossModels}
                mode={conversationState.selectedMode}
              />
            )}
          </div>
        );

      case 'multi':
        return (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selection Mode:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={modelSelectionMode === 'enhanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('enhanced')}
                >
                  Enhanced
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

            {modelSelectionMode === 'cross-category' && (
              <CrossCategoryModelSelector 
                selectedModels={selectedCrossModels}
                onModelsSelect={setSelectedCrossModels}
                mode={conversationState.selectedMode}
                maxSelections={6}
              />
            )}
          </div>
        );

      default:
        return (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-700">System Mode Selection:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={modelSelectionMode === 'enhanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModelSelectionMode('enhanced')}
                >
                  Enhanced
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
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isExpanded ? 'max-w-[95vw] h-[95vh]' : 'max-w-3xl sm:max-w-5xl md:max-w-6xl h-[85vh] sm:h-[90vh]'} p-0 overflow-hidden transition-all duration-300`}>
        {/* Header with Page-Aware Toggle */}
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
            {/* Mode Toggle - Only show on patient enrollment pages */}
            {shouldShowEnrollmentToggle() && (
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={mode === 'general' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    console.log('🟢 Mode toggle clicked: general');
                    try { toast({ title: 'Genie mode', description: 'Switched to General' }); } catch {}
                    onModeChange?.('general');
                  }}
                  className="px-3 py-1.5 h-8 text-xs font-medium"
                >
                  General
                </Button>
                <Button
                  variant={mode === 'enrollment' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    console.log('🟠 Mode toggle clicked: enrollment');
                    try { toast({ title: 'Genie mode', description: 'Switched to Enrollment' }); } catch {}
                    onModeChange?.('enrollment');
                  }}
                  className="px-3 py-1.5 h-8 text-xs font-medium"
                >
                  Enrollment
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetConversation}
              className="flex items-center gap-1"
              title="Start new conversation"
            >
              <RefreshCw className="h-3 w-3" />
              New Session
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {/* Enhanced Context Banner */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Assistant</span>
                {mode === 'enrollment' && (
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                    🎯 Enrollment Mode
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {mode === 'enrollment' && (
                  <>
                    <Badge variant="outline" className="text-xs">Real-time DB</Badge>
                    <Badge variant="outline" className="text-xs">GenAI Guided</Badge>
                    <Badge variant="outline" className="text-xs">RAG Enhanced</Badge>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {mode === 'enrollment' 
                ? 'AI-guided enrollment with structured workflow sequence: Consent → Patient → Provider & Treatment → NPI/Credentialing → Insurance → Clinical & Treatment → Submit'
                : 'General AI assistance with comprehensive knowledge base and multi-model support'
              }
            </p>
          </div>

          {/* Main Content Based on Mode */}
          {mode === 'enrollment' ? (
            <div className="p-6">
              {/* Simple LLM Provider Selection for Enrollment */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle>AI Configuration</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">Select AI provider and conversation mode</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Conversation Mode</Label>
                      <div className="flex gap-2 mt-2">
                        {(['single','multi'] as const).map((m) => (
                          <Button
                            key={m}
                            variant={conversationState.selectedMode === m ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchMode(m)}
                            className="flex-1"
                          >
                            {m === 'single' ? 'Single AI' : 'Multi AI'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">AI Provider</Label>
                      {conversationState.selectedMode === 'single' && (
                        <Select 
                          value={singleModel.provider} 
                          onValueChange={(provider) => setSingleModel(prev => ({ 
                            ...prev, 
                            provider,
                            model: provider === 'openai' ? 'gpt-4.1-2025-04-14' : 
                                   provider === 'claude' ? 'claude-sonnet-4-20250514' : 
                                   'gemini-1.5-pro'
                          }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI GPT</SelectItem>
                            <SelectItem value="claude">Claude</SelectItem>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {conversationState.selectedMode === 'multi' && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Multiple AI providers will respond
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Patient Enrollment Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">Enhanced Patient Enrollment</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      AI-Powered
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Data Captured
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      Audit Ready
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Current Step Content */}
              {/* Enrollment Interface */}
              <div className="mt-6">
                <EnhancedEnrollmentInterface key={resetCounter} isInModal showSectionSummary={false} />
              </div>

              {/* Audit Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Audit mode enabled - All interactions are being logged for compliance. Label Studio is capturing structured data from your responses.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* General AI Chat Interface */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  How can I help you today?
                </h3>
                <p className="text-gray-600 mb-4">Choose how you'd like me to assist you:</p>
              </div>

              {/* Mode Selection */}
              <div className="flex flex-wrap gap-3 justify-center mb-4">
                {(['system','single','multi'] as const).map((m) => (
                  <Button
                    key={m}
                    variant={conversationState.selectedMode === m ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => switchMode(m)}
                    className={`flex items-center gap-2 px-6 py-3 h-auto ${
                      conversationState.selectedMode === m 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{m.toUpperCase()}</div>
                      <div className="text-xs opacity-75">{m === 'system' ? 'System guidance' : m === 'single' ? 'Single model' : 'Multi-model'}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Model Selection Interface */}
              {renderModelSelectionContent()}

              {/* MCP Tools Selection */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 text-gray-700">MCP Tools & Capabilities</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mcpTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className={`cursor-pointer transition-all ${
                        conversationState.selectedMCPTools.includes(tool.id)
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleMCPToolToggle(tool.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm text-gray-900">{tool.name}</h5>
                          <Badge variant={tool.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                            {tool.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{tool.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.capabilities.slice(0, 2).map((cap, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {tool.capabilities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {conversationState.selectedMCPTools.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Conversation</h3>
                    {conversationState.selectedMode === 'multi' && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {modelSelectionMode === 'cross-category' && selectedCrossModels.length > 0 
                            ? `${selectedCrossModels.length} Models` 
                            : 'Split View'}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={handleResetConversation}>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>
                  
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
                        <p className="text-sm text-gray-500">
                          Send me a message and I'll provide you with comprehensive, context-aware responses.
                        </p>
                        {conversationState.selectedMode === 'multi' && modelSelectionMode === 'cross-category' && selectedCrossModels.length > 0 && (
                          <div className="mt-3 flex flex-wrap justify-center gap-1">
                            {selectedCrossModels.slice(0, 3).map((model, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {model.name || `${model.provider} ${model.model}`}
                              </Badge>
                            ))}
                            {selectedCrossModels.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{selectedCrossModels.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
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
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
