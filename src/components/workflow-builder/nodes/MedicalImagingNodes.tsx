/**
 * MEDICAL IMAGING NODES
 * Dedicated canvas nodes for medical image analysis with AI model selection
 * Supports: X-Ray, CT, MRI, ECG, Ultrasound with modality-specific AI models
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import { 
  Brain, Scan, Activity, Heart, Radio, Waves,
  Copy, Trash2, Settings, Play, Eye, Zap,
  CheckCircle, AlertCircle, Microscope, Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { VisionAIProvider, AIModelType, MedicalModalityType } from '@/services/medicalVisionAIService';

interface MedicalImagingNodeData {
  label?: string;
  intent?: string;
  description?: string;
  type_key?: string;
  modality?: MedicalModalityType;
  provider?: VisionAIProvider;
  modelType?: AIModelType;
  configuration?: {
    analysisType?: 'screening' | 'diagnostic' | 'comprehensive';
    enableSegmentation?: boolean;
    enableMeasurements?: boolean;
    generateReport?: boolean;
    clinicalContext?: string;
  };
  status?: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  metrics?: {
    imagesAnalyzed?: number;
    avgConfidence?: number;
    avgProcessingTime?: number;
  };
}

interface MedicalImagingNodeProps {
  id: string;
  data: MedicalImagingNodeData;
  selected?: boolean;
}

// Base wrapper for medical imaging nodes
const MedicalImagingNodeWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
  color: string;
  selected?: boolean;
  status?: string;
  progress?: number;
}> = ({ id, children, color, selected, status, progress }) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();

  const handleDelete = useCallback(() => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);

  const handleDuplicate = useCallback(() => {
    const node = getNodes().find(n => n.id === id);
    if (node) {
      const newId = `${id}-copy-${Date.now()}`;
      const newNode = {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
      };
      setNodes(nds => [...nds, newNode]);
    }
  }, [id, getNodes, setNodes]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative">
          <NodeResizer
            minWidth={220}
            minHeight={120}
            maxWidth={500}
            maxHeight={450}
            isVisible={selected}
            lineClassName="border-primary/50"
            handleClassName="w-2 h-2 bg-background border border-primary rounded-sm"
          />
          
          {selected && (
            <NodeToolbar isVisible position={Position.Top} className="animate-fade-in">
              <div className="flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 p-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={handleDuplicate}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }));
                }}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={() => {
                  window.dispatchEvent(new CustomEvent('test-node', { detail: { nodeId: id } }));
                }}>
                  <Play className="h-3 w-3" />
                </Button>
                <div className="w-px h-5 bg-border my-auto" />
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </NodeToolbar>
          )}
          
          <div 
            className={cn(
              "rounded-lg border-2 bg-card shadow-lg min-w-[220px] transition-all",
              selected && "ring-2 ring-primary ring-offset-2",
              status === 'processing' && "animate-pulse"
            )}
            style={{ borderColor: color }}
          >
            {children}
            {status === 'processing' && progress !== undefined && (
              <div className="px-3 pb-2">
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }))}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('test-node', { detail: { nodeId: id } }))}>
          <Play className="mr-2 h-4 w-4" />
          Test Node
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Status indicator component
const StatusIndicator: React.FC<{ status?: string }> = ({ status }) => {
  if (!status || status === 'idle') return null;
  
  return (
    <div className="absolute top-2 right-2">
      {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
      {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
      {status === 'processing' && <Zap className="h-4 w-4 text-amber-500 animate-pulse" />}
    </div>
  );
};

// Model type badge component
const ModelTypeBadge: React.FC<{ modelType?: AIModelType }> = ({ modelType }) => {
  const modelLabels: Record<AIModelType, string> = {
    'cnn': 'CNN',
    'u-net': 'U-Net',
    'yolo': 'YOLO',
    'faster-rcnn': 'R-CNN',
    'rnn': 'RNN',
    'llm': 'LLM',
    'auto': 'Auto'
  };
  
  return (
    <Badge variant="secondary" className="text-[10px]">
      {modelLabels[modelType || 'auto']}
    </Badge>
  );
};

// Provider badge component
const ProviderBadge: React.FC<{ provider?: VisionAIProvider }> = ({ provider }) => {
  const providerLabels: Record<VisionAIProvider, string> = {
    'gemini': 'Gemini',
    'aws-rekognition': 'AWS',
    'azure-health': 'Azure',
    'auto': 'Auto'
  };
  
  const providerColors: Record<VisionAIProvider, string> = {
    'gemini': 'border-blue-500 text-blue-500',
    'aws-rekognition': 'border-orange-500 text-orange-500',
    'azure-health': 'border-cyan-500 text-cyan-500',
    'auto': 'border-muted-foreground text-muted-foreground'
  };
  
  return (
    <Badge variant="outline" className={`text-[10px] ${providerColors[provider || 'auto']}`}>
      {providerLabels[provider || 'auto']}
    </Badge>
  );
};

// X-Ray Analysis Node
export const XRayAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#3B82F6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-blue-500/20">
          <Radio className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'X-Ray Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-blue-500 text-blue-500">X-Ray</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Lung nodules, pneumonia, TB, fracture detection'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType} />
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.analysisType || 'screening'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-blue-500/10 rounded px-1 py-0.5">Lung Nodules</div>
        <div className="bg-blue-500/10 rounded px-1 py-0.5">Pneumonia</div>
        <div className="bg-blue-500/10 rounded px-1 py-0.5">TB Screen</div>
        <div className="bg-blue-500/10 rounded px-1 py-0.5">Fractures</div>
      </div>
      {data.metrics && (
        <div className="mt-2 text-[10px] text-muted-foreground grid grid-cols-2 gap-2">
          <span>Analyzed: {data.metrics.imagesAnalyzed || 0}</span>
          <span>Confidence: {(data.metrics.avgConfidence || 0).toFixed(1)}%</span>
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// CT Scan Analysis Node
export const CTScanAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#8B5CF6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-violet-500/20">
          <Scan className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'CT Scan Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-violet-500 text-violet-500">CT</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Brain hemorrhage, lung cancer, tumor segmentation'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType} />
        {data.configuration?.enableSegmentation && (
          <Badge variant="secondary" className="text-[10px]">Segmentation</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Hemorrhage</div>
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Lung Cancer</div>
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Tumors</div>
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Cardiac</div>
      </div>
      {data.metrics && (
        <div className="mt-2 text-[10px] text-muted-foreground grid grid-cols-2 gap-2">
          <span>Analyzed: {data.metrics.imagesAnalyzed || 0}</span>
          <span>Avg Time: {data.metrics.avgProcessingTime || 0}ms</span>
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// MRI Analysis Node
export const MRIAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#EC4899" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-pink-500/20">
          <Brain className="h-4 w-4 text-pink-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'MRI Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-pink-500 text-pink-500">MRI</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Brain tumor segmentation, Alzheimer detection (U-Net)'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType || 'u-net'} />
        {data.configuration?.enableSegmentation && (
          <Badge variant="secondary" className="text-[10px]">U-Net Seg</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-pink-500/10 rounded px-1 py-0.5">Brain Tumor</div>
        <div className="bg-pink-500/10 rounded px-1 py-0.5">Alzheimer</div>
        <div className="bg-pink-500/10 rounded px-1 py-0.5">MS Lesions</div>
        <div className="bg-pink-500/10 rounded px-1 py-0.5">Spine</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// ECG Analysis Node
export const ECGAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#EF4444" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-red-500/20">
          <Activity className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'ECG Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-red-500 text-red-500">ECG</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Arrhythmia, AFib, MI detection (RNN/LSTM)'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType || 'rnn'} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-red-500/10 rounded px-1 py-0.5">Arrhythmia</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">A-Fib</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">MI Detect</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">QT Analysis</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// Ultrasound Analysis Node
export const UltrasoundAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#10B981" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-emerald-500/20">
          <Waves className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Ultrasound Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-emerald-500 text-emerald-500">US</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Fetal, cardiac, liver, thyroid assessment'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-emerald-500/10 rounded px-1 py-0.5">Fetal</div>
        <div className="bg-emerald-500/10 rounded px-1 py-0.5">Cardiac</div>
        <div className="bg-emerald-500/10 rounded px-1 py-0.5">Liver</div>
        <div className="bg-emerald-500/10 rounded px-1 py-0.5">Thyroid</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// Mammogram Analysis Node  
export const MammogramAnalysisNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#F59E0B" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-500/20">
          <Target className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Mammogram Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-amber-500 text-amber-500">Mammo</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Mass detection, microcalcifications (YOLO/R-CNN)'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProviderBadge provider={data.provider} />
        <ModelTypeBadge modelType={data.modelType || 'faster-rcnn'} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-amber-500/10 rounded px-1 py-0.5">Mass</div>
        <div className="bg-amber-500/10 rounded px-1 py-0.5">Calcification</div>
        <div className="bg-amber-500/10 rounded px-1 py-0.5">Density</div>
        <div className="bg-amber-500/10 rounded px-1 py-0.5">BI-RADS</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// Multi-Provider Vision AI Node (Generic)
export const MultiProviderVisionNode = memo(({ id, data, selected }: MedicalImagingNodeProps) => (
  <MedicalImagingNodeWrapper id={id} color="#06B6D4" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-cyan-500/20">
          <Microscope className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Vision AI Hub'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-cyan-500 text-cyan-500">Multi</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Multi-provider medical imaging analysis'}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="secondary" className="text-[10px] border-blue-500">Gemini</Badge>
        <Badge variant="secondary" className="text-[10px] border-orange-500">AWS</Badge>
        <Badge variant="secondary" className="text-[10px] border-cyan-500">Azure</Badge>
      </div>
      <div className="mt-2 text-[9px] text-muted-foreground">
        <div>Models: CNN | U-Net | YOLO | R-CNN | RNN | LLM</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
  </MedicalImagingNodeWrapper>
));

// Export all nodes
XRayAnalysisNode.displayName = 'XRayAnalysisNode';
CTScanAnalysisNode.displayName = 'CTScanAnalysisNode';
MRIAnalysisNode.displayName = 'MRIAnalysisNode';
ECGAnalysisNode.displayName = 'ECGAnalysisNode';
UltrasoundAnalysisNode.displayName = 'UltrasoundAnalysisNode';
MammogramAnalysisNode.displayName = 'MammogramAnalysisNode';
MultiProviderVisionNode.displayName = 'MultiProviderVisionNode';

// Node type mapping for ReactFlow
export const medicalImagingNodeTypes = {
  'xray-analysis': XRayAnalysisNode,
  'ct-scan-analysis': CTScanAnalysisNode,
  'mri-analysis': MRIAnalysisNode,
  'ecg-analysis': ECGAnalysisNode,
  'ultrasound-analysis': UltrasoundAnalysisNode,
  'mammogram-analysis': MammogramAnalysisNode,
  'multi-provider-vision': MultiProviderVisionNode,
};
