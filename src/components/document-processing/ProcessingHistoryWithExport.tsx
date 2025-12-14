/**
 * Processing History Panel with MCP SDK Export
 * Displays processing history with ability to export to external tools via MCP
 * Includes Field Mapping Dialog for source-to-target field mapping
 */

import React, { useState, useMemo } from 'react';
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
  Webhook,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FieldMappingDialog, type FieldMapping, type TargetField, type SourceField } from './FieldMappingDialog';
import { exportWithMappings } from '@/services/mcpFieldMappingService';
import { 
  dynamicFieldMappingService,
  toCSV,
  toJSON,
  downloadAsFile,
  type ExportFormat
} from '@/services/dynamicFieldMappingService';

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
  onDeleteItems?: (ids: string[]) => void;
  documentTypes?: string[];
}

interface MCPExportTarget {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiresConfig?: boolean;
}

const MCP_EXPORT_TARGETS: MCPExportTarget[] = [
  { id: 'download_json', name: 'Download JSON', icon: <FileJson className="h-4 w-4 text-yellow-500" />, description: 'Save as JSON file' },
  { id: 'download_csv', name: 'Download CSV', icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />, description: 'Save as CSV file' },
  { id: 'supabase', name: 'Supabase', icon: <Database className="h-4 w-4" />, description: 'Save to database table' },
  { id: 'salesforce', name: 'Salesforce', icon: <Cloud className="h-4 w-4 text-blue-500" />, description: 'Push to Salesforce CRM', requiresConfig: true },
  { id: 'hubspot', name: 'HubSpot', icon: <span className="text-orange-500 text-sm font-bold">H</span>, description: 'Sync to HubSpot', requiresConfig: true },
  { id: 'veeva', name: 'Veeva CRM', icon: <span className="text-green-500 text-sm font-bold">V</span>, description: 'Healthcare CRM sync', requiresConfig: true },
  { id: 'webhook', name: 'Webhook', icon: <Webhook className="h-4 w-4" />, description: 'POST to custom endpoint', requiresConfig: true },
  { id: 'api', name: 'API/Middleware', icon: <ExternalLink className="h-4 w-4" />, description: 'Push to REST API or middleware layer', requiresConfig: true },
];

