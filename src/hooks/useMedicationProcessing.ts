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

// Standard SIG codes for prescription parsing
export interface SigParsed {
  dose: { amount: number; unit: string; display: string };
  route: { code: string; meaning: string };
  frequency: { code: string; timesPerDay: number; meaning: string };
  duration?: { days: number; display: string };
  conditions?: string[];
  translation: string;
}

// SIG Frequency codes - Comprehensive list
const SIG_FREQUENCY_CODES: Record<string, { timesPerDay: number; meaning: string }> = {
  // Daily frequencies
  'qd': { timesPerDay: 1, meaning: 'once daily' },
  'od': { timesPerDay: 1, meaning: 'once daily' },
  'dy': { timesPerDay: 1, meaning: 'daily' },
  'bid': { timesPerDay: 2, meaning: 'twice daily' },
  'tid': { timesPerDay: 3, meaning: 'three times daily' },
  'tqid': { timesPerDay: 3.5, meaning: 'three or four times daily' },
  'qid': { timesPerDay: 4, meaning: 'four times daily' },
  'qbid': { timesPerDay: 1.5, meaning: 'one or two times daily' },
  'btid': { timesPerDay: 2.5, meaning: 'two or three times daily' },
  
  // Hourly frequencies
  'q1h': { timesPerDay: 24, meaning: 'every hour' },
  'q2h': { timesPerDay: 12, meaning: 'every 2 hours' },
  'q2-3h': { timesPerDay: 8, meaning: 'every 2-3 hours' },
  'q2-4h': { timesPerDay: 6, meaning: 'every 2-4 hours' },
  'q3h': { timesPerDay: 8, meaning: 'every 3 hours' },
  'q4h': { timesPerDay: 6, meaning: 'every 4 hours' },
  'q4-6h': { timesPerDay: 5, meaning: 'every 4-6 hours' },
  'q6h': { timesPerDay: 4, meaning: 'every 6 hours' },
  'q8h': { timesPerDay: 3, meaning: 'every 8 hours' },
  'q12h': { timesPerDay: 2, meaning: 'every 12 hours' },
  
  // Time-based frequencies
  'qhs': { timesPerDay: 1, meaning: 'at bedtime' },
  'hs': { timesPerDay: 1, meaning: 'at bedtime' },
  'n': { timesPerDay: 1, meaning: 'at night' },
  'qam': { timesPerDay: 1, meaning: 'every morning' },
  'qpm': { timesPerDay: 1, meaning: 'every evening' },
  
  // Other day frequencies
  'qod': { timesPerDay: 0.5, meaning: 'every other day' },
  'q2d': { timesPerDay: 0.5, meaning: 'every second day' },
  
  // Weekly frequencies
  'qw': { timesPerDay: 1/7, meaning: 'once weekly' },
  'biw': { timesPerDay: 2/7, meaning: 'twice weekly' },
  'tiw': { timesPerDay: 3/7, meaning: 'three times weekly' },
  
  // Meal-related frequencies
  'ac': { timesPerDay: 3, meaning: 'before meals' },
  'pc': { timesPerDay: 3, meaning: 'after meals' },
  'cc': { timesPerDay: 3, meaning: 'with meals' },
  'achs': { timesPerDay: 4, meaning: 'before meals and at bedtime' },
  
  // PRN and special
  'prn': { timesPerDay: 0, meaning: 'as needed' },
  'prnf': { timesPerDay: 0, meaning: 'when necessary for' },
  'stat': { timesPerDay: 1, meaning: 'immediately (at once)' },
  'uf': { timesPerDay: 1, meaning: 'until finished' },
};

