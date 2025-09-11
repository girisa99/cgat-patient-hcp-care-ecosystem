import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPIVerificationRequest {
  // Primary search methods (one required)
  npi?: string;                    // Direct NPI lookup (10 digits)
  providerSearch?: {               // Name-based search
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  
  // Required fields
  providerType: 'individual' | 'organization';
  
  // Optional verification fields
  providerName?: string;
  state?: string;
  licenseNumber?: string;
  deaNumber?: string;
  facilityId?: string;
  enrollmentId?: string;
}

interface NPIVerificationResult {
  isValid: boolean;
  npiData?: any;
  licenseVerification?: any;
  deaVerification?: any;
  verificationStatus: 'verified' | 'failed' | 'partial' | 'pending';
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
    console.log('🔍 Starting provider verification:', request);

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
      issues: [],
      verifiedAt: new Date().toISOString(),
      confidence: 0
    };

    // Step 1: Find and verify provider using NPI or name-based search
    console.log('📞 Searching NPPES database...');
    const npiLookupResult = request.npi 
      ? await verifyNPIWithNPPES(request.npi)
      : await searchProviderByName(request.providerSearch!, request.providerType);
    
    if (npiLookupResult.success) {
      verificationResult.npiData = npiLookupResult.data;
      verificationResult.confidence += 40;
      
      // If we found multiple matches, note this
      if (npiLookupResult.multipleMatches) {
        verificationResult.issues.push(`Found ${npiLookupResult.matchCount} potential matches. Using best match.`);
        verificationResult.confidence -= 5;
      }
      
      // Validate provider name match if provided
      if (request.providerName && npiLookupResult.data) {
        const nameMatch = validateProviderName(
          request.providerName, 
          npiLookupResult.data
        );
        if (!nameMatch) {
          verificationResult.issues.push('Provider name does not match found records');
          verificationResult.confidence -= 10;
        } else {
          verificationResult.confidence += 20;
        }
      }
    } else {
      verificationResult.issues.push(
        request.npi 
          ? 'NPI not found in NPPES database'
          : `No providers found matching search criteria: ${npiLookupResult.error}`
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
    if (verificationResult.confidence >= 70) {
      verificationResult.isValid = true;
      verificationResult.verificationStatus = 'verified';
    } else if (verificationResult.confidence >= 40) {
      verificationResult.verificationStatus = 'partial';
    } else {
      verificationResult.verificationStatus = 'failed';
    }

    // Step 6: Store verification results in database
    const { error: storeError } = await supabase
      .from('npi_verification_results')
      .insert({
        npi: request.npi,
        provider_type: request.providerType,
        verification_status: verificationResult.verificationStatus,
        verification_data: verificationResult,
        confidence_score: verificationResult.confidence,
        issues: verificationResult.issues,
        facility_id: request.facilityId,
        enrollment_id: request.enrollmentId,
        verified_at: verificationResult.verifiedAt
      });

    if (storeError) {
      console.error('❌ Error storing verification results:', storeError);
    }

    // Step 7: Update enrollment/facility status if applicable
    if (request.enrollmentId && verificationResult.isValid) {
      await updateEnrollmentVerificationStatus(supabase, request.enrollmentId, 'npi_verified');
    }

    console.log('✅ NPI verification completed:', verificationResult.verificationStatus);

    return new Response(JSON.stringify({
      success: true,
      verification: verificationResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ NPI verification error:', error);
    
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
  try {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?number=${npi}&enumeration_type=&taxonomy_description=&name_purpose=&first_name=&use_first_name_alias=&last_name=&organization_name=&address_purpose=&city=&state=&postal_code=&country_code=&limit=&skip=&version=2.1`,
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
// Direct NPI lookup (when NPI is known)
async function verifyNPIWithNPPES(npi: string) {

// State license verification (implementation varies by state)
async function verifyStateLicense(licenseNumber: string, state: string, providerType: string) {
  try {
    // This is a simplified implementation
    // In production, you would integrate with specific state APIs
    
    // Example state APIs:
    // California: https://www.mbc.ca.gov/
    // Texas: https://www.tmb.state.tx.us/
    // New York: https://apps.health.ny.gov/
    
    console.log(`Verifying ${state} license: ${licenseNumber} for ${providerType}`);
    
    // Mock verification for demo (replace with actual state API calls)
    const mockVerification = {
      licenseNumber,
      state,
      status: 'Active',
      expirationDate: '2025-12-31',
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
    confidenceAdjustment += 10;
  }

  // Check enumeration date (not too old)
  if (npiData?.enumerationDate) {
    const enumerationDate = new Date(npiData.enumerationDate);
    const yearsOld = (new Date().getTime() - enumerationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsOld > 20) {
      issues.push('NPI enumeration is very old (>20 years)');
      confidenceAdjustment -= 5;
    }
  }

  // Check provider type consistency
  if (request.providerType && npiData?.providerType) {
    const typeMap = {
      'individual': 'NPI-1',
      'organization': 'NPI-2'
    };
    
    if (npiData.providerType !== typeMap[request.providerType]) {
      issues.push('Provider type mismatch between request and NPI data');
      confidenceAdjustment -= 15;
    } else {
      confidenceAdjustment += 5;
    }
  }

  return { issues, confidenceAdjustment };
}

// Update enrollment verification status
async function updateEnrollmentVerificationStatus(supabase: any, enrollmentId: string, status: string) {
  try {
    const { error } = await supabase
      .from('enrollment_instances')
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