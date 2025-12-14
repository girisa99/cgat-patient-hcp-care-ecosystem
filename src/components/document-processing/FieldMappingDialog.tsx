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
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  dynamicFieldMappingService,
  toCSV,
  toJSON,
  downloadAsFile,
  type ExportFormat
} from '@/services/dynamicFieldMappingService';

// Dynamic target schema - fetched at runtime, not hardcoded
// User can add ANY custom field for ANY document type
const getBaseTargetSchema = (targetSystem: string): TargetField[] => {
  // Base fields that CRMs commonly have - NOT limiting, just suggestions
  const commonFields: TargetField[] = [
    { name: 'name', type: 'string', required: false, label: 'Name' },
    { name: 'email', type: 'email', required: false, label: 'Email' },
    { name: 'phone', type: 'phone', required: false, label: 'Phone' },
    { name: 'date', type: 'date', required: false, label: 'Date' },
  ];
  
  // These are SUGGESTIONS only - user can create any custom field
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
  
  const targetFields = useMemo(() => {
    const base = getBaseTargetSchema(targetSystem);
    return [...base, ...customFields];
  }, [targetSystem, customFields]);
  
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Field Mapping - Export to {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Map extracted fields to target system fields. Auto-match or manually assign mappings.
          </DialogDescription>
        </DialogHeader>
        
        {/* Stats bar */}
        <div className="flex items-center gap-4 py-2 border-b">
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
            Auto-Match Fields
          </Button>
        </div>
        
        {/* Mapping table */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-4">
            {mappings.map((mapping) => (
              <div
                key={mapping.sourceField}
                className={`grid grid-cols-[1fr_auto_1fr_auto_auto] gap-3 items-center p-3 rounded-lg border ${
                  mapping.skip 
                    ? 'bg-muted/50 opacity-60' 
                    : mapping.targetField 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-yellow-500/5 border-yellow-500/20'
                }`}
              >
                {/* Source field */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">{mapping.sourceField}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {String(getSourceValue(mapping.sourceField)).substring(0, 50)}
                  </div>
                </div>
                
                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                
                {/* Target field selection */}
                <div className="space-y-1">
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
                      <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                        <Sparkles className="h-3 w-3" />
                        New
                      </Badge>
                    </div>
                  ) : (
                    <Select
                      value={mapping.targetField}
                      onValueChange={(value) => updateMapping(mapping.sourceField, { targetField: value })}
                      disabled={mapping.skip}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Skip this field --</SelectItem>
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
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="trim">Trim spaces</SelectItem>
                    <SelectItem value="date_iso">Date (ISO)</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCreateCustomField(mapping.sourceField)}
                          disabled={mapping.skip || mapping.createCustom}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create custom field in target</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Checkbox
                    checked={mapping.skip}
                    onCheckedChange={(checked) => updateMapping(mapping.sourceField, { 
                      skip: !!checked,
                      targetField: checked ? '' : mapping.targetField 
                    })}
                  />
                  <Label className="text-xs text-muted-foreground">Skip</Label>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Custom fields summary */}
        {customFields.length > 0 && (
          <div className="border-t pt-3">
            <Label className="text-sm font-medium">Custom Fields to Create</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {customFields.map(cf => (
                <Badge key={cf.name} variant="secondary" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {cf.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
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
