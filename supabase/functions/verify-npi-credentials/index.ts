import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPIVerificationRequest {
  npi: string;
  providerType: 'individual' | 'organization';
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
    console.log('🔍 Starting NPI verification for:', request.npi);

    // Validate input
    if (!request.npi || !/^\d{10}$/.test(request.npi)) {
      throw new Error('Invalid NPI format. Must be 10 digits.');
    }

    const verificationResult: NPIVerificationResult = {
      isValid: false,
      verificationStatus: 'pending',
      issues: [],
      verifiedAt: new Date().toISOString(),
      confidence: 0
    };

    // Step 1: Verify NPI using NPPES API (CMS National Provider Identifier)
    console.log('📞 Calling NPPES API for NPI verification...');
    const npiVerification = await verifyNPIWithNPPES(request.npi);
    
    if (npiVerification.success) {
      verificationResult.npiData = npiVerification.data;
      verificationResult.confidence += 40;
      
      // Validate provider name match if provided
      if (request.providerName) {
        const nameMatch = validateProviderName(
          request.providerName, 
          npiVerification.data
        );
        if (!nameMatch) {
          verificationResult.issues.push('Provider name does not match NPI records');
          verificationResult.confidence -= 10;
        } else {
          verificationResult.confidence += 20;
        }
      }
    } else {
      verificationResult.issues.push('NPI not found in NPPES database');
    }

    // Step 2: Verify state license if provided
    if (request.licenseNumber && request.state) {
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
    if (request.deaNumber) {
      console.log('💊 Verifying DEA number...');
      const deaVerification = await verifyDEANumber(request.deaNumber, request.npi);
      
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

// NPPES API verification
async function verifyNPIWithNPPES(npi: string) {
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
    return { success: false, error: error.message };
  }
}

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