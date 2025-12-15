/**
 * MEDICAL VISION AI SERVICE
 * Multi-provider medical imaging AI with modality-specific analysis
 * Supports: Gemini Vision, AWS Rekognition Medical, Azure Health Insights
 */

export type VisionAIProvider = 'gemini' | 'aws-rekognition' | 'azure-health' | 'auto';

export type MedicalModalityType = 'xray' | 'ct-scan' | 'mri' | 'ecg' | 'ultrasound' | 'mammogram' | 'pet-scan';

export type AIModelType = 'cnn' | 'u-net' | 'yolo' | 'faster-rcnn' | 'rnn' | 'llm' | 'auto';

export interface ModalityAnalysisConfig {
  modality: MedicalModalityType;
  supportedModels: AIModelType[];
  recommendedModel: AIModelType;
  analysisCapabilities: string[];
  clinicalApplications: string[];
}

export interface VisionAIProviderConfig {
  id: VisionAIProvider;
  name: string;
  description: string;
  supportedModalities: MedicalModalityType[];
  capabilities: string[];
  modelTypes: AIModelType[];
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
}

export interface MedicalAnalysisRequest {
  provider: VisionAIProvider;
  modality: MedicalModalityType;
  modelType: AIModelType;
  imageBase64: string;
  imageMimeType: string;
  analysisType: 'screening' | 'diagnostic' | 'comprehensive';
  clinicalContext?: string;
  patientHistory?: string;
}

export interface MedicalAnalysisResult {
  provider: string;
  modelUsed: string;
  modality: string;
  insights: MedicalInsight[];
  measurements?: MedicalMeasurement[];
  segmentation?: SegmentationResult;
  rawAnalysis?: string;
  processingTime: number;
  disclaimer: string;
}

export interface MedicalInsight {
  category: 'finding' | 'observation' | 'recommendation' | 'concern' | 'normal' | 'measurement';
  description: string;
  confidence: number;
  region?: string;
  clinicalSignificance?: 'low' | 'medium' | 'high' | 'critical';
  anatomicalLocation?: string;
  differentialDiagnosis?: string[];
  followUpRecommendation?: string;
}

export interface MedicalMeasurement {
  name: string;
  value: number;
  unit: string;
  normalRange?: { min: number; max: number };
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface SegmentationResult {
  regions: {
    name: string;
    area: number;
    volume?: number;
    coordinates?: { x: number; y: number }[];
  }[];
  totalRegions: number;
}

// Provider configurations
export const VISION_AI_PROVIDERS: VisionAIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini Vision',
    description: 'Advanced multimodal AI with medical image understanding',
    supportedModalities: ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound', 'mammogram', 'pet-scan'],
    capabilities: ['Detection', 'Classification', 'Report Generation', 'Anomaly Detection'],
    modelTypes: ['cnn', 'u-net', 'llm', 'auto'],
    requiresApiKey: true,
    apiKeyEnvVar: 'GEMINI_API_KEY'
  },
  {
    id: 'aws-rekognition',
    name: 'AWS Rekognition Medical',
    description: 'AWS medical imaging analysis with HealthImaging integration',
    supportedModalities: ['xray', 'ct-scan', 'mri', 'mammogram'],
    capabilities: ['Anomaly Detection', 'Tumor Detection', 'Fracture Detection', 'Hemorrhage Detection'],
    modelTypes: ['cnn', 'yolo', 'faster-rcnn', 'auto'],
    requiresApiKey: true,
    apiKeyEnvVar: 'AWS_ACCESS_KEY_ID'
  },
  {
    id: 'azure-health',
    name: 'Azure Health Insights',
    description: 'Microsoft Azure medical imaging with Health Bot integration',
    supportedModalities: ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound'],
    capabilities: ['Radiology Insights', 'Clinical Matching', 'FHIR Integration', 'Report Generation'],
    modelTypes: ['cnn', 'u-net', 'rnn', 'llm', 'auto'],
    requiresApiKey: true,
    apiKeyEnvVar: 'AZURE_HEALTH_KEY'
  }
];

