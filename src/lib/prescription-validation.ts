/**
 * Prescription Validation Rules and Constants
 * Comprehensive framework for handwriting recognition, RxNorm integration,
 * ISMP dangerous abbreviations, controlled substance validation, and more.
 */

// ============================================================================
// HANDWRITING CHARACTER CONFUSION MATRIX
// ============================================================================

export const CHARACTER_CONFUSIONS = {
  letters: {
    'a': ['o', 'u', 'e', 'q'],
    'n': ['m', 'r', 'v', 'w', 'u'],
    'i': ['l', 't', 'f', 'j', '1', '|'],
    'l': ['i', '1', 't', '|', 'I'],
    'c': ['e', 'o', 'a'],
    'e': ['c', 'o', 'a'],
    'h': ['b', 'k', 'n'],
    'd': ['cl', 'a', 'o'],
    'g': ['q', 'y', '9'],
    's': ['5', 'S', 'z'],
    'z': ['2', 'Z', 's'],
    'o': ['0', 'O', 'a', 'D'],
    'u': ['v', 'n', 'a'],
    'r': ['n', 'v'],
    'm': ['n', 'rn', 'nn'],
    'w': ['vv', 'uu'],
  },
  numbers: {
    '0': ['6', 'O', 'o', 'D'],
    '1': ['7', 'l', 'I', '|'],
    '2': ['Z', 'z'],
    '3': ['8', 'B'],
    '4': ['9', 'q'],
    '5': ['S', 's'],
    '6': ['0', 'b', 'G'],
    '7': ['1', 'T'],
    '8': ['3', 'B', '0'],
    '9': ['4', 'g', 'q'],
  },
  decimalIssues: [
    'Missing leading zero: .5 could be read as 5',
    'Trailing zero: 5.0 could be read as 50',
    'Comma vs period: 1,5 vs 1.5 (European notation)',
    'Faint decimal points mistaken for stray marks',
  ]
};

// ============================================================================
// ISMP DO NOT USE ABBREVIATIONS (CRITICAL SAFETY)
// ============================================================================

export const ISMP_DANGEROUS_ABBREVIATIONS = {
  critical: [
    { abbrev: 'U', risk: 'Mistaken for 0, 4, or cc', replacement: 'unit(s)' },
    { abbrev: 'u', risk: 'Mistaken for 0, 4, or cc', replacement: 'unit(s)' },
    { abbrev: 'IU', risk: 'Mistaken for IV', replacement: 'international unit(s)' },
    { abbrev: 'MS', risk: 'Confused for morphine/magnesium sulfate', replacement: 'morphine sulfate or magnesium sulfate' },
    { abbrev: 'MSO4', risk: 'Confused for MgSO4', replacement: 'morphine sulfate' },
    { abbrev: 'MgSO4', risk: 'Confused for MSO4', replacement: 'magnesium sulfate' },
    { abbrev: 'μg', risk: 'Mistaken for mg', replacement: 'mcg' },
    { abbrev: 'µg', risk: 'Mistaken for mg', replacement: 'mcg' },
  ],
  high: [
    { abbrev: 'Q.D.', risk: 'Mistaken for QID', replacement: 'daily' },
    { abbrev: 'QD', risk: 'Mistaken for QID', replacement: 'daily' },
    { abbrev: 'qd', risk: 'Mistaken for QID', replacement: 'daily' },
    { abbrev: 'Q.O.D.', risk: 'Mistaken for QD or QID', replacement: 'every other day' },
    { abbrev: 'QOD', risk: 'Mistaken for QD or QID', replacement: 'every other day' },
    { abbrev: 'qod', risk: 'Mistaken for QD or QID', replacement: 'every other day' },
    { abbrev: 'cc', risk: 'Mistaken for U (units)', replacement: 'mL' },
    { abbrev: 'OD', risk: 'Right eye confused with once daily', replacement: 'right eye or daily' },
    { abbrev: 'OS', risk: 'Left eye confused with once', replacement: 'left eye' },
    { abbrev: 'OU', risk: 'Both eyes confused with once', replacement: 'both eyes' },
    { abbrev: 'AD', risk: 'Right ear confused with daily', replacement: 'right ear' },
    { abbrev: 'AS', risk: 'Left ear', replacement: 'left ear' },
    { abbrev: 'AU', risk: 'Both ears', replacement: 'both ears' },
  ],
  medium: [
    { abbrev: 'D/C', risk: 'Discharge vs discontinue', replacement: 'discharge or discontinue' },
    { abbrev: 'HS', risk: 'Half-strength vs hora somni', replacement: 'bedtime or half-strength' },
    { abbrev: 'T.I.W.', risk: 'Mistaken for TID or twice weekly', replacement: 'three times weekly' },
    { abbrev: 'SC', risk: 'Mistaken for SL or "5Q"', replacement: 'subcutaneous' },
    { abbrev: 'SQ', risk: 'Mistaken for "5Q"', replacement: 'subcutaneous' },
  ],
  trailingZero: { pattern: /\d+\.0\s*(mg|g|mcg|mL|units?)/gi, risk: '5.0 mg could be read as 50 mg' },
  missingLeadingZero: { pattern: /\.\d+\s*(mg|g|mcg|mL|units?)/gi, risk: '.5 mg could be read as 5 mg' },
};

