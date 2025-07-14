import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthcareContext {
  facilityData?: any[];
  clinicalTrials?: any[];
  onboardingStatus?: any[];
  apiIntegrations?: any[];
  securityEvents?: any[];
  complianceData?: any[];
}

interface MCPRequest {
  context: 'facility' | 'clinical' | 'compliance' | 'integration' | 'security' | 'general';
  query: string;
  facilityId?: string;
  userId?: string;
  includeContext?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, query, facilityId, userId, includeContext = [] }: MCPRequest = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Gather healthcare context based on request type
    const healthcareContext = await gatherHealthcareContext(
      supabase, 
      context, 
      facilityId, 
      userId, 
      includeContext
    );

    // Generate system prompt based on context
    const systemPrompt = generateHealthcareSystemPrompt(context, healthcareContext);

    // Call OpenAI GPT-4o-mini for healthcare reasoning
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    // Log the interaction for audit purposes
    await supabase.rpc('log_security_event', {
      p_user_id: userId || null,
      p_event_type: 'ai_healthcare_query',
      p_severity: 'info',
      p_description: `Healthcare AI query processed: ${context}`,
      p_metadata: {
        context,
        query_length: query.length,
        response_length: generatedContent.length,
        facility_id: facilityId,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      response: generatedContent,
      context: context,
      metadata: {
        model: 'gpt-4o-mini',
        context_items: Object.keys(healthcareContext).length,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Healthcare AI Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Healthcare AI processing failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherHealthcareContext(
  supabase: any, 
  context: string, 
  facilityId?: string, 
  userId?: string,
  includeContext: string[] = []
): Promise<HealthcareContext> {
  const healthcareContext: HealthcareContext = {};

  try {
    // Always include facility data for healthcare context
    if (context === 'facility' || includeContext.includes('facility')) {
      const { data: facilities } = await supabase
        .from('facilities')
        .select(`
          id, name, facility_type, address, phone, email, 
          license_number, npi_number, is_active
        `)
        .eq('is_active', true)
        .limit(10);
      healthcareContext.facilityData = facilities || [];
    }

    // Include clinical trials for medical context
    if (context === 'clinical' || includeContext.includes('clinical')) {
      const { data: trials } = await supabase
        .from('clinical_trials')
        .select(`
          id, title, phase, trial_status, primary_indication,
          patient_population, enrollment_current, enrollment_target,
          primary_endpoint, nct_number
        `)
        .eq('is_active', true)
        .limit(5);
      healthcareContext.clinicalTrials = trials || [];
    }

    // Include onboarding data for compliance context
    if (context === 'compliance' || includeContext.includes('onboarding')) {
      const { data: onboarding } = await supabase
        .from('treatment_center_onboarding')
        .select(`
          id, facility_name, facility_type, onboarding_status,
          primary_specialty, current_step, compliance_status
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      healthcareContext.onboardingStatus = onboarding || [];
    }

    // Include API integrations for technical context
    if (context === 'integration' || includeContext.includes('api')) {
      const { data: integrations } = await supabase
        .from('api_integration_registry')
        .select(`
          id, name, type, category, status, lifecycle_stage,
          endpoints_count, description, purpose
        `)
        .eq('status', 'active')
        .limit(10);
      healthcareContext.apiIntegrations = integrations || [];
    }

    // Include security events for security context
    if (context === 'security' || includeContext.includes('security')) {
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select(`
          id, event_type, severity, description, created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      healthcareContext.securityEvents = securityEvents || [];
    }

    // Include compliance test cases
    if (context === 'compliance' || includeContext.includes('testing')) {
      const { data: testCases } = await supabase
        .from('comprehensive_test_cases')
        .select(`
          id, test_name, test_category, validation_level,
          compliance_requirements, test_status, module_name
        `)
        .in('validation_level', ['IQ', 'OQ', 'PQ'])
        .limit(10);
      healthcareContext.complianceData = testCases || [];
    }

  } catch (error) {
    console.error('Error gathering healthcare context:', error);
  }

  return healthcareContext;
}

function generateHealthcareSystemPrompt(context: string, healthcareContext: HealthcareContext): string {
  const basePrompt = `You are a specialized healthcare AI assistant with expertise in:
- Healthcare facility management and compliance
- Clinical trial operations and regulatory requirements
- HIPAA, 21 CFR Part 11, and healthcare data governance
- API integrations and healthcare data exchange
- Medical device and pharmaceutical operations

CRITICAL GUIDELINES:
- Always prioritize patient safety and data privacy
- Ensure HIPAA compliance in all recommendations
- Reference relevant regulatory frameworks (FDA, 21 CFR Part 11, ICH GCP)
- Provide actionable, evidence-based guidance
- Maintain professional medical terminology while being accessible

Current Context: ${context}`;

  let contextualData = '\n\nRELEVANT HEALTHCARE DATA:\n';

  if (healthcareContext.facilityData?.length) {
    contextualData += `\nFacilities (${healthcareContext.facilityData.length}):
${healthcareContext.facilityData.map(f => 
  `- ${f.name} (${f.facility_type}) - License: ${f.license_number || 'N/A'}, NPI: ${f.npi_number || 'N/A'}`
).join('\n')}`;
  }

  if (healthcareContext.clinicalTrials?.length) {
    contextualData += `\n\nClinical Trials (${healthcareContext.clinicalTrials.length}):
${healthcareContext.clinicalTrials.map(t => 
  `- ${t.title} | Phase: ${t.phase} | Status: ${t.trial_status} | Indication: ${t.primary_indication}`
).join('\n')}`;
  }

  if (healthcareContext.onboardingStatus?.length) {
    contextualData += `\n\nOnboarding Status (${healthcareContext.onboardingStatus.length}):
${healthcareContext.onboardingStatus.map(o => 
  `- ${o.facility_name} | Type: ${o.facility_type} | Status: ${o.onboarding_status} | Step: ${o.current_step}`
).join('\n')}`;
  }

  if (healthcareContext.apiIntegrations?.length) {
    contextualData += `\n\nAPI Integrations (${healthcareContext.apiIntegrations.length}):
${healthcareContext.apiIntegrations.map(a => 
  `- ${a.name} (${a.type}) | Category: ${a.category} | Status: ${a.status} | Endpoints: ${a.endpoints_count}`
).join('\n')}`;
  }

  if (healthcareContext.securityEvents?.length) {
    contextualData += `\n\nRecent Security Events (${healthcareContext.securityEvents.length}):
${healthcareContext.securityEvents.map(s => 
  `- ${s.event_type} | Severity: ${s.severity} | ${s.description}`
).join('\n')}`;
  }

  if (healthcareContext.complianceData?.length) {
    contextualData += `\n\nCompliance Test Cases (${healthcareContext.complianceData.length}):
${healthcareContext.complianceData.map(c => 
  `- ${c.test_name} | Level: ${c.validation_level} | Status: ${c.test_status} | Module: ${c.module_name}`
).join('\n')}`;
  }

  return basePrompt + contextualData + `

Based on this healthcare context, provide comprehensive, compliant, and actionable guidance.`;
}