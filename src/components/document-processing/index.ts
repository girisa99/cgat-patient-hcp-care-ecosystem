/**
 * Document Processing Components Export
 * Real-time document upload, processing, metadata extraction, and form mapping
 */

export { DocumentUploadProcessor } from './DocumentUploadProcessor';
export { AIModelIndicator } from './AIModelIndicator';
export { TwoStagePipelineDiagram } from './TwoStagePipelineDiagram';
export { TwoStagePipelineSVG } from './TwoStagePipelineSVG';
export { FeaturesOverviewDiagram } from './FeaturesOverviewDiagram';
export { SolutionArchitectureDiagram } from './SolutionArchitectureDiagram';
export { DocumentProcessingArchitectureDiagram } from './DocumentProcessingArchitectureDiagram';
export { MedicalImagingAIPipelineDiagram } from './MedicalImagingAIPipelineDiagram';
export { ContentTypeRoutingDiagram } from './ContentTypeRoutingDiagram';
export { PatientInfoVerificationPanel } from './PatientInfoVerificationPanel';
export { RealTimeExtractionTracker } from './RealTimeExtractionTracker';
export { default as LinkedInArticleDownload } from './LinkedInArticleDownload';
export { default as VideoScriptDownload } from './VideoScriptDownload';
export { VideoScriptDownloader } from './VideoScriptDownloader';
export { ScriptsManager } from './ScriptsManager';
export { VideoRecorder } from './VideoRecorder';
export { TeleprompterPopup } from './TeleprompterPopup';
export { VideoEditor } from './VideoEditor';
export { GenieStudioScriptGallery } from './GenieStudioScriptGallery';
export { GenieStudioVisualAssets } from './GenieStudioVisualAssets';

// New Improvement Components
export { ModelUsageAnalyticsDashboard } from './ModelUsageAnalyticsDashboard';
export { ConfidenceVisualization } from './ConfidenceVisualization';
export { OCRVisionAIComparisonView } from './OCRVisionAIComparisonView';
export { RetryWithDifferentModel } from './RetryWithDifferentModel';
export { ExtractionMetricsSummary } from './ExtractionMetricsSummary';
export { ModelRoutingPanel } from './ModelRoutingPanel';
export type { ModelRoutingInfo as ModelRoutingPanelInfo } from './ModelRoutingPanel';

// Smart Document Studio Components
export * from './studio';

export type { AIProvider, PipelineType, ModelUsageInfo } from './AIModelIndicator';
export { useDocumentProcessing, DOCUMENT_TYPE_FIELDS } from '@/hooks/useDocumentProcessing';
export type { 
  DocumentJob, 
  DocumentType,
  ExtractedMetadata, 
  EntityExtraction, 
  FormFieldExtraction, 
  ProcessingConfig, 
  FormMapping,
  ExtractedTable,
  SignatureDetection,
  DocumentClassification,
  HandwrittenRegion,
  BoundingBox,
  ValidationRule,
  ValidationStatus,
  ValidationError,
  ValidationWarning,
  BatchProcessingResult,
  ExportOptions,
  ExtractionSummary,
  ExtractionStage,
  LiveExtraction,
  ModelRoutingInfo
} from '@/hooks/useDocumentProcessing';
