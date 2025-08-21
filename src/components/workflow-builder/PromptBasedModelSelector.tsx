import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
// Collapsible component will be inline
import { ChevronDown, Search, Sparkles, Bot, Brain } from 'lucide-react';

// AI Model Categories and Options
const AI_MODEL_CATEGORIES = {
  'Chat Models': [
    { id: 'aws-bedrock', name: 'AWS ChatBedrock', icon: '🟡', provider: 'AWS' },
    { id: 'azure-openai', name: 'Azure ChatOpenAI', icon: '🔵', provider: 'Azure' },
    { id: 'alibaba-tongyi', name: 'ChatAlibabaTongyi', icon: '🟠', provider: 'Alibaba' },
    { id: 'anthropic', name: 'ChatAnthropic', icon: '🟤', provider: 'Anthropic' },
    { id: 'baidu-wenxin', name: 'ChatBaiduWenxin', icon: '🔴', provider: 'Baidu' },
    { id: 'cerebras', name: 'ChatCerebras', icon: '🟣', provider: 'Cerebras' },
    { id: 'cohere', name: 'ChatCohere', icon: '🟢', provider: 'Cohere' },
    { id: 'fireworks', name: 'ChatFireworks', icon: '🟡', provider: 'Fireworks' },
    { id: 'google-genai', name: 'ChatGoogleGenerativeAI', icon: '🔵', provider: 'Google' },
    { id: 'google-vertex', name: 'ChatGoogleVertexAI', icon: '🔷', provider: 'Google' },
    { id: 'huggingface', name: 'ChatHuggingFace', icon: '🤗', provider: 'HuggingFace' },
    { id: 'ibm-watson', name: 'ChatIBMWatsonx', icon: '🔳', provider: 'IBM' },
  ],
  'LLMs': [
    { id: 'openai-gpt4', name: 'GPT-4o', icon: '🤖', provider: 'OpenAI' },
    { id: 'openai-gpt4-mini', name: 'GPT-4o-mini', icon: '🤖', provider: 'OpenAI' },
    { id: 'claude-opus', name: 'Claude Opus', icon: '🧠', provider: 'Anthropic' },
    { id: 'claude-sonnet', name: 'Claude Sonnet', icon: '🧠', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', icon: '💎', provider: 'Google' },
    { id: 'llama-3', name: 'Llama 3', icon: '🦙', provider: 'Meta' },
  ],
  'Small Language Models': [
    { id: 'phi-3', name: 'Phi-3 Mini', icon: '⚡', provider: 'Microsoft' },
    { id: 'mistral-7b', name: 'Mistral 7B', icon: '🌪️', provider: 'Mistral' },
    { id: 'gemma-2b', name: 'Gemma 2B', icon: '💎', provider: 'Google' },
  ],
  'Vision Language Models': [
    { id: 'gpt4-vision', name: 'GPT-4 Vision', icon: '👁️', provider: 'OpenAI' },
    { id: 'claude-vision', name: 'Claude Vision', icon: '👀', provider: 'Anthropic' },
    { id: 'gemini-vision', name: 'Gemini Vision Pro', icon: '🔍', provider: 'Google' },
  ],
  'Embedding Models': [
    { id: 'text-embedding-3', name: 'Text Embedding 3', icon: '📊', provider: 'OpenAI' },
    { id: 'sentence-transformers', name: 'Sentence Transformers', icon: '🔄', provider: 'HuggingFace' },
  ],
  'Tools & Integrations': [
    { id: 'mcp', name: 'Model Context Protocol', icon: '🔌', provider: 'Various' },
    { id: 'labeling-studio', name: 'Labeling Studio', icon: '🏷️', provider: 'Heartex' },
    { id: 'seven-labs', name: 'ElevenLabs Voice', icon: '🔊', provider: 'ElevenLabs' },
    { id: 'huggingface-tools', name: 'HuggingFace Tools', icon: '🛠️', provider: 'HuggingFace' },
  ],
  'Retrieval & Memory': [
    { id: 'vector-stores', name: 'Vector Stores', icon: '🗄️', provider: 'Various' },
    { id: 'retrievers', name: 'Document Retrievers', icon: '📑', provider: 'Various' },
    { id: 'memory', name: 'Conversation Memory', icon: '🧠', provider: 'Various' },
  ],
  'Agents & Chains': [
    { id: 'agents', name: 'AI Agents', icon: '🤖', provider: 'Various' },
    { id: 'chains', name: 'Processing Chains', icon: '⛓️', provider: 'Various' },
    { id: 'cache', name: 'Response Cache', icon: '💾', provider: 'Various' },
  ],
  'Data Processing': [
    { id: 'document-loaders', name: 'Document Loaders', icon: '📄', provider: 'Various' },
    { id: 'text-splitters', name: 'Text Splitters', icon: '✂️', provider: 'Various' },
    { id: 'output-parsers', name: 'Output Parsers', icon: '🔍', provider: 'Various' },
    { id: 'prompts', name: 'Prompt Templates', icon: '📝', provider: 'Various' },
    { id: 'record-manager', name: 'Record Manager', icon: '📋', provider: 'Various' },
    { id: 'moderation', name: 'Content Moderation', icon: '🛡️', provider: 'Various' },
  ],
};

interface PromptBasedModelSelectorProps {
  onModelSelect: (model: any) => void;
  selectedModels?: string[];
}

export const PromptBasedModelSelector: React.FC<PromptBasedModelSelectorProps> = ({
  onModelSelect,
  selectedModels = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Chat Models': true,
    'LLMs': true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filterModels = (models: any[]) => {
    if (!searchTerm) return models;
    return models.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Models & Tools
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models, providers, or tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {Object.entries(AI_MODEL_CATEGORIES).map(([category, models]) => {
              const filteredModels = filterModels(models);
              if (filteredModels.length === 0 && searchTerm) return null;
              
              return (
                <div key={category}>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-2 h-auto text-left hover:bg-accent/50"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedCategories[category] ? 'rotate-0' : '-rotate-90'
                        }`} 
                      />
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {filteredModels.length}
                      </Badge>
                    </div>
                  </Button>
                  
                  {expandedCategories[category] && (
                    <div className="space-y-1 ml-6">
                      {filteredModels.map((model) => (
                        <Button
                          key={model.id}
                          variant={selectedModels.includes(model.id) ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => onModelSelect(model)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-lg">{model.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{model.name}</div>
                              <div className="text-xs text-muted-foreground">{model.provider}</div>
                            </div>
                            {selectedModels.includes(model.id) && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};