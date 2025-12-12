/**
 * DOCUMENT PROCESSING NODES
 * Comprehensive document AI capabilities including OCR, DocAI, metadata extraction,
 * form recognition, and intelligent document understanding
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import { 
  FileText, Scan, FileSearch, Image, FileOutput, Database,
  Copy, Trash2, Settings, Play, Eye, Layers, FileCheck,
  FileSpreadsheet, FileArchive, Zap, CheckCircle, AlertCircle
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

interface DocumentNodeData {
  label?: string;
  intent?: string;
  description?: string;
  type_key?: string;
  configuration?: Record<string, any>;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  metrics?: {
    documentsProcessed?: number;
    accuracy?: number;
    avgProcessingTime?: number;
  };
}

interface DocumentNodeProps {
  id: string;
  data: DocumentNodeData;
  selected?: boolean;
}

// Base wrapper for document nodes with resize and context menu support
const DocumentNodeWrapper: React.FC<{
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
            minWidth={200}
            minHeight={100}
            maxWidth={450}
            maxHeight={400}
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
              "rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
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

// OCR Document Parser Node
export const OCRDocumentNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#3B82F6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-blue-500/20">
          <Scan className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'OCR Parser'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-blue-500 text-blue-500">OCR</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Extract text from images and scanned documents'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.ocr_engine || 'Tesseract'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.languages?.join(', ') || 'en'}
        </Badge>
        {data.configuration?.deskew_enabled && (
          <Badge variant="secondary" className="text-[10px]">Deskew</Badge>
        )}
      </div>
      {data.metrics && (
        <div className="mt-2 text-[10px] text-muted-foreground grid grid-cols-2 gap-2">
          <span>Accuracy: {(data.metrics.accuracy || 0).toFixed(1)}%</span>
          <span>Processed: {data.metrics.documentsProcessed || 0}</span>
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Document AI / Intelligent Document Processing Node
export const DocAINode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#8B5CF6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-violet-500/20">
          <FileSearch className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Document AI'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-violet-500 text-violet-500">DocAI</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Intelligent document understanding and entity extraction'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.provider || 'Google DocAI'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.processor_type || 'General'}
        </Badge>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] text-center">
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Parse</div>
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Extract</div>
        <div className="bg-violet-500/10 rounded px-1 py-0.5">Classify</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Metadata Extraction Node
export const MetadataExtractionNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#10B981" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-emerald-500/20">
          <Layers className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Metadata Extractor'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-emerald-500 text-emerald-500">Meta</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Extract document metadata, properties, and attributes'}
      </p>
      <div className="flex flex-wrap gap-1">
        {(data.configuration?.extract_fields || ['Title', 'Author', 'Date']).slice(0, 4).map((field: string) => (
          <Badge key={field} variant="secondary" className="text-[10px]">{field}</Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Form Recognition Node
export const FormRecognitionNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#F59E0B" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-500/20">
          <FileSpreadsheet className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Form Recognition'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-amber-500 text-amber-500">Forms</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Recognize and extract form fields, tables, and key-value pairs'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.form_type || 'Auto-detect'}
        </Badge>
        {data.configuration?.table_extraction && (
          <Badge variant="secondary" className="text-[10px]">Tables</Badge>
        )}
        {data.configuration?.signature_detection && (
          <Badge variant="secondary" className="text-[10px]">Signatures</Badge>
        )}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Image Analysis Node
export const ImageAnalysisNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#EC4899" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-pink-500/20">
          <Image className="h-4 w-4 text-pink-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Image Analysis'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-pink-500 text-pink-500">Vision</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Analyze images for objects, text, faces, and quality'}
      </p>
      <div className="flex flex-wrap gap-1">
        {data.configuration?.detect_objects && (
          <Badge variant="secondary" className="text-[10px]">Objects</Badge>
        )}
        {data.configuration?.detect_text && (
          <Badge variant="secondary" className="text-[10px]">Text</Badge>
        )}
        {data.configuration?.detect_faces && (
          <Badge variant="secondary" className="text-[10px]">Faces</Badge>
        )}
        {data.configuration?.quality_check && (
          <Badge variant="secondary" className="text-[10px]">Quality</Badge>
        )}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Document Validation Node
export const DocumentValidationNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#06B6D4" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-cyan-500/20">
          <FileCheck className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Document Validator'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-cyan-500 text-cyan-500">Validate</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Validate document completeness, authenticity, and compliance'}
      </p>
      <div className="flex flex-wrap gap-1">
        {data.configuration?.check_completeness && (
          <Badge variant="secondary" className="text-[10px]">Complete</Badge>
        )}
        {data.configuration?.verify_signatures && (
          <Badge variant="secondary" className="text-[10px]">Signatures</Badge>
        )}
        {data.configuration?.compliance_check && (
          <Badge variant="secondary" className="text-[10px]">Compliance</Badge>
        )}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3" id="valid" />
    <Handle type="source" position={Position.Left} className="!bg-red-500 !w-3 !h-3" id="invalid" />
  </DocumentNodeWrapper>
));

// Data Extraction & Transform Node
export const DataExtractionNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#EF4444" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-red-500/20">
          <FileOutput className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Data Extractor'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-red-500 text-red-500">Extract</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Extract and transform structured data from documents'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          Output: {data.configuration?.output_format || 'JSON'}
        </Badge>
        {data.configuration?.schema_validation && (
          <Badge variant="secondary" className="text-[10px]">Schema</Badge>
        )}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Document Comparison Node
export const DocumentComparisonNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#14B8A6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-teal-500 !w-3 !h-3" id="doc2" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-teal-500/20">
          <Eye className="h-4 w-4 text-teal-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Document Compare'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-teal-500 text-teal-500">Compare</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Compare documents for differences and matching content'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.comparison_mode || 'semantic'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          Threshold: {((data.configuration?.similarity_threshold || 0.85) * 100).toFixed(0)}%
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-teal-500 !w-3 !h-3" id="diff" />
  </DocumentNodeWrapper>
));

// Document Archive Node
export const DocumentArchiveNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#A855F7" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-purple-500/20">
          <FileArchive className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Document Archive'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-purple-500 text-purple-500">Archive</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Archive documents with retention policies and indexing'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.storage_class || 'Standard'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          Retention: {data.configuration?.retention_days || 365}d
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Database Push Node
export const DocumentToDatabaseNode = memo(({ id, data, selected }: DocumentNodeProps) => (
  <DocumentNodeWrapper id={id} color="#F97316" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusIndicator status={data.status} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-orange-500/20">
          <Database className="h-4 w-4 text-orange-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Push to Database'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-orange-500 text-orange-500">DB</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Push extracted document data to database tables'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.target_table || 'Auto'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.upsert_mode ? 'Upsert' : 'Insert'}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3" />
  </DocumentNodeWrapper>
));

// Export node type mapping
export const DOCUMENT_PROCESSING_NODE_TYPES = {
  ocr_document: OCRDocumentNode,
  doc_ai: DocAINode,
  metadata_extraction: MetadataExtractionNode,
  form_recognition: FormRecognitionNode,
  image_analysis: ImageAnalysisNode,
  document_validation: DocumentValidationNode,
  data_extraction: DataExtractionNode,
  document_comparison: DocumentComparisonNode,
  document_archive: DocumentArchiveNode,
  document_to_database: DocumentToDatabaseNode,
};

// Add display names
OCRDocumentNode.displayName = 'OCRDocumentNode';
DocAINode.displayName = 'DocAINode';
MetadataExtractionNode.displayName = 'MetadataExtractionNode';
FormRecognitionNode.displayName = 'FormRecognitionNode';
ImageAnalysisNode.displayName = 'ImageAnalysisNode';
DocumentValidationNode.displayName = 'DocumentValidationNode';
DataExtractionNode.displayName = 'DataExtractionNode';
DocumentComparisonNode.displayName = 'DocumentComparisonNode';
DocumentArchiveNode.displayName = 'DocumentArchiveNode';
DocumentToDatabaseNode.displayName = 'DocumentToDatabaseNode';
