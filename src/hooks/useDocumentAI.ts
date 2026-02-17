/**
 * DOCUMENT AI HOOK
 * Wraps useUniversalAI with document-specific routing and fallback logic
 * Implements the two-stage pipeline for medical imaging
 */

import { useCallback, useState } from 'react';
import { useUniversalAI } from './useUniversalAI';
import { 
  AIProvider, 
  selectBestModel, 
  getNextFallback, 
  getDocumentAIConfig,
  MODEL_SYSTEM_PROMPTS,
  logModelSelection,
  ModelSelectionResult
} from '@/config/documentModelRouting';
import { getDocumentTypeById } from '@/config/documentTypes';
import { useMasterToast } from './useMasterToast';

export interface DocumentAIRequest {
  documentTypeId: string;
  documentCategory: string;
  ocrText: string;
  imageUrl?: string;
  targetFields: string[];
  processingHints?: {
    enableMedicationLookup?: boolean;
    enableImageAnalysis?: boolean;
    enableRCMAnalysis?: boolean;
  };
}

export interface DocumentAIResponse {
  extractedData: Record<string, any>;
  confidence: number;
  modelUsed: AIProvider;
  pipelineStages?: {
    stage1?: { model: AIProvider; output: any; success: boolean };
    stage2?: { model: AIProvider; output: any; success: boolean };
  };
  fallbacksUsed: AIProvider[];
  processingTimeMs: number;
  warnings?: string[];
}

export interface DocumentAIState {
  isProcessing: boolean;
  currentModel: AIProvider | null;
  currentStage: 'idle' | 'stage1_vision' | 'stage2_clinical' | 'single_extraction' | 'fallback';
  error: string | null;
  lastResult: DocumentAIResponse | null;
}

