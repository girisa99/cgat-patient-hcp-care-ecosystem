/**
 * Extracted Field Card Component
 * Displays an extracted field with edit and delete controls
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Pencil, 
  Trash2, 
  X, 
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtractedFieldCardProps {
  fieldKey: string;
  value: string;
  confidence: number;
  source?: string;
  verified?: boolean;
  usedFallback?: boolean;
  fallbackFrom?: string;
  onEdit?: (key: string, newValue: string) => void;
  onDelete?: (key: string) => void;
  onVerify?: (key: string) => void;
  formatFieldName?: (key: string) => string;
  getSourceBadge?: (source?: string, isDrug?: boolean, usedFallback?: boolean, fallbackFrom?: string) => React.ReactNode;
}

const defaultFormatFieldName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'bg-green-500/20 text-green-700';
  if (confidence >= 0.7) return 'bg-blue-500/20 text-blue-700';
  if (confidence >= 0.5) return 'bg-amber-500/20 text-amber-700';
  return 'bg-red-500/20 text-red-700';
};

export const ExtractedFieldCard: React.FC<ExtractedFieldCardProps> = ({
  fieldKey,
  value,
  confidence,
  source,
  verified = false,
  usedFallback,
  fallbackFrom,
  onEdit,
  onDelete,
  onVerify,
  formatFieldName = defaultFormatFieldName,
  getSourceBadge
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim()) {
      onEdit(fieldKey, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(fieldKey);
    }
    setShowDeleteConfirm(false);
  };

  // Check if this might be a duplicate or unwanted field
  const isDrugField = fieldKey.toLowerCase().includes('medication') || 
                      fieldKey.toLowerCase().includes('drug') ||
                      source?.includes('prescription');

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border transition-all group relative",
        verified 
          ? "border-green-500/30 bg-green-500/5" 
          : confidence < 0.7 
          ? "border-amber-500/30 bg-amber-500/5" 
          : "border-border bg-muted/30",
        showDeleteConfirm && "ring-2 ring-red-500/50"
      )}
    >
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-background/95 rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium mb-3">Delete this field?</p>
            <div className="flex gap-2 justify-center">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Field Header with Controls */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">
            {formatFieldName(fieldKey)}
          </label>
          {verified && (
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          )}
          {isDrugField && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-300 text-blue-600">
              Drug
            </Badge>
          )}
        </div>
        
        {/* Action Buttons - visible on hover or when editing */}
        <div className={cn(
          "flex items-center gap-1 transition-opacity",
          !isEditing && "opacity-0 group-hover:opacity-100"
        )}>
          {!isEditing && onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
              title="Edit value"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {!isEditing && onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete field"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {!isEditing && onVerify && !verified && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-green-600 hover:text-green-700"
              onClick={() => onVerify(fieldKey)}
              title="Mark as verified"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Value Display or Edit Mode */}
      {isEditing ? (
        <div className="flex gap-2 items-center">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600"
            onClick={handleSaveEdit}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleCancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="font-medium text-sm break-words">{value}</p>
      )}

      {/* Source and Confidence Badges */}
      <div className="flex items-center gap-2 mt-2">
        {getSourceBadge ? (
          getSourceBadge(source, isDrugField, usedFallback, fallbackFrom)
        ) : (
          source && (
            <Badge variant="outline" className="text-[9px] px-1">
              {source}
            </Badge>
          )
        )}
        <Badge 
          variant="secondary" 
          className={cn("text-[9px]", getConfidenceColor(confidence))}
        >
          {Math.round(confidence * 100)}%
        </Badge>
      </div>
    </div>
  );
};

export default ExtractedFieldCard;
