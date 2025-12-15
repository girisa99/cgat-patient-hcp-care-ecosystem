/**
 * Field Mapping Dialog - Maps extracted source fields to target CRM/system fields
 * Supports auto-matching, custom field creation, and data type transformations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  ArrowRight, 
  Check, 
  X, 
  Plus, 
  Wand2, 
  AlertCircle,
  Database,
  RefreshCw,
  Sparkles,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  dynamicFieldMappingService,
  toCSV,
  toJSON,
  downloadAsFile,
  type ExportFormat
} from '@/services/dynamicFieldMappingService';

// Comprehensive target schema - covers healthcare, CRM, and common fields
// User can ALSO add ANY custom field for ANY document type
const getBaseTargetSchema = (targetSystem: string): TargetField[] => {
  // Common fields across all systems
  const commonFields: TargetField[] = [
    // Personal/Patient Information
    { name: 'first_name', type: 'string', required: false, label: 'First Name' },
    { name: 'last_name', type: 'string', required: false, label: 'Last Name' },
    { name: 'full_name', type: 'string', required: false, label: 'Full Name' },
    { name: 'patient_name', type: 'string', required: false, label: 'Patient Name' },
    { name: 'date_of_birth', type: 'date', required: false, label: 'Date of Birth' },
    { name: 'dob', type: 'date', required: false, label: 'DOB' },
    { name: 'sex', type: 'string', required: false, label: 'Sex/Gender' },
    { name: 'gender', type: 'string', required: false, label: 'Gender' },
    { name: 'age', type: 'number', required: false, label: 'Age' },
    
    // Contact Information
    { name: 'email', type: 'email', required: false, label: 'Email' },
    { name: 'phone', type: 'phone', required: false, label: 'Phone' },
    { name: 'phone_number', type: 'phone', required: false, label: 'Phone Number' },
    { name: 'mobile', type: 'phone', required: false, label: 'Mobile' },
    { name: 'fax', type: 'phone', required: false, label: 'Fax' },
    
    // Address Fields
    { name: 'address', type: 'string', required: false, label: 'Full Address' },
    { name: 'street_address', type: 'string', required: false, label: 'Street Address' },
    { name: 'address_line_1', type: 'string', required: false, label: 'Address Line 1' },
    { name: 'address_line_2', type: 'string', required: false, label: 'Address Line 2' },
    { name: 'city', type: 'string', required: false, label: 'City' },
    { name: 'state', type: 'string', required: false, label: 'State' },
    { name: 'zip_code', type: 'string', required: false, label: 'ZIP Code' },
    { name: 'postal_code', type: 'string', required: false, label: 'Postal Code' },
    { name: 'country', type: 'string', required: false, label: 'Country' },
    
    // Healthcare/Provider Fields
    { name: 'npi_number', type: 'string', required: false, label: 'NPI Number' },
    { name: 'prescriber', type: 'string', required: false, label: 'Prescriber' },
    { name: 'prescriber_name', type: 'string', required: false, label: 'Prescriber Name' },
    { name: 'physician', type: 'string', required: false, label: 'Physician' },
    { name: 'doctor_name', type: 'string', required: false, label: 'Doctor Name' },
    { name: 'provider_name', type: 'string', required: false, label: 'Provider Name' },
    { name: 'facility_name', type: 'string', required: false, label: 'Facility Name' },
    { name: 'clinic_name', type: 'string', required: false, label: 'Clinic Name' },
    { name: 'hospital_name', type: 'string', required: false, label: 'Hospital Name' },
    { name: 'license_number', type: 'string', required: false, label: 'License Number' },
    { name: 'dea_number', type: 'string', required: false, label: 'DEA Number' },
    
    // Prescription/Medication Fields
    { name: 'medication', type: 'string', required: false, label: 'Medication' },
    { name: 'medication_name', type: 'string', required: false, label: 'Medication Name' },
    { name: 'drug_name', type: 'string', required: false, label: 'Drug Name' },
    { name: 'dosage', type: 'string', required: false, label: 'Dosage' },
    { name: 'strength', type: 'string', required: false, label: 'Strength' },
    { name: 'frequency', type: 'string', required: false, label: 'Frequency' },
    { name: 'directions', type: 'string', required: false, label: 'Directions' },
    { name: 'quantity', type: 'number', required: false, label: 'Quantity' },
    { name: 'refills', type: 'number', required: false, label: 'Refills' },
    { name: 'ndc_code', type: 'string', required: false, label: 'NDC Code' },
    { name: 'rx_number', type: 'string', required: false, label: 'Rx Number' },
    // SIG Codes (Prescription Directions)
    { name: 'sig_code', type: 'string', required: false, label: 'SIG Code' },
    { name: 'sig_text', type: 'string', required: false, label: 'SIG Text (Directions)' },
    { name: 'route_of_administration', type: 'string', required: false, label: 'Route of Administration' },
    { name: 'dosage_form', type: 'string', required: false, label: 'Dosage Form' },
    { name: 'dispense_as_written', type: 'boolean', required: false, label: 'Dispense As Written (DAW)' },
    { name: 'days_supply', type: 'number', required: false, label: 'Days Supply' },
    { name: 'prn_reason', type: 'string', required: false, label: 'PRN Reason' },
    
    // Medical Insurance Fields
    { name: 'medical_insurance_id', type: 'string', required: false, label: 'Medical Insurance ID' },
    { name: 'medical_member_id', type: 'string', required: false, label: 'Medical Member ID' },
    { name: 'medical_policy_number', type: 'string', required: false, label: 'Medical Policy Number' },
    { name: 'medical_group_number', type: 'string', required: false, label: 'Medical Group Number' },
    { name: 'medical_insurance_provider', type: 'string', required: false, label: 'Medical Insurance Provider' },
    { name: 'medical_plan_name', type: 'string', required: false, label: 'Medical Plan Name' },
    { name: 'medical_plan_type', type: 'string', required: false, label: 'Medical Plan Type (HMO/PPO/EPO)' },
    { name: 'medical_effective_date', type: 'date', required: false, label: 'Medical Coverage Effective Date' },
    { name: 'medical_termination_date', type: 'date', required: false, label: 'Medical Coverage End Date' },
    { name: 'medical_copay', type: 'number', required: false, label: 'Medical Copay' },
    { name: 'medical_deductible', type: 'number', required: false, label: 'Medical Deductible' },
    { name: 'medical_out_of_pocket_max', type: 'number', required: false, label: 'Medical Out-of-Pocket Max' },
    { name: 'primary_care_physician', type: 'string', required: false, label: 'Primary Care Physician' },
    { name: 'pcp_npi', type: 'string', required: false, label: 'PCP NPI' },
    { name: 'referral_required', type: 'boolean', required: false, label: 'Referral Required' },
    { name: 'prior_auth_required', type: 'boolean', required: false, label: 'Prior Authorization Required' },
    
    // Pharmacy/Rx Insurance Fields
    { name: 'rx_insurance_id', type: 'string', required: false, label: 'Rx Insurance ID' },
    { name: 'rx_member_id', type: 'string', required: false, label: 'Rx Member ID' },
    { name: 'rx_group_number', type: 'string', required: false, label: 'Rx Group Number' },
    { name: 'rx_bin_number', type: 'string', required: false, label: 'Rx BIN Number' },
    { name: 'rx_pcn', type: 'string', required: false, label: 'Rx PCN' },
    { name: 'rx_plan_name', type: 'string', required: false, label: 'Rx Plan Name' },
    { name: 'pbm_name', type: 'string', required: false, label: 'PBM Name' },
    { name: 'rx_effective_date', type: 'date', required: false, label: 'Rx Coverage Effective Date' },
    { name: 'rx_termination_date', type: 'date', required: false, label: 'Rx Coverage End Date' },
    { name: 'rx_copay_generic', type: 'number', required: false, label: 'Rx Copay (Generic)' },
    { name: 'rx_copay_preferred_brand', type: 'number', required: false, label: 'Rx Copay (Preferred Brand)' },
    { name: 'rx_copay_non_preferred', type: 'number', required: false, label: 'Rx Copay (Non-Preferred)' },
    { name: 'rx_copay_specialty', type: 'number', required: false, label: 'Rx Copay (Specialty)' },
    { name: 'mail_order_pharmacy', type: 'string', required: false, label: 'Mail Order Pharmacy' },
    { name: 'specialty_pharmacy', type: 'string', required: false, label: 'Specialty Pharmacy' },
    { name: 'formulary_id', type: 'string', required: false, label: 'Formulary ID' },
    { name: 'step_therapy_required', type: 'boolean', required: false, label: 'Step Therapy Required' },
    { name: 'quantity_limits', type: 'string', required: false, label: 'Quantity Limits' },
    
    // Patient Onboarding/Hub Services Fields
    { name: 'hub_patient_id', type: 'string', required: false, label: 'Hub Patient ID' },
    { name: 'enrollment_id', type: 'string', required: false, label: 'Enrollment ID' },
    { name: 'program_name', type: 'string', required: false, label: 'Program Name' },
    { name: 'enrollment_date', type: 'date', required: false, label: 'Enrollment Date' },
    { name: 'enrollment_status', type: 'string', required: false, label: 'Enrollment Status' },
    { name: 'enrollment_source', type: 'string', required: false, label: 'Enrollment Source' },
    { name: 'consent_obtained', type: 'boolean', required: false, label: 'Consent Obtained' },
    { name: 'consent_date', type: 'date', required: false, label: 'Consent Date' },
    { name: 'hipaa_consent', type: 'boolean', required: false, label: 'HIPAA Consent' },
    { name: 'marketing_consent', type: 'boolean', required: false, label: 'Marketing Consent' },
    { name: 'caregiver_name', type: 'string', required: false, label: 'Caregiver Name' },
    { name: 'caregiver_relationship', type: 'string', required: false, label: 'Caregiver Relationship' },
    { name: 'caregiver_phone', type: 'phone', required: false, label: 'Caregiver Phone' },
    { name: 'caregiver_email', type: 'email', required: false, label: 'Caregiver Email' },
    { name: 'preferred_contact_method', type: 'string', required: false, label: 'Preferred Contact Method' },
    { name: 'preferred_language', type: 'string', required: false, label: 'Preferred Language' },
    { name: 'best_time_to_call', type: 'string', required: false, label: 'Best Time to Call' },
    { name: 'financial_assistance_needed', type: 'boolean', required: false, label: 'Financial Assistance Needed' },
    { name: 'copay_assistance_enrolled', type: 'boolean', required: false, label: 'Copay Assistance Enrolled' },
    { name: 'pap_enrolled', type: 'boolean', required: false, label: 'Patient Assistance Program Enrolled' },
    { name: 'bridge_program_enrolled', type: 'boolean', required: false, label: 'Bridge Program Enrolled' },
    { name: 'nurse_educator_assigned', type: 'string', required: false, label: 'Nurse Educator Assigned' },
    { name: 'case_manager_name', type: 'string', required: false, label: 'Case Manager Name' },
    { name: 'case_manager_phone', type: 'phone', required: false, label: 'Case Manager Phone' },
    { name: 'next_followup_date', type: 'date', required: false, label: 'Next Followup Date' },
    { name: 'therapy_start_date', type: 'date', required: false, label: 'Therapy Start Date' },
    { name: 'adherence_score', type: 'number', required: false, label: 'Adherence Score' },
    { name: 'refill_reminder_enabled', type: 'boolean', required: false, label: 'Refill Reminder Enabled' },
    
    // Common Insurance Fields
    { name: 'insurance_id', type: 'string', required: false, label: 'Insurance ID' },
    { name: 'member_id', type: 'string', required: false, label: 'Member ID' },
    { name: 'policy_number', type: 'string', required: false, label: 'Policy Number' },
    { name: 'group_number', type: 'string', required: false, label: 'Group Number' },
    { name: 'insurance_provider', type: 'string', required: false, label: 'Insurance Provider' },
    { name: 'plan_name', type: 'string', required: false, label: 'Plan Name' },
    { name: 'bin_number', type: 'string', required: false, label: 'BIN Number' },
    { name: 'pcn', type: 'string', required: false, label: 'PCN' },
    { name: 'effective_date', type: 'date', required: false, label: 'Effective Date' },
    { name: 'expiration_date', type: 'date', required: false, label: 'Expiration Date' },
    { name: 'copay', type: 'number', required: false, label: 'Copay' },
    
    // Date Fields
    { name: 'date', type: 'date', required: false, label: 'Date' },
    { name: 'prescription_date', type: 'date', required: false, label: 'Prescription Date' },
    { name: 'fill_date', type: 'date', required: false, label: 'Fill Date' },
    { name: 'visit_date', type: 'date', required: false, label: 'Visit Date' },
    
    // Diagnosis/Clinical Fields
    { name: 'diagnosis', type: 'string', required: false, label: 'Diagnosis' },
    { name: 'icd_code', type: 'string', required: false, label: 'ICD Code' },
    { name: 'icd_10_code', type: 'string', required: false, label: 'ICD-10 Code' },
    { name: 'symptoms', type: 'string', required: false, label: 'Symptoms' },
    { name: 'allergies', type: 'string', required: false, label: 'Allergies' },
    { name: 'notes', type: 'string', required: false, label: 'Notes' },
    { name: 'comments', type: 'string', required: false, label: 'Comments' },
    
    // ID Fields
    { name: 'ssn', type: 'string', required: false, label: 'SSN' },
    { name: 'mrn', type: 'string', required: false, label: 'Medical Record Number' },
    { name: 'account_number', type: 'string', required: false, label: 'Account Number' },
  ];
  
  // Add system-specific fields
  if (targetSystem === 'salesforce') {
    commonFields.push(
      // Salesforce Standard Contact/Account Fields
      { name: 'Account.Name', type: 'string', required: false, label: 'SF: Account Name' },
      { name: 'Contact.FirstName', type: 'string', required: false, label: 'SF: Contact First Name' },
      { name: 'Contact.LastName', type: 'string', required: false, label: 'SF: Contact Last Name' },
      { name: 'Contact.Email', type: 'email', required: false, label: 'SF: Contact Email' },
      { name: 'Contact.Phone', type: 'phone', required: false, label: 'SF: Contact Phone' },
      { name: 'Contact.Birthdate', type: 'date', required: false, label: 'SF: Contact Birthdate' },
      { name: 'Contact.MailingStreet', type: 'string', required: false, label: 'SF: Mailing Street' },
      { name: 'Contact.MailingCity', type: 'string', required: false, label: 'SF: Mailing City' },
      { name: 'Contact.MailingState', type: 'string', required: false, label: 'SF: Mailing State' },
      { name: 'Contact.MailingPostalCode', type: 'string', required: false, label: 'SF: Mailing Postal Code' },
      
      // Salesforce Health Cloud - Patient Fields
      { name: 'Patient__c.Name', type: 'string', required: false, label: 'SF: Patient Name' },
      { name: 'Patient__c.Date_of_Birth__c', type: 'date', required: false, label: 'SF: Patient DOB' },
      { name: 'Patient__c.Gender__c', type: 'string', required: false, label: 'SF: Patient Gender' },
      { name: 'Patient__c.Address__c', type: 'string', required: false, label: 'SF: Patient Address' },
      { name: 'Patient__c.Phone__c', type: 'phone', required: false, label: 'SF: Patient Phone' },
      { name: 'Patient__c.Email__c', type: 'email', required: false, label: 'SF: Patient Email' },
      { name: 'Patient__c.MRN__c', type: 'string', required: false, label: 'SF: Medical Record Number' },
      { name: 'Patient__c.Insurance_ID__c', type: 'string', required: false, label: 'SF: Patient Insurance ID' },
      
      // Salesforce Prescription Custom Object Fields
      { name: 'Prescription__c.Name', type: 'string', required: false, label: 'SF: Prescription Name' },
      { name: 'Prescription__c.Patient__c', type: 'string', required: false, label: 'SF: Rx Patient Lookup' },
      { name: 'Prescription__c.Medication_Name__c', type: 'string', required: false, label: 'SF: Rx Medication Name' },
      { name: 'Prescription__c.Drug_Name__c', type: 'string', required: false, label: 'SF: Rx Drug Name' },
      { name: 'Prescription__c.Dosage__c', type: 'string', required: false, label: 'SF: Rx Dosage' },
      { name: 'Prescription__c.Strength__c', type: 'string', required: false, label: 'SF: Rx Strength' },
      { name: 'Prescription__c.Frequency__c', type: 'string', required: false, label: 'SF: Rx Frequency' },
      { name: 'Prescription__c.Directions__c', type: 'string', required: false, label: 'SF: Rx Directions' },
      { name: 'Prescription__c.SIG_Code__c', type: 'string', required: false, label: 'SF: Rx SIG Code' },
      { name: 'Prescription__c.SIG_Text__c', type: 'string', required: false, label: 'SF: Rx SIG Text' },
      { name: 'Prescription__c.Route__c', type: 'string', required: false, label: 'SF: Rx Route of Administration' },
      { name: 'Prescription__c.Dosage_Form__c', type: 'string', required: false, label: 'SF: Rx Dosage Form' },
      { name: 'Prescription__c.Quantity__c', type: 'number', required: false, label: 'SF: Rx Quantity' },
      { name: 'Prescription__c.Days_Supply__c', type: 'number', required: false, label: 'SF: Rx Days Supply' },
      { name: 'Prescription__c.Refills__c', type: 'number', required: false, label: 'SF: Rx Refills' },
      { name: 'Prescription__c.NDC_Code__c', type: 'string', required: false, label: 'SF: Rx NDC Code' },
      { name: 'Prescription__c.Rx_Number__c', type: 'string', required: false, label: 'SF: Rx Number' },
      { name: 'Prescription__c.Prescription_Date__c', type: 'date', required: false, label: 'SF: Rx Date' },
      { name: 'Prescription__c.Fill_Date__c', type: 'date', required: false, label: 'SF: Rx Fill Date' },
      { name: 'Prescription__c.Expiration_Date__c', type: 'date', required: false, label: 'SF: Rx Expiration' },
      { name: 'Prescription__c.DAW__c', type: 'boolean', required: false, label: 'SF: Rx DAW' },
      { name: 'Prescription__c.PRN__c', type: 'boolean', required: false, label: 'SF: Rx PRN' },
      { name: 'Prescription__c.PRN_Reason__c', type: 'string', required: false, label: 'SF: Rx PRN Reason' },
      
      // Salesforce Prescriber/Provider Fields
      { name: 'Prescriber__c.Name', type: 'string', required: false, label: 'SF: Prescriber Name' },
      { name: 'Prescriber__c.NPI__c', type: 'string', required: false, label: 'SF: Prescriber NPI' },
      { name: 'Prescriber__c.DEA_Number__c', type: 'string', required: false, label: 'SF: Prescriber DEA' },
      { name: 'Prescriber__c.License_Number__c', type: 'string', required: false, label: 'SF: Prescriber License' },
      { name: 'Prescriber__c.Specialty__c', type: 'string', required: false, label: 'SF: Prescriber Specialty' },
      { name: 'Prescriber__c.Phone__c', type: 'phone', required: false, label: 'SF: Prescriber Phone' },
      { name: 'Prescriber__c.Fax__c', type: 'phone', required: false, label: 'SF: Prescriber Fax' },
      { name: 'Prescriber__c.Address__c', type: 'string', required: false, label: 'SF: Prescriber Address' },
      
      // Salesforce Pharmacy Fields
      { name: 'Pharmacy__c.Name', type: 'string', required: false, label: 'SF: Pharmacy Name' },
      { name: 'Pharmacy__c.Phone__c', type: 'phone', required: false, label: 'SF: Pharmacy Phone' },
      { name: 'Pharmacy__c.Address__c', type: 'string', required: false, label: 'SF: Pharmacy Address' },
      { name: 'Pharmacy__c.NPI__c', type: 'string', required: false, label: 'SF: Pharmacy NPI' },
      { name: 'Pharmacy__c.NCPDP__c', type: 'string', required: false, label: 'SF: Pharmacy NCPDP' },
      { name: 'Pharmacy__c.Type__c', type: 'string', required: false, label: 'SF: Pharmacy Type' },
      
      // Salesforce Medical Insurance Fields  
      { name: 'Medical_Insurance__c.Name', type: 'string', required: false, label: 'SF: Medical Insurance Name' },
      { name: 'Medical_Insurance__c.Member_ID__c', type: 'string', required: false, label: 'SF: Medical Member ID' },
      { name: 'Medical_Insurance__c.Policy_Number__c', type: 'string', required: false, label: 'SF: Medical Policy Number' },
      { name: 'Medical_Insurance__c.Group_Number__c', type: 'string', required: false, label: 'SF: Medical Group Number' },
      { name: 'Medical_Insurance__c.Plan_Type__c', type: 'string', required: false, label: 'SF: Medical Plan Type' },
      { name: 'Medical_Insurance__c.Effective_Date__c', type: 'date', required: false, label: 'SF: Medical Effective Date' },
      { name: 'Medical_Insurance__c.Termination_Date__c', type: 'date', required: false, label: 'SF: Medical Term Date' },
      { name: 'Medical_Insurance__c.Copay__c', type: 'number', required: false, label: 'SF: Medical Copay' },
      { name: 'Medical_Insurance__c.Deductible__c', type: 'number', required: false, label: 'SF: Medical Deductible' },
      { name: 'Medical_Insurance__c.OOP_Max__c', type: 'number', required: false, label: 'SF: Medical OOP Max' },
      { name: 'Medical_Insurance__c.PCP_Name__c', type: 'string', required: false, label: 'SF: PCP Name' },
      { name: 'Medical_Insurance__c.PCP_NPI__c', type: 'string', required: false, label: 'SF: PCP NPI' },
      { name: 'Medical_Insurance__c.Prior_Auth_Required__c', type: 'boolean', required: false, label: 'SF: Prior Auth Required' },
      
      // Salesforce Pharmacy/Rx Insurance Fields  
      { name: 'Rx_Insurance__c.Name', type: 'string', required: false, label: 'SF: Rx Insurance Name' },
      { name: 'Rx_Insurance__c.Member_ID__c', type: 'string', required: false, label: 'SF: Rx Member ID' },
      { name: 'Rx_Insurance__c.Group_Number__c', type: 'string', required: false, label: 'SF: Rx Group Number' },
      { name: 'Rx_Insurance__c.BIN__c', type: 'string', required: false, label: 'SF: Rx BIN' },
      { name: 'Rx_Insurance__c.PCN__c', type: 'string', required: false, label: 'SF: Rx PCN' },
      { name: 'Rx_Insurance__c.PBM_Name__c', type: 'string', required: false, label: 'SF: PBM Name' },
      { name: 'Rx_Insurance__c.Plan_Name__c', type: 'string', required: false, label: 'SF: Rx Plan Name' },
      { name: 'Rx_Insurance__c.Formulary_ID__c', type: 'string', required: false, label: 'SF: Formulary ID' },
      { name: 'Rx_Insurance__c.Copay_Generic__c', type: 'number', required: false, label: 'SF: Rx Copay Generic' },
      { name: 'Rx_Insurance__c.Copay_Brand__c', type: 'number', required: false, label: 'SF: Rx Copay Brand' },
      { name: 'Rx_Insurance__c.Copay_Specialty__c', type: 'number', required: false, label: 'SF: Rx Copay Specialty' },
      { name: 'Rx_Insurance__c.Specialty_Pharmacy__c', type: 'string', required: false, label: 'SF: Specialty Pharmacy' },
      { name: 'Rx_Insurance__c.Mail_Order_Pharmacy__c', type: 'string', required: false, label: 'SF: Mail Order Pharmacy' },
      
      // Salesforce Hub Services/Enrollment Fields
      { name: 'Hub_Enrollment__c.Name', type: 'string', required: false, label: 'SF: Hub Enrollment Name' },
      { name: 'Hub_Enrollment__c.Patient__c', type: 'string', required: false, label: 'SF: Hub Patient Lookup' },
      { name: 'Hub_Enrollment__c.Enrollment_ID__c', type: 'string', required: false, label: 'SF: Hub Enrollment ID' },
      { name: 'Hub_Enrollment__c.Program_Name__c', type: 'string', required: false, label: 'SF: Hub Program Name' },
      { name: 'Hub_Enrollment__c.Enrollment_Date__c', type: 'date', required: false, label: 'SF: Hub Enrollment Date' },
      { name: 'Hub_Enrollment__c.Status__c', type: 'string', required: false, label: 'SF: Hub Enrollment Status' },
      { name: 'Hub_Enrollment__c.Source__c', type: 'string', required: false, label: 'SF: Hub Enrollment Source' },
      { name: 'Hub_Enrollment__c.Consent_Obtained__c', type: 'boolean', required: false, label: 'SF: Consent Obtained' },
      { name: 'Hub_Enrollment__c.Consent_Date__c', type: 'date', required: false, label: 'SF: Consent Date' },
      { name: 'Hub_Enrollment__c.HIPAA_Consent__c', type: 'boolean', required: false, label: 'SF: HIPAA Consent' },
      { name: 'Hub_Enrollment__c.Caregiver_Name__c', type: 'string', required: false, label: 'SF: Caregiver Name' },
      { name: 'Hub_Enrollment__c.Caregiver_Phone__c', type: 'phone', required: false, label: 'SF: Caregiver Phone' },
      { name: 'Hub_Enrollment__c.Case_Manager__c', type: 'string', required: false, label: 'SF: Case Manager' },
      { name: 'Hub_Enrollment__c.Nurse_Educator__c', type: 'string', required: false, label: 'SF: Nurse Educator' },
      { name: 'Hub_Enrollment__c.Therapy_Start_Date__c', type: 'date', required: false, label: 'SF: Therapy Start Date' },
      { name: 'Hub_Enrollment__c.Financial_Assistance__c', type: 'boolean', required: false, label: 'SF: Financial Assistance' },
      { name: 'Hub_Enrollment__c.Copay_Assistance__c', type: 'boolean', required: false, label: 'SF: Copay Assistance' },
      { name: 'Hub_Enrollment__c.PAP_Enrolled__c', type: 'boolean', required: false, label: 'SF: PAP Enrolled' },
    );
  } else if (targetSystem === 'hubspot') {
    commonFields.push(
      { name: 'firstname', type: 'string', required: false, label: 'HS: First Name' },
      { name: 'lastname', type: 'string', required: false, label: 'HS: Last Name' },
      { name: 'company', type: 'string', required: false, label: 'HS: Company' },
      { name: 'hs_lead_status', type: 'string', required: false, label: 'HS: Lead Status' },
      { name: 'date_of_birth', type: 'date', required: false, label: 'HS: Date of Birth' },
      { name: 'address', type: 'string', required: false, label: 'HS: Address' },
      { name: 'city', type: 'string', required: false, label: 'HS: City' },
      { name: 'state', type: 'string', required: false, label: 'HS: State' },
      { name: 'zip', type: 'string', required: false, label: 'HS: ZIP' },
      // HubSpot Healthcare Extensions
      { name: 'insurance_provider', type: 'string', required: false, label: 'HS: Insurance Provider' },
      { name: 'member_id', type: 'string', required: false, label: 'HS: Member ID' },
      { name: 'program_enrollment', type: 'string', required: false, label: 'HS: Program Enrollment' },
      { name: 'enrollment_status', type: 'string', required: false, label: 'HS: Enrollment Status' },
      { name: 'therapy_name', type: 'string', required: false, label: 'HS: Therapy Name' },
    );
  } else if (targetSystem === 'veeva') {
    commonFields.push(
      // Veeva CRM Standard Objects
      { name: 'Account_vod__c', type: 'string', required: false, label: 'Veeva: Account' },
      { name: 'Account_vod__c.Name', type: 'string', required: false, label: 'Veeva: Account Name' },
      { name: 'Account_vod__c.NPI_vod__c', type: 'string', required: false, label: 'Veeva: Account NPI' },
      { name: 'Account_vod__c.Specialty_1_vod__c', type: 'string', required: false, label: 'Veeva: Specialty' },
      { name: 'Account_vod__c.DEA_vod__c', type: 'string', required: false, label: 'Veeva: Account DEA' },
      { name: 'Account_vod__c.License_vod__c', type: 'string', required: false, label: 'Veeva: Account License' },
      
      // Veeva Prescriber/HCP
      { name: 'Prescriber_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber' },
      { name: 'Prescriber_vod__c.Name', type: 'string', required: false, label: 'Veeva: Prescriber Name' },
      { name: 'Prescriber_vod__c.NPI_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber NPI' },
      { name: 'Prescriber_vod__c.DEA_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber DEA' },
      { name: 'Prescriber_vod__c.Specialty_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber Specialty' },
      { name: 'Prescriber_vod__c.Address_vod__c', type: 'string', required: false, label: 'Veeva: Prescriber Address' },
      { name: 'Prescriber_vod__c.Phone_vod__c', type: 'phone', required: false, label: 'Veeva: Prescriber Phone' },
      { name: 'Prescriber_vod__c.Fax_vod__c', type: 'phone', required: false, label: 'Veeva: Prescriber Fax' },
      
      // Veeva Product/Drug
      { name: 'Product_vod__c', type: 'string', required: false, label: 'Veeva: Product' },
      { name: 'Product_vod__c.Name', type: 'string', required: false, label: 'Veeva: Product Name' },
      { name: 'Product_vod__c.NDC_vod__c', type: 'string', required: false, label: 'Veeva: Product NDC' },
      { name: 'Product_vod__c.Strength_vod__c', type: 'string', required: false, label: 'Veeva: Product Strength' },
      { name: 'Product_vod__c.Dosage_Form_vod__c', type: 'string', required: false, label: 'Veeva: Dosage Form' },
      { name: 'Product_vod__c.Route_vod__c', type: 'string', required: false, label: 'Veeva: Route' },
      
      // Veeva Rx/Order
      { name: 'Order_vod__c.Name', type: 'string', required: false, label: 'Veeva: Order Name' },
      { name: 'Order_vod__c.Product_vod__c', type: 'string', required: false, label: 'Veeva: Order Product' },
      { name: 'Order_vod__c.Quantity_vod__c', type: 'number', required: false, label: 'Veeva: Order Quantity' },
      { name: 'Order_vod__c.Account_vod__c', type: 'string', required: false, label: 'Veeva: Order Account' },
      { name: 'Order_vod__c.SIG_vod__c', type: 'string', required: false, label: 'Veeva: Order SIG' },
      { name: 'Order_vod__c.SIG_Code_vod__c', type: 'string', required: false, label: 'Veeva: Order SIG Code' },
      { name: 'Order_vod__c.Directions_vod__c', type: 'string', required: false, label: 'Veeva: Order Directions' },
      { name: 'Order_vod__c.Days_Supply_vod__c', type: 'number', required: false, label: 'Veeva: Days Supply' },
      { name: 'Order_vod__c.Refills_vod__c', type: 'number', required: false, label: 'Veeva: Refills' },
      { name: 'Order_vod__c.DAW_vod__c', type: 'boolean', required: false, label: 'Veeva: DAW' },
      
      // Veeva Patient
      { name: 'Patient_vod__c.Name', type: 'string', required: false, label: 'Veeva: Patient Name' },
      { name: 'Patient_vod__c.Birthdate_vod__c', type: 'date', required: false, label: 'Veeva: Patient DOB' },
      { name: 'Patient_vod__c.Gender_vod__c', type: 'string', required: false, label: 'Veeva: Patient Gender' },
      { name: 'Patient_vod__c.Address_vod__c', type: 'string', required: false, label: 'Veeva: Patient Address' },
      { name: 'Patient_vod__c.Phone_vod__c', type: 'phone', required: false, label: 'Veeva: Patient Phone' },
      { name: 'Patient_vod__c.Email_vod__c', type: 'email', required: false, label: 'Veeva: Patient Email' },
      { name: 'Patient_vod__c.MRN_vod__c', type: 'string', required: false, label: 'Veeva: Patient MRN' },
      
      // Veeva Medical Insurance
      { name: 'Medical_Coverage_vod__c.Name', type: 'string', required: false, label: 'Veeva: Medical Coverage Name' },
      { name: 'Medical_Coverage_vod__c.Payer_vod__c', type: 'string', required: false, label: 'Veeva: Medical Payer' },
      { name: 'Medical_Coverage_vod__c.Member_ID_vod__c', type: 'string', required: false, label: 'Veeva: Medical Member ID' },
      { name: 'Medical_Coverage_vod__c.Group_vod__c', type: 'string', required: false, label: 'Veeva: Medical Group' },
      { name: 'Medical_Coverage_vod__c.Plan_Type_vod__c', type: 'string', required: false, label: 'Veeva: Medical Plan Type' },
      { name: 'Medical_Coverage_vod__c.Effective_Date_vod__c', type: 'date', required: false, label: 'Veeva: Medical Effective Date' },
      { name: 'Medical_Coverage_vod__c.Prior_Auth_Required_vod__c', type: 'boolean', required: false, label: 'Veeva: Prior Auth Required' },
      
      // Veeva Pharmacy/Rx Insurance
      { name: 'Rx_Coverage_vod__c.Name', type: 'string', required: false, label: 'Veeva: Rx Coverage Name' },
      { name: 'Rx_Coverage_vod__c.BIN_vod__c', type: 'string', required: false, label: 'Veeva: Rx BIN' },
      { name: 'Rx_Coverage_vod__c.PCN_vod__c', type: 'string', required: false, label: 'Veeva: Rx PCN' },
      { name: 'Rx_Coverage_vod__c.Group_vod__c', type: 'string', required: false, label: 'Veeva: Rx Group' },
      { name: 'Rx_Coverage_vod__c.Member_ID_vod__c', type: 'string', required: false, label: 'Veeva: Rx Member ID' },
      { name: 'Rx_Coverage_vod__c.PBM_vod__c', type: 'string', required: false, label: 'Veeva: PBM' },
      { name: 'Rx_Coverage_vod__c.Formulary_vod__c', type: 'string', required: false, label: 'Veeva: Formulary' },
      { name: 'Rx_Coverage_vod__c.Specialty_Pharmacy_vod__c', type: 'string', required: false, label: 'Veeva: Specialty Pharmacy' },
      
      // Veeva Hub/Patient Services
      { name: 'Patient_Journey_vod__c.Name', type: 'string', required: false, label: 'Veeva: Patient Journey Name' },
      { name: 'Patient_Journey_vod__c.Patient_vod__c', type: 'string', required: false, label: 'Veeva: Journey Patient' },
      { name: 'Patient_Journey_vod__c.Program_vod__c', type: 'string', required: false, label: 'Veeva: Program Name' },
      { name: 'Patient_Journey_vod__c.Enrollment_Date_vod__c', type: 'date', required: false, label: 'Veeva: Enrollment Date' },
      { name: 'Patient_Journey_vod__c.Status_vod__c', type: 'string', required: false, label: 'Veeva: Journey Status' },
      { name: 'Patient_Journey_vod__c.Consent_vod__c', type: 'boolean', required: false, label: 'Veeva: Consent' },
      { name: 'Patient_Journey_vod__c.Case_Manager_vod__c', type: 'string', required: false, label: 'Veeva: Case Manager' },
      { name: 'Patient_Journey_vod__c.Therapy_Start_vod__c', type: 'date', required: false, label: 'Veeva: Therapy Start' },
      { name: 'Patient_Journey_vod__c.Financial_Assistance_vod__c', type: 'boolean', required: false, label: 'Veeva: Financial Assistance' },
      { name: 'Patient_Journey_vod__c.Copay_Card_vod__c', type: 'boolean', required: false, label: 'Veeva: Copay Card' },
      { name: 'Patient_Journey_vod__c.Adherence_Score_vod__c', type: 'number', required: false, label: 'Veeva: Adherence Score' },
      
      // Veeva Benefit Verification
      { name: 'Benefit_Investigation_vod__c.Name', type: 'string', required: false, label: 'Veeva: BI Name' },
      { name: 'Benefit_Investigation_vod__c.Status_vod__c', type: 'string', required: false, label: 'Veeva: BI Status' },
      { name: 'Benefit_Investigation_vod__c.Coverage_vod__c', type: 'string', required: false, label: 'Veeva: BI Coverage' },
      { name: 'Benefit_Investigation_vod__c.Copay_vod__c', type: 'number', required: false, label: 'Veeva: BI Copay' },
      { name: 'Benefit_Investigation_vod__c.Prior_Auth_vod__c', type: 'boolean', required: false, label: 'Veeva: BI Prior Auth' },
    );
  }
  
  return commonFields;
};

interface TargetField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  required: boolean;
  label: string;
  isCustom?: boolean;
  objectName?: string; // For grouping by CRM object
}

interface SourceField {
  name: string;
  value: any;
  type?: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'date_iso' | 'number' | 'boolean';
  skip: boolean;
  createCustom: boolean;
  customFieldName?: string;
}

// Document type to relevant object categories mapping
const DOCUMENT_TYPE_OBJECTS: Record<string, string[]> = {
  prescription: ['Prescription', 'Order', 'Medication', 'Drug', 'Patient', 'Prescriber', 'Pharmacy', 'Product'],
  insurance_card: ['Medical_Insurance', 'Rx_Insurance', 'Coverage', 'Patient', 'Insurance', 'Payer'],
  medical_insurance: ['Medical_Insurance', 'Coverage', 'Patient', 'Payer', 'Benefit', 'Insurance'],
  pharmacy_insurance: ['Rx_Insurance', 'Pharmacy', 'Coverage', 'Patient', 'Insurance'],
  patient_onboarding: ['Hub_Enrollment', 'Patient', 'Patient_Journey', 'Consent', 'Program', 'Contact', 'Account'],
  hub_enrollment: ['Hub_Enrollment', 'Patient_Journey', 'Patient', 'Program', 'Consent', 'Benefit'],
  lab_result: ['Lab_Result', 'Patient', 'Order', 'Specimen', 'Diagnosis'],
  invoice: ['Invoice', 'Billing', 'Payment', 'Account'],
  passport: ['Identity', 'Patient', 'Document', 'Contact'],
  'x-ray': ['Imaging', 'Radiology', 'Patient', 'Order', 'Diagnosis'],
  ct_scan: ['Imaging', 'Radiology', 'Patient', 'Order', 'Diagnosis'],
  mri: ['Imaging', 'Radiology', 'Patient', 'Order', 'Diagnosis'],
  ecg: ['Cardiology', 'Patient', 'Order', 'Result'],
};

// Check if a field is relevant for a document type
const isFieldRelevantForDocType = (fieldName: string, fieldLabel: string, docType: string): boolean => {
  const relevantObjects = DOCUMENT_TYPE_OBJECTS[docType] || [];
  if (relevantObjects.length === 0) return true; // Show all if no mapping
  
  const normalizedName = fieldName.toLowerCase();
  const normalizedLabel = fieldLabel.toLowerCase();
  
  return relevantObjects.some(obj => {
    const normalizedObj = obj.toLowerCase().replace(/_/g, '');
    return normalizedName.includes(normalizedObj) || normalizedLabel.includes(normalizedObj);
  });
};

// Extract object name from field path (e.g., "Prescription__c.Name" → "Prescription")
const getObjectFromField = (fieldName: string): string => {
  if (fieldName.includes('.')) {
    const obj = fieldName.split('.')[0];
    return obj.replace(/__c$|_vod__c$/i, '').replace(/_/g, ' ');
  }
  // Check common prefixes
  const prefixes = ['SF:', 'Veeva:', 'HS:'];
  for (const prefix of prefixes) {
    if (fieldName.startsWith(prefix)) {
      return 'General';
    }
  }
  return 'General';
};

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceFields: SourceField[];
  targetSystem: 'salesforce' | 'hubspot' | 'veeva' | 'supabase' | 'webhook';
  onConfirmMapping: (mappings: FieldMapping[], customFields: TargetField[]) => void;
  documentType?: string; // Document type for filtering relevant fields
}

// Similarity score using Levenshtein distance
function calculateSimilarity(s1: string, s2: string): number {
  const s1Lower = s1.toLowerCase().replace(/[_\-\s]/g, '');
  const s2Lower = s2.toLowerCase().replace(/[_\-\s]/g, '');
  
  if (s1Lower === s2Lower) return 1;
  if (s1Lower.includes(s2Lower) || s2Lower.includes(s1Lower)) return 0.8;
  
  // Levenshtein distance
  const track = Array(s2Lower.length + 1).fill(null).map(() =>
    Array(s1Lower.length + 1).fill(null));
  
  for (let i = 0; i <= s1Lower.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2Lower.length; j += 1) track[j][0] = j;
  
  for (let j = 1; j <= s2Lower.length; j += 1) {
    for (let i = 1; i <= s1Lower.length; i += 1) {
      const indicator = s1Lower[i - 1] === s2Lower[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLen = Math.max(s1Lower.length, s2Lower.length);
  return 1 - (track[s2Lower.length][s1Lower.length] / maxLen);
}

// Auto-match source to target fields
function autoMatchFields(
  sourceFields: SourceField[],
  targetFields: TargetField[]
): Map<string, string> {
  const matches = new Map<string, string>();
  const usedTargets = new Set<string>();
  
  // Common field name aliases
  const aliases: Record<string, string[]> = {
    'patient_name': ['name', 'full_name', 'patient', 'patientname'],
    'medication': ['drug', 'medicine', 'product', 'rx', 'prescription'],
    'dosage': ['dose', 'strength', 'amount'],
    'frequency': ['schedule', 'interval', 'timing', 'directions'],
    'prescriber': ['doctor', 'physician', 'provider', 'prescribername'],
    'date_of_birth': ['dob', 'birthdate', 'birth_date', 'dateofbirth'],
    'npi_number': ['npi', 'npinumber', 'provider_npi'],
    'insurance_id': ['member_id', 'policy_number', 'insuranceid'],
    'ndc_code': ['ndc', 'ndccode', 'drug_code'],
  };
  
  for (const source of sourceFields) {
    let bestMatch: string | null = null;
    let bestScore = 0;
    
    for (const target of targetFields) {
      if (usedTargets.has(target.name)) continue;
      
      // Direct similarity
      let score = calculateSimilarity(source.name, target.name);
      
      // Check aliases
      const sourceNorm = source.name.toLowerCase().replace(/[_\-\s]/g, '');
      for (const [canonical, aliasList] of Object.entries(aliases)) {
        if (aliasList.includes(sourceNorm) || sourceNorm === canonical.replace(/_/g, '')) {
          const targetNorm = target.name.toLowerCase().replace(/[_\-\s]/g, '');
          if (targetNorm.includes(canonical.replace(/_/g, '')) || 
              aliasList.some(a => targetNorm.includes(a))) {
            score = Math.max(score, 0.9);
          }
        }
      }
      
      // Label similarity bonus
      score = Math.max(score, calculateSimilarity(source.name, target.label) * 0.95);
      
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = target.name;
      }
    }
    
    if (bestMatch) {
      matches.set(source.name, bestMatch);
      usedTargets.add(bestMatch);
    }
  }
  
  return matches;
}

export function FieldMappingDialog({
  open,
  onOpenChange,
  sourceFields,
  targetSystem,
  onConfirmMapping,
  documentType
}: FieldMappingDialogProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [customFields, setCustomFields] = useState<TargetField[]>([]);
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showAllFields, setShowAllFields] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string>('all');
  
  // Get all target fields with object grouping
  const allTargetFields = useMemo(() => {
    const base = getBaseTargetSchema(targetSystem);
    return [...base, ...customFields].map(field => ({
      ...field,
      objectName: getObjectFromField(field.name)
    }));
  }, [targetSystem, customFields]);
  
  // Separate into recommended and optional based on document type
  const { recommendedFields, optionalFields, objectGroups } = useMemo(() => {
    const recommended: TargetField[] = [];
    const optional: TargetField[] = [];
    const groups = new Map<string, TargetField[]>();
    
    allTargetFields.forEach(field => {
      const isRelevant = documentType 
        ? isFieldRelevantForDocType(field.name, field.label, documentType)
        : true;
      
      if (isRelevant) {
        recommended.push(field);
      } else {
        optional.push(field);
      }
      
      // Group by object
      const objName = field.objectName || 'General';
      if (!groups.has(objName)) {
        groups.set(objName, []);
      }
      groups.get(objName)!.push(field);
    });
    
    return { 
      recommendedFields: recommended, 
      optionalFields: optional,
      objectGroups: groups
    };
  }, [allTargetFields, documentType]);
  
  // Get visible target fields based on filters
  const visibleTargetFields = useMemo(() => {
    let fields = showAllFields ? allTargetFields : recommendedFields;
    
    // Filter by object
    if (selectedObject !== 'all') {
      fields = fields.filter(f => (f.objectName || 'General') === selectedObject);
    }
    
    // Filter by search
    if (searchFilter.trim()) {
      const lower = searchFilter.toLowerCase();
      fields = fields.filter(tf => 
        tf.name.toLowerCase().includes(lower) || 
        tf.label.toLowerCase().includes(lower)
      );
    }
    
    return fields;
  }, [allTargetFields, recommendedFields, showAllFields, selectedObject, searchFilter]);
  
  // Get unique objects for filter dropdown
  const availableObjects = useMemo(() => {
    const fields = showAllFields ? allTargetFields : recommendedFields;
    const objects = new Set(fields.map(f => f.objectName || 'General'));
    return Array.from(objects).sort();
  }, [allTargetFields, recommendedFields, showAllFields]);
  
  // Initialize mappings when dialog opens
  useEffect(() => {
    if (open && sourceFields.length > 0) {
      const initialMappings: FieldMapping[] = sourceFields.map(sf => ({
        sourceField: sf.name,
        targetField: '',
        transformation: 'none',
        skip: false,
        createCustom: false
      }));
      setMappings(initialMappings);
      setCustomFields([]);
      setSearchFilter('');
      setShowAllFields(false);
      setSelectedObject('all');
    }
  }, [open, sourceFields]);
  
  const handleAutoMatch = () => {
    setIsAutoMatching(true);
    
    setTimeout(() => {
      // Prioritize recommended fields for auto-matching
      const autoMatches = autoMatchFields(sourceFields, recommendedFields.length > 0 ? recommendedFields : allTargetFields);
      
      setMappings(prev => prev.map(m => {
        const matched = autoMatches.get(m.sourceField);
        if (matched && !m.skip) {
          return { ...m, targetField: matched, createCustom: false };
        }
        return m;
      }));
      
      const matchedCount = autoMatches.size;
      toast.success(`Auto-matched ${matchedCount} of ${sourceFields.length} fields`);
      setIsAutoMatching(false);
    }, 500);
  };
  
  const updateMapping = (sourceField: string, updates: Partial<FieldMapping>) => {
    setMappings(prev => prev.map(m => 
      m.sourceField === sourceField ? { ...m, ...updates } : m
    ));
  };
  
  const handleCreateCustomField = (sourceField: string) => {
    const mapping = mappings.find(m => m.sourceField === sourceField);
    if (!mapping) return;
    
    const customName = mapping.customFieldName || sourceField.replace(/\s+/g, '_');
    const newField: TargetField = {
      name: customName,
      type: 'string',
      required: false,
      label: sourceField,
      isCustom: true
    };
    
    setCustomFields(prev => [...prev, newField]);
    updateMapping(sourceField, { 
      targetField: customName, 
      createCustom: true,
      customFieldName: customName 
    });
    
    toast.success(`Custom field "${customName}" will be created in ${targetSystem}`);
  };
  
  const unmappedCount = mappings.filter(m => !m.targetField && !m.skip).length;
  const mappedCount = mappings.filter(m => m.targetField && !m.skip).length;
  const skippedCount = mappings.filter(m => m.skip).length;
  
  const handleConfirm = () => {
    const activeMappings = mappings.filter(m => m.targetField && !m.skip);
    if (activeMappings.length === 0) {
      toast.error('Please map at least one field');
      return;
    }
    
    onConfirmMapping(mappings, customFields);
    onOpenChange(false);
  };
  
  const getSourceValue = (fieldName: string) => {
    const field = sourceFields.find(f => f.name === fieldName);
    return field?.value || '';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Field Mapping Configuration
          </DialogTitle>
          <DialogDescription>
            Map source fields to {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)} target fields
          </DialogDescription>
        </DialogHeader>
        
        {/* Stats bar */}
        <div className="flex items-center gap-3 py-2 border-b flex-wrap">
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            {mappedCount} Mapped
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {unmappedCount} Unmapped
          </Badge>
          <Badge variant="outline" className="gap-1">
            <X className="h-3 w-3" />
            {skippedCount} Skipped
          </Badge>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoMatch}
            disabled={isAutoMatching}
            className="gap-2"
          >
            {isAutoMatching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Auto-Match All
          </Button>
        </div>
        
        {/* Side-by-side layout: Source LEFT | Mapping CENTER | Target RIGHT */}
        <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_280px] gap-4 overflow-hidden">
          
          {/* LEFT PANEL - Source Fields */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-blue-500/10 border-b px-3 py-2 flex items-center gap-2 shrink-0">
              <Upload className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">Source Fields</span>
              <Badge variant="outline" className="text-xs ml-auto">{sourceFields.length}</Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {sourceFields.map(sf => {
                  const mapping = mappings.find(m => m.sourceField === sf.name);
                  const isMapped = mapping?.targetField && !mapping?.skip;
                  const isSkipped = mapping?.skip;
                  
                  return (
                    <div 
                      key={sf.name}
                      className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                        isSkipped 
                          ? 'bg-muted/50 opacity-60 border-muted' 
                          : isMapped 
                            ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                      }`}
                    >
                      <div className="font-medium truncate flex items-center gap-1">
                        {isMapped && <Check className="h-3 w-3 text-green-600 shrink-0" />}
                        {isSkipped && <X className="h-3 w-3 text-muted-foreground shrink-0" />}
                        <span className="truncate">{sf.name}</span>
                      </div>
                      <div className="text-muted-foreground truncate mt-0.5 pl-4">
                        {String(sf.value || '').substring(0, 25)}
                      </div>
                      {isMapped && (
                        <div className="flex items-center gap-1 mt-1 text-green-600 pl-4">
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span className="truncate text-[10px]">{mapping?.targetField}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {/* CENTER PANEL - Mapping Configuration */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-primary/10 border-b px-3 py-2 flex items-center gap-2 shrink-0">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Mapping Configuration</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1.5">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.sourceField}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${
                      mapping.skip 
                        ? 'bg-muted/30 opacity-70' 
                        : mapping.targetField 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}
                  >
                    {/* Source field name */}
                    <div className="w-[140px] shrink-0 min-w-0">
                      <div className="font-medium text-xs truncate">{mapping.sourceField}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {String(getSourceValue(mapping.sourceField)).substring(0, 30)}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    
                    {/* Target field selection */}
                    <div className="flex-1 min-w-0">
                      {mapping.createCustom ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={mapping.customFieldName || ''}
                            onChange={(e) => updateMapping(mapping.sourceField, { 
                              customFieldName: e.target.value,
                              targetField: e.target.value
                            })}
                            placeholder="Custom field name"
                            className="h-7 text-xs"
                            disabled={mapping.skip}
                          />
                          <Badge variant="secondary" className="gap-0.5 text-[10px] shrink-0">
                            <Sparkles className="h-2.5 w-2.5" />
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          value={mapping.targetField || '__skip__'}
                          onValueChange={(value) => updateMapping(mapping.sourceField, { 
                            targetField: value === '__skip__' ? '' : value 
                          })}
                          disabled={mapping.skip}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="__skip__">-- Skip --</SelectItem>
                            {visibleTargetFields.length > 0 && (
                              <div className="px-2 py-1 text-[10px] text-muted-foreground font-semibold border-b">
                                Recommended ({recommendedFields.length})
                              </div>
                            )}
                            {visibleTargetFields.map(tf => (
                              <SelectItem key={tf.name} value={tf.name}>
                                <span className="text-xs">{tf.label}</span>
                              </SelectItem>
                            ))}
                            {!showAllFields && optionalFields.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-[10px] text-muted-foreground font-semibold border-t border-b">
                                  Other Fields ({optionalFields.length})
                                </div>
                                {optionalFields.slice(0, 20).map(tf => (
                                  <SelectItem key={tf.name} value={tf.name}>
                                    <span className="text-xs text-muted-foreground">{tf.label}</span>
                                  </SelectItem>
                                ))}
                                {optionalFields.length > 20 && (
                                  <div className="px-2 py-1 text-[10px] text-muted-foreground italic">
                                    + {optionalFields.length - 20} more fields...
                                  </div>
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* Transformation */}
                    <Select
                      value={mapping.transformation}
                      onValueChange={(value: any) => updateMapping(mapping.sourceField, { transformation: value })}
                      disabled={mapping.skip || !mapping.targetField}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="uppercase">UPPER</SelectItem>
                        <SelectItem value="lowercase">lower</SelectItem>
                        <SelectItem value="trim">Trim</SelectItem>
                        <SelectItem value="date_iso">Date</SelectItem>
                        <SelectItem value="number">Num</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCreateCustomField(mapping.sourceField)}
                              disabled={mapping.skip || mapping.createCustom}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Create custom field</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Checkbox
                        checked={mapping.skip}
                        onCheckedChange={(checked) => updateMapping(mapping.sourceField, { 
                          skip: !!checked,
                          targetField: checked ? '' : mapping.targetField 
                        })}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* RIGHT PANEL - Target Fields */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-green-500/10 border-b px-3 py-2 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">
                  {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)}
                </span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {visibleTargetFields.length} / {allTargetFields.length}
                </Badge>
              </div>
              
              {/* Object filter and show all toggle */}
              <div className="flex items-center gap-2">
                <Select value={selectedObject} onValueChange={setSelectedObject}>
                  <SelectTrigger className="h-6 text-xs flex-1">
                    <SelectValue placeholder="Filter by object" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Objects</SelectItem>
                    {availableObjects.map(obj => (
                      <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showAllFields ? "secondary" : "outline"}
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => setShowAllFields(!showAllFields)}
                      >
                        {showAllFields ? 'Recommended' : 'Show All'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showAllFields 
                        ? `Show only ${recommendedFields.length} recommended fields for ${documentType || 'this document'}` 
                        : `Show all ${allTargetFields.length} available fields`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {visibleTargetFields.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs p-4">
                    No fields match your filters
                  </div>
                ) : (
                  visibleTargetFields.map(tf => {
                    const isUsed = mappings.some(m => m.targetField === tf.name && !m.skip);
                    const sourceField = mappings.find(m => m.targetField === tf.name && !m.skip)?.sourceField;
                    
                    return (
                      <div 
                        key={tf.name}
                        className={`p-2 rounded border text-xs ${
                          isUsed 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-background border-border opacity-60'
                        } ${tf.isCustom ? 'border-dashed' : ''}`}
                      >
                        <div className="font-medium truncate flex items-center gap-1">
                          {isUsed && <Check className="h-3 w-3 text-green-600 shrink-0" />}
                          <span className="truncate">{tf.label}</span>
                          {tf.isCustom && <Sparkles className="h-2.5 w-2.5 text-primary shrink-0" />}
                        </div>
                        <div className="text-muted-foreground truncate mt-0.5 pl-4 text-[10px]">
                          {tf.name}
                        </div>
                        {isUsed && sourceField && (
                          <div className="flex items-center gap-1 mt-1 text-green-600 pl-4">
                            <ArrowRight className="h-3 w-3 shrink-0 rotate-180" />
                            <span className="truncate text-[10px]">{sourceField}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            
            {/* Custom fields indicator */}
            {customFields.length > 0 && (
              <div className="border-t px-3 py-2 bg-muted/30 shrink-0">
                <div className="flex items-center gap-1 text-xs">
                  <Plus className="h-3 w-3" />
                  <span>{customFields.length} custom field(s) to create</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <Check className="h-4 w-4" />
            Confirm Mapping ({mappedCount} fields)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { FieldMapping, TargetField, SourceField };
