/**
 * ENHANCED GENIE CONVERSATION INTERFACE
 * Refactored with proper state management, RAG integration, and dropdown options
 */
import React, { useState, useEffect } from 'react';
import { NonModalDialogRoot as Dialog, NonModalDialogContent as DialogContent } from '@/components/ui/non-modal-dialog';
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

  // Page awareness integration
  const pageAware = usePageAwareEnrollment();

  // Determine if enrollment toggle should be visible
  const shouldShowEnrollmentToggle = () => {
    const pageContext = pageAware.getPageContext();
    return pageContext.isPageSpecific && pageContext.config?.moduleType === 'patient';
  };

  // Auto-set mode based on page context  
  useEffect(() => {
    if (shouldShowEnrollmentToggle() && mode === 'general' && onModeChange) {
      onModeChange('enrollment');
    }
  }, [mode, onModeChange, pageAware]);

  // Use conversation state management
  const conversationState = useConversationState({
    tenantId,
    userId,
    context
  });

  // Initialize Universal AI hooks
  const { generateResponse } = useUniversalAI();

  const {
    conversationModes,
    handleModeSelect,
    addMessage,
    resetConversation,
    updateMessage,
    startConversation
  } = conversationState;

  const handleResetConversation = () => {
    resetConversation();
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!conversationState.isActive) startConversation();
    
    const userMessageId = addMessage({ 
      role: 'user', 
      content: message,
      timestamp: new Date()
    });
    
    setMessage('');
    setIsLoading(true);

    try {
      if (conversationState.selectedMode === 'single') {
        // Single model response
        const response = await generateResponse({
          messages: [...conversationState.messages, { role: 'user', content: message }],
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000
        });
        
        addMessage({ 
          role: 'assistant', 
          content: response,
          modelInfo: { provider: 'openai', model: 'gpt-4' }
        });
      } else if (conversationState.selectedMode === 'multi') {
        // Multi-model responses
        const models = selectedCrossModels.length > 0 ? selectedCrossModels : [
          { provider: 'openai', model: 'gpt-4', name: 'GPT-4' },
          { provider: 'anthropic', model: 'claude-3-sonnet', name: 'Claude 3 Sonnet' }
        ];

        const responses = await Promise.allSettled(models.map(async (m) => {
          const response = await generateResponse({
            messages: [...conversationState.messages, { role: 'user', content: message }],
            model: m.model,
            temperature: 0.7,
            maxTokens: 1000
          });
          return { response, modelInfo: m };
        }));

        responses.forEach((result) => {
          if (result.status === 'fulfilled') {
            addMessage({
              role: 'assistant',
              content: result.value.response,
              modelInfo: result.value.modelInfo
            });
          }
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        modelInfo: { provider: 'error', model: 'error' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    startConversation();
  };

  const handleMCPToolToggle = (toolId: string) => {
    conversationState.toggleMCPTool(toolId);
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
              <EnhancedModelSelector />
            )}

            {modelSelectionMode === 'cross-category' && (
              <CrossCategoryModelSelector 
                selectedModels={selectedCrossModels}
                onSelectionChange={setSelectedCrossModels}
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
                onSelectionChange={setSelectedCrossModels}
                multiSelect={true}
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
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
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
            {/* Page-Aware Mode Toggle */}
            {shouldShowEnrollmentToggle() && (
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={mode === 'general' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onModeChange?.('general')}
                  className="px-3 py-1.5 h-8 text-xs font-medium"
                >
                  General
                </Button>
                <Button
                  variant={mode === 'enrollment' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onModeChange?.('enrollment')}
                  className="px-3 py-1.5 h-8 text-xs font-medium"
                >
                  Enrollment
                </Button>
              </div>
            )}
            
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

        <ScrollArea className="flex-1">
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
              <EnhancedEnrollmentInterface 
                onSubmit={(data) => {
                  console.log('📋 Enrollment completed via Genie:', data);
                  // Handle enrollment completion with real-time DB updates
                }}
              />
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
                {conversationModes.filter(mode => !mode.isFeature).map((mode) => (
                  <Button
                    key={mode.id}
                    variant={mode.active ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleModeSelect(mode.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 h-auto ${
                      mode.active 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {mode.icon}
                    <div className="text-left">
                      <div className="font-medium">{mode.title}</div>
                      <div className="text-xs opacity-75">{mode.subtitle}</div>
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