// ============================================================================
// LOOK-ALIKE SOUND-ALIKE (LASA) DRUG PAIRS
// ============================================================================

export const LASA_DRUG_PAIRS = [
  ['Celebrex', 'Celexa', 'Cerebyx'],
  ['Hydroxyzine', 'Hydralazine', 'Hydroxyurea'],
  ['Clonidine', 'Clonazepam', 'Klonopin'],
  ['Metformin', 'Metronidazole'],
  ['Prednisone', 'Prednisolone'],
  ['Tramadol', 'Trazodone'],
  ['Zantac', 'Xanax', 'Zyrtec'],
  ['Lasix', 'Losec', 'Luvox'],
  ['Lamictal', 'Lamisil', 'Labetalol'],
  ['Flomax', 'Fosamax', 'Volmax'],
  ['Atenolol', 'Albuterol'],
  ['Norvasc', 'Navane'],
  ['Topamax', 'Toprol'],
  ['Prilosec', 'Prozac', 'Plavix'],
  ['Ambien', 'Abilify'],
  ['Humalog', 'Humulin'],
  ['Novolog', 'Novolin'],
  ['Lantus', 'Lente', 'Levemir'],
];

// ============================================================================
// SIG ABBREVIATION MAPPINGS
// ============================================================================

export const SIG_ABBREVIATIONS = {
  frequency: {
    'QD': { meaning: 'once daily', timesPerDay: 1 },
    'qd': { meaning: 'once daily', timesPerDay: 1 },
    'q.d.': { meaning: 'once daily', timesPerDay: 1 },
    'OD': { meaning: 'once daily', timesPerDay: 1 },
    'BID': { meaning: 'twice daily', timesPerDay: 2 },
    'bid': { meaning: 'twice daily', timesPerDay: 2 },
    'b.i.d.': { meaning: 'twice daily', timesPerDay: 2 },
    'TID': { meaning: 'three times daily', timesPerDay: 3 },
    'tid': { meaning: 'three times daily', timesPerDay: 3 },
    't.i.d.': { meaning: 'three times daily', timesPerDay: 3 },
    'QID': { meaning: 'four times daily', timesPerDay: 4 },
    'qid': { meaning: 'four times daily', timesPerDay: 4 },
    'q.i.d.': { meaning: 'four times daily', timesPerDay: 4 },
    'Q4H': { meaning: 'every 4 hours', intervalHours: 4 },
    'q4h': { meaning: 'every 4 hours', intervalHours: 4 },
    'Q6H': { meaning: 'every 6 hours', intervalHours: 6 },
    'q6h': { meaning: 'every 6 hours', intervalHours: 6 },
    'Q8H': { meaning: 'every 8 hours', intervalHours: 8 },
    'q8h': { meaning: 'every 8 hours', intervalHours: 8 },
    'Q12H': { meaning: 'every 12 hours', intervalHours: 12 },
    'q12h': { meaning: 'every 12 hours', intervalHours: 12 },
    'PRN': { meaning: 'as needed', timesPerDay: 0 },
    'prn': { meaning: 'as needed', timesPerDay: 0 },
    'QOD': { meaning: 'every other day', timesPerDay: 0.5, isDangerous: true },
    'qod': { meaning: 'every other day', timesPerDay: 0.5, isDangerous: true },
    'QWK': { meaning: 'weekly', timesPerDay: 1/7 },
    'qwk': { meaning: 'weekly', timesPerDay: 1/7 },
  },
  timing: {
    'AC': { meaning: 'before meals', relationToMeals: 'before' },
    'ac': { meaning: 'before meals', relationToMeals: 'before' },
    'a.c.': { meaning: 'before meals', relationToMeals: 'before' },
    'PC': { meaning: 'after meals', relationToMeals: 'after' },
    'pc': { meaning: 'after meals', relationToMeals: 'after' },
    'p.c.': { meaning: 'after meals', relationToMeals: 'after' },
    'HS': { meaning: 'at bedtime', timeOfDay: 'bedtime' },
    'hs': { meaning: 'at bedtime', timeOfDay: 'bedtime' },
    'h.s.': { meaning: 'at bedtime', timeOfDay: 'bedtime' },
    'AM': { meaning: 'in the morning', timeOfDay: 'morning' },
    'am': { meaning: 'in the morning', timeOfDay: 'morning' },
    'QAM': { meaning: 'every morning', timeOfDay: 'morning' },
    'PM': { meaning: 'in the evening', timeOfDay: 'evening' },
    'pm': { meaning: 'in the evening', timeOfDay: 'evening' },
    'QPM': { meaning: 'every evening', timeOfDay: 'evening' },
    'STAT': { meaning: 'immediately', urgent: true },
    'stat': { meaning: 'immediately', urgent: true },
  },
  route: {
    'PO': { meaning: 'by mouth', normalized: 'oral' },
    'po': { meaning: 'by mouth', normalized: 'oral' },
    'SL': { meaning: 'sublingual', normalized: 'sublingual' },
    'sl': { meaning: 'sublingual', normalized: 'sublingual' },
    'PR': { meaning: 'rectally', normalized: 'rectal' },
    'pr': { meaning: 'rectally', normalized: 'rectal' },
    'PV': { meaning: 'vaginally', normalized: 'vaginal' },
    'TOP': { meaning: 'topically', normalized: 'topical' },
    'top': { meaning: 'topically', normalized: 'topical' },
    'INH': { meaning: 'by inhalation', normalized: 'inhalation' },
    'inh': { meaning: 'by inhalation', normalized: 'inhalation' },
    'IM': { meaning: 'intramuscular', normalized: 'intramuscular' },
    'im': { meaning: 'intramuscular', normalized: 'intramuscular' },
    'IV': { meaning: 'intravenous', normalized: 'intravenous' },
    'iv': { meaning: 'intravenous', normalized: 'intravenous' },
    'SC': { meaning: 'subcutaneous', normalized: 'subcutaneous', isDangerous: true },
    'SQ': { meaning: 'subcutaneous', normalized: 'subcutaneous', isDangerous: true },
    'subQ': { meaning: 'subcutaneous', normalized: 'subcutaneous' },
    'subcut': { meaning: 'subcutaneous', normalized: 'subcutaneous' },
    'ID': { meaning: 'intradermal', normalized: 'intradermal' },
    'IT': { meaning: 'intrathecal', normalized: 'intrathecal' },
    'GTTS': { meaning: 'drops', normalized: 'drops' },
    'gtts': { meaning: 'drops', normalized: 'drops' },
    'gtt': { meaning: 'drops', normalized: 'drops' },
    'NEB': { meaning: 'by nebulizer', normalized: 'nebulizer' },
    'neb': { meaning: 'by nebulizer', normalized: 'nebulizer' },
  },
  doseForms: {
    'tab': 'tablet',
    'tabs': 'tablets',
    'cap': 'capsule',
    'caps': 'capsules',
    'susp': 'suspension',
    'sol': 'solution',
    'soln': 'solution',
    'inj': 'injection',
    'supp': 'suppository',
    'ung': 'ointment',
    'oint': 'ointment',
    'cr': 'cream',
    'crm': 'cream',
    'MDI': 'metered dose inhaler',
    'SR': 'sustained release',
    'XR': 'extended release',
    'ER': 'extended release',
    'LA': 'long acting',
    'CR': 'controlled release',
    'IR': 'immediate release',
    'EC': 'enteric coated',
    'ODT': 'orally disintegrating tablet',
  }
};

