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
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState } from '@/hooks/useConversationState';
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';
import { useLabelStudio } from '@/hooks/useLabelStudio';

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
  const { state, addMessage, updateConversationConfig, switchMode } = useConversationState();
  const { listProjects } = useLabelStudio();

  // Auto-detect medical context
  useEffect(() => {
    if (context && (context.includes('medical') || context.includes('patient') || context.includes('health'))) {
      setMedicalContext(true);
      setEnabledFeatures(prev => prev.includes('medical') ? prev : [...prev, 'medical']);
    }
  }, [context]);

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

      let responses: any[] = [];

      if (mode === 'multi' && selectedModels.length > 1) {
        // Multi-model mode - get responses from multiple models
        responses = await Promise.all(
          selectedModels.map(model =>
            generateResponse({
              provider: (model.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: model.model,
              prompt: userMessage,
              systemPrompt: buildSystemPrompt(),
              temperature: 0.7,
              maxTokens: 1000
            })
          )
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
        // Single model response
        const primaryModel = selectedModels.find(m => m.role === 'primary') || selectedModels[0];
        const resp = await generateResponse({
          provider: (primaryModel?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
          model: primaryModel?.model || 'gpt-4',
          prompt: userMessage,
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
            model: primaryModel?.model || 'gpt-4'
          });
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate response',
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg flex flex-col"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Genie AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  {medicalContext ? 'Medical AI Assistant' : 'Comprehensive AI Assistant'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowModelSelector(true)}>
                <Settings className="h-4 w-4" />
                Configure
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">Operation Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={mode} onValueChange={handleModeChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Single
                      </div>
                    </SelectItem>
                    <SelectItem value="multi">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Multi
                      </div>
                    </SelectItem>
                    <SelectItem value="publish">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Publish
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Feature Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant={medicalContext ? "default" : "outline"} className="text-xs">
                <Microscope className="h-3 w-3 mr-1" />
                Medical Context
              </Badge>
              <Badge variant={ragEnabled ? "default" : "outline"} className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                RAG System
              </Badge>
              <Badge variant={labelStudioEnabled ? "default" : "outline"} className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Label Studio
              </Badge>
              <Badge variant={selectedMCPTools.length > 0 ? "default" : "outline"} className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                MCP Tools ({selectedMCPTools.length})
              </Badge>
              <Badge variant={selectedModels.length > 0 ? "default" : "outline"} className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Models ({selectedModels.length})
              </Badge>
            </div>
          </div>

          {/* Content Area - Tabbed Interface */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="conversation" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
                <TabsTrigger value="conversation" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="context" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  Context
                </TabsTrigger>
                <TabsTrigger value="rag" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  RAG/KB
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs">
                  <Wrench className="h-3 w-3 mr-1" />
                  Tools
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="flex-1 flex flex-col mt-0">
                {/* Mode-specific header */}
                <div className="p-4 border-b bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    {mode === 'system' && 'System mode: Auto-configured with all available models and capabilities'}
                    {mode === 'single' && 'Single mode: Focused conversation with selected model'}
                    {mode === 'multi' && 'Multi mode: Parallel processing with multiple models'}
                    {mode === 'publish' && 'Publish mode: Optimized for content creation and publication'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/enrollment-workspace'}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Enrollment Workspace
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/gen-ai'}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Gen AI Studio
                    </Button>
                  </div>
                </div>

                {/* Conversation Display */}
                <div className="flex-1 space-y-4 p-4 max-h-[400px] overflow-y-auto">
                  {state.messages.map((msg, index) => (
                    <MessageComponent key={index} message={msg} />
                  ))}
                  
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={medicalContext ? "Ask about medical topics..." : "Ask me anything..."}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              </TabsContent>

              <TabsContent value="context" className="flex-1 p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Medical Context</label>
                    <Switch checked={medicalContext} onCheckedChange={setMedicalContext} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enabled Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['medical', 'publication', 'research', 'analysis'].map(feature => (
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
                      Context is auto-detected based on the current page and can influence AI responses
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rag" className="flex-1 p-4 space-y-4">
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

              <TabsContent value="tools" className="flex-1 p-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">MCP Tools</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Model Context Protocol tools for external integrations
                    </p>
                    <div className="grid grid-cols-2 gap-2">
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
                    <label className="text-sm font-medium">Selected Models</label>
                    {selectedModels.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No models selected</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedModels.map((model, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelSelector(true)}
                      className="w-full"
                    >
                      Configure Models
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>

      {/* Model Selector Dialog */}
      <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure AI Models</DialogTitle>
          </DialogHeader>
          <UniversalModelSelector
            onModelsSelect={(models) => {
              setSelectedModels(models);
              toast({ title: 'Models Updated', description: `Selected ${models.length} models` });
            }}
            selectedModels={selectedModels}
            mode={mode === 'general' ? 'single' : mode as any}
            enabledFeatures={enabledFeatures}
            maxSelections={mode === 'multi' ? 6 : 3}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};