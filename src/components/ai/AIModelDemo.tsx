import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModelCategorySelector } from './ModelCategorySelector';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { ragService } from '@/services/ragService';
import { Loader2, Send, Brain, Database, AlertCircle } from 'lucide-react';

export const AIModelDemo: React.FC = () => {
  const { generateResponse, isLoading } = useUniversalAI();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<{ provider: string; model: string; category: string }>({
    provider: 'openai',
    model: 'gpt-5-2025-08-07',
    category: 'llm'
  });
  const [response, setResponse] = useState<string>('');
  const [ragInfo, setRagInfo] = useState<{ hasContext: boolean; sources: string[] }>({ hasContext: false, sources: [] });

  const handleModelSelect = (provider: string, model: string, category: string) => {
    setSelectedModel({ provider, model, category });
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setResponse('');
    setRagInfo({ hasContext: false, sources: [] });

    try {
      // First, try to enhance with RAG/Label Studio
      const ragResult = await ragService.enhancePromptWithRAG(prompt, ['label_studio']);
      setRagInfo({ hasContext: ragResult.hasContext, sources: ragResult.contextSources });

      // Generate response with selected model
      const result = await generateResponse({
        provider: selectedModel.provider as any,
        model: selectedModel.model,
        prompt: ragResult.enhancedPrompt,
        systemPrompt: `You are a helpful AI assistant. You are currently running as ${selectedModel.model} (${selectedModel.category} category).`,
        temperature: 0.7,
        maxTokens: 1000
      });

      if (result) {
        setResponse(result.content);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Model Categories Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>How it works across the app:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>✅ <strong>Universal System:</strong> Changes here work everywhere - Genie, Agents, Workflow Builder, Testing</li>
              <li>✅ <strong>Label Studio Fallback:</strong> When Label Studio has no data, LLM continues normally</li>
              <li>✅ <strong>Model Categories:</strong> LLM (most capable), Small (fast), Vision (supports images)</li>
              <li>✅ <strong>Auto Fallbacks:</strong> If selected model fails, automatically tries similar models</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <ModelCategorySelector
          onModelSelect={handleModelSelect}
          selectedModel={selectedModel}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Test Selected Model
            </CardTitle>
            {selectedModel && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedModel.provider} - {selectedModel.model}
                </Badge>
                <Badge variant="secondary">
                  {selectedModel.category} category
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your prompt to test the selected model..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Model
                </>
              )}
            </Button>

            {ragInfo.hasContext && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Database className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <strong>Context Found:</strong> {ragInfo.sources.join(', ')}
                </div>
              </div>
            )}

            {!ragInfo.hasContext && prompt && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  <strong>No Context:</strong> Using pure LLM knowledge
                </div>
              </div>
            )}

            {response && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Response:</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};