/**
 * Smart Document Studio - Main Container
 * Unified document processing UI with live extraction, side-by-side editing,
 * confidence-based review gate, and agent findings display
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Bot, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { DocumentUploadZone } from './DocumentUploadZone';
import { DocumentCharacteristicsPanel } from './DocumentCharacteristicsPanel';
import { LiveExtractionPanel } from './LiveExtractionPanel';
import { SideBySideEditor } from './SideBySideEditor';
import { ReviewGateBar } from './ReviewGateBar';
import { AgentFindingsPanel } from './AgentFindingsPanel';
import { AutoConfigPanel } from './AutoConfigPanel';
import { CompactReviewSummary } from './CompactReviewSummary';
import { DocumentTypeConfig } from '@/config/documentTypes';

export interface DocumentCharacteristics {
  format: 'pdf' | 'image' | 'excel' | 'dicom';
  pageCount: number;
  quality: 'low' | 'medium' | 'high';
  dpi?: number;
  isHandwritten: boolean;
  isFilledForm: boolean;
  isMachineTyped: boolean;
  detectedLanguage: string;
  orientation: 'portrait' | 'landscape';
  dimensions?: { width: number; height: number };
}

export interface ExtractedField {
  key: string;
  value: string;
  confidence: number;
  verified: boolean;
  source: 'ocr' | 'vision_ai' | 'nlp';
  originalValue?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface AgentFinding {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedAt: string;
  findings: Record<string, any>;
  confidence: number;
  executionTimeMs: number;
  alerts?: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
  aiPowered?: boolean;
  model?: string;
  provider?: string;
  dataSource?: string;
  summary?: string;
  recommendations?: string[];
}

export interface ModelRoutingInfo {
  stage1Model: string;
  stage2Model: string;
  pipelineType: string;
  selectionReason: string;
  confidence: number;
  processingTimeMs?: number;
}

interface SmartDocumentStudioProps {
  documentConfig: DocumentTypeConfig;
  processingResult: any | null;
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  onFieldUpdate: (key: string, value: string) => void;
  onFieldVerify: (key: string) => void;
  onSave: () => void;
  onRunAgents: (agentIds: string[]) => void;
  extractedFields: Record<string, ExtractedField>;
  documentCharacteristics: DocumentCharacteristics | null;
  modelRouting: ModelRoutingInfo | null;
  agentFindings: AgentFinding[];
  imageUrl?: string;
}

export function SmartDocumentStudio({
  documentConfig,
  processingResult,
  isProcessing,
  onFileUpload,
  onFieldUpdate,
  onFieldVerify,
  onSave,
  onRunAgents,
  extractedFields,
  documentCharacteristics,
  modelRouting,
  agentFindings,
  imageUrl
}: SmartDocumentStudioProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAgentFindings, setShowAgentFindings] = useState(true);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);
  
  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Calculate field statistics
  const fieldStats = React.useMemo(() => {
    const fields = Object.values(extractedFields);
    const total = fields.length;
    const highConfidence = fields.filter(f => f.confidence >= 0.9).length;
    const mediumConfidence = fields.filter(f => f.confidence >= 0.7 && f.confidence < 0.9).length;
    const lowConfidence = fields.filter(f => f.confidence < 0.7).length;
    const verified = fields.filter(f => f.verified).length;
    const needsReview = fields.filter(f => f.confidence < 0.7 && !f.verified).length;

    return { total, highConfidence, mediumConfidence, lowConfidence, verified, needsReview };
  }, [extractedFields]);

  // Check if save is allowed (all low-confidence fields must be verified)
  const canSave = fieldStats.needsReview === 0;

  const handleFieldClick = useCallback((key: string) => {
    setActiveFieldKey(key);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header with Auto-Configuration */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Smart Document Studio</h2>
            <p className="text-sm text-muted-foreground">
              Processing: {documentConfig.title}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Advanced
          {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Auto-Configuration Panel (collapsible) */}
      <Collapsible open={showAdvancedSettings}>
        <CollapsibleContent>
          <AutoConfigPanel
            documentConfig={documentConfig}
            modelRouting={modelRouting}
            documentCharacteristics={documentCharacteristics}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Upload Zone (when no document) */}
      {!processingResult && !isProcessing && (
        <DocumentUploadZone
          documentConfig={documentConfig}
          onFileUpload={onFileUpload}
          isProcessing={isProcessing}
        />
      )}

      {/* Document Characteristics + Live Extraction (during processing) */}
      {isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DocumentCharacteristicsPanel
            characteristics={documentCharacteristics}
            modelRouting={modelRouting}
            isProcessing={isProcessing}
          />
          <LiveExtractionPanel
            extractedFields={extractedFields}
            isProcessing={isProcessing}
            modelRouting={modelRouting}
          />
        </div>
      )}

      {/* Side-by-Side Editor (after processing) */}
      {processingResult && !isProcessing && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Left: Document Preview + Characteristics */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Document Preview */}
              <Card className="flex-1 overflow-hidden">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Document Preview
                    </CardTitle>
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground w-12 text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        title="Zoom In"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleZoomReset}
                        disabled={zoomLevel === 1}
                        title="Reset Zoom"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {imageUrl ? (
                    <div className="relative rounded-lg overflow-auto bg-muted aspect-[3/4] flex items-center justify-center">
                      <div 
                        className="transition-transform duration-200 origin-center w-full h-full flex items-center justify-center"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        <img
                          src={imageUrl}
                          alt="Document preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            // Handle broken image gracefully
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.insertAdjacentHTML(
                              'beforeend',
                              '<div class="flex flex-col items-center justify-center gap-2 text-muted-foreground"><svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><span class="text-xs">Preview unavailable</span></div>'
                            );
                          }}
                        />
                        {/* Bounding box overlay for active field */}
                        {activeFieldKey && extractedFields[activeFieldKey]?.boundingBox && (
                          <div
                            className="absolute border-2 border-primary bg-primary/10 transition-all"
                            style={{
                              left: `${extractedFields[activeFieldKey].boundingBox!.x}%`,
                              top: `${extractedFields[activeFieldKey].boundingBox!.y}%`,
                              width: `${extractedFields[activeFieldKey].boundingBox!.width}%`,
                              height: `${extractedFields[activeFieldKey].boundingBox!.height}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Characteristics (compact) */}
              <DocumentCharacteristicsPanel
                characteristics={documentCharacteristics}
                modelRouting={modelRouting}
                isProcessing={false}
                compact
              />
            </div>

            {/* Right: Side-by-Side Editor */}
            <div className="lg:col-span-2">
              <SideBySideEditor
                extractedFields={extractedFields}
                onFieldUpdate={onFieldUpdate}
                onFieldVerify={onFieldVerify}
                onFieldClick={handleFieldClick}
                activeFieldKey={activeFieldKey}
                fieldStats={fieldStats}
              />
            </div>
          </div>

          {/* Compact Review Summary */}
          <CompactReviewSummary
            extractedFields={extractedFields}
            fieldStats={fieldStats}
            onFieldClick={handleFieldClick}
          />

          {/* Agent Findings Panel (collapsible) */}
          {agentFindings.length > 0 && (
            <Collapsible open={showAgentFindings} onOpenChange={setShowAgentFindings}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span>Agent Findings ({agentFindings.length})</span>
                  </div>
                  {showAgentFindings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AgentFindingsPanel
                  findings={agentFindings}
                  onRerunAgent={(agentId) => onRunAgents([agentId])}
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Review Gate Bar (always visible when editing) */}
          <ReviewGateBar
            fieldStats={fieldStats}
            canSave={canSave}
            onSave={onSave}
            extractedFields={extractedFields}
          />
        </>
      )}
    </div>
  );
}

export default SmartDocumentStudio;
