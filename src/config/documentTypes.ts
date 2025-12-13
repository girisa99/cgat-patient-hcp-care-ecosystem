/**
 * EXTENSIBLE DOCUMENT TYPE CONFIGURATION
 * Add new document types here - the system will automatically support them
 * Each type gets: upload, extract, map, validate, history, and type-specific tabs
 */

import React from 'react';

export interface DocumentField {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'date' | 'number' | 'boolean' | 'currency';
  validation?: string; // regex pattern
}

export interface DocumentTypeConfig {
  id: string;
  title: string;
  icon: string; // emoji or lucide icon name
  description: string;
  color: string; // tailwind bg color
  category: 'healthcare' | 'medical-imaging' | 'financial' | 'identity' | 'business' | 'general';
  targetFields: DocumentField[];
  subTypes: string[]; // variations of this document type
  specialTab?: {
    id: string;
    label: string;
    icon: string;
  };
  processingHints?: {
    enableMedicationLookup?: boolean;
    enableDicomViewer?: boolean;
    enableImageEnhancement?: boolean;
    requiresSpecialOCR?: boolean;
  };
}

// ============= DOCUMENT TYPE DEFINITIONS =============
// Add new document types below to extend the system

export const DOCUMENT_TYPE_CONFIGS: DocumentTypeConfig[] = [
  // ========== HEALTHCARE ==========
  {
    id: 'prescription',
    title: 'Rx / Prescription',
    icon: '💊',
    description: 'Prescriptions with medication auto-calculation',
    color: 'bg-red-500',
    category: 'healthcare',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth', required: true },
      { key: 'patient_address', label: 'Patient Address' },
      { key: 'patient_phone', label: 'Patient Phone' },
      { key: 'prescriber_name', label: 'Prescriber Name', required: true },
      { key: 'prescriber_npi', label: 'Prescriber NPI' },
      { key: 'prescriber_dea', label: 'DEA Number' },
      { key: 'medication', label: 'Medication Name', required: true },
      { key: 'strength', label: 'Strength' },
      { key: 'sig', label: 'Sig / Instructions', required: true },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'days_supply', label: 'Days Supply' },
      { key: 'refills', label: 'Refills' },
      { key: 'ndc', label: 'NDC Code' },
      { key: 'date_written', label: 'Date Written' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'allergies', label: 'Allergies' }
    ],
    subTypes: ['Prescription', 'E-Prescription', 'Refill Request', 'Fax Prescription', 'Handwritten Rx'],
    specialTab: { id: 'medication', label: 'Medication Lookup', icon: '💊' },
    processingHints: { enableMedicationLookup: true }
  },
  {
    id: 'insurance',
    title: 'Insurance Document',
    icon: '🏥',
    description: 'Insurance cards, EOBs, prior authorizations',
    color: 'bg-teal-500',
    category: 'healthcare',
    targetFields: [
      { key: 'insurance_name', label: 'Insurance Name', required: true },
      { key: 'member_id', label: 'Member ID', required: true },
      { key: 'group_number', label: 'Group Number' },
      { key: 'bin', label: 'BIN' },
      { key: 'pcn', label: 'PCN' },
      { key: 'plan_type', label: 'Plan Type' },
      { key: 'copay', label: 'Copay', type: 'currency' },
      { key: 'deductible', label: 'Deductible', type: 'currency' },
      { key: 'effective_date', label: 'Effective Date', type: 'date' },
      { key: 'expiration_date', label: 'Expiration Date', type: 'date' }
    ],
    subTypes: ['Insurance Card', 'EOB', 'Prior Authorization', 'Benefits Verification', 'Formulary'],
    specialTab: { id: 'insurance-details', label: 'Insurance Details', icon: '🏥' }
  },
  {
    id: 'patient-onboarding',
    title: 'Patient Onboarding',
    icon: '👤',
    description: 'Enrollment, consent forms, medical history',
    color: 'bg-blue-500',
    category: 'healthcare',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'dob', label: 'Date of Birth', required: true, type: 'date' },
      { key: 'ssn', label: 'SSN (last 4)' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'insurance_id', label: 'Insurance ID' },
      { key: 'emergency_contact', label: 'Emergency Contact' },
      { key: 'allergies', label: 'Allergies' },
      { key: 'consent_signed', label: 'Consent Signed', type: 'boolean' }
    ],
    subTypes: ['Consent Form', 'Medical History', 'HIPAA Authorization', 'Intake Form'],
    specialTab: { id: 'patient-info', label: 'Patient Info', icon: '👤' }
  },
  {
    id: 'lab-results',
    title: 'Lab Results',
    icon: '🔬',
    description: 'Blood work, urinalysis, pathology reports',
    color: 'bg-purple-500',
    category: 'healthcare',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'specimen_id', label: 'Specimen ID' },
      { key: 'collection_date', label: 'Collection Date', type: 'date' },
      { key: 'test_name', label: 'Test Name', required: true },
      { key: 'result_value', label: 'Result Value', required: true },
      { key: 'reference_range', label: 'Reference Range' },
      { key: 'units', label: 'Units' },
      { key: 'flag', label: 'Flag (H/L/N)' },
      { key: 'ordering_provider', label: 'Ordering Provider' },
      { key: 'lab_name', label: 'Laboratory Name' }
    ],
    subTypes: ['Blood Work', 'Urinalysis', 'Pathology', 'Microbiology', 'Toxicology'],
    specialTab: { id: 'lab-details', label: 'Lab Results', icon: '🔬' }
  },

  // ========== MEDICAL IMAGING ==========
  {
    id: 'xray',
    title: 'X-Ray Report',
    icon: '🩻',
    description: 'Radiographic imaging reports',
    color: 'bg-gray-600',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'study_date', label: 'Study Date', type: 'date', required: true },
      { key: 'body_part', label: 'Body Part Examined', required: true },
      { key: 'indication', label: 'Clinical Indication' },
      { key: 'findings', label: 'Findings' },
      { key: 'impression', label: 'Impression/Diagnosis' },
      { key: 'radiologist', label: 'Radiologist' },
      { key: 'accession_number', label: 'Accession Number' },
      { key: 'technique', label: 'Technique' }
    ],
    subTypes: ['Chest X-Ray', 'Bone X-Ray', 'Dental X-Ray', 'Mammogram', 'Fluoroscopy'],
    specialTab: { id: 'imaging-viewer', label: 'Image Viewer', icon: '🩻' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true }
  },
  {
    id: 'ct-scan',
    title: 'CT Scan Report',
    icon: '🔄',
    description: 'Computed tomography scan reports',
    color: 'bg-indigo-600',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'study_date', label: 'Study Date', type: 'date', required: true },
      { key: 'body_region', label: 'Body Region', required: true },
      { key: 'contrast', label: 'Contrast Used', type: 'boolean' },
      { key: 'indication', label: 'Clinical Indication' },
      { key: 'findings', label: 'Findings' },
      { key: 'impression', label: 'Impression/Diagnosis' },
      { key: 'radiologist', label: 'Radiologist' },
      { key: 'slice_thickness', label: 'Slice Thickness' },
      { key: 'radiation_dose', label: 'Radiation Dose' }
    ],
    subTypes: ['CT Head', 'CT Chest', 'CT Abdomen/Pelvis', 'CT Angiography', 'CT Spine'],
    specialTab: { id: 'imaging-viewer', label: 'CT Viewer', icon: '🔄' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true }
  },
  {
    id: 'mri',
    title: 'MRI Report',
    icon: '🧲',
    description: 'Magnetic resonance imaging reports',
    color: 'bg-cyan-600',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'study_date', label: 'Study Date', type: 'date', required: true },
      { key: 'body_region', label: 'Body Region', required: true },
      { key: 'contrast', label: 'Contrast Used', type: 'boolean' },
      { key: 'sequences', label: 'Sequences Performed' },
      { key: 'indication', label: 'Clinical Indication' },
      { key: 'findings', label: 'Findings' },
      { key: 'impression', label: 'Impression/Diagnosis' },
      { key: 'radiologist', label: 'Radiologist' },
      { key: 'tesla_strength', label: 'Magnet Strength' }
    ],
    subTypes: ['MRI Brain', 'MRI Spine', 'MRI Cardiac', 'MRI Joint', 'MRA'],
    specialTab: { id: 'imaging-viewer', label: 'MRI Viewer', icon: '🧲' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true }
  },
  {
    id: 'ecg',
    title: 'ECG/EKG Report',
    icon: '💓',
    description: 'Electrocardiogram reports',
    color: 'bg-rose-600',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'test_date', label: 'Test Date', type: 'date', required: true },
      { key: 'heart_rate', label: 'Heart Rate (BPM)', type: 'number' },
      { key: 'rhythm', label: 'Rhythm' },
      { key: 'pr_interval', label: 'PR Interval' },
      { key: 'qrs_duration', label: 'QRS Duration' },
      { key: 'qt_interval', label: 'QT/QTc Interval' },
      { key: 'axis', label: 'Axis' },
      { key: 'interpretation', label: 'Interpretation' },
      { key: 'cardiologist', label: 'Cardiologist' }
    ],
    subTypes: ['12-Lead ECG', 'Holter Monitor', 'Stress Test', 'Event Monitor'],
    specialTab: { id: 'ecg-viewer', label: 'ECG Viewer', icon: '💓' },
    processingHints: { enableImageEnhancement: true }
  },
  {
    id: 'ultrasound',
    title: 'Ultrasound Report',
    icon: '📡',
    description: 'Sonography and ultrasound reports',
    color: 'bg-sky-600',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth' },
      { key: 'study_date', label: 'Study Date', type: 'date', required: true },
      { key: 'exam_type', label: 'Exam Type', required: true },
      { key: 'indication', label: 'Clinical Indication' },
      { key: 'findings', label: 'Findings' },
      { key: 'measurements', label: 'Measurements' },
      { key: 'impression', label: 'Impression/Diagnosis' },
      { key: 'sonographer', label: 'Sonographer' },
      { key: 'interpreting_physician', label: 'Interpreting Physician' }
    ],
    subTypes: ['Abdominal', 'Pelvic', 'Obstetric', 'Echocardiogram', 'Vascular Doppler'],
    specialTab: { id: 'imaging-viewer', label: 'Ultrasound Viewer', icon: '📡' },
    processingHints: { enableDicomViewer: true }
  },

  // ========== FINANCIAL ==========
  {
    id: 'invoice',
    title: 'Invoice',
    icon: '🧾',
    description: 'Invoices, bills, payment requests',
    color: 'bg-emerald-500',
    category: 'financial',
    targetFields: [
      { key: 'invoice_number', label: 'Invoice Number', required: true },
      { key: 'vendor_name', label: 'Vendor/Company Name', required: true },
      { key: 'vendor_address', label: 'Vendor Address' },
      { key: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency' },
      { key: 'tax', label: 'Tax Amount', type: 'currency' },
      { key: 'total', label: 'Total Amount', type: 'currency', required: true },
      { key: 'payment_terms', label: 'Payment Terms' },
      { key: 'po_number', label: 'PO Number' }
    ],
    subTypes: ['Standard Invoice', 'Proforma', 'Credit Memo', 'Debit Note', 'Medical Bill'],
    specialTab: { id: 'invoice-details', label: 'Line Items', icon: '🧾' }
  },
  {
    id: 'receipt',
    title: 'Receipt',
    icon: '🧾',
    description: 'Purchase receipts and transaction records',
    color: 'bg-lime-500',
    category: 'financial',
    targetFields: [
      { key: 'merchant_name', label: 'Merchant Name', required: true },
      { key: 'transaction_date', label: 'Transaction Date', type: 'date', required: true },
      { key: 'items', label: 'Items Purchased' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency' },
      { key: 'tax', label: 'Tax', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency', required: true },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'transaction_id', label: 'Transaction ID' }
    ],
    subTypes: ['Store Receipt', 'Digital Receipt', 'Expense Receipt', 'Return Receipt'],
    specialTab: { id: 'receipt-details', label: 'Receipt Details', icon: '🧾' }
  },

  // ========== IDENTITY ==========
  {
    id: 'passport',
    title: 'Passport',
    icon: '🛂',
    description: 'Passport and travel documents',
    color: 'bg-blue-700',
    category: 'identity',
    targetFields: [
      { key: 'full_name', label: 'Full Name', required: true },
      { key: 'nationality', label: 'Nationality', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'gender', label: 'Gender' },
      { key: 'passport_number', label: 'Passport Number', required: true },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { key: 'place_of_birth', label: 'Place of Birth' },
      { key: 'issuing_authority', label: 'Issuing Authority' },
      { key: 'mrz_line1', label: 'MRZ Line 1' },
      { key: 'mrz_line2', label: 'MRZ Line 2' }
    ],
    subTypes: ['Passport', 'Travel Document', 'Visa Page'],
    specialTab: { id: 'id-verification', label: 'ID Verification', icon: '🛂' },
    processingHints: { requiresSpecialOCR: true }
  },
  {
    id: 'drivers-license',
    title: 'Driver\'s License',
    icon: '🪪',
    description: 'Driver licenses and state IDs',
    color: 'bg-amber-600',
    category: 'identity',
    targetFields: [
      { key: 'full_name', label: 'Full Name', required: true },
      { key: 'license_number', label: 'License Number', required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'address', label: 'Address' },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { key: 'class', label: 'License Class' },
      { key: 'restrictions', label: 'Restrictions' },
      { key: 'state', label: 'Issuing State' }
    ],
    subTypes: ['Driver License', 'State ID', 'Commercial DL'],
    specialTab: { id: 'id-verification', label: 'ID Verification', icon: '🪪' },
    processingHints: { requiresSpecialOCR: true }
  },

  // ========== BUSINESS ==========
  {
    id: 'order-management',
    title: 'Order Management',
    icon: '📦',
    description: 'Purchase orders, shipping documents',
    color: 'bg-green-500',
    category: 'business',
    targetFields: [
      { key: 'order_number', label: 'Order Number', required: true },
      { key: 'customer_name', label: 'Customer Name', required: true },
      { key: 'order_date', label: 'Order Date', type: 'date', required: true },
      { key: 'items', label: 'Line Items' },
      { key: 'quantity', label: 'Total Quantity', type: 'number' },
      { key: 'total', label: 'Order Total', type: 'currency' },
      { key: 'shipping_address', label: 'Shipping Address' },
      { key: 'status', label: 'Order Status' }
    ],
    subTypes: ['Purchase Order', 'Sales Order', 'Packing Slip', 'Shipping Label', 'Bill of Lading'],
    specialTab: { id: 'order-details', label: 'Order Details', icon: '📦' }
  },
  {
    id: 'treatment-center',
    title: 'Treatment Center',
    icon: '🏥',
    description: 'Facility credentials, licenses, compliance',
    color: 'bg-purple-500',
    category: 'business',
    targetFields: [
      { key: 'facility_name', label: 'Facility Name', required: true },
      { key: 'license_number', label: 'License Number', required: true },
      { key: 'dea_number', label: 'DEA Number' },
      { key: 'npi', label: 'NPI', required: true },
      { key: 'accreditation', label: 'Accreditation' },
      { key: 'address', label: 'Address', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'admin_contact', label: 'Admin Contact' }
    ],
    subTypes: ['License', 'DEA Registration', 'Insurance Certificate', 'Accreditation', 'Contract'],
    specialTab: { id: 'facility-info', label: 'Facility Info', icon: '🏥' }
  },
  {
    id: 'customer-onboarding',
    title: 'Customer Onboarding',
    icon: '🤝',
    description: 'Business registration, credit applications',
    color: 'bg-orange-500',
    category: 'business',
    targetFields: [
      { key: 'company_name', label: 'Company Name', required: true },
      { key: 'tax_id', label: 'Tax ID', required: true },
      { key: 'contact_name', label: 'Contact Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Business Address' },
      { key: 'credit_terms', label: 'Credit Terms' },
      { key: 'credit_limit', label: 'Credit Limit', type: 'currency' }
    ],
    subTypes: ['Business License', 'W-9', 'Credit Application', 'Contract', 'NDA'],
    specialTab: { id: 'customer-info', label: 'Customer Info', icon: '🤝' }
  },

  // ========== GENERAL ==========
  {
    id: 'general-form',
    title: 'General Form',
    icon: '📋',
    description: 'Any form or structured document',
    color: 'bg-slate-500',
    category: 'general',
    targetFields: [
      { key: 'form_title', label: 'Form Title' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'name', label: 'Name' },
      { key: 'signature', label: 'Signature Present', type: 'boolean' },
      { key: 'notes', label: 'Notes/Comments' }
    ],
    subTypes: ['Application Form', 'Questionnaire', 'Survey', 'Checklist'],
    specialTab: { id: 'form-details', label: 'Form Details', icon: '📋' }
  }
];

// ============= HELPER FUNCTIONS =============

export const getDocumentTypeById = (id: string): DocumentTypeConfig | undefined => {
  return DOCUMENT_TYPE_CONFIGS.find(config => config.id === id);
};

export const getDocumentTypesByCategory = (category: DocumentTypeConfig['category']): DocumentTypeConfig[] => {
  return DOCUMENT_TYPE_CONFIGS.filter(config => config.category === category);
};

export const getAllCategories = (): DocumentTypeConfig['category'][] => {
  return [...new Set(DOCUMENT_TYPE_CONFIGS.map(config => config.category))];
};

export const getCategoryLabel = (category: DocumentTypeConfig['category']): string => {
  const labels: Record<DocumentTypeConfig['category'], string> = {
    'healthcare': 'Healthcare',
    'medical-imaging': 'Medical Imaging (DICOM)',
    'financial': 'Financial',
    'identity': 'Identity Documents',
    'business': 'Business',
    'general': 'General'
  };
  return labels[category];
};

export const getCategoryIcon = (category: DocumentTypeConfig['category']): string => {
  const icons: Record<DocumentTypeConfig['category'], string> = {
    'healthcare': '🏥',
    'medical-imaging': '🩻',
    'financial': '💰',
    'identity': '🪪',
    'business': '🏢',
    'general': '📄'
  };
  return icons[category];
};

// Type for compatibility with existing code
export type DocumentTypeId = typeof DOCUMENT_TYPE_CONFIGS[number]['id'];
