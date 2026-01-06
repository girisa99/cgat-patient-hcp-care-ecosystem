/**
 * Field Confirmation Card
 * Individual field display with confidence badge, inline editing, and verification
 */

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  AlertTriangle,
  Edit2,
  Eye,
  Brain,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedField } from './SmartDocumentStudio';

interface FieldConfirmationCardProps {
  fieldKey: string;
  field: ExtractedField;
  isActive: boolean;
  onUpdate: (value: string) => void;
  onVerify: () => void;
  onClick: () => void;
}

export function FieldConfirmationCard({
  fieldKey,
  field,
  isActive,
  onUpdate,
  onVerify,
  onClick
}: FieldConfirmationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLowConfidence = field.confidence < 0.7;
  const isMediumConfidence = field.confidence >= 0.7 && field.confidence < 0.9;
  const isHighConfidence = field.confidence >= 0.9;

  const needsReview = isLowConfidence && !field.verified;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== field.value) {
      onUpdate(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(field.value);
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    if (field.originalValue) {
      setEditValue(field.originalValue);
      onUpdate(field.originalValue);
    }
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
          {/* Field Name + Source */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {formatFieldName(fieldKey)}
            </span>
            <Badge variant="outline" className="text-[10px] gap-1 h-4">
              {getSourceIcon()}
              {field.source.toUpperCase()}
            </Badge>
          </div>

          {/* Field Value (Editable) */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-sm"
              />
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
            </div>
          )}

          {/* Original Value (if edited) */}
          {field.originalValue && field.value !== field.originalValue && (
            <div className="text-[10px] text-muted-foreground mt-1">
              Original: <span className="line-through">{field.originalValue}</span>
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
