/**
 * Universal AI Editing Assistant
 * Context-aware AI chat for video editing guidance
 * Works on both mobile and desktop
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle,
  Send,
  Mic,
  MicOff,
  X,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Play,
  Wand2,
  Music,
  ArrowRightLeft,
  Volume2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineClip } from './MultiClipTimeline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestion?: {
    action: string;
    label: string;
  };
}

interface EditingContext {
  clipCount: number;
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  currentStep: string;
  totalDuration: number;
}

interface UniversalAIEditingAssistantProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  currentStep: string;
  onAction: (action: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Context-aware AI responses
const generateAIResponse = (
  userMessage: string, 
  context: EditingContext
): { content: string; suggestion?: { action: string; label: string } } => {
  const lowerMessage = userMessage.toLowerCase();
  
  // What's next?
  if (lowerMessage.includes('next') || lowerMessage.includes('what should')) {
    if (context.clipCount < 2) {
      return {
        content: "You need at least 2 video clips to use AI features. Add more clips to get started!",
        suggestion: { action: 'import', label: 'Add Clips' }
      };
    }
    if (!context.hasMusic) {
      return {
        content: "Great clips! I recommend adding a music track so I can sync your cuts to the beat. This creates a professional, rhythmic edit.",
        suggestion: { action: 'music', label: 'Add Music' }
      };
    }
    if (!context.hasArrangement) {
      return {
        content: "Perfect! Now let me arrange your clips. I'll analyze the content and create an optimal flow. Which style do you prefer - Story, Fast Cuts, or Relaxed?",
        suggestion: { action: 'arrange', label: 'AI Arrange' }
      };
    }
    if (!context.hasTransitions) {
      return {
        content: "Almost done! Let me add smart transitions between your clips. I'll analyze each cut and suggest the perfect transition type.",
        suggestion: { action: 'transitions', label: 'Add Transitions' }
      };
    }
    return {
      content: "You're ready to export! Preview your video first to make sure everything looks good, then choose your export settings.",
      suggestion: { action: 'export', label: 'Preview & Export' }
    };
  }

  // Arrangement help
  if (lowerMessage.includes('arrange') || lowerMessage.includes('order') || lowerMessage.includes('style')) {
    return {
      content: "I offer 4 arrangement styles:\n\n📖 **Story Mode**: Builds narrative tension - short intro, longer middle, medium outro\n\n⚡ **Fast Cuts**: Quick, energetic pacing perfect for social media\n\n🌊 **Relaxed**: Slow, contemplative flow for vlogs and travel content\n\n🎨 **Custom**: Set your own pacing from 10-100%",
      suggestion: { action: 'arrange', label: 'Try AI Arrange' }
    };
  }

  // Music/beat sync help
  if (lowerMessage.includes('music') || lowerMessage.includes('beat') || lowerMessage.includes('sync') || lowerMessage.includes('bpm')) {
    return {
      content: "When you upload music, I automatically detect the BPM and beat markers. You can choose sync modes:\n\n🎵 **Every Beat**: Fast cuts on every beat\n🥁 **Strong Beats**: Cuts on downbeats (recommended)\n📊 **Bars**: One cut per 4 beats\n🎛️ **Custom**: Set your own frequency",
      suggestion: { action: 'music', label: 'Upload Music' }
    };
  }

  // Transition help
  if (lowerMessage.includes('transition') || lowerMessage.includes('dissolve') || lowerMessage.includes('fade') || lowerMessage.includes('cut')) {
    return {
      content: "I analyze each clip pair and suggest the best transition:\n\n✂️ **Cut**: Instant switch, great for fast content\n🌫️ **Fade**: Through black, for context changes\n🔄 **Dissolve**: Cross-fade, smooth scene changes\n➡️ **Wipe/Slide**: Dynamic movement\n\nI show a confidence % for each suggestion!",
      suggestion: { action: 'transitions', label: 'Smart Transitions' }
    };
  }

  // Export help
  if (lowerMessage.includes('export') || lowerMessage.includes('save') || lowerMessage.includes('share') || lowerMessage.includes('download')) {
    return {
      content: "Ready to export? Here are my recommendations:\n\n📱 **TikTok/Reels**: 1080x1920, 9:16 vertical\n📺 **YouTube**: 1920x1080 or 4K\n📸 **Instagram Feed**: 1080x1080 square\n\nPreview your video first to catch any issues!",
      suggestion: { action: 'export', label: 'Export Now' }
    };
  }

  // Default helpful response
  return {
    content: `I'm here to help with your video editing! You currently have ${context.clipCount} clips${context.hasMusic ? ' with music' : ''}. Ask me about:\n\n• Clip arrangement styles\n• Music and beat sync\n• Smart transitions\n• Export settings\n\nOr just ask "What's next?" and I'll guide you!`
  };
};

export const UniversalAIEditingAssistant: React.FC<UniversalAIEditingAssistantProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  currentStep,
  onAction,
  isOpen,
  onClose,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const videoClips = clips.filter(c => c.type === 'video');
  const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);

  const context: EditingContext = {
    clipCount: videoClips.length,
    hasMusic,
    hasArrangement,
    hasTransitions,
    currentStep,
    totalDuration,
  };

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content: `Hi! I'm your AI editing assistant. You have ${videoClips.length} video clips (${Math.round(totalDuration)}s total). What would you like to create today?`,
        timestamp: new Date(),
        suggestion: videoClips.length < 2 
          ? { action: 'import', label: 'Add More Clips' }
          : { action: 'arrange', label: 'Start AI Edit' }
      };
      setMessages([greeting]);
    }
  }, [isOpen, videoClips.length, totalDuration]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

    const response = generateAIResponse(inputValue, context);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestion: response.suggestion,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
  };

  const quickQuestions = [
    "What's next?",
    "Help with transitions",
    "Explain beat sync",
    "Export settings",
  ];

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 sm:w-96 max-h-[70vh] flex flex-col shadow-2xl z-50",
      "animate-in slide-in-from-bottom-4 fade-in-0",
      className
    )}>
      <CardHeader className="pb-2 px-3 flex-row items-center justify-between space-y-0 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          AI Assistant
          <Badge variant="secondary" className="text-[9px] ml-1">
            {videoClips.length} clips
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                message.role === 'assistant' ? "bg-primary/20" : "bg-muted"
              )}>
                {message.role === 'assistant' ? (
                  <Sparkles className="h-3 w-3 text-primary" />
                ) : (
                  <User className="h-3 w-3" />
                )}
              </div>

              <div className={cn(
                "flex-1 space-y-1",
                message.role === 'user' && "text-right"
              )}>
                <div className={cn(
                  "inline-block p-2 rounded-lg text-xs max-w-[85%]",
                  message.role === 'assistant' 
                    ? "bg-muted text-left" 
                    : "bg-primary text-primary-foreground"
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.suggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] mt-1"
                    onClick={() => onAction(message.suggestion!.action)}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    {message.suggestion.label}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted p-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Questions */}
      <div className="px-3 py-2 border-t">
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 pb-1">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="h-6 text-[9px] whitespace-nowrap shrink-0"
                onClick={() => {
                  setInputValue(q);
                  setTimeout(() => handleSend(), 100);
                }}
              >
                {q}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-3 pt-0 flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about editing..."
            className="w-full h-9 px-3 pr-9 text-xs rounded-md border bg-background"
          />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-0 top-0 h-9 w-9",
              isListening && "text-red-500"
            )}
            onClick={() => setIsListening(!isListening)}
          >
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <Button
          size="icon"
          className="h-9 w-9"
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default UniversalAIEditingAssistant;