// ============================================================================
// CONTROLLED SUBSTANCE SCHEDULES
// ============================================================================

export const CONTROLLED_SUBSTANCE_SCHEDULES = {
  'II': {
    refillsAllowed: 0,
    validityDays: 90,
    requiresManualSignature: true,
    requiresQuantityInWords: true,
    requiresDEA: true,
    examples: ['oxycodone', 'hydrocodone', 'fentanyl', 'morphine', 'amphetamine', 'methylphenidate', 'methadone']
  },
  'IIN': {
    refillsAllowed: 0,
    validityDays: 90,
    requiresManualSignature: true,
    requiresQuantityInWords: true,
    requiresDEA: true,
    isNarcotic: true,
    examples: ['codeine', 'hydromorphone']
  },
  'III': {
    refillsAllowed: 5,
    validityDays: 180,
    requiresDEA: true,
    examples: ['testosterone', 'ketamine', 'buprenorphine']
  },
  'IIIN': {
    refillsAllowed: 5,
    validityDays: 180,
    requiresDEA: true,
    isNarcotic: true,
    examples: ['Tylenol with codeine']
  },
  'IV': {
    refillsAllowed: 5,
    validityDays: 180,
    requiresDEA: true,
    examples: ['benzodiazepines', 'zolpidem', 'tramadol', 'carisoprodol']
  },
  'V': {
    refillsAllowed: 5,
    validityDays: 180,
    requiresDEA: true,
    examples: ['pregabalin', 'some cough syrups with codeine']
  }
};