export const useDocumentAI = () => {
  const { showError, showSuccess, showInfo } = useMasterToast();
  const universalAI = useUniversalAI();

  const [state, setState] = useState<DocumentAIState>({
    isProcessing: false,
    currentModel: null,
    currentStage: 'idle',
    error: null,
    lastResult: null
  });

  /**
   * Build extraction prompt for a document type
   */
  const buildExtractionPrompt = useCallback((
    ocrText: string,
    targetFields: string[],
    documentTypeId: string,
    hints?: DocumentAIRequest['processingHints']
  ): string => {
    const docConfig = getDocumentTypeById(documentTypeId);
    const fieldDefinitions = docConfig?.targetFields || [];

    let prompt = `Extract the following fields from this document:\n\n`;
    prompt += `Document Type: ${docConfig?.title || documentTypeId}\n\n`;
    prompt += `Fields to extract:\n`;
    
    for (const field of targetFields) {
      const fieldDef = fieldDefinitions.find(f => f.key === field);
      const required = fieldDef?.required ? ' (REQUIRED)' : '';
      const type = fieldDef?.type ? ` [${fieldDef.type}]` : '';
      prompt += `- ${fieldDef?.label || field}${required}${type}\n`;
    }

    prompt += `\nDocument Text (OCR):\n---\n${ocrText}\n---\n\n`;

    if (hints?.enableMedicationLookup) {
      prompt += `\nAdditional Instructions:
- Look up NDC codes for any medications
- Identify potential drug interactions
- Suggest therapeutic alternatives if applicable
- Validate prescriber credentials (NPI, DEA)\n`;
    }

    if (hints?.enableRCMAnalysis) {
      prompt += `\nAdditional Instructions:
- Validate CPT/HCPCS codes
- Check for coding errors or missing modifiers
- Calculate expected reimbursement
- Identify denial risk factors
- Analyze aging and payment patterns\n`;
    }

    prompt += `\nRespond with a JSON object containing:
{
  "extracted_fields": { ... },
  "confidence": 0.0-1.0,
  "validation_warnings": [],
  "missing_required_fields": []
}`;

    return prompt;
  }, []);

  /**
   * Build medical imaging analysis prompt (Stage 1 - Vision)
   */
  const buildVisionAnalysisPrompt = useCallback((
    imageUrl: string,
    ocrText: string,
    documentTypeId: string
  ): string => {
    return `Analyze this medical image and provide structured findings.

Image Type: ${documentTypeId.replace(/-/g, ' ').toUpperCase()}
${ocrText ? `\nAssociated Text/Report:\n${ocrText}` : ''}

Provide a JSON response with:
{
  "modality": "X-Ray|CT|MRI|Ultrasound|ECG|Other",
  "anatomical_region": "string",
  "image_quality": "excellent|good|fair|poor",
  "visual_findings": [
    {
      "finding": "description",
      "location": "anatomical location",
      "confidence": 0.0-1.0
    }
  ],
  "measurements": [
    {
      "measurement": "what was measured",
      "value": "numeric value",
      "unit": "unit",
      "normal_range": "if applicable"
    }
  ],
  "technical_notes": ["any image quality or technical observations"]
}`;
  }, []);

  /**
   * Build clinical synthesis prompt (Stage 2 - Clinical)
   */
  const buildClinicalSynthesisPrompt = useCallback((
    visionOutput: any,
    ocrText: string
  ): string => {
    return `Based on the following visual analysis of a medical image, provide clinical interpretation and recommendations.

VISUAL ANALYSIS RESULTS:
${JSON.stringify(visionOutput, null, 2)}

${ocrText ? `\nCLINICAL CONTEXT/REPORT TEXT:\n${ocrText}` : ''}

Provide a comprehensive clinical synthesis as JSON:
{
  "clinical_interpretation": "Overall interpretation of findings",
  "differential_diagnoses": [
    {
      "diagnosis": "condition name",
      "probability": "high|moderate|low",
      "supporting_findings": ["list of supporting visual findings"]
    }
  ],
  "severity_assessment": "critical|urgent|routine|normal",
  "recommendations": {
    "immediate_actions": ["if any urgent steps needed"],
    "follow_up_imaging": ["recommended follow-up studies"],
    "specialist_referrals": ["recommended specialists"]
  },
  "clinical_correlation": "How findings correlate with clinical presentation",
  "limitations": ["Any limitations of the analysis"]
}`;
  }, []);

  /**
   * Execute AI request with fallback handling
   */
  const executeWithFallback = useCallback(async (
    prompt: string,
    systemPrompt: string,
    modelSelection: ModelSelectionResult,
    maxRetries: number = 2
  ): Promise<{ content: any; modelUsed: AIProvider; fallbacksUsed: AIProvider[] }> => {
    let currentModel = modelSelection.selectedModel;
    const fallbacksUsed: AIProvider[] = [];
    const triedModels: AIProvider[] = [];
    let lastError: string | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setState(prev => ({ ...prev, currentModel: currentModel }));
        
        console.log(`[DocumentAI] Attempting with ${currentModel} (attempt ${attempt + 1})`);
        
        const response = await universalAI.generateResponse({
          provider: currentModel,
          prompt,
          systemPrompt,
          temperature: 0.3, // Lower temperature for extraction accuracy
          maxTokens: 4000
        }, { silent: true });

        if (response?.content) {
          // Try to parse as JSON
          let parsedContent;
          try {
            // Extract JSON from response if wrapped in markdown
            const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/) ||
                             response.content.match(/```\s*([\s\S]*?)\s*```/) ||
                             [null, response.content];
            parsedContent = JSON.parse(jsonMatch[1] || response.content);
          } catch {
            parsedContent = { raw_content: response.content };
          }

          return {
            content: parsedContent,
            modelUsed: currentModel,
            fallbacksUsed
          };
        }

        throw new Error('Empty response from AI');

      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.warn(`[DocumentAI] ${currentModel} failed: ${lastError}`);
        
        triedModels.push(currentModel);
        
        // Try next fallback
        const nextModel = getNextFallback(currentModel, modelSelection.fallbackChain, triedModels);
        if (nextModel) {
          fallbacksUsed.push(nextModel);
          currentModel = nextModel;
          showInfo(`Switching to ${nextModel.toUpperCase()} due to ${modelSelection.selectedModel} failure`);
        } else {
          // No more fallbacks
          throw new Error(`All models failed. Last error: ${lastError}`);
        }
      }
    }

    throw new Error(`Max retries exceeded. Last error: ${lastError}`);
  }, [universalAI, showInfo]);

  /**
   * Process document with intelligent model routing
   */
  const processDocument = useCallback(async (
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> => {
    const startTime = Date.now();
    
    setState({
      isProcessing: true,
      currentModel: null,
      currentStage: 'idle',
      error: null,
      lastResult: null
    });

    try {
      // Step 1: Select best model
      const modelSelection = selectBestModel(
        request.documentTypeId,
        request.documentCategory,
        request.ocrText
      );
      logModelSelection(modelSelection, request.documentTypeId);

      const config = getDocumentAIConfig(request.documentTypeId, request.documentCategory);
      let extractedData: Record<string, any> = {};
      let confidence = 0;
      let modelUsed = modelSelection.selectedModel;
      let fallbacksUsed: AIProvider[] = [];
      let pipelineStages: DocumentAIResponse['pipelineStages'] = undefined;

      // Step 2: Execute based on pipeline type
      if (modelSelection.pipelineType === 'sequential-hybrid' && request.imageUrl) {
        // Two-stage pipeline: Gemini Vision → Claude Clinical
        setState(prev => ({ ...prev, currentStage: 'stage1_vision' }));

        // Stage 1: Vision Analysis
        const visionPrompt = buildVisionAnalysisPrompt(
          request.imageUrl,
          request.ocrText,
          request.documentTypeId
        );
        
        const stage1Result = await executeWithFallback(
          visionPrompt,
          MODEL_SYSTEM_PROMPTS.gemini,
          { ...modelSelection, selectedModel: 'gemini', fallbackChain: ['claude'] },
          1
        );

        pipelineStages = {
          stage1: {
            model: stage1Result.modelUsed,
            output: stage1Result.content,
            success: true
          }
        };

        // Stage 2: Clinical Synthesis
        if (modelSelection.stage2Model) {
          setState(prev => ({ ...prev, currentStage: 'stage2_clinical' }));
          
          const clinicalPrompt = buildClinicalSynthesisPrompt(
            stage1Result.content,
            request.ocrText
          );
          
          const stage2Result = await executeWithFallback(
            clinicalPrompt,
            MODEL_SYSTEM_PROMPTS.claude,
            { ...modelSelection, selectedModel: modelSelection.stage2Model, fallbackChain: ['gemini'] },
            1
          );

          pipelineStages.stage2 = {
            model: stage2Result.modelUsed,
            output: stage2Result.content,
            success: true
          };

          // Merge both stages
          extractedData = {
            vision_analysis: stage1Result.content,
            clinical_synthesis: stage2Result.content,
            ...stage1Result.content.extracted_fields,
            ...stage2Result.content
          };
          
          confidence = (stage1Result.content.confidence || 0.7 + stage2Result.content.confidence || 0.7) / 2;
          modelUsed = stage2Result.modelUsed;
          fallbacksUsed = [...stage1Result.fallbacksUsed, ...stage2Result.fallbacksUsed];
        }

      } else {
        // Single-stage extraction
        setState(prev => ({ ...prev, currentStage: 'single_extraction' }));
        
        const extractionPrompt = buildExtractionPrompt(
          request.ocrText,
          request.targetFields,
          request.documentTypeId,
          request.processingHints
        );

        const result = await executeWithFallback(
          extractionPrompt,
          MODEL_SYSTEM_PROMPTS[modelSelection.selectedModel],
          modelSelection,
          config.maxRetries
        );

        extractedData = result.content.extracted_fields || result.content;
        confidence = result.content.confidence || 0.7;
        modelUsed = result.modelUsed;
        fallbacksUsed = result.fallbacksUsed;
      }

      const processingTimeMs = Date.now() - startTime;

      const response: DocumentAIResponse = {
        extractedData,
        confidence,
        modelUsed,
        pipelineStages,
        fallbacksUsed,
        processingTimeMs,
        warnings: extractedData.validation_warnings || extractedData.missing_required_fields
      };

      setState({
        isProcessing: false,
        currentModel: modelUsed,
        currentStage: 'idle',
        error: null,
        lastResult: response
      });

      showSuccess(`Document processed with ${modelUsed.toUpperCase()} in ${(processingTimeMs / 1000).toFixed(1)}s`);
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Document processing failed';
      
      setState({
        isProcessing: false,
        currentModel: null,
        currentStage: 'idle',
        error: errorMessage,
        lastResult: null
      });

      showError('Document AI failed', errorMessage);
      throw error;
    }
  }, [buildExtractionPrompt, buildVisionAnalysisPrompt, buildClinicalSynthesisPrompt, executeWithFallback, showSuccess, showError]);

  /**
   * Get model recommendation for a document type (without processing)
   */
  const getModelRecommendation = useCallback((
    documentTypeId: string,
    documentCategory: string,
    sampleContent?: string
  ): ModelSelectionResult => {
    return selectBestModel(documentTypeId, documentCategory, sampleContent);
  }, []);

  return {
    // State
    ...state,
    isLoading: state.isProcessing,
    
    // Actions
    processDocument,
    getModelRecommendation,
    
    // Utilities from universalAI
    generateResponse: universalAI.generateResponse,
    isProviderAvailable: universalAI.isProviderAvailable
  };
};
