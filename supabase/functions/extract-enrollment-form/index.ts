/**
 * DYNAMIC ENROLLMENT FORM EXTRACTION
 * Uses Lovable AI to dynamically extract ALL fields from any patient enrollment form
 * Automatically detects sections, fields, and maps to standard keys
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractionRequest {
  fileUrl?: string;
  fileBase64?: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  extractSignatures?: boolean;
  performValidation?: boolean;
  mapToStandardFields?: boolean;
}

// Section types that AI should detect
const SECTION_TYPES = [
  'patient_information',
  'prescriber_provider', 
  'insurance_coverage',
  'income_financial',
  'medication_requested',
  'caregiver_representative',
  'consent_authorization',
  'hipaa_authorization',
  'shipping_delivery',
  'program_selection',
  'clinical_diagnosis',
  'attestation_signature',
  'employer_information',
  'pharmacy_information',
  'additional_documents',
  'unknown'
];

// Standard field keys for mapping
const STANDARD_FIELD_MAPPINGS: Record<string, string[]> = {
  patient_first_name: ['first name', 'patient first', 'given name', 'nombre'],
  patient_last_name: ['last name', 'patient last', 'surname', 'family name', 'apellido'],
  patient_dob: ['date of birth', 'dob', 'birth date', 'birthdate', 'fecha de nacimiento'],
  patient_ssn: ['ssn', 'social security', 'social security number', 'last 4'],
  patient_phone: ['phone', 'telephone', 'mobile', 'cell', 'telefono'],
  patient_email: ['email', 'e-mail', 'correo'],
  patient_address: ['address', 'street', 'direccion'],
  patient_city: ['city', 'ciudad'],
  patient_state: ['state', 'estado'],
  patient_zip: ['zip', 'zip code', 'postal', 'codigo postal'],
  prescriber_name: ['prescriber', 'physician', 'doctor', 'provider name', 'hcp name'],
  prescriber_npi: ['npi', 'national provider'],
  prescriber_dea: ['dea', 'dea number'],
  insurance_name: ['insurance', 'payer', 'carrier', 'plan name'],
  member_id: ['member id', 'subscriber id', 'policy number', 'id number'],
  group_number: ['group', 'group number', 'grp'],
  bin_number: ['bin', 'rx bin'],
  pcn_number: ['pcn', 'rx pcn'],
  annual_income: ['income', 'annual income', 'household income', 'yearly income'],
  household_size: ['household size', 'family size', 'number of people', 'dependents'],
  medication_name: ['medication', 'drug', 'medicine', 'product', 'rx'],
  diagnosis: ['diagnosis', 'condition', 'icd', 'indication'],
};

const EXTRACTION_SYSTEM_PROMPT = `You are an expert medical document processor specializing in patient assistance program (PAP) enrollment forms.

Your task is to extract ALL fields from the provided enrollment form image/document.

CRITICAL INSTRUCTIONS:
1. Extract EVERY field you can see, including empty fields
2. Identify the form sections (e.g., Patient Information, Insurance, Income, etc.)
3. For each field, provide:
   - The exact label as shown on the form
   - The value (or null if empty)
   - The field type (text, date, phone, email, ssn, currency, number, checkbox, radio, signature, address, dropdown, multiline)
   - Whether it's required (look for * or "required" indicators)
   - Your confidence level (0-1)
   - Which page it appears on

4. SECTION DETECTION: Assign each field to one of these sections:
   - patient_information: Name, DOB, SSN, address, phone, email, gender, language
   - prescriber_provider: Physician info, NPI, DEA, facility, specialty
   - insurance_coverage: Insurance plans, member IDs, groups, BIN/PCN
   - income_financial: Income, household size, tax status
   - medication_requested: Drug name, strength, quantity, diagnosis
   - caregiver_representative: Caregiver/guardian info
   - consent_authorization: General consents and authorizations
   - hipaa_authorization: HIPAA-specific authorizations
   - shipping_delivery: Shipping address, delivery preferences
   - program_selection: PAP type, copay assistance, bridge program
   - clinical_diagnosis: Medical conditions, lab values, prior treatments
   - attestation_signature: Provider attestation, signatures
   - employer_information: Employment details
   - pharmacy_information: Pharmacy details, specialty pharmacy
   - additional_documents: Supporting docs needed
   - unknown: Cannot determine section

5. FORM IDENTIFICATION: Also identify:
   - Manufacturer name (e.g., Gilead, Johnson & Johnson, Lilly, Novartis, Novo Nordisk)
   - Program name (e.g., Advancing Access, Lilly Cares, Support Path)
   - Form title
   - Form version/date if visible
   - Contact phone/fax numbers
   - Total pages

Return your response as a valid JSON object with this structure:
{
  "formIdentification": {
    "manufacturerName": string,
    "programName": string,
    "formTitle": string,
    "formVersion": string or null,
    "formDate": string or null,
    "formLanguage": "English" or other,
    "faxNumber": string or null,
    "phoneNumber": string or null,
    "websiteUrl": string or null,
    "logoDetected": boolean,
    "totalPages": number
  },
  "detectedSections": [
    {
      "sectionType": one of the section types above,
      "sectionTitle": "exact title from form",
      "pageNumbers": [1],
      "confidence": 0.95,
      "fieldCount": 5
    }
  ],
  "extractedFields": [
    {
      "fieldId": "unique_id",
      "fieldLabel": "exact label from form",
      "fieldValue": "extracted value" or null,
      "fieldType": "text|date|phone|email|ssn|currency|number|checkbox|radio|signature|address|dropdown|multiline",
      "sectionType": "patient_information",
      "required": true or false,
      "confidence": 0.95,
      "pageNumber": 1
    }
  ]
}

Be thorough - extract EVERY field visible on every page. Do not skip any fields, even if they appear empty.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: ExtractionRequest = await req.json();
    const startTime = Date.now();

    // Prepare image content for AI
    let imageContent: any;
    if (request.fileBase64) {
      // Base64 image
      const mimeType = request.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
      imageContent = {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${request.fileBase64}`
        }
      };
    } else if (request.fileUrl) {
      // URL-based image
      imageContent = {
        type: "image_url",
        image_url: {
          url: request.fileUrl
        }
      };
    } else {
      throw new Error("Either fileUrl or fileBase64 must be provided");
    }

    console.log(`[extract-enrollment-form] Processing ${request.fileName}`);

    // Call Lovable AI for extraction with vision
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: EXTRACTION_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ALL fields from this enrollment form. Be thorough and include every field you can see, even empty ones. Return valid JSON only.`
              },
              imageContent
            ]
          }
        ],
        max_tokens: 16000,
        temperature: 0.1, // Low temperature for accuracy
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[extract-enrollment-form] AI error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    // Parse AI response
    let extractedData;
    try {
      // Handle potential markdown code blocks
      let jsonStr = content;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }
      extractedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("[extract-enrollment-form] JSON parse error:", parseError);
      console.log("[extract-enrollment-form] Raw content:", content.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Process and enrich the extracted data
    const enrichedFields = (extractedData.extractedFields || []).map((field: any, index: number) => {
      // Auto-map to standard field keys
      let standardFieldKey: string | undefined;
      const labelLower = (field.fieldLabel || '').toLowerCase();
      
      for (const [standardKey, patterns] of Object.entries(STANDARD_FIELD_MAPPINGS)) {
        if (patterns.some(pattern => labelLower.includes(pattern))) {
          standardFieldKey = standardKey;
          break;
        }
      }

      // Validate field value based on type
      let isValid = true;
      const validationErrors: string[] = [];
      
      if (field.required && (field.fieldValue === null || field.fieldValue === '')) {
        isValid = false;
        validationErrors.push('Required field is empty');
      }
      
      if (field.fieldType === 'email' && field.fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.fieldValue)) {
          isValid = false;
          validationErrors.push('Invalid email format');
        }
      }
      
      if (field.fieldType === 'phone' && field.fieldValue) {
        const cleaned = field.fieldValue.replace(/\D/g, '');
        if (cleaned.length < 10) {
          validationErrors.push('Phone number may be incomplete');
        }
      }

      return {
        ...field,
        fieldId: field.fieldId || `field_${index}`,
        verified: false,
        isValid,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        standardFieldKey
      };
    });

    // Organize fields by section
    const fieldsBySection: Record<string, any[]> = {};
    for (const sectionType of SECTION_TYPES) {
      fieldsBySection[sectionType] = enrichedFields.filter(
        (f: any) => f.sectionType === sectionType
      );
    }

    // Calculate validation summary
    const totalFields = enrichedFields.length;
    const requiredFields = enrichedFields.filter((f: any) => f.required).length;
    const filledFields = enrichedFields.filter((f: any) => 
      f.fieldValue !== null && f.fieldValue !== ''
    ).length;
    const emptyRequiredFields = enrichedFields
      .filter((f: any) => f.required && (f.fieldValue === null || f.fieldValue === ''))
      .map((f: any) => f.fieldLabel);
    const allValidationErrors = enrichedFields
      .filter((f: any) => f.validationErrors?.length > 0)
      .map((f: any) => ({ 
        fieldId: f.fieldId, 
        error: f.validationErrors.join(', ') 
      }));
    const completionPercentage = requiredFields > 0 
      ? Math.round((filledFields / requiredFields) * 100)
      : 100;

    // Calculate overall confidence
    const confidences = enrichedFields.map((f: any) => f.confidence || 0.5);
    const overallConfidence = confidences.length > 0
      ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
      : 0;

    const processingTimeMs = Date.now() - startTime;

    const result = {
      success: true,
      extractionId: crypto.randomUUID(),
      extractedAt: new Date().toISOString(),
      processingTimeMs,
      formIdentification: extractedData.formIdentification || {
        manufacturerName: 'Unknown',
        programName: 'Unknown',
        formTitle: request.fileName,
        formLanguage: 'English',
        logoDetected: false,
        totalPages: 1
      },
      detectedSections: extractedData.detectedSections || [],
      fieldsBySection,
      allFields: enrichedFields,
      validationSummary: {
        totalFields,
        requiredFields,
        filledFields,
        emptyRequiredFields,
        validationErrors: allValidationErrors,
        completionPercentage
      },
      overallConfidence
    };

    console.log(`[extract-enrollment-form] Extracted ${totalFields} fields in ${processingTimeMs}ms`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[extract-enrollment-form] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
