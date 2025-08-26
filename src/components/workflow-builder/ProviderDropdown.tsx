import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderDropdownProps {
  nodes: any[];
  onNodeSelect?: (node: any) => void;
  onDragStart?: (event: React.DragEvent, node: any) => void;
}

export const ProviderDropdown: React.FC<ProviderDropdownProps> = ({
  nodes,
  onNodeSelect,
  onDragStart
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  // Group nodes by provider
  const nodesByProvider = nodes.reduce((acc, node) => {
    const provider = node.provider_group || node.provider || 'Other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(node);
    return acc;
  }, {} as Record<string, any[]>);

  const getProviderLogo = (provider: string) => {
    const logoMap: Record<string, string> = {
      'openai': '/ai-logos/openai.svg',
      'anthropic': '/ai-logos/anthropic.svg',
      'google': '/ai-logos/google.svg',
      'meta': '/ai-logos/meta.svg',
      'microsoft': '/ai-logos/microsoft.svg',
      'aws': '/ai-logos/aws.svg',
      'huggingface': '/ai-logos/huggingface.svg',
      'elevenlabs': '/voice-logos/elevenlabs.svg',
      'twilio': '/channel-logos/twilio.svg',
      'whatsapp': '/channel-logos/whatsapp.svg',
      'telegram': '/channel-logos/telegram.svg',
      'mcp': '/mcp-logos/mcp.svg'
    };
    return logoMap[provider.toLowerCase()] || '/default-logo.svg';
  };

  const selectedNodes = selectedProvider ? nodesByProvider[selectedProvider] || [] : [];

  return (
    <div className="space-y-3">
      {/* Provider Selection */}
      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="Select a provider to see available models/tools" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(nodesByProvider).map((provider) => (
            <SelectItem key={provider} value={provider}>
              <div className="flex items-center gap-2">
                <img 
                  src={getProviderLogo(provider)} 
                  alt={provider}
                  className="h-4 w-4 rounded object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{provider}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {nodesByProvider[provider].length}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Provider's Nodes */}
      {selectedProvider && selectedNodes.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <img 
              src={getProviderLogo(selectedProvider)} 
              alt={selectedProvider}
              className="h-3 w-3 rounded object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {selectedProvider} Models ({selectedNodes.length})
          </div>
          {selectedNodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "group flex items-center justify-between p-2 rounded-md border cursor-pointer",
                "hover:border-primary/50 hover:bg-muted/50 transition-all"
              )}
              draggable
              onDragStart={(e) => onDragStart?.(e, node)}
              onClick={() => onNodeSelect?.(node)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: node.color || '#666' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{node.display_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {node.model_type || node.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open configuration
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Provider Selected State */}
      {!selectedProvider && (
        <div className="text-center py-4 text-xs text-muted-foreground">
          Select a provider above to see available tools and models
        </div>
      )}
    </div>
  );
};