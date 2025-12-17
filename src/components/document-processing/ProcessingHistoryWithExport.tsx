/**
 * Processing History Panel with MCP SDK Export
 * Displays processing history with ability to export to external tools via MCP
 * Includes Field Mapping Dialog for source-to-target field mapping
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  ArrowRight,
  Calendar as CalendarIcon,
  Filter,
  Clock,
  CheckCircle2
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
  exportStatus?: 'pending' | 'exported' | 'partial';
  exportedAt?: Date;
  exportTargets?: string[];
}

interface ProcessingHistoryWithExportProps {
  history: ProcessingResult[];
  onViewResult?: (result: ProcessingResult) => void;
  onDeleteItems?: (ids: string[]) => void;
  documentTypes?: string[];
  currentExtractedFields?: Record<string, { value: string; confidence: number; verified?: boolean }>;
  currentProcessingResultId?: string;
  filterByDocType?: string; // Auto-filter history by this document type
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
  currentExtractedFields,
  currentProcessingResultId,
  filterByDocType,
}: ProcessingHistoryWithExportProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedTarget, setSelectedTarget] = useState<string>('supabase');
  const [isExporting, setIsExporting] = useState(false);
  
  // Get document type from selected items for field filtering
  const selectedDocumentType = useMemo(() => {
    if (selectedItems.length === 0) return undefined;
    const selectedData = history.filter(h => selectedItems.includes(h.id));
    // Use the first selected item's document type (or most common if multiple)
    return selectedData[0]?.documentType;
  }, [selectedItems, history]);
  
  // Extract ALL source fields from selected items for mapping - comprehensive extraction
  // Uses currentExtractedFields if the selected item matches currentProcessingResultId
  const sourceFieldsForMapping = useMemo<SourceField[]>(() => {
    if (selectedItems.length === 0) return [];
    
    const selectedData = history.filter(h => selectedItems.includes(h.id));
    const allFields = new Map<string, any>();
    
    // If we have current extracted fields and the selected item matches, use those
    const useCurrentFields = currentExtractedFields && currentProcessingResultId && 
      selectedItems.length === 1 && selectedItems[0] === currentProcessingResultId;
    
    // Detect document type to apply appropriate priority
    const documentType = selectedData[0]?.documentType || '';
    const isImagingDocument = ['xray', 'x-ray', 'ct_scan', 'ct-scan', 'mri', 'ecg', 'ultrasound', 'mammogram'].includes(documentType);
    
    // Priority order - imaging-specific fields first if it's an imaging document
    const imagingPriorityOrder = [
      // Patient details (highest priority for imaging)
      'patient_name', 'patient_id', 'patient_dob', 'referring_physician', 'study_date',
      // Provider details
      'provider_name', 'provider_npi', 'facility_name', 'facility_address', 'report_date',
      // Clinical findings (from AI analysis)
      'findings_summary', 'abnormal_findings', 'abnormal_count', 'clinical_notes',
      // Individual findings (these will be dynamically added)
      'finding_1_category', 'finding_1_description', 'finding_1_region', 'finding_1_significance', 'finding_1_status', 'finding_1_measurement',
      'finding_2_category', 'finding_2_description', 'finding_2_region', 'finding_2_significance',
      'finding_3_category', 'finding_3_description', 'finding_3_region', 'finding_3_significance',
      // Full insights JSON (low priority as it's the raw data)
      'ai_insights_json'
    ];
    
    // Priority order for prescription/general documents
    const prescriptionPriorityOrder = [
      'patient_name', 'patient_first_name', 'patient_last_name', 'date_of_birth', 'dob',
      'medication_name', 'drug_name', 'medication', 'dosage', 'dose', 'strength',
      'frequency', 'directions', 'sig', 'sig_text', 'sig_code', 'route',
      'quantity', 'qty', 'days_supply', 'refills', 'refill',
      'ndc_code', 'ndc', 'rx_number',
      'prescriber', 'prescriber_name', 'physician', 'doctor_name', 'provider_name',
      'npi', 'npi_number', 'dea_number', 'dea',
      'pharmacy_name', 'pharmacy_address', 'pharmacy_phone',
      'prescription_date', 'fill_date', 'expiration_date',
      'clinical_recommendations', 'alternatives', 'drug_interactions'
    ];
    
    // Select appropriate priority order based on document type
    const priorityOrder = isImagingDocument ? imagingPriorityOrder : prescriptionPriorityOrder;
    
    // Helper to add field with normalized key
    const addField = (key: string, value: any, priority?: number) => {
      if (value !== null && value !== undefined && value !== '') {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        if (!allFields.has(normalizedKey)) {
          allFields.set(normalizedKey, { value, priority: priority ?? 999 });
        }
      }
    };
    
    // Get priority for a field name
    const getPriority = (fieldName: string): number => {
      const normalized = fieldName.toLowerCase().replace(/\s+/g, '_');
      const idx = priorityOrder.findIndex(p => normalized.includes(p) || p.includes(normalized));
      return idx >= 0 ? idx : 999;
    };
    
    // Aggregate ALL fields from selected items
    for (const item of selectedData) {
      // 1. Use currentExtractedFields if available for this item, otherwise use item.extractedFields
      const fieldsToUse = (useCurrentFields && item.id === currentProcessingResultId) 
        ? currentExtractedFields 
        : item.extractedFields;
      
      for (const [key, fieldData] of Object.entries(fieldsToUse || {})) {
        const value = typeof fieldData === 'object' && fieldData !== null && 'value' in fieldData 
          ? fieldData.value 
          : fieldData;
        addField(key, value, getPriority(key));
      }
      
      // 2. All medication fields (support multiple medications)
      if (item.medications && item.medications.length > 0) {
        item.medications.forEach((med, idx) => {
          const prefix = item.medications!.length > 1 ? `medication_${idx + 1}_` : '';
          if (med.name) addField(`${prefix}medication_name`, med.name, getPriority('medication_name'));
          if (med.dosage) addField(`${prefix}dosage`, med.dosage, getPriority('dosage'));
          if (med.strength) addField(`${prefix}strength`, med.strength, getPriority('strength'));
          if (med.frequency) addField(`${prefix}frequency`, med.frequency, getPriority('frequency'));
          if (med.directions) addField(`${prefix}directions`, med.directions, getPriority('directions'));
          if (med.sig) addField(`${prefix}sig`, med.sig, getPriority('sig'));
          if (med.route) addField(`${prefix}route`, med.route, getPriority('route'));
          if (med.quantity) addField(`${prefix}quantity`, med.quantity, getPriority('quantity'));
          if (med.daysSupply) addField(`${prefix}days_supply`, med.daysSupply, getPriority('days_supply'));
          if (med.refills) addField(`${prefix}refills`, med.refills, getPriority('refills'));
          if (med.ndc) addField(`${prefix}ndc_code`, med.ndc, getPriority('ndc_code'));
          if (med.ndcCode) addField(`${prefix}ndc_code`, med.ndcCode, getPriority('ndc_code'));
          if (med.rxNumber) addField(`${prefix}rx_number`, med.rxNumber, getPriority('rx_number'));
          // Add clinical data if present
          if (med.clinicalRecommendations) addField(`${prefix}clinical_recommendations`, med.clinicalRecommendations, getPriority('clinical_recommendations'));
          if (med.alternatives) addField(`${prefix}alternatives`, JSON.stringify(med.alternatives), getPriority('alternatives'));
          if (med.drugInteractions) addField(`${prefix}drug_interactions`, JSON.stringify(med.drugInteractions), getPriority('drug_interactions'));
        });
      }
      
      // 3. Validation results as fields (low priority)
      if (item.validationResults) {
        addField('validation_passed', item.validationResults.passed, 900);
        addField('validation_failed', item.validationResults.failed, 901);
        addField('validation_warnings', item.validationResults.warnings, 902);
      }
      
      // 4. Document metadata (lowest priority - at the end)
      addField('document_type', item.documentType, 990);
      addField('file_name', item.fileName, 991);
      addField('processed_at', item.processedAt, 992);
      
      // 5. Deep scan for any nested objects in extractedFields
      for (const [key, fieldData] of Object.entries(item.extractedFields || {})) {
        if (typeof fieldData === 'object' && fieldData !== null) {
          // Handle nested objects
          for (const [nestedKey, nestedVal] of Object.entries(fieldData)) {
            if (nestedKey !== 'value' && nestedKey !== 'confidence' && nestedKey !== 'verified') {
              addField(`${key}_${nestedKey}`, nestedVal, getPriority(`${key}_${nestedKey}`));
            }
          }
        }
      }
    }
    
    // Sort by priority and return
    return Array.from(allFields.entries())
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name, data]) => ({ 
        name, 
        value: data.value,
        type: typeof data.value === 'number' ? 'number' : typeof data.value === 'boolean' ? 'boolean' : 'string'
      }));
  }, [selectedItems, history, currentExtractedFields, currentProcessingResultId]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterExportStatus, setFilterExportStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-apply document type filter when prop changes
  useEffect(() => {
    if (filterByDocType && filterByDocType !== 'all') {
      setFilterDocType(filterByDocType);
    }
  }, [filterByDocType]);

  // Get unique document types from history if not provided
  const availableDocTypes = documentTypes.length > 0 
    ? documentTypes 
    : [...new Set(history.map(h => h.documentType))].filter(Boolean);

  // Filter history based on all filter criteria
  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      // Document type filter
      if (filterDocType !== 'all' && h.documentType !== filterDocType) return false;
      
      // Export status filter
      if (filterExportStatus !== 'all') {
        const status = h.exportStatus || 'pending';
        if (filterExportStatus !== status) return false;
      }
      
      // Date range filter
      const processedDate = new Date(h.processedAt);
      if (filterDateFrom && processedDate < filterDateFrom) return false;
      if (filterDateTo) {
        const endOfDay = new Date(filterDateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (processedDate > endOfDay) return false;
      }
      
      return true;
    });
  }, [history, filterDocType, filterExportStatus, filterDateFrom, filterDateTo]);

  // Count by status for filter badges
  const statusCounts = useMemo(() => ({
    all: history.length,
    pending: history.filter(h => !h.exportStatus || h.exportStatus === 'pending').length,
    exported: history.filter(h => h.exportStatus === 'exported').length,
    partial: history.filter(h => h.exportStatus === 'partial').length,
  }), [history]);

  const clearFilters = () => {
    setFilterDocType('all');
    setFilterExportStatus('all');
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
  };

  const hasActiveFilters = filterDocType !== 'all' || filterExportStatus !== 'all' || filterDateFrom || filterDateTo;

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

  // Mark items as exported in database
  const markAsExported = async (itemIds: string[], target: string, format: 'json' | 'csv') => {
    try {
      for (const id of itemIds) {
        // Get current export targets
        const { data: current } = await supabase
          .from('document_processing_jobs')
          .select('export_targets')
          .eq('id', id)
          .single();
        
        const existingTargets = (current?.export_targets as string[]) || [];
        const newTargets = [...new Set([...existingTargets, target])];
        
        await supabase
          .from('document_processing_jobs')
          .update({
            export_status: 'exported',
            exported_at: new Date().toISOString(),
            export_targets: newTargets,
            export_format: format
          })
          .eq('id', id);
      }
    } catch (err) {
      console.error('Failed to mark as exported:', err);
    }
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
        // Mark items as exported
        await markAsExported(selectedItems, selectedTarget, exportFormat);
        
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
          await markAsExported(selectedItems, 'supabase', exportFormat);
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
          await markAsExported(selectedItems, selectedTarget, exportFormat);
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
          await markAsExported(selectedItems, selectedTarget, exportFormat);
          toast.success(`Synced ${selectedData.length} records to ${selectedTarget}`);
          break;

        case 'download':
        case 'download_json':
        case 'download_csv':
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
          await markAsExported(selectedItems, 'download', exportFormat);
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
        <div className="flex items-center gap-2 flex-wrap">
          <Checkbox
            checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
            onCheckedChange={selectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select items'}
          </span>
          
          {/* Filter Toggle Button */}
          <Button
            variant={hasActiveFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {[filterDocType !== 'all', filterExportStatus !== 'all', filterDateFrom, filterDateTo].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedItems.length === 0}
            onClick={() => {
              setExportFormat('json');
              setSelectedTarget('download_json');
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
              setSelectedTarget('download_csv');
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

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Document Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Document Type</Label>
              <Select value={filterDocType} onValueChange={setFilterDocType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Types" />
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
            </div>
            
            {/* Export Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Export Status</Label>
              <Select value={filterExportStatus} onValueChange={setFilterExportStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span>All Status</span>
                      <Badge variant="outline" className="text-xs">{statusCounts.all}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>Pending</span>
                      <Badge variant="outline" className="text-xs bg-amber-500/10">{statusCounts.pending}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="exported">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Exported</span>
                      <Badge variant="outline" className="text-xs bg-green-500/10">{statusCounts.exported}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-blue-500" />
                      <span>Partial</span>
                      <Badge variant="outline" className="text-xs bg-blue-500/10">{statusCounts.partial}</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-9 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateFrom ? format(filterDateFrom, "PPP") : <span className="text-muted-foreground">Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDateFrom}
                    onSelect={setFilterDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-9 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateTo ? format(filterDateTo, "PPP") : <span className="text-muted-foreground">Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDateTo}
                    onSelect={setFilterDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="text-xs text-muted-foreground">
            Showing {filteredHistory.length} of {history.length} records
          </div>
        </div>
      )}

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
                    {/* Export Status Badge */}
                    {result.exportStatus === 'exported' ? (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Exported
                      </Badge>
                    ) : result.exportStatus === 'partial' ? (
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Partial
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-amber-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{result.documentType}</span>
                    <span>•</span>
                    <span>{Object.keys(result.extractedFields).length} fields</span>
                    <span>•</span>
                    <span>{formatDate(result.processedAt)}</span>
                    {result.exportTargets && result.exportTargets.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">→ {result.exportTargets.join(', ')}</span>
                      </>
                    )}
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
        documentType={selectedDocumentType}
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
