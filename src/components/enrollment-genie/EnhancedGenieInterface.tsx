/**
 * ENHANCED GENIE INTERFACE
 * Fixes multi-model display, improves media accuracy, adds intent detection
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Loader2, 
  X,
  Settings,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Services and hooks
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { SelectedModelConfig } from '@/components/ai';
import { RichMediaRenderer } from './RichMediaRenderer';
import universalMediaService from '@/services/universalMediaService';
import intentDetectionService from '@/services/intentDetectionService';
import useRAGContext from '@/hooks/useRAGContext';

export interface GenieResponse {
  id: string;
  content: string;
  provider: string;
  model: string;
  timestamp: string;
  loading?: boolean;
  error?: string;
  ragEnhanced?: boolean;
  panelIndex: number;
}

interface EnhancedGenieInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'single' | 'multi' | 'system';
  selectedModels: SelectedModelConfig[];
  userId?: string;
}

export const EnhancedGenieInterface: React.FC<EnhancedGenieInterfaceProps> = ({
  isOpen,
  onClose,
  mode,
  selectedModels,
  userId
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<GenieResponse[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  const { generateResponse } = useUniversalAI();
  const { enhanceWithRAG, addFutureContext } = useRAGContext();

  const handleGenerateImage = useCallback(async (prompt: string): Promise<string> => {
    try {
      const result = await universalMediaService.generateImageSmart(prompt, {
        style: 'digital-art',
        aspectRatio: '16:9'
      });
      
      if (result.success && result.mediaUrl) {
        return result.mediaUrl;
      } else {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }, []);

  const handleGenerateVideo = useCallback(async (prompt: string): Promise<string> => {
    try {
      const result = await universalMediaService.generateVideo({
        prompt,
        provider: 'gemini',
        duration: 10,
        aspectRatio: '16:9'
      });
      
      if (result.success && result.mediaUrl) {
        return result.mediaUrl;
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      throw error;
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || selectedModels.length === 0) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Analyze intent for better response formatting
      const intent = intentDetectionService.analyzeIntent(userMessage);
      let enhancedMessage = intentDetectionService.getEnhancedPrompt(userMessage, intent);
      
      // Enhance with RAG if userId available
      if (userId) {
        enhancedMessage = await enhanceWithRAG(enhancedMessage, userId);
        // Add to future context for learning
        await addFutureContext(userMessage, 'conversation', userId);
      }

      console.log('🧠 Intent Analysis:', { intent, enhancedMessage });

      if (mode === 'multi') {
        // Generate responses for ALL selected models
        const newResponses: GenieResponse[] = selectedModels.map((model, index) => ({
          id: `${Date.now()}-${index}`,
          content: '',
          provider: model.provider,
          model: model.model,
          timestamp: new Date().toISOString(),
          loading: true,
          panelIndex: index
        }));
        
        setResponses(newResponses);

        // Generate all responses in parallel
        const responsePromises = selectedModels.map(async (model, index) => {
          try {
            const modelSpecificPrompt = enhancedMessage + (index === 0 ? 
              ' Provide comprehensive primary analysis.' : 
              ` Provide alternative perspective #${index + 1} with unique insights and different approach.`);
            
            const result = await generateResponse({
              provider: model.provider as any,
              model: model.model,
              prompt: modelSpecificPrompt,
              temperature: 0.6,
              maxTokens: 1200
            });

            return {
              ...newResponses[index],
              content: result?.content || 'Failed to generate response',
              loading: false,
              error: result?.content ? undefined : 'No response generated',
              ragEnhanced: !!userId
            };
          } catch (error) {
            console.error(`Error generating response for ${model.provider}:`, error);
            return {
              ...newResponses[index],
              content: '',
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to generate response',
              ragEnhanced: false
            };
          }
        });

        const completedResponses = await Promise.all(responsePromises);
        setResponses(completedResponses);

        // Add AI messages for conversation history
        completedResponses.forEach((response, index) => {
          if (response.content && !response.error) {
            setMessages(prev => [...prev, {
              id: response.id,
              role: 'assistant',
              content: response.content,
              provider: response.provider,
              model: response.model,
              timestamp: response.timestamp,
              metadata: { ragEnhanced: response.ragEnhanced, panelIndex: index }
            }]);
          }
        });

      } else {
        // Single model mode
        const primaryModel = selectedModels[0];
        const newResponse: GenieResponse = {
          id: Date.now().toString(),
          content: '',
          provider: primaryModel.provider,
          model: primaryModel.model,
          timestamp: new Date().toISOString(),
          loading: true,
          panelIndex: 0
        };
        
        setResponses([newResponse]);

        try {
          const result = await generateResponse({
            provider: primaryModel.provider as any,
            model: primaryModel.model,
            prompt: enhancedMessage,
            temperature: 0.6,
            maxTokens: 1500
          });

          const completedResponse = {
            ...newResponse,
            content: result?.content || 'Failed to generate response',
            loading: false,
            error: result?.content ? undefined : 'No response generated',
            ragEnhanced: !!userId
          };

          setResponses([completedResponse]);

          // Add to messages
          if (completedResponse.content && !completedResponse.error) {
            setMessages(prev => [...prev, {
              id: completedResponse.id,
              role: 'assistant',
              content: completedResponse.content,
              provider: completedResponse.provider,
              model: completedResponse.model,
              timestamp: completedResponse.timestamp,
              metadata: { ragEnhanced: completedResponse.ragEnhanced }
            }]);
          }

        } catch (error) {
          console.error('Error generating single response:', error);
          setResponses([{
            ...newResponse,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to generate response'
          }]);
        }
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error('Failed to process message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedModels, mode, userId, generateResponse, enhanceWithRAG, addFutureContext]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl h-[600px] bg-background border shadow-2xl rounded-lg flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded-lg">
            <span className="text-lg font-bold text-primary">🧞</span>
          </div>
          <div>
            <h3 className="font-semibold text-base">Enhanced GENIE AI</h3>
            <p className="text-xs text-muted-foreground">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} • {mode} mode
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {mode === 'multi' && responses.length > 0 ? (
              // Multi-model grid layout - shows ALL responses
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {responses.map((response, index) => (
                  <motion.div
                    key={`${response.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {response.provider === 'claude' ? 'C' : 
                               response.provider === 'gemini' ? 'G' : 
                               response.provider === 'openai' ? 'O' : 'AI'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground capitalize truncate">
                              {response.provider} {response.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Panel {index + 1} • {format(new Date(response.timestamp), 'HH:mm:ss')}
                            </p>
                          </div>
                          {response.ragEnhanced && (
                            <Badge variant="secondary" className="text-xs">RAG</Badge>
                          )}
                          {response.error && (
                            <Badge variant="destructive" className="text-xs">Error</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="max-h-[350px]">
                          {response.loading ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <span className="ml-3 text-sm text-muted-foreground">Generating response...</span>
                            </div>
                          ) : response.error ? (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-sm text-destructive">{response.error}</p>
                            </div>
                          ) : (
                            <RichMediaRenderer 
                              content={response.content} 
                              onGenerateImage={handleGenerateImage}
                              onGenerateVideo={handleGenerateVideo}
                              modelContext={{
                                provider: response.provider,
                                model: response.model,
                                panelIndex: index
                              }}
                            />
                          )}
                        </ScrollArea>
                        {response.content && !response.loading && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <Badge variant="outline" className="text-xs">
                              {response.provider} Panel {index + 1}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Single model or empty state
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div key={response.id} className="space-y-4">
                    {response.loading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-3 text-muted-foreground">Generating response...</span>
                      </div>
                    ) : response.error ? (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive">{response.error}</p>
                      </div>
                    ) : (
                      <RichMediaRenderer 
                        content={response.content}
                        onGenerateImage={handleGenerateImage}
                        onGenerateVideo={handleGenerateVideo}
                        modelContext={{
                          provider: response.provider,
                          model: response.model,
                          panelIndex: index
                        }}
                      />
                    )}
                  </div>
                ))}
                
                {responses.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <span className="text-6xl mb-4">🧞‍♂️</span>
                    <h3 className="text-lg font-semibold mb-2">Enhanced GENIE AI Ready</h3>
                    <p className="text-muted-foreground mb-4">
                      Ask me anything about healthcare, biotech, or any topic!<br/>
                      I'll provide accurate, contextual responses with proper medical disclaimers.
                    </p>
                    <Badge variant="outline">
                      Mode: {mode} • Models: {selectedModels.length}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask GENIE anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || selectedModels.length === 0}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{selectedModels.length} models selected</span>
        </div>
      </div>
    </motion.div>
  );
};