// ============================================================================
// DEA NUMBER VALIDATION
// ============================================================================

export function validateDEANumber(dea: string): { valid: boolean; schedule?: string; error?: string } {
  if (!dea || dea.length !== 9) {
    return { valid: false, error: 'DEA number must be 9 characters' };
  }

  const firstLetter = dea[0].toUpperCase();
  const validFirstLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'P', 'R', 'S', 'T', 'U', 'X'];
  
  if (!validFirstLetters.includes(firstLetter)) {
    return { valid: false, error: 'Invalid DEA first letter' };
  }

  // Check if second character is a letter
  if (!/[A-Z]/i.test(dea[1])) {
    return { valid: false, error: 'Second character must be a letter' };
  }

  // Validate checksum
  const digits = dea.slice(2).split('').map(Number);
  if (digits.some(isNaN)) {
    return { valid: false, error: 'Last 7 characters must be digits' };
  }

  const sum1 = digits[0] + digits[2] + digits[4];
  const sum2 = 2 * (digits[1] + digits[3] + digits[5]);
  const checksum = (sum1 + sum2) % 10;

  if (checksum !== digits[6]) {
    return { valid: false, error: 'DEA checksum validation failed' };
  }

  // Determine schedule based on first letter
  let schedule = 'II-V';
  if (firstLetter === 'A' || firstLetter === 'B' || firstLetter === 'F') {
    schedule = 'II-V';
  } else if (firstLetter === 'M') {
    schedule = 'II-V (Mid-level practitioner)';
  }

  return { valid: true, schedule };
}

