/**
 * Field Mapping Dialog - Maps extracted source fields to target CRM/system fields
 * Supports auto-matching, custom field creation, and data type transformations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  ArrowRight, 
  Check, 
  X, 
  Plus, 
  Wand2, 
  AlertCircle,
  Database,
  RefreshCw,
  Sparkles,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  dynamicFieldMappingService,
  toCSV,
  toJSON,
  downloadAsFile,
  type ExportFormat
} from '@/services/dynamicFieldMappingService';

// Comprehensive target schema - covers healthcare, CRM, and common fields
// User can ALSO add ANY custom field for ANY document type
const getBaseTargetSchema = (targetSystem: string): TargetField[] => {
  // Common fields across all systems
  const commonFields: TargetField[] = [
    // Personal/Patient Information
    { name: 'first_name', type: 'string', required: false, label: 'First Name' },
    { name: 'last_name', type: 'string', required: false, label: 'Last Name' },
    { name: 'full_name', type: 'string', required: false, label: 'Full Name' },
    { name: 'patient_name', type: 'string', required: false, label: 'Patient Name' },
    { name: 'date_of_birth', type: 'date', required: false, label: 'Date of Birth' },
    { name: 'dob', type: 'date', required: false, label: 'DOB' },
    { name: 'sex', type: 'string', required: false, label: 'Sex/Gender' },
    { name: 'gender', type: 'string', required: false, label: 'Gender' },
    { name: 'age', type: 'number', required: false, label: 'Age' },
    
    // Contact Information
    { name: 'email', type: 'email', required: false, label: 'Email' },
    { name: 'phone', type: 'phone', required: false, label: 'Phone' },
    { name: 'phone_number', type: 'phone', required: false, label: 'Phone Number' },
    { name: 'mobile', type: 'phone', required: false, label: 'Mobile' },
    { name: 'fax', type: 'phone', required: false, label: 'Fax' },
    
    // Address Fields
    { name: 'address', type: 'string', required: false, label: 'Full Address' },
    { name: 'street_address', type: 'string', required: false, label: 'Street Address' },
    { name: 'address_line_1', type: 'string', required: false, label: 'Address Line 1' },
    { name: 'address_line_2', type: 'string', required: false, label: 'Address Line 2' },
    { name: 'city', type: 'string', required: false, label: 'City' },
    { name: 'state', type: 'string', required: false, label: 'State' },
    { name: 'zip_code', type: 'string', required: false, label: 'ZIP Code' },
    { name: 'postal_code', type: 'string', required: false, label: 'Postal Code' },
    { name: 'country', type: 'string', required: false, label: 'Country' },
    
    // Healthcare/Provider Fields
    { name: 'npi_number', type: 'string', required: false, label: 'NPI Number' },
    { name: 'prescriber', type: 'string', required: false, label: 'Prescriber' },
    { name: 'prescriber_name', type: 'string', required: false, label: 'Prescriber Name' },
    { name: 'physician', type: 'string', required: false, label: 'Physician' },
    { name: 'doctor_name', type: 'string', required: false, label: 'Doctor Name' },
    { name: 'provider_name', type: 'string', required: false, label: 'Provider Name' },
    { name: 'facility_name', type: 'string', required: false, label: 'Facility Name' },
    { name: 'clinic_name', type: 'string', required: false, label: 'Clinic Name' },
    { name: 'hospital_name', type: 'string', required: false, label: 'Hospital Name' },
    { name: 'license_number', type: 'string', required: false, label: 'License Number' },
    { name: 'dea_number', type: 'string', required: false, label: 'DEA Number' },
    
    // Medication Fields
    { name: 'medication', type: 'string', required: false, label: 'Medication' },
    { name: 'medication_name', type: 'string', required: false, label: 'Medication Name' },
    { name: 'drug_name', type: 'string', required: false, label: 'Drug Name' },
    { name: 'dosage', type: 'string', required: false, label: 'Dosage' },
    { name: 'strength', type: 'string', required: false, label: 'Strength' },
    { name: 'frequency', type: 'string', required: false, label: 'Frequency' },
    { name: 'directions', type: 'string', required: false, label: 'Directions' },
    { name: 'quantity', type: 'number', required: false, label: 'Quantity' },
    { name: 'refills', type: 'number', required: false, label: 'Refills' },
    { name: 'ndc_code', type: 'string', required: false, label: 'NDC Code' },
    { name: 'rx_number', type: 'string', required: false, label: 'Rx Number' },
    
    // Insurance Fields
    { name: 'insurance_id', type: 'string', required: false, label: 'Insurance ID' },
    { name: 'member_id', type: 'string', required: false, label: 'Member ID' },
    { name: 'policy_number', type: 'string', required: false, label: 'Policy Number' },
    { name: 'group_number', type: 'string', required: false, label: 'Group Number' },
    { name: 'insurance_provider', type: 'string', required: false, label: 'Insurance Provider' },
    { name: 'plan_name', type: 'string', required: false, label: 'Plan Name' },
    { name: 'bin_number', type: 'string', required: false, label: 'BIN Number' },
    { name: 'pcn', type: 'string', required: false, label: 'PCN' },
    { name: 'effective_date', type: 'date', required: false, label: 'Effective Date' },
    { name: 'expiration_date', type: 'date', required: false, label: 'Expiration Date' },
    { name: 'copay', type: 'number', required: false, label: 'Copay' },
    
    // Date Fields
    { name: 'date', type: 'date', required: false, label: 'Date' },
    { name: 'prescription_date', type: 'date', required: false, label: 'Prescription Date' },
    { name: 'fill_date', type: 'date', required: false, label: 'Fill Date' },
    { name: 'visit_date', type: 'date', required: false, label: 'Visit Date' },
    
    // Diagnosis/Clinical Fields
    { name: 'diagnosis', type: 'string', required: false, label: 'Diagnosis' },
    { name: 'icd_code', type: 'string', required: false, label: 'ICD Code' },
    { name: 'symptoms', type: 'string', required: false, label: 'Symptoms' },
    { name: 'allergies', type: 'string', required: false, label: 'Allergies' },
    { name: 'notes', type: 'string', required: false, label: 'Notes' },
    { name: 'comments', type: 'string', required: false, label: 'Comments' },
    
    // ID Fields
    { name: 'ssn', type: 'string', required: false, label: 'SSN' },
    { name: 'mrn', type: 'string', required: false, label: 'Medical Record Number' },
    { name: 'account_number', type: 'string', required: false, label: 'Account Number' },
  ];
  
  // Add system-specific fields
  if (targetSystem === 'salesforce') {
    commonFields.push(
      { name: 'Account.Name', type: 'string', required: false, label: 'SF: Account Name' },
      { name: 'Contact.FirstName', type: 'string', required: false, label: 'SF: Contact First Name' },
      { name: 'Contact.LastName', type: 'string', required: false, label: 'SF: Contact Last Name' },
      { name: 'Contact.Email', type: 'email', required: false, label: 'SF: Contact Email' },
      { name: 'Contact.Phone', type: 'phone', required: false, label: 'SF: Contact Phone' },
      { name: 'Contact.MailingStreet', type: 'string', required: false, label: 'SF: Mailing Street' },
      { name: 'Contact.MailingCity', type: 'string', required: false, label: 'SF: Mailing City' },
      { name: 'Contact.MailingState', type: 'string', required: false, label: 'SF: Mailing State' },
      { name: 'Contact.MailingPostalCode', type: 'string', required: false, label: 'SF: Mailing Postal Code' },
    );
  } else if (targetSystem === 'hubspot') {
    commonFields.push(
      { name: 'firstname', type: 'string', required: false, label: 'HS: First Name' },
      { name: 'lastname', type: 'string', required: false, label: 'HS: Last Name' },
      { name: 'company', type: 'string', required: false, label: 'HS: Company' },
      { name: 'hs_lead_status', type: 'string', required: false, label: 'HS: Lead Status' },
    );
  } else if (targetSystem === 'veeva') {
    commonFields.push(
      { name: 'Account_vod__c', type: 'string', required: false, label: 'Veeva: Account' },
      { name: 'Prescriber_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber' },
      { name: 'Product_vod__c', type: 'string', required: false, label: 'Veeva: Product' },
    );
  }
  
  return commonFields;
};

interface TargetField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  required: boolean;
  label: string;
  isCustom?: boolean;
}

interface SourceField {
  name: string;
  value: any;
  type?: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'date_iso' | 'number' | 'boolean';
  skip: boolean;
  createCustom: boolean;
  customFieldName?: string;
}

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceFields: SourceField[];
  targetSystem: 'salesforce' | 'hubspot' | 'veeva' | 'supabase' | 'webhook';
  onConfirmMapping: (mappings: FieldMapping[], customFields: TargetField[]) => void;
}

// Similarity score using Levenshtein distance
function calculateSimilarity(s1: string, s2: string): number {
  const s1Lower = s1.toLowerCase().replace(/[_\-\s]/g, '');
  const s2Lower = s2.toLowerCase().replace(/[_\-\s]/g, '');
  
  if (s1Lower === s2Lower) return 1;
  if (s1Lower.includes(s2Lower) || s2Lower.includes(s1Lower)) return 0.8;
  
  // Levenshtein distance
  const track = Array(s2Lower.length + 1).fill(null).map(() =>
    Array(s1Lower.length + 1).fill(null));
  
  for (let i = 0; i <= s1Lower.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2Lower.length; j += 1) track[j][0] = j;
  
  for (let j = 1; j <= s2Lower.length; j += 1) {
    for (let i = 1; i <= s1Lower.length; i += 1) {
      const indicator = s1Lower[i - 1] === s2Lower[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLen = Math.max(s1Lower.length, s2Lower.length);
  return 1 - (track[s2Lower.length][s1Lower.length] / maxLen);
}

// Auto-match source to target fields
function autoMatchFields(
  sourceFields: SourceField[],
  targetFields: TargetField[]
): Map<string, string> {
  const matches = new Map<string, string>();
  const usedTargets = new Set<string>();
  
  // Common field name aliases
  const aliases: Record<string, string[]> = {
    'patient_name': ['name', 'full_name', 'patient', 'patientname'],
    'medication': ['drug', 'medicine', 'product', 'rx', 'prescription'],
    'dosage': ['dose', 'strength', 'amount'],
    'frequency': ['schedule', 'interval', 'timing', 'directions'],
    'prescriber': ['doctor', 'physician', 'provider', 'prescribername'],
    'date_of_birth': ['dob', 'birthdate', 'birth_date', 'dateofbirth'],
    'npi_number': ['npi', 'npinumber', 'provider_npi'],
    'insurance_id': ['member_id', 'policy_number', 'insuranceid'],
    'ndc_code': ['ndc', 'ndccode', 'drug_code'],
  };
  
  for (const source of sourceFields) {
    let bestMatch: string | null = null;
    let bestScore = 0;
    
    for (const target of targetFields) {
      if (usedTargets.has(target.name)) continue;
      
      // Direct similarity
      let score = calculateSimilarity(source.name, target.name);
      
      // Check aliases
      const sourceNorm = source.name.toLowerCase().replace(/[_\-\s]/g, '');
      for (const [canonical, aliasList] of Object.entries(aliases)) {
        if (aliasList.includes(sourceNorm) || sourceNorm === canonical.replace(/_/g, '')) {
          const targetNorm = target.name.toLowerCase().replace(/[_\-\s]/g, '');
          if (targetNorm.includes(canonical.replace(/_/g, '')) || 
              aliasList.some(a => targetNorm.includes(a))) {
            score = Math.max(score, 0.9);
          }
        }
      }
      
      // Label similarity bonus
      score = Math.max(score, calculateSimilarity(source.name, target.label) * 0.95);
      
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = target.name;
      }
    }
    
    if (bestMatch) {
      matches.set(source.name, bestMatch);
      usedTargets.add(bestMatch);
    }
  }
  
  return matches;
}

export function FieldMappingDialog({
  open,
  onOpenChange,
  sourceFields,
  targetSystem,
  onConfirmMapping
}: FieldMappingDialogProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [customFields, setCustomFields] = useState<TargetField[]>([]);
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  
  const targetFields = useMemo(() => {
    const base = getBaseTargetSchema(targetSystem);
    return [...base, ...customFields];
  }, [targetSystem, customFields]);
  
  // Filter target fields based on search
  const filteredTargetFields = useMemo(() => {
    if (!searchFilter.trim()) return targetFields;
    const lower = searchFilter.toLowerCase();
    return targetFields.filter(tf => 
      tf.name.toLowerCase().includes(lower) || 
      tf.label.toLowerCase().includes(lower)
    );
  }, [targetFields, searchFilter]);
  
  // Initialize mappings when dialog opens
  useEffect(() => {
    if (open && sourceFields.length > 0) {
      const initialMappings: FieldMapping[] = sourceFields.map(sf => ({
        sourceField: sf.name,
        targetField: '',
        transformation: 'none',
        skip: false,
        createCustom: false
      }));
      setMappings(initialMappings);
      setCustomFields([]);
      setSearchFilter('');
    }
  }, [open, sourceFields]);
  
  const handleAutoMatch = () => {
    setIsAutoMatching(true);
    
    setTimeout(() => {
      const autoMatches = autoMatchFields(sourceFields, targetFields);
      
      setMappings(prev => prev.map(m => {
        const matched = autoMatches.get(m.sourceField);
        if (matched && !m.skip) {
          return { ...m, targetField: matched, createCustom: false };
        }
        return m;
      }));
      
      const matchedCount = autoMatches.size;
      toast.success(`Auto-matched ${matchedCount} of ${sourceFields.length} fields`);
      setIsAutoMatching(false);
    }, 500);
  };
  
  const updateMapping = (sourceField: string, updates: Partial<FieldMapping>) => {
    setMappings(prev => prev.map(m => 
      m.sourceField === sourceField ? { ...m, ...updates } : m
    ));
  };
  
  const handleCreateCustomField = (sourceField: string) => {
    const mapping = mappings.find(m => m.sourceField === sourceField);
    if (!mapping) return;
    
    const customName = mapping.customFieldName || sourceField.replace(/\s+/g, '_');
    const newField: TargetField = {
      name: customName,
      type: 'string',
      required: false,
      label: sourceField,
      isCustom: true
    };
    
    setCustomFields(prev => [...prev, newField]);
    updateMapping(sourceField, { 
      targetField: customName, 
      createCustom: true,
      customFieldName: customName 
    });
    
    toast.success(`Custom field "${customName}" will be created in ${targetSystem}`);
  };
  
  const unmappedCount = mappings.filter(m => !m.targetField && !m.skip).length;
  const mappedCount = mappings.filter(m => m.targetField && !m.skip).length;
  const skippedCount = mappings.filter(m => m.skip).length;
  
  const handleConfirm = () => {
    const activeMappings = mappings.filter(m => m.targetField && !m.skip);
    if (activeMappings.length === 0) {
      toast.error('Please map at least one field');
      return;
    }
    
    onConfirmMapping(mappings, customFields);
    onOpenChange(false);
  };
  
  const getSourceValue = (fieldName: string) => {
    const field = sourceFields.find(f => f.name === fieldName);
    return field?.value || '';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Field Mapping Configuration
          </DialogTitle>
          <DialogDescription>
            Map source fields to {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)} target fields
          </DialogDescription>
        </DialogHeader>
        
        {/* Stats bar */}
        <div className="flex items-center gap-3 py-2 border-b flex-wrap">
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            {mappedCount} Mapped
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {unmappedCount} Unmapped
          </Badge>
          <Badge variant="outline" className="gap-1">
            <X className="h-3 w-3" />
            {skippedCount} Skipped
          </Badge>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoMatch}
            disabled={isAutoMatching}
            className="gap-2"
          >
            {isAutoMatching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Auto-Match All
          </Button>
        </div>
        
        {/* Two-panel layout: Source on top, Target on bottom */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
          
          {/* SOURCE SYSTEM - Top Panel */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-500/10 border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm">Source: Extracted Document Fields</span>
                <Badge variant="outline" className="text-xs">{sourceFields.length} fields</Badge>
              </div>
            </div>
            <ScrollArea className="h-[180px]">
              <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sourceFields.map(sf => {
                  const mapping = mappings.find(m => m.sourceField === sf.name);
                  const isMapped = mapping?.targetField && !mapping?.skip;
                  const isSkipped = mapping?.skip;
                  
                  return (
                    <div 
                      key={sf.name}
                      className={`p-2 rounded border text-xs ${
                        isSkipped 
                          ? 'bg-muted/50 opacity-60 border-muted' 
                          : isMapped 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}
                    >
                      <div className="font-medium truncate">{sf.name}</div>
                      <div className="text-muted-foreground truncate mt-0.5">
                        {String(sf.value || '').substring(0, 30)}
                      </div>
                      {isMapped && (
                        <div className="flex items-center gap-1 mt-1 text-green-600">
                          <ArrowRight className="h-3 w-3" />
                          <span className="truncate">{mapping?.targetField}</span>
                        </div>
                      )}
                      {isSkipped && (
                        <div className="text-muted-foreground mt-1 italic">Skipped</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {/* MAPPING CONFIGURATION - Middle */}
          <div className="border rounded-lg flex-1 min-h-0 overflow-hidden">
            <div className="bg-primary/10 border-b px-4 py-2 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Mapping Configuration</span>
            </div>
            <ScrollArea className="h-full max-h-[250px]">
              <div className="p-3 space-y-2">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.sourceField}
                    className={`grid grid-cols-[1fr_auto_1.2fr_auto_auto] gap-2 items-center p-2 rounded-lg border ${
                      mapping.skip 
                        ? 'bg-muted/30 opacity-70' 
                        : mapping.targetField 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}
                  >
                    {/* Source field */}
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{mapping.sourceField}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {String(getSourceValue(mapping.sourceField)).substring(0, 40)}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    
                    {/* Target field selection */}
                    <div className="min-w-0">
                      {mapping.createCustom ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={mapping.customFieldName || ''}
                            onChange={(e) => updateMapping(mapping.sourceField, { 
                              customFieldName: e.target.value,
                              targetField: e.target.value
                            })}
                            placeholder="Custom field name"
                            className="h-8"
                            disabled={mapping.skip}
                          />
                          <Badge variant="secondary" className="gap-1 whitespace-nowrap shrink-0">
                            <Sparkles className="h-3 w-3" />
                            New
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          value={mapping.targetField || '__skip__'}
                          onValueChange={(value) => updateMapping(mapping.sourceField, { 
                            targetField: value === '__skip__' ? '' : value 
                          })}
                          disabled={mapping.skip}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select target field" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="__skip__">-- Skip this field --</SelectItem>
                            {targetFields.map(tf => (
                              <SelectItem key={tf.name} value={tf.name}>
                                <div className="flex items-center gap-2">
                                  <span>{tf.label}</span>
                                  {tf.required && (
                                    <Badge variant="destructive" className="text-[10px] px-1">Required</Badge>
                                  )}
                                  {tf.isCustom && (
                                    <Badge variant="secondary" className="text-[10px] px-1">Custom</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* Transformation */}
                    <Select
                      value={mapping.transformation}
                      onValueChange={(value: any) => updateMapping(mapping.sourceField, { transformation: value })}
                      disabled={mapping.skip || !mapping.targetField}
                    >
                      <SelectTrigger className="w-24 h-8 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="uppercase">UPPER</SelectItem>
                        <SelectItem value="lowercase">lower</SelectItem>
                        <SelectItem value="trim">Trim</SelectItem>
                        <SelectItem value="date_iso">Date</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Bool</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCreateCustomField(mapping.sourceField)}
                              disabled={mapping.skip || mapping.createCustom}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Create custom field</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Checkbox
                        checked={mapping.skip}
                        onCheckedChange={(checked) => updateMapping(mapping.sourceField, { 
                          skip: !!checked,
                          targetField: checked ? '' : mapping.targetField 
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* TARGET SYSTEM - Bottom Panel */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-500/10 border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">
                  Target: {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)} Fields
                </span>
                <Badge variant="outline" className="text-xs">{targetFields.length} available</Badge>
              </div>
              {customFields.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {customFields.length} custom fields to create
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[120px]">
              <div className="p-3 flex flex-wrap gap-1.5">
                {targetFields.map(tf => {
                  const isUsed = mappings.some(m => m.targetField === tf.name && !m.skip);
                  return (
                    <Badge 
                      key={tf.name} 
                      variant={isUsed ? "default" : "outline"}
                      className={`text-xs ${isUsed ? 'bg-green-600' : 'opacity-70'} ${tf.isCustom ? 'border-dashed' : ''}`}
                    >
                      {tf.label}
                      {tf.isCustom && <Sparkles className="h-2.5 w-2.5 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <Check className="h-4 w-4" />
            Confirm Mapping ({mappedCount} fields)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { FieldMapping, TargetField, SourceField };
