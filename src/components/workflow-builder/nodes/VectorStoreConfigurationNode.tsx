import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Database, Search, Settings, Zap } from 'lucide-react';

export const VectorStoreConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Vector Store Type
    store_type: data.store_type || 'supabase',
    
    // Connection Configuration
    connection_string: data.connection_string || '',
    database_name: data.database_name || '',
    table_name: data.table_name || 'embeddings',
    
    // Vector Configuration
    vector_dimension: data.vector_dimension || 1536,
    distance_metric: data.distance_metric || 'cosine',
    index_type: data.index_type || 'ivfflat',
    
    // Embedding Configuration
    embedding_model: data.embedding_model || 'text-embedding-ada-002',
    embedding_provider: data.embedding_provider || 'openai',
    chunk_size: data.chunk_size || 1000,
    chunk_overlap: data.chunk_overlap || 200,
    
    // Search Configuration
    search_type: data.search_type || 'similarity',
    similarity_threshold: data.similarity_threshold || 0.7,
    max_results: data.max_results || 10,
    
    // Metadata Configuration
    metadata_fields: data.metadata_fields || [],
    filter_expressions: data.filter_expressions || [],
    
    // Performance Settings
    enable_caching: data.enable_caching || true,
    cache_ttl_seconds: data.cache_ttl_seconds || 3600,
    batch_size: data.batch_size || 100,
    
    // Security Settings
    enable_ssl: data.enable_ssl || true,
    connection_pool_size: data.connection_pool_size || 10,
    query_timeout_ms: data.query_timeout_ms || 30000,
    
    // Hybrid Search
    enable_hybrid_search: data.enable_hybrid_search || false,
    keyword_weight: data.keyword_weight || 0.3,
    semantic_weight: data.semantic_weight || 0.7,
    
    // Storage Optimization
    compression_enabled: data.compression_enabled || false,
    auto_vacuum: data.auto_vacuum || true,
    backup_enabled: data.backup_enabled || false,
    backup_interval_hours: data.backup_interval_hours || 24
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof data?.configOpen !== 'undefined') {
      setIsExpanded(!!data.configOpen);
    }
  }, [data?.configOpen]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addMetadataField = () => {
    updateConfig({
      metadata_fields: [...config.metadata_fields, { name: '', type: 'text', indexed: false }]
    });
  };

  const updateMetadataField = (index: number, field: string, value: any) => {
    const updated = [...config.metadata_fields];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ metadata_fields: updated });
  };

  const removeMetadataField = (index: number) => {
    updateConfig({
      metadata_fields: config.metadata_fields.filter((_, i) => i !== index)
    });
  };

  const addFilterExpression = () => {
    updateConfig({
      filter_expressions: [...config.filter_expressions, { field: '', operator: 'equals', value: '', enabled: true }]
    });
  };

  const updateFilterExpression = (index: number, field: string, value: any) => {
    const updated = [...config.filter_expressions];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ filter_expressions: updated });
  };

  const removeFilterExpression = (index: number) => {
    updateConfig({
      filter_expressions: config.filter_expressions.filter((_, i) => i !== index)
    });
  };

  const storeTypes = [
    { value: 'supabase', label: 'Supabase Vector Store' },
    { value: 'postgres', label: 'PostgreSQL Vector Store' },
    { value: 'mysql', label: 'MySQL Vector Store' },
    { value: 'pinecone', label: 'Pinecone' },
    { value: 'weaviate', label: 'Weaviate' },
    { value: 'chroma', label: 'ChromaDB' }
  ];

  const distanceMetrics = [
    { value: 'cosine', label: 'Cosine Similarity' },
    { value: 'euclidean', label: 'Euclidean Distance' },
    { value: 'manhattan', label: 'Manhattan Distance' },
    { value: 'dot_product', label: 'Dot Product' }
  ];

  const indexTypes = [
    { value: 'ivfflat', label: 'IVFFlat' },
    { value: 'hnsw', label: 'HNSW' },
    { value: 'flat', label: 'Flat (Exact)' }
  ];

  const embeddingModels = [
    { value: 'text-embedding-ada-002', label: 'OpenAI Ada 002' },
    { value: 'text-embedding-3-small', label: 'OpenAI Embedding 3 Small' },
    { value: 'text-embedding-3-large', label: 'OpenAI Embedding 3 Large' },
    { value: 'sentence-transformers', label: 'Sentence Transformers' },
    { value: 'cohere-embed', label: 'Cohere Embeddings' }
  ];

  const searchTypes = [
    { value: 'similarity', label: 'Similarity Search' },
    { value: 'mmr', label: 'Maximal Marginal Relevance' },
    { value: 'hybrid', label: 'Hybrid Search' },
    { value: 'keyword', label: 'Keyword Search' }
  ];

  const metadataFieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'date', label: 'Date' },
    { value: 'json', label: 'JSON' }
  ];

  const filterOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In Array' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' }
  ];

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Database}
      title={`${data.display_name || 'Vector Store'} - ${config.store_type}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.store_type}
        </Badge>
        <Badge variant="outline" className="mr-1">{config.vector_dimension}D</Badge>
        {config.enable_hybrid_search && (
          <Badge variant="outline">Hybrid Search</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Store Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Vector Store Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Store Type</Label>
                <Select value={config.store_type} onValueChange={(value) => updateConfig({ store_type: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Database Name</Label>
                  <Input
                    className="h-8"
                    value={config.database_name}
                    onChange={(e) => updateConfig({ database_name: e.target.value })}
                    placeholder="embeddings_db"
                  />
                </div>
                <div>
                  <Label className="text-xs">Table Name</Label>
                  <Input
                    className="h-8"
                    value={config.table_name}
                    onChange={(e) => updateConfig({ table_name: e.target.value })}
                    placeholder="embeddings"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Connection String</Label>
                <Input
                  type="password"
                  className="h-8"
                  value={config.connection_string}
                  onChange={(e) => updateConfig({ connection_string: e.target.value })}
                  placeholder="postgresql://user:pass@host:port/db"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vector Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vector Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Vector Dimension</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.vector_dimension}
                    onChange={(e) => updateConfig({ vector_dimension: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Distance Metric</Label>
                  <Select value={config.distance_metric} onValueChange={(value) => updateConfig({ distance_metric: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {distanceMetrics.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>{metric.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Index Type</Label>
                  <Select value={config.index_type} onValueChange={(value) => updateConfig({ index_type: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indexTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embedding Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Embedding Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Embedding Model</Label>
                  <Select value={config.embedding_model} onValueChange={(value) => updateConfig({ embedding_model: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {embeddingModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Provider</Label>
                  <Select value={config.embedding_provider} onValueChange={(value) => updateConfig({ embedding_provider: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="cohere">Cohere</SelectItem>
                      <SelectItem value="huggingface">HuggingFace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Chunk Size</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.chunk_size}
                    onChange={(e) => updateConfig({ chunk_size: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Chunk Overlap</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.chunk_overlap}
                    onChange={(e) => updateConfig({ chunk_overlap: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Search Type</Label>
                  <Select value={config.search_type} onValueChange={(value) => updateConfig({ search_type: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {searchTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Similarity Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="h-8"
                    value={config.similarity_threshold}
                    onChange={(e) => updateConfig({ similarity_threshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Results</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.max_results}
                    onChange={(e) => updateConfig({ max_results: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Hybrid Search</Label>
                <Switch
                  checked={config.enable_hybrid_search}
                  onCheckedChange={(checked) => updateConfig({ enable_hybrid_search: checked })}
                />
              </div>

              {config.enable_hybrid_search && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Keyword Weight</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="h-8"
                      value={config.keyword_weight}
                      onChange={(e) => updateConfig({ keyword_weight: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Semantic Weight</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="h-8"
                      value={config.semantic_weight}
                      onChange={(e) => updateConfig({ semantic_weight: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Metadata Fields
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addMetadataField}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.metadata_fields.map((field, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={field.name}
                      onChange={(e) => updateMetadataField(index, 'name', e.target.value)}
                      placeholder="Field name"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateMetadataField(index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metadataFieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={field.indexed}
                        onCheckedChange={(checked) => updateMetadataField(index, 'indexed', checked)}
                      />
                      <Label className="text-xs">Indexed</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMetadataField(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Caching</Label>
                <Switch
                  checked={config.enable_caching}
                  onCheckedChange={(checked) => updateConfig({ enable_caching: checked })}
                />
              </div>

              {config.enable_caching && (
                <div>
                  <Label className="text-xs">Cache TTL (seconds)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.cache_ttl_seconds}
                    onChange={(e) => updateConfig({ cache_ttl_seconds: parseInt(e.target.value) })}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Batch Size</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.batch_size}
                    onChange={(e) => updateConfig({ batch_size: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Pool Size</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.connection_pool_size}
                    onChange={(e) => updateConfig({ connection_pool_size: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.query_timeout_ms}
                    onChange={(e) => updateConfig({ query_timeout_ms: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enable_ssl}
                    onCheckedChange={(checked) => updateConfig({ enable_ssl: checked })}
                  />
                  <Label className="text-xs">Enable SSL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.compression_enabled}
                    onCheckedChange={(checked) => updateConfig({ compression_enabled: checked })}
                  />
                  <Label className="text-xs">Compression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backup_enabled}
                    onCheckedChange={(checked) => updateConfig({ backup_enabled: checked })}
                  />
                  <Label className="text-xs">Auto Backup</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </BaseWorkflowNode>
  );
};