// SIG Route codes - Comprehensive list
const SIG_ROUTE_CODES: Record<string, string> = {
  // Oral routes
  'po': 'by mouth (oral)',
  'sl': 'under the tongue (sublingual)',
  'buc': 'buccal (inside cheek)',
  
  // Rectal/Vaginal routes
  'pr': 'rectally',
  'r': 'into the rectum',
  'pv': 'vaginally',
  'v': 'into the vagina',
  'supp': 'suppository',
  
  // Injection routes
  'im': 'intramuscular injection',
  'iv': 'intravenous injection',
  'sc': 'subcutaneous injection',
  'sq': 'subcutaneous injection',
  'subq': 'subcutaneous injection',
  'id': 'intradermal injection',
  'inj': 'inject',
  'medap': 'injection administered by pharmacist',
  
  // Topical routes
  'top': 'topically (on skin)',
  'aa': 'to affected area',
  'app': 'apply',
  'apl': 'applicatorful',
  'pl': 'place',
  'td': 'transdermal',
  
  // Inhalation routes
  'inh': 'by inhalation',
  'i': 'inhale',
  'neb': 'by nebulizer',
  'pf': 'puffs',
  
  // Eye routes
  'ou': 'both eyes',
  'od': 'right eye',
  'os': 'left eye',
  'gtt': 'drop(s)',
  'gtts': 'drops',
  
  // Ear routes
  'au': 'both ears',
  'ad': 'right ear',
  'as': 'left ear',
  'ien': 'in each nostril',
  'al': 'in the left ear',
  
  // Tube routes
  'ng': 'nasogastric tube',
  'peg': 'percutaneous endoscopic gastrostomy',
  'ir': 'insert',
  'ins': 'instill',
};

// SIG Condition and modifier codes - Comprehensive list
const SIG_CONDITION_CODES: Record<string, string> = {
  // Meal-related conditions
  'ac': 'before meals',
  'pc': 'after meals',
  'cc': 'with meals',
  'cf': 'with food',
  'c': 'with',
  's': 'without',
  
  // Timing conditions
  'hs': 'at bedtime',
  'n': 'at night',
  'stat': 'immediately',
  
  // PRN conditions
  'prn': 'as needed',
  'prnf': 'when necessary for',
  'sos': 'if needed',
  'ud': 'as directed',
  'ut dict': 'as directed',
  
  // Quantity modifiers
  'ss': 'one half',
  'aa': 'of each',
  'admx': 'to a maximum of',
  
  // Preparation instructions
  'sw': 'shake well',
  'cr': 'crush',
  'dr': 'drink',
  'fl': 'fluids',
  'aq': 'water',
  'ju': 'juice',
  'sp': 'sparingly',
  
  // Health conditions
  'pa': 'pain',
  'fe': 'fever',
  'hd': 'headache',
  'bp': 'blood pressure',
  'hr': 'heart',
  'ar': 'arthritis',
  'di': 'diarrhea',
  'con': 'constipation',
  'bm': 'bowel movement',
  'sb': 'shortness of breath',
  'inf': 'inflammation',
  'ra': 'rash',
  'ci': 'circulation',
  
  // Other
  'npo': 'nothing by mouth',
  'medcp': 'consultation provided by',
  'medra': 'refer to adaptation form',
  'medro': 'refer to opinions form',
};

// SIG Dose form codes
const SIG_DOSE_FORMS: Record<string, string> = {
  // Solid forms
  'tab': 'tablet',
  'tabs': 'tablets',
  'tbl': 'tablespoon',
  'tbls': 'tablespoonfuls',
  'tsp': 'teaspoon',
  'tsps': 'teaspoonfuls',
  'cap': 'capsule',
  'caps': 'capsules',
  'pf': 'puffs',
  'supp': 'suppository',
  
  // Liquid forms
  'gtt': 'drop',
  'gtts': 'drops',
  'ml': 'milliliter',
  
  // Time units
  'd': 'day',
  'ds': 'days',
  'h': 'hour',
  'hrs': 'hours',
  
  // Instructions
  't': 'take',
  'g': 'give',
  'f': 'for',
  'q': 'every',
};

