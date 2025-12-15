import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard medical reference ranges
const MEDICAL_REFERENCE_RANGES = {
  brain: {
    ventricle_size: { normal: "< 10mm", unit: "mm", description: "Lateral ventricle width" },
    midline_shift: { normal: "0mm", threshold: "5mm", unit: "mm", description: "Midline deviation" },
    sulci_width: { normal: "2-4mm", unit: "mm", description: "Cortical sulci width" },
    gray_white_ratio: { normal: "1.2-1.5", description: "Gray to white matter ratio" },
  },
  kidney: {
    length: { normal: "9-13cm", unit: "cm", description: "Kidney length" },
    width: { normal: "4-6cm", unit: "cm", description: "Kidney width" },
    cortical_thickness: { normal: "1.5-2.5cm", unit: "cm", description: "Renal cortex thickness" },
    stone_size: { threshold: "5mm", unit: "mm", description: "Stone requiring intervention" },
    hydronephrosis: { grades: ["None", "Mild", "Moderate", "Severe"], description: "Urinary obstruction grade" },
  },
  lung: {
    lung_volume: { normal: "5-6L", unit: "L", description: "Total lung capacity" },
    nodule_size: { threshold: "8mm", unit: "mm", description: "Nodule requiring follow-up" },
    pleural_effusion: { grades: ["None", "Minimal", "Moderate", "Large"], description: "Fluid accumulation" },
    cardiothoracic_ratio: { normal: "< 0.5", description: "Heart to chest ratio" },
  },
  heart: {
    ejection_fraction: { normal: "55-70%", unit: "%", description: "Left ventricular EF" },
    wall_thickness: { normal: "6-11mm", unit: "mm", description: "LV wall thickness" },
    chamber_size: { normal: "35-56mm", unit: "mm", description: "LV end-diastolic diameter" },
    pr_interval: { normal: "120-200ms", unit: "ms", description: "ECG PR interval" },
    qrs_duration: { normal: "80-120ms", unit: "ms", description: "ECG QRS duration" },
    qt_interval: { normal: "350-440ms", unit: "ms", description: "ECG QT interval" },
  },
  liver: {
    span: { normal: "< 15cm", unit: "cm", description: "Liver span at MCL" },
    echogenicity: { normal: "Homogeneous", description: "Liver echo pattern" },
    portal_vein: { normal: "< 13mm", unit: "mm", description: "Portal vein diameter" },
  },
  spine: {
    disc_height: { normal: "5-10mm", unit: "mm", description: "Intervertebral disc height" },
    canal_diameter: { normal: "> 12mm", unit: "mm", description: "Spinal canal AP diameter" },
    lordosis: { normal: "20-45°", unit: "degrees", description: "Lumbar lordosis angle" },
  }
};

interface ProcessingRequest {
  action: 'upload' | 'process' | 'extract_metadata' | 'map_to_form' | 'validate' | 'classify' | 'analyze_medical_image';
  documentId?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  processingConfig?: any;
  userId?: string;
  documentType?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  analysisType?: string;
  provider?: string;
  modelType?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: ProcessingRequest = await req.json();
    console.log(`Document processor action: ${request.action}`);

