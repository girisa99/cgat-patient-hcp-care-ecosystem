/**
 * ASK GENIE CHAT COMPONENT
 * Real AI-powered support chat with escalation flow
 */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  Loader2, 
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react';
import { useSupportChat } from '@/hooks/useSupportChat';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import ReactMarkdown from 'react-markdown';

interface AskGenieChatProps {
  onEscalate?: () => void;
  className?: string;
}

export const AskGenieChat: React.FC<AskGenieChatProps> = ({ onEscalate, className }) => {
  const { isAuthenticated, genieUser } = useGenieStudioAuth();
  const { 
    messages, 
    isLoading, 
    escalationNeeded,
    sendMessage, 
    escalateToHuman,
    clearConversation,
  } = useSupportChat();
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEscalate = async () => {
    await escalateToHuman('User requested human support');
    onEscalate?.();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask Genie
          </CardTitle>
          <div className="flex items-center gap-2">
            {escalationNeeded && (
              <Badge variant="outline" className="text-warning border-warning/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Escalation Suggested
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="h-8"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-80 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.isEscalation
                        ? 'bg-warning/10 border border-warning/30'
                        : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className="text-[10px] opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Escalation Banner */}
        {escalationNeeded && (
          <div className="mx-4 mb-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Would you like to speak with a human agent?</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEscalate}
                className="border-warning/50 text-warning hover:bg-warning/10"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Yes, Escalate
              </Button>
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder={isAuthenticated ? "Type your question..." : "Sign in for personalized support"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Sign in to track your conversations and get faster support
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AskGenieChat;
