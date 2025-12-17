/**
 * AI Processing Pipeline Visualization
 * Beautiful, animated pipeline showing document processing stages
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  ScanLine, 
  Brain, 
  FileType, 
  Layers, 
  Bot,
  ArrowRight,
  Zap,
  CheckCircle,
  Settings
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';

interface AIProcessingPipelineProps {
  documentConfig: DocumentTypeConfig;
  enableOCR: boolean;
  enableTableExtraction: boolean;
  processingMode: 'standalone' | 'agent';
  setProcessingMode: (mode: 'standalone' | 'agent') => void;
  isAutoProcessing: boolean;
  setIsAutoProcessing: (value: boolean) => void;
  onOpenSettings: () => void;
  currentStage?: string;
}

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isActive: boolean;
  isOptional?: boolean;
}

export default function AIProcessingPipeline({
  documentConfig,
  enableOCR,
  enableTableExtraction,
  processingMode,
  setProcessingMode,
  isAutoProcessing,
  setIsAutoProcessing,
  onOpenSettings,
  currentStage
}: AIProcessingPipelineProps) {
  
  // Dynamic stages based on document type
  const getStages = (): PipelineStage[] => {
    const baseStages: PipelineStage[] = [
      {
        id: 'ocr',
        label: 'OCR',
        icon: <ScanLine className="h-5 w-5" />,
        color: 'blue',
        description: 'Text extraction',
        isActive: enableOCR,
      },
      {
        id: 'docai',
        label: 'DocAI',
        icon: <Brain className="h-5 w-5" />,
        color: 'purple',
        description: 'Entity extraction',
        isActive: true,
      },
      {
        id: 'forms',
        label: 'Forms',
        icon: <FileType className="h-5 w-5" />,
        color: 'green',
        description: 'Form recognition',
        isActive: enableTableExtraction,
      },
      {
        id: 'mapping',
        label: 'Mapping',
        icon: <Layers className="h-5 w-5" />,
        color: 'orange',
        description: 'Field mapping',
        isActive: true,
      },
    ];

    // Add document-type specific stages
    if (documentConfig.processingHints?.enableMedicationLookup) {
      baseStages.push({
        id: 'medication',
        label: 'NDC Lookup',
        icon: <span className="text-lg">💊</span>,
        color: 'red',
        description: 'Drug database',
        isActive: true,
      });
    }

    if (documentConfig.processingHints?.enableDicomViewer) {
      baseStages.push({
        id: 'dicom',
        label: 'DICOM',
        icon: <span className="text-lg">🩻</span>,
        color: 'cyan',
        description: 'Imaging analysis',
        isActive: true,
      });
    }

    // Add Code Intelligence stage for invoice/billing documents
    // Supports Revenue Codes (UB-04), CPT, HCPCS, ICD-10, NDC
    if (documentConfig.category === 'financial' || 
        documentConfig.id === 'invoice' || 
        documentConfig.id === 'billing') {
      baseStages.push({
        id: 'code-intelligence',
        label: 'Code Intel',
        icon: <span className="text-lg">🏥</span>,
        color: 'teal',
        description: 'Revenue/CPT/ICD',
        isActive: true,
      });
    }

    // Agent is always last and optional
    baseStages.push({
      id: 'agent',
      label: 'Agent',
      icon: <Bot className="h-5 w-5" />,
      color: 'primary',
      description: 'AI verification',
      isActive: processingMode === 'agent',
      isOptional: true,
    });

    return baseStages;
  };

  const stages = getStages();

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/15', border: 'border-blue-500', text: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/15', border: 'border-purple-500', text: 'text-purple-500' },
    green: { bg: 'bg-green-500/15', border: 'border-green-500', text: 'text-green-500' },
    orange: { bg: 'bg-orange-500/15', border: 'border-orange-500', text: 'text-orange-500' },
    red: { bg: 'bg-red-500/15', border: 'border-red-500', text: 'text-red-500' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500', text: 'text-cyan-500' },
    teal: { bg: 'bg-teal-500/15', border: 'border-teal-500', text: 'text-teal-500' },
    primary: { bg: 'bg-primary/15', border: 'border-primary', text: 'text-primary' },
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-lg overflow-hidden">
      {/* Header with controls */}
      <CardHeader className="pb-2 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 shadow-lg shadow-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                AI Processing Pipeline
                <Badge variant="outline" className="text-[10px] font-normal">
                  {stages.filter(s => s.isActive && !s.isOptional).length} Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                DocAI • OCR • Form Recognition • NLP
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-Process Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <Zap className={cn("h-4 w-4", isAutoProcessing ? "text-yellow-500" : "text-muted-foreground")} />
              <Label htmlFor="auto-process-pipeline" className="text-xs font-medium cursor-pointer">
                Auto-Process
              </Label>
              <Switch 
                id="auto-process-pipeline" 
                checked={isAutoProcessing}
                onCheckedChange={setIsAutoProcessing}
                className="scale-90"
              />
            </div>

            {/* Settings Button */}
            <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configure</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        {/* Pipeline Visualization */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div 
                className={cn(
                  "flex flex-col items-center gap-2 flex-shrink-0 min-w-[80px] transition-all duration-300",
                  !stage.isActive && "opacity-40"
                )}
              >
                {/* Stage Icon */}
                <div 
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all duration-300",
                    stage.isActive 
                      ? `${colorMap[stage.color].bg} ${colorMap[stage.color].border}` 
                      : "bg-muted/30 border-dashed border-muted-foreground/30",
                    currentStage === stage.id && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse",
                    stage.isOptional && !stage.isActive && "border-dashed"
                  )}
                >
                  <span className={cn(
                    stage.isActive ? colorMap[stage.color].text : "text-muted-foreground"
                  )}>
                    {stage.icon}
                  </span>
                  
                  {/* Status indicator */}
                  {stage.isActive && !stage.isOptional && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>

                {/* Stage Label */}
                <div className="text-center">
                  <span className={cn(
                    "text-xs font-medium block",
                    stage.isActive ? "" : "text-muted-foreground"
                  )}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {stage.description}
                  </span>
                </div>

                {/* Active/Optional Badge */}
                <Badge 
                  variant={stage.isActive ? "default" : "outline"} 
                  className={cn(
                    "text-[9px] px-1.5 py-0",
                    stage.isActive && stage.color !== 'primary' && `${colorMap[stage.color].bg} ${colorMap[stage.color].text} border-0`,
                    stage.isOptional && !stage.isActive && "border-dashed"
                  )}
                >
                  {stage.isOptional 
                    ? (stage.isActive ? 'Enabled' : 'Optional') 
                    : (stage.isActive ? 'Active' : 'Off')
                  }
                </Badge>
              </div>

              {/* Arrow between stages */}
              {index < stages.length - 1 && (
                <ArrowRight className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  stage.isActive ? "text-muted-foreground" : "text-muted-foreground/30"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Processing Mode Toggle */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-6 p-3 rounded-lg bg-muted/30">
            <button
              onClick={() => setProcessingMode('standalone')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                processingMode === 'standalone' 
                  ? "bg-background border border-border shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileType className="h-4 w-4" />
              <span className="text-sm font-medium">Standalone</span>
              {processingMode === 'standalone' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </button>
            
            <div className="w-px h-6 bg-border" />
            
            <button
              onClick={() => setProcessingMode('agent')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                processingMode === 'agent' 
                  ? "bg-primary/10 border border-primary/30 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">With Agent</span>
              {processingMode === 'agent' && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
