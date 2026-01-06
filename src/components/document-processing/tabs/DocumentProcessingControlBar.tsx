/**
 * Document Processing Control Bar Component
 * Compact control bar with document type dropdown, agent button, and processing mode toggle
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Brain, 
  CheckCircle, 
  Eye, 
  Table2, 
  ClipboardList, 
  Shield, 
  Cpu, 
  Zap, 
  Bot, 
  Settings, 
  Plus,
  FilePlus2
} from 'lucide-react';
import { DocumentTypeConfig, getAllCategories, getCategoryIcon, getCategoryLabel, getDocumentTypesByCategory } from '@/config/documentTypes';

type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'extraction' | 'mapping' | 'validation' | 'complete' | 'error';
type ProcessingMode = 'standalone' | 'agent';

interface DocumentProcessingControlBarProps {
  selectedDocType: string;
  setSelectedDocType: (value: string) => void;
  currentConfig: DocumentTypeConfig;
  customDocTypes: DocumentTypeConfig[];
  processingResult: { stage: ProcessingStage } | null;
  processingMode: ProcessingMode;
  setProcessingMode: (mode: ProcessingMode) => void;
  onOpenSubAgentDialog: () => void;
  onOpenSettingsDialog: () => void;
  onOpenCustomTypeDialog: () => void;
  onNewDocument?: () => void;
}

export function DocumentProcessingControlBar({
  selectedDocType,
  setSelectedDocType,
  currentConfig,
  customDocTypes,
  processingResult,
  processingMode,
  setProcessingMode,
  onOpenSubAgentDialog,
  onOpenSettingsDialog,
  onOpenCustomTypeDialog,
  onNewDocument
}: DocumentProcessingControlBarProps) {
  return (
    <Card className="bg-gradient-to-r from-muted/30 via-background to-muted/30">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Document Type Dropdown */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium whitespace-nowrap">Document Type</Label>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="w-[220px] bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{currentConfig.icon}</span>
                    <span>{currentConfig.title}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-background border shadow-lg z-50">
                {getAllCategories().map(category => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-2 sticky top-0">
                      <span>{getCategoryIcon(category)}</span>
                      {getCategoryLabel(category)}
                    </div>
                    {getDocumentTypesByCategory(category).map(config => (
                      <SelectItem key={config.id} value={config.id}>
                        <div className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          <span>{config.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
                {/* Custom document types */}
                {customDocTypes.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-2 sticky top-0">
                      <span>✨</span>
                      Custom Types
                    </div>
                    {customDocTypes.map(config => (
                      <SelectItem key={config.id} value={config.id}>
                        <div className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          <span>{config.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                )}
                {/* Add New Type Option */}
                <div 
                  className="px-2 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2 text-primary"
                  onClick={(e) => { e.stopPropagation(); onOpenCustomTypeDialog(); }}
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Type...
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Recommendation Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenSubAgentDialog}
            className="h-8"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Agent
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Compact AI Pipeline Status */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              processingResult?.stage === 'complete' ? 'bg-green-500/10 text-green-600' :
              processingResult?.stage && processingResult.stage !== 'idle' ? 'bg-primary/10 text-primary animate-pulse' :
              'bg-muted text-muted-foreground'
            }`}>
              {processingResult?.stage === 'complete' ? (
                <><CheckCircle className="h-3.5 w-3.5" /> Complete</>
              ) : processingResult?.stage === 'ocr' ? (
                <><Eye className="h-3.5 w-3.5 animate-pulse" /> OCR</>
              ) : processingResult?.stage === 'extraction' ? (
                <><Table2 className="h-3.5 w-3.5 animate-pulse" /> Extracting</>
              ) : processingResult?.stage === 'mapping' ? (
                <><ClipboardList className="h-3.5 w-3.5 animate-pulse" /> Mapping</>
              ) : processingResult?.stage === 'validation' ? (
                <><Shield className="h-3.5 w-3.5 animate-pulse" /> Validating</>
              ) : (
                <><Cpu className="h-3.5 w-3.5" /> Ready</>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Processing Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
            <Button 
              size="sm" 
              variant={processingMode === 'standalone' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs rounded-full"
              onClick={() => setProcessingMode('standalone')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Standalone
            </Button>
            <Button 
              size="sm" 
              variant={processingMode === 'agent' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs rounded-full"
              onClick={() => setProcessingMode('agent')}
            >
              <Bot className="h-3 w-3 mr-1" />
              Agent
            </Button>
          </div>

          <div className="flex-1" />

          {/* New Document Button */}
          {onNewDocument && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNewDocument}
              className="h-8 text-primary hover:text-primary"
            >
              <FilePlus2 className="h-4 w-4 mr-2" />
              New Document
            </Button>
          )}

          {/* Settings Button */}
          <Button variant="outline" size="sm" onClick={onOpenSettingsDialog} className="h-8">
            <Settings className="h-4 w-4 mr-2" />
            Options
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentProcessingControlBar;
