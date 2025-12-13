/**
 * Dynamic Processing Options Panel - Compact Version
 * Adapts options based on selected document type
 * Shows only relevant processing features for each document category
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ScanLine, 
  Pill,
  Image,
  CreditCard,
  Shield,
  Settings2,
  Zap
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';

interface ProcessingOptionsPanelProps {
  documentConfig: DocumentTypeConfig;
  enableOCR: boolean;
  setEnableOCR: (value: boolean) => void;
  enableHandwriting: boolean;
  setEnableHandwriting: (value: boolean) => void;
  enableTableExtraction: boolean;
  setEnableTableExtraction: (value: boolean) => void;
  enableSignatureDetection: boolean;
  setEnableSignatureDetection: (value: boolean) => void;
  enableAutoCalculateQty: boolean;
  setEnableAutoCalculateQty: (value: boolean) => void;
  enableNdcMatching: boolean;
  setEnableNdcMatching: (value: boolean) => void;
  enableClinicalRecommendations: boolean;
  setEnableClinicalRecommendations: (value: boolean) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  ocrProvider: 'google' | 'azure' | 'aws';
  setOcrProvider: (value: 'google' | 'azure' | 'aws') => void;
}

const needsMedicationFeatures = (docType: string): boolean => {
  return ['prescription', 'order-management'].includes(docType);
};

const needsImagingFeatures = (docType: string): boolean => {
  return ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound'].includes(docType);
};

const needsFinancialFeatures = (docType: string): boolean => {
  return ['invoice', 'receipt'].includes(docType);
};

const needsIdentityFeatures = (docType: string): boolean => {
  return ['passport', 'drivers-license'].includes(docType);
};

export default function ProcessingOptionsPanel({
  documentConfig,
  enableOCR,
  setEnableOCR,
  enableHandwriting,
  setEnableHandwriting,
  enableTableExtraction,
  setEnableTableExtraction,
  enableSignatureDetection,
  setEnableSignatureDetection,
  enableAutoCalculateQty,
  setEnableAutoCalculateQty,
  enableNdcMatching,
  setEnableNdcMatching,
  enableClinicalRecommendations,
  setEnableClinicalRecommendations,
  confidenceThreshold,
  setConfidenceThreshold,
  ocrProvider,
  setOcrProvider,
}: ProcessingOptionsPanelProps) {
  const docType = documentConfig.id;
  const category = documentConfig.category;
  
  const showMedication = needsMedicationFeatures(docType);
  const showImaging = needsImagingFeatures(docType);
  const showFinancial = needsFinancialFeatures(docType);
  const showIdentity = needsIdentityFeatures(docType);

  return (
    <Card className="border border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Processing Options</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              category === 'healthcare' && "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30",
              category === 'medical-imaging' && "border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
              category === 'financial' && "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30",
              category === 'identity' && "border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
              category === 'business' && "border-purple-500/50 text-purple-600 bg-purple-50 dark:bg-purple-950/30",
            )}
          >
            {documentConfig.icon} {documentConfig.title}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-2 space-y-3">
        {/* OCR Provider - Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap w-10">OCR:</Label>
          <Select value={ocrProvider} onValueChange={(v) => setOcrProvider(v as any)}>
            <SelectTrigger className="h-7 text-xs flex-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="google" className="text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">G</div>
                  <span>Google Vision</span>
                </div>
              </SelectItem>
              <SelectItem value="azure" className="text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-sky-500 flex items-center justify-center text-white text-[8px] font-bold">A</div>
                  <span>Azure Form</span>
                </div>
              </SelectItem>
              <SelectItem value="aws" className="text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-500 flex items-center justify-center text-white text-[8px] font-bold">T</div>
                  <span>AWS Textract</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Core Extraction - Compact Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ScanLine className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium">Core Extraction</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <CompactToggle label="OCR" enabled={enableOCR} onToggle={setEnableOCR} />
            <CompactToggle label="Handwriting" enabled={enableHandwriting} onToggle={setEnableHandwriting} />
            <CompactToggle label="Tables" enabled={enableTableExtraction} onToggle={setEnableTableExtraction} />
            <CompactToggle label="Signatures" enabled={enableSignatureDetection} onToggle={setEnableSignatureDetection} />
          </div>
        </div>

        {/* Medication Features - Only for Prescription & Order Management */}
        {showMedication && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Pill className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium">Medication</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-red-100 dark:bg-red-950/30 text-red-600">Rx</Badge>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <CompactToggle label="Auto Qty" enabled={enableAutoCalculateQty} onToggle={setEnableAutoCalculateQty} color="red" />
              <CompactToggle label="NDC Match" enabled={enableNdcMatching} onToggle={setEnableNdcMatching} color="red" />
              <CompactToggle label="Clinical Alerts" enabled={enableClinicalRecommendations} onToggle={setEnableClinicalRecommendations} color="red" className="col-span-2" />
            </div>
          </div>
        )}

        {/* Medical Imaging Features */}
        {showImaging && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Image className="h-3 w-3 text-cyan-500" />
              <span className="text-xs font-medium">Imaging</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600">DICOM</Badge>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <CompactToggle label="DICOM" enabled={true} onToggle={() => {}} color="cyan" locked />
              <CompactToggle label="Enhance" enabled={true} onToggle={() => {}} color="cyan" locked />
            </div>
          </div>
        )}

        {/* Financial Features */}
        {showFinancial && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3 w-3 text-emerald-500" />
              <span className="text-xs font-medium">Financial</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <CompactToggle label="Line Items" enabled={enableTableExtraction} onToggle={setEnableTableExtraction} color="emerald" />
              <CompactToggle label="Currency" enabled={true} onToggle={() => {}} color="emerald" locked />
            </div>
          </div>
        )}

        {/* Identity Features */}
        {showIdentity && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium">Identity</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <CompactToggle label="MRZ Scan" enabled={true} onToggle={() => {}} color="amber" locked />
              <CompactToggle label="Verify" enabled={true} onToggle={() => {}} color="amber" locked />
            </div>
          </div>
        )}

        {/* Confidence Threshold - Compact */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-yellow-500" />
              <Label className="text-xs font-medium">Confidence</Label>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] px-1 py-0">
              {Math.round(confidenceThreshold * 100)}%
            </Badge>
          </div>
          <Slider
            value={[confidenceThreshold * 100]}
            onValueChange={(v) => setConfidenceThreshold(v[0] / 100)}
            min={50}
            max={99}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Compact toggle component
interface CompactToggleProps {
  label: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  color?: string;
  locked?: boolean;
  className?: string;
}

function CompactToggle({ label, enabled, onToggle, color = 'blue', locked, className }: CompactToggleProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between px-2 py-1.5 rounded-md border text-xs",
        enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border/50',
        locked && 'opacity-70',
        className
      )}
    >
      <span className={cn("font-medium", enabled ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
      {locked ? (
        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Auto</Badge>
      ) : (
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="h-4 w-7 data-[state=checked]:bg-primary"
        />
      )}
    </div>
  );
}
