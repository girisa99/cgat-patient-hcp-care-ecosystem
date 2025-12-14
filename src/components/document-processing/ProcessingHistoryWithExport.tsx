/**
 * Processing History Panel with MCP SDK Export
 * Displays processing history with ability to export to external tools via MCP
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, 
  FileText, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Database,
  Cloud,
  Zap,
  Send,
  Loader2,
  FileJson,
  FileSpreadsheet,
  ExternalLink,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: string;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: any[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  error?: string;
  processedAt: Date;
  imageUrl?: string;
}

interface ProcessingHistoryWithExportProps {
  history: ProcessingResult[];
  onViewResult?: (result: ProcessingResult) => void;
}

interface MCPExportTarget {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiresConfig?: boolean;
}

const MCP_EXPORT_TARGETS: MCPExportTarget[] = [
  { id: 'supabase', name: 'Supabase', icon: <Database className="h-4 w-4" />, description: 'Save to database table' },
  { id: 'salesforce', name: 'Salesforce', icon: <Cloud className="h-4 w-4 text-blue-500" />, description: 'Push to Salesforce CRM' },
  { id: 'hubspot', name: 'HubSpot', icon: <span className="text-orange-500 text-sm font-bold">H</span>, description: 'Sync to HubSpot' },
  { id: 'veeva', name: 'Veeva CRM', icon: <span className="text-green-500 text-sm font-bold">V</span>, description: 'Healthcare CRM sync' },
  { id: 'webhook', name: 'Webhook', icon: <Webhook className="h-4 w-4" />, description: 'POST to custom endpoint' },
  { id: 'api', name: 'External API', icon: <ExternalLink className="h-4 w-4" />, description: 'Call external REST API' },
];

export default function ProcessingHistoryWithExport({
  history,
  onViewResult,
}: ProcessingHistoryWithExportProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedTarget, setSelectedTarget] = useState<string>('supabase');
  const [isExporting, setIsExporting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === history.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(history.map(h => h.id));
    }
  };

  const getValidationBadge = (result: ProcessingResult) => {
    if (!result.validationResults) return null;
    const { passed, failed, warnings } = result.validationResults;
    if (failed > 0) return <Badge variant="destructive" className="text-xs">Failed</Badge>;
    if (warnings > 0) return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600">Warnings</Badge>;
    return <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">Passed</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to export');
      return;
    }

    setIsExporting(true);
    const selectedData = history.filter(h => selectedItems.includes(h.id));

    try {
      // Format data based on export format
      const exportData = selectedData.map(item => ({
        id: item.id,
        fileName: item.fileName,
        documentType: item.documentType,
        processedAt: item.processedAt,
        extractedFields: Object.fromEntries(
          Object.entries(item.extractedFields).map(([key, val]) => [key, val.value])
        ),
        medications: item.medications,
        validationStatus: item.validationResults ? 
          (item.validationResults.failed > 0 ? 'failed' : 
           item.validationResults.warnings > 0 ? 'warnings' : 'passed') : 'unknown'
      }));

      // Handle different export targets
      switch (selectedTarget) {
        case 'supabase':
          // Save to Supabase via edge function (since table may not exist)
          await supabase.functions.invoke('mcp-data-sync', {
            body: {
              target: 'supabase',
              table: 'document_exports',
              data: exportData,
              format: exportFormat
            }
          });
          toast.success(`Exported ${selectedData.length} records to Supabase`);
          break;

        case 'webhook':
        case 'api':
          // Call external endpoint
          if (!webhookUrl) {
            toast.error('Please provide a webhook/API URL');
            setIsExporting(false);
            return;
          }
          
          await supabase.functions.invoke('mcp-data-sync', {
            body: {
              target: selectedTarget,
              endpoint: webhookUrl,
              data: exportData,
              format: exportFormat
            }
          });
          toast.success(`Sent ${selectedData.length} records to ${selectedTarget}`);
          break;

        case 'salesforce':
        case 'hubspot':
        case 'veeva':
          // CRM sync via MCP
          await supabase.functions.invoke('mcp-data-sync', {
            body: {
              target: selectedTarget,
              data: exportData,
              format: exportFormat,
              syncType: 'create_or_update'
            }
          });
          toast.success(`Synced ${selectedData.length} records to ${selectedTarget}`);
          break;

        default:
          // Download as file
          const blob = exportFormat === 'json'
            ? new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            : new Blob([convertToCSV(exportData)], { type: 'text/csv' });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `export_${new Date().toISOString().slice(0,10)}.${exportFormat}`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`Downloaded ${selectedData.length} records`);
      }

      setShowExportDialog(false);
      setSelectedItems([]);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(h => {
        const val = item[h];
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val || '');
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.length === history.length && history.length > 0}
            onCheckedChange={selectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select items'}
          </span>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowExportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Export via MCP
            </Button>
          )}
        </div>
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No processing history yet</p>
              <p className="text-sm">Upload documents to see them here</p>
            </div>
          ) : (
            history.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                  selectedItems.includes(result.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={selectedItems.includes(result.id)}
                  onCheckedChange={() => toggleSelect(result.id)}
                />
                
                {/* Thumbnail */}
                {result.imageUrl ? (
                  <div className="w-12 h-12 rounded border overflow-hidden shrink-0">
                    <img 
                      src={result.imageUrl} 
                      alt={result.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{result.fileName}</span>
                    {getValidationBadge(result)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{result.documentType}</span>
                    <span>•</span>
                    <span>{Object.keys(result.extractedFields).length} fields</span>
                    <span>•</span>
                    <span>{formatDate(result.processedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewResult(result)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Export via MCP SDK
            </DialogTitle>
            <DialogDescription>
              Export {selectedItems.length} selected records to external systems
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="flex gap-2">
                <Button
                  variant={exportFormat === 'json' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('json')}
                  className="flex-1"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant={exportFormat === 'csv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('csv')}
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="grid grid-cols-2 gap-2">
                {MCP_EXPORT_TARGETS.map(target => (
                  <div
                    key={target.id}
                    onClick={() => setSelectedTarget(target.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTarget === target.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {target.icon}
                      <span className="font-medium text-sm">{target.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{target.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook URL */}
            {(selectedTarget === 'webhook' || selectedTarget === 'api') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
