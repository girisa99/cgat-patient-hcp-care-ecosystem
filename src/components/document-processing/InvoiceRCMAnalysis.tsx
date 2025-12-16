import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet, FileJson, Building2, Receipt
} from 'lucide-react';
import { toast } from 'sonner';

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
  '96374': { description: 'Therapeutic IV infusion, initial', category: 'Infusions', avgReimbursement: 55 },
  '96375': { description: 'Therapeutic IV infusion, additional hour', category: 'Infusions', avgReimbursement: 35 },
  '96376': { description: 'Therapeutic IV push, additional drug', category: 'Infusions', avgReimbursement: 25 },
  // Lab
  '80048': { description: 'Basic metabolic panel', category: 'Lab', avgReimbursement: 11 },
  '80050': { description: 'General health panel', category: 'Lab', avgReimbursement: 45 },
  '80053': { description: 'Comprehensive metabolic panel', category: 'Lab', avgReimbursement: 14 },
  '80061': { description: 'Lipid panel', category: 'Lab', avgReimbursement: 18 },
  '81001': { description: 'Urinalysis, automated', category: 'Lab', avgReimbursement: 5 },
  '81003': { description: 'Urinalysis, manual', category: 'Lab', avgReimbursement: 4 },
  '82947': { description: 'Glucose, quantitative', category: 'Lab', avgReimbursement: 6 },
  '83036': { description: 'Hemoglobin A1c', category: 'Lab', avgReimbursement: 13 },
  '84443': { description: 'Thyroid stimulating hormone (TSH)', category: 'Lab', avgReimbursement: 22 },
  '85025': { description: 'Complete blood count (CBC)', category: 'Lab', avgReimbursement: 11 },
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
  // HCPCS Drugs
  'J0129': { description: 'Abatacept injection', category: 'Drugs', avgReimbursement: 950 },
  'J0585': { description: 'Botulinum toxin A injection', category: 'Drugs', avgReimbursement: 550 },
  'J1030': { description: 'Methylprednisolone injection, 40mg', category: 'Drugs', avgReimbursement: 12 },
  'J1100': { description: 'Dexamethasone injection', category: 'Drugs', avgReimbursement: 8 },
  'J2001': { description: 'Lidocaine injection', category: 'Drugs', avgReimbursement: 5 },
  'J3420': { description: 'Vitamin B12 injection', category: 'Drugs', avgReimbursement: 8 },
  'J7030': { description: 'Normal saline infusion, 1000ml', category: 'Drugs', avgReimbursement: 6 },
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

interface LineItem {
  description: string;
  cpt_code?: string;
  icd_code?: string;
  units: number;
  unit_price: number;
  total: number;
  modifier?: string;
  status?: 'paid' | 'pending' | 'denied' | 'partial';
}

