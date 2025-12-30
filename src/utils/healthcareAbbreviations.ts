/**
 * Healthcare Abbreviation Expansion Utilities
 * Extracted from DocumentProcessing.tsx for reusability
 */

// Healthcare abbreviation expansion dictionary
export const HEALTHCARE_ABBREVIATIONS: Record<string, string> = {
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
  'dx': 'Diagnosis',
  'sig': 'Signature/Instructions',
  'qty': 'Quantity',
  'rx': 'Prescription',
  'otc': 'Over The Counter',
  'er': 'Emergency Room',
  'urgent_care': 'Urgent Care',
  'specialist': 'Specialist',
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

// Function to expand abbreviations in field names
export const expandAbbreviation = (text: string): string => {
  const lowerText = text.toLowerCase().replace(/\s+/g, '_');
  if (HEALTHCARE_ABBREVIATIONS[lowerText]) {
    return HEALTHCARE_ABBREVIATIONS[lowerText];
  }
  // Check partial matches
  for (const [abbr, full] of Object.entries(HEALTHCARE_ABBREVIATIONS)) {
    if (lowerText.includes(abbr) && abbr.length > 2) {
      return text.replace(new RegExp(abbr, 'gi'), full);
    }
  }
  // Capitalize first letter of each word
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Format field key to display label
export const formatFieldLabel = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
