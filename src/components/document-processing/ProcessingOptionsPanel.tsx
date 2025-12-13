/**
 * Dynamic Processing Options Panel
 * Adapts options based on selected document type
 * Shows only relevant processing features for each document category
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ScanLine, 
  FileSignature, 
  Table2, 
  Sparkles,
  Pill,
  Calculator,
  Stethoscope,
  Shield,
  Image,
  CreditCard,
  FileSearch,
  Bot,
  Zap,
  Settings2,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';

interface ProcessingOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  category: 'core' | 'extraction' | 'medical' | 'validation' | 'imaging';
  documentTypes?: string[]; // If empty, applies to all
  excludeTypes?: string[]; // Types to exclude
}

interface ProcessingOptionsPanelProps {
  documentConfig: DocumentTypeConfig;
  // Core OCR options
  enableOCR: boolean;
  setEnableOCR: (value: boolean) => void;
  enableHandwriting: boolean;
  setEnableHandwriting: (value: boolean) => void;
  enableTableExtraction: boolean;
  setEnableTableExtraction: (value: boolean) => void;
  enableSignatureDetection: boolean;
  setEnableSignatureDetection: (value: boolean) => void;
  // Medical/Rx options
  enableAutoCalculateQty: boolean;
  setEnableAutoCalculateQty: (value: boolean) => void;
  enableNdcMatching: boolean;
  setEnableNdcMatching: (value: boolean) => void;
  enableClinicalRecommendations: boolean;
  setEnableClinicalRecommendations: (value: boolean) => void;
  // Settings
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  ocrProvider: 'google' | 'azure' | 'aws';
  setOcrProvider: (value: 'google' | 'azure' | 'aws') => void;
}

// Define which options are available for each document category
const getCategoryFeatures = (category: string): string[] => {
  switch (category) {
    case 'healthcare':
      return ['ocr', 'handwriting', 'table', 'signature', 'autoCalc', 'ndc', 'clinical'];
    case 'medical-imaging':
      return ['ocr', 'table', 'dicom', 'imageEnhance'];
    case 'financial':
      return ['ocr', 'table', 'lineItems', 'currency'];
    case 'identity':
      return ['ocr', 'mrz', 'faceDetect', 'signature'];
    case 'business':
      return ['ocr', 'handwriting', 'table', 'signature'];
    default:
      return ['ocr', 'handwriting', 'table'];
  }
};

// Check if a document type needs medication features
const needsMedicationFeatures = (docType: string): boolean => {
  return ['prescription', 'order-management'].includes(docType);
};

// Check if document type needs imaging features
const needsImagingFeatures = (docType: string): boolean => {
  return ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound'].includes(docType);
};

// Check if document type needs financial features
const needsFinancialFeatures = (docType: string): boolean => {
  return ['invoice', 'receipt'].includes(docType);
};

// Check if document type needs identity features
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
    <Card className="border-2 border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Processing Options</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-lg">{documentConfig.icon}</span>
                <span>Configured for {documentConfig.title}</span>
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium",
              category === 'healthcare' && "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30",
              category === 'medical-imaging' && "border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
              category === 'financial' && "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30",
              category === 'identity' && "border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
              category === 'business' && "border-purple-500/50 text-purple-600 bg-purple-50 dark:bg-purple-950/30",
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* OCR Provider Selection */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-primary" />
            <Label className="font-semibold">OCR Provider</Label>
          </div>
          <Select value={ocrProvider} onValueChange={(v) => setOcrProvider(v as any)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="google">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">G</div>
                  <span>Google Cloud Vision / Document AI</span>
                </div>
              </SelectItem>
              <SelectItem value="azure">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                  <span>Azure Form Recognizer</span>
                </div>
              </SelectItem>
              <SelectItem value="aws">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">T</div>
                  <span>AWS Textract</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Core Extraction Features - Always Shown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Core Extraction</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OptionToggle
              icon={<ScanLine className="h-4 w-4" />}
              label="OCR Text Extraction"
              description="Extract printed text"
              enabled={enableOCR}
              onToggle={setEnableOCR}
              color="blue"
            />
            <OptionToggle
              icon={<FileSignature className="h-4 w-4" />}
              label="Handwriting Recognition"
              description="Recognize handwritten text"
              enabled={enableHandwriting}
              onToggle={setEnableHandwriting}
              color="purple"
            />
            <OptionToggle
              icon={<Table2 className="h-4 w-4" />}
              label="Table Extraction"
              description="Extract tables & line items"
              enabled={enableTableExtraction}
              onToggle={setEnableTableExtraction}
              color="green"
            />
            <OptionToggle
              icon={<FileSignature className="h-4 w-4" />}
              label="Signature Detection"
              description="Detect & verify signatures"
              enabled={enableSignatureDetection}
              onToggle={setEnableSignatureDetection}
              color="amber"
            />
          </div>
        </div>

        {/* Medication Features - Only for Prescription & Order Management */}
        {showMedication && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-sm">Medication Processing</h3>
                <Badge variant="secondary" className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600">Rx</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionToggle
                  icon={<Calculator className="h-4 w-4" />}
                  label="Auto-Calculate Qty"
                  description="Calculate quantity from SIG"
                  enabled={enableAutoCalculateQty}
                  onToggle={setEnableAutoCalculateQty}
                  color="red"
                />
                <OptionToggle
                  icon={<Pill className="h-4 w-4" />}
                  label="NDC Matching"
                  description="Match drugs to NDC codes"
                  enabled={enableNdcMatching}
                  onToggle={setEnableNdcMatching}
                  color="pink"
                />
                <OptionToggle
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Clinical Recommendations"
                  description="Drug interactions & alerts"
                  enabled={enableClinicalRecommendations}
                  onToggle={setEnableClinicalRecommendations}
                  color="rose"
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </>
        )}

        {/* Medical Imaging Features */}
        {showImaging && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-cyan-500" />
                <h3 className="font-semibold text-sm">Medical Imaging</h3>
                <Badge variant="secondary" className="text-[10px] bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600">DICOM</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionToggle
                  icon={<Image className="h-4 w-4" />}
                  label="DICOM Processing"
                  description="Process DICOM images"
                  enabled={true}
                  onToggle={() => {}}
                  color="cyan"
                  locked
                />
                <OptionToggle
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Image Enhancement"
                  description="Enhance image quality"
                  enabled={true}
                  onToggle={() => {}}
                  color="sky"
                  locked
                />
              </div>
            </div>
          </>
        )}

        {/* Financial Features */}
        {showFinancial && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <h3 className="font-semibold text-sm">Financial Processing</h3>
                <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600">Finance</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionToggle
                  icon={<Table2 className="h-4 w-4" />}
                  label="Line Item Extraction"
                  description="Extract invoice line items"
                  enabled={enableTableExtraction}
                  onToggle={setEnableTableExtraction}
                  color="emerald"
                />
                <OptionToggle
                  icon={<Calculator className="h-4 w-4" />}
                  label="Currency Detection"
                  description="Detect & format currencies"
                  enabled={true}
                  onToggle={() => {}}
                  color="green"
                  locked
                />
              </div>
            </div>
          </>
        )}

        {/* Identity Features */}
        {showIdentity && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-sm">Identity Verification</h3>
                <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-950/30 text-amber-600">ID</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionToggle
                  icon={<FileSearch className="h-4 w-4" />}
                  label="MRZ Scanning"
                  description="Machine Readable Zone"
                  enabled={true}
                  onToggle={() => {}}
                  color="amber"
                  locked
                />
                <OptionToggle
                  icon={<Shield className="h-4 w-4" />}
                  label="Document Authenticity"
                  description="Verify document security"
                  enabled={true}
                  onToggle={() => {}}
                  color="orange"
                  locked
                />
              </div>
            </div>
          </>
        )}

        {/* Confidence Threshold */}
        <Separator className="my-4" />
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <Label className="font-semibold">Confidence Threshold</Label>
            </div>
            <Badge variant="outline" className="font-mono">
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
          <p className="text-xs text-muted-foreground">
            Fields below this confidence will be flagged for manual review
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable option toggle component
interface OptionToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  color: string;
  locked?: boolean;
  className?: string;
}

