/**
 * GENIE CONVERSATION INTERFACE (GENERAL PURPOSE ONLY)
 * Simplified to be general-purpose AI assistant only
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  X, 
  User, 
  Send,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationState } from '@/hooks/useConversationState';
import { ConversationMessage as MessageComponent } from './ConversationMessage';
import { TypingIndicator } from './TypingIndicator';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
  context?: string;
  mode?: 'general';
}

export const GenieConversationInterface: React.FC<GenieConversationInterfaceProps> = ({
  isOpen,
  onClose,
  tenantId,
  userId,
  context = 'general',
  mode = 'general'
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { generateResponse } = useUniversalAI();
  const { state, addMessage } = useConversationState();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      addMessage({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      const resp = await generateResponse({
        provider: 'openai',
        model: 'gpt-4',
        prompt: userMessage,
        systemPrompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
        maxTokens: 1000
      });

      if (resp && resp.content) {
        addMessage({
          role: 'assistant',
          content: resp.content,
          timestamp: new Date().toISOString()
        });
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

  if (!isOpen) return null;

  return (
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
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">General purpose AI helper</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header Info */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">General Purpose</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground p-4">
              General AI assistance with comprehensive knowledge base and multi-model support
            </p>

            {/* General AI Interface */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">General AI Assistant</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/enrollment-workspace'}
                    >
                      Open Enrollment Workspace
                    </Button>
                  </div>
                </div>
              </div>

              {/* Conversation Display */}
              <div className="flex-1 space-y-4 mb-4 max-h-[400px] overflow-y-auto">
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};