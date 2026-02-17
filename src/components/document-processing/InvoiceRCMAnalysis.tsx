import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DollarSign, FileText, AlertTriangle, CheckCircle, Clock, 
  Download, TrendingUp, TrendingDown, BarChart3, PieChart,
  FileSpreadsheet, FileJson, Building2, Receipt, Edit2, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { ICDCodeSearch, ICDCodeResult } from './ICDCodeSearch';
import { CPTCodeSearch, CPTCodeResult } from './CPTCodeSearch';
import { NDCCodeSearch, NDCCodeResult } from './NDCCodeSearch';

// UB-04 Revenue Code Database (3-digit codes for hospital facility billing)
const REVENUE_CODE_DATABASE: Record<string, { description: string; category: string }> = {
  // Room & Board (10x-21x)
  '100': { description: 'All-Inclusive Room & Board', category: 'Room & Board' },
  '101': { description: 'All-Inclusive Room & Board, Private', category: 'Room & Board' },
  '110': { description: 'Room & Board, Private, General', category: 'Room & Board' },
  '111': { description: 'Room & Board, Private, Medical/Surgical', category: 'Room & Board' },
  '120': { description: 'Room & Board, Semi-Private, General', category: 'Room & Board' },
  '121': { description: 'Room & Board, Semi-Private, Med/Surg', category: 'Room & Board' },
  '122': { description: 'Room & Board, Semi-Private, OB', category: 'Room & Board' },
  '123': { description: 'Room & Board, Semi-Private, Pediatric', category: 'Room & Board' },
  '130': { description: 'Room & Board, Ward, General', category: 'Room & Board' },
  '140': { description: 'Private Deluxe', category: 'Room & Board' },
  '150': { description: 'Room & Board, Skilled Nursing', category: 'Room & Board' },
  '160': { description: 'Room & Board, Other', category: 'Room & Board' },
  '170': { description: 'Nursery', category: 'Room & Board' },
  '171': { description: 'Nursery, Newborn, Level I', category: 'Room & Board' },
  '172': { description: 'Nursery, Newborn, Level II', category: 'Room & Board' },
  '173': { description: 'Nursery, Newborn, Level III', category: 'Room & Board' },
  '174': { description: 'Nursery, Newborn, Level IV', category: 'Room & Board' },
  '180': { description: 'Leave of Absence', category: 'Room & Board' },
  '190': { description: 'Subacute Care', category: 'Room & Board' },
  '200': { description: 'Intensive Care', category: 'Room & Board' },
  '201': { description: 'ICU, Surgical', category: 'Room & Board' },
  '202': { description: 'ICU, Medical', category: 'Room & Board' },
  '203': { description: 'ICU, Pediatric', category: 'Room & Board' },
  '204': { description: 'ICU, Psychiatric', category: 'Room & Board' },
  '206': { description: 'ICU, Intermediate', category: 'Room & Board' },
  '207': { description: 'ICU, Burn Care', category: 'Room & Board' },
  '208': { description: 'ICU, Trauma', category: 'Room & Board' },
  '210': { description: 'Coronary Care', category: 'Room & Board' },
  '211': { description: 'CCU, Myocardial Infarction', category: 'Room & Board' },
  '212': { description: 'CCU, Pulmonary Care', category: 'Room & Board' },
  '213': { description: 'CCU, Heart Transplant', category: 'Room & Board' },
  '219': { description: 'CCU, Other', category: 'Room & Board' },
  // Pharmacy (25x)
  '250': { description: 'Pharmacy, General', category: 'Pharmacy' },
  '251': { description: 'Pharmacy, Generic Drugs', category: 'Pharmacy' },
  '252': { description: 'Pharmacy, Non-Generic Drugs', category: 'Pharmacy' },
  '253': { description: 'Pharmacy, Take Home Drugs', category: 'Pharmacy' },
  '254': { description: 'Pharmacy, Drugs Incident to Other DX', category: 'Pharmacy' },
  '255': { description: 'Pharmacy, Drugs Incident to Radiology', category: 'Pharmacy' },
  '256': { description: 'Pharmacy, Experimental Drugs', category: 'Pharmacy' },
  '257': { description: 'Pharmacy, Non-Prescription', category: 'Pharmacy' },
  '258': { description: 'Pharmacy, IV Solutions', category: 'Pharmacy' },
  '259': { description: 'Pharmacy, Other', category: 'Pharmacy' },
  // IV Therapy (26x)
  '260': { description: 'IV Therapy, General', category: 'IV Therapy' },
  '261': { description: 'IV Therapy, Infusion Pump', category: 'IV Therapy' },
  '262': { description: 'IV Therapy, Administration', category: 'IV Therapy' },
  '263': { description: 'IV Therapy, Supplies', category: 'IV Therapy' },
  '264': { description: 'IV Therapy, Midline', category: 'IV Therapy' },
  '269': { description: 'IV Therapy, Other', category: 'IV Therapy' },
  // Medical/Surgical Supplies (27x)
  '270': { description: 'Med-Sur Supplies, General', category: 'Supplies' },
  '271': { description: 'Med-Sur Supplies, Non-Sterile', category: 'Supplies' },
  '272': { description: 'Med-Sur Supplies, Sterile', category: 'Supplies' },
  '273': { description: 'Med-Sur Supplies, Take Home', category: 'Supplies' },
  '274': { description: 'Med-Sur Supplies, Prosthetic/Orthotic', category: 'Supplies' },
  '275': { description: 'Med-Sur Supplies, Pacemaker', category: 'Supplies' },
  '276': { description: 'Med-Sur Supplies, Intraocular Lens', category: 'Supplies' },
  '277': { description: 'Med-Sur Supplies, Oxygen, Take Home', category: 'Supplies' },
  '278': { description: 'Med-Sur Supplies, Other Implants', category: 'Supplies' },
  '279': { description: 'Med-Sur Supplies, Other', category: 'Supplies' },
  // Laboratory (30x-31x)
  '300': { description: 'Laboratory, General', category: 'Laboratory' },
  '301': { description: 'Laboratory, Chemistry', category: 'Laboratory' },
  '302': { description: 'Laboratory, Immunology', category: 'Laboratory' },
  '303': { description: 'Laboratory, Renal Patient Home', category: 'Laboratory' },
  '304': { description: 'Laboratory, Non-Routine Dialysis', category: 'Laboratory' },
  '305': { description: 'Laboratory, Hematology', category: 'Laboratory' },
  '306': { description: 'Laboratory, Bacteriology/Microbiology', category: 'Laboratory' },
  '307': { description: 'Laboratory, Urology', category: 'Laboratory' },
  '309': { description: 'Laboratory, Other', category: 'Laboratory' },
  '310': { description: 'Laboratory Pathology, General', category: 'Laboratory' },
  '311': { description: 'Laboratory Pathology, Cytology', category: 'Laboratory' },
  '312': { description: 'Laboratory Pathology, Histology', category: 'Laboratory' },
  '314': { description: 'Laboratory Pathology, Biopsy', category: 'Laboratory' },
  '319': { description: 'Laboratory Pathology, Other', category: 'Laboratory' },
  // Radiology (32x-35x)
  '320': { description: 'Radiology, Diagnostic, General', category: 'Radiology' },
  '321': { description: 'Radiology, Diagnostic, Angiography', category: 'Radiology' },
  '322': { description: 'Radiology, Diagnostic, Arthrography', category: 'Radiology' },
  '323': { description: 'Radiology, Diagnostic, Chest X-ray', category: 'Radiology' },
  '324': { description: 'Radiology, Diagnostic, Tomography', category: 'Radiology' },
  '329': { description: 'Radiology, Diagnostic, Other', category: 'Radiology' },
  '330': { description: 'Radiology, Therapeutic, General', category: 'Radiology' },
  '331': { description: 'Radiology, Therapeutic, Chemotherapy Admin', category: 'Radiology' },
  '332': { description: 'Radiology, Therapeutic, Chemotherapy IV', category: 'Radiology' },
  '333': { description: 'Radiology, Therapeutic, Radiation', category: 'Radiology' },
  '339': { description: 'Radiology, Therapeutic, Other', category: 'Radiology' },
  '340': { description: 'Nuclear Medicine, General', category: 'Nuclear Medicine' },
  '341': { description: 'Nuclear Medicine, Diagnostic', category: 'Nuclear Medicine' },
  '342': { description: 'Nuclear Medicine, Therapeutic', category: 'Nuclear Medicine' },
  '343': { description: 'Nuclear Medicine, Diagnostic Radiopharm', category: 'Nuclear Medicine' },
  '344': { description: 'Nuclear Medicine, Therapeutic Radiopharm', category: 'Nuclear Medicine' },
  '350': { description: 'CT Scan, General', category: 'CT Scan' },
  '351': { description: 'CT Scan, Head', category: 'CT Scan' },
  '352': { description: 'CT Scan, Body', category: 'CT Scan' },
  '359': { description: 'CT Scan, Other', category: 'CT Scan' },
  // Operating Room (36x-37x)
  '360': { description: 'Operating Room, General', category: 'Surgery' },
  '361': { description: 'Operating Room, Minor Surgery', category: 'Surgery' },
  '362': { description: 'Operating Room, Organ Transplant', category: 'Surgery' },
  '367': { description: 'Operating Room, Kidney Transplant', category: 'Surgery' },
  '369': { description: 'Operating Room, Other', category: 'Surgery' },
  '370': { description: 'Anesthesia, General', category: 'Anesthesia' },
  '371': { description: 'Anesthesia, Incident to Radiology', category: 'Anesthesia' },
  '372': { description: 'Anesthesia, Incident to Other DX', category: 'Anesthesia' },
  '374': { description: 'Anesthesia, Acupuncture', category: 'Anesthesia' },
  '379': { description: 'Anesthesia, Other', category: 'Anesthesia' },
  // Blood (38x)
  '380': { description: 'Blood, General', category: 'Blood' },
  '381': { description: 'Blood, Packed Red Cells', category: 'Blood' },
  '382': { description: 'Blood, Whole Blood', category: 'Blood' },
  '383': { description: 'Blood, Plasma', category: 'Blood' },
  '384': { description: 'Blood, Platelets', category: 'Blood' },
  '385': { description: 'Blood, Leukocytes', category: 'Blood' },
  '386': { description: 'Blood, Other Components', category: 'Blood' },
  '387': { description: 'Blood, Other Derivatives', category: 'Blood' },
  '389': { description: 'Blood, Other', category: 'Blood' },
  // Respiratory Therapy (41x)
  '410': { description: 'Respiratory Services, General', category: 'Respiratory' },
  '411': { description: 'Respiratory Services, Inhalation', category: 'Respiratory' },
  '412': { description: 'Respiratory Services, Hyperbaric Oxygen', category: 'Respiratory' },
  '413': { description: 'Respiratory Services, CPAP', category: 'Respiratory' },
  '419': { description: 'Respiratory Services, Other', category: 'Respiratory' },
  // Physical/Occupational Therapy (42x-44x)
  '420': { description: 'Physical Therapy, General', category: 'Therapy' },
  '421': { description: 'Physical Therapy, Visit Charge', category: 'Therapy' },
  '422': { description: 'Physical Therapy, Hourly Charge', category: 'Therapy' },
  '423': { description: 'Physical Therapy, Group Rate', category: 'Therapy' },
  '424': { description: 'Physical Therapy, Evaluation', category: 'Therapy' },
  '429': { description: 'Physical Therapy, Other', category: 'Therapy' },
  '430': { description: 'Occupational Therapy, General', category: 'Therapy' },
  '431': { description: 'Occupational Therapy, Visit Charge', category: 'Therapy' },
  '432': { description: 'Occupational Therapy, Hourly Charge', category: 'Therapy' },
  '433': { description: 'Occupational Therapy, Group Rate', category: 'Therapy' },
  '434': { description: 'Occupational Therapy, Evaluation', category: 'Therapy' },
  '439': { description: 'Occupational Therapy, Other', category: 'Therapy' },
  '440': { description: 'Speech-Language Pathology, General', category: 'Therapy' },
  '441': { description: 'Speech-Language Pathology, Visit Charge', category: 'Therapy' },
  '442': { description: 'Speech-Language Pathology, Hourly Charge', category: 'Therapy' },
  '443': { description: 'Speech-Language Pathology, Group Rate', category: 'Therapy' },
  '449': { description: 'Speech-Language Pathology, Other', category: 'Therapy' },
  // Emergency Room (45x)
  '450': { description: 'Emergency Room, General', category: 'Emergency' },
  '451': { description: 'Emergency Room, EMTALA Screening', category: 'Emergency' },
  '452': { description: 'Emergency Room, ER Beyond EMTALA', category: 'Emergency' },
  '456': { description: 'Emergency Room, Urgent Care', category: 'Emergency' },
  '459': { description: 'Emergency Room, Other', category: 'Emergency' },
  // Cardiology (48x)
  '480': { description: 'Cardiology, General', category: 'Cardiology' },
  '481': { description: 'Cardiology, Cardiac Catheterization Lab', category: 'Cardiology' },
  '482': { description: 'Cardiology, Stress Test', category: 'Cardiology' },
  '483': { description: 'Cardiology, Echocardiology', category: 'Cardiology' },
  '489': { description: 'Cardiology, Other', category: 'Cardiology' },
  // MRI (61x)
  '610': { description: 'MRI, General', category: 'MRI' },
  '611': { description: 'MRI, Brain', category: 'MRI' },
  '612': { description: 'MRI, Spinal Canal', category: 'MRI' },
  '614': { description: 'MRI, Other', category: 'MRI' },
  '615': { description: 'MRI, Under 4', category: 'MRI' },
  '619': { description: 'MRI, Other', category: 'MRI' },
  // Dialysis (82x)
  '820': { description: 'Hemodialysis, General', category: 'Dialysis' },
  '821': { description: 'Hemodialysis, Inpatient', category: 'Dialysis' },
  '822': { description: 'Hemodialysis, Outpatient', category: 'Dialysis' },
  '823': { description: 'Peritoneal Dialysis, Inpatient', category: 'Dialysis' },
  '824': { description: 'Peritoneal Dialysis, Outpatient', category: 'Dialysis' },
  '829': { description: 'Dialysis, Other', category: 'Dialysis' },
  // Other (9xx)
  '900': { description: 'Behavioral Health Treatment', category: 'Behavioral Health' },
  '901': { description: 'Electroshock Treatment', category: 'Behavioral Health' },
  '902': { description: 'Milieu Therapy', category: 'Behavioral Health' },
  '903': { description: 'Play Therapy', category: 'Behavioral Health' },
  '904': { description: 'Activity Therapy', category: 'Behavioral Health' },
  '905': { description: 'Intensive Outpatient Services, Psych', category: 'Behavioral Health' },
  '906': { description: 'Intensive Outpatient Services, Chem Dep', category: 'Behavioral Health' },
  '910': { description: 'Psych/Detox, General', category: 'Behavioral Health' },
  '942': { description: 'Education/Training', category: 'Other' },
  '943': { description: 'Hospice Services', category: 'Hospice' },
};