function OptionToggle({ icon, label, description, enabled, onToggle, color, locked, className }: OptionToggleProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 data-[state=checked]:bg-blue-500',
    purple: 'bg-purple-500/10 border-purple-500/30 data-[state=checked]:bg-purple-500',
    green: 'bg-green-500/10 border-green-500/30 data-[state=checked]:bg-green-500',
    amber: 'bg-amber-500/10 border-amber-500/30 data-[state=checked]:bg-amber-500',
    red: 'bg-red-500/10 border-red-500/30 data-[state=checked]:bg-red-500',
    pink: 'bg-pink-500/10 border-pink-500/30 data-[state=checked]:bg-pink-500',
    rose: 'bg-rose-500/10 border-rose-500/30 data-[state=checked]:bg-rose-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 data-[state=checked]:bg-cyan-500',
    sky: 'bg-sky-500/10 border-sky-500/30 data-[state=checked]:bg-sky-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 data-[state=checked]:bg-emerald-500',
    orange: 'bg-orange-500/10 border-orange-500/30 data-[state=checked]:bg-orange-500',
  };

  const iconColorClasses: Record<string, string> = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
    pink: 'text-pink-500',
    rose: 'text-rose-500',
    cyan: 'text-cyan-500',
    sky: 'text-sky-500',
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all",
        enabled ? `${colorClasses[color]?.split(' ')[0]} border-${color}-500/30` : 'bg-muted/20 border-border/50',
        locked && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-1.5 rounded-md",
          enabled ? `bg-${color}-500/20` : 'bg-muted/50'
        )}>
          <span className={cn(enabled ? iconColorClasses[color] : 'text-muted-foreground')}>
            {icon}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{label}</span>
            {locked && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">Auto</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      {!locked && (
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
      )}
      {locked && enabled && (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      )}
    </div>
  );
}
