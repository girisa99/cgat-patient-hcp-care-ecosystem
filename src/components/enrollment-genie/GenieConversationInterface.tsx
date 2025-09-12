/**
 * GENIE CONVERSATION INTERFACE (COMPREHENSIVE AI ASSISTANT)
 * Advanced multi-model AI assistant with mode switching, medical context processing,
 * RAG integration, Label Studio support, and MCP tools
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  X, 
  User, 
  Send,
  Loader2,
  Settings,
  Brain,
  Database,
  FileText,
  Microscope,
  BookOpen,
  Zap,
  Eye,
  Wrench,
  Target,
  MessageSquare,
  GitBranch,
  Workflow,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

// Core AI and conversation hooks
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState } from '@/hooks/useConversationState';
import { useLabelStudio } from '@/hooks/useLabelStudio';

// Genie-specific hooks and services
import { ragService } from '@/services/ragService';
import { useGenieState } from '@/hooks/useGenieState';

// UI Components
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';
import { AnimatedGenieResponse } from './AnimatedGenieResponse';

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
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [medicalContext, setMedicalContext] = useState(false);
  const [ragEnabled, setRAGEnabled] = useState(false);
  const [labelStudioEnabled, setLabelStudioEnabled] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  
  const { generateResponse } = useUniversalAI();
  const { state, addMessage, updateConversationConfig, switchMode, resetConversation } = useConversationState();
  const { listProjects } = useLabelStudio();
  const { currentConfig, saveConfiguration, currentSession, updateSession, createNewSession } = useGenieState();

  // Auto-detect medical context
  useEffect(() => {
    if (context && (context.includes('medical') || context.includes('patient') || context.includes('health'))) {
      setMedicalContext(true);
      setEnabledFeatures(prev => prev.includes('medical') ? prev : [...prev, 'medical']);
    }
  }, [context]);

  // Auto-save configuration changes (disabled to prevent continuous API calls)
  /*
  useEffect(() => {
    if (currentConfig && saveConfiguration) {
      const configToSave = {
        configuration_name: 'auto_save',
        selected_mode: mode as 'system' | 'single' | 'multi',
        selected_models: selectedModels.map(m => m.model),
        left_model: selectedModels.find(m => m.role === 'primary')?.model || 'GEMINI',
        right_model: selectedModels.find(m => m.role === 'secondary')?.model || 'GPT',
        selected_model_type: selectedModels[0]?.category as 'llm' | 'slm' | 'vlm' || 'llm',
        enabled_features: enabledFeatures,
        selected_mcp_tools: selectedMCPTools,
        knowledge_base: knowledgeBase,
        medical_context: medicalContext,
        is_default: true
      };
      
      // Debounce the save to avoid too many calls
      const timeoutId = setTimeout(() => {
        saveConfiguration(configToSave);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mode, selectedModels, enabledFeatures, selectedMCPTools, knowledgeBase, medicalContext, currentConfig, saveConfiguration]);

  // Auto-save conversation messages (disabled to prevent continuous API calls)
  useEffect(() => {
    if (currentSession && updateSession && state.messages.length > 0) {
      const timeoutId = setTimeout(() => {
        updateSession(state.conversationId, {
          messages: state.messages,
          configuration_snapshot: {
            mode,
            selectedModels,
            enabledFeatures,
            selectedMCPTools
          }
        });
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.messages, currentSession, updateSession, state.conversationId, mode, selectedModels, enabledFeatures, selectedMCPTools]);
  */

  // Update conversation state when mode or models change
  useEffect(() => {
    updateConversationConfig({
      selectedMode: mode as any,
      selectedModel: selectedModels[0]?.model || 'GEMINI',
      selectedModelType: (selectedModels[0]?.category === 'small' ? 'slm' : 
                         selectedModels[0]?.category === 'vision' ? 'vlm' : 'llm') as 'llm' | 'slm' | 'vlm',
      enabledFeatures,
      selectedMCPTools
    });
  }, [mode, selectedModels, enabledFeatures, selectedMCPTools, updateConversationConfig]);

  const handleModeChange = useCallback((newMode: 'system' | 'single' | 'multi' | 'publish') => {
    switchMode(newMode as any);
    onModeChange?.(newMode);
  }, [switchMode, onModeChange]);

  const handleFeatureToggle = useCallback((feature: string) => {
    setEnabledFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  }, []);

  const handleMCPToolToggle = useCallback((tool: string) => {
    setSelectedMCPTools(prev =>
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  }, []);

  const buildSystemPrompt = useCallback(() => {
    let systemPrompt = 'You are a comprehensive AI assistant with advanced capabilities.';
    
    if (medicalContext) {
      systemPrompt += ' You specialize in medical and healthcare contexts, with expertise in patient care, medical terminology, and healthcare processes.';
    }
    
    if (ragEnabled && knowledgeBase) {
      systemPrompt += ` You have access to specialized knowledge from: ${knowledgeBase}.`;
    }
    
    if (labelStudioEnabled) {
      systemPrompt += ' You can assist with data labeling, annotation tasks, and machine learning data preparation.';
    }
    
    if (selectedMCPTools.length > 0) {
      systemPrompt += ` You have access to these tools: ${selectedMCPTools.join(', ')}.`;
    }
    
    return systemPrompt;
  }, [medicalContext, ragEnabled, knowledgeBase, labelStudioEnabled, selectedMCPTools]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      addMessage({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        provider: (selectedModels[0]?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
        model: selectedModels[0]?.model || 'gpt-4'
      });

      // Enhance prompt with RAG if enabled (with error handling to prevent fetch errors)
      let enhancedPrompt = userMessage;
      let contextSources: string[] = [];
      
      if (enabledFeatures.length > 0) {
        try {
          console.log('Enhancing prompt with RAG features:', enabledFeatures);
          const ragResult = await ragService.enhancePromptWithRAG(userMessage, enabledFeatures);
          enhancedPrompt = ragResult.enhancedPrompt;
          contextSources = ragResult.contextSources;
          console.log('RAG enhancement successful, sources:', contextSources);
        } catch (error) {
          console.warn('RAG enhancement failed, proceeding with original prompt:', error);
          // Don't throw error, just continue with original prompt
        }
      }

      let responses: any[] = [];

      if (mode === 'multi' && selectedModels.length > 1) {
        // Multi-model mode - get responses from multiple models using universalAI
        responses = await Promise.all(
          selectedModels.map(async model => {
            return await generateResponse({
              provider: (model.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: model.model,
              prompt: enhancedPrompt,
              systemPrompt: buildSystemPrompt(),
              temperature: 0.7,
              maxTokens: 1000
            });
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
              model: selectedModels[index]?.model || 'gpt-4'
            });
          }
        });
      } else {
        // Single model response using universalAI
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
    } catch (error) {
      console.error('Error generating response:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableMCPTools = [
    'filesystem', 'memory', 'web-search', 'database', 'api-client', 
    'document-processor', 'image-analyzer', 'code-executor'
  ];

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed top-0 right-0 h-full w-[450px] z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l rounded-l-lg shadow-xl flex flex-col"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-primary/10 rounded-lg">
                <img 
                  src={genieLogoImg} 
                  alt="GENIE - Cell & Gene Technology Navigator" 
                  className="h-12 w-auto object-contain rounded-lg"
                  loading="eager"
                  onError={(e) => {
                    console.warn('GENIE logo failed to load');
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  GENIE
                </h3>
                <p className="text-xs text-muted-foreground font-medium">I am your technology navigator</p>
                <p className="text-xs text-muted-foreground">
                  {mode === 'multi' ? 'Multi-Model Chat' : medicalContext ? 'Medical AI' : 'AI Assistant'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                resetConversation();
                createNewSession();
              }}>
                <RotateCcw className="h-4 w-4 mr-1" />
                New
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowModelSelector(true)}>
                <Settings className="h-4 w-4 mr-1" />
                Config
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector & Quick Actions */}
          <div className="p-3 border-b bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-3 w-3" />
                      System
                    </div>
                  </SelectItem>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Single
                    </div>
                  </SelectItem>
                  <SelectItem value="multi">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-3 w-3" />
                      Multi
                    </div>
                  </SelectItem>
                  <SelectItem value="publish">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Publish
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/enrollment-workspace'}
                  className="h-8 px-2 text-xs"
                >
                  <User className="h-3 w-3 mr-1" />
                  Enroll
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/gen-ai'}
                  className="h-8 px-2 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Gen AI
                </Button>
              </div>
            </div>
            
            {/* Active Features */}
            <div className="flex gap-1 flex-wrap">
              {medicalContext && <Badge variant="secondary" className="text-xs h-5"><Microscope className="h-2 w-2 mr-1" />Medical</Badge>}
              {ragEnabled && <Badge variant="secondary" className="text-xs h-5"><Database className="h-2 w-2 mr-1" />RAG</Badge>}
              {labelStudioEnabled && <Badge variant="secondary" className="text-xs h-5"><FileText className="h-2 w-2 mr-1" />Label</Badge>}
              {selectedMCPTools.length > 0 && <Badge variant="secondary" className="text-xs h-5"><Wrench className="h-2 w-2 mr-1" />Tools({selectedMCPTools.length})</Badge>}
              {selectedModels.length > 0 && <Badge variant="secondary" className="text-xs h-5"><Brain className="h-2 w-2 mr-1" />Models({selectedModels.length})</Badge>}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {mode === 'multi' && selectedModels.length > 1 ? (
              /* Split Screen for Multi-Model */
              <div className="flex-1 flex flex-col">
                <div className="p-2 border-b bg-muted/10">
                  <p className="text-xs text-muted-foreground text-center">Multi-Model Conversation</p>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-1">
                  {selectedModels.slice(0, 2).map((model, index) => (
                    <div key={index} className="flex flex-col border-r last:border-r-0">
                      {/* Model Header */}
                      <div className="p-2 border-b bg-muted/5">
                        <div className="flex items-center gap-1">
                          {model.category === 'llm' && <Brain className="h-3 w-3" />}
                          {model.category === 'small' && <Zap className="h-3 w-3" />}
                          {model.category === 'vision' && <Eye className="h-3 w-3" />}
                          {model.category === 'mcp' && <Wrench className="h-3 w-3" />}
                          <span className="text-xs font-medium">{model.name}</span>
                        </div>
                      </div>
                      
                      {/* Model Conversation */}
                      <div className="flex-1 p-2 overflow-y-auto max-h-[300px]">
                        {state.messages
                          .filter(msg => msg.role === 'user' || msg.model === model.model)
                          .map((msg, msgIndex) => (
                            <div key={msgIndex} className={`mb-2 text-xs ${msg.role === 'user' ? 'text-blue-600' : 'text-foreground'}`}>
                              <div className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 ml-4' : 'bg-muted/50 mr-4'}`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Single Model Conversation */
              <div className="flex-1 flex flex-col">
                <div className="p-2 border-b bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    {mode === 'system' && 'System mode: Auto-configured capabilities'}
                    {mode === 'single' && 'Single model conversation'}
                    {mode === 'publish' && 'Publishing mode: Content creation optimized'}
                  </p>
                </div>
                
                 {/* Conversation Display */}
                <div className="flex-1 space-y-3 p-3 overflow-y-auto">
                  {state.messages.map((msg, index) => (
                    msg.role === 'assistant' ? (
                      <AnimatedGenieResponse 
                        key={index} 
                        isVisible={true} 
                        message={msg.content}
                      />
                    ) : (
                      <MessageComponent key={index} message={msg} />
                    )
                  ))}
                  
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AnimatedGenieResponse isVisible={true} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {/* Message Input */}
            <div className="p-3 border-t bg-background/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={medicalContext ? "Ask about medical topics..." : "Ask me anything..."}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Configuration Dialog */}
      <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Genie Configuration
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="rag">RAG/KB</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="models" className="mt-4">
              <UniversalModelSelector
                onModelsSelect={(models) => {
                  setSelectedModels(models);
                  toast({ title: 'Models Updated', description: `Selected ${models.length} models` });
                }}
                selectedModels={selectedModels}
                mode={mode === 'general' ? 'single' : (mode as any)}
                enabledFeatures={enabledFeatures}
                maxSelections={mode === 'multi' ? 6 : 1}
                defaultSelectionMode={mode === 'multi' ? 'cross-category' : 'single'}
              />
            </TabsContent>
            
            <TabsContent value="context" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Medical Context</label>
                  <Switch checked={medicalContext} onCheckedChange={setMedicalContext} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enabled Features</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['medical', 'publication', 'research', 'analysis', 'coding', 'creative'].map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={enabledFeatures.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="rounded"
                        />
                        <label className="text-sm capitalize">{feature}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Context: {context}</label>
                  <p className="text-xs text-muted-foreground">
                    Context is auto-detected based on the current page and influences AI responses
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rag" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">RAG System</label>
                  <Switch checked={ragEnabled} onCheckedChange={setRAGEnabled} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Knowledge Base</label>
                  <Select value={knowledgeBase} onValueChange={setKnowledgeBase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Knowledge Base</SelectItem>
                      <SelectItem value="general">General Knowledge Base</SelectItem>
                      <SelectItem value="research">Research Papers</SelectItem>
                      <SelectItem value="custom">Custom Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Label Studio Integration</label>
                  <Switch checked={labelStudioEnabled} onCheckedChange={setLabelStudioEnabled} />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/label-studio'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Open Label Studio
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">MCP Tools</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Model Context Protocol tools for external integrations
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableMCPTools.map(tool => (
                      <div key={tool} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMCPTools.includes(tool)}
                          onChange={() => handleMCPToolToggle(tool)}
                          className="rounded"
                        />
                        <label className="text-sm capitalize">{tool.replace('-', ' ')}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Models Summary</label>
                  {selectedModels.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No models selected</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedModels.map((model, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs p-2 border rounded">
                          {model.category === 'llm' && <Brain className="h-3 w-3" />}
                          {model.category === 'small' && <Zap className="h-3 w-3" />}
                          {model.category === 'vision' && <Eye className="h-3 w-3" />}
                          {model.category === 'mcp' && <Wrench className="h-3 w-3" />}
                          <span>{model.name}</span>
                          <Badge variant="outline" className="text-xs">{model.role}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};