export default function ProcessingHistoryWithExport({
  history,
  onViewResult,
  onDeleteItems,
  documentTypes = [],
}: ProcessingHistoryWithExportProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedTarget, setSelectedTarget] = useState<string>('supabase');
  const [isExporting, setIsExporting] = useState(false);
  
  // Extract source fields from selected items for mapping
  const sourceFieldsForMapping = useMemo<SourceField[]>(() => {
    if (selectedItems.length === 0) return [];
    
    const selectedData = history.filter(h => selectedItems.includes(h.id));
    const allFields = new Map<string, any>();
    
    // Aggregate all fields from selected items
    for (const item of selectedData) {
      for (const [key, fieldData] of Object.entries(item.extractedFields)) {
        if (!allFields.has(key)) {
          allFields.set(key, fieldData.value);
        }
      }
      // Also include medication fields if available
      if (item.medications && item.medications.length > 0) {
        const med = item.medications[0];
        if (med.name && !allFields.has('medication')) allFields.set('medication', med.name);
        if (med.dosage && !allFields.has('dosage')) allFields.set('dosage', med.dosage);
        if (med.ndc && !allFields.has('ndc_code')) allFields.set('ndc_code', med.ndc);
      }
    }
    
    return Array.from(allFields.entries()).map(([name, value]) => ({ name, value }));
  }, [selectedItems, history]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [filterDocType, setFilterDocType] = useState<string>('all');

  // Get unique document types from history if not provided
  const availableDocTypes = documentTypes.length > 0 
    ? documentTypes 
    : [...new Set(history.map(h => h.documentType))].filter(Boolean);

  // Filter history based on selected document type
  const filteredHistory = filterDocType === 'all' 
    ? history 
    : history.filter(h => h.documentType === filterDocType);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(h => h.id));
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from('document_processing_jobs')
        .delete()
        .in('id', selectedItems);
      
      if (error) throw error;
      
      // Notify parent to update state
      onDeleteItems?.(selectedItems);
      setSelectedItems([]);
      setShowDeleteConfirm(false);
      toast.success(`Deleted ${selectedItems.length} record(s)`);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete records');
    } finally {
      setIsDeleting(false);
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

  // Opens mapping dialog before export for CRM targets
  const handleProceedToMapping = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to export');
      return;
    }
    
    // Handle direct downloads (no mapping needed)
    if (selectedTarget === 'download_json' || selectedTarget === 'download_csv') {
      handleDirectDownload();
      return;
    }
    
    // For CRM/API targets, show mapping dialog first
    if (['salesforce', 'hubspot', 'veeva', 'webhook', 'api'].includes(selectedTarget)) {
      setShowExportDialog(false);
      setShowMappingDialog(true);
    } else {
      // For supabase, export directly
      handleExport();
    }
  };

  // Direct download as JSON or CSV (dynamic fields, no hardcoding)
  const handleDirectDownload = () => {
    const selectedData = history.filter(h => selectedItems.includes(h.id));
    
    // Build dynamic export data - ALL extracted fields, no fixed schema
    const exportData = selectedData.map(item => {
      const record: Record<string, any> = {
        _id: item.id,
        _fileName: item.fileName,
        _documentType: item.documentType,
        _processedAt: item.processedAt,
      };
      
      // Add ALL dynamically extracted fields
      for (const [key, fieldData] of Object.entries(item.extractedFields)) {
        record[key] = fieldData.value;
      }
      
      // Add medication data if present
      if (item.medications && item.medications.length > 0) {
        item.medications.forEach((med, idx) => {
          const prefix = item.medications!.length > 1 ? `medication_${idx + 1}_` : '';
          if (med.name) record[`${prefix}medication_name`] = med.name;
          if (med.dosage) record[`${prefix}dosage`] = med.dosage;
          if (med.ndc) record[`${prefix}ndc_code`] = med.ndc;
          if (med.frequency) record[`${prefix}frequency`] = med.frequency;
        });
      }
      
      return record;
    });
    
    const timestamp = new Date().toISOString().slice(0, 10);
    
    if (selectedTarget === 'download_json') {
      downloadAsFile(exportData, `document-export-${timestamp}.json`, 'json');
      toast.success(`Downloaded ${exportData.length} record(s) as JSON`);
    } else {
      downloadAsFile(exportData, `document-export-${timestamp}.csv`, 'csv');
      toast.success(`Downloaded ${exportData.length} record(s) as CSV`);
    }
    
    setShowExportDialog(false);
    setSelectedItems([]);
  };

  // Handle confirmed field mappings from dialog
  const handleConfirmedMapping = async (mappings: FieldMapping[], customFields: TargetField[]) => {
    setIsExporting(true);
    
    try {
      // Convert TargetField type to match service interface
      const convertedCustomFields = customFields.map(f => ({
        ...f,
        dataType: f.type || 'string'
      }));
      
      const result = await exportWithMappings(
        sourceFieldsForMapping,
        mappings,
        convertedCustomFields,
        selectedTarget as 'salesforce' | 'hubspot' | 'veeva' | 'supabase' | 'webhook',
        {
          endpoint: webhookUrl,
          syncType: 'create_or_update',
          documentId: selectedItems[0]
        }
      );
      
      if (result.success) {
        const mockIndicator = result.mock ? ' (mock - configure CRM secrets for real integration)' : '';
        toast.success(
          `Exported ${mappings.length} fields to ${selectedTarget}${mockIndicator}`
        );
        setSelectedItems([]);
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export with mapping error:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
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
          // CRM sync should go through mapping dialog, but fallback if called directly
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

        case 'download':
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
      {/* Header with Filter and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
            onCheckedChange={selectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select items'}
          </span>
          
          {/* Document Type Filter */}
          {availableDocTypes.length > 0 && (
            <Select value={filterDocType} onValueChange={setFilterDocType}>
              <SelectTrigger className="w-[160px] h-8 ml-2">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({history.length})</SelectItem>
                {availableDocTypes.map(docType => (
                  <SelectItem key={docType} value={docType}>
                    {docType.charAt(0).toUpperCase() + docType.slice(1).replace(/-/g, ' ')} 
                    ({history.filter(h => h.documentType === docType).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedItems.length === 0}
            onClick={() => {
              setExportFormat('json');
              setSelectedTarget('download');
              setShowExportDialog(true);
            }}
          >
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedItems.length === 0}
            onClick={() => {
              setExportFormat('csv');
              setSelectedTarget('download');
              setShowExportDialog(true);
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="default" 
            size="sm"
            disabled={selectedItems.length === 0}
            onClick={() => setShowExportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            MCP Export
          </Button>
          {selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No processing history yet</p>
              <p className="text-sm">Upload documents to see them here</p>
            </div>
          ) : (
            filteredHistory.map((result) => (
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
                  <div className="w-12 h-12 rounded border overflow-hidden shrink-0 bg-muted">
                    <img 
                      src={result.imageUrl} 
                      alt={result.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        const fallback = document.createElement('div');
                        fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
                        e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
                      }}
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
                  onClick={() => onViewResult?.(result)}
                  title="View details"
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
            <Button onClick={handleProceedToMapping} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : ['salesforce', 'hubspot', 'veeva'].includes(selectedTarget) ? (
                <ArrowRight className="h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {['salesforce', 'hubspot', 'veeva'].includes(selectedTarget) 
                ? 'Configure Mapping' 
                : 'Export Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Mapping Dialog for CRM exports */}
      <FieldMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        sourceFields={sourceFieldsForMapping}
        targetSystem={selectedTarget as 'salesforce' | 'hubspot' | 'veeva' | 'supabase' | 'webhook'}
        onConfirmMapping={handleConfirmedMapping}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} selected record(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
