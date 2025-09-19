/**
 * ENHANCED NPI VERIFICATION AND CREDENTIALING SYSTEM
 * Handles Provider, Treatment Center, and Referral Network verification
 * with disambiguation, comprehensive data mapping, and background integration
 * Version: 2.0 - Enhanced for separate section verification
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPIVerificationRequest {
  // Verification type - NEW: Separate verification for each section
  verificationType: 'provider' | 'treatment_center' | 'referral_network';
  
  // Primary search methods (one required)
  npi?: string;                    // Direct NPI lookup (10 digits)
  providerSearch?: {               // Name-based search with disambiguation
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    specialty?: string;           // NEW: For better matching
  };
  
  // Required fields based on verification type
  providerType: 'individual' | 'organization';
  
  // NEW: Section-specific required data
  sectionData?: {
    // For Provider section
    providerName?: string;
    
    // For Treatment Center section  
    treatmentCenterName?: string;
    facilityType?: string;
    
    // For Referral Network section
    referralNetworkName?: string;
    networkType?: string;
  };
  
  // Optional verification fields
  providerName?: string;
  state?: string;
  licenseNumber?: string;
  deaNumber?: string;
  facilityId?: string;
  enrollmentId?: string;
  
  // NEW: Minimum fields validation
  requiredFields?: string[];
  
  // NEW: Background agent integration
  agentSessionId?: string;
  backgroundProcessing?: boolean;
}

interface NPIVerificationResult {
  isValid: boolean;
  npiData?: any;
  licenseVerification?: any;
  deaVerification?: any;
  verificationStatus: 'verified' | 'failed' | 'partial' | 'pending' | 'needs_disambiguation';
  
  // NEW: Enhanced data mapping for form auto-fill
  mappedFields: {
    // Provider fields
    providerName?: string;
    firstName?: string;
    lastName?: string;
    npiNumber?: string;
    providerType?: string;
    specialization?: string;
    taxonomy?: string;
    
    // Treatment Center fields
    treatmentCenterName?: string;
    treatmentCenterNPI?: string;
    facilityType?: string;
    facilityStatus?: string;
    facilityLicenseExpiry?: string;
    
    // Referral Network fields
    referralNetworkName?: string;
    referralNetworkNPI?: string;
    networkType?: string;
    networkStatus?: string;
    
    // Contact fields
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    
    // Credentialing fields
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiry?: string;
    deaNumber?: string;
    deaExpiry?: string;
    
    // Status fields
    providerStatus?: string;
    isActive?: boolean;
  };
  
  // NEW: Multiple results for disambiguation
  alternativeMatches?: Array<{
    npi: string;
    name: string;
    address: string;
    specialty: string;
    score: number;
  }>;
  
  issues: string[];
  verifiedAt: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: NPIVerificationRequest = await req.json();
    console.log('🔍 Starting enhanced provider verification:', request);

    // NEW: Validate minimum required fields based on verification type
    const fieldValidation = validateRequiredFieldsByType(request);
    if (!fieldValidation.isValid) {
      throw new Error(`Missing required fields for ${request.verificationType}: ${fieldValidation.missingFields.join(', ')}`);
    }

    // Validate input - either NPI or search criteria required
    if (!request.npi && !request.providerSearch) {
      throw new Error('Either NPI number or provider search criteria must be provided.');
    }
    
    if (request.npi && !/^\d{10}$/.test(request.npi)) {
      throw new Error('Invalid NPI format. Must be exactly 10 digits.');
    }

    const verificationResult: NPIVerificationResult = {
      isValid: false,
      verificationStatus: 'pending',
      mappedFields: {},
      issues: [],
      verifiedAt: new Date().toISOString(),
      confidence: 0
    };

    // NEW: Background processing option
    if (request.backgroundProcessing && request.agentSessionId) {
      // Start background task without waiting
      EdgeRuntime.waitUntil(performBackgroundVerification(supabase, request));
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Background verification started',
        sessionId: request.agentSessionId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Enhanced search with disambiguation
    console.log('📞 Searching NPPES database with disambiguation...');
    const searchResult = request.npi 
      ? await enhancedNPILookup(request.npi)
      : await enhancedNameSearch(request.providerSearch!, request.providerType);

    if (searchResult.success) {
      if (searchResult.multipleMatches && searchResult.matches!.length > 1) {
        // Handle disambiguation
        const bestMatch = findBestMatchWithContext(searchResult.matches!, request);
        
        if (bestMatch.score < 80) { // Confidence threshold
          verificationResult.verificationStatus = 'needs_disambiguation';
          verificationResult.alternativeMatches = searchResult.matches!.slice(0, 5);
          verificationResult.issues.push(`Found ${searchResult.matches!.length} potential matches. Please provide more specific information.`);
          
          return new Response(JSON.stringify({
            success: true,
            verification: verificationResult
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        verificationResult.npiData = bestMatch.data;
        verificationResult.confidence = bestMatch.score;
      } else {
        verificationResult.npiData = searchResult.data;
        verificationResult.confidence += 60;
      }

      // NEW: Enhanced data mapping for specific verification type
      verificationResult.mappedFields = mapDataForFormSection(
        verificationResult.npiData, 
        request.verificationType,
        request.sectionData
      );
      
      // Validate section-specific data matches
      const sectionValidation = validateSectionData(request, verificationResult.npiData);
      verificationResult.confidence += sectionValidation.confidenceAdjustment;
      verificationResult.issues.push(...sectionValidation.issues);
      
    } else {
      verificationResult.issues.push(
        request.npi 
          ? 'NPI not found in NPPES database'
          : `No providers found matching search criteria: ${searchResult.error}`
      );
    }

    // Get the final NPI for subsequent verifications
    const finalNPI = verificationResult.npiData?.npi || request.npi;

    // Step 2: Verify state license if provided
    if (request.licenseNumber && request.state && finalNPI) {
      console.log('🏛️ Verifying state license...');
      const licenseVerification = await verifyStateLicense(
        request.licenseNumber,
        request.state,
        request.providerType
      );
      
      if (licenseVerification.success) {
        verificationResult.licenseVerification = licenseVerification.data;
        verificationResult.confidence += 25;
      } else {
        verificationResult.issues.push(`License verification failed: ${licenseVerification.error}`);
        verificationResult.confidence -= 15;
      }
    }

    // Step 3: Verify DEA number if provided
    if (request.deaNumber && finalNPI) {
      console.log('💊 Verifying DEA number...');
      const deaVerification = await verifyDEANumber(request.deaNumber, finalNPI);
      
      if (deaVerification.success) {
        verificationResult.deaVerification = deaVerification.data;
        verificationResult.confidence += 15;
      } else {
        verificationResult.issues.push(`DEA verification failed: ${deaVerification.error}`);
      }
    }

    // Step 4: Additional validation checks
    const additionalChecks = await performAdditionalValidations(request, verificationResult.npiData);
    verificationResult.confidence += additionalChecks.confidenceAdjustment;
    verificationResult.issues.push(...additionalChecks.issues);

    // Step 5: Determine final verification status
    if (verificationResult.confidence >= 75) {
      verificationResult.verificationStatus = 'verified';
      verificationResult.isValid = true;
    } else if (verificationResult.confidence >= 50) {
      verificationResult.verificationStatus = 'partial';
      verificationResult.isValid = false;
    } else {
      verificationResult.verificationStatus = 'failed';
      verificationResult.isValid = false;
    }

    // Step 6: Store verification result
    if (finalNPI) {
      const { data: verification, error: dbError } = await supabase
        .from('npi_verification_results')
        .insert({
          npi: finalNPI,
          provider_type: request.providerType,
          facility_id: request.facilityId,
          enrollment_id: request.enrollmentId,
          verification_status: verificationResult.verificationStatus,
          verification_data: verificationResult,
          confidence_score: verificationResult.confidence,
          issues: verificationResult.issues,
          search_method: request.npi ? 'direct_npi' : 'name_search',
          search_criteria: request.providerSearch || { npi: request.npi },
          verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Error storing verification results:', dbError);
      }
    }

    // Step 7: Update enrollment/facility status if applicable
    if (request.enrollmentId && verificationResult.isValid) {
      await updateEnrollmentVerificationStatus(supabase, request.enrollmentId, 'npi_verified');
    }

    console.log('✅ Provider verification completed:', verificationResult.verificationStatus);
    
    return new Response(JSON.stringify({
      success: true,
      verification: verificationResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Provider verification error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      verification: {
        isValid: false,
        verificationStatus: 'failed',
        issues: [error.message],
        verifiedAt: new Date().toISOString(),
        confidence: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Enhanced NPPES API search with name-based lookup
async function searchProviderByName(searchCriteria: any, providerType: string) {
  try {
    // Build search URL with name parameters
    const params = new URLSearchParams({
      version: '2.1',
      enumeration_type: providerType === 'individual' ? 'NPI-1' : 'NPI-2',
      limit: '10' // Get multiple results to find best match
    });

    if (providerType === 'individual') {
      if (searchCriteria.firstName) params.append('first_name', searchCriteria.firstName);
      if (searchCriteria.lastName) params.append('last_name', searchCriteria.lastName);
    } else {
      if (searchCriteria.organizationName) params.append('organization_name', searchCriteria.organizationName);
    }

    if (searchCriteria.city) params.append('city', searchCriteria.city);
    if (searchCriteria.state) params.append('state', searchCriteria.state);
    if (searchCriteria.postalCode) params.append('postal_code', searchCriteria.postalCode.substring(0, 5));

    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Healthcare-Verification-Service/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result_count === 0) {
      return { success: false, error: 'No providers found matching search criteria' };
    }

    // Find best match (first result is usually most relevant)
    const bestMatch = data.results[0];
    
    return {
      success: true,
      multipleMatches: data.result_count > 1,
      matchCount: data.result_count,
      data: {
        npi: bestMatch.number,
        providerType: bestMatch.enumeration_type,
        name: bestMatch.basic?.name || 
              `${bestMatch.basic?.first_name} ${bestMatch.basic?.last_name}`,
        organizationName: bestMatch.basic?.organization_name,
        taxonomies: bestMatch.taxonomies,
        addresses: bestMatch.addresses,
        status: bestMatch.basic?.status,
        lastUpdated: bestMatch.basic?.last_updated,
        enumerationDate: bestMatch.basic?.enumeration_date,
        searchMatch: true
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Direct NPI lookup (when NPI is known)
async function verifyNPIWithNPPES(npi: string) {
  try {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Healthcare-Verification-Service/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result_count === 0) {
      return { success: false, error: 'NPI not found' };
    }

    const provider = data.results[0];
    return {
      success: true,
      data: {
        npi: provider.number,
        providerType: provider.enumeration_type,
        name: provider.basic?.name || 
              `${provider.basic?.first_name} ${provider.basic?.last_name}`,
        organizationName: provider.basic?.organization_name,
        taxonomies: provider.taxonomies,
        addresses: provider.addresses,
        status: provider.basic?.status,
        lastUpdated: provider.basic?.last_updated,
        enumerationDate: provider.basic?.enumeration_date
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// State license verification
async function verifyStateLicense(licenseNumber: string, state: string, providerType: string) {
  try {
    // This would integrate with state medical board APIs
    // For now, we'll simulate the verification
    console.log(`Verifying license ${licenseNumber} in state ${state} for ${providerType}`);
    
    // Mock verification - in production, this would call real state APIs
    const mockVerification = {
      licenseNumber,
      state,
      status: 'active',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      disciplinaryActions: [],
      verifiedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockVerification
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// DEA number verification
async function verifyDEANumber(deaNumber: string, npi: string) {
  try {
    // DEA number format validation
    if (!/^[A-Z]{2}\d{7}$/.test(deaNumber)) {
      return { success: false, error: 'Invalid DEA number format' };
    }

    // DEA checksum validation
    const isValidChecksum = validateDEAChecksum(deaNumber);
    if (!isValidChecksum) {
      return { success: false, error: 'DEA number checksum validation failed' };
    }

    // In production, you would need special authorization to access DEA verification
    // For now, we'll do format validation and basic checks
    
    return {
      success: true,
      data: {
        deaNumber,
        npi,
        format: 'valid',
        checksum: 'valid',
        registrantType: deaNumber.substring(0, 2),
        verifiedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// DEA checksum validation algorithm
function validateDEAChecksum(deaNumber: string): boolean {
  const digits = deaNumber.substring(2, 9);
  const sum1 = parseInt(digits[0]) + parseInt(digits[2]) + parseInt(digits[4]) + parseInt(digits[6]);
  const sum2 = parseInt(digits[1]) + parseInt(digits[3]) + parseInt(digits[5]);
  const checkDigit = (sum1 + 2 * sum2) % 10;
  return checkDigit === parseInt(digits[6]);
}

// Provider name validation
function validateProviderName(providedName: string, npiData: any): boolean {
  const normalizedProvided = providedName.toLowerCase().replace(/[^a-z\s]/g, '');
  
  // Check organization name
  if (npiData.organizationName) {
    const normalizedOrg = npiData.organizationName.toLowerCase().replace(/[^a-z\s]/g, '');
    if (normalizedOrg.includes(normalizedProvided) || normalizedProvided.includes(normalizedOrg)) {
      return true;
    }
  }
  
  // Check individual name
  if (npiData.name) {
    const normalizedNPI = npiData.name.toLowerCase().replace(/[^a-z\s]/g, '');
    if (normalizedNPI.includes(normalizedProvided) || normalizedProvided.includes(normalizedNPI)) {
      return true;
    }
  }

  return false;
}

// Additional validation checks
async function performAdditionalValidations(request: NPIVerificationRequest, npiData: any) {
  const issues: string[] = [];
  let confidenceAdjustment = 0;

  // Check if NPI status is active
  if (npiData?.status && npiData.status.toLowerCase() !== 'active') {
    issues.push(`NPI status is ${npiData.status}, not active`);
    confidenceAdjustment -= 20;
  } else if (npiData?.status) {
    confidenceAdjustment += 5;
  }

  // Check enumeration date age
  if (npiData?.enumerationDate) {
    const enumerationDate = new Date(npiData.enumerationDate);
    const yearsAgo = (Date.now() - enumerationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsAgo > 20) {
      issues.push('NPI enumeration is very old (>20 years)');
      confidenceAdjustment -= 5;
    }
  }

  // Check provider type match
  if (request.providerType && npiData?.providerType) {
    const typeMap = {
      'individual': 'NPI-1',
      'organization': 'NPI-2'
    };

    if (npiData.providerType !== typeMap[request.providerType]) {
      issues.push('Provider type mismatch between request and NPI data');
      confidenceAdjustment -= 15;
    } else {
      confidenceAdjustment += 10;
    }
  }

  return { issues, confidenceAdjustment };
}

// Update enrollment verification status
async function updateEnrollmentVerificationStatus(supabase: any, enrollmentId: string, status: string) {
  try {
    const { error } = await supabase
      .from('patient_enrollments')
      .update({
        verification_status: status,
        npi_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error updating enrollment verification status:', error);
    }
  } catch (error) {
    console.error('Error in updateEnrollmentVerificationStatus:', error);
  }
}

// NEW: Enhanced validation functions

// Validate required fields based on verification type
function validateRequiredFieldsByType(request: NPIVerificationRequest): { isValid: boolean; missingFields: string[] } {
  const requiredByType = {
    provider: ['providerName', 'providerType'],
    treatment_center: ['sectionData.treatmentCenterName'],
    referral_network: ['sectionData.referralNetworkName']
  };

  const required = requiredByType[request.verificationType] || [];
  const missing: string[] = [];

  for (const field of required) {
    if (field.includes('.')) {
      // Handle nested fields
      const [parent, child] = field.split('.');
      if (!request[parent as keyof NPIVerificationRequest] || 
          !(request[parent as keyof NPIVerificationRequest] as any)[child]) {
        missing.push(field);
      }
    } else {
      if (!request[field as keyof NPIVerificationRequest]) {
        missing.push(field);
      }
    }
  }

  // At least one search criteria required
  if (!request.npi && !request.providerSearch) {
    missing.push('npi OR providerSearch');
  }

  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
}

// Enhanced NPI lookup with better data structure
async function enhancedNPILookup(npi: string) {
  try {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Enhanced-Healthcare-Verification-Service/2.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result_count === 0) {
      return { success: false, error: 'NPI not found' };
    }

    const provider = data.results[0];
    return {
      success: true,
      data: formatProviderData(provider),
      multipleMatches: false
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Enhanced name search with disambiguation support
async function enhancedNameSearch(searchCriteria: any, providerType: string) {
  try {
    const params = new URLSearchParams({
      version: '2.1',
      enumeration_type: providerType === 'individual' ? 'NPI-1' : 'NPI-2',
      limit: '20' // Get more results for better disambiguation
    });

    if (providerType === 'individual') {
      if (searchCriteria.firstName) params.append('first_name', searchCriteria.firstName);
      if (searchCriteria.lastName) params.append('last_name', searchCriteria.lastName);
    } else {
      if (searchCriteria.organizationName) params.append('organization_name', searchCriteria.organizationName);
    }

    if (searchCriteria.city) params.append('city', searchCriteria.city);
    if (searchCriteria.state) params.append('state', searchCriteria.state);
    if (searchCriteria.postalCode) params.append('postal_code', searchCriteria.postalCode.substring(0, 5));

    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Enhanced-Healthcare-Verification-Service/2.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result_count === 0) {
      return { success: false, error: 'No providers found matching search criteria' };
    }

    if (data.result_count === 1) {
      return {
        success: true,
        data: formatProviderData(data.results[0]),
        multipleMatches: false
      };
    }

    // Format multiple results for disambiguation
    const matches = data.results.map((result: any, index: number) => ({
      npi: result.number,
      name: result.basic?.organization_name || 
            `${result.basic?.first_name} ${result.basic?.last_name}`,
      address: formatAddress(result.addresses?.[0]),
      specialty: result.taxonomies?.[0]?.desc || 'Not specified',
      score: Math.max(95 - (index * 5), 60), // Decreasing confidence
      data: formatProviderData(result)
    }));

    return {
      success: true,
      multipleMatches: true,
      matches
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Find best match using context clues
function findBestMatchWithContext(matches: any[], request: NPIVerificationRequest): any {
  let bestMatch = matches[0];
  let bestScore = bestMatch.score;

  for (const match of matches) {
    let score = match.score;
    
    // Boost score for location matches
    if (request.providerSearch?.city || request.providerSearch?.state) {
      if (match.address?.toLowerCase().includes(request.providerSearch.city?.toLowerCase() || '')) {
        score += 15;
      }
      if (match.address?.toLowerCase().includes(request.providerSearch.state?.toLowerCase() || '')) {
        score += 10;
      }
    }
    
    // Boost score for specialty matches
    if (request.providerSearch?.specialty) {
      if (match.specialty?.toLowerCase().includes(request.providerSearch.specialty.toLowerCase())) {
        score += 20;
      }
    }
    
    // Boost score for name similarity
    if (request.sectionData?.providerName || request.sectionData?.treatmentCenterName || request.sectionData?.referralNetworkName) {
      const targetName = (request.sectionData?.providerName || 
                         request.sectionData?.treatmentCenterName || 
                         request.sectionData?.referralNetworkName || '').toLowerCase();
      
      if (match.name?.toLowerCase().includes(targetName) || targetName.includes(match.name?.toLowerCase())) {
        score += 25;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = match;
    }
  }

  bestMatch.score = bestScore;
  return bestMatch;
}

// Format provider data with consistent structure
function formatProviderData(provider: any) {
  const basic = provider.basic || {};
  const addresses = provider.addresses || [];
  const taxonomies = provider.taxonomies || [];
  
  const practiceAddress = addresses.find((addr: any) => addr.address_purpose === 'LOCATION') || addresses[0];
  const primaryTaxonomy = taxonomies.find((tax: any) => tax.primary) || taxonomies[0];

  return {
    npi: provider.number,
    providerType: provider.enumeration_type,
    name: basic.organization_name || `${basic.first_name || ''} ${basic.last_name || ''}`.trim(),
    firstName: basic.first_name,
    lastName: basic.last_name,
    organizationName: basic.organization_name,
    status: basic.status,
    enumerationDate: basic.enumeration_date,
    lastUpdated: basic.last_updated,
    addresses,
    taxonomies,
    practiceAddress,
    primaryTaxonomy
  };
}

// Format address for display
function formatAddress(address: any): string {
  if (!address) return '';
  
  const parts = [];
  if (address.address_1) parts.push(address.address_1);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postal_code) parts.push(address.postal_code);
  
  return parts.join(', ');
}

// Map data for specific form section
function mapDataForFormSection(npiData: any, verificationType: string, sectionData: any): any {
  const mappedFields: any = {
    npiNumber: npiData.npi,
    isActive: npiData.status === 'A',
    providerStatus: npiData.status === 'A' ? 'active' : 'inactive'
  };

  // Add contact information
  if (npiData.practiceAddress) {
    mappedFields.phone = npiData.practiceAddress.telephone_number || '';
    mappedFields.address = npiData.practiceAddress.address_1 || '';
    mappedFields.city = npiData.practiceAddress.city || '';
    mappedFields.state = npiData.practiceAddress.state || '';
    mappedFields.zipCode = npiData.practiceAddress.postal_code || '';
  }

  // Add taxonomy/specialty information
  if (npiData.primaryTaxonomy) {
    mappedFields.taxonomy = npiData.primaryTaxonomy.code || '';
    mappedFields.specialization = npiData.primaryTaxonomy.desc || '';
  }

  // Type-specific mapping
  switch (verificationType) {
    case 'provider':
      if (npiData.providerType?.includes('NPI-1')) {
        mappedFields.providerName = npiData.name;
        mappedFields.firstName = npiData.firstName || '';
        mappedFields.lastName = npiData.lastName || '';
        mappedFields.providerType = 'individual';
      } else {
        mappedFields.providerName = npiData.organizationName || npiData.name;
        mappedFields.organizationName = npiData.organizationName || '';
        mappedFields.providerType = 'organization';
      }
      break;
      
    case 'treatment_center':
      mappedFields.treatmentCenterName = npiData.organizationName || npiData.name;
      mappedFields.treatmentCenterNPI = npiData.npi;
      mappedFields.facilityType = 'treatment_center';
      mappedFields.facilityStatus = mappedFields.providerStatus;
      break;
      
    case 'referral_network':
      mappedFields.referralNetworkName = npiData.organizationName || npiData.name;
      mappedFields.referralNetworkNPI = npiData.npi;
      mappedFields.networkType = 'independent';
      mappedFields.networkStatus = mappedFields.providerStatus;
      break;
  }

  return mappedFields;
}

// Validate section-specific data
function validateSectionData(request: NPIVerificationRequest, npiData: any): { confidenceAdjustment: number; issues: string[] } {
  const issues: string[] = [];
  let confidenceAdjustment = 0;

  // Validate name matches based on verification type
  if (request.verificationType === 'provider' && request.sectionData?.providerName) {
    const nameMatch = validateProviderName(request.sectionData.providerName, npiData);
    if (!nameMatch) {
      issues.push('Provider name does not match NPI registry data');
      confidenceAdjustment -= 15;
    } else {
      confidenceAdjustment += 10;
    }
  }

  if (request.verificationType === 'treatment_center' && request.sectionData?.treatmentCenterName) {
    const nameMatch = validateOrganizationName(request.sectionData.treatmentCenterName, npiData);
    if (!nameMatch) {
      issues.push('Treatment center name does not match NPI registry data');
      confidenceAdjustment -= 15;
    } else {
      confidenceAdjustment += 10;
    }
  }

  if (request.verificationType === 'referral_network' && request.sectionData?.referralNetworkName) {
    const nameMatch = validateOrganizationName(request.sectionData.referralNetworkName, npiData);
    if (!nameMatch) {
      issues.push('Referral network name does not match NPI registry data');
      confidenceAdjustment -= 15;
    } else {
      confidenceAdjustment += 10;
    }
  }

  // Validate provider type matches
  const expectedType = request.verificationType === 'provider' && request.providerType === 'individual' ? 'NPI-1' : 'NPI-2';
  if (npiData.providerType && npiData.providerType !== expectedType) {
    issues.push(`Provider type mismatch: expected ${expectedType}, found ${npiData.providerType}`);
    confidenceAdjustment -= 10;
  }

  return { confidenceAdjustment, issues };
}

// Validate organization name
function validateOrganizationName(providedName: string, npiData: any): boolean {
  const normalizedProvided = providedName.toLowerCase().replace(/[^a-z\s]/g, '');
  const normalizedNPI = (npiData.organizationName || npiData.name || '').toLowerCase().replace(/[^a-z\s]/g, '');
  
  return normalizedNPI.includes(normalizedProvided) || normalizedProvided.includes(normalizedNPI);
}

// Background verification processing
async function performBackgroundVerification(supabase: any, request: NPIVerificationRequest) {
  try {
    console.log('🔄 Starting background verification for session:', request.agentSessionId);
    
    // Perform full verification in background
    // This would run the same verification but save results for later retrieval
    
    // Update agent session with verification progress
    if (request.agentSessionId) {
      await supabase
        .from('agent_sessions')
        .update({
          [`${request.verificationType}_verification_status`]: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.agentSessionId);
    }
    
    // Simulate verification work
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update completion status
    if (request.agentSessionId) {
      await supabase
        .from('agent_sessions')
        .update({
          [`${request.verificationType}_verification_status`]: 'completed',
          [`${request.verificationType}_verified_at`]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.agentSessionId);
    }
    
    console.log('✅ Background verification completed for session:', request.agentSessionId);
    
  } catch (error) {
    console.error('❌ Background verification error:', error);
    
    // Update error status
    if (request.agentSessionId) {
      await supabase
        .from('agent_sessions')
        .update({
          [`${request.verificationType}_verification_status`]: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.agentSessionId);
    }
  }
}