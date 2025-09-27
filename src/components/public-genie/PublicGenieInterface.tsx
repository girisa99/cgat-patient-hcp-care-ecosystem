/**
 * PUBLIC GENIE INTERFACE
 * Same powerful multi-model system as GenieConversationInterface but for public use
 * Supports: LLM, Small Language, Vision, MCP, RAG, Knowledge Base with cross-functional selection
 * Context: Technology & Healthcare focused
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  MessageSquare,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Core AI and conversation hooks (adapted for public use)
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState } from '@/hooks/useConversationState';
import { supabase } from '@/integrations/supabase/client';

// UI Components (reuse existing ones)
import { ConversationMessage as MessageComponent } from '../enrollment-genie/ConversationMessage';
import { TypingIndicator } from '../enrollment-genie/TypingIndicator';
import { SelectedModelConfig } from '@/components/ai';
import { StreamlinedModelSelector } from '@/components/genie/StreamlinedModelSelector';

// Public-specific components
import { PublicPrivacyBanner } from './PublicPrivacyBanner';
import { PublicRateLimit } from './PublicRateLimit';
import { HumanEscalationForm } from './HumanEscalationForm';

// Assets
import genieLogoImg from '@/assets/genie-logo.png';
import genieAnimatedImg from '@/assets/genie-animated.png';

interface PublicGenieInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  contextType?: 'technology' | 'healthcare';
  mode?: 'system' | 'single' | 'multi';
  onModeChange?: (mode: 'system' | 'single' | 'multi') => void;
}

export const PublicGenieInterface: React.FC<PublicGenieInterfaceProps> = ({
  isOpen,
  onClose,
  contextType = 'technology',
  mode = 'system',
  onModeChange
}) => {
  // State management
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => `public_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Privacy and rate limiting
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  
  // Model and feature configuration (same as authenticated version)
  const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>([
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      category: 'llm',
      role: 'primary',
      name: 'GPT-4o Mini',
      weight: 1.0
    }
  ]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(['rag']);
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [ragEnabled, setRAGEnabled] = useState(true);
  
  // Hooks
  const { generateResponse } = useUniversalAI();
  const { state, addMessage, updateConversationConfig, switchMode, resetConversation } = useConversationState();
  const { toast } = useToast();
  
  const currentMode = (state?.selectedMode as any) || mode;

  // Context-specific system prompts
  const buildSystemPrompt = useCallback(() => {
    let systemPrompt = 'You are GENIE AI, a comprehensive AI assistant specializing in ';
    
    if (contextType === 'technology') {
      systemPrompt += `technology, AI, and innovation. Your expertise includes:
      
      **Technology & AI:**
      - Large Language Models (LLMs), Small Language Models (SLMs), Vision Language Models
      - Model Context Protocol (MCP), AI automation, and AI/ML workflows
      - Recent AI developments, model releases, and technical advancements
      - Market trends in AI/ML, recent acquisitions, mergers, and funding rounds
      - New platform launches, API releases, and developer tools
      
      **Context Guidelines:**
      - Provide technical depth while remaining accessible
      - Reference recent developments and industry trends
      - Suggest practical applications and implementations
      - Be current with AI/ML news and developments`;
      
    } else {
      systemPrompt += `healthcare, biotech, and pharmaceutical industries. Your expertise includes:
      
      **Healthcare & Biotech:**
      - Oncology treatments, CAR-T therapy, cell and gene therapy
      - Treatment centers operations, cardiology, and specialized care
      - Government pricing structures, WAC pricing, 340B programs
      - Insurance coverage, copay assistance, alternative funding options
      - Patient travel logistics, reimbursement programs, financial assistance
      - Clinical trials, regulatory pathways (FDA, EMA), drug development
      
      **Context Guidelines:**
      - Always recommend consulting with Healthcare Providers (HCPs)
      - Provide accurate, evidence-based information
      - Include relevant regulatory and compliance considerations
      - Mention recent developments in biotech and pharmaceutical sectors`;
    }
    
    if (ragEnabled && enabledFeatures.includes('rag')) {
      systemPrompt += '\n\nYou have access to specialized knowledge databases and can provide enhanced contextual responses using RAG (Retrieval-Augmented Generation).';
    }
    
    if (selectedMCPTools.length > 0) {
      systemPrompt += `\n\nYou have access to these tools: ${selectedMCPTools.join(', ')}.`;
    }
    
    systemPrompt += `\n\n**IMPORTANT DISCLAIMERS:**
    - This is a public demo of AI capabilities
    - All responses are AI-generated and should be verified with experts
    - For medical information, always consult qualified Healthcare Providers
    - This conversation may be monitored for quality and safety purposes`;
    
    return systemPrompt;
  }, [contextType, ragEnabled, selectedMCPTools, enabledFeatures]);

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

  const handleModeChange = useCallback((newMode: 'system' | 'single' | 'multi') => {
    switchMode(newMode as any);
    onModeChange?.(newMode);
    if (newMode === 'multi' && selectedModels.length < 2) {
      setShowModelSelector(true);
    }
  }, [switchMode, onModeChange, selectedModels]);

  // Rate limiting check (simplified for demo)
  const checkRateLimit = useCallback(async () => {
    try {
      // For now, use simple localStorage-based rate limiting
      const rateKey = `genie_rate_limit_${new Date().getHours()}`;
      const currentCount = parseInt(localStorage.getItem(rateKey) || '0');
      
      if (currentCount >= 10) {
        setRateLimitExceeded(true);
        setRequestsUsed(currentCount);
        return false;
      }
      
      setRequestsUsed(currentCount);

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
  }, []);

  // Save conversation to local storage (simplified for demo)
  const savePublicConversation = useCallback(async () => {
    if (!privacyAccepted || state.messages.length === 0) return;

    try {
      const conversationData = {
        session_id: sessionId,
        title: state.messages[0]?.content?.substring(0, 100) || 'Public Conversation',
        conversation_data: state.messages,
        context_type: contextType,
        privacy_accepted: privacyAccepted,
        cookies_accepted: cookiesAccepted,
        metadata: {
          selectedModels,
          enabledFeatures,
          selectedMCPTools,
          mode: currentMode
        }
      };

      // For demo, save to localStorage
      localStorage.setItem(`public_conversation_${sessionId}`, JSON.stringify(conversationData));
    } catch (error) {
      console.error('Failed to save public conversation:', error);
    }
  }, [sessionId, contextType, privacyAccepted, cookiesAccepted, state.messages, selectedModels, enabledFeatures, selectedMCPTools, currentMode]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    if (!privacyAccepted) {
      toast({
        title: "Privacy Agreement Required",
        description: "Please accept the privacy policy to continue using GENIE AI.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limiting
    const canProceed = await checkRateLimit();
    if (!canProceed) {
      toast({
        title: "Rate Limit Exceeded",
        description: "You've reached the hourly limit. Please try again later or contact support.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      // Add user message to conversation
      addMessage({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        provider: (selectedModels[0]?.provider as 'openai' | 'claude' | 'gemini') || 'openai',
        model: selectedModels[0]?.model || 'gpt-4o-mini'
      });

      // Enhanced prompt with context
      let enhancedPrompt = userMessage;
      
      // Add context-specific enhancement
      if (contextType === 'technology') {
        enhancedPrompt = `[Technology/AI Context] ${enhancedPrompt}`;
      } else {
        enhancedPrompt = `[Healthcare/Biotech Context] ${enhancedPrompt}`;
      }

      // Generate AI response(s) - same logic as authenticated version
      if (currentMode === 'multi' && selectedModels.length > 1) {
        // Multi-model mode
        const responses = await Promise.all(
          selectedModels.map(async (model, index) => {
            const modelSpecificPrompt = enhancedPrompt + (index === 0 ? 
              ' Focus on primary analysis and key insights.' : 
              ` Provide alternative perspective #${index + 1} with complementary insights.`);
            
            return await generateResponse({
              provider: (model.provider as 'openai' | 'claude' | 'gemini') || 'openai',
              model: model.model,
              prompt: modelSpecificPrompt,
              systemPrompt: buildSystemPrompt(),
              temperature: 0.7,
              maxTokens: 1200
            }, { silent: true });
          })
        );
        
        // Add each response with proper timing
        for (let i = 0; i < responses.length; i++) {
          const resp = responses[i];
          if (resp && resp.content) {
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
                contextType,
                modelIndex: i,
                totalModels: selectedModels.length,
                publicSession: true
              }
            });
          }
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
              contextType,
              publicSession: true
            }
          });
        }
      }

      // Save conversation and update rate limits
      await savePublicConversation();
      const rateKey = `genie_rate_limit_${new Date().getHours()}`;
      const newCount = requestsUsed + 1;
      localStorage.setItem(rateKey, newCount.toString());
      setRequestsUsed(newCount);
      
      // Show escalation option after 5 messages
      if (state.messages.length >= 8) {
        toast({
          title: "Need Human Assistance?",
          description: "You can connect with a human expert if needed.",
          action: (
            <Button variant="outline" size="sm" onClick={() => setShowEscalationForm(true)}>
              Contact Human
            </Button>
          ),
        });
      }

    } catch (error: any) {
      console.error('Error generating response:', error);
      const friendly = error?.message?.includes('Failed to fetch')
        ? 'AI service is not reachable. Please try again later.'
        : (error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Failed to generate response",
        description: friendly,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Privacy Banner */}
      {showPrivacyBanner && !privacyAccepted && (
        <PublicPrivacyBanner
          onAccept={() => {
            setPrivacyAccepted(true);
            setShowPrivacyBanner(false);
          }}
          onDecline={onClose}
          onCookiesAccept={() => setCookiesAccepted(true)}
        />
      )}

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
          {/* Header with Public Badge */}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    GENIE AI
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    PUBLIC
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} • {currentMode} mode • {contextType}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Context Toggle */}
              <Select value={contextType} onValueChange={(value: 'technology' | 'healthcare') => {
                // This would trigger a prop change in parent component
                console.log('Context change:', value);
              }}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tech</SelectItem>
                  <SelectItem value="healthcare">Health</SelectItem>
                </SelectContent>
              </Select>

              {/* Model Selection */}
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
              
              {/* Rate Limit Indicator */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{requestsUsed}/10</span>
              </div>
              
              {/* Action Buttons */}
              <Button variant="ghost" size="sm" onClick={() => {
                resetConversation();
                toast({
                  title: "New conversation started",
                  description: "Your previous conversation is cleared",
                });
              }} title="New Conversation">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowModelSelector(true)} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowEscalationForm(true)} title="Contact Human">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} title="Minimize">
                <span className="text-sm">_</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} title="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rate Limit Warning */}
          {rateLimitExceeded && (
            <Alert className="m-2" variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Rate limit exceeded ({requestsUsed}/10 requests used). Please try again in an hour or contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {state.messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <img 
                  src={genieAnimatedImg} 
                  alt="GENIE AI" 
                  className="h-16 w-auto mx-auto mb-4 opacity-60"
                  loading="lazy"
                />
                <p className="text-lg font-medium mb-2">
                  Welcome to GENIE AI - Public Demo
                </p>
                <p className="text-sm">
                  Experience our powerful multi-model AI system with specialized {contextType} knowledge.
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  {requestsUsed}/10 requests used this hour
                </p>
              </div>
            )}
            
            <AnimatePresence>
              {state.messages.map((msg, index) => (
                <MessageComponent
                  key={index}
                  message={msg}
                />
              ))}
            </AnimatePresence>
            
            {isLoading && <TypingIndicator />}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask about ${contextType}...`}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading || !privacyAccepted || rateLimitExceeded}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !message.trim() || !privacyAccepted || rateLimitExceeded}
                  size="sm"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {!privacyAccepted && (
              <p className="text-xs text-muted-foreground mt-2">
                Please accept the privacy policy to start using GENIE AI.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Model Selector Dialog - Same as authenticated version */}
      {showModelSelector && (
        <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure AI Models & Features</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure your AI models and features for this conversation.
              </p>
              {/* Simplified model selector for demo */}
              <div className="text-center text-muted-foreground">
                Model configuration interface would go here
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Human Escalation Form */}
      {showEscalationForm && (
        <HumanEscalationForm
          isOpen={showEscalationForm}
          onClose={() => setShowEscalationForm(false)}
          conversationId={sessionId}
          contextType={contextType}
        />
      )}
    </>
  );
};