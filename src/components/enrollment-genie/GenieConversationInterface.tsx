/**
 * GENIE CONVERSATION INTERFACE - SIMPLIFIED VERSION
 * Streamlined AI assistant with clean layout and proper context management
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  X, 
  Send,
  Loader2,
  Settings,
  Brain,
  Database,
  Microscope,
  Wrench,
  History,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterToast } from '@/hooks/useMasterToast';

// Core AI and conversation hooks
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState } from '@/hooks/useConversationState';
import { useConversationalContext } from '@/hooks/useConversationalContext';

// Genie-specific hooks and services
import { ragService } from '@/services/ragService';
import { useGenieState } from '@/hooks/useGenieState';
import { useMasterAuth } from '@/hooks/useMasterAuth';

// UI Components
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';
import { SelectedModelConfig } from '@/components/ai';
import { GenieSessionManager } from '@/components/genie/GenieSessionManager';
import { StreamlinedModelSelector } from '@/components/genie/StreamlinedModelSelector';

// Assets
import genieLogoImg from '@/assets/genie-logo.png';
import genieAnimatedImg from '@/assets/genie-animated.png';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
  context?: string;
  mode?: 'system' | 'single' | 'multi' | 'publish' | 'general';
  onModeChange?: (mode: 'system' | 'single' | 'multi' | 'publish' | 'general') => void;
}

export const GenieConversationInterface: React.FC<GenieConversationInterfaceProps> = ({
  isOpen,
  onClose,
  tenantId,
  userId,
  context = 'general',
  mode = 'system',
  onModeChange
}) => {
  // State management
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Model and feature configuration
  const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [medicalContext, setMedicalContext] = useState(false);
  const [ragEnabled, setRAGEnabled] = useState(false);
  
  // Hooks
  const { generateResponse } = useUniversalAI();
  const { state, addMessage, updateConversationConfig, switchMode, resetConversation } = useConversationState();
  const { 
    currentSession, 
    setCurrentSession, 
    saveSession, 
    updateSession, 
    createNewSession 
  } = useGenieState({ autoLoad: false });
  const { showError, showSuccess } = useMasterToast();
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { updateContext, generateContextualResponse } = useConversationalContext();
  
  const currentMode = (state?.selectedMode as any) || mode;

  // Authentication check
  useEffect(() => {
    if (isOpen && !authLoading && !isAuthenticated) {
      showError('Authentication required', 'Please log in to use Genie AI features');
      onClose();
      window.location.href = '/login';
      return;
    }
  }, [isOpen, isAuthenticated, authLoading, showError, onClose]);

  // Auto-detect medical context
  useEffect(() => {
    if (context && (context.includes('medical') || context.includes('patient') || context.includes('health'))) {
      setMedicalContext(true);
      setEnabledFeatures(prev => prev.includes('medical') ? prev : [...prev, 'medical']);
    }
  }, [context]);

  // Update conversation state when configuration changes
  useEffect(() => {
    updateConversationConfig({
      selectedMode: mode as any,
      selectedModel: selectedModels[0]?.model || 'gpt-4o-mini',
      selectedModelType: (selectedModels[0]?.category === 'small' ? 'slm' : 
                         selectedModels[0]?.category === 'vision' ? 'vlm' : 'llm') as 'llm' | 'slm' | 'vlm',
      enabledFeatures,
      selectedMCPTools
    });
  }, [mode, selectedModels, enabledFeatures, selectedMCPTools, updateConversationConfig]);

  const handleModeChange = useCallback((newMode: 'system' | 'single' | 'multi' | 'publish') => {
    switchMode(newMode as any);
    onModeChange?.(newMode);
    if (newMode === 'multi' && selectedModels.length < 2) {
      setShowModelSelector(true);
    }
  }, [switchMode, onModeChange, selectedModels]);

  const buildSystemPrompt = useCallback(() => {
    let systemPrompt = 'You are a comprehensive AI assistant with advanced capabilities.';
    
    if (medicalContext) {
      systemPrompt += ' You specialize in medical and healthcare contexts, with expertise in patient care, medical terminology, and healthcare processes.';
    }
    
    if (ragEnabled) {
      systemPrompt += ' You have access to specialized knowledge databases and can provide enhanced contextual responses.';
    }
    
    if (selectedMCPTools.length > 0) {
      systemPrompt += ` You have access to these tools: ${selectedMCPTools.join(', ')}.`;
    }
    
    return systemPrompt;
  }, [medicalContext, ragEnabled, selectedMCPTools]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      // Update conversational context
      updateContext(userMessage, true);
      
      // Generate contextual enhancement
      const contextualResponse = generateContextualResponse(userMessage);
      
      // Add user message to conversation
      addMessage({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        provider: (selectedModels[0]?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
        model: selectedModels[0]?.model || 'gpt-4o-mini'
      });

      // Enhance prompt with RAG if enabled
      let enhancedPrompt = contextualResponse.enhancedPrompt;
      let contextSources: string[] = [];
      
      if (enabledFeatures.length > 0) {
        try {
          console.log('Enhancing prompt with RAG features:', enabledFeatures);
          const ragResult = await ragService.enhancePromptWithRAG(enhancedPrompt, enabledFeatures);
          enhancedPrompt = ragResult.enhancedPrompt;
          contextSources = ragResult.contextSources;
          console.log('RAG enhancement successful, sources:', contextSources);
        } catch (error) {
          console.warn('RAG enhancement failed, proceeding with contextual prompt:', error);
        }
      }

      // Generate AI response(s)
      if (currentMode === 'multi' && selectedModels.length > 1) {
        // Multi-model mode
        const responses = await Promise.all(
          selectedModels.map(async model => {
            return await generateResponse({
              provider: (model.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: model.model,
              prompt: enhancedPrompt,
              systemPrompt: buildSystemPrompt(),
              temperature: 0.7,
              maxTokens: 1000
            }, { silent: true });
          })
        );
        
        // Add each response
        responses.forEach((resp, index) => {
          if (resp && resp.content) {
            addMessage({
              role: 'assistant',
              content: resp.content,
              timestamp: new Date().toISOString(),
              provider: (selectedModels[index]?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: selectedModels[index]?.model || 'gpt-4o-mini'
            });
          }
        });
        
        if (responses.every(r => !r)) {
          showError('AI request failed', 'AI service is not reachable. Please check configuration.');
        }
      } else {
        // Single model response
        const primaryModel = selectedModels.find(m => m.role === 'primary') || selectedModels[0];
        const resp = await generateResponse({
          provider: (primaryModel?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
          model: primaryModel?.model || 'gpt-4o-mini',
          prompt: enhancedPrompt,
          systemPrompt: buildSystemPrompt(),
          temperature: 0.7,
          maxTokens: 1000
        });

        if (resp && resp.content) {
          addMessage({
            role: 'assistant',
            content: resp.content,
            timestamp: new Date().toISOString(),
            provider: (primaryModel?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
            model: primaryModel?.model || 'gpt-4o-mini'
          });
        }
      }
    } catch (error: any) {
      console.error('Error generating response:', error);
      const friendly = error?.message?.includes('Failed to fetch')
        ? 'AI service is not reachable. Please check Edge Functions configuration.'
        : (error instanceof Error ? error.message : 'Unknown error');
      
      showError('Failed to generate response', friendly);
      
      addMessage({
        role: 'assistant',
        content: `Unable to generate a response: ${friendly}`,
        timestamp: new Date().toISOString(),
        provider: selectedModels[0]?.provider as any,
        model: selectedModels[0]?.model
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className={`fixed z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-xl flex flex-col transition-all duration-300 ${
          isMaximized 
            ? 'top-0 right-0 left-0 bottom-0 w-full h-full' 
            : isMinimized 
              ? 'top-4 right-4 w-80 h-16' 
              : 'top-0 right-0 h-full w-[500px] border-l rounded-l-lg'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Simplified Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded-lg">
                <img 
                  src={genieLogoImg} 
                  alt="GENIE" 
                  className="h-8 w-auto object-contain"
                  loading="eager"
                  onError={(e) => {
                    console.warn('GENIE logo failed to load');
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-base bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  GENIE AI
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} • {currentMode} mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowModelSelector(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSessionManager(true)}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
                <span className="text-sm">_</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMaximized(!isMaximized)}>
                <span className="text-sm">□</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Status Bar */}
              <div className="px-3 py-2 bg-muted/20 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={medicalContext}
                      onCheckedChange={setMedicalContext}
                      className="scale-75"
                    />
                    <span className="text-xs text-muted-foreground">Medical Context</span>
                    
                    <Switch
                      checked={ragEnabled}
                      onCheckedChange={setRAGEnabled}
                      className="scale-75 ml-3"
                    />
                    <span className="text-xs text-muted-foreground">RAG Enabled</span>
                    
                    {selectedMCPTools.length > 0 && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        {selectedMCPTools.length} tools active
                      </Badge>
                    )}
                  </div>
                  
                  <Select value={currentMode} onValueChange={handleModeChange}>
                    <SelectTrigger className="w-24 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="multi">Multi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conversation Area - Simplified */}
              <div 
                className={`flex-1 overflow-y-auto p-4 space-y-3 ${
                  isMaximized ? 'max-h-[calc(100vh-160px)]' : 'max-h-[450px]'
                }`}
              >
                {state.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="mb-6">
                      <img 
                        src={genieAnimatedImg} 
                        alt="GENIE" 
                        className="h-12 w-auto object-contain opacity-60"
                        loading="eager"
                        onError={(e) => {
                          console.warn('GENIE animated image failed to load');
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h4 className="text-base font-medium text-foreground mb-2">
                      Ready to Help
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Ask me about biotech, medical research, data analysis, or any topic you need assistance with.
                    </p>
                    
                    {/* Active Features Display */}
                    {(medicalContext || ragEnabled || selectedMCPTools.length > 0) && (
                      <div className="mt-4 flex gap-2 flex-wrap justify-center">
                        {medicalContext && (
                          <Badge variant="secondary" className="text-xs">
                            <Microscope className="h-3 w-3 mr-1" />
                            Medical
                          </Badge>
                        )}
                        {ragEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            <Database className="h-3 w-3 mr-1" />
                            Knowledge
                          </Badge>
                        )}
                        {selectedMCPTools.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Wrench className="h-3 w-3 mr-1" />
                            {selectedMCPTools.length} Tools
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {state.messages.map((msg, index) => (
                      <MessageComponent 
                        key={`${msg.timestamp}-${index}-${msg.role}`}
                        message={msg}
                      />
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <TypingIndicator />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Simplified Input Area */}
              <div className="border-t bg-background p-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={selectedModels.length > 0 
                        ? `Message ${selectedModels.map(m => m.provider).join(' & ')}...` 
                        : "Configure models to start chatting..."
                      }
                      className="w-full min-h-[60px] max-h-32 p-3 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={isLoading || selectedModels.length === 0}
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !message.trim() || selectedModels.length === 0}
                    className="px-4 py-3 h-[60px] rounded-lg"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Active Models Display */}
                {selectedModels.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Active: {selectedModels.map(m => `${m.provider}:${m.model}`).join(', ')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Simplified Configuration Modal */}
      <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              GENIE Configuration
            </DialogTitle>
          </DialogHeader>
          <StreamlinedModelSelector
            selectedModels={selectedModels}
            onModelsChange={setSelectedModels}
            selectedFeatures={enabledFeatures}
            onFeaturesChange={setEnabledFeatures}
            selectedMCPTools={selectedMCPTools}
            onMCPToolsChange={setSelectedMCPTools}
            mode={mode === 'publish' || mode === 'general' ? 'system' : mode}
          />
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModelSelector(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModelSelector(false)}>
              Save & Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Manager Modal */}
      <GenieSessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        currentSessionId={currentSession?.conversation_id}
        onSessionSelect={(sessionId) => {
          // Handle session selection logic here
          setShowSessionManager(false);
        }}
      />
    </>
  );
};