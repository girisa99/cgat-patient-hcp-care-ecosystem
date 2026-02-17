import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, Database, MessageSquare, Phone, Settings, Users, 
  Plus, Check, X, Zap, Brain, Upload, Download 
} from 'lucide-react';
import { useAIModelManager } from '@/hooks/useAIModelManager';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceConfigurations } from '@/hooks/useApiServiceConfigurations';

interface NodeAssetSelectorProps {
  nodeType: string;
  category: string;
  onAssetSelected: (asset: any) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export const NodeAssetSelector: React.FC<NodeAssetSelectorProps> = ({
  nodeType,
  category,
  onAssetSelected,
  onCreateNew,
  onClose
}) => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('existing');
  
  const { aiModels, isLoading: loadingModels } = useAIModelManager();
  const { apiServices, isLoading: loadingServices } = useApiServices();
  const { apiServiceConfigurations, isLoading: loadingConfigs } = useApiServiceConfigurations();

  // Get relevant assets based on node type and category
  const getRelevantAssets = () => {
    const assets: any[] = [];

    // AI Models for AI-related nodes
    if (category === 'ai_intelligence' || nodeType.includes('ai') || nodeType.includes('llm')) {
      aiModels.forEach(model => {
        assets.push({
          id: model.id,
          name: model.name,
          type: 'ai_model',
          provider: model.provider,
          model_type: model.model_type,
          logo: getProviderLogo(model.provider),
          icon: Brain,
          description: `${model.provider} ${model.model_type} model`,
          config: (model as any).configuration
        });
      });
    }

    // API Services for integration nodes
    if (category === 'integrations' || nodeType.includes('api') || nodeType.includes('webhook')) {
      apiServices.forEach(service => {
        assets.push({
          id: service.id,
          name: service.name,
          type: 'api_service',
          category: service.category,
          logo: (service as any).logo_url || '/service-logos/default.svg',
          icon: Database,
          description: service.description,
          config: (service as any).configuration || {}
        });
      });
    }

    // Channel-specific assets
    if (category === 'channels' || nodeType.includes('channel')) {
      const channelAssets = [
        {
          id: 'whatsapp_business',
          name: 'WhatsApp Business API',
          type: 'channel',
          logo: '/channel-logos/whatsapp.svg',
          icon: MessageSquare,
          description: 'WhatsApp messaging channel',
          provider: 'Meta'
        },
        {
          id: 'telegram_bot',
          name: 'Telegram Bot API',
          type: 'channel',
          logo: '/channel-logos/telegram.svg',
          icon: Bot,
          description: 'Telegram bot integration',
          provider: 'Telegram'
        },
        {
          id: 'voice_twilio',
          name: 'Twilio Voice',
          type: 'voice',
          logo: '/channel-logos/twilio.svg',
          icon: Phone,
          description: 'Voice calls via Twilio',
          provider: 'Twilio'
        }
      ];
      assets.push(...channelAssets);
    }

    return assets;
  };

  const getProviderLogo = (provider: string) => {
    const logoMap: Record<string, string> = {
      'openai': '/ai-logos/openai.svg',
      'anthropic': '/ai-logos/anthropic.svg',
      'google': '/ai-logos/google.svg',
      'meta': '/ai-logos/meta.svg',
      'cohere': '/ai-logos/cohere.svg',
      'huggingface': '/ai-logos/huggingface.svg'
    };
    return logoMap[provider.toLowerCase()] || '/ai-logos/default.svg';
  };

  const relevantAssets = getRelevantAssets();

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onAssetSelected(selectedAsset);
    }
  };

  if (loadingModels || loadingServices || loadingConfigs) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {nodeType} Node
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select an existing asset or create a new one
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Use Existing ({relevantAssets.length})</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4">
            {relevantAssets.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assets Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No existing assets found for this node type. Create a new one to get started.
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Asset
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {relevantAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAsset?.id === asset.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {asset.logo ? (
                            <img 
                              src={asset.logo} 
                              alt={asset.name}
                              className="h-8 w-8 rounded object-contain"
                            />
                          ) : (
                            <asset.icon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{asset.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {asset.type}
                            </Badge>
                            {asset.provider && (
                              <Badge variant="outline" className="text-xs">
                                {asset.provider}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {asset.description}
                          </p>
                        </div>
                        {selectedAsset?.id === asset.id && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedAsset && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{selectedAsset.name}</span> selected
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleConfirmSelection}>
                          <Check className="h-4 w-4 mr-2" />
                          Use This Asset
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <div className="text-center py-8">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Create New Asset</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure a new {nodeType} asset with custom settings
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Open Asset Creator
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};