// Modality-specific analysis configurations
export const MODALITY_CONFIGS: Record<MedicalModalityType, ModalityAnalysisConfig> = {
  'xray': {
    modality: 'xray',
    supportedModels: ['cnn', 'yolo', 'faster-rcnn', 'llm'],
    recommendedModel: 'cnn',
    analysisCapabilities: ['Lung nodule detection', 'Pneumonia detection', 'TB screening', 'Fracture detection', 'Cardiomegaly'],
    clinicalApplications: ['qXR', 'RetinaNet', 'CheXNet', 'DenseNet-121']
  },
  'ct-scan': {
    modality: 'ct-scan',
    supportedModels: ['cnn', 'u-net', 'yolo', 'faster-rcnn'],
    recommendedModel: 'u-net',
    analysisCapabilities: ['Brain hemorrhage detection', 'Lung cancer screening', 'Tumor segmentation', 'Cardiovascular analysis', 'Liver lesion detection'],
    clinicalApplications: ['qER', 'U-Net', '3D-CNN', 'DeepMedic']
  },
  'mri': {
    modality: 'mri',
    supportedModels: ['u-net', 'cnn', 'rnn'],
    recommendedModel: 'u-net',
    analysisCapabilities: ['Brain tumor segmentation', 'Alzheimer detection', 'Multiple sclerosis lesions', 'Cardiac function analysis', 'Spine abnormalities'],
    clinicalApplications: ['U-Net', 'BraTS', 'DeepBrain', 'nnU-Net']
  },
  'ecg': {
    modality: 'ecg',
    supportedModels: ['cnn', 'rnn', 'llm'],
    recommendedModel: 'rnn',
    analysisCapabilities: ['Arrhythmia detection', 'Atrial fibrillation', 'MI detection', 'ST elevation analysis', 'QT interval analysis'],
    clinicalApplications: ['1D-CNN', 'LSTM', 'Transformer', 'ResNet-ECG']
  },
  'ultrasound': {
    modality: 'ultrasound',
    supportedModels: ['cnn', 'u-net', 'yolo'],
    recommendedModel: 'u-net',
    analysisCapabilities: ['Fetal measurements', 'Cardiac function', 'Liver assessment', 'Thyroid nodules', 'Breast lesions'],
    clinicalApplications: ['SonoNet', 'U-Net', 'YOLO-US']
  },
  'mammogram': {
    modality: 'mammogram',
    supportedModels: ['cnn', 'yolo', 'faster-rcnn'],
    recommendedModel: 'faster-rcnn',
    analysisCapabilities: ['Mass detection', 'Microcalcifications', 'Breast density', 'Asymmetry detection', 'BI-RADS scoring'],
    clinicalApplications: ['Faster R-CNN', 'YOLO', 'ResNet-Mammo', 'DenseNet']
  },
  'pet-scan': {
    modality: 'pet-scan',
    supportedModels: ['cnn', 'u-net'],
    recommendedModel: 'u-net',
    analysisCapabilities: ['Tumor metabolism', 'Cancer staging', 'Brain activity mapping', 'Cardiac viability'],
    clinicalApplications: ['SUV Analysis', '3D-CNN', 'U-Net PET']
  }
};

// AI Model type configurations
export const AI_MODEL_TYPES: Record<AIModelType, { name: string; description: string; bestFor: string[] }> = {
  'cnn': {
    name: 'CNN (Convolutional Neural Network)',
    description: 'Backbone for medical imaging - identifies patterns, shapes, textures',
    bestFor: ['Cancer detection', 'Fracture identification', 'Pattern recognition', 'Classification']
  },
  'u-net': {
    name: 'U-Net',
    description: 'Specialized for segmentation - precisely outlines organs and abnormal regions',
    bestFor: ['Tumor segmentation', 'Organ delineation', 'Brain MRI analysis', 'Precise boundary detection']
  },
  'yolo': {
    name: 'YOLO (You Only Look Once)',
    description: 'Fast object detection - pinpoints anomalies quickly',
    bestFor: ['Real-time detection', 'Tumor localization', 'Mass detection', 'Quick screening']
  },
  'faster-rcnn': {
    name: 'Faster R-CNN',
    description: 'High-precision object detection with region proposals',
    bestFor: ['Mammography', 'Suspicious finding localization', 'Small lesion detection', 'High accuracy needs']
  },
  'rnn': {
    name: 'RNN (Recurrent Neural Network)',
    description: 'Analyzes sequential and time-series data',
    bestFor: ['ECG analysis', 'Dynamic imaging', 'Temporal patterns', 'Signal processing']
  },
  'llm': {
    name: 'LLM (Large Language Model)',
    description: 'Generates draft radiology reports from images',
    bestFor: ['Report generation', 'Clinical summarization', 'Natural language findings', 'Radiologist workflow']
  },
  'auto': {
    name: 'Auto-Select',
    description: 'Automatically selects best model based on modality and analysis type',
    bestFor: ['General use', 'Optimal performance', 'Adaptive analysis']
  }
};