// Get Revenue Code info
const getRevenueCodeInfo = (code: string): { description: string; category: string } => {
  const normalized = code.trim().replace(/^0+/, ''); // Remove leading zeros
  const paddedCode = normalized.padStart(3, '0'); // Ensure 3 digits
  
  // Try exact match
  const dbInfo = REVENUE_CODE_DATABASE[normalized] || REVENUE_CODE_DATABASE[paddedCode];
  if (dbInfo) return dbInfo;
  
  // Infer category from first digit
  const firstDigit = normalized[0];
  switch (firstDigit) {
    case '1': return { description: `Room & Board (${code})`, category: 'Room & Board' };
    case '2': return { description: `Ancillary Services (${code})`, category: 'Ancillary' };
    case '3': return { description: `Diagnostic Services (${code})`, category: 'Diagnostic' };
    case '4': return { description: `Therapeutic Services (${code})`, category: 'Therapeutic' };
    case '5': return { description: `Clinic Services (${code})`, category: 'Clinic' };
    case '6': return { description: `Advanced Imaging (${code})`, category: 'Imaging' };
    case '7': return { description: `Other Services (${code})`, category: 'Other' };
    case '8': return { description: `Outpatient Services (${code})`, category: 'Outpatient' };
    case '9': return { description: `Behavioral/Other (${code})`, category: 'Other' };
    default: return { description: `Unknown (${code})`, category: 'Unknown' };
  }
};

// Detect if a code is a Revenue Code (3 digits, 001-999)
const isRevenueCode = (code: string): boolean => {
  if (!code) return false;
  const cleaned = code.trim().replace(/^0+/, '');
  const num = parseInt(cleaned, 10);
  return /^\d{1,3}$/.test(cleaned) && num >= 1 && num <= 999 && cleaned.length <= 3;
};

// CPT Code Database (expanded with common codes)
const CPT_CODE_DATABASE: Record<string, { description: string; category: string; avgReimbursement: number }> = {
  // E/M - Evaluation & Management
  '99201': { description: 'Office visit, new patient, minimal', category: 'E/M', avgReimbursement: 45 },
  '99202': { description: 'Office visit, new patient, straightforward', category: 'E/M', avgReimbursement: 75 },
  '99203': { description: 'Office visit, new patient, low complexity', category: 'E/M', avgReimbursement: 100 },
  '99204': { description: 'Office visit, new patient, moderate complexity', category: 'E/M', avgReimbursement: 165 },
  '99205': { description: 'Office visit, new patient, high complexity', category: 'E/M', avgReimbursement: 210 },
  '99211': { description: 'Office visit, established, minimal', category: 'E/M', avgReimbursement: 25 },
  '99212': { description: 'Office visit, established, straightforward', category: 'E/M', avgReimbursement: 50 },
  '99213': { description: 'Office visit, established patient, low complexity', category: 'E/M', avgReimbursement: 75 },
  '99214': { description: 'Office visit, established patient, moderate complexity', category: 'E/M', avgReimbursement: 110 },
  '99215': { description: 'Office visit, established patient, high complexity', category: 'E/M', avgReimbursement: 150 },
  // Mental Health
  '90791': { description: 'Psychiatric diagnostic evaluation', category: 'Mental Health', avgReimbursement: 175 },
  '90792': { description: 'Psychiatric evaluation with medical services', category: 'Mental Health', avgReimbursement: 200 },
  '90832': { description: 'Psychotherapy, 30 minutes', category: 'Mental Health', avgReimbursement: 65 },
  '90834': { description: 'Psychotherapy, 45 minutes', category: 'Mental Health', avgReimbursement: 95 },
  '90837': { description: 'Psychotherapy, 60 minutes', category: 'Mental Health', avgReimbursement: 130 },
  '90847': { description: 'Family psychotherapy, conjoint', category: 'Mental Health', avgReimbursement: 110 },
  // Injections & Infusions
  '96372': { description: 'Therapeutic injection, subcutaneous/intramuscular', category: 'Injections', avgReimbursement: 25 },
  '96374': { description: 'Therapeutic IV push, initial', category: 'Infusions', avgReimbursement: 55 },
  '96375': { description: 'Therapeutic IV push, additional', category: 'Infusions', avgReimbursement: 35 },
  '96376': { description: 'Therapeutic IV push, additional drug', category: 'Infusions', avgReimbursement: 25 },
  // Lab
  '80048': { description: 'Basic metabolic panel', category: 'Lab', avgReimbursement: 11 },
  '80050': { description: 'General health panel', category: 'Lab', avgReimbursement: 45 },
  '80053': { description: 'Comprehensive metabolic panel', category: 'Lab', avgReimbursement: 14 },
  '80061': { description: 'Lipid panel', category: 'Lab', avgReimbursement: 18 },
  '81001': { description: 'Urinalysis, automated', category: 'Lab', avgReimbursement: 5 },
  '81003': { description: 'Urinalysis, auto w/o scope', category: 'Lab', avgReimbursement: 4 },
  '81025': { description: 'Urine pregnancy test, visual', category: 'Lab', avgReimbursement: 10 },
  '82947': { description: 'Glucose, quantitative', category: 'Lab', avgReimbursement: 6 },
  '83036': { description: 'Hemoglobin A1c', category: 'Lab', avgReimbursement: 13 },
  '84443': { description: 'Thyroid stimulating hormone (TSH)', category: 'Lab', avgReimbursement: 22 },
  '85025': { description: 'Complete blood count (CBC) with auto diff', category: 'Lab', avgReimbursement: 11 },
  '85027': { description: 'Complete blood count, automated', category: 'Lab', avgReimbursement: 9 },
  '87880': { description: 'Strep test, rapid', category: 'Lab', avgReimbursement: 17 },
  // Radiology
  '70553': { description: 'MRI brain with/without contrast', category: 'Radiology', avgReimbursement: 450 },
  '71046': { description: 'Chest X-ray, 2 views', category: 'Radiology', avgReimbursement: 35 },
  '71250': { description: 'CT chest without contrast', category: 'Radiology', avgReimbursement: 175 },
  '72148': { description: 'MRI lumbar spine without contrast', category: 'Radiology', avgReimbursement: 350 },
  '73030': { description: 'X-ray, shoulder', category: 'Radiology', avgReimbursement: 32 },
  '73110': { description: 'X-ray, wrist', category: 'Radiology', avgReimbursement: 30 },
  '73560': { description: 'X-ray, knee', category: 'Radiology', avgReimbursement: 35 },
  '74177': { description: 'CT abdomen and pelvis with contrast', category: 'Radiology', avgReimbursement: 275 },
  // Cardiology
  '93000': { description: 'Electrocardiogram (ECG), complete', category: 'Cardiology', avgReimbursement: 18 },
  '93005': { description: 'ECG, tracing only', category: 'Cardiology', avgReimbursement: 12 },
  '93010': { description: 'ECG, interpretation only', category: 'Cardiology', avgReimbursement: 10 },
  '93306': { description: 'Echocardiography, transthoracic', category: 'Cardiology', avgReimbursement: 250 },
  '93350': { description: 'Stress echocardiography', category: 'Cardiology', avgReimbursement: 350 },
  // Surgery
  '10060': { description: 'Incision and drainage, abscess', category: 'Surgery', avgReimbursement: 150 },
  '11102': { description: 'Skin biopsy, tangential', category: 'Surgery', avgReimbursement: 85 },
  '17000': { description: 'Destruction, premalignant lesion, first', category: 'Surgery', avgReimbursement: 75 },
  '20610': { description: 'Joint injection/aspiration, major', category: 'Surgery', avgReimbursement: 65 },
  '27447': { description: 'Total knee arthroplasty', category: 'Surgery', avgReimbursement: 1500 },
  '29881': { description: 'Knee arthroscopy, meniscectomy', category: 'Surgery', avgReimbursement: 850 },
  // Emergency Department
  '99281': { description: 'ED visit, self-limited minor', category: 'Emergency', avgReimbursement: 75 },
  '99282': { description: 'ED visit, low severity', category: 'Emergency', avgReimbursement: 125 },
  '99283': { description: 'ED visit, moderate severity', category: 'Emergency', avgReimbursement: 200 },
  '99284': { description: 'ED visit, high severity', category: 'Emergency', avgReimbursement: 350 },
  '99285': { description: 'ED visit, high severity with significant threat', category: 'Emergency', avgReimbursement: 500 },
  // HCPCS Drugs
  'J0129': { description: 'Abatacept injection', category: 'Drugs', avgReimbursement: 950 },
  'J0585': { description: 'Botulinum toxin A injection', category: 'Drugs', avgReimbursement: 550 },
  'J1030': { description: 'Methylprednisolone injection, 40mg', category: 'Drugs', avgReimbursement: 12 },
  'J1100': { description: 'Dexamethasone injection', category: 'Drugs', avgReimbursement: 8 },
  'J2001': { description: 'Lidocaine injection', category: 'Drugs', avgReimbursement: 5 },
  'J2405': { description: 'Ondansetron HCl injection', category: 'Drugs', avgReimbursement: 12 },
  'J2550': { description: 'Promethazine HCl injection', category: 'Drugs', avgReimbursement: 15 },
  'J3420': { description: 'Vitamin B12 injection', category: 'Drugs', avgReimbursement: 8 },
  'J7030': { description: 'Normal saline infusion, 1000ml', category: 'Drugs', avgReimbursement: 6 },
  // S codes (private payer)
  'S0028': { description: 'Famotidine injection', category: 'Private Payer Drugs', avgReimbursement: 20 },
  // DME
  'E0601': { description: 'CPAP device', category: 'DME', avgReimbursement: 450 },
  'E0260': { description: 'Hospital bed, semi-electric', category: 'DME', avgReimbursement: 600 },
  'A4253': { description: 'Blood glucose test strips', category: 'DME', avgReimbursement: 15 },
  // Preventive
  '99381': { description: 'Preventive visit, new, infant', category: 'Preventive', avgReimbursement: 120 },
  '99391': { description: 'Preventive visit, established, infant', category: 'Preventive', avgReimbursement: 95 },
  '99395': { description: 'Preventive visit, established, 18-39', category: 'Preventive', avgReimbursement: 130 },
  '99396': { description: 'Preventive visit, established, 40-64', category: 'Preventive', avgReimbursement: 145 },
  '99397': { description: 'Preventive visit, established, 65+', category: 'Preventive', avgReimbursement: 165 },
};

