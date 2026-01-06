/**
 * PatientInfoTab Component
 * Displays extracted patient demographics and information organized by sections
 * With save functionality to persist data
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  FileCheck,
  Stethoscope,
  Shield,
  Pill,
  PenTool,
  Save,
  CheckCircle,
  Edit2
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
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string;
}

interface PatientInfoTabProps {
  processingResult: ProcessingResult | null;
  setProcessingHistory?: (updater: (prev: any[]) => any[]) => void;
  setProcessingResult?: React.Dispatch<React.SetStateAction<any>>;
  onSaveComplete?: () => void;
}

// Define section patterns for grouping fields
const SECTION_PATTERNS: { id: string; title: string; icon: React.ReactNode; patterns: RegExp[] }[] = [
  { id: 'application', title: 'Application Type', icon: <FileCheck className="h-4 w-4" />, patterns: [/^(new_application|re_enrollment|application|enrollment)/i] },
  { id: 'patient', title: 'Patient Information', icon: <Users className="h-4 w-4" />, patterns: [/^patient|^first_name|^last_name|^middle|^dob|^date_of_birth|^gender|^sex|^ssn|^address|^street|^city|^state|^zip|^phone|^mobile|^email|^language|^caregiver/i] },
  { id: 'prescriber', title: 'Prescriber Information', icon: <Stethoscope className="h-4 w-4" />, patterns: [/prescriber|physician|doctor|provider|^npi|^dea|clinic|facility|office|healthcare/i] },
  { id: 'insurance', title: 'Insurance & Coverage', icon: <Shield className="h-4 w-4" />, patterns: [/insurance|medicare|medicaid|coverage|drug_coverage|medical_benefit|military|va_|employer|commercial|member_id|group|bin|pcn|benefits|investigation/i] },
  { id: 'medication', title: 'Medication & Treatment', icon: <Pill className="h-4 w-4" />, patterns: [/medication|drug|dosage|strength|prescription|treatment|requesting|truvada|descovy|copay|coupon|prior_auth/i] },
  { id: 'consent', title: 'Consent & Signatures', icon: <PenTool className="h-4 w-4" />, patterns: [/signature|consent|authorization|date_signed|enrollment_year|pap_|handwritten/i] },
];

export default function PatientInfoTab({ processingResult, setProcessingHistory, setProcessingResult, onSaveComplete }: PatientInfoTabProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Handle field edit
  const handleFieldEdit = (key: string, newValue: string) => {
    if (!setProcessingResult) return;
    setProcessingResult((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        extractedFields: {
          ...prev.extractedFields,
          [key]: {
            ...prev.extractedFields[key],
            value: newValue
          }
        }
      };
    });
  };
  
  // Organize fields by sections
  const organizeFieldsBySections = () => {
    if (!processingResult) return [];
    
    const allFields = Object.entries(processingResult.extractedFields)
      .filter(([key, field]) => field?.value && !key.startsWith('_') && !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key));
    
    const assignedFields = new Set<string>();
    const sectionData: { id: string; title: string; icon: React.ReactNode; fields: [string, any][] }[] = [];
    
    // Assign fields to sections
    for (const section of SECTION_PATTERNS) {
      const sectionFields = allFields.filter(([key]) => {
        if (assignedFields.has(key)) return false;
        const matches = section.patterns.some(p => p.test(key));
        if (matches) assignedFields.add(key);
        return matches;
      });
      if (sectionFields.length > 0) {
        sectionData.push({ ...section, fields: sectionFields });
      }
    }
    
    // Add remaining fields to "Additional Information"
    const remainingFields = allFields.filter(([key]) => !assignedFields.has(key));
    if (remainingFields.length > 0) {
      sectionData.push({ id: 'additional', title: 'Additional Information', icon: <FileText className="h-4 w-4" />, fields: remainingFields });
    }
    
    return sectionData;
  };

  const handleSave = async () => {
    if (!processingResult) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save');
        setIsSaving(false);
        return;
      }
      
      // Save to database
      const { error } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: processingResult.id,
          user_id: user.id,
          document_type: processingResult.documentType || 'patient_info',
          file_name: processingResult.fileName,
          file_path: processingResult.imageUrl || processingResult.fileName,
          status: 'completed',
          progress: 100,
          processing_config: {
            extractedFields: processingResult.extractedFields,
            tables: processingResult.tables || [],
            validationResults: processingResult.validationResults,
            imageUrl: processingResult.imageUrl
          }
        });
      
      if (error) throw error;
      
      // Update local history
      if (setProcessingHistory) {
        setProcessingHistory(prev => {
          const existing = prev.find(p => p.id === processingResult.id);
          if (existing) {
            return prev.map(p => p.id === processingResult.id ? processingResult : p);
          }
          return [processingResult, ...prev];
        });
      }
      
      toast.success('Patient information saved to history');
      
      // Trigger callback to show agent dialog
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save patient information');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if we have extracted fields to display
  const sections = organizeFieldsBySections();
  const hasExtractedFields = sections.length > 0 && sections.some(s => s.fields.length > 0);
  const isProcessing = processingResult && processingResult.stage !== 'complete' && processingResult.progress > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Patient Information
          {isProcessing && (
            <Badge variant="outline" className="ml-2 text-xs">
              Extracting... {processingResult.progress}%
            </Badge>
          )}
          {hasExtractedFields && setProcessingResult && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {isEditing ? 'Done Editing' : 'Edit'}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Extracted patient demographics and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasExtractedFields ? (
          <div className="space-y-6">
            {processingResult?.imageUrl && (
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                <img 
                  src={processingResult.imageUrl} 
                  alt="Document" 
                  className="max-h-48 w-auto rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Organized sections */}
            <div className="space-y-4">
              {sections.map(section => (
                <Card key={section.id} className="border-muted">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-primary">{section.icon}</span>
                      {section.title}
                      <Badge variant="secondary" className="ml-auto text-[10px]">{section.fields.length} fields</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {section.fields.map(([key, field]) => {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return (
                          <div key={key} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                            <Label className="text-xs text-muted-foreground">{label}</Label>
                            {isEditing && setProcessingResult ? (
                              <Input
                                value={field?.value || ''}
                                onChange={(e) => handleFieldEdit(key, e.target.value)}
                                className="h-8 text-sm mt-1"
                              />
                            ) : (
                              <p className="font-medium text-sm">{field?.value || '—'}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Save Button */}
            <Button 
              className="w-full mt-4" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Patient Information
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isProcessing ? 'Extracting patient information...' : 'No patient document processed'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
