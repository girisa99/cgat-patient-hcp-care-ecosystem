import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Database, Search, Zap, Plus, Trash2 } from 'lucide-react';

interface VectorStoresConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const VectorStoresConfig: React.FC<VectorStoresConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderPineconeConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Pinecone Vector Store Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter Pinecone API key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="indexName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Index Name *</FormLabel>
              <FormControl>
                <Input placeholder="my-index" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="environment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment *</FormLabel>
              <FormControl>
                <Input placeholder="us-west1-gcp" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dimension"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vector Dimension</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1536" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance Metric</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'cosine'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cosine">Cosine</SelectItem>
                    <SelectItem value="euclidean">Euclidean</SelectItem>
                    <SelectItem value="dotproduct">Dot Product</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="namespace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namespace (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="default-namespace" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topK"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top K Results: {field.value || 5}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 5]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={100}
                    min={1}
                    step={1}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scoreThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score Threshold: {field.value || 0.7}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0.7]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="includeMetadata"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Include Metadata</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeValues"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Include Values</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderChromaConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          ChromaDB Vector Store Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host *</FormLabel>
              <FormControl>
                <Input placeholder="localhost" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="8000" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collectionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection Name *</FormLabel>
              <FormControl>
                <Input placeholder="my-collection" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="embeddingFunction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Embedding Function</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding function" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai">OpenAI Embeddings</SelectItem>
                  <SelectItem value="sentence-transformers">Sentence Transformers</SelectItem>
                  <SelectItem value="default">Default Function</SelectItem>
                  <SelectItem value="custom">Custom Function</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Results: {field.value || 10}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 10]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={100}
                    min={1}
                    step={1}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whereDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Where Document Filter</FormLabel>
                <FormControl>
                  <Input placeholder='{"key": "value"}' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includeDocuments"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value !== false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Include Documents</FormLabel>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderWeaviateConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-500" />
          Weaviate Vector Store Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weaviate URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://my-cluster.weaviate.network" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Optional API key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name *</FormLabel>
              <FormControl>
                <Input placeholder="Document" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="textKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Key</FormLabel>
              <FormControl>
                <Input placeholder="text" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Results Limit: {field.value || 4}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 4]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={50}
                    min={1}
                    step={1}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certainty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certainty: {field.value || 0.7}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0.7]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Additional Properties */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Additional Properties</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const props = configuration.additionalProperties || [];
                onChange({ ...configuration, additionalProperties: [...props, { key: '', value: '' }] });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Button>
          </div>
          
          {(configuration.additionalProperties || []).map((prop: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={prop.key || ''}
                  onChange={(e) => {
                    const props = [...(configuration.additionalProperties || [])];
                    props[index] = { ...props[index], key: e.target.value };
                    onChange({ ...configuration, additionalProperties: props });
                  }}
                  placeholder="Property key"
                />
                <Input
                  value={prop.value || ''}
                  onChange={(e) => {
                    const props = [...(configuration.additionalProperties || [])];
                    props[index] = { ...props[index], value: e.target.value };
                    onChange({ ...configuration, additionalProperties: props });
                  }}
                  placeholder="Property value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const props = [...(configuration.additionalProperties || [])];
                    props.splice(index, 1);
                    onChange({ ...configuration, additionalProperties: props });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderGenericVectorStore = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="connectionString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String *</FormLabel>
              <FormControl>
                <Input placeholder="Enter connection details" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="indexName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Index/Collection Name *</FormLabel>
              <FormControl>
                <Input placeholder="my-index" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vectorDimension"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vector Dimension</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1536" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="similarityMetric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Similarity Metric</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'cosine'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cosine">Cosine</SelectItem>
                    <SelectItem value="euclidean">Euclidean</SelectItem>
                    <SelectItem value="manhattan">Manhattan</SelectItem>
                    <SelectItem value="dot">Dot Product</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="embeddingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Embedding Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="text-embedding-ada-002">OpenAI Ada v2</SelectItem>
                  <SelectItem value="text-embedding-3-small">OpenAI v3 Small</SelectItem>
                  <SelectItem value="text-embedding-3-large">OpenAI v3 Large</SelectItem>
                  <SelectItem value="sentence-transformers">Sentence Transformers</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topK"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top K Results: {field.value || 5}</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value || 5]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={50}
                  min={1}
                  step={1}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'pinecone':
      return renderPineconeConfig();
    case 'chroma':
    case 'chromadb':
      return renderChromaConfig();
    case 'weaviate':
      return renderWeaviateConfig();
    case 'faiss':
    case 'elasticsearch':
    case 'redis':
    default:
      return renderGenericVectorStore();
  }
};