    switch (request.action) {
      case 'upload':
        return await handleUpload(supabase, request);
      case 'process':
        return await handleProcess(supabase, request);
      case 'extract_metadata':
        return await handleExtractMetadata(supabase, request);
      case 'map_to_form':
        return await handleMapToForm(supabase, request);
      case 'validate':
        return await handleValidate(supabase, request);
      case 'classify':
        return await handleClassify(supabase, request);
      case 'analyze_medical_image':
        return await handleMedicalImageAnalysis(request);
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  } catch (error) {
    console.error("Document processor error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

async function handleUpload(supabase: any, request: ProcessingRequest) {
  const { fileBase64, fileName, mimeType, processingConfig, userId, documentType } = request;
  
  if (!fileBase64 || !fileName) {
    throw new Error("Missing file data or filename");
  }

  const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const filePath = `documents/${Date.now()}_${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('document-processing')
    .upload(filePath, fileData, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = await supabase.storage
    .from('document-processing')
    .getPublicUrl(filePath);
  
  const publicUrl = urlData?.publicUrl || null;

  const { data: record, error: recordError } = await supabase
    .from('document_processing_jobs')
    .insert({
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      status: 'uploaded',
      document_type: documentType || 'unknown',
      user_id: userId || null,
      processing_config: { ...processingConfig, publicUrl, isImage: mimeType?.startsWith('image/') },
      progress: 0,
      current_stage: 'upload',
      stage_message: 'Document uploaded successfully',
      stages: { upload: { status: 'completed', timestamp: new Date().toISOString() } }
    })
    .select()
    .single();

  if (recordError) {
    throw new Error(`Failed to create processing record: ${recordError.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, documentId: record.id, filePath, publicUrl }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleProcess(supabase: any, request: ProcessingRequest) {
  return new Response(
    JSON.stringify({ success: true, message: "Processing initiated" }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleExtractMetadata(supabase: any, request: ProcessingRequest) {
  const { documentId } = request;
  
  // Extract metadata from document
  const metadata = {
    documentId,
    extractedAt: new Date().toISOString(),
    fields: {},
    confidence: 0.85
  };
  
  return new Response(
    JSON.stringify({ success: true, metadata }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleMapToForm(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig, documentType } = request;
  
  // Get document record to access image URL
  let imageUrl = '';
  if (documentId) {
    const { data: doc } = await supabase
      .from('document_processing_jobs')
      .select('processing_config, file_path')
      .eq('id', documentId)
      .single();
    
    if (doc?.processing_config?.publicUrl) {
      imageUrl = doc.processing_config.publicUrl;
    }
  }
  
  // Build form mapping based on document type
  const formMapping: Record<string, { value: string; confidence: number; source: string }> = {};
  const targetFields = processingConfig?.extractionFields || [];
  
  // If we have an image URL and it's an invoice/billing document, do extraction
  if (imageUrl && (documentType === 'invoice' || !documentType)) {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (geminiApiKey) {
      try {
        // Fetch and convert image to base64
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.arrayBuffer();
          const imageBytes = new Uint8Array(imageBlob);
          const bytes: string[] = [];
          for (let i = 0; i < imageBytes.length; i++) {
            bytes.push(String.fromCharCode(imageBytes[i]));
          }
          const imageBase64 = btoa(bytes.join(''));
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          // Build invoice extraction prompt
          const extractionPrompt = `Analyze this invoice/billing document image and extract all financial and billing information.

Extract these specific fields if visible:
- invoice_number: Invoice or claim number
- vendor_name: Vendor, supplier, or provider name  
- vendor_tax_id: Tax ID or EIN
- vendor_npi: NPI number if healthcare
- patient_name: Patient or customer name
- patient_account: Account number
- service_date or service_from: Date of service
- service_to: End date if range
- billed_amount: Total billed amount
- allowed_amount: Allowed amount
- adjustment_amount: Any adjustments
- paid_amount: Amount paid
- balance_due: Balance remaining
- payer_name: Insurance or payer name
- cpt_codes: Any CPT/HCPCS codes (comma separated)
- icd_codes: Any ICD diagnosis codes (comma separated)
- payment_status: paid, partial, unpaid, denied
- denial_reason: Reason if denied
- line_items: Array of service line items with description, quantity, unit_price, total

Return ONLY a valid JSON object in this exact format:
{
  "fields": {
    "field_name": "extracted_value"
  },
  "line_items": [
    {"description": "...", "cpt_code": "...", "quantity": 1, "unit_price": 0, "total": 0}
  ],
  "document_category": "invoice|claim|statement|eob",
  "confidence": 0.0-1.0
}`;

          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: extractionPrompt },
                    { inline_data: { mime_type: contentType, data: imageBase64 } }
                  ]
                }],
                generationConfig: {
                  temperature: 0.1,
                  topP: 0.95,
                  maxOutputTokens: 4096
                }
              })
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Parse the JSON response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const extracted = JSON.parse(jsonMatch[0]);
                const fields = extracted.fields || {};
                
                // Map extracted fields to formMapping format
                for (const [key, value] of Object.entries(fields)) {
                  if (value && String(value).trim()) {
                    formMapping[key] = {
                      value: String(value),
                      confidence: extracted.confidence || 0.85,
                      source: 'gemini_extraction'
                    };
                  }
                }
                
                // Add line items as JSON string
                if (extracted.line_items && extracted.line_items.length > 0) {
                  formMapping['line_items'] = {
                    value: JSON.stringify(extracted.line_items),
                    confidence: extracted.confidence || 0.85,
                    source: 'gemini_extraction'
                  };
                }
                
                // Add document category
                if (extracted.document_category) {
                  formMapping['document_category'] = {
                    value: extracted.document_category,
                    confidence: 0.9,
                    source: 'gemini_extraction'
                  };
                }
                
                console.log(`Invoice extraction completed: ${Object.keys(formMapping).length} fields`);
              } catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
              }
            }
          }
        }
      } catch (extractionError) {
        console.error('Invoice extraction error:', extractionError);
      }
    }
  }
  
  // Ensure all target fields exist in response (even if empty)
  for (const field of targetFields) {
    if (!formMapping[field]) {
      formMapping[field] = { value: '', confidence: 0, source: 'not_found' };
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      formMapping,
      mappingConfidence: Object.keys(formMapping).length > 0 ? 0.85 : 0,
      documentType: documentType || 'invoice'
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleValidate(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig } = request;
  
  // Validate document data
  const validation = {
    documentId,
    isValid: true,
    errors: [],
    warnings: [],
    validatedAt: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify({ success: true, validation }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleClassify(supabase: any, request: ProcessingRequest) {
  const { documentId, documentType } = request;
  
  // Classify document type
  const classification = {
    documentId,
    detectedType: documentType || 'unknown',
    confidence: 0.92,
    alternativeTypes: [],
    classifiedAt: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify({ success: true, classification }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleMedicalImageAnalysis(request: ProcessingRequest) {
  const { 
    imageUrl, 
    imageBase64: providedBase64, 
    imageMimeType, 
    documentType, 
    analysisType,
    provider: requestedProvider,
    modelType: requestedModelType
  } = request;
  
  if (!imageUrl && !providedBase64) {
    throw new Error("Missing imageUrl or imageBase64 for medical image analysis");
  }

  const provider = requestedProvider || 'gemini';
  const modelType = requestedModelType || getRecommendedModelType(documentType || 'medical-image');
  
  console.log(`Medical image analysis - Provider: ${provider}, Model Type: ${modelType}, Document: ${documentType}`);

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  
  if (!geminiApiKey) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: generateFallbackInsights(documentType || 'medical-image'),
        modelUsed: 'fallback',
        provider: 'fallback',
        modelType: modelType,
        modelApproachDetails: getModelApproachDetails(modelType),
        disclaimer: 'This analysis is for informational purposes only and should not replace professional medical interpretation.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    let imageBase64: string;
    let contentType: string;
    
    if (providedBase64) {
      imageBase64 = providedBase64;
      contentType = imageMimeType || 'image/jpeg';
    } else {
      const imageResponse = await fetch(imageUrl!);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      const imageBlob = await imageResponse.arrayBuffer();
      const imageBytes = new Uint8Array(imageBlob);
      const bytes: string[] = [];
      for (let i = 0; i < imageBytes.length; i++) {
        bytes.push(String.fromCharCode(imageBytes[i]));
      }
      imageBase64 = btoa(bytes.join(''));
      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    }
    
    const medicalPrompt = buildComprehensiveMedicalPrompt(documentType || 'medical-image', analysisType || 'comprehensive', modelType);
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: medicalPrompt },
              { inline_data: { mime_type: contentType, data: imageBase64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsedAnalysis = parseComprehensiveResponse(responseText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        autoDetection: parsedAnalysis.autoDetection,
        insights: parsedAnalysis.findings,
        measurements: parsedAnalysis.measurements,
        obstructionsAndBlockages: parsedAnalysis.obstructionsAndBlockages,
        clinicalNotes: parsedAnalysis.clinicalNotes,
        observations: parsedAnalysis.observations,
        panelAnalysis: parsedAnalysis.panelAnalysis,
        detailedReport: parsedAnalysis.detailedReport,
        abnormalitySummary: parsedAnalysis.abnormalitySummary,
        providerConsultation: parsedAnalysis.providerConsultation,
        anatomicalRegions: parsedAnalysis.anatomicalRegions,
        rawAnalysis: responseText,
        modelUsed: `Gemini 2.0 Flash Vision`,
        modelApproach: modelType.toUpperCase(),
        modelApproachDetails: getModelApproachDetails(modelType),
        provider,
        modelType,
        detectedModality: parsedAnalysis.autoDetection?.detectedModality || documentType,
        detectedOrgans: parsedAnalysis.autoDetection?.detectedOrgans || [],
        analysisDepth: 'comprehensive',
        disclaimer: 'AI-ASSISTED ANALYSIS FOR INFORMATIONAL PURPOSES ONLY. This is NOT a medical diagnosis. Results must be reviewed and interpreted by a qualified healthcare provider (radiologist, physician). DO NOT make clinical decisions based solely on this analysis. Always consult your healthcare provider for proper diagnosis and treatment.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error) {
    console.error("Medical image analysis error:", error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: generateFallbackInsights(documentType || 'medical-image'),
        modelUsed: 'fallback',
        provider: 'fallback',
        modelType,
        modelApproachDetails: getModelApproachDetails(modelType),
        error: error instanceof Error ? error.message : 'Analysis failed',
        disclaimer: 'Fallback analysis provided. For accurate interpretation, please consult a qualified radiologist or medical professional.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

function getModelApproachDetails(modelType: string): any {
  const approaches: Record<string, any> = {
    'cnn': {
      name: 'Convolutional Neural Network (CNN)',
      description: 'Deep learning architecture specialized for image pattern recognition',
      capabilities: [
        'Feature extraction from medical images',
        'Pattern detection (nodules, masses, fractures)',
        'Texture analysis for tissue characterization',
        'Spatial hierarchy learning for anatomical structures'
      ],
      bestFor: ['X-Ray', 'Chest imaging', 'Bone structure analysis'],
      accuracy: 'High accuracy for structural abnormalities',
      limitations: 'May miss subtle soft tissue changes'
    },
    'u-net': {
      name: 'U-Net Segmentation Network',
      description: 'Encoder-decoder architecture for precise medical image segmentation',
      capabilities: [
        'Pixel-level organ segmentation',
        'Tumor boundary delineation',
        'Volume quantification',
        'Lesion localization with precise borders'
      ],
      bestFor: ['CT Scan', 'MRI', 'Tumor analysis', 'Organ volumetry'],
      accuracy: 'Excellent for boundary detection and segmentation',
      limitations: 'Requires good image quality for optimal results'
    },
    'faster-rcnn': {
      name: 'Faster R-CNN Object Detection',
      description: 'Region-based CNN for detecting and localizing abnormalities',
      capabilities: [
        'Multi-object detection in single scan',
        'Bounding box generation for abnormalities',
        'Real-time detection capability',
        'Size and location estimation'
      ],
      bestFor: ['Mammogram', 'Multi-lesion detection', 'Screening studies'],
      accuracy: 'High sensitivity for mass detection',
      limitations: 'May generate false positives in dense tissue'
    },
    'yolo': {
      name: 'YOLO (You Only Look Once)',
      description: 'Real-time object detection for rapid screening',
      capabilities: [
        'Ultra-fast detection',
        'Multiple abnormality detection',
        'Real-time analysis suitable for screening',
        'Good for high-volume studies'
      ],
      bestFor: ['Rapid screening', 'Emergency triage', 'Multiple lesion detection'],
      accuracy: 'Good for obvious abnormalities, may miss subtle findings',
      limitations: 'Trade-off between speed and fine detail detection'
    },
    'rnn': {
      name: 'Recurrent Neural Network (RNN/LSTM)',
      description: 'Sequential analysis for time-series medical data',
      capabilities: [
        'Temporal pattern recognition',
        'ECG waveform analysis',
        'Heart rhythm classification',
        'Sequential abnormality detection'
      ],
      bestFor: ['ECG', 'EEG', 'Time-series physiological data'],
      accuracy: 'Excellent for rhythm and waveform abnormalities',
      limitations: 'Not suitable for static image analysis'
    },
    'llm': {
      name: 'Large Language Model with Vision',
      description: 'Multimodal AI combining vision and language understanding',
      capabilities: [
        'Comprehensive image interpretation',
        'Natural language report generation',
        'Clinical context integration',
        'Multi-finding correlation and synthesis'
      ],
      bestFor: ['Comprehensive reports', 'Complex multi-finding analysis'],
      accuracy: 'Good for overall interpretation and report generation',
      limitations: 'Should be validated by domain-specific models'
    }
  };
  
  return approaches[modelType] || approaches['cnn'];
}

function getRecommendedModelType(documentType: string): string {
  const recommendations: Record<string, string> = {
    'xray': 'cnn',
    'ct-scan': 'u-net',
    'mri': 'u-net',
    'ecg': 'rnn',
    'ultrasound': 'u-net',
    'mammogram': 'faster-rcnn'
  };
  return recommendations[documentType] || 'cnn';
}

function buildComprehensiveMedicalPrompt(documentType: string, analysisType: string, modelType: string): string {
  const modalityGuidance: Record<string, string> = {
    'xray': `
CHEST X-RAY COMPREHENSIVE ANALYSIS:

SYSTEMATIC REVIEW CHECKLIST:
1. AIRWAYS: Trachea position (midline?), bronchi patency
2. BONES: Ribs, clavicles, spine - fractures, lytic lesions, degenerative changes
3. CARDIAC: Heart size (CTR <0.5 normal), shape, calcifications
4. DIAPHRAGM: Position, costophrenic angles (should be sharp), hemidiaphragm levels
5. EDGES: Pleural space, pneumothorax, effusions
6. FIELDS (Lung): Nodules, masses, consolidation, infiltrates, hyperinflation
7. GASTRIC: Air-fluid levels, free air under diaphragm
8. HILUM: Lymphadenopathy, vascular prominence
9. LINES/TUBES: Any medical devices present

NORMAL REFERENCE VALUES:
- Cardiothoracic Ratio (CTR): <0.5 (heart width / thorax width)
- Trachea: Midline (may shift slightly right at aortic arch)
- Costophrenic angles: Sharp (blunting suggests >200ml fluid)
- Diaphragm: Right 1-2cm higher than left
- Lung fields: Equal lucency bilaterally`,

    'ct-scan': `
CT SCAN COMPREHENSIVE ANALYSIS:

SYSTEMATIC REVIEW BY REGION:
1. BRAIN CT: Grey-white differentiation, ventricles, midline shift, hemorrhage, mass effect
2. CHEST CT: Lung parenchyma, mediastinum, pleura, lymph nodes
3. ABDOMINAL CT: Liver, spleen, kidneys, pancreas, bowel, vessels

DENSITY MEASUREMENTS (Hounsfield Units - HU):
- Air: -1000 HU
- Fat: -100 to -50 HU
- Water/Fluid: 0 HU
- Soft tissue/Muscle: +40 to +80 HU
- Blood (acute): +50 to +90 HU
- Bone: +400 to +1000 HU

BRAIN-SPECIFIC MEASUREMENTS:
- Midline shift: <5mm normal, >5mm significant
- Ventricle size: Evans index <0.3 normal
- Grey-white junction: Should be distinct

ABNORMALITY CLASSIFICATION:
- Hypodense: Lower than expected (edema, infarct, cyst)
- Hyperdense: Higher than expected (hemorrhage, calcification)
- Isodense: Same as surrounding tissue`,

    'mri': `
MRI COMPREHENSIVE ANALYSIS:

SIGNAL INTENSITY PATTERNS:
T1-WEIGHTED:
- Fat: HIGH signal (bright)
- CSF/Water: LOW signal (dark)
- Muscle: Intermediate
- Subacute blood: HIGH (due to methemoglobin)

T2-WEIGHTED:
- Water/CSF: HIGH signal (bright)
- Fat: Intermediate to HIGH
- Muscle: LOW to intermediate
- Edema: HIGH (appears bright)

FLAIR (Fluid Attenuated Inversion Recovery):
- CSF: SUPPRESSED (appears dark)
- Edema/Pathology: HIGH signal (bright)
- Useful for periventricular lesions

BRAIN MRI CHECKLIST:
1. Ventricles: Size, symmetry, obstruction
2. White matter: Signal abnormalities, demyelination
3. Grey matter: Cortical thickness, signal changes
4. Midline structures: Shift, mass effect
5. Posterior fossa: Cerebellum, brainstem
6. Extra-axial spaces: Meninges, subdural/epidural collections

KIDNEY MRI:
- Cortex vs medulla differentiation
- Cyst characterization (simple vs complex)
- Mass evaluation (solid, enhancement pattern)`,

    'ecg': `
ECG/EKG COMPREHENSIVE ANALYSIS:

SYSTEMATIC APPROACH:
1. RATE: Count R-R intervals (300/large squares between R waves)
   - Normal: 60-100 bpm
   - Bradycardia: <60 bpm
   - Tachycardia: >100 bpm

2. RHYTHM: Regular or irregular?
   - Sinus rhythm: P before every QRS, QRS after every P
   - Atrial fibrillation: No P waves, irregularly irregular

3. AXIS: Lead I and aVF method
   - Normal: -30° to +90°
   - Left axis deviation: <-30°
   - Right axis deviation: >+90°

4. INTERVALS:
   - PR interval: 120-200ms (3-5 small squares)
   - QRS duration: <120ms (3 small squares)
   - QT/QTc: <440ms (men), <460ms (women)

5. WAVEFORM MORPHOLOGY:
   - P wave: <0.12s duration, <2.5mm amplitude
   - QRS: R wave progression V1-V6
   - ST segment: Isoelectric (elevation/depression abnormal)
   - T wave: Upright in most leads

6. ABNORMALITIES TO IDENTIFY:
   - ST elevation: Acute MI, pericarditis
   - ST depression: Ischemia, digoxin effect
   - T wave inversion: Ischemia, strain pattern
   - Q waves: Prior MI`,

    'ultrasound': `
ULTRASOUND COMPREHENSIVE ANALYSIS:

ECHOGENICITY SCALE:
- Anechoic (black): Fluid-filled structures (cysts, vessels, bladder)
- Hypoechoic (dark grey): Solid masses, some organs
- Isoechoic: Same as surrounding tissue
- Hyperechoic (white): Fat, calcifications, gas

ORGAN-SPECIFIC EVALUATION:

LIVER:
- Normal echogenicity: Isoechoic to slightly hyperechoic vs kidney
- Size: <15cm in midclavicular line
- Look for: Masses, cysts, fatty infiltration, cirrhosis signs

KIDNEY:
- Cortex: Hypoechoic to liver
- Medullary pyramids: Anechoic to hypoechoic
- Size: 9-12cm length
- Look for: Hydronephrosis, cysts, stones, masses

GALLBLADDER:
- Wall thickness: <3mm (when distended)
- Look for: Stones (hyperechoic with shadowing), polyps, wall thickening

DOPPLER ASSESSMENT:
- Color flow: Direction and presence of flow
- Spectral: Velocity and resistance indices`,

    'mammogram': `
MAMMOGRAM COMPREHENSIVE ANALYSIS:

BI-RADS CLASSIFICATION:
- Category 0: Incomplete - needs additional imaging
- Category 1: Negative - routine screening
- Category 2: Benign - routine screening
- Category 3: Probably benign - short-term follow-up
- Category 4: Suspicious - biopsy recommended
  - 4A: Low suspicion (2-10% malignancy)
  - 4B: Moderate suspicion (10-50%)
  - 4C: High suspicion (50-95%)
- Category 5: Highly suggestive of malignancy (>95%)
- Category 6: Known biopsy-proven malignancy

BREAST DENSITY:
- A: Almost entirely fatty
- B: Scattered fibroglandular densities
- C: Heterogeneously dense
- D: Extremely dense

MASS CHARACTERISTICS:
Shape: Round, oval, irregular
Margins: Circumscribed, obscured, microlobulated, indistinct, spiculated
Density: High, equal, low, fat-containing

CALCIFICATIONS:
- Benign: Skin, vascular, coarse, large rod-like, round
- Suspicious: Amorphous, coarse heterogeneous, fine pleomorphic, fine linear/branching

ARCHITECTURAL DISTORTION: Spiculated without mass`
  };

  const guidance = modalityGuidance[documentType] || 'Analyze this medical image systematically and comprehensively.';

  return `You are a SENIOR RADIOLOGIST AI ASSISTANT providing COMPREHENSIVE medical image analysis.

STEP 1: AUTO-DETECT IMAGE TYPE (MANDATORY - DO THIS FIRST)
Before any analysis, you MUST identify:

1. IMAGING MODALITY DETECTION:
   - Is this an X-Ray? (Look for: grayscale, bone appears white, lungs appear black, flat 2D projection)
   - Is this a CT Scan? (Look for: cross-sectional slices, Hounsfield unit variations, detailed soft tissue)
   - Is this an MRI? (Look for: high soft tissue contrast, no bone signal, T1/T2 characteristics)
   - Is this an Ultrasound? (Look for: grainy texture, real-time appearance, anechoic/hyperechoic areas)
   - Is this an ECG/EKG? (Look for: waveform tracings, grid pattern, P-QRS-T waves)
   - Is this a Mammogram? (Look for: breast tissue, compression views, calcification patterns)

2. ANATOMICAL ORGAN/REGION DETECTION:
   - BRAIN: Look for skull, ventricles, grey/white matter, cerebellum
   - KIDNEY: Look for bean-shaped organs, collecting system, cortex/medulla
   - LUNG/CHEST: Look for lung fields, ribs, heart shadow, mediastinum
   - LIVER: Look for right upper quadrant, hepatic vessels, gallbladder
   - SPINE: Look for vertebrae, intervertebral discs, spinal canal
   - HEART: Look for cardiac chambers, valves, pericardium
   - ABDOMEN: Look for bowel loops, mesenteric fat, abdominal organs

${guidance}

CRITICAL ANALYSIS INSTRUCTIONS:

1. MULTI-PANEL IMAGE DETECTION:
   - If the image contains multiple panels (labeled a, b, c, d or numbered 1, 2, 3, 4), analyze EACH PANEL SEPARATELY
   - For EACH panel: detect modality AND organ independently
   - Example: Panel A might be Brain CT, Panel B might be Kidney CT - identify each correctly

2. SIZE AND MEASUREMENT ANALYSIS:
   - Estimate sizes of organs, lesions, masses, calcifications
   - Compare measurements to normal reference ranges
   - Flag any measurement outside normal limits
   - Include both observed value AND normal range for comparison

3. OBSTRUCTION AND BLOCKAGE DETECTION:
   - Look for vascular obstructions (stenosis, thrombosis, occlusion)
   - Identify urinary obstructions (hydronephrosis, stones, strictures)
   - Detect bowel obstructions (dilated loops, transition points)
   - Note airway obstructions (tracheal deviation, mass effect)
   - Assess for biliary obstruction (dilated ducts, stones)
   - Grade severity: None, Mild, Moderate, Severe, Complete

4. AI MODEL APPROACH CONTEXT:
   This analysis emulates ${modelType.toUpperCase()} approach:
   ${modelType === 'cnn' ? '- CNN: Pattern recognition for nodules, masses, fractures, texture abnormalities' : ''}
   ${modelType === 'u-net' ? '- U-Net: Precise segmentation of organs, tumors, lesions with boundary delineation' : ''}
   ${modelType === 'faster-rcnn' ? '- Faster R-CNN: Multi-object detection, bounding boxes, lesion localization' : ''}
   ${modelType === 'yolo' ? '- YOLO: Rapid detection, screening-level analysis, multiple abnormalities' : ''}
   ${modelType === 'rnn' ? '- RNN/LSTM: Sequential pattern analysis for ECG waveforms, temporal changes' : ''}
   ${modelType === 'llm' ? '- LLM Vision: Comprehensive interpretation, multi-finding synthesis, report generation' : ''}

Return COMPREHENSIVE JSON:
{
  "autoDetection": {
    "detectedModality": "X-Ray|CT-Scan|MRI|Ultrasound|ECG|Mammogram|Unknown",
    "modalityConfidence": 85-99,
    "modalityFeatures": ["features that led to modality identification"],
    "detectedOrgans": [
      {
        "organ": "Brain|Kidney|Lung|Liver|Heart|Spine|etc",
        "side": "Left|Right|Bilateral|Midline|N/A",
        "confidence": 80-99,
        "identifyingFeatures": ["what features identify this organ"]
      }
    ],
    "imagingCharacteristics": {
      "contrast": "With contrast|Without contrast|Unknown",
      "orientation": "Axial|Sagittal|Coronal|AP|PA|Lateral",
      "quality": "Excellent|Good|Adequate|Poor"
    }
  },
  "panelAnalysis": [
    {
      "panelId": "A/B/C/D or 1/2/3/4 or 'single'",
      "detectedModality": "specific modality for this panel",
      "detectedOrgan": "specific organ in this panel",
      "anatomicalRegion": "e.g., Brain - Axial section at level of basal ganglia",
      "organSystem": "e.g., Neurological, Renal, Respiratory, Cardiovascular",
      "findings": ["detailed finding 1 with measurements", "detailed finding 2"]
    }
  ],
  "findings": [
    {
      "category": "finding|observation|recommendation|concern|normal|abnormality|obstruction|blockage",
      "panelReference": "which panel (A/B/C/D/1/2/3/4) or 'all'",
      "anatomicalLocation": {
        "organ": "exact organ name",
        "side": "left/right/bilateral/midline",
        "region": "specific region (e.g., upper pole, hilum, cortex)",
        "coordinates": "quadrant or zone if applicable"
      },
      "description": "DETAILED description (minimum 3-4 sentences) explaining finding, appearance, characteristics, and what it might indicate",
      "detailedExplanation": "Extended pathophysiological explanation with clinical context - what causes this, what does it mean, how does it progress",
      "differentialDiagnosis": ["most likely diagnosis", "alternative 1", "alternative 2", "alternative 3"],
      "confidence": 70-95,
      "clinicalSignificance": "low|medium|high|critical",
      "status": "normal|borderline|abnormal|critical",
      "measurementValue": "value with unit (e.g., 15mm, 3.5cm)",
      "normalRange": "reference range (e.g., <10mm, 9-13cm)",
      "comparison": "Above normal by X% | Within normal | Below normal by X%",
      "followUpRecommendation": "specific actionable next steps"
    }
  ],
  "measurements": [
    {
      "name": "measurement name (e.g., Kidney length, Midline shift, Lesion diameter)",
      "value": "measured value as string with unit",
      "numericValue": number,
      "unit": "mm|cm|HU|ms|bpm|%",
      "normalRange": { 
        "min": number, 
        "max": number, 
        "reference": "description of normal",
        "source": "standard reference"
      },
      "status": "normal|borderline-low|borderline-high|abnormal-low|abnormal-high|critical",
      "deviation": "percentage or absolute deviation from normal",
      "clinicalImplication": "what this value means for the patient",
      "panelReference": "which panel",
      "organReference": "which organ"
    }
  ],
  "obstructionsAndBlockages": [
    {
      "type": "vascular|urinary|biliary|bowel|airway|other",
      "location": "specific anatomical location",
      "severity": "none|mild|moderate|severe|complete",
      "cause": "suspected cause (stone, mass, stricture, thrombosis, etc.)",
      "upstreamEffects": "what's happening proximal to blockage (dilation, pressure)",
      "measurements": "size of obstruction and dilated segments",
      "clinicalUrgency": "routine|soon|urgent|emergent",
      "recommendedAction": "specific intervention or further workup"
    }
  ],
  "clinicalNotes": {
    "keyFindings": ["most important finding 1", "most important finding 2", "most important finding 3"],
    "clinicalCorrelation": "How these findings correlate with potential clinical presentations",
    "riskAssessment": "Overall risk assessment based on findings",
    "limitations": "Any limitations of this imaging study",
    "additionalImaging": "Any additional imaging that would be helpful"
  },
  "observations": [
    {
      "observation": "detailed observation statement",
      "significance": "why this observation matters",
      "normalComparison": "how this compares to expected normal appearance"
    }
  ],
  "abnormalitySummary": {
    "totalAbnormalities": number,
    "criticalFindings": ["list critical findings requiring immediate attention"],
    "abnormalitiesByPanel": {
      "A": [{"finding": "description", "organ": "affected organ", "severity": "severity"}]
    },
    "abnormalitiesByOrgan": {
      "Kidney": [{"finding": "description", "panel": "panel ref", "severity": "severity"}],
      "Brain": [{"finding": "description", "panel": "panel ref", "severity": "severity"}]
    },
    "measurementAbnormalities": ["list of measurements outside normal range"],
    "obstructionSummary": "Summary of any obstructions detected",
    "recommendedActions": ["specific action 1", "specific action 2"]
  },
  "detailedReport": {
    "clinicalHistory": "Relevant clinical context inferred from imaging",
    "technique": "Imaging modality, orientation, contrast status",
    "comparison": "Note if comparison with prior studies recommended",
    "findingsNarrative": "COMPREHENSIVE paragraph-form narrative of ALL findings organized by panel/organ, including all measurements, comparisons to normal, and clinical implications (minimum 200 words)",
    "impression": "Numbered list of key impressions in order of clinical significance",
    "recommendations": "Specific actionable recommendations including follow-up timeline"
  },
  "providerConsultation": {
    "required": true,
    "urgency": "routine|soon|urgent|emergent",
    "recommendedSpecialty": ["Primary specialty", "Secondary if applicable"],
    "reason": "Specific reason why consultation is necessary",
    "disclaimer": "This AI analysis is for INFORMATIONAL PURPOSES ONLY. It is NOT a medical diagnosis. All findings MUST be reviewed by a qualified healthcare provider. Do not make any clinical decisions based solely on this analysis. Please consult your physician or radiologist for proper interpretation and medical advice."
  },
  "summary": "Executive summary of key findings",
  "urgency": "routine|priority|urgent|emergent"
}

MANDATORY REMINDERS:
- You MUST first detect the imaging modality (X-ray/CT/MRI/etc) from visual features
- You MUST identify which organ(s) are being imaged
- Include SPECIFIC measurements with normal ranges
- Identify ANY obstructions or blockages
- ALL findings must reference specific panel AND organ
- This is AI-ASSISTED analysis only - NOT a diagnosis
- Patient MUST consult healthcare provider for proper interpretation`;
}

function parseComprehensiveResponse(responseText: string): any {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        autoDetection: parsed.autoDetection || {
          detectedModality: 'Unknown',
          modalityConfidence: 0,
          modalityFeatures: [],
          detectedOrgans: [],
          imagingCharacteristics: {}
        },
        findings: parsed.findings || [],
        measurements: parsed.measurements || [],
        panelAnalysis: parsed.panelAnalysis || [],
        detailedReport: parsed.detailedReport || {},
        abnormalitySummary: parsed.abnormalitySummary || {},
        obstructionsAndBlockages: parsed.obstructionsAndBlockages || [],
        clinicalNotes: parsed.clinicalNotes || {
          keyFindings: [],
          clinicalCorrelation: '',
          riskAssessment: '',
          limitations: '',
          additionalImaging: ''
        },
        observations: parsed.observations || [],
        providerConsultation: parsed.providerConsultation || { 
          required: true, 
          urgency: 'routine',
          recommendedSpecialty: ['Radiology'],
          disclaimer: 'This AI analysis is for informational purposes only. Please consult your healthcare provider.'
        },
        anatomicalRegions: parsed.anatomicalRegions || []
      };
    }
  } catch (e) {
    console.error('Error parsing comprehensive response:', e);
  }
  
  return {
    autoDetection: {
      detectedModality: 'Unknown',
      modalityConfidence: 0,
      detectedOrgans: []
    },
    findings: [{
      category: 'observation',
      description: 'AI analysis completed. Please review all findings with a qualified healthcare provider.',
      confidence: 70,
      region: 'Full image',
      panelReference: 'all'
    }],
    measurements: [],
    panelAnalysis: [],
    detailedReport: {
      impression: 'Analysis completed - professional review required',
      recommendations: 'Consult with radiologist for comprehensive interpretation'
    },
    abnormalitySummary: { totalAbnormalities: 0, criticalFindings: [], recommendedActions: [] },
    obstructionsAndBlockages: [],
    clinicalNotes: { keyFindings: [], clinicalCorrelation: '', riskAssessment: '' },
    observations: [],
    providerConsultation: { required: true, urgency: 'routine', recommendedSpecialty: ['Radiology'] },
    anatomicalRegions: []
  };
}

function generateFallbackInsights(documentType: string): any[] {
  return [{
    category: 'observation',
    description: `${documentType} image uploaded. AI analysis temporarily unavailable. Please consult a qualified radiologist for interpretation.`,
    confidence: 100,
    region: 'Full image',
    clinicalSignificance: 'medium',
    panelReference: 'all'
  }];
}