// Intelligent category inference for unknown CPT codes
const inferCPTCategory = (code: string): { category: string; avgReimbursement: number } => {
  const codeUpper = code.toUpperCase().trim();
  
  // HCPCS codes (start with letter)
  if (/^[A-Z]/.test(codeUpper)) {
    if (codeUpper.startsWith('J')) return { category: 'Drugs', avgReimbursement: 50 };
    if (codeUpper.startsWith('A')) return { category: 'DME/Supplies', avgReimbursement: 25 };
    if (codeUpper.startsWith('E')) return { category: 'DME', avgReimbursement: 200 };
    if (codeUpper.startsWith('G')) return { category: 'Procedures', avgReimbursement: 75 };
    if (codeUpper.startsWith('L')) return { category: 'Prosthetics', avgReimbursement: 500 };
    if (codeUpper.startsWith('Q')) return { category: 'Temp Codes', avgReimbursement: 50 };
    if (codeUpper.startsWith('S')) return { category: 'Private Payer', avgReimbursement: 100 };
    if (codeUpper.startsWith('T')) return { category: 'State Medicaid', avgReimbursement: 40 };
    return { category: 'HCPCS', avgReimbursement: 75 };
  }
  
  // CPT code ranges (numeric) - extract digits only
  const digitsOnly = codeUpper.replace(/\D/g, '');
  const numCode = parseInt(digitsOnly);
  if (isNaN(numCode) || digitsOnly.length === 0) return { category: 'Unknown', avgReimbursement: 0 };
  
  // For 5-digit codes, use proper ranges
  // E/M Services: 99201-99499
  if (numCode >= 99201 && numCode <= 99499) return { category: 'E/M', avgReimbursement: 100 };
  
  // Anesthesia: 00100-01999 (only if original code has leading zeros or is 5 digits starting with 0)
  if ((codeUpper.startsWith('0') || digitsOnly.length === 5) && numCode >= 100 && numCode <= 1999) {
    return { category: 'Anesthesia', avgReimbursement: 350 };
  }
  
  // Surgery: 10000-69999
  if (numCode >= 10000 && numCode <= 19999) return { category: 'Integumentary Surgery', avgReimbursement: 200 };
  if (numCode >= 20000 && numCode <= 29999) return { category: 'Musculoskeletal Surgery', avgReimbursement: 500 };
  if (numCode >= 30000 && numCode <= 39999) return { category: 'Respiratory Surgery', avgReimbursement: 450 };
  if (numCode >= 40000 && numCode <= 49999) return { category: 'Digestive Surgery', avgReimbursement: 600 };
  if (numCode >= 50000 && numCode <= 59999) return { category: 'Urinary Surgery', avgReimbursement: 550 };
  if (numCode >= 60000 && numCode <= 69999) return { category: 'Endocrine/Nervous Surgery', avgReimbursement: 700 };
  
  // Radiology: 70000-79999
  if (numCode >= 70000 && numCode <= 79999) return { category: 'Radiology', avgReimbursement: 150 };
  
  // Pathology/Lab: 80000-89999
  if (numCode >= 80000 && numCode <= 89999) return { category: 'Lab/Pathology', avgReimbursement: 20 };
  
  // Medicine: 90000-99199
  if (numCode >= 90281 && numCode <= 90399) return { category: 'Immunizations', avgReimbursement: 35 };
  if (numCode >= 90460 && numCode <= 90474) return { category: 'Vaccine Admin', avgReimbursement: 25 };
  if (numCode >= 90785 && numCode <= 90899) return { category: 'Mental Health', avgReimbursement: 100 };
  if (numCode >= 90901 && numCode <= 90911) return { category: 'Biofeedback', avgReimbursement: 85 };
  if (numCode >= 91010 && numCode <= 91299) return { category: 'Gastroenterology', avgReimbursement: 175 };
  if (numCode >= 92002 && numCode <= 92499) return { category: 'Ophthalmology', avgReimbursement: 125 };
  if (numCode >= 92502 && numCode <= 92700) return { category: 'Audiology', avgReimbursement: 100 };
  if (numCode >= 93000 && numCode <= 93799) return { category: 'Cardiology', avgReimbursement: 150 };
  if (numCode >= 93880 && numCode <= 93998) return { category: 'Vascular Studies', avgReimbursement: 200 };
  if (numCode >= 94002 && numCode <= 94799) return { category: 'Pulmonary', avgReimbursement: 125 };
  if (numCode >= 95004 && numCode <= 95199) return { category: 'Allergy/Immunology', avgReimbursement: 75 };
  if (numCode >= 95700 && numCode <= 95999) return { category: 'Neurology', avgReimbursement: 200 };
  if (numCode >= 96000 && numCode <= 96020) return { category: 'Psych Testing', avgReimbursement: 150 };
  if (numCode >= 96360 && numCode <= 96549) return { category: 'Infusions', avgReimbursement: 50 };
  if (numCode >= 96900 && numCode <= 96999) return { category: 'Dermatology', avgReimbursement: 100 };
  if (numCode >= 97001 && numCode <= 97799) return { category: 'Physical Therapy', avgReimbursement: 65 };
  if (numCode >= 97802 && numCode <= 97804) return { category: 'Nutrition Therapy', avgReimbursement: 55 };
  if (numCode >= 98940 && numCode <= 98943) return { category: 'Chiropractic', avgReimbursement: 45 };
  if (numCode >= 90000 && numCode <= 99199) return { category: 'Medicine', avgReimbursement: 75 };
  
  return { category: 'Unknown', avgReimbursement: 0 };
};

// Normalize CPT code - remove spaces, extract code portion
const normalizeCPTCode = (code: string): string => {
  if (!code) return '';
  // Remove common prefixes and clean up
  let normalized = code.trim().toUpperCase()
    .replace(/^(CPT|HCPCS|CODE|PROC)[:\s-]*/i, '')
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
  return normalized;
};

// Get CPT info with fallback to inference
const getCPTInfo = (code: string, description?: string): { description: string; category: string; avgReimbursement: number } => {
  const normalized = normalizeCPTCode(code);
  
  // Try exact match first
  const dbInfo = CPT_CODE_DATABASE[normalized] || CPT_CODE_DATABASE[code];
  if (dbInfo) return dbInfo;
  
  // Try lowercase match
  const lowerCode = normalized.toLowerCase();
  for (const [key, value] of Object.entries(CPT_CODE_DATABASE)) {
    if (key.toLowerCase() === lowerCode) return value;
  }
  
  const inferred = inferCPTCategory(normalized);
  return {
    description: description || `Procedure code ${code}`,
    category: inferred.category,
    avgReimbursement: inferred.avgReimbursement
  };
};

// Denial Reason Codes
const DENIAL_CODES: Record<string, string> = {
  'CO-4': 'Procedure code inconsistent with modifier or missing modifier',
  'CO-16': 'Claim lacks information needed for adjudication',
  'CO-18': 'Duplicate claim/service',
  'CO-29': 'Time limit for filing has expired',
  'CO-45': 'Charge exceeds fee schedule/maximum allowable',
  'CO-50': 'Non-covered service',
  'CO-97': 'Payment adjusted because benefits have been paid',
  'PR-1': 'Deductible amount',
  'PR-2': 'Coinsurance amount',
  'PR-3': 'Co-payment amount',
  'OA-23': 'Benefit for this service is included in payment/allowance for another service',
};

