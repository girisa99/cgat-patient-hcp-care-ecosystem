/**
 * InsuranceTab Component
 * Handles insurance document display, editing, and saving
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Eye, Table2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Healthcare abbreviation expansion dictionary
const HEALTHCARE_ABBREVIATIONS: Record<string, string> = {
  'ded': 'Deductible',
  'deductible': 'Deductible',
  'oop': 'Out of Pocket',
  'oop_max': 'Out of Pocket Maximum',
  'out_of_pocket': 'Out of Pocket',
  'epo': 'Exclusive Provider Organization',
  'hmo': 'Health Maintenance Organization',
  'ppo': 'Preferred Provider Organization',
  'pos': 'Point of Service',
  'pcn': 'Processor Control Number',
  'bin': 'Bank Identification Number',
  'rxgrp': 'Rx Group',
  'rxbin': 'Rx BIN',
  'ndc': 'National Drug Code',
  'npi': 'National Provider Identifier',
  'dea': 'DEA Number',
  'pcp': 'Primary Care Physician',
  'dob': 'Date of Birth',
  'ssn': 'Social Security Number',
  'mrn': 'Medical Record Number',
  'coinsurance': 'Coinsurance',
  'copay': 'Copayment',
  'pa': 'Prior Authorization',
  'eob': 'Explanation of Benefits',
  'id': 'Identification Number',
  'grp': 'Group',
  'eff_date': 'Effective Date',
  'exp_date': 'Expiration Date',
  'member_id': 'Member ID',
  'subscriber_id': 'Subscriber ID',
  'group_number': 'Group Number',
  'plan_type': 'Plan Type',
  'plan_name': 'Plan Name',
  'insurance_name': 'Insurance Company Name',
  'insurance_company': 'Insurance Company',
  'payer_id': 'Payer ID',
};

const expandAbbreviation = (text: string): string => {
  const lowerText = text.toLowerCase().replace(/\s+/g, '_');
  if (HEALTHCARE_ABBREVIATIONS[lowerText]) {
    return HEALTHCARE_ABBREVIATIONS[lowerText];
  }
  for (const [abbr, full] of Object.entries(HEALTHCARE_ABBREVIATIONS)) {
    if (lowerText.includes(abbr) && abbr.length > 2) {
      return text.replace(new RegExp(abbr, 'gi'), full);
    }
  }
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

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

interface InsuranceTabProps {
  processingResult: ProcessingResult | null;
  setProcessingResult: React.Dispatch<React.SetStateAction<ProcessingResult | null>>;
  setProcessingHistory: React.Dispatch<React.SetStateAction<ProcessingResult[]>>;
  setShowSubAgentDialog: (show: boolean) => void;
}

export default function InsuranceTab({
  processingResult,
  setProcessingResult,
  setProcessingHistory,
  setShowSubAgentDialog
}: InsuranceTabProps) {
  const handleSave = async () => {
    if (!processingResult) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save');
        return;
      }
      
      // Save to database
      const { error } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: processingResult.id,
          user_id: user.id,
          document_type: 'insurance',
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
      setProcessingHistory(prev => {
        const existing = prev.find(p => p.id === processingResult.id);
        if (existing) {
          return prev.map(p => p.id === processingResult.id ? processingResult : p);
        }
        return [processingResult, ...prev];
      });
      
      toast.success('Insurance details saved to history');
      
      // Trigger sub-agent recommendation dialog after delay
      setTimeout(() => {
        setShowSubAgentDialog(true);
      }, 500);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save insurance details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Insurance Card Details
        </CardTitle>
        <CardDescription>
          Extracted insurance information with editing capability
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processingResult && processingResult.stage === 'complete' ? (
          <div className="space-y-4">
            {/* Document preview */}
            {processingResult.imageUrl && (
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                <img src={processingResult.imageUrl} alt="Insurance card" className="max-h-48 w-auto rounded border" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-medium">Document Preview</span>
                  </div>
                  <Badge variant="outline">{processingResult.fileName}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verify and edit extracted data, then save to history
                  </p>
                </div>
              </div>
            )}
            
            {/* Editable Insurance Fields */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(processingResult.extractedFields)
                .filter(([key, field]) => field?.value && !key.startsWith('_') && !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key))
                .map(([key, field]) => {
                  const label = expandAbbreviation(key.replace(/_/g, ' '));
                  return (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        value={field?.value || ''}
                        onChange={(e) => {
                          setProcessingResult(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              extractedFields: {
                                ...prev.extractedFields,
                                [key]: {
                                  ...prev.extractedFields[key],
                                  value: e.target.value
                                }
                              }
                            };
                          });
                        }}
                        className="h-8 text-sm"
                      />
                      {field?.confidence && (
                        <Badge variant="secondary" className="text-[9px]">
                          {Math.round(field.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  );
                })}
            </div>
            
            {/* Tables extracted from insurance card */}
            {processingResult.tables && processingResult.tables.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  Coverage Details Tables
                </h4>
                {processingResult.tables.map((table: any, tableIdx: number) => (
                  <div key={tableIdx} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-3 py-2 font-medium text-sm">
                      {table.title || `Coverage Table ${tableIdx + 1}`}
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                      <table className="w-full text-sm">
                        {table.header && (
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              {table.header.map((col: string, idx: number) => (
                                <th key={idx} className="text-left p-2 border-r last:border-r-0 font-medium">
                                  {expandAbbreviation(col)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {table.rows?.map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx} className="border-t hover:bg-muted/30">
                              {row.map((cell: any, cellIdx: number) => (
                                <td key={cellIdx} className="p-2 border-r last:border-r-0">
                                  {cell || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Save to History Button */}
            <Button 
              className="w-full mt-4" 
              onClick={handleSave}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Save to History
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insurance document processed</p>
            <p className="text-sm mt-1">Upload an insurance card to see details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
