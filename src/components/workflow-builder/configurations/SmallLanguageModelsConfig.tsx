import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, Zap, Database, Plus, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SmallLanguageModelsConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const SmallLanguageModelsConfig: React.FC<SmallLanguageModelsConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderCommonConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Flow State & Memory Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableFlowState"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Flow State</FormLabel>
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
        </div>

        {configuration.enableMemory && (
          <FormField
            control={form.control}
            name="memoryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'buffer'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="buffer">💭 Buffer Memory</SelectItem>
                    <SelectItem value="summary">📝 Summary Memory</SelectItem>
                    <SelectItem value="conversation">💬 Conversation Memory</SelectItem>
                    <SelectItem value="entity">👤 Entity Memory</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableJsonOutput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>JSON Structured Output</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addKnowledge"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Add Knowledge Base</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableJsonOutput && (
          <FormField
            control={form.control}
            name="jsonSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JSON Output Schema</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {"response": {"type": "string"}, "confidence": {"type": "number"}, "tokens": {"type": "number"}}}'
                    rows={4}
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

  const renderLocalSLM = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-green-500" />
          Local Small Language Model Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="modelProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ollama">🦙 Ollama</SelectItem>
                  <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
                  <SelectItem value="llamacpp">🦄 Llama.cpp</SelectItem>
                  <SelectItem value="transformers">🤖 Transformers</SelectItem>
                  <SelectItem value="onnx">⚡ ONNX Runtime</SelectItem>
                  <SelectItem value="webllm">🌐 WebLLM</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Deployment</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="phi-3-mini">🧠 Phi-3 Mini (3.8B)</SelectItem>
                  <SelectItem value="llama3.2-3b">🦙 Llama 3.2 (3B)</SelectItem>
                  <SelectItem value="qwen2.5-3b">🐼 Qwen 2.5 (3B)</SelectItem>
                  <SelectItem value="gemma2-2b">💎 Gemma 2 (2B)</SelectItem>
                  <SelectItem value="stablelm-2">🎯 StableLM 2 (1.6B)</SelectItem>
                  <SelectItem value="tinyllama">🦄 TinyLlama (1.1B)</SelectItem>
                  <SelectItem value="distilbert">📚 DistilBERT</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.modelName === 'custom' && (
          <FormField
            control={form.control}
            name="customModelPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Model Path/URL</FormLabel>
                <FormControl>
                  <Input placeholder="./models/custom-model.gguf" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="512" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contextLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context Length</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2048" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Temperature: {configuration.temperature || 0.7}</FormLabel>
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[field.value || 0.7]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Top P: {configuration.topP || 0.9}</FormLabel>
          <FormField
            control={form.control}
            name="topP"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value || 0.9]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableGPUAcceleration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>GPU Acceleration</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableQuantization"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Quantization</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableCaching"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Response Caching</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableQuantization && (
          <FormField
            control={form.control}
            name="quantizationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantization Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'q4_0'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fp16">🎯 FP16 (Half Precision)</SelectItem>
                    <SelectItem value="q8_0">📊 Q8_0 (8-bit)</SelectItem>
                    <SelectItem value="q4_0">⚡ Q4_0 (4-bit)</SelectItem>
                    <SelectItem value="q4_k_m">🚀 Q4_K_M (4-bit Medium)</SelectItem>
                    <SelectItem value="q2_k">💨 Q2_K (2-bit)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderEmbeddingModel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Embedding Model Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="embeddingProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Embedding Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sentence-transformers">🤗 Sentence Transformers</SelectItem>
                  <SelectItem value="bge">🎯 BGE Models</SelectItem>
                  <SelectItem value="e5">⚡ E5 Models</SelectItem>
                  <SelectItem value="gte">🌟 GTE Models</SelectItem>
                  <SelectItem value="ollama-embed">🦙 Ollama Embeddings</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
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
              <FormLabel>Embedding Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all-MiniLM-L6-v2">🚀 all-MiniLM-L6-v2 (384d)</SelectItem>
                  <SelectItem value="all-mpnet-base-v2">🎯 all-mpnet-base-v2 (768d)</SelectItem>
                  <SelectItem value="bge-small-en-v1.5">📚 BGE Small EN v1.5</SelectItem>
                  <SelectItem value="bge-base-en-v1.5">🧠 BGE Base EN v1.5</SelectItem>
                  <SelectItem value="e5-small-v2">⚡ E5 Small v2</SelectItem>
                  <SelectItem value="gte-small">🌟 GTE Small</SelectItem>
                  <SelectItem value="nomic-embed-text">🦙 Nomic Embed Text</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="embeddingDimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Embedding Dimensions</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="384" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSequenceLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Sequence Length</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="512" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="poolingStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pooling Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'mean'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mean">📊 Mean Pooling</SelectItem>
                  <SelectItem value="max">🎯 Max Pooling</SelectItem>
                  <SelectItem value="cls">🏷️ CLS Token</SelectItem>
                  <SelectItem value="weighted">⚖️ Weighted Mean</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableNormalization"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Normalize Embeddings</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableBatchProcessing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Batch Processing</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableBatchProcessing && (
          <FormField
            control={form.control}
            name="batchSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Size</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="32" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderResourceOptimization = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Resource Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="computeTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compute Target</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'auto'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="auto">🤖 Auto Detect</SelectItem>
                  <SelectItem value="cpu">💻 CPU Only</SelectItem>
                  <SelectItem value="gpu">🎮 GPU (CUDA)</SelectItem>
                  <SelectItem value="mps">🍎 Apple Metal (MPS)</SelectItem>
                  <SelectItem value="webgpu">🌐 WebGPU</SelectItem>
                  <SelectItem value="wasm">⚡ WebAssembly</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxMemoryMB"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Memory (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2048" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numThreads"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Threads</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="4" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableModelCompression"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Model Compression</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableDynamicLoading"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Dynamic Loading</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableOffloading"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Layer Offloading</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="optimizationStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optimization Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'balanced'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="speed">⚡ Speed Optimized</SelectItem>
                  <SelectItem value="memory">💾 Memory Optimized</SelectItem>
                  <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                  <SelectItem value="quality">🎯 Quality Optimized</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'local_slm':
      case 'phi3_mini':
      case 'llama3_2_3b':
      case 'qwen2_5_3b':
      case 'gemma2_2b':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderLocalSLM()}
            {renderResourceOptimization()}
          </div>
        );
      case 'embedding_model':
      case 'sentence_transformers':
      case 'bge_models':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderEmbeddingModel()}
            {renderResourceOptimization()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderLocalSLM()}
            {renderEmbeddingModel()}
            {renderResourceOptimization()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};