// Frequency patterns for quantity calculation (comprehensive)
const FREQUENCY_PATTERNS: Record<string, { timesPerDay: number; pattern: RegExp }> = {
  // Daily patterns
  'once daily': { timesPerDay: 1, pattern: /once\s*(a\s*)?daily|qd|q\.?d\.?|every\s*day|daily|od|dy/i },
  'twice daily': { timesPerDay: 2, pattern: /twice\s*(a\s*)?daily|bid|b\.?i\.?d\.?|every\s*12\s*hours|q12h/i },
  'three times daily': { timesPerDay: 3, pattern: /three\s*times\s*(a\s*)?daily|tid|t\.?i\.?d\.?|every\s*8\s*hours|q8h/i },
  'three or four times daily': { timesPerDay: 3.5, pattern: /three\s*(or|to)\s*four\s*times|tqid/i },
  'four times daily': { timesPerDay: 4, pattern: /four\s*times\s*(a\s*)?daily|qid|q\.?i\.?d\.?|every\s*6\s*hours|q6h/i },
  'one or two times daily': { timesPerDay: 1.5, pattern: /one\s*(or|to)\s*two\s*times|qbid/i },
  'two or three times daily': { timesPerDay: 2.5, pattern: /two\s*(or|to)\s*three\s*times|btid/i },
  
  // Hourly patterns
  'every hour': { timesPerDay: 24, pattern: /every\s*hour|q1h|every\s*1\s*hour/i },
  'every 2 hours': { timesPerDay: 12, pattern: /every\s*2\s*hours|q2h/i },
  'every 2-3 hours': { timesPerDay: 8, pattern: /every\s*2[\s-]?(?:to)?[\s-]?3\s*hours|q2-3h/i },
  'every 2-4 hours': { timesPerDay: 6, pattern: /every\s*2[\s-]?(?:to)?[\s-]?4\s*hours|q2-4h/i },
  'every 3 hours': { timesPerDay: 8, pattern: /every\s*3\s*hours|q3h/i },
  'every 4 hours': { timesPerDay: 6, pattern: /every\s*4\s*hours|q4h/i },
  'every 4-6 hours': { timesPerDay: 5, pattern: /every\s*4[\s-]?(?:to)?[\s-]?6\s*hours|q4-6h/i },
  'every 6 hours': { timesPerDay: 4, pattern: /every\s*6\s*hours|q6h/i },
  'every 8 hours': { timesPerDay: 3, pattern: /every\s*8\s*hours|q8h/i },
  'every 12 hours': { timesPerDay: 2, pattern: /every\s*12\s*hours|q12h/i },
  
  // Day-based patterns
  'every other day': { timesPerDay: 0.5, pattern: /every\s*other\s*day|qod|q\.?o\.?d\.?|q2d|every\s*second\s*day/i },
  
  // Weekly patterns
  'weekly': { timesPerDay: 1/7, pattern: /once\s*weekly|weekly|every\s*week|qw/i },
  'twice weekly': { timesPerDay: 2/7, pattern: /twice\s*weekly|biw|b\.?i\.?w\.?/i },
  'three times weekly': { timesPerDay: 3/7, pattern: /three\s*times\s*weekly|tiw|t\.?i\.?w\.?/i },
  
  // Time-based patterns
  'at bedtime': { timesPerDay: 1, pattern: /at\s*bedtime|hs|h\.?s\.?|qhs|before\s*bed|at\s*night/i },
  'in the morning': { timesPerDay: 1, pattern: /in\s*the\s*morning|qam|each\s*morning|every\s*morning/i },
  'in the evening': { timesPerDay: 1, pattern: /in\s*the\s*evening|qpm|each\s*evening|every\s*evening/i },
  'at night': { timesPerDay: 1, pattern: /at\s*night|night|n\b/i },
  
  // Meal-related patterns
  'before meals': { timesPerDay: 3, pattern: /before\s*meals|ac|a\.?c\.?/i },
  'after meals': { timesPerDay: 3, pattern: /after\s*meals|pc|p\.?c\.?/i },
  'with meals': { timesPerDay: 3, pattern: /with\s*meals|with\s*food|cc|c\.?c\.?|cf/i },
  
  // Special patterns
  'as needed': { timesPerDay: 0, pattern: /as\s*needed|when\s*required|prn|p\.?r\.?n\.?|prnf/i },
  'immediately': { timesPerDay: 1, pattern: /immediately|stat|at\s*once/i },
  'until finished': { timesPerDay: 1, pattern: /until\s*finished|uf/i },
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
   * Parse SIG codes from prescription instructions
   * Converts abbreviations like "1 tab po bid prn" to structured data and human-readable translation
   */
  const parseSig = useCallback((sigText: string): SigParsed => {
    const normalizedSig = sigText.toLowerCase().trim();
    const conditions: string[] = [];
    
    // Parse dose (e.g., "1 tablet", "2 caps", "1-2 tabs")
    const doseMatch = normalizedSig.match(/(\d+(?:-\d+)?)\s*(tab(?:let)?s?|cap(?:sule)?s?|pill?s?|ml|mg|gtt|gtts|drop?s?|puff?s?|spray?s?|patch(?:es)?)/i);
    const dose = doseMatch 
      ? { amount: parseInt(doseMatch[1]), unit: doseMatch[2], display: `${doseMatch[1]} ${doseMatch[2]}` }
      : { amount: 1, unit: 'tablet', display: '1 tablet' };

    // Parse route
    let route = { code: 'po', meaning: 'by mouth (oral)' };
    for (const [code, meaning] of Object.entries(SIG_ROUTE_CODES)) {
      const routePattern = new RegExp(`\\b${code}\\b`, 'i');
      if (routePattern.test(normalizedSig)) {
        route = { code, meaning };
        break;
      }
    }

    // Parse frequency
    let frequency = { code: 'qd', timesPerDay: 1, meaning: 'once daily' };
    for (const [code, data] of Object.entries(SIG_FREQUENCY_CODES)) {
      const freqPattern = new RegExp(`\\b${code}\\b`, 'i');
      if (freqPattern.test(normalizedSig)) {
        frequency = { code, ...data };
        break;
      }
    }
    // Also check natural language patterns
    for (const [name, { timesPerDay, pattern }] of Object.entries(FREQUENCY_PATTERNS)) {
      if (pattern.test(normalizedSig)) {
        frequency = { code: name.replace(/\s+/g, '-'), timesPerDay, meaning: name };
        break;
      }
    }

    // Parse duration (e.g., "for 10 days", "x 7 days", "for 2 weeks")
    let duration: { days: number; display: string } | undefined;
    const durationMatch = normalizedSig.match(/(?:for|x)\s*(\d+)\s*(day?s?|week?s?|month?s?)/i);
    if (durationMatch) {
      let days = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('week')) days *= 7;
      if (unit.startsWith('month')) days *= 30;
      duration = { days, display: `${durationMatch[1]} ${durationMatch[2]}` };
    }

    // Parse conditions (e.g., "with food", "at bedtime", "as needed for pain")
    if (/with\s*food|with\s*meals|cc/i.test(normalizedSig)) conditions.push('with food');
    if (/at\s*bedtime|hs\b/i.test(normalizedSig)) conditions.push('at bedtime');
    if (/as\s*needed|prn/i.test(normalizedSig)) {
      const prnMatch = normalizedSig.match(/(?:as\s*needed|prn)\s*(?:for\s+)?(\w+(?:\s+\w+)?)?/i);
      conditions.push(prnMatch?.[1] ? `as needed for ${prnMatch[1]}` : 'as needed');
    }
    if (/before\s*meals|ac\b/i.test(normalizedSig)) conditions.push('before meals');
    if (/after\s*meals|pc\b/i.test(normalizedSig)) conditions.push('after meals');
    if (/on\s*empty\s*stomach|npo/i.test(normalizedSig)) conditions.push('on empty stomach');
    if (/as\s*directed|ud\b/i.test(normalizedSig)) conditions.push('as directed');

    // Build human-readable translation
    const translationParts = [`Take ${dose.display} ${route.meaning}`];
    if (frequency.code !== 'stat') translationParts.push(frequency.meaning);
    if (duration) translationParts.push(`for ${duration.display}`);
    if (conditions.length > 0) translationParts.push(conditions.join(', '));

    return {
      dose,
      route,
      frequency,
      duration,
      conditions: conditions.length > 0 ? conditions : undefined,
      translation: translationParts.join(' ')
    };
  }, []);

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
    validateMedicationOrder,
    parseSig
  };
}

// Export SIG code constants for external use
export { SIG_FREQUENCY_CODES, SIG_ROUTE_CODES, SIG_CONDITION_CODES };