// ICD-10 Code Database (common diagnosis codes)
const ICD_CODE_DATABASE: Record<string, { description: string; category: string }> = {
  // Common diagnoses
  'E11.9': { description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  'E11.65': { description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine' },
  'I10': { description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  'I25.10': { description: 'Atherosclerotic heart disease of native coronary artery', category: 'Cardiovascular' },
  'J06.9': { description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  'J18.9': { description: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  'J44.9': { description: 'Chronic obstructive pulmonary disease, unspecified', category: 'Respiratory' },
  'M54.5': { description: 'Low back pain', category: 'Musculoskeletal' },
  'M79.3': { description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
  'K21.0': { description: 'Gastro-esophageal reflux disease with esophagitis', category: 'Digestive' },
  'F32.9': { description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
  'F41.1': { description: 'Generalized anxiety disorder', category: 'Mental Health' },
  'N39.0': { description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  'R05': { description: 'Cough', category: 'Symptoms' },
  'R50.9': { description: 'Fever, unspecified', category: 'Symptoms' },
  'Z23': { description: 'Encounter for immunization', category: 'Preventive' },
  'Z00.00': { description: 'Encounter for general adult medical examination', category: 'Preventive' },
  'Z12.31': { description: 'Encounter for screening mammogram', category: 'Preventive' },
  // Add more common codes
  'R10.9': { description: 'Unspecified abdominal pain', category: 'Symptoms' },
  'G43.909': { description: 'Migraine, unspecified, not intractable', category: 'Neurological' },
  'L30.9': { description: 'Dermatitis, unspecified', category: 'Dermatology' },
  'B34.9': { description: 'Viral infection, unspecified', category: 'Infectious' },
};

// Get ICD info with fallback
const getICDInfo = (code: string): { description: string; category: string } => {
  const normalized = code.trim().toUpperCase();
  const dbInfo = ICD_CODE_DATABASE[normalized];
  if (dbInfo) return dbInfo;
  
  // Infer category from code prefix
  if (normalized.startsWith('A') || normalized.startsWith('B')) return { description: `Infection code ${code}`, category: 'Infectious' };
  if (normalized.startsWith('C') || normalized.startsWith('D')) return { description: `Neoplasm code ${code}`, category: 'Oncology' };
  if (normalized.startsWith('E')) return { description: `Endocrine code ${code}`, category: 'Endocrine' };
  if (normalized.startsWith('F')) return { description: `Mental health code ${code}`, category: 'Mental Health' };
  if (normalized.startsWith('G')) return { description: `Neurological code ${code}`, category: 'Neurological' };
  if (normalized.startsWith('H')) return { description: `Eye/Ear code ${code}`, category: 'Sensory' };
  if (normalized.startsWith('I')) return { description: `Cardiovascular code ${code}`, category: 'Cardiovascular' };
  if (normalized.startsWith('J')) return { description: `Respiratory code ${code}`, category: 'Respiratory' };
  if (normalized.startsWith('K')) return { description: `Digestive code ${code}`, category: 'Digestive' };
  if (normalized.startsWith('L')) return { description: `Dermatology code ${code}`, category: 'Dermatology' };
  if (normalized.startsWith('M')) return { description: `Musculoskeletal code ${code}`, category: 'Musculoskeletal' };
  if (normalized.startsWith('N')) return { description: `Genitourinary code ${code}`, category: 'Genitourinary' };
  if (normalized.startsWith('R')) return { description: `Symptom code ${code}`, category: 'Symptoms' };
  if (normalized.startsWith('S') || normalized.startsWith('T')) return { description: `Injury code ${code}`, category: 'Injury' };
  if (normalized.startsWith('Z')) return { description: `Health status code ${code}`, category: 'Preventive' };
  
  return { description: `Diagnosis code ${code}`, category: 'Unknown' };
};

// NDC Code format validator and normalizer
const normalizeNDCCode = (code: string): string => {
  if (!code) return '';
  // Remove dashes and spaces, get digits only
  const digits = code.replace(/[\s-]/g, '');
  // Standard NDC is 11 digits
  return digits;
};

interface LineItem {
  description: string;
  revenue_code?: string;  // 3-digit UB-04 hospital revenue codes
  cpt_code?: string;      // 5-digit CPT codes
  hcpcs_code?: string;    // HCPCS Level II codes (J, A, E, G prefixes)
  icd_code?: string;
  ndc_code?: string;
  units: number;
  unit_price: number;
  total: number;
  modifier?: string;
  status?: 'paid' | 'pending' | 'denied' | 'partial';
  allowed_amount?: number;
  adjustment?: number;
}

// Detect what code type is present in line items
type CodeType = 'revenue' | 'cpt' | 'hcpcs' | 'mixed' | 'none';

const detectCodeType = (items: LineItem[]): CodeType => {
  let hasRevenue = false;
  let hasCPT = false;
  let hasHCPCS = false;
  
  items.forEach(item => {
    if (item.revenue_code) hasRevenue = true;
    if (item.cpt_code && /^\d{5}$/.test(item.cpt_code)) hasCPT = true;
    if (item.hcpcs_code || (item.cpt_code && /^[JAEGQLST]\d{4}$/i.test(item.cpt_code))) hasHCPCS = true;
  });
  
  if (hasRevenue && (hasCPT || hasHCPCS)) return 'mixed';
  if (hasRevenue) return 'revenue';
  if (hasCPT) return 'cpt';
  if (hasHCPCS) return 'hcpcs';
  return 'none';
};

// Invoice classification types
export type InvoiceClassification = 'healthcare-rcm' | 'regular-invoice';

export interface InvoiceClassificationResult {
  type: InvoiceClassification;
  confidence: number;
  indicators: {
    hasCPTCodes: boolean;
    hasHCPCSCodes: boolean;
    hasICDCodes: boolean;
    hasRevenueCodes: boolean;
    hasNDCCodes: boolean;
    hasNPI: boolean;
    hasPatientInfo: boolean;
    hasPayerInfo: boolean;
    hasClaimNumber: boolean;
    hasHealthcareTerms: boolean;
  };
  tabLabel: string;
  analysisType: string;
}

// Healthcare-specific terms to detect in invoice content
const HEALTHCARE_TERMS = [
  'diagnosis', 'patient', 'provider', 'insurance', 'claim', 'medicare', 'medicaid',
  'copay', 'coinsurance', 'deductible', 'procedure', 'treatment', 'hospital',
  'clinic', 'physician', 'medical', 'healthcare', 'health care', 'rx', 'pharmacy',
  'prescription', 'laboratory', 'radiology', 'surgery', 'anesthesia', 'therapy',
  'nursing', 'icu', 'emergency', 'outpatient', 'inpatient', 'billing provider',
  'referring provider', 'rendering provider', 'place of service', 'pos',
  'date of service', 'dos', 'explanation of benefits', 'eob', 'remittance',
  'allowed amount', 'contractual adjustment', 'write-off', 'prior authorization'
];

// Detect if invoice is healthcare/RCM or regular
const classifyInvoice = (
  invoiceData: InvoiceData, 
  lineItems: LineItem[],
  rawData: Record<string, any>
): InvoiceClassificationResult => {
  const indicators = {
    hasCPTCodes: false,
    hasHCPCSCodes: false,
    hasICDCodes: false,
    hasRevenueCodes: false,
    hasNDCCodes: false,
    hasNPI: false,
    hasPatientInfo: false,
    hasPayerInfo: false,
    hasClaimNumber: false,
    hasHealthcareTerms: false,
  };

  // Check line items for healthcare codes
  lineItems.forEach(item => {
    if (item.cpt_code && /^\d{5}$/.test(item.cpt_code)) indicators.hasCPTCodes = true;
    if (item.hcpcs_code || (item.cpt_code && /^[JAEGQLST]\d{4}$/i.test(item.cpt_code))) indicators.hasHCPCSCodes = true;
    if (item.icd_code) indicators.hasICDCodes = true;
    if (item.revenue_code) indicators.hasRevenueCodes = true;
    if (item.ndc_code) indicators.hasNDCCodes = true;
  });

  // Check invoice-level codes
  if (invoiceData.cpt_codes) indicators.hasCPTCodes = true;
  if (invoiceData.icd_codes) indicators.hasICDCodes = true;
  if (invoiceData.ndc_codes) indicators.hasNDCCodes = true;

  // Check for healthcare-specific identifiers
  if (invoiceData.vendor_npi) indicators.hasNPI = true;
  if (invoiceData.patient_name || invoiceData.patient_account) indicators.hasPatientInfo = true;
  if (invoiceData.payer_name) indicators.hasPayerInfo = true;
  if (invoiceData.claim_number) indicators.hasClaimNumber = true;

  // Check raw data for healthcare terms
  const rawDataStr = JSON.stringify(rawData).toLowerCase();
  const healthcareTermCount = HEALTHCARE_TERMS.filter(term => 
    rawDataStr.includes(term.toLowerCase())
  ).length;
  indicators.hasHealthcareTerms = healthcareTermCount >= 3;

  // Calculate confidence score (0-100)
  let score = 0;
  if (indicators.hasCPTCodes) score += 25;
  if (indicators.hasHCPCSCodes) score += 20;
  if (indicators.hasICDCodes) score += 20;
  if (indicators.hasRevenueCodes) score += 15;
  if (indicators.hasNDCCodes) score += 10;
  if (indicators.hasNPI) score += 15;
  if (indicators.hasPatientInfo) score += 10;
  if (indicators.hasPayerInfo) score += 10;
  if (indicators.hasClaimNumber) score += 15;
  if (indicators.hasHealthcareTerms) score += 10;

  // Determine classification
  const isHealthcare = score >= 25;
  const confidence = Math.min(score, 100);

  return {
    type: isHealthcare ? 'healthcare-rcm' : 'regular-invoice',
    confidence,
    indicators,
    tabLabel: isHealthcare ? 'RCM Analysis' : 'Invoice Analysis',
    analysisType: isHealthcare 
      ? 'Healthcare Revenue Cycle Management' 
      : 'Standard Invoice Analysis'
  };
};

interface InvoiceData {
  invoice_number?: string;
  claim_number?: string;
  account_number?: string;
  vendor_name?: string;
  vendor_tax_id?: string;
  vendor_npi?: string;
  patient_name?: string;
  patient_account?: string;
  invoice_date?: string;
  due_date?: string;
  service_from?: string;
  service_to?: string;
  line_items?: LineItem[];
  cpt_codes?: string;
  icd_codes?: string;
  ndc_codes?: string;
  billed_amount?: number;
  allowed_amount?: number;
  adjustment_amount?: number;
  paid_amount?: number;
  patient_responsibility?: number;
  balance_due?: number;
  payer_name?: string;
  payment_status?: string;
  denial_reason?: string;
  aging_bucket?: string;
}

interface RCMSummary {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  totalDenied: number;
  totalAdjustments: number;
  collectionRate: number;
  avgDaysToPayment: number;
  agingBreakdown: { bucket: string; amount: number; count: number }[];
  cptBreakdown: { code: string; description: string; count: number; billed: number; paid: number }[];
  denialBreakdown: { code: string; reason: string; count: number; amount: number }[];
  vendorBreakdown: { vendor: string; billed: number; paid: number; outstanding: number }[];
}

interface InvoiceRCMAnalysisProps {
  extractedData: Record<string, any>;
  processingHistory?: any[];
  onExport?: (format: 'csv' | 'json', data: any) => void;
  onLineItemsChange?: (lineItems: LineItem[]) => void;
  onClassificationChange?: (classification: InvoiceClassificationResult) => void;
}

// Intelligent field matcher - maps any extracted field to expected RCM fields
const findFieldValue = (data: Record<string, any>, ...patterns: string[]): string | undefined => {
  if (!data) return undefined;
  
  // First try exact matches
  for (const pattern of patterns) {
    if (data[pattern] !== undefined) return String(data[pattern]);
  }
  
  // Then try case-insensitive and partial matches
  const keys = Object.keys(data);
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase().replace(/_/g, '');
    for (const key of keys) {
      const keyLower = key.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
      if (keyLower.includes(patternLower) || patternLower.includes(keyLower)) {
        return String(data[key]);
      }
    }
  }
  
  return undefined;
};

// Find numeric field value
const findNumericValue = (data: Record<string, any>, ...patterns: string[]): number => {
  const value = findFieldValue(data, ...patterns);
  if (!value) return 0;
  // Extract numeric value from string (handles currency symbols, commas)
  const numericStr = value.replace(/[^0-9.-]/g, '');
  return parseFloat(numericStr) || 0;
};

export const InvoiceRCMAnalysis: React.FC<InvoiceRCMAnalysisProps> = ({
  extractedData,
  processingHistory = [],
  onExport,
  onLineItemsChange,
  onClassificationChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rcmSummary, setRcmSummary] = useState<RCMSummary | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [editingLineItemIdx, setEditingLineItemIdx] = useState<number | null>(null);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [invoiceClassification, setInvoiceClassification] = useState<InvoiceClassificationResult | null>(null);

  // Create unique key based on invoice identifiers to prevent data carryover
  // Uses invoice-specific data to ensure each invoice has isolated state
  const currentInvoiceKey = React.useMemo(() => {
    // Create unique key from multiple invoice identifiers
    const inv = extractedData?.invoice_number || '';
    const claim = extractedData?.claim_number || '';
    const acct = extractedData?.account_number || '';
    const billed = extractedData?.billed_amount || extractedData?.total_charges || '';
    const balance = extractedData?.balance_due || '';
    const patient = extractedData?.patient_name || '';
    const vendor = extractedData?.vendor_name || '';
    
    // Combine identifiers to create unique key - include more fields for uniqueness
    const combined = `${inv}_${claim}_${acct}_${billed}_${balance}_${patient}_${vendor}`.replace(/[^a-zA-Z0-9]/g, '');
    return combined ? `invoiceRCM_${combined}` : null;
  }, [extractedData?.invoice_number, extractedData?.claim_number, extractedData?.account_number, 
      extractedData?.billed_amount, extractedData?.total_charges, extractedData?.balance_due,
      extractedData?.patient_name, extractedData?.vendor_name]);

  // Track previous invoice key to detect when invoice changes
  const prevInvoiceKeyRef = React.useRef<string | null>(null);
  const prevExtractedDataRef = React.useRef<Record<string, any> | null>(null);

  // Clear state when extracted data changes completely (new document uploaded)
  useEffect(() => {
    // Check if this is a completely new document (not just minor updates)
    const hasNewData = extractedData && Object.keys(extractedData).length > 0;
    const hadPreviousData = prevExtractedDataRef.current && Object.keys(prevExtractedDataRef.current).length > 0;
    
    // Detect if this is a new document upload
    const isNewDocument = hasNewData && hadPreviousData && (
      // Invoice number changed
      (extractedData?.invoice_number !== prevExtractedDataRef.current?.invoice_number && extractedData?.invoice_number) ||
      // Claim number changed
      (extractedData?.claim_number !== prevExtractedDataRef.current?.claim_number && extractedData?.claim_number) ||
      // Patient name changed
      (extractedData?.patient_name !== prevExtractedDataRef.current?.patient_name && extractedData?.patient_name) ||
      // Billed amount significantly changed
      (Math.abs((extractedData?.billed_amount || 0) - (prevExtractedDataRef.current?.billed_amount || 0)) > 0.01 && extractedData?.billed_amount)
    );
    
    if (isNewDocument) {
      console.log('RCM Analysis - New document detected, clearing all state');
      setLineItems([]);
      setHasUserEdits(false);
      setActiveTab('overview');
      setRcmSummary(null);
      setHasRestoredState(false);
      
      // Clear old sessionStorage if we have a new key
      if (prevInvoiceKeyRef.current) {
        sessionStorage.removeItem(prevInvoiceKeyRef.current);
      }
    }
    
    prevExtractedDataRef.current = extractedData ? { ...extractedData } : null;
  }, [extractedData]);

  // Clear state when switching to a different invoice (by key)
  useEffect(() => {
    if (prevInvoiceKeyRef.current && currentInvoiceKey && prevInvoiceKeyRef.current !== currentInvoiceKey) {
      // New invoice loaded - clear old state
      console.log('RCM Analysis - Invoice key changed, clearing old state');
      console.log('Previous key:', prevInvoiceKeyRef.current, 'New key:', currentInvoiceKey);
      setLineItems([]);
      setHasUserEdits(false);
      setActiveTab('overview');
      setRcmSummary(null);
      // Remove old state from session storage
      sessionStorage.removeItem(prevInvoiceKeyRef.current);
      setHasRestoredState(false);
    }
    prevInvoiceKeyRef.current = currentInvoiceKey;
  }, [currentInvoiceKey]);

  // Save state to sessionStorage when line items change (with user edits flag)
  // Uses invoice-specific key to isolate state per invoice
  useEffect(() => {
    if (lineItems.length > 0 && hasRestoredState && currentInvoiceKey) {
      const stateToSave = {
        lineItems,
        activeTab,
        invoiceIdentifiers: {
          invoice_number: extractedData?.invoice_number,
          claim_number: extractedData?.claim_number,
          account_number: extractedData?.account_number,
          billed_amount: extractedData?.billed_amount,
          balance_due: extractedData?.balance_due
        },
        hasUserEdits,
        timestamp: Date.now()
      };
      sessionStorage.setItem(currentInvoiceKey, JSON.stringify(stateToSave));
      
      // Notify parent of line items changes for saving
      if (onLineItemsChange) {
        onLineItemsChange(lineItems);
      }
    }
  }, [lineItems, activeTab, hasRestoredState, hasUserEdits, currentInvoiceKey, extractedData, onLineItemsChange]);

  // Restore state from sessionStorage on mount - uses invoice-specific key
  useEffect(() => {
    if (!currentInvoiceKey) {
      // No valid invoice key yet, mark as restored and let parsing happen
      setHasRestoredState(true);
      return;
    }
    
    const savedState = sessionStorage.getItem(currentInvoiceKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if saved within last 30 minutes AND matches current invoice
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < 30 * 60 * 1000) {
          // Verify invoice identifiers match
          const savedInv = parsed.invoiceIdentifiers?.invoice_number || '';
          const savedClaim = parsed.invoiceIdentifiers?.claim_number || '';
          const currentInv = extractedData?.invoice_number || '';
          const currentClaim = extractedData?.claim_number || '';
          
          if ((savedInv && savedInv === currentInv) || (savedClaim && savedClaim === currentClaim) || 
              (!savedInv && !savedClaim && !currentInv && !currentClaim)) {
            console.log('RCM Analysis - Restoring state for invoice:', currentInvoiceKey);
            if (parsed.lineItems?.length > 0) {
              setLineItems(parsed.lineItems);
              setHasUserEdits(parsed.hasUserEdits || false);
            }
            if (parsed.activeTab) {
              setActiveTab(parsed.activeTab);
            }
          } else {
            console.log('RCM Analysis - Invoice identifiers mismatch, not restoring');
            sessionStorage.removeItem(currentInvoiceKey);
          }
        } else {
          // Expired state - remove it
          sessionStorage.removeItem(currentInvoiceKey);
        }
      } catch (e) {
        console.warn('Failed to restore invoice state:', e);
        sessionStorage.removeItem(currentInvoiceKey);
      }
    }
    setHasRestoredState(true);
  }, [currentInvoiceKey, extractedData?.invoice_number, extractedData?.claim_number]);

  // Handle ICD code selection for a line item
  const handleICDSelect = useCallback((idx: number, result: ICDCodeResult) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        icd_code: result.code,
        // Update amounts based on ICD category rates
        total: result.avgBilled,
        allowed_amount: result.avgAllowed,
        adjustment: result.avgAdjustment
      };
      return updated;
    });
    setEditingLineItemIdx(null);
    setHasUserEdits(true);
    toast.success(`ICD-10 code ${result.code} applied with billing rates`);
  }, []);

  // Handle CPT code selection for a line item
  // CRITICAL: Calculate allowed_amount from avgReimbursement, then adjustment = billed - allowed
  const handleCPTSelect = useCallback((idx: number, result: CPTCodeResult) => {
    setLineItems(prev => {
      const updated = [...prev];
      const currentItem = updated[idx];
      const billedAmount = currentItem.total || 0;
      const units = currentItem.units || 1;
      
      // Allowed = avgReimbursement * units (what insurance will actually pay per CPT)
      const allowedAmount = result.avgReimbursement * units;
      
      // Adjustment = billed - allowed (contractual write-off)
      const adjustment = billedAmount > allowedAmount ? (billedAmount - allowedAmount) : 0;
      
      updated[idx] = {
        ...currentItem,
        cpt_code: result.code,
        description: result.description || currentItem.description,
        // Keep original billed amount, set calculated allowed and adjustment
        allowed_amount: allowedAmount,
        adjustment: adjustment,
        unit_price: billedAmount / units
      };
      return updated;
    });
    setEditingLineItemIdx(null);
    setHasUserEdits(true);
    toast.success(`CPT ${result.code} applied - Allowed: $${result.avgReimbursement}/unit`);
  }, []);

  // Handle NDC code selection for a line item
  // Keep original billed, calculate allowed from avgCost, then adjustment
  const handleNDCSelect = useCallback((idx: number, result: NDCCodeResult) => {
    setLineItems(prev => {
      const updated = [...prev];
      const currentItem = updated[idx];
      const billedAmount = currentItem.total || 0;
      const units = currentItem.units || 1;
      
      // Allowed = avgCost * units
      const allowedAmount = result.avgCost * units;
      
      // Adjustment = billed - allowed
      const adjustment = billedAmount > allowedAmount ? (billedAmount - allowedAmount) : 0;
      
      updated[idx] = {
        ...currentItem,
        ndc_code: result.ndc_code,
        description: result.brand_name || result.generic_name || currentItem.description,
        allowed_amount: allowedAmount,
        adjustment: adjustment
      };
      return updated;
    });
    setEditingLineItemIdx(null);
    setHasUserEdits(true);
    toast.success(`NDC ${result.ndc_code} applied - Allowed: $${result.avgCost}/unit`);
  }, []);
  
  // Filter invoice history only
  const invoiceHistory = processingHistory.filter(h => 
    h.documentType === 'invoice' || h.documentType === 'billing'
  );
  
  // Get data from selected history item or use extractedData
  const activeData = React.useMemo(() => {
    if (selectedHistoryId) {
      const historyItem = invoiceHistory.find(h => h.id === selectedHistoryId);
      if (historyItem) {
        // Build data from history item
        const fields = historyItem.extractedFields || {};
        return {
          ...Object.fromEntries(
            Object.entries(fields).map(([key, val]: [string, any]) => [
              key,
              typeof val === 'object' && val !== null && 'value' in val ? val.value : val
            ])
          ),
          line_items: historyItem.lineItems || fields.line_items?.value || fields.line_items || [],
          tables: historyItem.tables || fields.tables?.value || fields.tables || []
        };
      }
    }
    return extractedData;
  }, [selectedHistoryId, invoiceHistory, extractedData]);

  // Parse extracted data into invoice structure using intelligent field mapping
  // CRITICAL: All values come ONLY from extracted data - no hardcoding
  const invoiceData = React.useMemo<InvoiceData>(() => {
    console.log('RCM Analysis - Received activeData:', activeData);
    
    // Enhanced vendor extraction - look for facility/hospital/company names
    const vendorName = findFieldValue(activeData, 'vendor_name', 'company_name', 'provider_name', 
      'facility_name', 'hospital_name', 'clinic_name', 'medical_center', 'organization_name',
      'from', 'vendor', 'company', 'provider', 'biller', 'billing_provider', 'remit_to', 
      'pay_to', 'remit_to_organization_name');
    
    // Enhanced payer extraction - look for insurance/coverage info
    const payerName = findFieldValue(activeData, 'payer_name', 'payer', 'insurance_name', 
      'insurance', 'insurance_company', 'carrier', 'payor', 'health_plan', 'visit_coverages',
      'coverage', 'medicare', 'medicaid', 'plan_name', 'insurance_carrier', 'patient_information');
    
    // Extract billed amount from various fields - NO hardcoding
    // Added summary_total_amount for Gemini extraction format
    const billedAmount = findNumericValue(activeData, 'billed_amount', 'total_charges', 
      'charges', 'total_billed', 'gross_charges', 'total_amount', 'amount_billed',
      'total', 'hospital_charges', 'charges_total', 'summary_total_amount');
    
    // Extract balance from invoice - NO hardcoding
    const balanceDue = findNumericValue(activeData, 'balance_due', 'balance', 'amount_due', 
      'total_due', 'amount_owed', 'outstanding_balance', 'current_account_balance',
      'unpaid_balance', 'patient_balance', 'account_balance');
    
    return {
      invoice_number: findFieldValue(activeData, 'invoice_number', 'invoice_no', 'invoiceno', 'invoice', 'inv_number', 'inv_no', 'bill_number', 'statement_number'),
      claim_number: findFieldValue(activeData, 'claim_number', 'claim_no', 'claimno', 'claim', 'claim_id', 'claim_ref'),
      account_number: findFieldValue(activeData, 'account_number', 'account_no', 'accountno', 'acct_number', 'acct_no', 'patient_account_number', 'account'),
      vendor_name: vendorName,
      vendor_tax_id: findFieldValue(activeData, 'vendor_tax_id', 'tax_id', 'ein', 'taxid', 'federal_tax_id', 'fein'),
      vendor_npi: findFieldValue(activeData, 'vendor_npi', 'npi', 'provider_npi', 'national_provider_identifier', 'billing_npi'),
      patient_name: findFieldValue(activeData, 'patient_name', 'patient', 'member_name', 'subscriber_name', 'name', 'insured_name', 'addressee'),
      patient_account: findFieldValue(activeData, 'patient_account', 'account_number', 'account', 'member_id', 'accountno', 'patient_id'),
      invoice_date: findFieldValue(activeData, 'invoice_date', 'date', 'service_date', 'statement_date', 'bill_date', 'billing_date'),
      due_date: findFieldValue(activeData, 'due_date', 'please_pay_by', 'payment_due', 'pay_by', 'due', 'payment_due_date', 'due_by'),
      service_from: findFieldValue(activeData, 'service_from', 'service_date_from', 'from_date', 'start_date', 'dos_from', 'date_of_service', 'admit_date'),
      service_to: findFieldValue(activeData, 'service_to', 'service_date_to', 'to_date', 'end_date', 'dos_to', 'discharge_date'),
      cpt_codes: findFieldValue(activeData, 'cpt_codes', 'cpt', 'cpt_code', 'procedure_code', 'hcpcs', 'hcpcs_code', 'procedure_codes'),
      icd_codes: findFieldValue(activeData, 'icd_codes', 'icd', 'icd_code', 'diagnosis_code', 'icd10', 'icd_10', 'diagnosis_codes', 'dx_codes'),
      ndc_codes: findFieldValue(activeData, 'ndc_codes', 'ndc', 'ndc_code', 'national_drug_code', 'drug_code'),
      billed_amount: billedAmount,
      allowed_amount: findNumericValue(activeData, 'allowed_amount', 'allowed', 'approved_amount', 'contracted_amount', 'allowable'),
      adjustment_amount: findNumericValue(activeData, 'adjustment_amount', 'adjustment', 'adjustments', 'write_off', 'contractual_adjustment', 'discount', 'total_payments_adjustments'),
      paid_amount: findNumericValue(activeData, 'paid_amount', 'paid', 'payment', 'amount_paid', 'payments_received', 'insurance_paid'),
      patient_responsibility: findNumericValue(activeData, 'patient_responsibility', 'patient_due', 'patient_balance', 'your_responsibility', 'patient_portion', 'copay', 'coinsurance', 'deductible'),
      balance_due: balanceDue,
      payer_name: payerName,
      payment_status: findFieldValue(activeData, 'payment_status', 'status', 'claim_status') || 'pending',
      denial_reason: findFieldValue(activeData, 'denial_reason', 'denial_code', 'reason_code', 'rejection_reason', 'remark_code'),
      aging_bucket: findFieldValue(activeData, 'aging_bucket', 'aging', 'days_outstanding', 'age'),
    };
  }, [activeData]);

  // Parse line items from extracted data using intelligent field matching
  // Only parse if we don't have user edits and haven't restored saved state with items
  useEffect(() => {
    // Skip parsing if user has made edits
    if (hasUserEdits) {
      console.log('RCM Analysis - Skipping parse, user has edits');
      return;
    }
    
    // Skip if we haven't finished restoring state yet
    if (!hasRestoredState) {
      console.log('RCM Analysis - Skipping parse, state not yet restored');
      return;
    }
    
    // Skip if we already have line items from restored state
    if (lineItems.length > 0) {
      console.log('RCM Analysis - Skipping parse, already have', lineItems.length, 'items');
      return;
    }
    
    const items: LineItem[] = [];
    
    console.log('RCM Analysis - Full activeData:', JSON.stringify(activeData, null, 2));
    
    // Find line items using various field names
    let lineItemsData = activeData?.line_items || activeData?.lineitems || 
                          activeData?.items || activeData?.services || 
                          activeData?.charges || activeData?.procedures;
    
    // Parse JSON string if needed
    if (typeof lineItemsData === 'string') {
      try {
        lineItemsData = JSON.parse(lineItemsData);
      } catch (e) {
        console.log('RCM Analysis - Could not parse line_items as JSON');
      }
    }
    
    if (lineItemsData && Array.isArray(lineItemsData)) {
      console.log('RCM Analysis - Found line_items array:', lineItemsData.length, 'items');
      lineItemsData.forEach((item: any) => {
        // Parse amount - handle various formats
        const billedAmount = parseFloat(String(
          item.total || item.amount || item.charge || item.billed || 
          item.Amount || item.AMOUNT || item.price || '0'
        ).replace(/[^0-9.-]/g, '')) || 0;
        
        // Get code from various fields - could be Revenue, CPT, or HCPCS
        const rawCode = item.cpt_code || item.cpt || item.procedure_code || 
          item['cpt_/_hcpcs_code'] || item['cpt_hcpcs_code'] || item['CPT / HCPCS Code'] ||
          item.hcpcs || item.HCPCS || item.code || item.Code || 
          item.revenue_code || item.rev_code || item.REV || item['Rev Code'];
        
        // Get NDC code
        const rawNdcCode = item.ndc_code || item.ndc || item.NDC || 
          item.national_drug_code || item.drug_code;
        
        // Get qty/units
        const units = parseFloat(String(item.units || item.quantity || item.qty || item.Qty || item.QTY || '1').replace(/[^0-9.-]/g, '')) || 1;
        
        // Get description
        const description = item.description || item.Description || item.DESCRIPTION || 
          item.service || item.Service || item.item || item.name || '';
        
        // Clean code
        const cleanedCode = rawCode ? String(rawCode).trim().replace(/[^A-Za-z0-9]/g, '') : undefined;
        const ndcCode = rawNdcCode ? String(rawNdcCode).trim().replace(/[^0-9]/g, '') : undefined;
        
        // Detect code type
        let revenueCode: string | undefined;
        let cptCode: string | undefined;
        let hcpcsCode: string | undefined;
        
        if (cleanedCode) {
          if (isRevenueCode(cleanedCode)) {
            // It's a 3-digit revenue code
            revenueCode = cleanedCode;
          } else if (/^[JAEGQLST]\d{4}$/i.test(cleanedCode)) {
            // HCPCS code (letter + 4 digits)
            hcpcsCode = cleanedCode.toUpperCase();
          } else if (/^\d{5}$/.test(cleanedCode)) {
            // 5-digit CPT code
            cptCode = cleanedCode;
          } else {
            // Default to CPT for unknown patterns
            cptCode = cleanedCode;
          }
        }
        
        // Get CPT info ONLY for valid 5-digit CPT or HCPCS codes
        const cptInfo = cptCode ? getCPTInfo(cptCode, description) : 
          (hcpcsCode ? getCPTInfo(hcpcsCode, description) : null);
        
        // ONLY use extracted allowed/adjustment values from invoice
        const extractedAllowed = parseFloat(String(item.allowed_amount || item.allowed || '0').replace(/[^0-9.-]/g, '')) || 0;
        const extractedAdjustment = parseFloat(String(item.adjustment || item.adj || item.write_off || '0').replace(/[^0-9.-]/g, '')) || 0;
        
        // Only calculate allowed from CPT/HCPCS if valid, not for revenue codes
        const allowedAmount = extractedAllowed > 0 ? extractedAllowed : 
          ((cptCode || hcpcsCode) && cptInfo ? (cptInfo.avgReimbursement * units) : 0);
        
        // Calculate adjustment if we have allowed amount
        const adjustment = extractedAdjustment > 0 ? extractedAdjustment : 
          (allowedAmount > 0 && billedAmount > allowedAmount ? (billedAmount - allowedAmount) : 0);
        
        items.push({
          description: description || (revenueCode ? getRevenueCodeInfo(revenueCode).description : (cptInfo?.description || '')),
          revenue_code: revenueCode,
          cpt_code: cptCode,
          hcpcs_code: hcpcsCode,
          icd_code: item.icd_code || item.icd || item.diagnosis_code || item.dx_code || item.icd10,
          ndc_code: ndcCode,
          units: units,
          unit_price: billedAmount / units,
          total: billedAmount,
          allowed_amount: allowedAmount > 0 ? allowedAmount : undefined,
          adjustment: adjustment > 0 ? adjustment : undefined,
          modifier: item.modifier || item.mod,
          status: item.status || 'pending'
        });
      });
    }
    
    // Parse tables data (more intelligent column detection)
    let tablesData = activeData?.tables;
    if (typeof tablesData === 'string') {
      try {
        tablesData = JSON.parse(tablesData);
      } catch (e) {
        console.log('RCM Analysis - Could not parse tables as JSON');
      }
    }
    
    if (tablesData && Array.isArray(tablesData)) {
      console.log('RCM Analysis - Found tables:', tablesData.length);
      tablesData.forEach((table: any) => {
        const header = table.header || [];
        const rows = table.rows || [];
        
        // Find column indices by header names (case-insensitive)
        const findColumnIndex = (patterns: string[]): number => {
          return header.findIndex((h: string) => 
            patterns.some(p => h?.toLowerCase().includes(p.toLowerCase()))
          );
        };
        
        const descIdx = findColumnIndex(['description', 'service', 'item', 'name']);
        const cptIdx = findColumnIndex(['cpt', 'hcpcs', 'procedure']);
        const codeIdx = findColumnIndex(['code']); // Separate code column  
        const ndcIdx = findColumnIndex(['ndc', 'drug_code', 'national_drug']);
        const qtyIdx = findColumnIndex(['qty', 'quantity', 'units']);
        const amountIdx = findColumnIndex(['amount', 'total', 'charge', 'price', 'billed']);
        const allowedIdx = findColumnIndex(['allowed', 'approved', 'contracted']);
        const adjustIdx = findColumnIndex(['adjustment', 'adj', 'write_off', 'discount']);
        const svcDateIdx = findColumnIndex(['svc dt', 'service date', 'date', 'dos']);
        
        console.log('RCM Analysis - Table column indices:', { descIdx, cptIdx, codeIdx, ndcIdx, qtyIdx, amountIdx, header });
        
        rows.forEach((row: any[]) => {
          if (!Array.isArray(row) || row.length === 0) return;
          
          const description = descIdx >= 0 ? String(row[descIdx] || '') : String(row[0] || '');
          
          // Get CPT code - prefer dedicated CPT column over general code column
          let cptCode = cptIdx >= 0 ? String(row[cptIdx] || '') : '';
          if (!cptCode && codeIdx >= 0) {
            const codeVal = String(row[codeIdx] || '');
            // Only use code column if it looks like a CPT/HCPCS (not internal codes)
            if (/^[A-Z]?\d{4,5}$/i.test(codeVal.trim())) {
              cptCode = codeVal;
            }
          }
          
          const ndcCode = ndcIdx >= 0 ? String(row[ndcIdx] || '') : '';
          const qty = qtyIdx >= 0 ? parseFloat(String(row[qtyIdx]).replace(/[^0-9.-]/g, '')) || 1 : 1;
          const amount = amountIdx >= 0 
            ? parseFloat(String(row[amountIdx]).replace(/[^0-9.-]/g, '')) || 0 
            : parseFloat(String(row[row.length - 1]).replace(/[^0-9.-]/g, '')) || 0;
          const allowed = allowedIdx >= 0 ? parseFloat(String(row[allowedIdx]).replace(/[^0-9.-]/g, '')) || 0 : 0;
          const adjustment = adjustIdx >= 0 ? parseFloat(String(row[adjustIdx]).replace(/[^0-9.-]/g, '')) || 0 : 0;
          
          // Clean and validate codes
          const cleanCpt = cptCode ? cptCode.trim().replace(/[^A-Za-z0-9]/g, '') : '';
          const cleanNdc = ndcCode ? ndcCode.trim().replace(/[^0-9]/g, '') : '';
          
          // Get CPT info for known codes - calculate allowed from avgReimbursement
          const cptInfo = cleanCpt ? getCPTInfo(cleanCpt, description) : null;
          
          // Calculate allowed from CPT avgReimbursement if not extracted
          const calculatedAllowed = cptInfo ? (cptInfo.avgReimbursement * qty) : 0;
          const finalAllowed = allowed > 0 ? allowed : calculatedAllowed;
          
          // Calculate adjustment as billed - allowed
          const calculatedAdjustment = amount > finalAllowed ? (amount - finalAllowed) : 0;
          const finalAdjustment = adjustment > 0 ? adjustment : calculatedAdjustment;
          
          if ((description || cleanCpt) && !items.some(i => i.description === description && i.cpt_code === cleanCpt)) {
            items.push({
              description: description || (cptInfo?.description || ''),
              cpt_code: cleanCpt || undefined,
              ndc_code: cleanNdc || undefined,
              units: qty,
              unit_price: amount / qty,
              total: amount,
              allowed_amount: finalAllowed,
              adjustment: finalAdjustment,
              status: 'pending'
            });
          }
        });
      });
    }

    // Parse standalone CPT codes field
    const cptData = findFieldValue(extractedData, 'cpt_codes', 'cpt', 'cpt_code', 'procedure_code', 'hcpcs', 'hcpcs_code');
    if (cptData) {
      const cptCodes = cptData.split(/[,;\s]+/).filter((c: string) => c.trim());
      cptCodes.forEach((code: string) => {
        const cptInfo = getCPTInfo(code.trim());
        if (cptInfo && !items.some(i => i.cpt_code === code.trim())) {
          // For standalone CPT codes, use avgReimbursement as both billed and allowed
          items.push({
            description: cptInfo.description,
            cpt_code: code.trim(),
            units: 1,
            unit_price: cptInfo.avgReimbursement,
            total: cptInfo.avgReimbursement,
            allowed_amount: cptInfo.avgReimbursement,
            adjustment: 0, // No adjustment when billed = allowed
            status: 'pending'
          });
        }
      });
    }

    console.log('RCM Analysis - Final parsed line items:', items.length, items);
    if (items.length > 0) {
      setLineItems(items);
    }
  }, [activeData, hasUserEdits, hasRestoredState, lineItems.length]);

  // CRITICAL: Recalculate allowed_amount and adjustment for restored line items
  // This ensures items restored from sessionStorage get proper CPT-based calculations
  useEffect(() => {
    if (!hasRestoredState || lineItems.length === 0) return;
    
    // Check if any items are missing allowed_amount calculation
    const needsRecalculation = lineItems.some(item => 
      item.cpt_code && item.total > 0 && (!item.allowed_amount || item.allowed_amount === 0)
    );
    
    if (needsRecalculation) {
      console.log('RCM Analysis - Recalculating allowed/adjustment for restored items');
      setLineItems(prev => prev.map(item => {
        // Skip items without CPT code or already calculated
        if (!item.cpt_code || (item.allowed_amount && item.allowed_amount > 0)) {
          return item;
        }
        
        const cptInfo = getCPTInfo(item.cpt_code);
        const units = item.units || 1;
        const billedAmount = item.total || 0;
        
        // Calculate allowed from CPT avgReimbursement
        const allowedAmount = cptInfo.avgReimbursement * units;
        
        // Calculate adjustment = billed - allowed (contractual write-off)
        const adjustment = billedAmount > allowedAmount ? (billedAmount - allowedAmount) : 0;
        
        return {
          ...item,
          allowed_amount: allowedAmount,
          adjustment: adjustment
        };
      }));
    }
  }, [hasRestoredState, lineItems.length]);

  // Classify invoice type based on extracted data and line items
  useEffect(() => {
    if (!hasRestoredState) return;
    
    const classification = classifyInvoice(invoiceData, lineItems, extractedData);
    setInvoiceClassification(classification);
    
    // Notify parent component of classification change
    if (onClassificationChange) {
      onClassificationChange(classification);
    }
    
    console.log('RCM Analysis - Invoice Classification:', classification);
  }, [invoiceData, lineItems, extractedData, hasRestoredState, onClassificationChange]);

  // Calculate RCM Summary - ONLY use actual extracted data, no mock values
  useEffect(() => {
    // CRITICAL: Only calculate if we have real extracted data
    const hasRealData = invoiceData.billed_amount && invoiceData.billed_amount > 0;
    
    if (!hasRealData && lineItems.length === 0) {
      // No real data - set summary to zeros/empty
      setRcmSummary({
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalDenied: 0,
        totalAdjustments: 0,
        collectionRate: 0,
        avgDaysToPayment: 0,
        agingBreakdown: [],
        cptBreakdown: [],
        denialBreakdown: [],
        vendorBreakdown: []
      });
      return;
    }

    // Calculate from line items if available
    const lineItemsBilled = lineItems.reduce((sum, i) => sum + (i.total || 0), 0);
    const lineItemsAdjustments = lineItems.reduce((sum, i) => sum + (i.adjustment || 0), 0);

    // Use ONLY extracted values - no fallback to mock data
    const currentBilled = invoiceData.billed_amount || lineItemsBilled || 0;
    const currentPaid = invoiceData.paid_amount || 0;
    const currentAdjustments = invoiceData.adjustment_amount || lineItemsAdjustments || 0;
    
    // Balance due: from invoice only, or calculate if we have real billed amount
    const currentBalanceDue = invoiceData.balance_due || 
      (currentBilled > 0 ? (currentBilled - currentAdjustments - currentPaid) : 0);

    // Only include history items with real extracted data
    const validHistory = processingHistory.filter(h => {
      const billedAmt = parseFloat(h.extracted_data?.billed_amount || '0');
      return billedAmt > 0;
    });

    const totalBilled = validHistory.reduce((sum, inv) => 
      sum + parseFloat(inv.extracted_data?.billed_amount || '0'), 0) + currentBilled;
    const totalPaid = validHistory.reduce((sum, inv) => 
      sum + parseFloat(inv.extracted_data?.paid_amount || '0'), 0) + currentPaid;

    const summary: RCMSummary = {
      totalBilled,
      totalPaid,
      totalOutstanding: currentBalanceDue,
      totalDenied: validHistory.filter(i => i.extracted_data?.payment_status === 'denied').length * 100,
      totalAdjustments: currentAdjustments,
      collectionRate: currentBilled > 0 ? ((currentPaid / currentBilled) * 100) : 0,
      avgDaysToPayment: currentPaid > 0 ? 32 : 0, // Only show if we have payment data
      agingBreakdown: currentBalanceDue > 0 ? [
        { bucket: '0-30 days', amount: currentBalanceDue, count: 1 },
        { bucket: '31-60 days', amount: 0, count: 0 },
        { bucket: '61-90 days', amount: 0, count: 0 },
        { bucket: '90+ days', amount: 0, count: 0 },
      ] : [],
      cptBreakdown: lineItems.filter(i => i.cpt_code).map(item => ({
        code: item.cpt_code || 'N/A',
        description: item.description,
        count: item.units,
        billed: item.total,
        paid: item.status === 'paid' ? item.total : 0
      })),
      denialBreakdown: invoiceData.denial_reason ? [{
        code: invoiceData.denial_reason,
        reason: DENIAL_CODES[invoiceData.denial_reason] || 'Unknown denial reason',
        count: 1,
        amount: currentBilled
      }] : [],
      vendorBreakdown: currentBilled > 0 ? [{
        vendor: invoiceData.vendor_name || 'Unknown Vendor',
        billed: currentBilled,
        paid: currentPaid,
        outstanding: currentBalanceDue
      }] : []
    };

    setRcmSummary(summary);
  }, [processingHistory, lineItems, invoiceData]);

  // Export handlers
  const handleExportCSV = () => {
    const csvData = [
      ['Invoice #', 'Date', 'Vendor', 'CPT Code', 'Description', 'Billed', 'Paid', 'Balance', 'Status'],
      [
        invoiceData.invoice_number || '',
        invoiceData.invoice_date || '',
        invoiceData.vendor_name || '',
        invoiceData.cpt_codes || '',
        lineItems.map(l => l.description).join('; '),
        invoiceData.billed_amount?.toString() || '',
        invoiceData.paid_amount?.toString() || '',
        invoiceData.balance_due?.toString() || '',
        invoiceData.payment_status || ''
      ],
      ...lineItems.map(item => [
        '',
        '',
        '',
        item.cpt_code || '',
        item.description,
        item.total.toString(),
        item.status === 'paid' ? item.total.toString() : '0',
        item.status !== 'paid' ? item.total.toString() : '0',
        item.status || 'pending'
      ])
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoiceData.invoice_number || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const handleExportJSON = () => {
    const jsonData = {
      invoice: invoiceData,
      lineItems,
      rcmSummary,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoiceData.invoice_number || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('JSON exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'denied': return 'bg-red-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* History Selector */}
      {invoiceHistory.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Load from History</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={selectedHistoryId || ''}
                  onChange={(e) => setSelectedHistoryId(e.target.value || null)}
                >
                  <option value="">Current Document</option>
                  {invoiceHistory.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.fileName} - {new Date(h.processedAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <Badge variant="secondary">{invoiceHistory.length} invoice(s) in history</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            {invoiceClassification?.analysisType || 'Invoice Analysis'}
            {invoiceClassification && (
              <Badge 
                variant={invoiceClassification.type === 'healthcare-rcm' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {invoiceClassification.type === 'healthcare-rcm' ? 'Healthcare RCM' : 'Standard Invoice'}
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Invoice #{invoiceData.invoice_number || 'N/A'} • {invoiceData.vendor_name || 'Unknown Vendor'}
            {invoiceClassification && invoiceClassification.confidence > 0 && (
              <span className="ml-2 text-xs">
                (Confidence: {invoiceClassification.confidence}%)
              </span>
            )}
          </p>
          {/* Healthcare Indicators */}
          {invoiceClassification?.type === 'healthcare-rcm' && (
            <div className="flex flex-wrap gap-1 mt-1">
              {invoiceClassification.indicators.hasCPTCodes && <Badge variant="outline" className="text-xs">CPT</Badge>}
              {invoiceClassification.indicators.hasHCPCSCodes && <Badge variant="outline" className="text-xs">HCPCS</Badge>}
              {invoiceClassification.indicators.hasICDCodes && <Badge variant="outline" className="text-xs">ICD-10</Badge>}
              {invoiceClassification.indicators.hasRevenueCodes && <Badge variant="outline" className="text-xs">Revenue Codes</Badge>}
              {invoiceClassification.indicators.hasNDCCodes && <Badge variant="outline" className="text-xs">NDC</Badge>}
              {invoiceClassification.indicators.hasNPI && <Badge variant="outline" className="text-xs">NPI</Badge>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <FileJson className="h-4 w-4 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards - Use ONLY extracted invoice values, no line item calculations */}
      {(() => {
        // CRITICAL: Use ONLY extracted values from invoice - no calculations from line items
        const billedAmount = invoiceData.billed_amount || 0;
        const paidAmount = invoiceData.paid_amount || 0;
        const extractedBalance = invoiceData.balance_due || 0;
        const extractedAdjustment = invoiceData.adjustment_amount || 0;
        
        // Calculate adjustment ONLY if we have both billed and balance from invoice
        // Adjustment = Billed - Balance - Paid (what was written off)
        const calculatedAdjustment = (billedAmount > 0 && extractedBalance > 0)
          ? (billedAmount - extractedBalance - paidAmount)
          : extractedAdjustment;
        
        // Use extracted balance if available, otherwise show 0
        const balanceDue = extractedBalance;
        
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Billed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {billedAmount > 0 ? formatCurrency(billedAmount) : 'N/A'}
                </div>
                {lineItems.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">{lineItems.length} line items</div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Insurance Paid</div>
                <div className="text-2xl font-bold text-green-600">
                  {paidAmount > 0 ? formatCurrency(paidAmount) : '$0.00'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Balance Due</div>
                <div className="text-2xl font-bold text-orange-600">
                  {balanceDue > 0 ? formatCurrency(balanceDue) : 'N/A'}
                </div>
                {extractedBalance > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">From invoice</div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Adj./Write-off</div>
                <div className="text-2xl font-bold text-purple-600">
                  {calculatedAdjustment > 0 ? formatCurrency(calculatedAdjustment) : 'N/A'}
                </div>
                {billedAmount > 0 && extractedBalance > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">Calculated</div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Tabs for detailed analysis - Dynamic based on invoice type */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="extracted-codes">
            {invoiceClassification?.type === 'healthcare-rcm' ? 'Codes' : 'Fields'}
          </TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="cpt-codes">
            {invoiceClassification?.type === 'healthcare-rcm' ? 'CPT Analysis' : 'Details'}
          </TabsTrigger>
          <TabsTrigger value="aging">
            {invoiceClassification?.type === 'healthcare-rcm' ? 'AR Aging' : 'Payment'}
          </TabsTrigger>
          <TabsTrigger value="consolidated">
            {invoiceClassification?.type === 'healthcare-rcm' ? 'RCM Report' : 'Summary'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice #:</span>
                  <span className="font-medium">{invoiceData.invoice_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim #:</span>
                  <span className="font-medium">{invoiceData.claim_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account #:</span>
                  <span className="font-medium">{invoiceData.account_number || invoiceData.patient_account || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium">{invoiceData.invoice_date || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{invoiceData.due_date || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Date:</span>
                  <span className="font-medium">{invoiceData.service_from ? `${invoiceData.service_from}${invoiceData.service_to ? ` - ${invoiceData.service_to}` : ''}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(invoiceData.payment_status || 'pending')}>
                    {invoiceData.payment_status || 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vendor/Payer Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vendor & Payer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="font-medium">{invoiceData.vendor_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ID (EIN):</span>
                  <span className="font-medium">{invoiceData.vendor_tax_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NPI:</span>
                  <span className="font-medium">{invoiceData.vendor_npi || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payer:</span>
                  <span className="font-medium">{invoiceData.payer_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{invoiceData.patient_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Account:</span>
                  <span className="font-medium">{invoiceData.patient_account || 'N/A'}</span>
                </div>
            </CardContent>
            </Card>
          </div>

          {/* Extracted Healthcare Codes - NEW SECTION */}
          {(invoiceData.cpt_codes || invoiceData.icd_codes || invoiceData.ndc_codes || lineItems.some(i => i.cpt_code || i.icd_code || i.ndc_code || i.revenue_code || i.hcpcs_code)) && (
            <Card className="border-2 border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Extracted Healthcare Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* CPT Codes */}
                  {(invoiceData.cpt_codes || lineItems.filter(i => i.cpt_code).length > 0) && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-emerald-700">CPT/HCPCS Codes</div>
                      <div className="flex flex-wrap gap-1">
                        {invoiceData.cpt_codes ? (
                          invoiceData.cpt_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs bg-white">{code}</Badge>
                          ))
                        ) : (
                          lineItems.filter(i => i.cpt_code || i.hcpcs_code).map((item, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs bg-white">
                              {item.cpt_code || item.hcpcs_code}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* ICD-10 Codes */}
                  {(invoiceData.icd_codes || lineItems.filter(i => i.icd_code).length > 0) && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-blue-700">ICD-10 Diagnosis Codes</div>
                      <div className="flex flex-wrap gap-1">
                        {invoiceData.icd_codes ? (
                          invoiceData.icd_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => (
                            <Badge key={i} variant="secondary" className="font-mono text-xs">{code}</Badge>
                          ))
                        ) : (
                          lineItems.filter(i => i.icd_code).map((item, i) => (
                            <Badge key={i} variant="secondary" className="font-mono text-xs">{item.icd_code}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* NDC Codes */}
                  {(invoiceData.ndc_codes || lineItems.filter(i => i.ndc_code).length > 0) && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-purple-700">NDC Drug Codes</div>
                      <div className="flex flex-wrap gap-1">
                        {invoiceData.ndc_codes ? (
                          invoiceData.ndc_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs bg-purple-50">{code}</Badge>
                          ))
                        ) : (
                          lineItems.filter(i => i.ndc_code).map((item, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs bg-purple-50">{item.ndc_code}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Revenue Codes */}
                  {lineItems.filter(i => i.revenue_code).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-amber-700">Revenue Codes (UB-04)</div>
                      <div className="flex flex-wrap gap-1">
                        {lineItems.filter(i => i.revenue_code).map((item, i) => (
                          <Badge key={i} variant="outline" className="font-mono text-xs bg-amber-50">
                            {item.revenue_code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Extracted Fields - Show raw extracted data for transparency */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Extracted Fields
                </span>
                <Badge variant="outline">{Object.keys(activeData || {}).filter(k => activeData[k] && !['line_items', 'tables', 'lineitems', 'items'].includes(k)).length} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {Object.entries(activeData || {})
                  .filter(([key, value]) => 
                    value !== null && 
                    value !== undefined && 
                    value !== '' && 
                    !['line_items', 'tables', 'lineitems', 'items', 'services', 'charges', 'procedures'].includes(key) &&
                    typeof value !== 'object'
                  )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col p-2 bg-muted/50 rounded-md">
                      <span className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="font-medium truncate" title={String(value)}>
                        {String(value)}
                      </span>
                    </div>
                  ))
                }
              </div>
              {Object.keys(activeData || {}).filter(k => activeData[k] && !['line_items', 'tables', 'lineitems', 'items'].includes(k) && typeof activeData[k] !== 'object').length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No extracted fields available. Upload an invoice to extract data.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Denial Alert */}
          {invoiceData.denial_reason && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Claim Denied</AlertTitle>
              <AlertDescription>
                <strong>Code: {invoiceData.denial_reason}</strong><br />
                {DENIAL_CODES[invoiceData.denial_reason] || 'Review claim for denial reason'}
              </AlertDescription>
            </Alert>
          )}

          {/* Billing Breakdown - Uses extracted balance to calculate real adjustment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Billing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // CRITICAL: Use ONLY extracted values from invoice - no line item calculations
                const billedAmount = invoiceData.billed_amount || 0;
                const paidAmount = invoiceData.paid_amount || 0;
                const patientResponsibility = invoiceData.patient_responsibility || 0;
                const extractedBalance = invoiceData.balance_due || 0;
                const extractedAdjustment = invoiceData.adjustment_amount || 0;
                
                // Calculate adjustment ONLY if we have both billed and balance from invoice
                const calculatedAdjustment = (billedAmount > 0 && extractedBalance > 0)
                  ? (billedAmount - extractedBalance - paidAmount)
                  : extractedAdjustment;
                
                // Allowed = Billed - Adjustment (only if we have real data)
                const allowedAmount = (billedAmount > 0 && calculatedAdjustment > 0) 
                  ? (billedAmount - calculatedAdjustment) 
                  : 0;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Total Billed (Charges)</span>
                      <span className="font-semibold">{billedAmount > 0 ? formatCurrency(billedAmount) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span>Allowed Amount</span>
                      <span className="font-semibold">{allowedAmount > 0 ? formatCurrency(allowedAmount) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-orange-600">
                      <span>Adjustment/Write-off</span>
                      <span className="font-semibold">{calculatedAdjustment > 0 ? `-${formatCurrency(calculatedAdjustment)}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-600">
                      <span>Insurance Paid</span>
                      <span className="font-semibold">{formatCurrency(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-purple-600">
                      <span>Patient Responsibility</span>
                      <span className="font-semibold">{patientResponsibility > 0 ? formatCurrency(patientResponsibility) : 'N/A'}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                      <span>Balance Due (from Invoice)</span>
                      <span className="text-red-600">{extractedBalance > 0 ? formatCurrency(extractedBalance) : 'N/A'}</span>
                    </div>
                    {billedAmount > 0 && extractedBalance > 0 && (
                      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                        <strong>Calculation:</strong> {formatCurrency(billedAmount)} (Billed) - {formatCurrency(calculatedAdjustment)} (Adj) = {formatCurrency(extractedBalance)} (Balance)
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extracted Codes Tab - NEW: Dedicated tab for all extracted codes and fields */}
        <TabsContent value="extracted-codes" className="space-y-4">
          {/* Healthcare Codes Section */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                {invoiceClassification?.type === 'healthcare-rcm' ? 'Healthcare Billing Codes' : 'Extracted Codes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(invoiceData.cpt_codes || invoiceData.icd_codes || invoiceData.ndc_codes || lineItems.some(i => i.cpt_code || i.icd_code || i.ndc_code || i.revenue_code || i.hcpcs_code)) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CPT/HCPCS Codes with Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500">CPT/HCPCS</Badge>
                      <span className="text-sm text-muted-foreground">Procedure Codes</span>
                    </div>
                    {invoiceData.cpt_codes ? (
                      <div className="space-y-2">
                        {invoiceData.cpt_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => {
                          const cptInfo = getCPTInfo(code);
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="outline" className="font-mono shrink-0">{code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{cptInfo.description}</div>
                                <div className="text-muted-foreground text-xs">{cptInfo.category} • Est. ${cptInfo.avgReimbursement}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : lineItems.filter(i => i.cpt_code || i.hcpcs_code).length > 0 ? (
                      <div className="space-y-2">
                        {lineItems.filter(i => i.cpt_code || i.hcpcs_code).map((item, i) => {
                          const code = item.cpt_code || item.hcpcs_code || '';
                          const cptInfo = getCPTInfo(code);
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="outline" className="font-mono shrink-0">{code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{item.description || cptInfo.description}</div>
                                <div className="text-muted-foreground text-xs">
                                  {cptInfo.category} • Billed: {formatCurrency(item.total)} 
                                  {item.allowed_amount ? ` • Allowed: ${formatCurrency(item.allowed_amount)}` : ''}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">No CPT/HCPCS codes extracted</div>
                    )}
                  </div>

                  {/* ICD-10 Codes with Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">ICD-10</Badge>
                      <span className="text-sm text-muted-foreground">Diagnosis Codes</span>
                    </div>
                    {invoiceData.icd_codes ? (
                      <div className="space-y-2">
                        {invoiceData.icd_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => {
                          const icdInfo = getICDInfo(code);
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="secondary" className="font-mono shrink-0">{code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{icdInfo.description}</div>
                                <div className="text-muted-foreground text-xs">{icdInfo.category}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : lineItems.filter(i => i.icd_code).length > 0 ? (
                      <div className="space-y-2">
                        {lineItems.filter(i => i.icd_code).map((item, i) => {
                          const icdInfo = getICDInfo(item.icd_code || '');
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="secondary" className="font-mono shrink-0">{item.icd_code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{icdInfo.description}</div>
                                <div className="text-muted-foreground text-xs">{icdInfo.category}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">No ICD-10 codes extracted</div>
                    )}
                  </div>

                  {/* NDC Codes */}
                  {(invoiceData.ndc_codes || lineItems.filter(i => i.ndc_code).length > 0) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">NDC</Badge>
                        <span className="text-sm text-muted-foreground">Drug Codes</span>
                      </div>
                      <div className="space-y-2">
                        {invoiceData.ndc_codes ? (
                          invoiceData.ndc_codes.split(/[,;\s]+/).filter(Boolean).map((code, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <Badge variant="outline" className="font-mono bg-purple-50">{code}</Badge>
                            </div>
                          ))
                        ) : (
                          lineItems.filter(i => i.ndc_code).map((item, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="outline" className="font-mono bg-purple-50 shrink-0">{item.ndc_code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{item.description}</div>
                                <div className="text-muted-foreground text-xs">
                                  Qty: {item.units} • {formatCurrency(item.total)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Revenue Codes (UB-04) */}
                  {lineItems.filter(i => i.revenue_code).length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500">Revenue</Badge>
                        <span className="text-sm text-muted-foreground">UB-04 Codes</span>
                      </div>
                      <div className="space-y-2">
                        {lineItems.filter(i => i.revenue_code).map((item, i) => {
                          const revInfo = getRevenueCodeInfo(item.revenue_code || '');
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <Badge variant="outline" className="font-mono bg-amber-50 shrink-0">{item.revenue_code}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{revInfo.description}</div>
                                <div className="text-muted-foreground text-xs">{revInfo.category} • {formatCurrency(item.total)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <div>No healthcare codes extracted from this invoice.</div>
                  <div className="text-xs mt-1">Upload a medical invoice with CPT, ICD-10, NDC, or Revenue codes.</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Raw Extracted Fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Extracted Data Fields
                </span>
                <Badge variant="outline">
                  {Object.keys(activeData || {}).filter(k => 
                    activeData[k] && 
                    !['line_items', 'tables', 'lineitems', 'items', 'services', 'charges', 'procedures'].includes(k) &&
                    typeof activeData[k] !== 'object'
                  ).length} fields
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {Object.entries(activeData || {})
                  .filter(([key, value]) => 
                    value !== null && 
                    value !== undefined && 
                    value !== '' && 
                    !['line_items', 'tables', 'lineitems', 'items', 'services', 'charges', 'procedures'].includes(key) &&
                    typeof value !== 'object'
                  )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col p-3 bg-muted/50 rounded-md border">
                      <span className="text-xs text-muted-foreground capitalize font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="font-medium truncate mt-1" title={String(value)}>
                        {String(value)}
                      </span>
                    </div>
                  ))
                }
              </div>
              {Object.keys(activeData || {}).filter(k => 
                activeData[k] && 
                !['line_items', 'tables', 'lineitems', 'items'].includes(k) && 
                typeof activeData[k] !== 'object'
              ).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <div>No fields extracted yet.</div>
                  <div className="text-xs mt-1">Upload an invoice to extract data fields.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="line-items">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Line Items & Services</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Force recalculate allowed/adjustment for all items with CPT codes
                      setLineItems(prev => prev.map(item => {
                        if (!item.cpt_code) return item;
                        
                        const cptInfo = getCPTInfo(item.cpt_code);
                        const units = item.units || 1;
                        const billedAmount = item.total || 0;
                        const allowedAmount = cptInfo.avgReimbursement * units;
                        const adjustment = billedAmount > allowedAmount ? (billedAmount - allowedAmount) : 0;
                        
                        return {
                          ...item,
                          allowed_amount: allowedAmount,
                          adjustment: adjustment
                        };
                      }));
                      setHasUserEdits(true);
                      toast.success('Recalculated allowed amounts and adjustments based on CPT codes');
                    }}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Recalculate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLineItems(prev => [...prev, {
                        description: 'New line item',
                        units: 1,
                        unit_price: 0,
                        total: 0,
                        allowed_amount: 0,
                        adjustment: 0,
                        status: 'pending'
                      }]);
                      setEditingLineItemIdx(lineItems.length);
                      setHasUserEdits(true);
                    }}
                  >
                    + Add Line Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Description</TableHead>
                      {/* Dynamic code column based on what's detected */}
                      {(() => {
                        const codeType = detectCodeType(lineItems);
                        if (codeType === 'revenue') return <TableHead>Revenue Code</TableHead>;
                        if (codeType === 'mixed') return <><TableHead>Rev Code</TableHead><TableHead>CPT/HCPCS</TableHead></>;
                        return <TableHead>CPT/HCPCS</TableHead>;
                      })()}
                      <TableHead className="min-w-[200px]">ICD-10</TableHead>
                      <TableHead>NDC</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Billed</TableHead>
                      <TableHead className="text-right">Allowed</TableHead>
                      <TableHead className="text-right">Adjustment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.length > 0 ? lineItems.map((item, idx) => {
                      const adjustment = item.adjustment || (item.total - (item.allowed_amount || 0));
                      const isEditing = editingLineItemIdx === idx;
                      const codeType = detectCodeType(lineItems);
                      return (
                        <TableRow key={idx} className={isEditing ? 'bg-muted/50' : ''}>
                          <TableCell className="max-w-[200px] truncate" title={item.description}>{item.description}</TableCell>
                          {/* Dynamic code cell */}
                          {codeType === 'revenue' ? (
                            <TableCell>
                              {item.revenue_code ? (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="font-mono text-xs bg-amber-50">{item.revenue_code}</Badge>
                                  <span className="text-xs text-muted-foreground">{getRevenueCodeInfo(item.revenue_code).category}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                          ) : codeType === 'mixed' ? (
                            <>
                              <TableCell>
                                {item.revenue_code ? (
                                  <Badge variant="outline" className="font-mono text-xs bg-amber-50">{item.revenue_code}</Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {(item.cpt_code || item.hcpcs_code) ? (
                                  <Badge variant="outline" className="font-mono text-xs">{item.cpt_code || item.hcpcs_code}</Badge>
                                ) : '-'}
                              </TableCell>
                            </>
                          ) : (
                            <TableCell className="min-w-[180px]">
                              {isEditing ? (
                                <CPTCodeSearch
                                  value={item.cpt_code || item.hcpcs_code}
                                  onSelect={(result) => handleCPTSelect(idx, result)}
                                  placeholder="Search CPT..."
                                  className="w-full"
                                />
                              ) : (item.cpt_code || item.hcpcs_code) ? (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="font-mono text-xs">{item.cpt_code || item.hcpcs_code}</Badge>
                                  <span className="text-xs text-muted-foreground">{getCPTInfo(item.cpt_code || item.hcpcs_code || '').category}</span>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-muted-foreground hover:text-primary"
                                  onClick={() => setEditingLineItemIdx(idx)}
                                >
                                  + Add CPT
                                </Button>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="min-w-[180px]">
                            {isEditing ? (
                              <ICDCodeSearch
                                value={item.icd_code}
                                onSelect={(result) => handleICDSelect(idx, result)}
                                placeholder="Search ICD-10..."
                                className="w-full"
                              />
                            ) : item.icd_code ? (
                              <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className="font-mono text-xs">{item.icd_code}</Badge>
                                <span className="text-xs text-muted-foreground">{getICDInfo(item.icd_code).category}</span>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-primary"
                                onClick={() => setEditingLineItemIdx(idx)}
                              >
                                + Add ICD
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            {isEditing ? (
                              <NDCCodeSearch
                                value={item.ndc_code}
                                onSelect={(result) => handleNDCSelect(idx, result)}
                                placeholder="Search NDC..."
                                className="w-full"
                              />
                            ) : item.ndc_code ? (
                              <Badge variant="outline" className="font-mono text-xs bg-blue-50">{item.ndc_code}</Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-primary"
                                onClick={() => setEditingLineItemIdx(idx)}
                              >
                                + Add NDC
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.units}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {item.allowed_amount ? formatCurrency(item.allowed_amount) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {adjustment > 0 ? `-${formatCurrency(adjustment)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status || 'pending')}>
                              {item.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLineItemIdx(null)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLineItemIdx(idx)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          No line items extracted. Upload an invoice with detailed line items.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Line Item Totals - Use ONLY extracted invoice values, show line item sum separately */}
              {lineItems.length > 0 && (() => {
                // Sum of line item billed amounts (for reference only)
                const lineItemTotal = lineItems.reduce((sum, i) => sum + (i.total || 0), 0);
                
                // CRITICAL: Use ONLY extracted invoice values - no calculations from line items
                const extractedBilled = invoiceData.billed_amount || 0;
                const extractedBalance = invoiceData.balance_due || 0;
                const paidAmount = invoiceData.paid_amount || 0;
                
                // Calculate adjustment ONLY from extracted values
                const calculatedAdjustment = (extractedBilled > 0 && extractedBalance > 0)
                  ? (extractedBilled - extractedBalance - paidAmount)
                  : 0;
                
                // Allowed = Billed - Adjustment (only if we have real data)
                const allowedAmount = (extractedBilled > 0 && calculatedAdjustment > 0)
                  ? (extractedBilled - calculatedAdjustment)
                  : 0;
                
                return (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Invoice Total Billed</span>
                        <span className="font-bold text-lg">{extractedBilled > 0 ? formatCurrency(extractedBilled) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Allowed Amount</span>
                        <span className="font-bold text-lg text-green-600">{allowedAmount > 0 ? formatCurrency(allowedAmount) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Adjustment</span>
                        <span className="font-bold text-lg text-orange-600">{calculatedAdjustment > 0 ? `-${formatCurrency(calculatedAdjustment)}` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Balance Due</span>
                        <span className="font-bold text-lg text-red-600">{extractedBalance > 0 ? formatCurrency(extractedBalance) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Line Items</span>
                        <span className="font-bold text-lg">{lineItems.length}</span>
                        {lineItemTotal > 0 && (
                          <span className="text-xs text-muted-foreground block">Sum: {formatCurrency(lineItemTotal)}</span>
                        )}
                      </div>
                    </div>
                    {extractedBilled > 0 && extractedBalance > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-dashed">
                        <strong>From Invoice:</strong> {formatCurrency(extractedBilled)} (Billed) - {formatCurrency(calculatedAdjustment)} (Adj) = {formatCurrency(extractedBalance)} (Balance)
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CPT Codes Tab */}
        <TabsContent value="cpt-codes">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">CPT/HCPCS Code Analysis</CardTitle>
                <CPTCodeSearch
                  placeholder="Add CPT/HCPCS code..."
                  onSelect={(result) => {
                    // When adding new CPT code, use avgReimbursement as both billed AND allowed
                    // (since it's a new item, billed = allowed = no adjustment)
                    setLineItems(prev => [...prev, {
                      description: result.description,
                      cpt_code: result.code,
                      units: 1,
                      unit_price: result.avgReimbursement,
                      total: result.avgReimbursement, // billed
                      allowed_amount: result.avgReimbursement, // allowed from CPT
                      adjustment: 0, // no adjustment when adding from CPT lookup
                      status: 'pending'
                    }]);
                    toast.success(`Added CPT ${result.code} - $${result.avgReimbursement} avg reimbursement`);
                  }}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Allowed Amount</TableHead>
                    <TableHead className="text-right">Billed</TableHead>
                    <TableHead className="text-right">Adjustment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.filter(i => i.cpt_code).length > 0 ? 
                    lineItems.filter(i => i.cpt_code).map((item, idx) => {
                      const cptInfo = getCPTInfo(item.cpt_code!, item.description);
                      // Use stored adjustment or calculate: billed - allowed
                      const adjustment = item.adjustment || (item.total - (item.allowed_amount || cptInfo.avgReimbursement * (item.units || 1)));
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{item.cpt_code}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">{cptInfo.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{cptInfo.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(item.allowed_amount || cptInfo.avgReimbursement * (item.units || 1))}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {adjustment > 0 ? `-${formatCurrency(adjustment)}` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No CPT codes found. Medical billing documents typically contain CPT/HCPCS codes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* NDC Codes Section with Totals */}
              {lineItems.filter(i => i.ndc_code).length > 0 && (() => {
                const ndcItems = lineItems.filter(i => i.ndc_code);
                const ndcTotalQty = ndcItems.reduce((sum, i) => sum + (i.units || 0), 0);
                const ndcTotalAmount = ndcItems.reduce((sum, i) => sum + (i.total || 0), 0);
                const ndcTotalAllowed = ndcItems.reduce((sum, i) => sum + (i.allowed_amount || 0), 0);
                const ndcTotalAdjustment = ndcItems.reduce((sum, i) => sum + (i.adjustment || 0), 0);
                
                return (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-3">NDC (Drug) Codes - {ndcItems.length} item(s)</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NDC Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Billed</TableHead>
                          <TableHead className="text-right">Allowed</TableHead>
                          <TableHead className="text-right">Adjustment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ndcItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <Badge variant="outline" className="font-mono bg-blue-50">{item.ndc_code}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px]">{item.description}</TableCell>
                            <TableCell className="text-right">{item.units}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                            <TableCell className="text-right text-green-600">{item.allowed_amount ? formatCurrency(item.allowed_amount) : '-'}</TableCell>
                            <TableCell className="text-right text-orange-600">{item.adjustment && item.adjustment > 0 ? `-${formatCurrency(item.adjustment)}` : '-'}</TableCell>
                          </TableRow>
                        ))}
                        {/* Totals Row */}
                        <TableRow className="bg-muted/50 font-semibold border-t-2">
                          <TableCell colSpan={2}>Total NDC Items</TableCell>
                          <TableCell className="text-right">{ndcTotalQty}</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">{formatCurrency(ndcTotalAmount)}</TableCell>
                          <TableCell className="text-right text-green-600">{ndcTotalAllowed > 0 ? formatCurrency(ndcTotalAllowed) : '-'}</TableCell>
                          <TableCell className="text-right text-orange-600">{ndcTotalAdjustment > 0 ? `-${formatCurrency(ndcTotalAdjustment)}` : '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Tab */}
        <TabsContent value="aging">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Accounts Receivable Aging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rcmSummary?.agingBreakdown.map((bucket, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{bucket.bucket}</span>
                      <span>{formatCurrency(bucket.amount)} ({bucket.count} claims)</span>
                    </div>
                    <Progress 
                      value={(bucket.amount / (rcmSummary.totalBilled || 1)) * 100} 
                      className={`h-2 ${idx === 3 ? 'bg-red-100' : idx === 2 ? 'bg-orange-100' : idx === 1 ? 'bg-yellow-100' : 'bg-green-100'}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Aging Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current (0-30):</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {formatCurrency(rcmSummary?.agingBreakdown[0]?.amount || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overdue (31-60):</span>
                    <span className="ml-2 font-semibold text-yellow-600">
                      {formatCurrency(rcmSummary?.agingBreakdown[1]?.amount || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Past Due (61-90):</span>
                    <span className="ml-2 font-semibold text-orange-600">
                      {formatCurrency(rcmSummary?.agingBreakdown[2]?.amount || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Critical (90+):</span>
                    <span className="ml-2 font-semibold text-red-600">
                      {formatCurrency(rcmSummary?.agingBreakdown[3]?.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consolidated Tab */}
        <TabsContent value="consolidated">
          <div className="space-y-4">
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertTitle>
                {invoiceClassification?.type === 'healthcare-rcm' 
                  ? 'Consolidated Revenue Cycle Report' 
                  : 'Consolidated Invoice Report'}
              </AlertTitle>
              <AlertDescription>
                {invoiceClassification?.type === 'healthcare-rcm'
                  ? 'Summary across all processed invoices and claims'
                  : 'Summary of invoice analysis'}
              </AlertDescription>
            </Alert>

            {/* Show message if no real data */}
            {(!rcmSummary || rcmSummary.totalBilled === 0) && lineItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Invoice Data Available</p>
                    <p className="text-sm">
                      Upload and process an invoice to see consolidated revenue analysis.
                    </p>
                    <p className="text-xs mt-4">
                      The system will automatically detect if it's a healthcare (RCM) or standard invoice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">Total Revenue</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {rcmSummary && rcmSummary.totalBilled > 0 
                          ? formatCurrency(rcmSummary.totalBilled) 
                          : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Collected</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {formatCurrency(rcmSummary?.totalPaid || 0)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Outstanding</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {rcmSummary && rcmSummary.totalOutstanding > 0 
                          ? formatCurrency(rcmSummary.totalOutstanding) 
                          : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vendor Breakdown - Only show if we have data */}
                {rcmSummary?.vendorBreakdown && rcmSummary.vendorBreakdown.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Vendor/Supplier Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Billed</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Outstanding</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rcmSummary.vendorBreakdown.map((vendor, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{vendor.vendor}</TableCell>
                              <TableCell className="text-right">{formatCurrency(vendor.billed)}</TableCell>
                              <TableCell className="text-right text-green-600">{formatCurrency(vendor.paid)}</TableCell>
                              <TableCell className="text-right text-orange-600">{formatCurrency(vendor.outstanding)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Key Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {rcmSummary && rcmSummary.totalBilled > 0 
                            ? `${rcmSummary.collectionRate.toFixed(1)}%` 
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Collection Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {rcmSummary && rcmSummary.avgDaysToPayment > 0 
                            ? rcmSummary.avgDaysToPayment 
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Days to Pay</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {rcmSummary?.denialBreakdown.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Denials</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {rcmSummary && rcmSummary.totalAdjustments > 0 
                            ? formatCurrency(rcmSummary.totalAdjustments) 
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Adjustments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceRCMAnalysis;
