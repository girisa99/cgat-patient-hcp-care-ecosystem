import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Eye, Sparkles } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';

interface ModelCategorySelectorProps {
  onModelSelect: (provider: string, model: string, category: string) => void;
  selectedModel?: { provider: string; model: string; category: string };
}

export const ModelCategorySelector: React.FC<ModelCategorySelectorProps> = ({
  onModelSelect,
  selectedModel
}) => {
  const { getModelsByCategory, isProviderAvailable } = useUniversalAI();
  const [activeCategory, setActiveCategory] = useState<'llm' | 'small' | 'vision'>('llm');

  const categoryIcons = {
    llm: Brain,
    small: Zap,
    vision: Eye
  };

  const categoryDescriptions = {
    llm: 'Full-size Language Models - Most capable, best for complex reasoning and detailed responses',
    small: 'Small Language Models - Faster, efficient, great for simple tasks and quick responses',
    vision: 'Vision Language Models - Can process images and visual content along with text'
  };

  const renderModelCategory = (category: 'llm' | 'small' | 'vision') => {
    const models = getModelsByCategory(category);
    const Icon = categoryIcons[category];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold capitalize">{category === 'llm' ? 'Large Language Models' : category === 'small' ? 'Small Language Models' : 'Vision Language Models'}</h3>
            <p className="text-sm text-muted-foreground">{categoryDescriptions[category]}</p>
          </div>
        </div>
        
        {Object.entries(models).map(([provider, providerModels]) => (
          <Card key={provider} className={`${!isProviderAvailable(provider as any) ? 'opacity-50' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                {!isProviderAvailable(provider as any) && (
                  <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {providerModels.map((model) => {
                  const isSelected = selectedModel?.provider === provider && 
                                   selectedModel?.model === model && 
                                   selectedModel?.category === category;
                  
                  return (
                    <Button
                      key={model}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => onModelSelect(provider, model, category)}
                      disabled={!isProviderAvailable(provider as any)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{model}</div>
                        <div className="text-xs text-muted-foreground">
                          {category === 'llm' && 'Most capable and intelligent'}
                          {category === 'small' && 'Fast and efficient'}
                          {category === 'vision' && 'Supports images and vision'}
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          Selected
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Model Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              LLM
            </TabsTrigger>
            <TabsTrigger value="small" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Small
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vision
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="llm" className="mt-4">
            {renderModelCategory('llm')}
          </TabsContent>
          
          <TabsContent value="small" className="mt-4">
            {renderModelCategory('small')}
          </TabsContent>
          
          <TabsContent value="vision" className="mt-4">
            {renderModelCategory('vision')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};