// Service class
export class MedicalVisionAIService {
  private static instance: MedicalVisionAIService;

  static getInstance(): MedicalVisionAIService {
    if (!MedicalVisionAIService.instance) {
      MedicalVisionAIService.instance = new MedicalVisionAIService();
    }
    return MedicalVisionAIService.instance;
  }

  getProviders(): VisionAIProviderConfig[] {
    return VISION_AI_PROVIDERS;
  }

  getProvider(providerId: VisionAIProvider): VisionAIProviderConfig | undefined {
    return VISION_AI_PROVIDERS.find(p => p.id === providerId);
  }

  getModalityConfig(modality: MedicalModalityType): ModalityAnalysisConfig {
    return MODALITY_CONFIGS[modality];
  }

  getRecommendedModel(modality: MedicalModalityType): AIModelType {
    return MODALITY_CONFIGS[modality]?.recommendedModel || 'auto';
  }

  getSupportedModels(modality: MedicalModalityType): AIModelType[] {
    return MODALITY_CONFIGS[modality]?.supportedModels || ['auto'];
  }

  getProvidersForModality(modality: MedicalModalityType): VisionAIProviderConfig[] {
    return VISION_AI_PROVIDERS.filter(p => p.supportedModalities.includes(modality));
  }

  getModelTypeInfo(modelType: AIModelType) {
    return AI_MODEL_TYPES[modelType];
  }

  buildAnalysisPrompt(modality: MedicalModalityType, modelType: AIModelType, analysisType: string): string {
    const config = MODALITY_CONFIGS[modality];
    const modelInfo = AI_MODEL_TYPES[modelType === 'auto' ? config.recommendedModel : modelType];
    
    const basePrompt = `You are an advanced medical imaging AI assistant specialized in ${modality.replace('-', ' ')} analysis.
    
Analysis Configuration:
- Modality: ${config.modality.toUpperCase()}
- AI Model Approach: ${modelInfo.name}
- Analysis Type: ${analysisType}
- Capabilities: ${config.analysisCapabilities.join(', ')}
- Clinical Applications: ${config.clinicalApplications.join(', ')}

Please analyze this medical image and provide:

1. **Findings**: Detailed observations using ${modelType === 'u-net' ? 'precise segmentation and boundary detection' : modelType === 'yolo' || modelType === 'faster-rcnn' ? 'object detection and localization' : modelType === 'rnn' ? 'temporal pattern analysis' : 'pattern recognition and classification'}

2. **Measurements**: Any relevant quantitative measurements with normal ranges

3. **Clinical Significance**: Assessment of each finding's importance (low/medium/high/critical)

4. **Anatomical Location**: Specific location of findings

5. **Differential Diagnosis**: Possible conditions to consider

6. **Recommendations**: Suggested follow-up actions

Format your response as a structured JSON with the following schema:
{
  "insights": [
    {
      "category": "finding|observation|recommendation|concern|normal|measurement",
      "description": "string",
      "confidence": number (0-100),
      "region": "string",
      "clinicalSignificance": "low|medium|high|critical",
      "anatomicalLocation": "string",
      "differentialDiagnosis": ["string"],
      "followUpRecommendation": "string"
    }
  ],
  "measurements": [
    {
      "name": "string",
      "value": number,
      "unit": "string",
      "normalRange": { "min": number, "max": number },
      "status": "normal|borderline|abnormal"
    }
  ],
  "overallAssessment": "string",
  "urgency": "routine|priority|urgent|emergent"
}`;

    return basePrompt;
  }
}

export const medicalVisionAIService = MedicalVisionAIService.getInstance();
