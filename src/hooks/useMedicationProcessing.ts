/**
 * MEDICATION PROCESSING HOOK
 * Handles drug name recognition, NDC/DIN matching, quantity/day supply calculations
 * Integrates with document processing for prescription analysis
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// NDC (National Drug Code) - US Standard
export interface NDCRecord {
  ndc: string;
  drugName: string;
  labelerName: string;
  strength: string;
  dosageForm: string;
  route: string;
  packageDescription: string;
  productType: string;
}

// DIN (Drug Identification Number) - Canada Standard
export interface DINRecord {
  din: string;
  drugName: string;
  manufacturer: string;
  strength: string;
  dosageForm: string;
  route: string;
  status: string;
}

export interface MedicationOrder {
  id: string;
  drugName: string;
  genericName?: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  route: string;
  frequency: string;
  instructions: string;
  quantityPrescribed?: number;
  daysSupply?: number;
  refills?: number;
  ndc?: string;
  din?: string;
  matchConfidence: number;
  calculatedQuantity?: QuantityCalculation;
}

export interface QuantityCalculation {
  dailyDose: number;
  daysSupply: number;
  totalQuantity: number;
  unitOfMeasure: string;
  calculationMethod: string;
  confidence: number;
  warnings?: string[];
}

export interface PrescriptionAnalysis {
  medications: MedicationOrder[];
  prescriber?: {
    name: string;
    npi?: string;
    dea?: string;
  };
  patient?: {
    name: string;
    dob?: string;
  };
  dateWritten?: string;
  pharmacy?: string;
  validationWarnings: string[];
  complianceFlags: ComplianceFlag[];
}

export interface ComplianceFlag {
  type: 'controlled_substance' | 'high_risk' | 'interaction' | 'duplicate' | 'max_dose';
  severity: 'info' | 'warning' | 'error';
  message: string;
  medicationId: string;
}

// Frequency patterns for quantity calculation
const FREQUENCY_PATTERNS: Record<string, { timesPerDay: number; pattern: RegExp }> = {
  'once daily': { timesPerDay: 1, pattern: /once\s*(a\s*)?daily|qd|q\.?d\.?|every\s*day|daily/i },
  'twice daily': { timesPerDay: 2, pattern: /twice\s*(a\s*)?daily|bid|b\.?i\.?d\.?|every\s*12\s*hours|q12h/i },
  'three times daily': { timesPerDay: 3, pattern: /three\s*times\s*(a\s*)?daily|tid|t\.?i\.?d\.?|every\s*8\s*hours|q8h/i },
  'four times daily': { timesPerDay: 4, pattern: /four\s*times\s*(a\s*)?daily|qid|q\.?i\.?d\.?|every\s*6\s*hours|q6h/i },
  'every other day': { timesPerDay: 0.5, pattern: /every\s*other\s*day|qod|q\.?o\.?d\.?/i },
  'weekly': { timesPerDay: 1/7, pattern: /once\s*weekly|weekly|every\s*week|qw/i },
  'as needed': { timesPerDay: 0, pattern: /as\s*needed|prn|p\.?r\.?n\.?/i },
  'at bedtime': { timesPerDay: 1, pattern: /at\s*bedtime|hs|h\.?s\.?|qhs|before\s*bed/i },
  'in the morning': { timesPerDay: 1, pattern: /in\s*the\s*morning|qam|a\.?m\.?/i },
};

// Common drug database (simulated - in production, use FDA/Health Canada APIs)
const COMMON_DRUGS: Record<string, { ndc: string; din?: string; genericName: string; dosageForms: string[] }> = {
  'metformin': { ndc: '00093-7214-01', din: '02242845', genericName: 'Metformin Hydrochloride', dosageForms: ['tablet', 'extended-release tablet'] },
  'lisinopril': { ndc: '00143-1264-01', din: '02230711', genericName: 'Lisinopril', dosageForms: ['tablet'] },
  'atorvastatin': { ndc: '00378-0155-01', din: '02243098', genericName: 'Atorvastatin Calcium', dosageForms: ['tablet'] },
  'omeprazole': { ndc: '00378-5210-01', din: '02230148', genericName: 'Omeprazole', dosageForms: ['capsule', 'delayed-release capsule'] },
  'amlodipine': { ndc: '00378-0083-01', din: '02230808', genericName: 'Amlodipine Besylate', dosageForms: ['tablet'] },
  'levothyroxine': { ndc: '00378-1825-01', din: '02240735', genericName: 'Levothyroxine Sodium', dosageForms: ['tablet'] },
  'gabapentin': { ndc: '00378-0182-01', din: '02239717', genericName: 'Gabapentin', dosageForms: ['capsule', 'tablet'] },
  'sertraline': { ndc: '00378-4187-01', din: '02238283', genericName: 'Sertraline Hydrochloride', dosageForms: ['tablet'] },
  'losartan': { ndc: '00378-0280-01', din: '02239055', genericName: 'Losartan Potassium', dosageForms: ['tablet'] },
  'hydrocodone': { ndc: '00591-0540-01', genericName: 'Hydrocodone/Acetaminophen', dosageForms: ['tablet'] },
  'oxycodone': { ndc: '00591-5502-01', genericName: 'Oxycodone Hydrochloride', dosageForms: ['tablet', 'capsule'] },
  'alprazolam': { ndc: '00378-0814-01', genericName: 'Alprazolam', dosageForms: ['tablet'] },
  'aspirin': { ndc: '00904-2013-60', din: '00406023', genericName: 'Acetylsalicylic Acid', dosageForms: ['tablet', 'enteric-coated tablet'] },
  'ibuprofen': { ndc: '00904-5855-60', din: '02162776', genericName: 'Ibuprofen', dosageForms: ['tablet', 'capsule'] },
};

// Controlled substance schedules
const CONTROLLED_SUBSTANCES: Record<string, string> = {
  'hydrocodone': 'Schedule II',
  'oxycodone': 'Schedule II',
  'alprazolam': 'Schedule IV',
  'lorazepam': 'Schedule IV',
  'diazepam': 'Schedule IV',
  'morphine': 'Schedule II',
  'fentanyl': 'Schedule II',
  'adderall': 'Schedule II',
  'ritalin': 'Schedule II',
};

export function useMedicationProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<PrescriptionAnalysis | null>(null);

  /**
   * Parse medication instructions to calculate quantity and day supply
   */
  const calculateQuantityAndDaySupply = useCallback((
    instructions: string,
    dosagePerTake: number = 1,
    prescribedQuantity?: number,
    prescribedDays?: number
  ): QuantityCalculation => {
    const warnings: string[] = [];
    let timesPerDay = 1;
    let calculationMethod = 'default';

    // Parse frequency from instructions
    for (const [freqName, { timesPerDay: freq, pattern }] of Object.entries(FREQUENCY_PATTERNS)) {
      if (pattern.test(instructions)) {
        timesPerDay = freq;
        calculationMethod = `parsed_frequency_${freqName.replace(/\s+/g, '_')}`;
        break;
      }
    }

    // Handle "as needed" cases
    if (timesPerDay === 0) {
      warnings.push('PRN medication - quantity based on maximum allowed doses');
      timesPerDay = 4; // Assume max 4 times daily for PRN
      calculationMethod = 'prn_max_estimate';
    }

    // Calculate daily dose
    const dailyDose = dosagePerTake * timesPerDay;

    // Calculate days supply or total quantity
    let daysSupply = prescribedDays || 30; // Default 30 days
    let totalQuantity = prescribedQuantity || (dailyDose * daysSupply);

    // If quantity provided, calculate days supply
    if (prescribedQuantity && !prescribedDays) {
      daysSupply = Math.ceil(prescribedQuantity / dailyDose);
      calculationMethod += '_from_quantity';
    }

    // If days supply provided, calculate quantity
    if (prescribedDays && !prescribedQuantity) {
      totalQuantity = Math.ceil(dailyDose * prescribedDays);
      calculationMethod += '_from_days';
    }

    // Validation warnings
    if (daysSupply > 90) {
      warnings.push('Day supply exceeds 90 days - may require prior authorization');
    }

    if (timesPerDay > 4 && !instructions.toLowerCase().includes('as directed')) {
      warnings.push('Frequency exceeds typical dosing - verify with prescriber');
    }

    return {
      dailyDose,
      daysSupply,
      totalQuantity,
      unitOfMeasure: 'units',
      calculationMethod,
      confidence: calculationMethod.includes('parsed') ? 0.9 : 0.7,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }, []);

  /**
   * Match drug name to NDC/DIN codes
   */
  const matchDrugToCode = useCallback((drugName: string): { ndc?: string; din?: string; genericName?: string; confidence: number } => {
    const normalizedName = drugName.toLowerCase().trim();
    
    // Check exact matches first
    if (COMMON_DRUGS[normalizedName]) {
      return {
        ndc: COMMON_DRUGS[normalizedName].ndc,
        din: COMMON_DRUGS[normalizedName].din,
        genericName: COMMON_DRUGS[normalizedName].genericName,
        confidence: 0.95
      };
    }

    // Check partial matches
    for (const [key, value] of Object.entries(COMMON_DRUGS)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return {
          ndc: value.ndc,
          din: value.din,
          genericName: value.genericName,
          confidence: 0.8
        };
      }
    }

    // No match found
    return { confidence: 0 };
  }, []);

  /**
   * Check for controlled substance status
   */
  const checkControlledSubstance = useCallback((drugName: string): ComplianceFlag | null => {
    const normalizedName = drugName.toLowerCase().trim();
    
    for (const [drug, schedule] of Object.entries(CONTROLLED_SUBSTANCES)) {
      if (normalizedName.includes(drug)) {
        return {
          type: 'controlled_substance',
          severity: schedule.includes('II') ? 'warning' : 'info',
          message: `${drugName} is a ${schedule} controlled substance - additional verification required`,
          medicationId: ''
        };
      }
    }
    
    return null;
  }, []);

  /**
   * Analyze a prescription document/text for medications
   */
  const analyzePrescription = useCallback(async (
    prescriptionText: string,
    options?: {
      checkNDC?: boolean;
      checkDIN?: boolean;
      calculateQuantity?: boolean;
    }
  ): Promise<PrescriptionAnalysis> => {
    setIsProcessing(true);
    
    try {
      const medications: MedicationOrder[] = [];
      const complianceFlags: ComplianceFlag[] = [];
      const validationWarnings: string[] = [];

      // Parse medications from text
      const medPatterns = [
        /(?:medication|drug|rx|med)[:\s]*([A-Za-z]+(?:\s+\d+\s*mg)?)[,\s]+(?:take\s+)?(\d+)\s+(?:tablet|capsule|pill)?s?\s+([^,\n]+)/gi,
        /([A-Za-z]+(?:in|ol|ide|ine|ate|one)?)\s+(\d+)\s*mg[,\s]+(\d+)\s+(?:tablet|capsule|pill)?s?\s+([^,\n]+)/gi,
        /([A-Za-z]+)\s+(\d+\s*mg)\s+-\s+([^,\n]+)/gi,
      ];

      // Also check for line-by-line medication entries
      const lines = prescriptionText.split('\n');
      for (const line of lines) {
        // Look for medication patterns
        const medMatch = line.match(/([A-Za-z]+(?:in|ol|ide|ine|ate|one|um|ril|pam)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g))/i);
        if (medMatch) {
          const drugName = medMatch[1];
          const strength = medMatch[2];
          const instructions = line.replace(medMatch[0], '').trim();

          // Match to NDC/DIN
          const codeMatch = matchDrugToCode(drugName);

          // Calculate quantity if instructions present
          let calculatedQuantity: QuantityCalculation | undefined;
          if (options?.calculateQuantity && instructions) {
            calculatedQuantity = calculateQuantityAndDaySupply(instructions);
          }

          // Check for controlled substances
          const controlledFlag = checkControlledSubstance(drugName);
          if (controlledFlag) {
            controlledFlag.medicationId = `med_${medications.length}`;
            complianceFlags.push(controlledFlag);
          }

          medications.push({
            id: `med_${medications.length}`,
            drugName,
            genericName: codeMatch.genericName,
            strength,
            dosageForm: 'tablet',
            route: 'oral',
            frequency: 'as directed',
            instructions: instructions || 'Take as directed',
            ndc: options?.checkNDC ? codeMatch.ndc : undefined,
            din: options?.checkDIN ? codeMatch.din : undefined,
            matchConfidence: codeMatch.confidence,
            calculatedQuantity
          });
        }
      }

      // Parse prescriber info
      const prescriberMatch = prescriptionText.match(/(?:prescriber|physician|doctor|provider)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      const npiMatch = prescriptionText.match(/NPI[:\s#]*(\d{10})/i);
      const deaMatch = prescriptionText.match(/DEA[:\s#]*([A-Z]{2}\d{7})/i);

      // Parse patient info
      const patientMatch = prescriptionText.match(/(?:patient)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      const dobMatch = prescriptionText.match(/(?:DOB|Date\s+of\s+Birth)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);

      const analysis: PrescriptionAnalysis = {
        medications,
        prescriber: prescriberMatch ? {
          name: prescriberMatch[1],
          npi: npiMatch?.[1],
          dea: deaMatch?.[1]
        } : undefined,
        patient: patientMatch ? {
          name: patientMatch[1],
          dob: dobMatch?.[1]
        } : undefined,
        validationWarnings,
        complianceFlags
      };

      setLastAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Prescription analysis error:', error);
      toast.error('Failed to analyze prescription');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [matchDrugToCode, calculateQuantityAndDaySupply, checkControlledSubstance]);

  /**
   * Process medication from document processing results
   */
  const processMedicationFromDocument = useCallback(async (
    documentId: string
  ): Promise<PrescriptionAnalysis | null> => {
    try {
      const { data: doc, error } = await (supabase as any)
        .from('document_processing_jobs')
        .select('extracted_text, extracted_metadata')
        .eq('id', documentId)
        .single();

      if (error || !doc) {
        throw new Error('Document not found');
      }

      const analysis = await analyzePrescription(doc.extracted_text || '', {
        checkNDC: true,
        checkDIN: true,
        calculateQuantity: true
      });

      // Update document with medication analysis
      await (supabase as any)
        .from('document_processing_jobs')
        .update({
          extracted_metadata: {
            ...doc.extracted_metadata,
            medicationAnalysis: analysis
          }
        })
        .eq('id', documentId);

      toast.success(`Found ${analysis.medications.length} medications with NDC/DIN codes`);
      return analysis;
    } catch (error) {
      console.error('Medication processing error:', error);
      toast.error('Failed to process medications from document');
      return null;
    }
  }, [analyzePrescription]);

  /**
   * Validate medication order against drug database
   */
  const validateMedicationOrder = useCallback((order: MedicationOrder): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check NDC format (11 digits in 5-4-2 or 4-4-2 format)
    if (order.ndc && !/^\d{4,5}-\d{4}-\d{2}$/.test(order.ndc) && !/^\d{11}$/.test(order.ndc.replace(/-/g, ''))) {
      errors.push('Invalid NDC format');
    }

    // Check DIN format (8 digits)
    if (order.din && !/^\d{8}$/.test(order.din)) {
      errors.push('Invalid DIN format');
    }

    // Check match confidence
    if (order.matchConfidence < 0.5) {
      warnings.push('Low confidence drug match - manual verification recommended');
    }

    // Check quantity calculation
    if (order.calculatedQuantity) {
      if (order.calculatedQuantity.daysSupply > 90) {
        warnings.push('Day supply exceeds 90 days');
      }
      if (order.calculatedQuantity.warnings) {
        warnings.push(...order.calculatedQuantity.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  return {
    isProcessing,
    lastAnalysis,
    analyzePrescription,
    processMedicationFromDocument,
    calculateQuantityAndDaySupply,
    matchDrugToCode,
    checkControlledSubstance,
    validateMedicationOrder
  };
}