// ============================================================================
// NPI NUMBER VALIDATION (Luhn Algorithm)
// ============================================================================

export function validateNPINumber(npi: string): { valid: boolean; error?: string } {
  if (!npi || npi.length !== 10) {
    return { valid: false, error: 'NPI must be 10 digits' };
  }

  if (!/^\d{10}$/.test(npi)) {
    return { valid: false, error: 'NPI must contain only digits' };
  }

  // NPI uses Luhn algorithm with prefix 80840
  const prefixedNpi = '80840' + npi;
  let sum = 0;
  let alternate = false;

  for (let i = prefixedNpi.length - 1; i >= 0; i--) {
    let digit = parseInt(prefixedNpi[i], 10);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }

  if (sum % 10 !== 0) {
    return { valid: false, error: 'NPI checksum validation failed' };
  }

  return { valid: true };
}

// ============================================================================
// DOSE VALIDATION RANGES
// ============================================================================

export const COMMON_DOSE_RANGES: Record<string, { minDose: number; maxDose: number; maxDailyDose: number; unit: string }> = {
  'lisinopril': { minDose: 2.5, maxDose: 40, maxDailyDose: 80, unit: 'mg' },
  'atorvastatin': { minDose: 10, maxDose: 80, maxDailyDose: 80, unit: 'mg' },
  'metformin': { minDose: 250, maxDose: 1000, maxDailyDose: 2550, unit: 'mg' },
  'amlodipine': { minDose: 2.5, maxDose: 10, maxDailyDose: 10, unit: 'mg' },
  'omeprazole': { minDose: 10, maxDose: 40, maxDailyDose: 40, unit: 'mg' },
  'metoprolol': { minDose: 25, maxDose: 200, maxDailyDose: 400, unit: 'mg' },
  'losartan': { minDose: 25, maxDose: 100, maxDailyDose: 100, unit: 'mg' },
  'gabapentin': { minDose: 100, maxDose: 800, maxDailyDose: 3600, unit: 'mg' },
  'hydrochlorothiazide': { minDose: 12.5, maxDose: 50, maxDailyDose: 50, unit: 'mg' },
  'sertraline': { minDose: 25, maxDose: 200, maxDailyDose: 200, unit: 'mg' },
  'acetaminophen': { minDose: 325, maxDose: 1000, maxDailyDose: 4000, unit: 'mg' },
  'ibuprofen': { minDose: 200, maxDose: 800, maxDailyDose: 3200, unit: 'mg' },
  'amoxicillin': { minDose: 250, maxDose: 875, maxDailyDose: 3000, unit: 'mg' },
  'azithromycin': { minDose: 250, maxDose: 500, maxDailyDose: 500, unit: 'mg' },
  'prednisone': { minDose: 1, maxDose: 60, maxDailyDose: 80, unit: 'mg' },
};

// ============================================================================
// EXTRACTION CONFIDENCE SCORING
// ============================================================================

export interface ConfidenceScoreGuidelines {
  range: string;
  description: string;
  action: string;
}

export const CONFIDENCE_SCORING: ConfidenceScoreGuidelines[] = [
  { range: '0.9-1.0', description: 'Clear, unambiguous, printed text', action: 'Accept automatically' },
  { range: '0.7-0.9', description: 'Legible handwriting, context confirms interpretation', action: 'Accept with logging' },
  { range: '0.5-0.7', description: 'Partially legible, likely interpretation', action: 'Flag for review' },
  { range: '0.3-0.5', description: 'Difficult to read, multiple possible interpretations', action: 'Require human verification' },
  { range: '0.0-0.3', description: 'Mostly illegible, guessing', action: 'Reject - manual entry required' },
];

// ============================================================================
// DOCUMENT TYPE CLASSIFICATION
// ============================================================================

