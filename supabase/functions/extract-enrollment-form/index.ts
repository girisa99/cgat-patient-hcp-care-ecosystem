/**
 * DYNAMIC ENROLLMENT FORM EXTRACTION - 2-STAGE AI PIPELINE
 * 
 * STAGE 1: Form Classification & Section Detection (Gemini 2.5 Flash - FAST)
 * - Identifies manufacturer, program, form type
 * - Detects all sections present in the form
 * - Handles both printed and handwritten forms
 * 
 * STAGE 2: Deep Field Extraction (Gemini 2.5 Pro - ACCURATE)
 * - Extracts every field from each detected section
 * - Handles handwriting recognition
 * - Captures checkboxes, signatures, tables
 * - NO HARDCODED FIELDS - fully dynamic extraction
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
  pageNumber?: number; // For multi-page PDFs
  totalPages?: number;
  extractSignatures?: boolean;
  saveToDatabase?: boolean;
  sessionId?: string; // For state persistence
}

// ============= STAGE 1: CLASSIFICATION PROMPT =============
const STAGE1_CLASSIFICATION_PROMPT = `You are an expert medical document classifier. Analyze this patient assistance program (PAP) enrollment form.

YOUR TASK - STAGE 1 CLASSIFICATION:
1. Identify the form (manufacturer, program name, form title)
2. Detect ALL sections present in this form - DO NOT use a predefined list
3. For each section, describe what type of information it contains
4. Identify if this is a printed form, handwritten, or partially filled

CRITICAL: Do NOT extract field values yet. Only identify WHAT sections exist.

Return JSON:
{
  "formIdentification": {
    "manufacturerName": "exact company name",
    "programName": "program name if visible",
    "formTitle": "form title",
    "formVersion": "version if visible",
    "formLanguage": "English/Spanish/etc",
    "contactPhone": "phone if visible",
    "contactFax": "fax if visible",
    "totalPages": number,
    "isHandwritten": boolean,
    "isPartiallyFilled": boolean
  },
  "detectedSections": [
    {
      "sectionId": "unique_id",
      "sectionTitle": "EXACT title as shown on form",
      "sectionDescription": "what type of info this section collects",
      "pageNumber": 1,
      "estimatedFieldCount": number,
      "hasCheckboxes": boolean,
      "hasSignatureArea": boolean,
      "hasHandwriting": boolean,
      "priority": "high/medium/low"
    }
  ],
  "additionalObservations": "any other notable features"
}`;

// ============= STAGE 2: DEEP EXTRACTION PROMPT =============
const STAGE2_EXTRACTION_PROMPT = `You are an expert OCR and data extraction system. Extract EVERY field from this enrollment form section.

CRITICAL RULES:
1. Extract ALL fields you can see - filled or empty
2. For handwritten text, do your best to decipher and mark confidence
3. For checkboxes, indicate if checked (true), unchecked (false), or unclear
4. For signatures, note if present and any printed name nearby
5. Capture field labels EXACTLY as shown on the form
6. DO NOT skip any field - even if empty or illegible

For each field, determine its type:
- text: free text field
- date: dates in any format
- phone: phone numbers
- email: email addresses
- ssn: social security (full or last 4)
- currency: dollar amounts
- number: numeric values
- checkbox: check boxes
- radio: radio button selections
- signature: signature areas
- address: full or partial addresses
- multiline: multi-line text areas
- dropdown: dropdown/select fields
- table: tabular data

Return JSON:
{
  "sectionTitle": "exact section title",
  "extractedFields": [
    {
      "fieldLabel": "EXACT label from form",
      "fieldValue": "extracted value or null if empty",
      "fieldType": "type from list above",
      "isRequired": boolean,
      "isHandwritten": boolean,
      "confidence": 0.0-1.0,
      "alternativeReading": "if handwriting unclear, alternate interpretation",
      "position": "top/middle/bottom of section",
      "notes": "any relevant notes about this field"
    }
  ],
  "tables": [
    {
      "tableTitle": "title if any",
      "headers": ["col1", "col2"],
      "rows": [["val1", "val2"]]
    }
  ],
  "signatures": [
    {
      "signatureType": "patient/provider/witness/caregiver",
      "signaturePresent": boolean,
      "printedName": "name if printed nearby",
      "dateField": "date if present"
    }
  ]
}`;

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

    // Prepare image content
    let imageContent: any;
    if (request.fileBase64) {
      const mimeType = request.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
      imageContent = {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${request.fileBase64}` }
      };
    } else if (request.fileUrl) {
      imageContent = {
        type: "image_url",
        image_url: { url: request.fileUrl }
      };
    } else {
      throw new Error("Either fileUrl or fileBase64 must be provided");
    }

    console.log(`[extract-enrollment-form] STAGE 1: Classifying ${request.fileName}`);

    // ============= STAGE 1: CLASSIFICATION (Fast Model) =============
    const stage1Response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // FAST for classification
        messages: [
          { role: "system", content: STAGE1_CLASSIFICATION_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Classify this enrollment form and detect all sections. Return JSON only." },
              imageContent
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!stage1Response.ok) {
      const errorText = await stage1Response.text();
      console.error("[extract-enrollment-form] Stage 1 error:", stage1Response.status, errorText);
      
      if (stage1Response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again later.",
          stage: 1
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Stage 1 classification failed: ${stage1Response.status}`);
    }

    const stage1Data = await stage1Response.json();
    const stage1Content = stage1Data.choices?.[0]?.message?.content;
    
    let classificationResult;
    try {
      let jsonStr = stage1Content;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }
      classificationResult = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("[extract-enrollment-form] Stage 1 parse error:", e);
      throw new Error("Failed to parse classification result");
    }

    const stage1Time = Date.now() - startTime;
    console.log(`[extract-enrollment-form] STAGE 1 complete in ${stage1Time}ms - Found ${classificationResult.detectedSections?.length || 0} sections`);

    // ============= STAGE 2: DEEP EXTRACTION (Accurate Model) =============
    console.log(`[extract-enrollment-form] STAGE 2: Deep extraction with Gemini Pro`);

    const stage2Start = Date.now();
    
    // Build context from Stage 1 for Stage 2
    const sectionsContext = (classificationResult.detectedSections || [])
      .map((s: any) => `- "${s.sectionTitle}": ${s.sectionDescription}`)
      .join('\n');

    const stage2Response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // ACCURATE for extraction
        messages: [
          { role: "system", content: STAGE2_EXTRACTION_PROMPT },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Extract ALL fields from this enrollment form. The form has been classified as:
                
Manufacturer: ${classificationResult.formIdentification?.manufacturerName || 'Unknown'}
Program: ${classificationResult.formIdentification?.programName || 'Unknown'}
Form: ${classificationResult.formIdentification?.formTitle || 'Unknown'}
Handwritten: ${classificationResult.formIdentification?.isHandwritten ? 'Yes' : 'No'}

Detected sections:
${sectionsContext}

Extract EVERY field from EVERY section. Include empty fields. For handwritten text, provide your best interpretation with confidence scores. Return a JSON array where each element represents one section.

Return format:
{
  "sections": [
    {
      "sectionTitle": "...",
      "extractedFields": [...],
      "tables": [...],
      "signatures": [...]
    }
  ]
}`
              },
              imageContent
            ]
          }
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });

    if (!stage2Response.ok) {
      const errorText = await stage2Response.text();
      console.error("[extract-enrollment-form] Stage 2 error:", stage2Response.status, errorText);
      
      if (stage2Response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded during extraction. Please try again later.",
          stage: 2,
          partialResult: classificationResult
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Stage 2 extraction failed: ${stage2Response.status}`);
    }

    const stage2Data = await stage2Response.json();
    const stage2Content = stage2Data.choices?.[0]?.message?.content;
    
    let extractionResult;
    try {
      let jsonStr = stage2Content;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }
      extractionResult = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("[extract-enrollment-form] Stage 2 parse error:", e);
      console.log("[extract-enrollment-form] Raw Stage 2:", stage2Content?.substring(0, 500));
      throw new Error("Failed to parse extraction result");
    }

    const stage2Time = Date.now() - stage2Start;
    const totalTime = Date.now() - startTime;
    console.log(`[extract-enrollment-form] STAGE 2 complete in ${stage2Time}ms`);

    // ============= COMBINE & ENRICH RESULTS =============
    const extractionId = crypto.randomUUID();
    const sections = extractionResult.sections || [];
    
    // Flatten all fields with section context
    const allFields: any[] = [];
    const fieldsBySection: Record<string, any[]> = {};

    sections.forEach((section: any, sectionIndex: number) => {
      const sectionKey = section.sectionTitle?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `section_${sectionIndex}`;
      fieldsBySection[sectionKey] = [];

      (section.extractedFields || []).forEach((field: any, fieldIndex: number) => {
        const enrichedField = {
          fieldId: `${sectionKey}_field_${fieldIndex}`,
          fieldLabel: field.fieldLabel,
          fieldValue: field.fieldValue,
          fieldType: field.fieldType || 'text',
          sectionTitle: section.sectionTitle,
          sectionKey,
          required: field.isRequired || false,
          isHandwritten: field.isHandwritten || false,
          confidence: field.confidence || 0.9,
          alternativeReading: field.alternativeReading,
          verified: false,
          isValid: true,
          validationErrors: [],
          pageNumber: request.pageNumber || 1
        };
        
        allFields.push(enrichedField);
        fieldsBySection[sectionKey].push(enrichedField);
      });

      // Add signature fields
      (section.signatures || []).forEach((sig: any, sigIndex: number) => {
        const sigField = {
          fieldId: `${sectionKey}_signature_${sigIndex}`,
          fieldLabel: `${sig.signatureType || 'Unknown'} Signature`,
          fieldValue: sig.signaturePresent ? 'SIGNED' : null,
          fieldType: 'signature',
          sectionTitle: section.sectionTitle,
          sectionKey,
          required: true,
          confidence: sig.signaturePresent ? 0.95 : 0.8,
          verified: false,
          isValid: sig.signaturePresent,
          printedName: sig.printedName,
          signatureDate: sig.dateField
        };
        allFields.push(sigField);
        fieldsBySection[sectionKey].push(sigField);
      });
    });

    // Calculate validation summary
    const totalFields = allFields.length;
    const requiredFields = allFields.filter(f => f.required);
    const filledFields = allFields.filter(f => f.fieldValue !== null && f.fieldValue !== '');
    const handwrittenFields = allFields.filter(f => f.isHandwritten);
    const lowConfidenceFields = allFields.filter(f => f.confidence < 0.7);
    const emptyRequiredFields = requiredFields
      .filter(f => f.fieldValue === null || f.fieldValue === '')
      .map(f => f.fieldLabel);

    const completionPercentage = requiredFields.length > 0
      ? Math.round((filledFields.filter(f => f.required).length / requiredFields.length) * 100)
      : 100;

    // Calculate overall confidence
    const avgConfidence = allFields.length > 0
      ? allFields.reduce((sum, f) => sum + (f.confidence || 0.5), 0) / allFields.length
      : 0;

    // Prepare final result
    const result = {
      success: true,
      extractionId,
      sessionId: request.sessionId || extractionId,
      extractedAt: new Date().toISOString(),
      processingTimeMs: totalTime,
      
      // Pipeline info
      pipeline: {
        stage1Model: "google/gemini-2.5-flash",
        stage1TimeMs: stage1Time,
        stage2Model: "google/gemini-2.5-pro", 
        stage2TimeMs: stage2Time,
        totalTimeMs: totalTime
      },
      
      // Form identification
      formIdentification: classificationResult.formIdentification || {},
      
      // Sections (from Stage 1)
      detectedSections: classificationResult.detectedSections || [],
      
      // All extracted data organized by section
      fieldsBySection,
      
      // Flat list of all fields
      allFields,
      
      // Tables if any
      tables: sections.flatMap((s: any) => s.tables || []),
      
      // Validation summary
      validationSummary: {
        totalFields,
        requiredFieldsCount: requiredFields.length,
        filledFieldsCount: filledFields.length,
        handwrittenFieldsCount: handwrittenFields.length,
        lowConfidenceFieldsCount: lowConfidenceFields.length,
        emptyRequiredFields,
        completionPercentage,
        needsReview: lowConfidenceFields.length > 0 || handwrittenFields.length > 0
      },
      
      overallConfidence: avgConfidence,
      
      // Flags
      hasHandwriting: classificationResult.formIdentification?.isHandwritten || handwrittenFields.length > 0,
      isPartiallyFilled: classificationResult.formIdentification?.isPartiallyFilled,
      
      // For UI state persistence
      verificationState: {
        sectionsVerified: {},
        allVerified: false,
        lastUpdated: new Date().toISOString()
      }
    };

    // Save to database if requested
    if (request.saveToDatabase) {
      try {
        const { error: insertError } = await supabase
          .from('enrollment_form_extractions')
          .upsert({
            id: extractionId,
            session_id: request.sessionId || extractionId,
            file_name: request.fileName,
            form_identification: result.formIdentification,
            detected_sections: result.detectedSections,
            all_fields: result.allFields,
            fields_by_section: result.fieldsBySection,
            validation_summary: result.validationSummary,
            overall_confidence: result.overallConfidence,
            pipeline_info: result.pipeline,
            verification_state: result.verificationState,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("[extract-enrollment-form] DB save error:", insertError);
        } else {
          console.log("[extract-enrollment-form] Saved to database:", extractionId);
        }
      } catch (dbError) {
        console.error("[extract-enrollment-form] DB error:", dbError);
      }
    }

    console.log(`[extract-enrollment-form] Complete: ${totalFields} fields extracted in ${totalTime}ms`);

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
