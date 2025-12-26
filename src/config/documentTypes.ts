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
    enableImageAnalysis?: boolean; // For medical imaging - analyze image instead of extract fields
    enableDicomViewer?: boolean;
    enableImageEnhancement?: boolean;
    requiresSpecialOCR?: boolean;
    enableRCMAnalysis?: boolean; // For invoices/claims - revenue cycle management
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
      { key: 'insurance_name', label: 'Insurance Company Name', required: true },
      { key: 'plan_name', label: 'Plan Name' },
      { key: 'plan_type', label: 'Plan Type (HMO/PPO/EPO/POS)' },
      { key: 'member_name', label: 'Member Name' },
      { key: 'member_id', label: 'Member ID', required: true },
      { key: 'subscriber_id', label: 'Subscriber ID' },
      { key: 'group_number', label: 'Group Number' },
      { key: 'bin', label: 'BIN (Rx)' },
      { key: 'pcn', label: 'PCN (Rx)' },
      { key: 'rxgrp', label: 'RxGrp' },
      { key: 'copay', label: 'Copay', type: 'currency' },
      { key: 'copay_specialist', label: 'Specialist Copay', type: 'currency' },
      { key: 'copay_rx', label: 'Rx Copay', type: 'currency' },
      { key: 'deductible', label: 'Deductible (DED)', type: 'currency' },
      { key: 'oop_max', label: 'Out of Pocket Max (OOP)', type: 'currency' },
      { key: 'coinsurance', label: 'Coinsurance %' },
      { key: 'effective_date', label: 'Effective Date', type: 'date' },
      { key: 'expiration_date', label: 'Expiration Date', type: 'date' },
      { key: 'pcp_required', label: 'PCP Required', type: 'boolean' },
      { key: 'referral_required', label: 'Referral Required', type: 'boolean' },
      { key: 'payer_id', label: 'Payer ID' },
      { key: 'customer_service', label: 'Customer Service Phone' },
      { key: 'claims_address', label: 'Claims Address' }
    ],
    subTypes: ['Insurance Card', 'EOB', 'Prior Authorization', 'Benefits Verification', 'Formulary', 'Pharmacy Insurance', 'Medical Insurance', 'Dental Insurance', 'Vision Insurance'],
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
    id: 'medical_imaging',
    title: 'Medical Image / DICOM',
    icon: '🏥',
    description: 'DICOM files, medical images with AI analysis',
    color: 'bg-slate-700',
    category: 'medical-imaging',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name' },
      { key: 'patient_id', label: 'Patient ID' },
      { key: 'study_date', label: 'Study Date', type: 'date' },
      { key: 'modality', label: 'Modality (CT/MRI/XR/US)' },
      { key: 'body_part', label: 'Body Part' },
      { key: 'study_description', label: 'Study Description' },
      { key: 'series_description', label: 'Series Description' },
      { key: 'institution', label: 'Institution' },
      { key: 'referring_physician', label: 'Referring Physician' },
      { key: 'accession_number', label: 'Accession Number' }
    ],
    subTypes: ['DICOM', 'Medical X-Ray', 'CT Image', 'MRI Image', 'Ultrasound Image'],
    specialTab: { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true, enableImageAnalysis: true }
  },
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
    specialTab: { id: 'image-analysis', label: 'Image Analysis', icon: '🩻' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true, enableImageAnalysis: true }
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
    specialTab: { id: 'image-analysis', label: 'Image Analysis', icon: '🔄' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true, enableImageAnalysis: true }
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
    specialTab: { id: 'image-analysis', label: 'Image Analysis', icon: '🧲' },
    processingHints: { enableDicomViewer: true, enableImageEnhancement: true, enableImageAnalysis: true }
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
    specialTab: { id: 'image-analysis', label: 'Image Analysis', icon: '💓' },
    processingHints: { enableImageEnhancement: true, enableImageAnalysis: true }
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
    specialTab: { id: 'image-analysis', label: 'Image Analysis', icon: '📡' },
    processingHints: { enableDicomViewer: true, enableImageAnalysis: true }
  },

  // ========== FINANCIAL / REVENUE CYCLE MANAGEMENT ==========
  {
    id: 'invoice',
    title: 'Invoice / Billing',
    icon: '🧾',
    description: 'Invoices, claims, billing with RCM analysis',
    color: 'bg-emerald-500',
    category: 'financial',
    targetFields: [
      // Core Invoice Fields
      { key: 'invoice_number', label: 'Invoice Number', required: true },
      { key: 'claim_number', label: 'Claim Number' },
      { key: 'vendor_name', label: 'Vendor/Company Name', required: true },
      { key: 'vendor_tax_id', label: 'Vendor Tax ID (EIN)' },
      { key: 'vendor_npi', label: 'Vendor NPI' },
      { key: 'vendor_address', label: 'Vendor Address' },
      { key: 'patient_name', label: 'Patient Name' },
      { key: 'patient_account', label: 'Patient Account #' },
      { key: 'invoice_date', label: 'Invoice/Service Date', type: 'date', required: true },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'service_from', label: 'Service From Date', type: 'date' },
      { key: 'service_to', label: 'Service To Date', type: 'date' },
      // Line Items & CPT Codes
      { key: 'line_items', label: 'Line Items (JSON)' },
      { key: 'cpt_codes', label: 'CPT/HCPCS Codes' },
      { key: 'icd_codes', label: 'ICD-10 Diagnosis Codes' },
      { key: 'modifiers', label: 'Modifiers' },
      { key: 'units', label: 'Units/Quantity', type: 'number' },
      // Billing & Payment
      { key: 'billed_amount', label: 'Billed Amount', type: 'currency', required: true },
      { key: 'allowed_amount', label: 'Allowed Amount', type: 'currency' },
      { key: 'adjustment_amount', label: 'Adjustment Amount', type: 'currency' },
      { key: 'paid_amount', label: 'Paid Amount', type: 'currency' },
      { key: 'patient_responsibility', label: 'Patient Responsibility', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency' },
      { key: 'tax', label: 'Tax Amount', type: 'currency' },
      { key: 'total', label: 'Total Amount', type: 'currency' },
      // Insurance & Payer
      { key: 'payer_name', label: 'Payer/Insurance Name' },
      { key: 'payer_id', label: 'Payer ID' },
      { key: 'authorization_number', label: 'Prior Auth Number' },
      { key: 'remittance_advice', label: 'Remittance Advice/ERA' },
      // Status & Tracking
      { key: 'payment_status', label: 'Payment Status' },
      { key: 'denial_reason', label: 'Denial Reason Code' },
      { key: 'aging_bucket', label: 'Aging Bucket (0-30, 31-60, etc.)' },
      { key: 'payment_terms', label: 'Payment Terms' },
      { key: 'po_number', label: 'PO Number' }
    ],
    subTypes: ['Medical Bill', 'Healthcare Claim', 'EOB/ERA', 'Superbill', 'Standard Invoice', 'Proforma', 'Credit Memo', 'Debit Note'],
    specialTab: { id: 'rcm-analysis', label: 'RCM Analysis', icon: '💰' },
    processingHints: { enableRCMAnalysis: true }
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

// ============= DYNAMIC FIELD & STORAGE UTILITIES =============

/**
 * Get field keys for a document type - SINGLE SOURCE OF TRUTH
 * Use this instead of hardcoded DOCUMENT_TYPE_FIELDS
 */
export const getFieldsForDocumentType = (documentTypeId: string): string[] => {
  const config = getDocumentTypeById(documentTypeId);
  if (!config) {
    console.warn(`Unknown document type: ${documentTypeId}, using default fields`);
    return ['name', 'date', 'content', 'notes'];
  }
  return config.targetFields.map(field => field.key);
};

/**
 * Get full field definitions for a document type
 */
export const getFieldDefinitionsForDocumentType = (documentTypeId: string): DocumentField[] => {
  const config = getDocumentTypeById(documentTypeId);
  return config?.targetFields || [];
};

/**
 * Get required fields for a document type
 */
export const getRequiredFieldsForDocumentType = (documentTypeId: string): string[] => {
  const config = getDocumentTypeById(documentTypeId);
  if (!config) return [];
  return config.targetFields.filter(f => f.required).map(f => f.key);
};

/**
 * Convert document type ID to sessionStorage prefix
 * e.g., 'patient-onboarding' -> 'patientOnboarding_'
 */
export const getSessionStoragePrefix = (documentTypeId: string): string => {
  // Convert kebab-case to camelCase and add underscore
  const camelCase = documentTypeId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `${camelCase}_`;
};

/**
 * Get all possible sessionStorage prefixes from all document types
 * Used for clearing state when switching document types
 */
export const getAllSessionStoragePrefixes = (): string[] => {
  const prefixes = DOCUMENT_TYPE_CONFIGS.map(config => getSessionStoragePrefix(config.id));
  
  // Add additional common prefixes for backwards compatibility
  const additionalPrefixes = [
    'documentProcessing_',
    'docProcessing_',
    'invoiceRCM_',
    'prescriptionData_',
    'insuranceCard_',
    'medicalImage_'
  ];
  
  return [...new Set([...prefixes, ...additionalPrefixes])];
};

/**
 * Get all document type IDs
 */
export const getAllDocumentTypeIds = (): string[] => {
  return DOCUMENT_TYPE_CONFIGS.map(config => config.id);
};

/**
 * Get document types for UI selection (with icon and label)
 */
export const getDocumentTypesForSelection = (): Array<{
  id: string;
  label: string;
  icon: string;
  category: string;
}> => {
  return DOCUMENT_TYPE_CONFIGS.map(config => ({
    id: config.id,
    label: config.title,
    icon: config.icon,
    category: config.category
  }));
};

/**
 * Get special tab config for a document type (if any)
 */
export const getSpecialTabForDocumentType = (documentTypeId: string): DocumentTypeConfig['specialTab'] | undefined => {
  const config = getDocumentTypeById(documentTypeId);
  return config?.specialTab;
};

/**
 * Get processing hints for a document type
 */
export const getProcessingHintsForDocumentType = (documentTypeId: string): DocumentTypeConfig['processingHints'] | undefined => {
  const config = getDocumentTypeById(documentTypeId);
  return config?.processingHints;
};

/**
 * Build dynamic DOCUMENT_TYPE_FIELDS map for backwards compatibility
 * This generates the same structure as the old hardcoded map
 */
export const buildDocumentTypeFieldsMap = (): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  DOCUMENT_TYPE_CONFIGS.forEach(config => {
    map[config.id] = config.targetFields.map(f => f.key);
  });
  // Add legacy aliases for backwards compatibility
  map['insurance_card'] = map['insurance'] || [];
  map['lab_result'] = map['lab-results'] || [];
  map['medical_record'] = map['patient-onboarding'] || [];
  map['form'] = map['general-form'] || [];
  map['contract'] = map['order-management'] || [];
  map['identification'] = map['drivers-license'] || map['passport'] || [];
  map['unknown'] = ['name', 'date', 'content', 'notes'];
  return map;
};

// Pre-built map for performance
export const DOCUMENT_TYPE_FIELDS = buildDocumentTypeFieldsMap();

// Type for compatibility with existing code
export type DocumentTypeId = typeof DOCUMENT_TYPE_CONFIGS[number]['id'];
