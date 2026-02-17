import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Send, 
  Brain, 
  Zap, 
  Eye, 
  Bot, 
  Settings, 
  ChevronDown, 
  Clock, 
  BarChart3, 
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CrossCategoryModelSelector, SelectedModelConfig } from './CrossCategoryModelSelector';
import { IntelligentMergingService, ModelResponse, MergedResponse } from '@/services/intelligentMergingService';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mergedResponse?: MergedResponse;
  individualResponses?: ModelResponse[];
}

interface MultiModelConversationInterfaceProps {
  onClose?: () => void;
  initialModels?: SelectedModelConfig[];
  maxModels?: number;
}

export const MultiModelConversationInterface: React.FC<MultiModelConversationInterfaceProps> = ({
  onClose,
  initialModels = [],
  maxModels = 6
}) => {
  const { generateResponse } = useUniversalAI();
  const { showError, showSuccess, showInfo } = useMasterToast();

  // State
  const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>(initialModels);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergingStrategy, setMergingStrategy] = useState<'weighted' | 'consensus' | 'hierarchical' | 'specialized'>('weighted');
  const [showModelSelector, setShowModelSelector] = useState(selectedModels.length === 0);
  const [processingProgress, setProcessingProgress] = useState<Record<string, boolean>>({});
  const [showProcessingDetails, setShowProcessingDetails] = useState(false);

  // Suggested merging strategy
  const suggestedStrategy = useMemo(() => {
    return IntelligentMergingService.suggestMergingStrategy(selectedModels);
  }, [selectedModels]);

  // Handle sending message to multiple models
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || selectedModels.length === 0) {
      showError('Please enter a message and select at least one model');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress({});
    
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Call all models in parallel
      const modelPromises = selectedModels.map(async (model) => {
        const modelKey = `${model.provider}-${model.model}`;
        setProcessingProgress(prev => ({ ...prev, [modelKey]: false }));

        try {
          const startTime = Date.now();
          
          // Call the model using generateResponse
          const response = await generateResponse({
            prompt: inputMessage.trim(),
            provider: model.provider as any,
            model: model.model,
            temperature: model.category === 'llm' ? 0.7 : 0.3,
            maxTokens: model.category === 'small' ? 1000 : 2000
          });

          const processingTime = Date.now() - startTime;
          
          setProcessingProgress(prev => ({ ...prev, [modelKey]: true }));

          const modelResponse: ModelResponse = {
            modelId: model.model,
            provider: model.provider,
            category: model.category,
            role: model.role,
            response: response.content || 'No response received',
            confidence: Math.random() * 0.3 + 0.7, // Simulate confidence (0.7-1.0)
            processingTime,
            metadata: {
              category: model.category,
              role: model.role,
              weight: model.weight
            }
          };

          return modelResponse;
        } catch (error) {
          console.error(`Error calling ${modelKey}:`, error);
          
          // Return error response
          return {
            modelId: model.model,
            provider: model.provider,
            category: model.category,
            role: model.role,
            response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            confidence: 0,
            processingTime: 0,
            metadata: { error: true }
          } as ModelResponse;
        }
      });

      // Wait for all models to respond
      const responses = await Promise.all(modelPromises);
      
      // Filter out error responses for merging
      const validResponses = responses.filter(r => r.confidence > 0);
      
      if (validResponses.length === 0) {
        throw new Error('All models failed to respond');
      }

      // Merge responses intelligently
      const mergedResponse = IntelligentMergingService.mergeResponses(
        validResponses,
        selectedModels,
        mergingStrategy
      );

      // Create assistant message
      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: mergedResponse.finalResponse,
        timestamp: new Date(),
        mergedResponse,
        individualResponses: responses
      };

      setMessages(prev => [...prev, assistantMessage]);
      showSuccess(`Response generated using ${validResponses.length} models`);

    } catch (error) {
      showError(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress({});
    }
  }, [inputMessage, selectedModels, mergingStrategy, generateResponse, showError, showSuccess]);

  // Render individual model responses
  const renderIndividualResponses = (responses: ModelResponse[]) => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between p-2">
          <span className="text-xs">View Individual Model Responses ({responses.length})</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {responses.map((response) => {
          const Icon = {
            llm: Brain,
            small: Zap,
            vision: Eye,
            mcp: Bot
          }[response.category];

          return (
            <div key={`${response.provider}-${response.modelId}`} className="p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{response.provider}</span>
                <Badge variant="outline" className="text-xs">
                  {response.category.toUpperCase()}
                </Badge>
                <Badge variant={response.role === 'primary' ? 'default' : 'secondary'} className="text-xs">
                  {response.role}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(response.confidence * 100)}% conf
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {response.processingTime}ms
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{response.response}</p>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );

  // Render merged response details
  const renderMergedDetails = (mergedResponse: MergedResponse) => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between p-2">
          <span className="text-xs">View Merging Details</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        <div className="p-3 border rounded-lg bg-primary/5">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium">Strategy:</span> {mergedResponse.mergingStrategy}
            </div>
            <div>
              <span className="font-medium">Confidence:</span> {Math.round(mergedResponse.confidenceScore * 100)}%
            </div>
            <div>
              <span className="font-medium">Models:</span> {mergedResponse.contributingModels.length}
            </div>
            <div>
              <span className="font-medium">Time:</span> {mergedResponse.metadata.totalProcessingTime}ms
            </div>
          </div>
          
          {mergedResponse.processingBreakdown.reasoning.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-xs">Reasoning Sources:</span>
              <ul className="text-xs text-muted-foreground mt-1">
                {mergedResponse.processingBreakdown.reasoning.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto h-[90vh] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Multi-Model AI Conversation
            <Badge variant="secondary" className="text-xs">
              {selectedModels.length} models selected
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardTitle>
        
        {selectedModels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedModels.map((model) => {
              const Icon = {
                llm: Brain,
                small: Zap,
                vision: Eye,
                mcp: Bot
              }[model.category];
              
              return (
                <Badge key={`${model.provider}-${model.model}`} variant="outline" className="text-xs">
                  <Icon className="h-3 w-3 mr-1" />
                  {model.name}
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>

      {/* Model Selector */}
      {showModelSelector && (
        <div className="flex-shrink-0 p-4 border-b">
          <CrossCategoryModelSelector
            onModelsSelect={setSelectedModels}
            selectedModels={selectedModels}
            mode="multi"
            maxSelections={maxModels}
          />
          
          {selectedModels.length > 1 && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Merging Strategy</label>
              <div className="flex items-center gap-2">
                <Select value={mergingStrategy} onValueChange={setMergingStrategy as any}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weighted">Weighted</SelectItem>
                    <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    <SelectItem value="consensus">Consensus</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                  </SelectContent>
                </Select>
                {suggestedStrategy !== mergingStrategy && (
                  <Badge variant="outline" className="text-xs">
                    Suggested: {suggestedStrategy}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  {message.content}
                </div>
                
                {message.type === 'assistant' && message.mergedResponse && (
                  <div className="mt-3 space-y-2">
                    {renderMergedDetails(message.mergedResponse)}
                    {message.individualResponses && renderIndividualResponses(message.individualResponses)}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing indicators */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Processing with {selectedModels.length} models...</span>
                </div>
                
                <div className="space-y-2">
                  {selectedModels.map((model) => {
                    const modelKey = `${model.provider}-${model.model}`;
                    const isComplete = processingProgress[modelKey];
                    const Icon = {
                      llm: Brain,
                      small: Zap,
                      vision: Eye,
                      mcp: Bot
                    }[model.category];
                    
                    return (
                      <div key={modelKey} className="flex items-center gap-2 text-xs">
                        <Icon className="h-3 w-3" />
                        <span className="flex-1">{model.name}</span>
                        {isComplete ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <div className="animate-pulse h-3 w-3 bg-primary/50 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t">
        {selectedModels.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Please select at least one model to start the conversation
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={isProcessing || !inputMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                Send to {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};