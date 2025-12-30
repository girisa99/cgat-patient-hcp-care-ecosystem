/**
 * PatientInfoTab Component
 * Displays extracted patient demographics and information organized by sections
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Users,
  FileText,
  FileCheck,
  Stethoscope,
  Shield,
  Pill,
  PenTool
} from 'lucide-react';

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

export default function PatientInfoTab({ processingResult }: PatientInfoTabProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Patient Information
        </CardTitle>
        <CardDescription>
          Extracted patient demographics and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processingResult && processingResult.stage === 'complete' ? (
          <div className="space-y-6">
            {processingResult.imageUrl && (
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                <img src={processingResult.imageUrl} alt="Document" className="max-h-48 w-auto rounded border" />
              </div>
            )}
            
            {/* Organized sections */}
            <div className="space-y-4">
              {organizeFieldsBySections().map(section => (
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
                            <p className="font-medium text-sm">{field?.value || '—'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No patient document processed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
