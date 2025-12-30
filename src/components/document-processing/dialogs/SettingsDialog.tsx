/**
 * SettingsDialog Component
 * Processing settings for OCR, medication, and validation configuration
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Cpu } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // OCR Settings
  ocrProvider: string;
  setOcrProvider: (provider: string) => void;
  enableOCR: boolean;
  setEnableOCR: (enable: boolean) => void;
  enableHandwriting: boolean;
  setEnableHandwriting: (enable: boolean) => void;
  enableTableExtraction: boolean;
  setEnableTableExtraction: (enable: boolean) => void;
  enableSignatureDetection: boolean;
  setEnableSignatureDetection: (enable: boolean) => void;
  // Medication Settings
  enableAutoCalculateQty: boolean;
  setEnableAutoCalculateQty: (enable: boolean) => void;
  enableNdcMatching: boolean;
  setEnableNdcMatching: (enable: boolean) => void;
  enableClinicalRecommendations: boolean;
  setEnableClinicalRecommendations: (enable: boolean) => void;
  // Validation Settings
  confidenceThreshold: number;
  setConfidenceThreshold: (threshold: number) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  ocrProvider,
  setOcrProvider,
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
  setConfidenceThreshold
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Settings
          </DialogTitle>
          <DialogDescription>
            Configure OCR, medication processing, and validation settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* OCR Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">OCR Engine</h4>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Cpu className="h-3 w-3" />
                OCR Provider
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={ocrProvider === 'google' ? 'default' : 'outline'}
                  className="w-full justify-center"
                  onClick={() => setOcrProvider('google')}
                >
                  Google
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={ocrProvider === 'azure' ? 'default' : 'outline'}
                  className="w-full justify-center"
                  onClick={() => setOcrProvider('azure')}
                >
                  Azure
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={ocrProvider === 'aws' ? 'default' : 'outline'}
                  className="w-full justify-center"
                  onClick={() => setOcrProvider('aws')}
                >
                  AWS
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>OCR Processing</Label>
                  <p className="text-xs text-muted-foreground">Extract text from images and scanned documents</p>
                </div>
                <Switch checked={enableOCR} onCheckedChange={setEnableOCR} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>Handwriting Recognition</Label>
                  <p className="text-xs text-muted-foreground">Recognize handwritten text in documents</p>
                </div>
                <Switch checked={enableHandwriting} onCheckedChange={setEnableHandwriting} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>Table Extraction</Label>
                  <p className="text-xs text-muted-foreground">Detect and extract tabular data</p>
                </div>
                <Switch checked={enableTableExtraction} onCheckedChange={setEnableTableExtraction} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>Signature Detection</Label>
                  <p className="text-xs text-muted-foreground">Identify signature regions in documents</p>
                </div>
                <Switch checked={enableSignatureDetection} onCheckedChange={setEnableSignatureDetection} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Medication Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Medication Processing</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>Auto-Calculate Quantity</Label>
                  <p className="text-xs text-muted-foreground">Calculate qty and days supply from SIG</p>
                </div>
                <Switch checked={enableAutoCalculateQty} onCheckedChange={setEnableAutoCalculateQty} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>NDC Matching</Label>
                  <p className="text-xs text-muted-foreground">Auto-match medications to NDC codes</p>
                </div>
                <Switch checked={enableNdcMatching} onCheckedChange={setEnableNdcMatching} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <Label>Clinical Recommendations</Label>
                  <p className="text-xs text-muted-foreground">Show drug interactions and warnings</p>
                </div>
                <Switch checked={enableClinicalRecommendations} onCheckedChange={setEnableClinicalRecommendations} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Validation Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Validation</h4>
            <div className="space-y-2">
              <div className="p-2 rounded-lg hover:bg-muted/50">
                <Label className="text-sm">Confidence Threshold</Label>
                <p className="text-xs text-muted-foreground mb-2">Minimum confidence for field extraction</p>
                <Select 
                  value={String(confidenceThreshold)} 
                  onValueChange={(v) => setConfidenceThreshold(parseFloat(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">50% - Low (More Fields)</SelectItem>
                    <SelectItem value="0.7">70% - Medium</SelectItem>
                    <SelectItem value="0.85">85% - High (Recommended)</SelectItem>
                    <SelectItem value="0.95">95% - Very High (Fewer Errors)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
