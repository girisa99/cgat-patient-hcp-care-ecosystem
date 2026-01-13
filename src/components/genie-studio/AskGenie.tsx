/**
 * ASK GENIE - Unified Context-Aware AI Assistant for Genie Studio
 * 
 * Features:
 * - Context-aware based on product (Arc, Vibe, Spark, Mind)
 * - Dynamic guided flows with step-by-step help
 * - Emotional, creative, and empathetic responses
 * - Subscription-aware suggestions
 * - Cross-product navigation and recommendations
 * - Non-overwhelming, engaging UX
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Maximize2,
  ArrowRight,
  HelpCircle,
  Zap,
  Heart,
  Star,
  Wand2,
  BookOpen,
  Route,
  CheckCircle2
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
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  product?: GenieProduct;
  guidedFlow?: GuidedFlowStep;
  emotionalTone?: 'encouraging' | 'helpful' | 'celebratory' | 'empathetic';
}

interface GuidedFlowStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  tip?: string;
}

interface AskGenieProps {
  product?: GenieProduct;
  currentTab?: string;
  sessionData?: Record<string, any>;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'inline' | 'floating' | 'sidebar';
  className?: string;
}

// Personality phrases for emotional engagement
const PERSONALITY = {
  greetings: [
    "Hey there, creative soul! ✨",
    "Welcome back! Ready to create magic? 🎬",
    "Hi! I'm so excited to help you today! 🌟",
    "Great to see you! Let's make something amazing! 💫"
  ],
  encouragements: [
    "You're doing great! Keep going! 💪",
    "That's a fantastic idea! Let's make it happen! ⭐",
    "I love where this is heading! 🚀",
    "You've got this! I'm here to help every step of the way 🤝"
  ],
  celebrations: [
    "Woohoo! That's awesome! 🎉",
    "Amazing work! You should be proud! 🏆",
    "Nailed it! High five! ✋",
    "Brilliant! You're on fire today! 🔥"
  ],
  empathy: [
    "I totally understand that can be tricky. Let me help! 🤗",
    "No worries at all! We'll figure this out together 💙",
    "That's a great question! Many creators wonder the same 😊",
    "I get it! Let's break this down step by step 📝"
  ]
};

// Product-specific context with guided flows
const PRODUCT_CONTEXTS: Record<GenieProduct, { 
  name: string; 
  icon: React.ReactNode; 
  systemContext: string; 
  color: string;
  tagline: string;
  emoji: string;
  workflows: Array<{ id: string; title: string; description: string; steps: string[] }>;
}> = {
  arc: {
    name: 'Genie Arc',
    icon: <Film className="h-4 w-4" />,
    color: 'from-blue-500 to-cyan-500',
    tagline: 'Script Your Success',
    emoji: '🎬',
    systemContext: `You are Ask Genie, a friendly and emotionally intelligent AI assistant for Genie Arc - the Production Hub.

PERSONALITY: Be warm, encouraging, and slightly playful. Use emojis sparingly but effectively. Show genuine enthusiasm for the user's creative projects.

CONTEXT AWARENESS: You can detect what the user is working on and offer relevant help.

YOU HELP WITH:
- Video production and show creation
- Script writing for broadcasts, podcasts, webcasts
- Show scheduling and episode management
- Recording session coordination
- Post-production workflows

CROSS-PRODUCT AWARENESS:
- If user needs a script → Suggest Genie Spark
- If user needs voice-over/music → Suggest Genie Vibe
- If user needs AI optimization → Suggest Genie Mind

GUIDED FLOWS: When explaining processes, break them into clear numbered steps. Offer to guide them through each step.

TONE: Encouraging, creative, empathetic. Celebrate their progress!`,
  workflows: [
    { id: 'create-show', title: 'Create Your First Show', description: 'Set up a podcast, video series, or webinar', steps: ['Choose show type', 'Add basic info', 'Set schedule', 'Invite participants'] },
    { id: 'script-to-production', title: 'Script to Production', description: 'Turn your script into a finished production', steps: ['Import/create script', 'Add visuals', 'Record audio', 'Finalize'] }
  ]
  },
  vibe: {
    name: 'Genie Vibe',
    icon: <Music className="h-4 w-4" />,
    color: 'from-purple-500 to-pink-500',
    tagline: 'Feel the Sound',
    emoji: '🎵',
    systemContext: `You are Ask Genie, a creative and musically-aware AI assistant for Genie Vibe - the Audio & Music Hub.

PERSONALITY: Be artistic, expressive, and passionate about sound. Use music-related metaphors. Show appreciation for audio creativity.

CONTEXT AWARENESS: Detect if user is working on voice-overs, music, or sound design.

YOU HELP WITH:
- AI voice generation and TTS
- Music selection and composition
- Audio mixing and enhancement
- Sound design for media
- Voice-over recording tips

CROSS-PRODUCT AWARENESS:
- If user needs a script for voice-over → Suggest Genie Spark
- If user wants to add audio to video → Suggest Genie Arc
- If user needs AI model selection → Suggest Genie Mind

GUIDED FLOWS: Walk users through audio creation step by step.

TONE: Creative, rhythmic, passionate about sound quality!`,
    workflows: [
      { id: 'create-voiceover', title: 'Create Voice-Over', description: 'Generate professional voice-overs with AI', steps: ['Write/paste script', 'Select voice style', 'Generate audio', 'Fine-tune'] },
      { id: 'find-music', title: 'Find Perfect Music', description: 'Discover the right soundtrack for your project', steps: ['Describe the mood', 'Browse suggestions', 'Preview tracks', 'Add to project'] }
    ]
  },
  spark: {
    name: 'Genie Spark',
    icon: <PenTool className="h-4 w-4" />,
    color: 'from-orange-500 to-yellow-500',
    tagline: 'Ignite Your Ideas',
    emoji: '✨',
    systemContext: `You are Ask Genie, an imaginative and inspiring AI assistant for Genie Spark - the Content Generation Hub.

PERSONALITY: Be creative, enthusiastic, and full of ideas. Spark inspiration! Use creative metaphors and encourage experimentation.

CONTEXT AWARENESS: Know if user is generating scripts, images, or content ideas.

YOU HELP WITH:
- Script generation and enhancement
- Content ideation and brainstorming
- Image generation prompts
- Multi-format content pipelines
- Creative writing assistance

CROSS-PRODUCT AWARENESS:
- If user has a script and needs voice → Suggest Genie Vibe for TTS
- If user wants to produce the content → Suggest Genie Arc
- If user wants AI model comparison → Suggest Genie Mind

GUIDED FLOWS: Help users through the creative process step by step.

TONE: Imaginative, inspiring, celebrates creativity!`,
    workflows: [
      { id: 'generate-script', title: 'Generate a Script', description: 'Create compelling scripts with AI', steps: ['Choose format', 'Describe topic', 'Generate draft', 'Refine & edit'] },
      { id: 'content-pipeline', title: 'Smart Content Pipeline', description: 'Transform one idea into multiple formats', steps: ['Input source content', 'Select output formats', 'Generate variations', 'Export'] }
    ]
  },
  mind: {
    name: 'Genie Mind',
    icon: <Brain className="h-4 w-4" />,
    color: 'from-indigo-500 to-purple-500',
    tagline: 'Think Beyond Limits',
    emoji: '🧠',
    systemContext: `You are Ask Genie, a knowledgeable and insightful AI assistant for Genie Mind - the AI Intelligence Hub.

PERSONALITY: Be intelligent, helpful, and patient. Explain complex AI concepts simply. Show curiosity and appreciation for the user's AI exploration.

CONTEXT AWARENESS: Know if user is editing scripts, comparing models, or configuring AI.

YOU HELP WITH:
- Script editing and management
- AI model selection and comparison
- Knowledge base configuration
- RAG pipeline setup
- AI workflow optimization

CROSS-PRODUCT AWARENESS:
- If user wants to generate content → Suggest Genie Spark
- If user needs voice/audio → Suggest Genie Vibe
- If user wants to produce → Suggest Genie Arc

GUIDED FLOWS: Break down AI concepts and guide through configurations.

SPECIAL CONTEXT DETECTION:
- If user is in Script Editor → Offer to enhance with TTS or send to Spark
- If user has scripts → Suggest next steps like audio generation

TONE: Thoughtful, educational, encouraging exploration!`,
    workflows: [
      { id: 'edit-script', title: 'Edit & Enhance Script', description: 'Polish your scripts with AI assistance', steps: ['Open script', 'Use AI suggestions', 'Add voice with Vibe', 'Export'] },
      { id: 'compare-models', title: 'Compare AI Models', description: 'Find the best AI model for your needs', steps: ['Define use case', 'Run comparisons', 'Analyze results', 'Select winner'] }
    ]
  },
  studio: {
    name: 'Genie Studio',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'from-violet-500 to-fuchsia-500',
    tagline: 'Create Without Limits',
    emoji: '🌟',
    systemContext: `You are Ask Genie, the master guide for Genie Studio - the complete media production suite.

PERSONALITY: Be warm, knowledgeable, and helpful. You understand the entire creative ecosystem and can guide users to the right tools.

YOU KNOW ALL PRODUCTS:
- Arc (Production Hub): Video production, shows, broadcasts
- Vibe (Audio Hub): Music, voice-overs, sound design
- Spark (Content Hub): Script generation, content creation
- Mind (AI Hub): AI models, knowledge bases, workflows

ROUTING INTELLIGENCE:
- Want to create a podcast? → Start in Arc to create the show, use Spark for scripts, Vibe for audio
- Need a video script? → Start in Spark, produce in Arc
- Want AI voice? → Vibe is your destination
- Comparing AI models? → Head to Mind

GUIDED FLOWS: Help users navigate the entire ecosystem.

TONE: Welcoming, knowledgeable, encouraging exploration!`,
    workflows: [
      { id: 'get-started', title: 'Get Started', description: 'Learn what each Genie product can do', steps: ['Explore Arc', 'Discover Spark', 'Try Vibe', 'Explore Mind'] },
      { id: 'full-production', title: 'Full Production Workflow', description: 'Create content from idea to finished product', steps: ['Ideate in Spark', 'Create show in Arc', 'Add audio in Vibe', 'Optimize in Mind'] }
    ]
  }
};

// Dynamic contextual suggestions based on current state
const getContextualSuggestions = (
  product: GenieProduct, 
  currentTab?: string, 
  sessionData?: Record<string, any>
): Array<{ label: string; prompt: string; icon: React.ReactNode; isHighlighted?: boolean }> => {
  const suggestions: Array<{ label: string; prompt: string; icon: React.ReactNode; isHighlighted?: boolean }> = [];
  
  // Product-specific base suggestions
  switch (product) {
    case 'mind':
      if (currentTab === 'scripts' || currentTab === 'editor') {
        suggestions.push(
          { label: '✏️ Enhance this script', prompt: 'Help me improve and enhance my current script with better flow and engagement', icon: <Wand2 className="h-3 w-3" />, isHighlighted: true },
          { label: '🎙️ Add TTS/Voice', prompt: 'I want to add text-to-speech voice-over to this script. Guide me through the process!', icon: <Music className="h-3 w-3" /> },
          { label: '✨ Send to Spark', prompt: 'How can I use Genie Spark to generate variations or enhance this script further?', icon: <Zap className="h-3 w-3" /> }
        );
      } else if (currentTab === 'media') {
        suggestions.push(
          { label: '📚 Organize library', prompt: 'Help me organize my media library effectively', icon: <BookOpen className="h-3 w-3" /> },
          { label: '🔄 Batch process', prompt: 'Can I batch process multiple audio files?', icon: <Zap className="h-3 w-3" /> }
        );
      } else {
        suggestions.push(
          { label: '🧠 Compare AI models', prompt: 'Help me understand which AI model is best for my content creation needs', icon: <Brain className="h-3 w-3" /> },
          { label: '📝 Edit a script', prompt: 'Guide me through editing and enhancing a script in Genie Mind', icon: <PenTool className="h-3 w-3" /> },
          { label: '🎯 Optimize workflow', prompt: 'What are the best practices for optimizing my AI content workflow?', icon: <Route className="h-3 w-3" /> }
        );
      }
      break;

    case 'spark':
      if (sessionData?.hasGeneratedContent) {
        suggestions.push(
          { label: '🎙️ Add voice-over', prompt: 'I generated content! Now help me add a professional voice-over with Genie Vibe', icon: <Music className="h-3 w-3" />, isHighlighted: true },
          { label: '🎬 Start production', prompt: 'Take my generated script to Genie Arc for full production', icon: <Film className="h-3 w-3" /> }
        );
      }
      suggestions.push(
        { label: '✨ Generate script', prompt: 'Help me generate a compelling script for my video or podcast', icon: <PenTool className="h-3 w-3" /> },
        { label: '💡 Brainstorm ideas', prompt: 'I need creative content ideas. Let us brainstorm together!', icon: <Lightbulb className="h-3 w-3" /> },
        { label: '🎨 Create visuals', prompt: 'Guide me through generating images for my content', icon: <Wand2 className="h-3 w-3" /> }
      );
      break;

    case 'arc':
      if (sessionData?.showCount === 0) {
        suggestions.push(
          { label: '🎬 Create first show', prompt: 'I am new here! Help me create my first show step by step', icon: <Film className="h-3 w-3" />, isHighlighted: true }
        );
      } else {
        suggestions.push(
          { label: '➕ Add new episode', prompt: 'Help me add a new episode to my existing show', icon: <Film className="h-3 w-3" /> }
        );
      }
      suggestions.push(
        { label: '📝 Need a script?', prompt: 'I need to write a script for my show. Should I use Genie Spark?', icon: <PenTool className="h-3 w-3" /> },
        { label: '🎵 Add music/audio', prompt: 'How do I add background music or voice-overs to my production?', icon: <Music className="h-3 w-3" /> },
        { label: '📅 Schedule recording', prompt: 'Help me schedule and organize a recording session', icon: <Route className="h-3 w-3" /> }
      );
      break;

    case 'vibe':
      suggestions.push(
        { label: '🎙️ Create voice-over', prompt: 'Guide me through creating a professional AI voice-over', icon: <Music className="h-3 w-3" />, isHighlighted: true },
        { label: '🎵 Find music', prompt: 'Help me find the perfect background music for my video', icon: <Music className="h-3 w-3" /> },
        { label: '📝 Need script first?', prompt: 'I do not have a script yet. Should I create one in Genie Spark first?', icon: <PenTool className="h-3 w-3" /> },
        { label: '🎛️ Audio tips', prompt: 'What are the best practices for high-quality audio production?', icon: <Wand2 className="h-3 w-3" /> }
      );
      break;

    default: // studio
      suggestions.push(
        { label: '🚀 Getting started', prompt: 'I am new to Genie Studio! Give me a quick tour of what each product does', icon: <Sparkles className="h-3 w-3" />, isHighlighted: true },
        { label: '🎬 Create content', prompt: 'Help me understand the full workflow from idea to finished video', icon: <Film className="h-3 w-3" /> },
        { label: '🎙️ Podcast setup', prompt: 'I want to start a podcast. Walk me through the complete setup', icon: <Music className="h-3 w-3" /> },
        { label: '💡 What can I do?', prompt: 'Show me the most popular things creators do with Genie Studio', icon: <Lightbulb className="h-3 w-3" /> }
      );
  }

  return suggestions.slice(0, 4); // Limit to 4 for non-overwhelming UX
};

export const AskGenie: React.FC<AskGenieProps> = ({
  product = 'studio',
  currentTab,
  sessionData,
  subscriptionTier = 'free',
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
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateResponse } = useUniversalAI();
  const productContext = PRODUCT_CONTEXTS[product];
  
  // Dynamic suggestions based on context
  const contextualSuggestions = useMemo(() => 
    getContextualSuggestions(product, currentTab, sessionData), 
    [product, currentTab, sessionData]
  );

  // Random personality phrases
  const getRandomPhrase = (type: keyof typeof PERSONALITY) => {
    const phrases = PERSONALITY[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

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

    setShowWelcome(false);

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
      // Build context-aware, personality-rich prompt
      const contextPrompt = `
${productContext.systemContext}

IMPORTANT GUIDELINES:
- Keep responses concise but warm (2-4 sentences max for simple questions)
- Use emojis sparingly (1-2 per response)
- If explaining a process, use numbered steps
- If suggesting another Genie product, explain WHY it helps
- Celebrate user progress and acknowledge their creative journey
- Be empathetic if they seem frustrated or confused

CURRENT CONTEXT:
- Product: ${productContext.name} (${productContext.tagline})
- Current Tab: ${currentTab || 'main view'}
- Session Info: ${sessionData ? JSON.stringify(sessionData).slice(0, 300) : 'New session'}
- Subscription: ${subscriptionTier}

USER MESSAGE: ${text}

Respond helpfully and warmly. If this is a multi-step process, offer to guide them step by step.
      `.trim();

      const response = await generateResponse({
        prompt: contextPrompt,
        provider: 'gemini'
      });

      const responseContent = response?.content || getRandomPhrase('empathy') + " I couldn't process that request. Could you try rephrasing?";

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        product,
        emotionalTone: 'helpful'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ask Genie error:', error);
      toast.error('Oops! Something went wrong. Let me try again...');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `${getRandomPhrase('empathy')} I hit a small snag there. Want to try asking again? I'm here to help! 💪`,
        timestamp: new Date(),
        product,
        emotionalTone: 'empathetic'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, product, productContext, currentTab, sessionData, subscriptionTier, generateResponse]);

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

  // Floating trigger button with pulse animation
  const TriggerButton = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl relative overflow-hidden group",
          `bg-gradient-to-r ${productContext.color} hover:opacity-90`
        )}
      >
        <Sparkles className="h-6 w-6 text-white relative z-10" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-white/30" />
      </Button>
      {/* Label */}
      <motion.span 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-background border rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg whitespace-nowrap"
      >
        Ask Genie {productContext.emoji}
      </motion.span>
    </motion.div>
  );

  // Main chat interface
  const ChatInterface = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "flex flex-col bg-background border rounded-xl shadow-2xl overflow-hidden",
        position === 'floating' && "fixed bottom-6 right-6 w-[420px] h-[550px] z-50",
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
            <p className="text-xs text-white/80">{productContext.tagline} {productContext.emoji}</p>
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
            {showWelcome && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                    `bg-gradient-to-r ${productContext.color}`
                  )}
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="font-semibold text-lg mb-1">{getRandomPhrase('greetings')}</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    I'm your {productContext.name} assistant. How can I help today?
                  </p>
                </motion.div>
                
                {/* Contextual Quick Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full space-y-2"
                >
                  <p className="text-xs text-muted-foreground mb-2">Quick suggestions for you:</p>
                  {contextualSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Button
                        variant={suggestion.isHighlighted ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left text-sm h-auto py-2 px-3",
                          suggestion.isHighlighted && `bg-gradient-to-r ${productContext.color} text-white hover:opacity-90`
                        )}
                        onClick={() => handleSendMessage(suggestion.prompt)}
                      >
                        <span className="mr-2">{suggestion.icon}</span>
                        {suggestion.label}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Workflows teaser */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 pt-4 border-t w-full"
                >
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                    <BookOpen className="h-3 w-3" />
                    I can guide you through complete workflows step-by-step!
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                        <Sparkles className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-md' 
                        : 'bg-muted rounded-tl-md'
                    )}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${productContext.color}`
                    )}>
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[44px] max-h-[100px] resize-none rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn("h-11 w-11 rounded-xl", `bg-gradient-to-r ${productContext.color} hover:opacity-90`)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
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