export const DOCUMENT_CLASSIFICATION = {
  documentTypes: [
    'handwritten_prescription',
    'printed_prescription',
    'electronic_prescription',
    'hospital_discharge_rx',
    'compound_prescription',
    'controlled_substance_rx',
    'veterinary_prescription',
    'dental_prescription',
    'optical_prescription',
  ],
  writingStyles: [
    'fully_handwritten',
    'partially_handwritten',
    'fully_printed',
    'mixed_cursive_print',
    'stamped_with_handwritten',
  ],
  formTypes: [
    'standard_pad',
    'pre_printed_template',
    'institutional_form',
    'tamper_resistant',
    'multi_part_carbon',
    'electronic_printout',
  ],
};

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export function detectDangerousAbbreviations(text: string): Array<{ abbrev: string; risk: string; replacement: string; severity: 'critical' | 'high' | 'medium' }> {
  const findings: Array<{ abbrev: string; risk: string; replacement: string; severity: 'critical' | 'high' | 'medium' }> = [];
  
  ISMP_DANGEROUS_ABBREVIATIONS.critical.forEach(item => {
    if (new RegExp(`\\b${item.abbrev}\\b`, 'gi').test(text)) {
      findings.push({ ...item, severity: 'critical' });
    }
  });
  
  ISMP_DANGEROUS_ABBREVIATIONS.high.forEach(item => {
    if (new RegExp(`\\b${item.abbrev}\\b`, 'gi').test(text)) {
      findings.push({ ...item, severity: 'high' });
    }
  });
  
  ISMP_DANGEROUS_ABBREVIATIONS.medium.forEach(item => {
    if (new RegExp(`\\b${item.abbrev}\\b`, 'gi').test(text)) {
      findings.push({ ...item, severity: 'medium' });
    }
  });

  // Check for trailing zero
  if (ISMP_DANGEROUS_ABBREVIATIONS.trailingZero.pattern.test(text)) {
    findings.push({ 
      abbrev: 'Trailing zero', 
      risk: ISMP_DANGEROUS_ABBREVIATIONS.trailingZero.risk, 
      replacement: 'Remove trailing zero',
      severity: 'high'
    });
  }

  // Check for missing leading zero
  if (ISMP_DANGEROUS_ABBREVIATIONS.missingLeadingZero.pattern.test(text)) {
    findings.push({ 
      abbrev: 'Missing leading zero', 
      risk: ISMP_DANGEROUS_ABBREVIATIONS.missingLeadingZero.risk, 
      replacement: 'Add leading zero (0.5 instead of .5)',
      severity: 'high'
    });
  }

  return findings;
}

export function findLASAMatches(drugName: string): string[] {
  const normalizedName = drugName.toLowerCase().trim();
  const matches: string[] = [];
  
  LASA_DRUG_PAIRS.forEach(pair => {
    const lowerPair = pair.map(d => d.toLowerCase());
    if (lowerPair.includes(normalizedName)) {
      matches.push(...pair.filter(d => d.toLowerCase() !== normalizedName));
    }
  });
  
  return matches;
}

