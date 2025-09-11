/**
 * NPI VERIFICATION EDGE FUNCTION
 * Verifies National Provider Identifier (NPI) numbers using the NPPES API
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPIResponse {
  result_count: number;
  results?: Array<{
    basic: {
      first_name?: string;
      last_name?: string;
      organization_name?: string;
      credential?: string;
      sole_proprietor?: string;
      gender?: string;
      enumeration_date?: string;
      certification_date?: string;
      last_updated?: string;
      status?: string;
      name_prefix?: string;
      name_suffix?: string;
      middle_name?: string;
    };
    addresses?: Array<{
      country_code?: string;
      country_name?: string;
      address_purpose?: string;
      address_type?: string;
      address_1?: string;
      address_2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      telephone_number?: string;
      fax_number?: string;
    }>;
    taxonomies?: Array<{
      code?: string;
      desc?: string;
      primary?: boolean;
      state?: string;
      license?: string;
    }>;
    identifiers?: Array<{
      code?: string;
      desc?: string;
      issuer?: string;
      identifier?: string;
      state?: string;
    }>;
    endpoints?: Array<{
      endpointType?: string;
      endpointTypeDescription?: string;
      endpoint?: string;
      affiliation?: string;
      use?: string;
      contentType?: string;
      country_code?: string;
      country_name?: string;
      address_type?: string;
      address_1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
    }>;
    other_names?: Array<{
      type?: string;
      code?: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      prefix?: string;
      suffix?: string;
      credential?: string;
    }>;
  }>;
}

serve(async (req) => {
  console.log('🔍 NPI Verification function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { npi } = await req.json();
    
    if (!npi) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'NPI number is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate NPI format (10 digits)
    const npiRegex = /^\d{10}$/;
    if (!npiRegex.test(npi)) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Invalid NPI format. NPI must be 10 digits.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🔍 Verifying NPI: ${npi}`);

    // Call NPPES API
    const nppeUrl = `https://npiregistry.cms.hhs.gov/api/?number=${npi}&enumeration_type=&taxonomy_description=&first_name=&use_first_name_alias=&last_name=&organization_name=&address_purpose=&city=&state=&postal_code=&country_code=&limit=10&skip=&pretty=on&version=2.1`;
    
    const nppeResponse = await fetch(nppeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Healthcare-Enrollment-System/1.0'
      }
    });

    if (!nppeResponse.ok) {
      console.error('❌ NPPES API error:', nppeResponse.status, nppeResponse.statusText);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'NPI verification service temporarily unavailable' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const nppeData: NPIResponse = await nppeResponse.json();
    
    console.log(`📊 NPPES Response - Result Count: ${nppeData.result_count}`);

    if (nppeData.result_count === 0) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'NPI not found in NPPES registry' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (nppeData.results && nppeData.results.length > 0) {
      const provider = nppeData.results[0];
      const basic = provider.basic;
      const addresses = provider.addresses || [];
      const taxonomies = provider.taxonomies || [];
      const primaryTaxonomy = taxonomies.find(t => t.primary) || taxonomies[0];

      // Check if provider is active
      const isActive = basic.status === 'A';
      
      if (!isActive) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            error: 'NPI is not active' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Extract provider information
      const providerInfo = {
        npi: npi,
        verified: true,
        status: basic.status,
        provider_type: basic.sole_proprietor === 'YES' ? 'Individual' : 'Organization',
        name: basic.organization_name || `${basic.first_name || ''} ${basic.middle_name || ''} ${basic.last_name || ''}`.trim(),
        first_name: basic.first_name,
        last_name: basic.last_name,
        organization_name: basic.organization_name,
        credential: basic.credential,
        gender: basic.gender,
        enumeration_date: basic.enumeration_date,
        last_updated: basic.last_updated,
        primary_taxonomy: primaryTaxonomy ? {
          code: primaryTaxonomy.code,
          description: primaryTaxonomy.desc,
          state: primaryTaxonomy.state,
          license: primaryTaxonomy.license
        } : null,
        practice_address: addresses.find(addr => addr.address_purpose === 'LOCATION') || addresses[0],
        mailing_address: addresses.find(addr => addr.address_purpose === 'MAILING'),
        taxonomies: taxonomies.map(tax => ({
          code: tax.code,
          description: tax.desc,
          primary: tax.primary,
          state: tax.state,
          license: tax.license
        })),
        verification_timestamp: new Date().toISOString()
      };

      console.log('✅ NPI verification successful:', providerInfo.name);

      return new Response(
        JSON.stringify(providerInfo),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'No provider data found' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ NPI verification error:', error);
    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: 'Internal server error during NPI verification' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});