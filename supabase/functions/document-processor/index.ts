import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        insights: parsedAnalysis.findings,
        measurements: parsedAnalysis.measurements,
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
        modality: documentType,
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

${guidance}

CRITICAL INSTRUCTIONS:

1. MULTI-PANEL IMAGE DETECTION:
   - If the image contains multiple panels (labeled a, b, c, d or numbered 1, 2, 3, 4), analyze EACH PANEL SEPARATELY
   - Identify what anatomical region/organ each panel shows
   - For each panel, provide specific findings relevant to that anatomy
   - Example: Panel A might be chest, Panel B might be abdomen - analyze appropriately

2. ANATOMICAL IDENTIFICATION:
   - For each finding, specify EXACTLY which organ/structure is affected
   - Use precise anatomical terminology
   - Identify: Organ (kidney, brain, lung, etc.), Side (left/right/bilateral), Region (upper/lower/medial/lateral)

3. ABNORMALITY CORRELATION:
   - Clearly map which abnormality belongs to which panel/region
   - If Panel A shows kidney and Panel B shows brain, findings must specify this

4. AI MODEL APPROACH CONTEXT:
   - This analysis emulates ${modelType.toUpperCase()} approach
   - ${modelType === 'cnn' ? 'Focus on pattern recognition and feature extraction' : ''}
   - ${modelType === 'u-net' ? 'Focus on segmentation and boundary delineation' : ''}
   - ${modelType === 'faster-rcnn' ? 'Focus on object detection and localization' : ''}
   - ${modelType === 'rnn' ? 'Focus on sequential/temporal patterns' : ''}

5. DETAILED REPORT REQUIREMENTS:
   - Provide EXTENSIVE description for each finding (minimum 2-3 sentences)
   - Include differential diagnoses
   - Explain clinical significance in detail
   - Suggest follow-up recommendations

Return DETAILED JSON:
{
  "panelAnalysis": [
    {
      "panelId": "A/B/C/D or 1/2/3/4 or 'single'",
      "anatomicalRegion": "e.g., Brain, Right Kidney, Chest",
      "organSystem": "e.g., Neurological, Renal, Respiratory",
      "imagingModality": "e.g., CT without contrast, MRI T2-weighted",
      "findings": ["detailed finding 1", "detailed finding 2"]
    }
  ],
  "findings": [
    {
      "category": "finding|observation|recommendation|concern|normal|abnormality",
      "panelReference": "which panel (A/B/C/D/1/2/3/4) or 'all'",
      "anatomicalLocation": {
        "organ": "specific organ name",
        "side": "left/right/bilateral/midline",
        "region": "specific region within organ",
        "coordinates": "if applicable, quadrant or zone"
      },
      "description": "DETAILED description minimum 2-3 sentences explaining the finding, its appearance, and significance",
      "detailedExplanation": "Extended explanation with pathophysiology and clinical context",
      "differentialDiagnosis": ["possibility 1", "possibility 2", "possibility 3"],
      "confidence": 70-95,
      "clinicalSignificance": "low|medium|high|critical",
      "status": "normal|borderline|abnormal",
      "measurementValue": "value with unit if applicable",
      "normalRange": "reference range for comparison",
      "followUpRecommendation": "specific next steps"
    }
  ],
  "measurements": [
    {
      "name": "measurement name",
      "value": number,
      "unit": "mm/cm/HU/ms/bpm",
      "normalRange": { "min": number, "max": number, "description": "what normal means" },
      "status": "normal|borderline|abnormal",
      "clinicalImplication": "what this value means clinically",
      "panelReference": "which panel this applies to"
    }
  ],
  "anatomicalRegions": [
    {
      "name": "region name",
      "panelReference": "panel",
      "status": "normal|abnormal",
      "description": "detailed description of this region"
    }
  ],
  "abnormalitySummary": {
    "totalAbnormalities": number,
    "criticalFindings": ["list critical findings requiring immediate attention"],
    "abnormalitiesByPanel": {
      "A": ["list of abnormalities"],
      "B": ["list of abnormalities"]
    },
    "abnormalitiesByOrgan": {
      "organ1": ["findings"],
      "organ2": ["findings"]
    },
    "recommendedActions": ["specific action 1", "specific action 2"]
  },
  "detailedReport": {
    "clinicalHistory": "Based on imaging findings, relevant clinical context",
    "technique": "Imaging technique and parameters observed",
    "comparison": "Note if comparison with prior studies would be beneficial",
    "findingsNarrative": "COMPREHENSIVE narrative description of ALL findings in paragraph form, organized by panel/region",
    "impression": "DETAILED summary impression with numbered key findings",
    "recommendations": "Specific follow-up recommendations"
  },
  "providerConsultation": {
    "required": true,
    "urgency": "routine|soon|urgent|emergent",
    "recommendedSpecialty": ["Radiology", "relevant specialty"],
    "reason": "Why consultation is necessary"
  },
  "summary": "Comprehensive summary of all findings across all panels",
  "urgency": "routine|priority|urgent|emergent"
}

IMPORTANT REMINDERS:
- This is AI-ASSISTED analysis, NOT a diagnosis
- All findings MUST be reviewed by a qualified healthcare provider
- Encourage patient to discuss results with their doctor
- Include appropriate uncertainty where applicable`;
}

function parseComprehensiveResponse(responseText: string): any {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        findings: parsed.findings || [],
        measurements: parsed.measurements || [],
        panelAnalysis: parsed.panelAnalysis || [],
        detailedReport: parsed.detailedReport || {},
        abnormalitySummary: parsed.abnormalitySummary || {},
        providerConsultation: parsed.providerConsultation || { required: true, urgency: 'routine' },
        anatomicalRegions: parsed.anatomicalRegions || []
      };
    }
  } catch (e) {
    console.error('Error parsing comprehensive response:', e);
  }
  
  return {
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
