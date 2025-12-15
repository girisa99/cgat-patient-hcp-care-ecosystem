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
    
    const medicalPrompt = buildMedicalAnalysisPrompt(documentType || 'medical-image', analysisType || 'comprehensive', modelType);
    
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
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const insights = parseMedicalAnalysisResponse(responseText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        rawAnalysis: responseText,
        modelUsed: `gemini-2.0-flash-vision (${modelType})`,
        provider,
        modelType,
        modality: documentType,
        disclaimer: 'AI-assisted analysis for informational purposes only. Not a substitute for professional medical diagnosis. Always consult qualified healthcare providers for clinical decisions.'
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
        error: error instanceof Error ? error.message : 'Analysis failed',
        disclaimer: 'Fallback analysis provided. For accurate interpretation, please consult a qualified radiologist or medical professional.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
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

function buildMedicalAnalysisPrompt(documentType: string, analysisType: string, modelType: string): string {
  const modalityGuidance: Record<string, string> = {
    'xray': 'Analyze for: bone structures, fractures, lung nodules, pneumonia, cardiothoracic ratio (<0.5 normal)',
    'ct-scan': 'Analyze for: tissue density (HU values), hemorrhage, tumors, midline shift',
    'mri': 'Analyze for: brain tumors, signal intensity patterns, Alzheimer indicators',
    'ecg': 'Analyze for: heart rate (60-100 normal), PR interval (120-200ms), QRS duration, ST changes',
    'ultrasound': 'Analyze for: organ morphology, masses, fluid collections',
    'mammogram': 'Analyze for: masses, microcalcifications, BI-RADS scoring'
  };

  const guidance = modalityGuidance[documentType] || 'Analyze this medical image comprehensively.';

  return `You are an expert AI medical imaging assistant. ${guidance}

CRITICAL: Include measurements with normal ranges and flag abnormalities.

Return JSON:
{
  "findings": [
    {
      "category": "finding|observation|recommendation|concern|normal|abnormality",
      "description": "string",
      "confidence": 75-95,
      "region": "string",
      "clinicalSignificance": "low|medium|high|critical",
      "status": "normal|borderline|abnormal",
      "measurementValue": "value with unit",
      "normalRange": "reference range"
    }
  ],
  "measurements": [
    { "name": "string", "value": number, "unit": "string", "normalRange": { "min": number, "max": number }, "status": "normal|borderline|abnormal" }
  ],
  "summary": "string",
  "urgency": "routine|priority|urgent|emergent"
}

Always emphasize the need for professional medical interpretation.`;
}

function parseMedicalAnalysisResponse(responseText: string): any[] {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.findings && Array.isArray(parsed.findings)) {
        return parsed.findings;
      }
    }
  } catch (e) {
    console.error('Error parsing response:', e);
  }
  
  return [{
    category: 'observation',
    description: 'AI analysis completed. Please review findings with a healthcare provider.',
    confidence: 70,
    region: 'Full image'
  }];
}

function generateFallbackInsights(documentType: string): any[] {
  return [{
    category: 'observation',
    description: `${documentType} image uploaded. AI analysis temporarily unavailable. Please consult a qualified radiologist for interpretation.`,
    confidence: 100,
    region: 'Full image',
    clinicalSignificance: 'medium'
  }];
}
