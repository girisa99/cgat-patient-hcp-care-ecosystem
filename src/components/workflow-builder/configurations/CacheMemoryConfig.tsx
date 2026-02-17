import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Database, MessageCircle, Search, Zap } from 'lucide-react';

interface CacheMemoryConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const CacheMemoryConfig: React.FC<CacheMemoryConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderRedisCache = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-red-500" />
          Redis Cache Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="redisHost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redis Host *</FormLabel>
              <FormControl>
                <Input placeholder="localhost" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="redisPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redis Port *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="6379" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="redisDb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Database Number</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="redisPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Redis password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectionTimeout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Timeout (ms)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5000" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultTTL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default TTL (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3600" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxMemory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Memory (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="256" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="evictionPolicy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eviction Policy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'allkeys-lru'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="noeviction">No Eviction</SelectItem>
                  <SelectItem value="allkeys-lru">All Keys LRU</SelectItem>
                  <SelectItem value="allkeys-lfu">All Keys LFU</SelectItem>
                  <SelectItem value="volatile-lru">Volatile LRU</SelectItem>
                  <SelectItem value="volatile-lfu">Volatile LFU</SelectItem>
                  <SelectItem value="allkeys-random">All Keys Random</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableCompression"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Compression</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableSSL"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>SSL/TLS</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableClustering"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Clustering</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderConversationMemory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          Conversation Memory Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="memoryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memory Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select memory type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buffer">🔄 Buffer Memory</SelectItem>
                  <SelectItem value="summary">📋 Summary Memory</SelectItem>
                  <SelectItem value="summary-buffer">🔄📋 Summary Buffer</SelectItem>
                  <SelectItem value="token-buffer">🎯 Token Buffer</SelectItem>
                  <SelectItem value="entity">👤 Entity Memory</SelectItem>
                  <SelectItem value="knowledge-graph">🕸️ Knowledge Graph</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {(configuration.memoryType === 'buffer' || configuration.memoryType === 'summary-buffer') && (
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens: {field.value || 2000}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 2000]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={8000}
                    min={100}
                    step={100}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {(configuration.memoryType === 'buffer' || configuration.memoryType === 'token-buffer') && (
          <FormField
            control={form.control}
            name="maxMessages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Messages: {field.value || 10}</FormLabel>
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
        )}

        <FormField
          control={form.control}
          name="sessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session ID Template</FormLabel>
              <FormControl>
                <Input placeholder="user_{user_id}_session_{timestamp}" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contextWindow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Context Window: {field.value || 5} messages</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="persistMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Persist Memory</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableSummarization"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Summarization</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableSummarization && (
          <FormField
            control={form.control}
            name="summaryPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Summarize the key points from this conversation..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderConversationalRetrieval = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-green-500" />
          Conversational Retrieval QA Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="vectorStore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vector Store *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vector store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pinecone">🌲 Pinecone</SelectItem>
                  <SelectItem value="chroma">🎨 ChromaDB</SelectItem>
                  <SelectItem value="weaviate">🔍 Weaviate</SelectItem>
                  <SelectItem value="faiss">⚡ FAISS</SelectItem>
                  <SelectItem value="elasticsearch">🔎 Elasticsearch</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

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
                  <SelectItem value="openai-ada-002">🤖 OpenAI Ada-002</SelectItem>
                  <SelectItem value="openai-3-small">🤖 OpenAI v3 Small</SelectItem>
                  <SelectItem value="openai-3-large">🤖 OpenAI v3 Large</SelectItem>
                  <SelectItem value="sentence-transformers">🤗 Sentence Transformers</SelectItem>
                  <SelectItem value="cohere">🔮 Cohere</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topK"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top K Results: {field.value || 4}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 4]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={20}
                    min={1}
                    step={1}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="similarityThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Similarity Threshold: {field.value || 0.7}</FormLabel>
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

        <FormField
          control={form.control}
          name="chainType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'stuff'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="stuff">📦 Stuff</SelectItem>
                  <SelectItem value="map-reduce">🗺️ Map-Reduce</SelectItem>
                  <SelectItem value="refine">✨ Refine</SelectItem>
                  <SelectItem value="map-rerank">🏆 Map-Rerank</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Use the following context to answer the question. If you don't know the answer, say so."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="returnSourceDocs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Return Sources</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Memory</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="verbose"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Verbose Logging</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGenericCache = () => (
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
          name="cacheProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cache Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cache provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="redis">🔴 Redis</SelectItem>
                  <SelectItem value="memcached">📦 Memcached</SelectItem>
                  <SelectItem value="memory">💾 In-Memory</SelectItem>
                  <SelectItem value="file">📁 File System</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectionString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String</FormLabel>
              <FormControl>
                <Input placeholder="redis://localhost:6379" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultTTL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default TTL (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3600" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Cache Size (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableCompression"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Compression</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMetrics"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Metrics</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'redis_cache':
      return renderRedisCache();
    case 'conversation_memory':
      return renderConversationMemory();
    case 'conversational_retrieval_qa':
      return renderConversationalRetrieval();
    default:
      return renderGenericCache();
  }
};