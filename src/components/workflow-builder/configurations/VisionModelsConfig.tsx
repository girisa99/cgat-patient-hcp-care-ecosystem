import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Eye, Camera, Image, Scan, Database, Plus, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VisionModelsConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const VisionModelsConfig: React.FC<VisionModelsConfigProps> = ({
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
                <Select onValueChange={field.onChange} defaultValue={field.value || 'image'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="image">🖼️ Image Memory</SelectItem>
                    <SelectItem value="annotation">🏷️ Annotation Memory</SelectItem>
                    <SelectItem value="feature">🔍 Feature Memory</SelectItem>
                    <SelectItem value="vector">📊 Vector Memory</SelectItem>
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
                    placeholder='{"type": "object", "properties": {"objects": {"type": "array"}, "confidence": {"type": "number"}, "labels": {"type": "array"}}}'
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

  const renderImageClassification = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-green-500" />
          Image Classification Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="modelProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vision Model Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai">🤖 OpenAI GPT-4 Vision</SelectItem>
                  <SelectItem value="google">🎨 Google Vision AI</SelectItem>
                  <SelectItem value="aws">☁️ AWS Rekognition</SelectItem>
                  <SelectItem value="azure">🔷 Azure Computer Vision</SelectItem>
                  <SelectItem value="clarifai">👁️ Clarifai</SelectItem>
                  <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.modelProvider === 'custom' && (
          <FormField
            control={form.control}
            name="customModelUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Model URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com/vision" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="classificationMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classification Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'multi-class'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="binary">🔄 Binary Classification</SelectItem>
                  <SelectItem value="multi-class">📋 Multi-Class</SelectItem>
                  <SelectItem value="multi-label">🏷️ Multi-Label</SelectItem>
                  <SelectItem value="hierarchical">🌳 Hierarchical</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Confidence Threshold: {configuration.confidenceThreshold || 0.8}</FormLabel>
          <FormField
            control={form.control}
            name="confidenceThreshold"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value || 0.8]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetClasses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Classes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="person, car, building, animal, food"
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
            name="enablePreprocessing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Image Preprocessing</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAugmentation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Data Augmentation</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableBatching"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Batch Processing</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableBatching && (
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

  const renderObjectDetection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-blue-500" />
          Object Detection Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="detectionModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detection Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yolo">🎯 YOLO v8</SelectItem>
                  <SelectItem value="rcnn">🔍 R-CNN</SelectItem>
                  <SelectItem value="ssd">⚡ SSD MobileNet</SelectItem>
                  <SelectItem value="fasterrcnn">🚀 Faster R-CNN</SelectItem>
                  <SelectItem value="detectron">🤖 Detectron2</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="detectionThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detection Threshold</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="0" max="1" placeholder="0.5" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nmsThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Non-Max Suppression Threshold</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="0" max="1" placeholder="0.4" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxDetections"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Detections</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableTracking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Object Tracking</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAnnotations"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Bounding Box Annotations</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderImageSegmentation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-500" />
          Image Segmentation Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="segmentationModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segmentation Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sam">🎯 Segment Anything Model (SAM)</SelectItem>
                  <SelectItem value="maskrcnn">🎭 Mask R-CNN</SelectItem>
                  <SelectItem value="unet">🔗 U-Net</SelectItem>
                  <SelectItem value="deeplabv3">🧠 DeepLabv3+</SelectItem>
                  <SelectItem value="fcn">📐 FCN</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="segmentationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segmentation Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'semantic'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="semantic">🎨 Semantic Segmentation</SelectItem>
                  <SelectItem value="instance">🎭 Instance Segmentation</SelectItem>
                  <SelectItem value="panoptic">🌟 Panoptic Segmentation</SelectItem>
                  <SelectItem value="interactive">👆 Interactive Segmentation</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outputFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'mask'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mask">🎭 Binary Mask</SelectItem>
                  <SelectItem value="polygon">📐 Polygon Coordinates</SelectItem>
                  <SelectItem value="rle">🔢 Run-Length Encoding</SelectItem>
                  <SelectItem value="contours">📏 Contours</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enablePostProcessing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Post-processing</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableVisualization"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Visualization Overlay</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderImageProcessingPipeline = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-orange-500" />
          Image Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Processing Steps</FormLabel>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => {
              const steps = configuration.processingSteps || [];
              onChange({ 
                ...configuration, 
                processingSteps: [...steps, { type: 'resize', params: {} }] 
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
        
        {(configuration.processingSteps || []).map((step: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Select
                value={step.type || 'resize'}
                onValueChange={(value) => {
                  const steps = [...(configuration.processingSteps || [])];
                  steps[index] = { ...steps[index], type: value };
                  onChange({ ...configuration, processingSteps: steps });
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resize">📏 Resize</SelectItem>
                  <SelectItem value="crop">✂️ Crop</SelectItem>
                  <SelectItem value="rotate">🔄 Rotate</SelectItem>
                  <SelectItem value="blur">🌀 Blur</SelectItem>
                  <SelectItem value="sharpen">⚡ Sharpen</SelectItem>
                  <SelectItem value="normalize">📊 Normalize</SelectItem>
                  <SelectItem value="filter">🎨 Filter</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={JSON.stringify(step.params || {})}
                onChange={(e) => {
                  const steps = [...(configuration.processingSteps || [])];
                  try {
                    steps[index] = { ...steps[index], params: JSON.parse(e.target.value) };
                  } catch {
                    steps[index] = { ...steps[index], params: {} };
                  }
                  onChange({ ...configuration, processingSteps: steps });
                }}
                placeholder='{"width": 224, "height": 224}'
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const steps = [...(configuration.processingSteps || [])];
                  steps.splice(index, 1);
                  onChange({ ...configuration, processingSteps: steps });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'image_classification':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderImageClassification()}
            {renderImageProcessingPipeline()}
          </div>
        );
      case 'object_detection':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderObjectDetection()}
            {renderImageProcessingPipeline()}
          </div>
        );
      case 'image_segmentation':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderImageSegmentation()}
            {renderImageProcessingPipeline()}
          </div>
        );
      case 'ocr_text_extraction':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderImageClassification()}
            {renderImageProcessingPipeline()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderImageClassification()}
            {renderObjectDetection()}
            {renderImageSegmentation()}
            {renderImageProcessingPipeline()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};