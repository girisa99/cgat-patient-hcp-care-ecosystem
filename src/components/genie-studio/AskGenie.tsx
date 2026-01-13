/**
 * ASK GENIE - Unified AI Assistant for Genie Studio
 * Context-aware AI that understands all Genie products:
 * - Arc (Production Hub)
 * - Vibe (Audio/Music)
 * - Spark (Content Generation)
 * - Mind (AI Intelligence)
 * 
 * Learns from user interactions to provide better, more precise responses
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Loader2, 
  X,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Film,
  Music,
  PenTool,
  Brain,
  ChevronDown,
  MessageCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { toast } from 'sonner';

// Genie Product Context Types
export type GenieProduct = 'arc' | 'vibe' | 'spark' | 'mind' | 'studio';

interface GenieContext {
  product: GenieProduct;
  currentTab?: string;
  currentAction?: string;
  recentActions?: string[];
  sessionData?: Record<string, any>;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  product?: GenieProduct;
  suggestion?: {
    action: string;
    label: string;
    icon?: React.ReactNode;
  };
}

interface AskGenieProps {
  product?: GenieProduct;
  currentTab?: string;
  sessionData?: Record<string, any>;
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'inline' | 'floating' | 'sidebar';
  className?: string;
}

// Product-specific system prompts for context-aware responses
const PRODUCT_CONTEXTS: Record<GenieProduct, { name: string; icon: React.ReactNode; systemContext: string; color: string }> = {
  arc: {
    name: 'Genie Arc',
    icon: <Film className="h-4 w-4" />,
    color: 'from-blue-500 to-cyan-500',
    systemContext: `You are Ask Genie, the AI assistant for Genie Arc - the Production Hub. 
    You help users with:
    - Video production and editing workflows
    - Show scheduling and management
    - Script writing for broadcasts, podcasts, webcasts
    - Participant management and invitations
    - Recording studio features
    - Post-production workflows
    Always provide actionable suggestions specific to video/audio production.`
  },
  vibe: {
    name: 'Genie Vibe',
    icon: <Music className="h-4 w-4" />,
    color: 'from-purple-500 to-pink-500',
    systemContext: `You are Ask Genie, the AI assistant for Genie Vibe - the Audio & Music Hub.
    You help users with:
    - Audio generation and voice synthesis
    - Music selection and soundtrack creation
    - Audio mixing and mastering tips
    - Voice-over recording techniques
    - Sound design for media projects
    Always provide musical and audio-focused guidance.`
  },
  spark: {
    name: 'Genie Spark',
    icon: <PenTool className="h-4 w-4" />,
    color: 'from-orange-500 to-yellow-500',
    systemContext: `You are Ask Genie, the AI assistant for Genie Spark - the Content Generation Hub.
    You help users with:
    - Script generation and enhancement
    - Content ideation and brainstorming
    - Image and video generation
    - Smart content pipelines
    - Multi-format content creation
    Always provide creative and content-focused guidance.`
  },
  mind: {
    name: 'Genie Mind',
    icon: <Brain className="h-4 w-4" />,
    color: 'from-indigo-500 to-purple-500',
    systemContext: `You are Ask Genie, the AI assistant for Genie Mind - the AI Intelligence Hub.
    You help users with:
    - AI model selection and configuration
    - Multi-model comparisons
    - Knowledge base management
    - RAG pipeline configuration
    - AI workflow optimization
    Always provide AI/ML-focused technical guidance.`
  },
  studio: {
    name: 'Genie Studio',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'from-violet-500 to-fuchsia-500',
    systemContext: `You are Ask Genie, the unified AI assistant for Genie Studio - the complete media production suite.
    You have knowledge of all Genie products:
    - Arc (Production Hub): Video production, shows, broadcasts
    - Vibe (Audio Hub): Music, voice-overs, sound design
    - Spark (Content Hub): Script generation, content creation
    - Mind (AI Hub): AI models, knowledge bases, workflows
    Help users navigate between products and accomplish their media production goals.`
  }
};

// Quick action suggestions based on product context
const QUICK_ACTIONS: Record<GenieProduct, Array<{ label: string; prompt: string }>> = {
  arc: [
    { label: 'Create a show', prompt: 'Help me create a new podcast show' },
    { label: 'Write a script', prompt: 'Generate a script for my video' },
    { label: 'Schedule recording', prompt: 'How do I schedule a recording session?' }
  ],
  vibe: [
    { label: 'Generate voice-over', prompt: 'Help me create a voice-over' },
    { label: 'Find music', prompt: 'Suggest background music for my video' },
    { label: 'Audio tips', prompt: 'Best practices for audio quality' }
  ],
  spark: [
    { label: 'Generate content', prompt: 'Help me generate content ideas' },
    { label: 'Enhance script', prompt: 'Improve my existing script' },
    { label: 'Create visuals', prompt: 'Generate images for my content' }
  ],
  mind: [
    { label: 'Compare models', prompt: 'Compare AI models for my use case' },
    { label: 'Setup RAG', prompt: 'Help me configure knowledge retrieval' },
    { label: 'Optimize AI', prompt: 'How can I optimize AI responses?' }
  ],
  studio: [
    { label: 'Get started', prompt: 'What can I do with Genie Studio?' },
    { label: 'Create project', prompt: 'Help me start a new media project' },
    { label: 'Best practices', prompt: 'Best practices for content creation' }
  ]
};

export const AskGenie: React.FC<AskGenieProps> = ({
  product = 'studio',
  currentTab,
  sessionData,
  isOpen: externalIsOpen,
  onClose,
  position = 'floating',
  className
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateResponse } = useUniversalAI();
  const productContext = PRODUCT_CONTEXTS[product];
  const quickActions = QUICK_ACTIONS[product];

  // Sync with external isOpen prop
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      product
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context-aware prompt
      const contextPrompt = `
${productContext.systemContext}

Current context:
- Product: ${productContext.name}
- Tab: ${currentTab || 'main'}
- Session data: ${sessionData ? JSON.stringify(sessionData).slice(0, 500) : 'none'}

User question: ${text}

Provide a helpful, concise response. If you can suggest a specific action, include it.
      `.trim();

      const response = await generateResponse({
        prompt: contextPrompt,
        provider: 'gemini'
      });

      const responseContent = response?.content || 'I apologize, but I could not generate a response. Please try again.';

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        product
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ask Genie error:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        product
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, product, productContext, currentTab, sessionData, generateResponse]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Floating trigger button
  const TriggerButton = () => (
    <Button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50",
        `bg-gradient-to-r ${productContext.color} hover:opacity-90`
      )}
    >
      <Sparkles className="h-6 w-6 text-white" />
    </Button>
  );

  // Main chat interface
  const ChatInterface = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "flex flex-col bg-background border rounded-xl shadow-2xl overflow-hidden",
        position === 'floating' && "fixed bottom-6 right-6 w-[400px] h-[600px] z-50",
        position === 'sidebar' && "h-full w-full",
        position === 'inline' && "w-full h-[500px]",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        `bg-gradient-to-r ${productContext.color}`
      )}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Ask Genie
              <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                {productContext.name}
              </Badge>
            </h3>
            <p className="text-xs text-white/70">Your AI assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                  `bg-gradient-to-r ${productContext.color}`
                )}>
                  {productContext.icon}
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Welcome to Ask Genie!</h4>
                <p className="text-muted-foreground text-sm mb-6">
                  I'm here to help you with {productContext.name}. Ask me anything!
                </p>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSendMessage(action.prompt)}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : `bg-gradient-to-r ${productContext.color}`
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[10px] opacity-60 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${productContext.color}`
                    )}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4 bg-muted/20">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Ask Genie anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={cn(`bg-gradient-to-r ${productContext.color}`)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </motion.div>
  );

  // Render based on position
  if (position === 'inline' || position === 'sidebar') {
    return <ChatInterface />;
  }

  // Floating mode
  return (
    <>
      {!isOpen && <TriggerButton />}
      <AnimatePresence>
        {isOpen && <ChatInterface />}
      </AnimatePresence>
    </>
  );
};

export default AskGenie;
