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
import { useNavigationSafe } from '@/hooks/useNavigationSafe';

// UI Components
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';
import { SelectedModelConfig } from '@/components/ai';
import { GenieSessionManager } from '@/components/genie/GenieSessionManager';
import { StreamlinedModelSelector } from '@/components/genie/StreamlinedModelSelector';
import { DisclaimerModal } from '@/components/genie/DisclaimerModal';
import { HealthcareStepWizard } from '@/components/genie/HealthcareStepWizard';

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
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [userInfo, setUserInfo] = useState<{ firstName: string; email: string } | null>(null);
  const [showHealthcareWizard, setShowHealthcareWizard] = useState(false);
  const [pendingHealthcarePrompt, setPendingHealthcarePrompt] = useState('');
  
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
  const { navigateSafe } = useNavigationSafe();
  
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
    let systemPrompt = 'You are GENIE, a comprehensive AI assistant with advanced capabilities in healthcare, biotech, and cell & gene therapy.';
    
    if (userInfo) {
      systemPrompt += ` User Information: You are assisting ${userInfo.firstName} (${userInfo.email}). Personalize responses accordingly.`;
    }
    
    if (medicalContext) {
      systemPrompt += ' You specialize in medical and healthcare contexts, with expertise in patient care, medical terminology, healthcare processes, and regulatory compliance.';
    }
    
    if (ragEnabled) {
      systemPrompt += ' You have access to specialized knowledge databases and can provide enhanced contextual responses using RAG (Retrieval-Augmented Generation).';
    }
    
    if (selectedMCPTools.length > 0) {
      systemPrompt += ` You have access to these tools: ${selectedMCPTools.join(', ')}.`;
    }
    
    systemPrompt += ' IMPORTANT: Always remind users that your responses are AI-generated and should be verified with healthcare professionals. When providing medical information, always recommend consulting with qualified Healthcare Providers (HCPs).';
    
    return systemPrompt;
  }, [medicalContext, ragEnabled, selectedMCPTools, userInfo]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      // Update conversational context with user information
      if (userInfo) {
        updateContext(`[User: ${userInfo.firstName}] ${userMessage}`, true);
      } else {
        updateContext(userMessage, true);
      }
      
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

      // Enhance prompt with RAG and user context
      let enhancedPrompt = contextualResponse.enhancedPrompt;
      let contextSources: string[] = [];
      
      // Add user context to prompt if available
      if (userInfo) {
        enhancedPrompt = `[User: ${userInfo.firstName} - ${userInfo.email}] ${enhancedPrompt}`;
      }
      
      if (enabledFeatures.length > 0) {
        try {
          console.log('Enhancing prompt with RAG features:', enabledFeatures);
          const ragResult = await ragService.enhancePromptWithRAG(enhancedPrompt, enabledFeatures);
          enhancedPrompt = ragResult.enhancedPrompt;
          contextSources = ragResult.contextSources;
          
          // Store knowledge contribution for RAG improvement
          if (userInfo && contextSources.length > 0) {
            console.log(`Updating knowledge base with interaction from ${userInfo.firstName}:`, contextSources);
            // This would typically save to the knowledge_base_contributions table
          }
          
          console.log('RAG enhancement successful, sources:', contextSources);
        } catch (error) {
          console.warn('RAG enhancement failed, proceeding with contextual prompt:', error);
        }
      }

      // Enhanced prompt for better media generation accuracy
      let finalPrompt = enhancedPrompt;
      if (finalPrompt.toLowerCase().includes('image') || finalPrompt.toLowerCase().includes('visual') || 
          finalPrompt.toLowerCase().includes('diagram') || finalPrompt.toLowerCase().includes('chart')) {
        finalPrompt += ' Please provide detailed, accurate descriptions and consider visual elements in your response. If describing medical or scientific processes, include precise terminology and current best practices.';
      }

      // Generate AI response(s)
      if (currentMode === 'multi' && selectedModels.length > 1) {
        // Multi-model mode with enhanced accuracy
        const responses = await Promise.all(
          selectedModels.map(async (model, index) => {
            const modelSpecificPrompt = finalPrompt + (index === 0 ? 
              ' Focus on primary analysis and key insights.' : 
              ` Provide alternative perspective #${index + 1} with complementary insights.`);
            
            return await generateResponse({
              provider: (model.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: model.model,
              prompt: modelSpecificPrompt,
              systemPrompt: buildSystemPrompt(),
              temperature: 0.6, // Slightly lower for better accuracy
              maxTokens: 1200
            }, { silent: true });
          })
        );
        
        // Add each response with proper timing
        for (let i = 0; i < responses.length; i++) {
          const resp = responses[i];
          if (resp && resp.content) {
            // Add slight delay between responses for better UX
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            addMessage({
              role: 'assistant',
              content: resp.content,
              timestamp: new Date().toISOString(),
              provider: (selectedModels[i]?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: selectedModels[i]?.model || 'gpt-4o-mini',
              metadata: { 
                ragEnhanced: contextSources.length > 0,
                modelIndex: i,
                totalModels: selectedModels.length
              }
            });
          }
        }
        
        if (responses.every(r => !r)) {
          showError('AI request failed', 'AI service is not reachable. Please check configuration.');
        }
      } else {
        // Single model response with enhanced accuracy
        const primaryModel = selectedModels.find(m => m.role === 'primary') || selectedModels[0];
        const resp = await generateResponse({
          provider: (primaryModel?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
          model: primaryModel?.model || 'gpt-4o-mini',
          prompt: finalPrompt,
          systemPrompt: buildSystemPrompt(),
          temperature: 0.6, // Slightly lower for better accuracy
          maxTokens: 1500
        });

        if (resp && resp.content) {
          addMessage({
            role: 'assistant',
            content: resp.content,
            timestamp: new Date().toISOString(),
            provider: (primaryModel?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
            model: primaryModel?.model || 'gpt-4o-mini',
            metadata: { 
              ragEnhanced: contextSources.length > 0,
              enhancedAccuracy: true
            }
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
        className={`fixed z-50 bg-background border shadow-2xl flex flex-col transition-all duration-300 ${
          isMaximized 
            ? 'inset-0 w-full h-full rounded-none' 
            : isMinimized 
              ? 'bottom-4 right-4 w-80 h-16 rounded-lg' 
              : 'bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-[600px] rounded-lg'
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
              {/* Model Selection Toggle */}
              <Select value={currentMode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="multi">Multi</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Action Buttons */}
              <Button variant="ghost" size="sm" onClick={() => {
                // Create a new conversation
                resetConversation();
                showSuccess('New conversation started', 'Your previous conversation is saved in history');
              }} title="New Conversation">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                // Save current session state
                if (state.messages.length > 0) {
                  try {
                    const sessionData = {
                      conversationId: state.conversationId,
                      messages: state.messages,
                      timestamp: new Date().toISOString(),
                      mode: state.selectedMode,
                      model: state.selectedModel
                    };
                    localStorage.setItem(`genie_session_${state.conversationId}`, JSON.stringify(sessionData));
                    showSuccess('Session saved', 'Your conversation has been saved to local storage');
                  } catch (error) {
                    showError('Save failed', 'Unable to save session');
                  }
                } else {
                  showError('Nothing to save', 'Start a conversation first');
                }
              }} title="Save Session">
                <Database className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()} title="Refresh">
                <span className="text-sm">⟲</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowModelSelector(true)} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSessionManager(true)} title="History">
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} title="Minimize">
                <span className="text-sm">_</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMaximized(!isMaximized)} title="Maximize">
                <span className="text-sm">□</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} title="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Status Bar with Stepwise Agent Access */}
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
                  
                  <div className="flex items-center gap-2">
                    {context === 'patient-enrollment' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          if (confirm('Switch to specialized MCP Stepwise Agent? This will start a new enrollment session with advanced capabilities. Your current Genie conversation will be saved.')) {
                            navigateSafe('/patient-onboarding?agent=mcp');
                            onClose();
                          }
                        }}
                      >
                        → MCP Stepwise
                      </Button>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {currentMode === 'single' ? '1 Model' : currentMode === 'multi' ? `${selectedModels.length} Models` : currentMode.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Conversation Area - Multi-Model Support */}
              <div 
                className={`flex-1 overflow-hidden ${
                  isMaximized ? 'max-h-[calc(100vh-160px)]' : 'max-h-[450px]'
                }`}
              >
                {state.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
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
                      <strong className="text-foreground">Always consult your healthcare provider for medical decisions.</strong>
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

                    {/* Enhanced CTA to patient onboarding with stepwise transition */}
                    <div className="mt-6 space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border">
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          Advanced AI Enrollment Agents
                        </h5>
                        <p className="text-xs text-muted-foreground mb-3">
                          Switch to specialized enrollment agents with advanced capabilities
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => { 
                            if (confirm('This will start a new MCP-powered enrollment session. Your current Genie conversation will remain saved. Continue?')) {
                              navigateSafe('/patient-onboarding?flow=mcp'); 
                              onClose(); 
                            }
                          }} className="bg-green-600 hover:bg-green-700">
                            MCP Stepwise Agent
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { 
                            if (confirm('This will start a new conversational enrollment session. Your current Genie conversation will remain saved. Continue?')) {
                              navigateSafe('/patient-onboarding?flow=conversational'); 
                              onClose(); 
                            }
                          }}>
                            Conversational AI
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { 
                            if (confirm('This will start a new structured enrollment session. Your current Genie conversation will remain saved. Continue?')) {
                              navigateSafe('/patient-onboarding?flow=structured'); 
                              onClose(); 
                            }
                          }}>
                            AI Structure Agent
                          </Button>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                          <span>⚠️</span>
                          Note: Switching will start a new specialized session
                        </p>
                      </div>
                      
                      <Button size="sm" variant="ghost" onClick={() => { 
                        navigateSafe('/patient-onboarding'); 
                        onClose(); 
                      }} className="w-full">
                        View All Enrollment Options
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Multi-Model Split Screen Layout */}
                    {currentMode === 'multi' && selectedModels.length > 1 ? (
                      <div className="flex h-full">
                        {selectedModels.map((model, modelIndex) => {
                          // Filter messages for this specific model
                          const userMessages = state.messages.filter(m => m.role === 'user');
                          const assistantMessages = state.messages.filter(m => m.role === 'assistant');
                          
                          const modelMessages = userMessages.reduce((acc, userMsg, userIndex) => {
                            acc.push(userMsg);
                            const responseIndex = userIndex * selectedModels.length + modelIndex;
                            if (assistantMessages[responseIndex]) {
                              acc.push(assistantMessages[responseIndex]);
                            }
                            return acc;
                          }, [] as any[]);

                          return (
                            <div key={`model-${modelIndex}`} className={`flex-1 ${selectedModels.length > 1 ? 'border-r border-muted/20' : ''} ${selectedModels.length > 2 ? 'min-w-[280px]' : ''} last:border-r-0`}>
                              {/* Model Header */}
                              <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-muted/20 p-3 z-10">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-medium">
                                    {model.provider.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-medium truncate">
                                    {model.model}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Messages for this model */}
                              <div className="overflow-y-auto h-[calc(100%-60px)] p-3 space-y-3">
                                <AnimatePresence>
                                  {modelMessages.map((message, msgIndex) => (
                                    <MessageComponent
                                      key={`model-${modelIndex}-msg-${msgIndex}-${message.timestamp}`}
                                      message={message}
                                      isLast={msgIndex === modelMessages.length - 1}
                                    />
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Single Model Layout */
                      <div className="h-full overflow-y-auto p-4 space-y-3">
                        <AnimatePresence>
                          {state.messages.map((msg, index) => (
                            <MessageComponent 
                              key={`${msg.timestamp}-${index}-${msg.role}`}
                              message={msg}
                              isLast={index === state.messages.length - 1}
                            />
                          ))}
                        </AnimatePresence>
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <TypingIndicator />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input Area - Fixed Layout */}
              <div className="border-t bg-background">
                <div className="p-4">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={
                          currentMode === 'multi' && selectedModels.length > 1
                            ? `Ask ${selectedModels.length} AI models simultaneously...`
                            : selectedModels.length > 0 
                              ? `Message ${selectedModels[0]?.provider || 'AI'}...` 
                              : "Configure models to start chatting..."
                        }
                        className="w-full min-h-[60px] max-h-32 p-3 pr-16 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                        disabled={isLoading || selectedModels.length === 0}
                        rows={2}
                      />
                      <div className="absolute right-3 bottom-2 text-xs text-muted-foreground pointer-events-none">
                        {message.length}/2000
                      </div>
                    </div>
                    <Button 
                      onClick={handleSend} 
                      disabled={isLoading || !message.trim() || selectedModels.length === 0}
                      className="px-4 py-3 h-[60px] rounded-lg"
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-muted/10">
                    <div className="flex gap-2 items-center">
                      {userInfo && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {userInfo.firstName}
                        </Badge>
                      )}
                      {isLoading && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          <Loader2 className="h-2 w-2 animate-spin mr-1" />
                          {currentMode === 'multi' && selectedModels.length > 1 
                            ? `Processing ${selectedModels.length} responses...`
                            : 'Generating response...'
                          }
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {currentMode === 'multi' && selectedModels.length > 1 
                        ? `Split: ${selectedModels.length} models`
                        : selectedModels.length > 0
                          ? `${selectedModels[0]?.provider || 'OpenAI'} • ${selectedModels[0]?.model || 'gpt-4o-mini'}`
                          : 'No models selected'
                      }
                    </div>
                  </div>
                </div>
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

      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={(userInfo) => {
          setUserInfo(userInfo);
          setShowDisclaimer(false);
          console.log('User accepted disclaimer:', userInfo);
        }}
        onDecline={() => {
          setShowDisclaimer(false);
          onClose();
        }}
      />

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