export function parseSigInstruction(sig: string): {
  dose?: { value: string; numeric?: number; unit?: string };
  route?: string;
  frequency?: { raw: string; meaning?: string; timesPerDay?: number };
  timing?: { raw: string; meaning?: string };
  duration?: { value: string; numeric?: number; unit?: string };
  prn?: { isPrn: boolean; indication?: string };
  warnings: string[];
} {
  const result: ReturnType<typeof parseSigInstruction> = { warnings: [] };
  
  // Parse dose
  const doseMatch = sig.match(/(\d+\.?\d*)\s*(mg|g|mcg|mL|units?|tabs?|caps?)/i);
  if (doseMatch) {
    result.dose = {
      value: doseMatch[0],
      numeric: parseFloat(doseMatch[1]),
      unit: doseMatch[2].toLowerCase()
    };
  }

  // Parse frequency
  Object.entries(SIG_ABBREVIATIONS.frequency).forEach(([abbrev, info]) => {
    if (new RegExp(`\\b${abbrev}\\b`, 'i').test(sig)) {
      result.frequency = { 
        raw: abbrev, 
        meaning: info.meaning,
        timesPerDay: 'timesPerDay' in info ? info.timesPerDay : undefined
      };
      if ('isDangerous' in info && info.isDangerous) {
        result.warnings.push(`Dangerous abbreviation detected: ${abbrev}`);
      }
    }
  });

  // Parse route
  Object.entries(SIG_ABBREVIATIONS.route).forEach(([abbrev, info]) => {
    if (new RegExp(`\\b${abbrev}\\b`, 'i').test(sig)) {
      result.route = info.normalized;
      if ((info as any).isDangerous) {
        result.warnings.push(`Potentially confusing route abbreviation: ${abbrev}`);
      }
    }
  });

  // Parse timing
  Object.entries(SIG_ABBREVIATIONS.timing).forEach(([abbrev, info]) => {
    if (new RegExp(`\\b${abbrev}\\b`, 'i').test(sig)) {
      result.timing = { raw: abbrev, meaning: info.meaning };
    }
  });

  // Parse PRN
  if (/\bPRN\b|\bas needed\b/i.test(sig)) {
    const indicationMatch = sig.match(/PRN\s+(?:for\s+)?(\w+)/i);
    result.prn = {
      isPrn: true,
      indication: indicationMatch ? indicationMatch[1] : undefined
    };
  }

  // Parse duration
  const durationMatch = sig.match(/(?:for|x)\s*(\d+)\s*(days?|weeks?|months?)/i);
  if (durationMatch) {
    result.duration = {
      value: durationMatch[0],
      numeric: parseInt(durationMatch[1]),
      unit: durationMatch[2].toLowerCase()
    };
  }

  // Add dangerous abbreviation warnings
  const dangerousFindings = detectDangerousAbbreviations(sig);
  dangerousFindings.forEach(finding => {
    result.warnings.push(`${finding.severity.toUpperCase()}: "${finding.abbrev}" - ${finding.risk}. Use "${finding.replacement}" instead.`);
  });

  return result;
}

export function validateControlledSubstance(
  schedule: keyof typeof CONTROLLED_SUBSTANCE_SCHEDULES,
  prescription: {
    refills?: number;
    quantityInWords?: boolean;
    manualSignature?: boolean;
    deaNumber?: string;
    dateWritten?: Date;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requirements = CONTROLLED_SUBSTANCE_SCHEDULES[schedule];

  if (!requirements) {
    return { valid: false, errors: ['Unknown controlled substance schedule'] };
  }

  // Check refills
  if (prescription.refills !== undefined && prescription.refills > requirements.refillsAllowed) {
    errors.push(`Schedule ${schedule} allows maximum ${requirements.refillsAllowed} refills`);
  }

  // Check DEA
  if (requirements.requiresDEA && !prescription.deaNumber) {
    errors.push(`Schedule ${schedule} requires valid DEA number`);
  }

  // Check manual signature for Schedule II
  if ('requiresManualSignature' in requirements && requirements.requiresManualSignature && !prescription.manualSignature) {
    errors.push(`Schedule ${schedule} requires manual (handwritten) signature`);
  }

  // Check quantity in words for Schedule II
  if ('requiresQuantityInWords' in requirements && requirements.requiresQuantityInWords && !prescription.quantityInWords) {
    errors.push(`Schedule ${schedule} requires quantity written in words`);
  }

  // Check validity period
  if (prescription.dateWritten) {
    const daysSinceWritten = Math.floor((Date.now() - prescription.dateWritten.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceWritten > requirements.validityDays) {
      errors.push(`Prescription expired: Schedule ${schedule} valid for ${requirements.validityDays} days`);
    }
  }

  return { valid: errors.length === 0, errors };
}
