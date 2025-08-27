import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2 } from 'lucide-react';

interface VoiceConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      provider?: string;
      voice?: string;
      language?: string;
      speed?: number;
      pitch?: number;
    };
  };
}

const VoiceConfigurationNode: React.FC<VoiceConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};

  return (
    <div className="min-w-[280px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Voice Configuration
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Provider:</span>
              <div className="font-medium">{config.provider || 'OpenAI'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Voice:</span>
              <div className="font-medium">{config.voice || 'alloy'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Language:</span>
              <div className="font-medium">{config.language || 'en-US'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Speed:</span>
              <div className="font-medium">{config.speed || 1.0}x</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Pitch: {config.pitch || 1.0}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default VoiceConfigurationNode;