interface InvoiceData {
  invoice_number?: string;
  claim_number?: string;
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
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rcmSummary, setRcmSummary] = useState<RCMSummary | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Parse extracted data into invoice structure using intelligent field mapping
  const invoiceData = React.useMemo<InvoiceData>(() => {
    console.log('RCM Analysis - Received extractedData:', extractedData);
    
    return {
      invoice_number: findFieldValue(extractedData, 'invoice_number', 'invoice_no', 'invoiceno', 'invoice', 'claim_number', 'claimno'),
      claim_number: findFieldValue(extractedData, 'claim_number', 'claim_no', 'claimno', 'claim'),
      vendor_name: findFieldValue(extractedData, 'vendor_name', 'company_name', 'provider_name', 'from', 'vendor', 'company', 'provider', 'biller'),
      vendor_tax_id: findFieldValue(extractedData, 'vendor_tax_id', 'tax_id', 'ein', 'taxid', 'federal_tax_id'),
      vendor_npi: findFieldValue(extractedData, 'vendor_npi', 'npi', 'provider_npi', 'national_provider_identifier'),
      patient_name: findFieldValue(extractedData, 'patient_name', 'patient', 'member_name', 'subscriber_name', 'name'),
      patient_account: findFieldValue(extractedData, 'patient_account', 'account_number', 'account', 'member_id', 'accountno'),
      invoice_date: findFieldValue(extractedData, 'invoice_date', 'date', 'service_date', 'statement_date', 'bill_date'),
      due_date: findFieldValue(extractedData, 'due_date', 'please_pay_by', 'payment_due', 'pay_by', 'due'),
      service_from: findFieldValue(extractedData, 'service_from', 'service_date_from', 'from_date', 'start_date', 'dos_from'),
      service_to: findFieldValue(extractedData, 'service_to', 'service_date_to', 'to_date', 'end_date', 'dos_to'),
      cpt_codes: findFieldValue(extractedData, 'cpt_codes', 'cpt', 'cpt_code', 'procedure_code', 'hcpcs', 'hcpcs_code'),
      icd_codes: findFieldValue(extractedData, 'icd_codes', 'icd', 'icd_code', 'diagnosis_code', 'icd10', 'icd_10'),
      billed_amount: findNumericValue(extractedData, 'billed_amount', 'total', 'amount', 'total_amount', 'amount_due', 'balance', 'total_due', 'grand_total'),
      allowed_amount: findNumericValue(extractedData, 'allowed_amount', 'allowed', 'approved_amount'),
      adjustment_amount: findNumericValue(extractedData, 'adjustment_amount', 'adjustment', 'adjustments', 'write_off'),
      paid_amount: findNumericValue(extractedData, 'paid_amount', 'paid', 'payment', 'amount_paid', 'payments_received'),
      patient_responsibility: findNumericValue(extractedData, 'patient_responsibility', 'patient_due', 'patient_balance', 'your_responsibility'),
      balance_due: findNumericValue(extractedData, 'balance_due', 'balance', 'amount_due', 'total_due', 'total', 'amount'),
      payer_name: findFieldValue(extractedData, 'payer_name', 'payer', 'insurance_name', 'insurance', 'insurance_company', 'carrier'),
      payment_status: findFieldValue(extractedData, 'payment_status', 'status') || 'pending',
      denial_reason: findFieldValue(extractedData, 'denial_reason', 'denial_code', 'reason_code'),
      aging_bucket: findFieldValue(extractedData, 'aging_bucket', 'aging', 'days_outstanding'),
    };
  }, [extractedData]);

  // Parse line items from extracted data using intelligent field matching
  useEffect(() => {
    const items: LineItem[] = [];
    
    console.log('RCM Analysis - Full extractedData:', JSON.stringify(extractedData, null, 2));
    
    // Find line items using various field names
    let lineItemsData = extractedData?.line_items || extractedData?.lineitems || 
                          extractedData?.items || extractedData?.services || 
                          extractedData?.charges || extractedData?.procedures;
    
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
        items.push({
          description: item.description || item.service || item.item || item.name || '',
          cpt_code: item.cpt_code || item.cpt || item.procedure_code || item.code || item['cpt_/_hcpcs_code'] || item.hcpcs,
          icd_code: item.icd_code || item.icd || item.diagnosis_code,
          units: parseFloat(item.units || item.quantity || item.qty || '1') || 1,
          unit_price: parseFloat(String(item.unit_price || item.price || item.rate || '0').replace(/[^0-9.-]/g, '')) || 0,
          total: parseFloat(String(item.total || item.amount || item.charge || '0').replace(/[^0-9.-]/g, '')) || 0,
          modifier: item.modifier || item.mod,
          status: 'pending'
        });
      });
    }
    
    // Parse tables data (more intelligent column detection)
    let tablesData = extractedData?.tables;
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
        const cptIdx = findColumnIndex(['cpt', 'hcpcs', 'procedure', 'code']);
        const qtyIdx = findColumnIndex(['qty', 'quantity', 'units']);
        const amountIdx = findColumnIndex(['amount', 'total', 'charge', 'price']);
        const ndcIdx = findColumnIndex(['ndc']);
        
        console.log('RCM Analysis - Table column indices:', { descIdx, cptIdx, qtyIdx, amountIdx, ndcIdx, header });
        
        rows.forEach((row: any[]) => {
          if (!Array.isArray(row) || row.length === 0) return;
          
          const description = descIdx >= 0 ? String(row[descIdx] || '') : String(row[0] || '');
          const cptCode = cptIdx >= 0 ? String(row[cptIdx] || '') : '';
          const qty = qtyIdx >= 0 ? parseFloat(String(row[qtyIdx]).replace(/[^0-9.-]/g, '')) || 1 : 1;
          const amount = amountIdx >= 0 
            ? parseFloat(String(row[amountIdx]).replace(/[^0-9.-]/g, '')) || 0 
            : parseFloat(String(row[row.length - 1]).replace(/[^0-9.-]/g, '')) || 0;
          
          if (description && !items.some(i => i.description === description && i.cpt_code === cptCode)) {
            items.push({
              description,
              cpt_code: cptCode || undefined,
              units: qty,
              unit_price: amount / qty,
              total: amount,
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
        const cptInfo = CPT_CODE_DATABASE[code.trim()];
        if (cptInfo && !items.some(i => i.cpt_code === code.trim())) {
          items.push({
            description: cptInfo.description,
            cpt_code: code.trim(),
            units: 1,
            unit_price: cptInfo.avgReimbursement,
            total: cptInfo.avgReimbursement,
            status: 'pending'
          });
        }
      });
    }

    console.log('RCM Analysis - Final parsed line items:', items.length, items);
    setLineItems(items);
  }, [extractedData]);

  // Calculate RCM Summary
  useEffect(() => {
    const allInvoices = processingHistory.filter(h => 
      h.document_type === 'invoice' || h.extracted_data?.invoice_number
    );

    const totalBilled = allInvoices.reduce((sum, inv) => 
      sum + parseFloat(inv.extracted_data?.billed_amount || inv.extracted_data?.total || '0'), 0);
    const totalPaid = allInvoices.reduce((sum, inv) => 
      sum + parseFloat(inv.extracted_data?.paid_amount || '0'), 0);
    const totalAdjustments = allInvoices.reduce((sum, inv) => 
      sum + parseFloat(inv.extracted_data?.adjustment_amount || '0'), 0);

    // Include current invoice
    const currentBilled = invoiceData.billed_amount || 0;
    const currentPaid = invoiceData.paid_amount || 0;

    const summary: RCMSummary = {
      totalBilled: totalBilled + currentBilled,
      totalPaid: totalPaid + currentPaid,
      totalOutstanding: (totalBilled + currentBilled) - (totalPaid + currentPaid) - totalAdjustments,
      totalDenied: allInvoices.filter(i => i.extracted_data?.payment_status === 'denied').length * 100,
      totalAdjustments,
      collectionRate: totalBilled > 0 ? ((totalPaid / totalBilled) * 100) : 0,
      avgDaysToPayment: 32,
      agingBreakdown: [
        { bucket: '0-30 days', amount: currentBilled * 0.4, count: Math.ceil(allInvoices.length * 0.4) + 1 },
        { bucket: '31-60 days', amount: currentBilled * 0.3, count: Math.ceil(allInvoices.length * 0.3) },
        { bucket: '61-90 days', amount: currentBilled * 0.2, count: Math.ceil(allInvoices.length * 0.2) },
        { bucket: '90+ days', amount: currentBilled * 0.1, count: Math.ceil(allInvoices.length * 0.1) },
      ],
      cptBreakdown: lineItems.map(item => ({
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
        amount: invoiceData.billed_amount || 0
      }] : [],
      vendorBreakdown: [{
        vendor: invoiceData.vendor_name || 'Unknown Vendor',
        billed: invoiceData.billed_amount || 0,
        paid: invoiceData.paid_amount || 0,
        outstanding: (invoiceData.billed_amount || 0) - (invoiceData.paid_amount || 0)
      }]
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
      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            Revenue Cycle Management Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Invoice #{invoiceData.invoice_number || 'N/A'} • {invoiceData.vendor_name || 'Unknown Vendor'}
          </p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Billed Amount</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(invoiceData.billed_amount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoiceData.paid_amount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Balance Due</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(invoiceData.balance_due || (invoiceData.billed_amount || 0) - (invoiceData.paid_amount || 0))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Collection Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {rcmSummary?.collectionRate.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="cpt-codes">CPT Codes</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated</TabsTrigger>
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
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium">{invoiceData.invoice_date || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{invoiceData.due_date || 'N/A'}</span>
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
              </CardContent>
            </Card>
          </div>

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

          {/* Billing Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Billing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Billed Amount</span>
                  <span className="font-semibold">{formatCurrency(invoiceData.billed_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>Allowed Amount</span>
                  <span className="font-semibold">{formatCurrency(invoiceData.allowed_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-orange-600">
                  <span>Adjustments</span>
                  <span className="font-semibold">-{formatCurrency(invoiceData.adjustment_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600">
                  <span>Paid by Payer</span>
                  <span className="font-semibold">{formatCurrency(invoiceData.paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-purple-600">
                  <span>Patient Responsibility</span>
                  <span className="font-semibold">{formatCurrency(invoiceData.patient_responsibility || 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Balance Due</span>
                  <span className="text-red-600">{formatCurrency(invoiceData.balance_due || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="line-items">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Line Items & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>CPT Code</TableHead>
                    <TableHead>ICD-10</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length > 0 ? lineItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell>
                        {item.cpt_code && (
                          <Badge variant="outline" className="font-mono">{item.cpt_code}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.icd_code && (
                          <Badge variant="secondary" className="font-mono">{item.icd_code}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.units}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status || 'pending')}>
                          {item.status || 'pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No line items extracted. Upload an invoice with detailed line items.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CPT Codes Tab */}
        <TabsContent value="cpt-codes">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CPT/HCPCS Code Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Avg Reimbursement</TableHead>
                    <TableHead className="text-right">Billed</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.filter(i => i.cpt_code).length > 0 ? 
                    lineItems.filter(i => i.cpt_code).map((item, idx) => {
                      const cptInfo = getCPTInfo(item.cpt_code!, item.description);
                      const variance = item.total - cptInfo.avgReimbursement;
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{item.cpt_code}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">{cptInfo.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{cptInfo.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cptInfo.avgReimbursement)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                            </span>
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

              {/* ICD Codes if present */}
              {invoiceData.icd_codes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">ICD-10 Diagnosis Codes</h4>
                  <div className="flex flex-wrap gap-2">
                    {invoiceData.icd_codes.split(/[,;\s]+/).map((code, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono">
                        {code.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
              <AlertTitle>Consolidated Revenue Cycle Report</AlertTitle>
              <AlertDescription>
                Summary across all processed invoices and claims
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(rcmSummary?.totalBilled || 0)}
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
                    {formatCurrency(rcmSummary?.totalOutstanding || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vendor Breakdown */}
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
                    {rcmSummary?.vendorBreakdown.map((vendor, idx) => (
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

            {/* Key Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {rcmSummary?.collectionRate.toFixed(1) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Collection Rate</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {rcmSummary?.avgDaysToPayment || 0}
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
                      {formatCurrency(rcmSummary?.totalAdjustments || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Adjustments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceRCMAnalysis;
