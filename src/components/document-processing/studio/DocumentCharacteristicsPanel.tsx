/**
 * Document Characteristics Panel
 * Displays auto-detected document properties and processing pipeline info
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  FileImage, 
  Table2, 
  Scan,
  Languages,
  Maximize2,
  PenTool,
  CheckSquare,
  Cpu,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentCharacteristics, ModelRoutingInfo } from './SmartDocumentStudio';

interface DocumentCharacteristicsPanelProps {
  characteristics: DocumentCharacteristics | null;
  modelRouting: ModelRoutingInfo | null;
  isProcessing: boolean;
  compact?: boolean;
}

export function DocumentCharacteristicsPanel({
  characteristics,
  modelRouting,
  isProcessing,
  compact = false
}: DocumentCharacteristicsPanelProps) {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'excel': return <Table2 className="h-4 w-4" />;
      case 'dicom': return <Scan className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getModelBadge = (model: string) => {
    const colors: Record<string, string> = {
      'claude': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
      'gemini': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      'openai': 'bg-green-100 text-green-700 dark:bg-green-900/30',
      'google_vision_ocr': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30',
    };
    return colors[model.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  if (!characteristics && !isProcessing) {
    return null;
  }

  if (compact) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {characteristics && (
              <>
                <Badge variant="outline" className="gap-1">
                  {getFormatIcon(characteristics.format)}
                  {characteristics.format.toUpperCase()}
                </Badge>
                {characteristics.pageCount > 1 && (
                  <Badge variant="outline">{characteristics.pageCount} pages</Badge>
                )}
                <Badge variant="outline" className={getQualityColor(characteristics.quality)}>
                  {characteristics.quality} quality
                </Badge>
                {characteristics.isHandwritten && (
                  <Badge variant="outline" className="gap-1">
                    <PenTool className="h-3 w-3" />
                    Handwritten
                  </Badge>
                )}
                {characteristics.isFilledForm && (
                  <Badge variant="outline" className="gap-1">
                    <CheckSquare className="h-3 w-3" />
                    Filled Form
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Document Analysis
          {isProcessing && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Properties */}
        {characteristics ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {getFormatIcon(characteristics.format)}
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{characteristics.format.toUpperCase()}</span>
              {characteristics.pageCount > 1 && (
                <span className="text-muted-foreground">({characteristics.pageCount} pages)</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              <span className="text-muted-foreground">Quality:</span>
              <Badge variant="outline" className={cn("text-xs", getQualityColor(characteristics.quality))}>
                {characteristics.quality}
                {characteristics.dpi && ` (${characteristics.dpi} DPI)`}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium">{characteristics.detectedLanguage}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Format:</span>
              <div className="flex gap-1">
                {characteristics.isMachineTyped && (
                  <Badge variant="outline" className="text-xs">Typed</Badge>
                )}
                {characteristics.isFilledForm && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <CheckSquare className="h-3 w-3" />
                    Form
                  </Badge>
                )}
                {characteristics.isHandwritten && (
                  <Badge variant="outline" className="text-xs gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30">
                    <PenTool className="h-3 w-3" />
                    Handwritten
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        ) : null}

        <Separator />

        {/* Processing Pipeline */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Processing Pipeline
          </div>
          
          {modelRouting ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge className={cn("gap-1", getModelBadge(modelRouting.stage1Model))}>
                Stage 1: {modelRouting.stage1Model}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className={cn("gap-1", getModelBadge(modelRouting.stage2Model))}>
                Stage 2: {modelRouting.stage2Model}
              </Badge>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Selecting optimal pipeline...</span>
            </div>
          ) : null}

          {modelRouting && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Reason:</span> {modelRouting.selectionReason}
              {modelRouting.processingTimeMs && (
                <span className="ml-2">• {modelRouting.processingTimeMs}ms</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentCharacteristicsPanel;
