/**
 * Field Confirmation Card
 * Individual field display with confidence badge, inline editing, verification,
 * and drug name suggestions for medication-related fields
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertTriangle,
  Edit2,
  Eye,
  Brain,
  Sparkles,
  RotateCcw,
  Pill,
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { ExtractedField } from './SmartDocumentStudio';

interface DrugSuggestion {
  name: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  ndc?: string;
}

interface FieldConfirmationCardProps {
  fieldKey: string;
  field: ExtractedField;
  isActive: boolean;
  onUpdate: (value: string) => void;
  onDelete?: () => void;
  onVerify: () => void;
  onClick: () => void;
}

// Medication NAME field keys that should show drug suggestions
// IMPORTANT: Be specific - exclude SIG, strength, NDC, etc. fields
const MEDICATION_NAME_FIELD_KEYS = [
  'medication_name', 'drug_name', 'medicine_name', 'rx_name', 'product_name',
  'brand_name', 'brandname', 'generic_name', 'genericname'
];

// Patterns for numbered medication name fields (medication_1_name, medication_2_name, etc.)
// But NOT medication_1_sig, medication_1_strength, medication_1_ndc, etc.
const isMedicationNameField = (fieldKey: string): boolean => {
  const lowerKey = fieldKey.toLowerCase();
  
  // Exclude non-name medication fields
  if (lowerKey.includes('sig') || 
      lowerKey.includes('strength') || 
      lowerKey.includes('ndc') ||
      lowerKey.includes('dose') ||
      lowerKey.includes('frequency') ||
      lowerKey.includes('route') ||
      lowerKey.includes('quantity') ||
      lowerKey.includes('refill') ||
      lowerKey.includes('directions') ||
      lowerKey.includes('instructions')) {
    return false;
  }
  
  // Check exact matches first
  if (MEDICATION_NAME_FIELD_KEYS.includes(lowerKey)) {
    return true;
  }
  
  // Check for numbered medication name patterns: medication_1_name, medication_1_medication_name, medication_1
  // But only if it ends with name or is just the medication number (medication_1, medication_2)
  const numberedMedPattern = /^medication_\d+(_name|_medication_name)?$/;
  if (numberedMedPattern.test(lowerKey)) {
    return true;
  }
  
  // Check if field key ends with common medication name suffixes
  if (lowerKey === 'medication' || lowerKey === 'drug' || lowerKey === 'medicine' || lowerKey === 'rx') {
    return true;
  }
  
  return false;
};

export function FieldConfirmationCard({
  fieldKey,
  field,
  isActive,
  onUpdate,
  onDelete,
  onVerify,
  onClick
}: FieldConfirmationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);
  const [drugSuggestions, setDrugSuggestions] = useState<DrugSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLowConfidence = field.confidence < 0.7;
  const isMediumConfidence = field.confidence >= 0.7 && field.confidence < 0.9;
  const isHighConfidence = field.confidence >= 0.9;

  const needsReview = isLowConfidence && !field.verified;
  
  // Check if this is a medication NAME field (should show drug suggestions)
  const isMedicationField = isMedicationNameField(fieldKey);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Fetch drug suggestions when editing medication fields
  const fetchDrugSuggestions = useCallback(async (searchTerm: string) => {
    if (!isMedicationField || searchTerm.length < 2) {
      setDrugSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('drug-lookup', {
        body: { 
          drugName: searchTerm,
          searchType: 'suggestions'
        }
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setDrugSuggestions(data.suggestions.slice(0, 8));
        setShowSuggestions(true);
      } else {
        setDrugSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching drug suggestions:', error);
      setDrugSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [isMedicationField]);

  // Debounced suggestion fetch
  useEffect(() => {
    if (isEditing && isMedicationField && editValue.length >= 2) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      suggestionTimeoutRef.current = setTimeout(() => {
        fetchDrugSuggestions(editValue);
      }, 300);
    } else {
      setDrugSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [editValue, isEditing, isMedicationField, fetchDrugSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (editValue !== field.value) {
      onUpdate(editValue);
    }
    setIsEditing(false);
    setShowSuggestions(false);
    setDrugSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(field.value);
      setIsEditing(false);
      setShowSuggestions(false);
    }
  };

  const handleReset = () => {
    if (field.originalValue) {
      setEditValue(field.originalValue);
      onUpdate(field.originalValue);
    }
  };

  const selectSuggestion = (suggestion: DrugSuggestion) => {
    // Build the best name from available data
    let selectedName = suggestion.name;
    if (suggestion.brandName && suggestion.strength) {
      selectedName = `${suggestion.brandName} ${suggestion.strength}`;
    } else if (suggestion.genericName && suggestion.strength) {
      selectedName = `${suggestion.genericName} ${suggestion.strength}`;
    } else if (suggestion.brandName) {
      selectedName = suggestion.brandName;
    } else if (suggestion.genericName) {
      selectedName = suggestion.genericName;
    }

    setEditValue(selectedName);
    onUpdate(selectedName);
    setIsEditing(false);
    setShowSuggestions(false);
    setDrugSuggestions([]);
  };

  const getSourceIcon = () => {
    switch (field.source) {
      case 'ocr': return <Eye className="h-3 w-3" />;
      case 'vision_ai': return <Sparkles className="h-3 w-3" />;
      case 'nlp': return <Brain className="h-3 w-3" />;
      default: return null;
    }
  };

  const getConfidenceColor = () => {
    if (isHighConfidence) return 'bg-green-500';
    if (isMediumConfidence) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative p-3 rounded-lg border transition-all cursor-pointer",
        isActive && "ring-2 ring-primary border-primary",
        needsReview && "border-red-300 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800",
        field.verified && "border-green-300 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800",
        !isActive && !needsReview && !field.verified && "hover:border-primary/50 hover:bg-muted/30"
      )}
      onClick={onClick}
    >
      {/* Confidence Indicator Bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
        getConfidenceColor()
      )} />

      <div className="flex items-start gap-3 pl-2">
        {/* Verification Checkbox (for low confidence) */}
        {isLowConfidence && (
          <div className="pt-0.5">
            <Checkbox
              checked={field.verified}
              onCheckedChange={() => onVerify()}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "border-2",
                field.verified ? "border-green-500" : "border-red-400"
              )}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Field Name + Source + Medication Indicator */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {formatFieldName(fieldKey)}
            </span>
            <Badge variant="outline" className="text-[10px] gap-1 h-4">
              {getSourceIcon()}
              {field.source.toUpperCase()}
            </Badge>
            {isMedicationField && (
              <Badge variant="outline" className="text-[10px] gap-1 h-4 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                <Pill className="h-2.5 w-2.5" />
                Drug
              </Badge>
            )}
          </div>

          {/* Field Value (Editable with Suggestions) */}
          {isEditing ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => {
                    // Delay to allow suggestion click
                    setTimeout(() => {
                      if (!showSuggestions) {
                        handleSave();
                      }
                    }, 150);
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 text-sm"
                  placeholder={isMedicationField ? "Type to search medications..." : undefined}
                />
                {isLoadingSuggestions && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground absolute right-2" />
                )}
              </div>

              {/* Drug Suggestions Dropdown */}
              {showSuggestions && drugSuggestions.length > 0 && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ScrollArea className="max-h-48">
                    <div className="p-1">
                      {drugSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.name}-${index}`}
                          className="w-full text-left px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSuggestion(suggestion);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Pill className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {suggestion.brandName || suggestion.genericName || suggestion.name}
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                {suggestion.genericName && suggestion.brandName && (
                                  <span>({suggestion.genericName})</span>
                                )}
                                {suggestion.strength && (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {suggestion.strength}
                                  </span>
                                )}
                                {suggestion.dosageForm && (
                                  <span>• {suggestion.dosageForm}</span>
                                )}
                              </div>
                              {suggestion.manufacturer && (
                                <div className="text-[10px] text-muted-foreground/70 truncate">
                                  {suggestion.manufacturer}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* No suggestions found message for medication fields */}
              {isMedicationField && !isLoadingSuggestions && editValue.length >= 2 && drugSuggestions.length === 0 && showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-center text-sm text-muted-foreground">
                  No matching medications found
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <span className={cn(
                "text-sm font-medium truncate",
                field.originalValue && field.value !== field.originalValue && "text-blue-600"
              )}>
                {field.value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              {field.originalValue && field.value !== field.originalValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  title="Reset to original"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Delete field"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Original Value (if edited) */}
          {field.originalValue && field.value !== field.originalValue && (
            <div className="text-[10px] text-muted-foreground mt-1">
              Original: <span className="line-through">{field.originalValue}</span>
            </div>
          )}

          {/* Low confidence hint for medication fields */}
          {isMedicationField && isLowConfidence && !field.verified && !isEditing && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Pill className="h-3 w-3" />
              Click edit for drug name suggestions
            </div>
          )}
        </div>

        {/* Right Side: Confidence Badge + Status */}
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isHighConfidence && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
              isMediumConfidence && "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
              isLowConfidence && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {Math.round(field.confidence * 100)}%
          </Badge>

          {/* Status Icon */}
          {field.verified ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : isLowConfidence ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FieldConfirmationCard;
