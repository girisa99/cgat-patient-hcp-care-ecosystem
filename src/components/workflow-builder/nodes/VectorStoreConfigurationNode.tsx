import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Search, Upload } from 'lucide-react';

interface VectorStoreConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      store_type?: string;
      vector_dimension?: number;
      distance_metric?: string;
      index_type?: string;
      embedding_model?: string;
      collection_name?: string;
    };
  };
}

export const VectorStoreConfigurationNode: React.FC<VectorStoreConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};

  const storeTypeColors = {
    supabase: 'bg-green-500/10 text-green-600',
    pinecone: 'bg-blue-500/10 text-blue-600',
    weaviate: 'bg-purple-500/10 text-purple-600',
    chroma: 'bg-orange-500/10 text-orange-600',
    default: 'bg-gray-500/10 text-gray-600'
  };

  const storeType = config.store_type || 'supabase';
  const colorClass = storeTypeColors[storeType as keyof typeof storeTypeColors] || storeTypeColors.default;

  return (
    <div className="min-w-[300px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-blue-500/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Vector Store
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Store Type:</span>
            <Badge className={`text-xs ${colorClass}`}>
              {storeType.charAt(0).toUpperCase() + storeType.slice(1)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Dimensions:</span>
              <div className="font-medium">{config.vector_dimension || 1536}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Distance:</span>
              <div className="font-medium">{config.distance_metric || 'cosine'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Index Type:</span>
              <div className="font-medium">{config.index_type || 'ivfflat'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Embedding:</span>
              <div className="font-medium">{config.embedding_model || 'text-ada-002'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Upload className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Store</span>
            </div>
            <div className="flex items-center gap-1">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Search</span>
            </div>
          </div>
          
          {config.collection_name && (
            <div className="text-xs">
              <span className="text-muted-foreground">Collection:</span>
              <div className="font-medium">{config.collection_name}</div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};