/**
 * Patient Info Verification Panel
 * Shows extracted patient information in sections matching the form layout
 * Includes document image preview and signature detection
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText, 
  PenTool, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormMapping, DocumentJob } from '@/hooks/useDocumentProcessing';

interface PatientInfoVerificationPanelProps {
  job: DocumentJob;
  formMapping: FormMapping | null;
  className?: string;
}

// Define field sections matching typical form layout order
// Uses flexible matching to catch common variations
const FIELD_SECTIONS = [
  {
    id: 'patient_demographics',
    title: 'Patient Demographics',
    icon: User,
    patterns: ['patient_name', 'first_name', 'last_name', 'middle_name', 'dob', 'date_of_birth', 'patient_dob', 'gender', 'sex', 'ssn', 'social_security', 'patient_id', 'mrn', 'medical_record', 'age', 'birth', 'name']
  },
  {
    id: 'contact_info',
    title: 'Contact Information',
    icon: Phone,
    patterns: ['phone', 'mobile', 'cell', 'telephone', 'tel', 'email', 'contact', 'fax']
  },
  {
    id: 'address',
    title: 'Address',
    icon: MapPin,
    patterns: ['address', 'street', 'city', 'state', 'zip', 'postal', 'country', 'apt', 'suite', 'unit', 'county']
  },
  {
    id: 'emergency_contact',
    title: 'Emergency Contact',
    icon: AlertTriangle,
    patterns: ['emergency', 'next_of_kin', 'kin', 'relationship', 'guardian', 'parent', 'spouse']
  },
  {
    id: 'insurance',
    title: 'Insurance Information',
    icon: Shield,
    patterns: ['insurance', 'member_id', 'group', 'policy', 'subscriber', 'bin', 'pcn', 'rxgrp', 'payer', 'carrier', 'plan', 'coverage', 'copay', 'deductible', 'authorization']
  },
  {
    id: 'medical_history',
    title: 'Medical History',
    icon: FileText,
    patterns: ['allerg', 'medication', 'condition', 'diagnosis', 'physician', 'doctor', 'provider', 'history', 'illness', 'surgery', 'treatment', 'symptom']
  },
  {
    id: 'consent_signatures',
    title: 'Consent & Signatures',
    icon: PenTool,
    patterns: ['consent', 'signature', 'sign', 'hipaa', 'authorization', 'agreement', 'acknowledge', 'date_signed', 'witness']
  }
];

// Check if a field key matches a section's patterns
const fieldMatchesSection = (fieldKey: string, patterns: string[]): boolean => {
  const normalizedKey = fieldKey.toLowerCase().replace(/[-_\s]/g, '');
  return patterns.some(pattern => {
    const normalizedPattern = pattern.toLowerCase().replace(/[-_\s]/g, '');
    return normalizedKey.includes(normalizedPattern) || normalizedPattern.includes(normalizedKey);
  });
};

// Format field name for display
const formatFieldName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Get confidence color
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-500/10';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-500/10';
  return 'text-red-600 bg-red-500/10';
};

// Get source badge
const getSourceBadge = (source: string) => {
  const isVisionAI = source === 'vision_ai' || source === 'gemini_vision_ai' || source === 'nlp' || source === 'NLP';
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] h-4",
        isVisionAI ? "border-purple-500 bg-purple-500/10 text-purple-600" : "border-blue-500 bg-blue-500/10 text-blue-600"
      )}
    >
      {isVisionAI ? '🤖 Vision AI' : '📷 OCR'}
    </Badge>
  );
};

export const PatientInfoVerificationPanel: React.FC<PatientInfoVerificationPanelProps> = ({
  job,
  formMapping,
  className
}) => {
  // Build proper image source - now supports full data URL directly
  const getImageSrc = () => {
    // image_base64 now stores the full data URL (data:mime/type;base64,...)
    if (job.image_base64) {
      return job.image_base64;
    }
    // Fallback to image_url if available
    return job.image_url || null;
  };
  
  const imageSrc = getImageSrc();
  console.log('[PatientInfoVerificationPanel] Image source available:', !!imageSrc, 'from:', imageSrc ? 'base64/url' : 'none');
  
  const signatures = job.extracted_metadata?.signatures || [];
  const detectedSignatures = signatures.filter(s => s.detected);

  // Get all form mapping fields (excluding internal fields)
  const allFields = formMapping 
    ? Object.entries(formMapping)
        .filter(([key, value]) => 
          value?.value && 
          !key.startsWith('_') &&
          !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key)
        )
        .map(([key, value]) => ({ key, ...value }))
    : [];

  // Organize fields by sections using pattern matching
  const usedFieldKeys = new Set<string>();
  
  const organizedSections = FIELD_SECTIONS.map(section => {
    const sectionFields = allFields
      .filter(field => {
        if (usedFieldKeys.has(field.key)) return false;
        if (fieldMatchesSection(field.key, section.patterns)) {
          usedFieldKeys.add(field.key);
          return true;
        }
        return false;
      });

    return {
      ...section,
      fields: sectionFields
    };
  }).filter(section => section.fields.length > 0);

  // Get unmapped fields (fields not assigned to any section)
  const unmappedFields = allFields.filter(field => !usedFieldKeys.has(field.key));

  // Calculate accurate stats
  const totalFields = allFields.length;
  const verifiedCount = allFields.filter(f => f.verified).length;
  const lowConfidenceCount = allFields.filter(f => f.confidence < 0.7).length;
  const highConfidenceCount = totalFields - lowConfidenceCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Document Image Preview */}
      {imageSrc ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Document Preview
              {job.document_type && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {job.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="relative aspect-[4/3] max-h-[300px] bg-muted/30 rounded-lg overflow-hidden border">
              <img 
                src={imageSrc}
                alt={job.file_name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', imageSrc?.substring(0, 50));
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{job.file_name}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No image preview available</p>
            <p className="text-xs text-muted-foreground">{job.file_name}</p>
          </CardContent>
        </Card>
      )}

      {/* Signature Detection Alert */}
      {detectedSignatures.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <PenTool className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-700">
                  {detectedSignatures.length} Signature{detectedSignatures.length > 1 ? 's' : ''} Detected
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detectedSignatures.map((sig, idx) => (
                    <Badge key={sig.id || idx} variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      {sig.signedBy || `Signature ${idx + 1}`}
                      {sig.signedDate && ` - ${sig.signedDate}`}
                      <span className="ml-1 text-muted-foreground">
                        ({Math.round(sig.confidence * 100)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No signatures warning */}
      {signatures.length > 0 && detectedSignatures.length === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-700">
                Signature areas detected but no valid signatures found. Manual verification required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organized Field Sections */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {organizedSections.map((section) => {
            const IconComponent = section.icon;
            const verifiedCount = section.fields.filter(f => f.verified).length;
            const lowConfidenceCount = section.fields.filter(f => f.confidence < 0.7).length;

            return (
              <Card key={section.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {section.fields.length} fields
                      </Badge>
                      {verifiedCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-green-500 bg-green-500/10 text-green-600">
                          {verifiedCount} verified
                        </Badge>
                      )}
                      {lowConfidenceCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-amber-500 bg-amber-500/10 text-amber-600">
                          {lowConfidenceCount} review
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map((field) => (
                      <div 
                        key={field.key}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          field.verified 
                            ? "border-green-500/30 bg-green-500/5" 
                            : field.confidence < 0.7 
                            ? "border-amber-500/30 bg-amber-500/5" 
                            : "border-border bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <label className="text-xs text-muted-foreground">
                            {formatFieldName(field.key)}
                          </label>
                          {field.verified && (
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </div>
                        <p className="font-medium text-sm break-words">{field.value}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getSourceBadge(field.source)}
                          <Badge 
                            variant="secondary" 
                            className={cn("text-[9px]", getConfidenceColor(field.confidence))}
                          >
                            {Math.round(field.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Other Extracted Fields */}
          {unmappedFields.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Other Extracted Fields
                  <Badge variant="secondary" className="text-[10px]">
                    {unmappedFields.length} fields
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unmappedFields.map((field) => (
                    <div 
                      key={field.key}
                      className="p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <label className="text-xs text-muted-foreground block mb-1">
                        {formatFieldName(field.key)}
                      </label>
                      <p className="font-medium text-sm break-words">{field.value}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getSourceBadge(field.source)}
                        <Badge 
                          variant="secondary" 
                          className={cn("text-[9px]", getConfidenceColor(field.confidence))}
                        >
                          {Math.round(field.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {organizedSections.length === 0 && unmappedFields.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No patient information extracted yet</p>
                <p className="text-sm text-muted-foreground">Upload a document to begin extraction</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Extraction Summary - Consistent Stats */}
      {totalFields > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-primary">{totalFields}</p>
              <p className="text-[10px] text-muted-foreground">Total Fields</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <p className="text-lg font-bold text-green-600">{highConfidenceCount}</p>
              <p className="text-[10px] text-muted-foreground">High Confidence</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <p className="text-lg font-bold text-amber-600">{lowConfidenceCount}</p>
              <p className="text-[10px] text-muted-foreground">Needs Review</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{detectedSignatures.length}</p>
              <p className="text-[10px] text-muted-foreground">Signatures</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientInfoVerificationPanel;
