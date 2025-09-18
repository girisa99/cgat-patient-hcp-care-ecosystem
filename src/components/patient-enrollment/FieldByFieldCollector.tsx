/**
 * FIELD-BY-FIELD COLLECTOR
 * Structured approach to collecting information one field at a time
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Eye,
  EyeOff,
  Zap,
  Star
} from 'lucide-react';

interface FieldDefinition {
  name: string;
  displayName: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'number' | 'checkbox' | 'tel';
  isRequired: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    customValidator?: (value: any) => boolean | string;
  };
  options?: { value: string; label: string }[];
  skipCondition?: (data: Record<string, any>) => boolean;
}

interface FieldByFieldCollectorProps {
  sectionTitle: string;
  sectionDescription: string;
  fields: FieldDefinition[];
  initialData?: Record<string, any>;
  onFieldUpdate?: (fieldName: string, value: any) => void;
  onSectionComplete?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  showPreview?: boolean;
}

export const FieldByFieldCollector: React.FC<FieldByFieldCollectorProps> = ({
  sectionTitle,
  sectionDescription,
  fields,
  initialData = {},
  onFieldUpdate,
  onSectionComplete,
  onCancel,
  showPreview = true
}) => {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAllFields, setShowAllFields] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Filter out skipped fields
  const activeFields = fields.filter(field => 
    !field.skipCondition || !field.skipCondition(formData)
  );

  const currentField = activeFields[currentFieldIndex];
  const totalFields = activeFields.length;
  const completedFields = activeFields.filter(field => formData[field.name]).length;
  const requiredFields = activeFields.filter(field => field.isRequired);
  const completedRequiredFields = requiredFields.filter(field => formData[field.name]).length;

  const progress = (completedFields / totalFields) * 100;
  const requiredProgress = (completedRequiredFields / requiredFields.length) * 100;

  useEffect(() => {
    // DISABLED auto-advance to prevent navigation issues
    // Users must manually navigate or use Next button
    // This fixes the issue where fields advance too quickly without allowing edits
  }, [formData, currentField, fieldErrors, currentFieldIndex, activeFields.length]);

  const validateField = (field: FieldDefinition, value: any): string | null => {
    if (!value && field.isRequired) {
      return `${field.displayName} is required`;
    }

    if (!value) return null; // Skip validation for optional empty fields

    const { validation } = field;
    if (validation) {
      if (validation.pattern && !validation.pattern.test(value)) {
        return `${field.displayName} format is invalid`;
      }
      
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.displayName} must be at least ${validation.minLength} characters`;
      }
      
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.displayName} must be less than ${validation.maxLength} characters`;
      }
      
      if (validation.customValidator) {
        const result = validation.customValidator(value);
        if (typeof result === 'string') return result;
        if (result === false) return `${field.displayName} is invalid`;
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    const field = activeFields.find(f => f.name === fieldName);
    if (!field) return;

    setIsValidating(true);
    
    // Normalize empty strings to null for DB compatibility
    let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
    
    // NPI validation: only allow exactly 10 digits for DB persistence
    const isNpiField = /npi$/i.test(fieldName);
    if (isNpiField && dbValue) {
      const digits = dbValue.toString().replace(/\D/g, '');
      if (digits.length === 10) {
        dbValue = digits; // Valid NPI
      } else {
        dbValue = value; // Keep for UI, but parent should handle DB skip
      }
    }

    // Update form data (keep original value for UI)
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    
    // Validate field
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
    
    // Notify parent with both UI and DB values
    onFieldUpdate?.(fieldName, dbValue);
    
    setTimeout(() => setIsValidating(false), 300);
  };

  const canAdvance = () => {
    if (!currentField) return false;
    const value = formData[currentField.name];
    const error = fieldErrors[currentField.name];
    return value && !error;
  };

  const canComplete = () => {
    return completedRequiredFields === requiredFields.length;
  };

  const handleNext = () => {
    if (currentFieldIndex < activeFields.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (canComplete()) {
      onSectionComplete?.(formData);
    }
  };

  const renderField = (field: FieldDefinition, isCurrent: boolean = false) => {
    const value = formData[field.name] || '';
    const error = fieldErrors[field.name];
    const isCompleted = !!value && !error;

    const fieldElement = (() => {
      switch (field.type) {
        case 'select':
          return (
            <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        case 'textarea':
          return (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-300' : ''}
            />
          );
        
        default:
          return (
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-300' : ''}
            />
          );
      }
    })();

    return (
      <div key={field.name} className={`space-y-3 ${isCurrent ? 'p-4 border-2 border-primary rounded-lg bg-primary/5' : ''}`}>
        <Label className="flex items-center gap-2">
          {field.displayName}
          {field.isRequired && <span className="text-red-500">*</span>}
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {isCurrent && <Zap className="h-4 w-4 text-primary animate-pulse" />}
        </Label>
        
        {fieldElement}
        
        {field.helperText && (
          <div className="text-xs text-muted-foreground">
            💡 {field.helperText}
          </div>
        )}
        
        {error && (
          <div className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
        
        {isCompleted && !error && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{sectionTitle}</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {sectionDescription}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">
                Field {currentFieldIndex + 1} of {totalFields}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {completedRequiredFields}/{requiredFields.length} Required
              </div>
            </div>
          </CardTitle>
          
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-600">Required Fields</span>
                <span className="text-sm text-red-600">{Math.round(requiredProgress)}%</span>
              </div>
              <Progress value={requiredProgress} className="h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Field Focus */}
      {currentField && !showAllFields && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" />
              Current Field
              {isValidating && <Clock className="h-4 w-4 text-muted-foreground animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(currentField, true)}
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentFieldIndex === 0}
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAllFields(!showAllFields)}
                  size="sm"
                >
                  {showAllFields ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showAllFields ? 'Focus Mode' : 'Show All'}
                </Button>
              </div>
              
              <div className="flex gap-2">
                {currentFieldIndex < activeFields.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canAdvance()}
                    size="sm"
                  >
                    Next Field
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!canComplete()}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Complete Section
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Fields View */}
      {showAllFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-base">All Fields</span>
              <Button
                variant="outline"
                onClick={() => setShowAllFields(false)}
                size="sm"
              >
                <Zap className="h-4 w-4 mr-1" />
                Focus Mode
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFields.map((field, index) => (
              <div key={field.name} className="relative">
                {index === currentFieldIndex && (
                  <div className="absolute -left-2 top-0 w-1 h-full bg-primary rounded-full" />
                )}
                {renderField(field, index === currentFieldIndex)}
              </div>
            ))}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              <Button
                onClick={handleComplete}
                disabled={!canComplete()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Star className="h-4 w-4 mr-1" />
                Complete Section ({completedRequiredFields}/{requiredFields.length} required)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Completion Alert */}
      {canComplete() && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-semibold">🎉 Section ready to complete!</div>
            <div className="text-sm mt-1">
              All required fields have been filled. You can now proceed to the next section.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Missing Fields Alert */}
      {!canComplete() && completedFields > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-semibold">Required fields remaining</div>
            <div className="text-sm mt-1">
              Please complete {requiredFields.length - completedRequiredFields} more required field(s) to proceed.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export type { FieldDefinition };