import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  Sparkles, 
  User, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Save,
  Eye,
  Stethoscope,
  Building2,
  ClipboardList,
  FileDown,
  Shield,
  Settings2,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Phone,
  ChevronDown,
  ChevronRight,
  Layers,
  Target,
  Info,
  AlertCircle,
  Cpu,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VisionAIProviderSelector } from './VisionAIProviderSelector';
import { MedicalReportPDFGenerator } from './MedicalReportPDFGenerator';
import { 
  VisionAIProvider, 
  AIModelType, 
  MedicalModalityType,
  medicalVisionAIService 
} from '@/services/medicalVisionAIService';

interface MedicalImageAnalysisProps {
  imageUrl: string;
  imageBase64?: string;
  imageMimeType?: string;
  documentType: string;
  onSaveAnalysis: (data: AnalysisResult) => void;
}

interface AnalysisResult {
  patientDetails: {
    patient_name: string;
    patient_dob: string;
    patient_id: string;
    referring_physician: string;
    study_date: string;
  };
  providerDetails: {
    provider_name: string;
    provider_npi: string;
    facility_name: string;
    facility_address: string;
    report_date: string;
  };
  aiInsights: AIInsight[];
  measurements?: Measurement[];
  notes: string;
  reportGenerated: boolean;
  modelUsed?: string;
  disclaimer?: string;
}

interface AIInsight {
  category: 'finding' | 'observation' | 'recommendation' | 'concern' | 'normal' | 'abnormality' | 'measurement';
  description: string;
  confidence: number;
  region?: string;
  clinicalSignificance?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'normal' | 'borderline' | 'abnormal';
  measurementValue?: string;
  normalRange?: string;
  panelReference?: string;
  anatomicalLocation?: {
    organ?: string;
    side?: string;
    region?: string;
  };
  detailedExplanation?: string;
  differentialDiagnosis?: string[];
  followUpRecommendation?: string;
}

interface Measurement {
  name: string;
  value: number;
  unit: string;
  normalRange?: { min: number; max: number; description?: string };
  status: 'normal' | 'borderline' | 'abnormal';
  clinicalImplication?: string;
  panelReference?: string;
}

interface PanelAnalysis {
  panelId: string;
  anatomicalRegion: string;
  organSystem: string;
  imagingModality?: string;
  findings: string[];
}

interface DetailedReport {
  clinicalHistory?: string;
  technique?: string;
  comparison?: string;
  findingsNarrative?: string;
  impression?: string;
  recommendations?: string;
}

interface AbnormalitySummary {
  totalAbnormalities: number;
  criticalFindings: string[];
  abnormalitiesByPanel?: Record<string, string[]>;
  abnormalitiesByOrgan?: Record<string, string[]>;
  recommendedActions: string[];
}

interface ModelApproachDetails {
  name: string;
  description: string;
  capabilities: string[];
  bestFor: string[];
  accuracy: string;
  limitations: string;
}

interface AutoDetection {
  detectedModality: string;
  modalityConfidence: number;
  modalityFeatures?: string[];
  detectedOrgans: Array<{
    organ: string;
    side: string;
    confidence: number;
    identifyingFeatures?: string[];
  }>;
  imagingCharacteristics?: {
    contrast?: string;
    orientation?: string;
    quality?: string;
  };
}

interface Obstruction {
  type: string;
  location: string;
  severity: string;
  cause: string;
  upstreamEffects?: string;
  measurements?: string;
  clinicalUrgency: string;
  recommendedAction: string;
}

interface ClinicalNotesData {
  keyFindings: string[];
  clinicalCorrelation: string;
  riskAssessment: string;
  limitations: string;
  additionalImaging: string;
}

interface Observation {
  observation: string;
  significance: string;
  normalComparison: string;
}

export const MedicalImageAnalysis: React.FC<MedicalImageAnalysisProps> = ({
  imageUrl,
  imageBase64,
  imageMimeType,
  documentType,
  onSaveAnalysis
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [panelAnalysis, setPanelAnalysis] = useState<PanelAnalysis[]>([]);
  const [detailedReport, setDetailedReport] = useState<DetailedReport>({});
  const [abnormalitySummary, setAbnormalitySummary] = useState<AbnormalitySummary | null>(null);
  const [modelApproachDetails, setModelApproachDetails] = useState<ModelApproachDetails | null>(null);
  const [autoDetection, setAutoDetection] = useState<AutoDetection | null>(null);
  const [obstructions, setObstructions] = useState<Obstruction[]>([]);
  const [clinicalNotesData, setClinicalNotesData] = useState<ClinicalNotesData | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [providerConsultation, setProviderConsultation] = useState<any>(null);
  const [cnnAnalysis, setCnnAnalysis] = useState<any>(null);
  const [modelsUsedList, setModelsUsedList] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [modelApproach, setModelApproach] = useState<string>('');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [rawAnalysis, setRawAnalysis] = useState<string>('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [hasAbnormalities, setHasAbnormalities] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['model-info', 'auto-detection', 'cnn-models']));
  
  // Multi-provider state
  const modality = (documentType?.replace('-', '') === 'ctscan' ? 'ct-scan' : documentType) as MedicalModalityType || 'xray';
  const [selectedProvider, setSelectedProvider] = useState<VisionAIProvider>('gemini');
  const [selectedModelType, setSelectedModelType] = useState<AIModelType>(
    medicalVisionAIService.getRecommendedModel(modality)
  );
  const [analysisType, setAnalysisType] = useState<'screening' | 'diagnostic' | 'comprehensive'>('comprehensive');
  
  // Patient details form state
  const [patientDetails, setPatientDetails] = useState({
    patient_name: '',
    patient_dob: '',
    patient_id: '',
    referring_physician: '',
    study_date: new Date().toISOString().split('T')[0]
  });

  // Provider details form state
  const [providerDetails, setProviderDetails] = useState({
    provider_name: '',
    provider_npi: '',
    facility_name: '',
    facility_address: '',
    report_date: new Date().toISOString().split('T')[0]
  });
  
  const [clinicalNotes, setClinicalNotes] = useState('');

  const togglePanel = (panelId: string) => {
    setExpandedPanels(prev => {
      const next = new Set(prev);
      if (next.has(panelId)) next.delete(panelId);
      else next.add(panelId);
      return next;
    });
  };

  const getDocumentTypeLabel = () => {
    const labels: Record<string, string> = {
      'xray': 'X-Ray',
      'ct-scan': 'CT Scan',
      'mri': 'MRI',
      'ecg': 'ECG/EKG',
      'ultrasound': 'Ultrasound',
      'mammogram': 'Mammogram'
    };
    return labels[documentType] || 'Medical Image';
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setAiInsights([]);
    setMeasurements([]);
    setPanelAnalysis([]);
    setDetailedReport({});
    setAbnormalitySummary(null);
    setModelApproachDetails(null);
    setAutoDetection(null);
    setObstructions([]);
    setClinicalNotesData(null);
    setObservations([]);
    setProviderConsultation(null);
    setRawAnalysis('');
    setHasAbnormalities(false);
    
    try {
      let base64Data = imageBase64;
      let mimeType = imageMimeType || 'image/jpeg';
      
      if (!base64Data && imageUrl?.startsWith('data:')) {
        const parts = imageUrl.split(',');
        base64Data = parts[1];
        const mimeMatch = parts[0].match(/data:([^;]+)/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }
      
      // Call AI with multi-provider support
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'analyze_medical_image',
          imageBase64: base64Data,
          imageMimeType: mimeType,
          imageUrl: !base64Data ? imageUrl : undefined,
          documentType: modality,
          analysisType,
          provider: selectedProvider,
          modelType: selectedModelType
        }
      });

      if (error) throw error;

      if (data) {
        // Set insights
        if (data.insights) {
          setAiInsights(data.insights);
        }
        
        // Set model info
        setModelUsed(data.modelUsed || 'unknown');
        setModelApproach(data.modelApproach || data.modelType?.toUpperCase() || '');
        setDisclaimer(data.disclaimer || '');
        setRawAnalysis(data.rawAnalysis || '');
        
        // Set measurements
        if (data.measurements && Array.isArray(data.measurements)) {
          setMeasurements(data.measurements);
        }
        
        // Set panel analysis
        if (data.panelAnalysis && Array.isArray(data.panelAnalysis)) {
          setPanelAnalysis(data.panelAnalysis);
        }
        
        // Set detailed report
        if (data.detailedReport) {
          setDetailedReport(data.detailedReport);
        }
        
        // Set abnormality summary
        if (data.abnormalitySummary) {
          setAbnormalitySummary(data.abnormalitySummary);
        }
        
        // Set model approach details
        if (data.modelApproachDetails) {
          setModelApproachDetails(data.modelApproachDetails);
        }
        
        // Set auto-detection data
        if (data.autoDetection) {
          setAutoDetection(data.autoDetection);
        }
        
        // Set obstructions and blockages
        if (data.obstructionsAndBlockages && Array.isArray(data.obstructionsAndBlockages)) {
          setObstructions(data.obstructionsAndBlockages);
        }
        
        // Set clinical notes
        if (data.clinicalNotes) {
          setClinicalNotesData(data.clinicalNotes);
        }
        
        // Set observations
        if (data.observations && Array.isArray(data.observations)) {
          setObservations(data.observations);
        }
        
        // Set provider consultation
        if (data.providerConsultation) {
          setProviderConsultation(data.providerConsultation);
        }
        
        // Set CNN analysis results
        if (data.cnnAnalysis) {
          setCnnAnalysis(data.cnnAnalysis);
        }
        
        // Set models used list
        if (data.modelsUsed && Array.isArray(data.modelsUsed)) {
          setModelsUsedList(data.modelsUsed);
        }
        
        // Check for abnormalities
        const abnormalCount = (data.insights || []).filter((i: AIInsight) => 
          i.status === 'abnormal' || 
          i.clinicalSignificance === 'high' || 
          i.clinicalSignificance === 'critical' ||
          i.category === 'concern' ||
          i.category === 'abnormality'
        ).length;
        
        // Also check CNN analysis for critical findings
        const cnnCriticalCount = data.cnnAnalysis?.clinicalSummary?.criticalFindings?.length || 0;
        
        setHasAbnormalities(abnormalCount > 0 || cnnCriticalCount > 0 || (data.abnormalitySummary?.totalAbnormalities || 0) > 0);
      }
      
      setAnalysisComplete(true);
      toast.success(`Analysis complete`, {
        description: `${data?.detectedModality || data?.provider || 'AI'} ${data?.detectedOrgans?.[0]?.organ ? `- ${data.detectedOrgans[0].organ}` : ''} - ${data?.insights?.length || 0} findings`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!patientDetails.patient_name) {
      toast.error('Please enter patient name before saving');
      return;
    }

    onSaveAnalysis({
      patientDetails,
      providerDetails,
      aiInsights,
      notes: clinicalNotes,
      reportGenerated: true,
      modelUsed,
      disclaimer
    });
    
    toast.success('Analysis report saved successfully');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'finding': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'observation': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'recommendation': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'abnormality': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'normal': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finding': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'observation': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'recommendation': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'concern': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'abnormality': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'normal': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSignificanceColor = (significance?: string) => {
    switch (significance) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'abnormal': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'borderline': return <Minus className="h-3 w-3 text-amber-500" />;
      case 'normal': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Image Viewer */}
      <Card className="lg:row-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {getDocumentTypeLabel()} Image
              </CardTitle>
              <CardDescription>AI-powered medical image analysis</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setRotation((rotation + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black/90 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            {imageUrl ? (
              <div className="flex items-center justify-center p-4" style={{ minHeight: '400px' }}>
                <img
                  src={imageUrl}
                  alt="Medical Image"
                  className="max-w-full h-auto transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    maxHeight: '500px'
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                No image uploaded
              </div>
            )}
          </div>
          
          {/* Model Info Badge */}
          {modelUsed && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                {modelUsed}
              </Badge>
              {modelApproach && (
                <Badge variant="secondary" className="text-xs">
                  <Cpu className="h-3 w-3 mr-1" />
                  {modelApproach}
                </Badge>
              )}
              {analysisComplete && (
                <Badge variant="outline" className="text-xs">
                  {aiInsights.length} insights
                </Badge>
              )}
              {cnnAnalysis && (
                <Badge className="text-xs bg-emerald-600">
                  <Activity className="h-3 w-3 mr-1" />
                  CNN Ensemble Active
                </Badge>
              )}
            </div>
          )}
          
          {/* CNN Models Used */}
          {modelsUsedList.length > 1 && (
            <Collapsible open={expandedPanels.has('cnn-models')} className="mt-3">
              <CollapsibleTrigger 
                onClick={() => togglePanel('cnn-models')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full"
              >
                {expandedPanels.has('cnn-models') ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Cpu className="h-3 w-3" />
                {modelsUsedList.length} AI Models Used (CNN + Vision AI)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-emerald-50 rounded-lg p-3 text-xs space-y-2 border border-emerald-200">
                  <div className="font-medium text-emerald-800">Models Executed:</div>
                  <div className="flex flex-wrap gap-1">
                    {modelsUsedList.map((model, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                        {model}
                      </Badge>
                    ))}
                  </div>
                  {cnnAnalysis?.clinicalSummary && (
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <div className="font-medium text-emerald-800 mb-1">CNN Summary:</div>
                      <p className="text-emerald-700">{cnnAnalysis.clinicalSummary.overallAssessment}</p>
                      {cnnAnalysis.clinicalSummary.criticalFindings?.length > 0 && (
                        <div className="mt-1 text-red-600 font-medium">
                          ⚠️ {cnnAnalysis.clinicalSummary.criticalFindings.length} critical finding(s) from CNN
                        </div>
                      )}
                    </div>
                  )}
                  {cnnAnalysis?.performance && (
                    <div className="text-muted-foreground">
                      Total latency: {cnnAnalysis.performance.totalLatencyMs}ms | 
                      {cnnAnalysis.predictions?.length || 0} predictions
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Model Approach Details */}
          {modelApproachDetails && (
            <Collapsible open={expandedPanels.has('model-info')} className="mt-3">
              <CollapsibleTrigger 
                onClick={() => togglePanel('model-info')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full"
              >
                {expandedPanels.has('model-info') ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Info className="h-3 w-3" />
                AI Model Approach Details
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                  <div>
                    <span className="font-medium">{modelApproachDetails.name}</span>
                    <p className="text-muted-foreground">{modelApproachDetails.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Capabilities:</span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {modelApproachDetails.capabilities.slice(0, 3).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-medium">Best For: </span>
                      <span className="text-muted-foreground">{modelApproachDetails.bestFor.join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-amber-600">
                    <span className="font-medium">Limitations: </span>
                    {modelApproachDetails.limitations}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Analyze Button */}
          <div className="mt-4">
            <Button 
              className="w-full" 
              onClick={analyzeImage} 
              disabled={isAnalyzing || !imageUrl}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with Vision AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with Vision AI
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Uses multi-model Vision AI for comprehensive medical image analysis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Analysis & Details */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              Report
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-1 text-xs">
              <Stethoscope className="h-3 w-3" />
              Provider
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-4 space-y-4">
            {/* Auto-Detection Results */}
            {autoDetection && (
              <Card className="border-blue-500/30 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Auto-Detected Image Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-600">
                      {autoDetection.detectedModality}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {autoDetection.modalityConfidence}% confidence
                    </span>
                  </div>
                  
                  {autoDetection.detectedOrgans.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Detected Organs/Regions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {autoDetection.detectedOrgans.map((organ, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {organ.organ} {organ.side !== 'N/A' && `(${organ.side})`}
                            <span className="ml-1 text-muted-foreground">{organ.confidence}%</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {autoDetection.imagingCharacteristics && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {autoDetection.imagingCharacteristics.contrast && (
                        <span>Contrast: {autoDetection.imagingCharacteristics.contrast}</span>
                      )}
                      {autoDetection.imagingCharacteristics.orientation && (
                        <span>• Orientation: {autoDetection.imagingCharacteristics.orientation}</span>
                      )}
                      {autoDetection.imagingCharacteristics.quality && (
                        <span>• Quality: {autoDetection.imagingCharacteristics.quality}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Panel Analysis */}
            {panelAnalysis.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Image Panel Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {panelAnalysis.map((panel, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">Panel {panel.panelId}</Badge>
                          <span className="font-medium text-sm">{panel.anatomicalRegion}</span>
                          <Badge variant="secondary" className="text-xs">{panel.organSystem}</Badge>
                        </div>
                        {panel.findings.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {panel.findings.map((finding, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Obstructions and Blockages */}
            {obstructions.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Obstructions & Blockages Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {obstructions.map((obs, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            obs.severity === 'severe' || obs.severity === 'complete' ? 'bg-red-500' :
                            obs.severity === 'moderate' ? 'bg-amber-500' : 'bg-yellow-500'
                          }>
                            {obs.severity} {obs.type} obstruction
                          </Badge>
                          <Badge variant="outline" className={
                            obs.clinicalUrgency === 'emergent' ? 'border-red-500 text-red-700' :
                            obs.clinicalUrgency === 'urgent' ? 'border-amber-500 text-amber-700' : ''
                          }>
                            {obs.clinicalUrgency}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Location:</span> {obs.location}</p>
                          <p><span className="font-medium">Suspected Cause:</span> {obs.cause}</p>
                          {obs.measurements && <p><span className="font-medium">Measurements:</span> {obs.measurements}</p>}
                          {obs.upstreamEffects && <p><span className="font-medium">Effects:</span> {obs.upstreamEffects}</p>}
                          <p className="text-primary font-medium mt-2">Recommended: {obs.recommendedAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinical Notes */}
            {clinicalNotesData && (clinicalNotesData.keyFindings?.length > 0 || clinicalNotesData.clinicalCorrelation) && (
              <Card className="border-green-500/30 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-green-600" />
                    Clinical Notes & Observations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {clinicalNotesData.keyFindings?.length > 0 && (
                    <div>
                      <span className="font-medium">Key Findings:</span>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {clinicalNotesData.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {clinicalNotesData.clinicalCorrelation && (
                    <div>
                      <span className="font-medium">Clinical Correlation:</span>
                      <p className="text-muted-foreground mt-1">{clinicalNotesData.clinicalCorrelation}</p>
                    </div>
                  )}
                  {clinicalNotesData.riskAssessment && (
                    <div>
                      <span className="font-medium">Risk Assessment:</span>
                      <p className="text-muted-foreground mt-1">{clinicalNotesData.riskAssessment}</p>
                    </div>
                  )}
                  {clinicalNotesData.additionalImaging && (
                    <div>
                      <span className="font-medium">Additional Imaging Recommended:</span>
                      <p className="text-muted-foreground mt-1">{clinicalNotesData.additionalImaging}</p>
                    </div>
                  )}
                  {clinicalNotesData.limitations && (
                    <div>
                      <span className="font-medium">Study Limitations:</span>
                      <p className="text-muted-foreground mt-1">{clinicalNotesData.limitations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Observations */}
            {observations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Detailed Observations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {observations.map((obs, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{obs.observation}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          <span className="font-medium">Significance:</span> {obs.significance}
                        </p>
                        {obs.normalComparison && (
                          <p className="text-muted-foreground text-xs">
                            <span className="font-medium">Normal Comparison:</span> {obs.normalComparison}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Provider Consultation Alert */}
            {providerConsultation && (
              <Alert className={
                providerConsultation.urgency === 'emergent' ? 'border-red-500 bg-red-50' :
                providerConsultation.urgency === 'urgent' ? 'border-amber-500 bg-amber-50' :
                'border-blue-500 bg-blue-50'
              }>
                <Phone className={`h-4 w-4 ${
                  providerConsultation.urgency === 'emergent' ? 'text-red-600' :
                  providerConsultation.urgency === 'urgent' ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <AlertTitle className={
                  providerConsultation.urgency === 'emergent' ? 'text-red-800' :
                  providerConsultation.urgency === 'urgent' ? 'text-amber-800' : 'text-blue-800'
                }>
                  Provider Consultation {providerConsultation.urgency === 'emergent' ? 'REQUIRED IMMEDIATELY' : 
                    providerConsultation.urgency === 'urgent' ? 'Required Soon' : 'Recommended'}
                </AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p><span className="font-medium">Recommended Specialty:</span> {providerConsultation.recommendedSpecialty?.join(', ')}</p>
                  {providerConsultation.reason && <p><span className="font-medium">Reason:</span> {providerConsultation.reason}</p>}
                  {providerConsultation.disclaimer && (
                    <p className="text-xs italic mt-2 p-2 bg-white/50 rounded">{providerConsultation.disclaimer}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Abnormality Summary */}
            {abnormalitySummary && abnormalitySummary.totalAbnormalities > 0 && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  {abnormalitySummary.totalAbnormalities} Abnormalit{abnormalitySummary.totalAbnormalities > 1 ? 'ies' : 'y'} Detected
                </AlertTitle>
                <AlertDescription className="text-red-700 text-sm space-y-2">
                  {abnormalitySummary.criticalFindings.length > 0 && (
                    <div>
                      <span className="font-medium">Critical Findings:</span>
                      <ul className="list-disc list-inside">
                        {abnormalitySummary.criticalFindings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {abnormalitySummary.abnormalitiesByOrgan && Object.keys(abnormalitySummary.abnormalitiesByOrgan).length > 0 && (
                    <div>
                      <span className="font-medium">By Organ:</span>
                      {Object.entries(abnormalitySummary.abnormalitiesByOrgan).map(([organ, findings]) => (
                        <div key={organ} className="ml-2">
                          <span className="font-medium">{organ}:</span> {(findings as string[]).join('; ')}
                        </div>
                      ))}
                    </div>
                  )}
                  {abnormalitySummary.recommendedActions.length > 0 && (
                    <div>
                      <span className="font-medium">Recommended Actions:</span>
                      <ul className="list-disc list-inside">
                        {abnormalitySummary.recommendedActions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Detailed Findings
                </CardTitle>
                <CardDescription>
                  {analysisComplete 
                    ? `${aiInsights.length} findings from ${modelApproach || 'AI'} analysis` 
                    : 'Click "Analyze with Vision AI" to get insights'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {disclaimer && (
                  <Alert className="mb-4">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {disclaimer}
                    </AlertDescription>
                  </Alert>
                )}
                
                {aiInsights.length > 0 ? (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-3">
                      {aiInsights.map((insight, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${getCategoryColor(insight.category)}`}
                        >
                          <div className="flex items-start gap-2">
                            {getCategoryIcon(insight.category)}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {insight.category}
                                  </Badge>
                                  {insight.panelReference && insight.panelReference !== 'all' && (
                                    <Badge variant="secondary" className="text-xs font-mono">
                                      Panel {insight.panelReference}
                                    </Badge>
                                  )}
                                  {insight.status && (
                                    <Badge className={`text-xs ${
                                      insight.status === 'abnormal' ? 'bg-red-500' : 
                                      insight.status === 'borderline' ? 'bg-amber-500' : 'bg-green-500'
                                    }`}>
                                      {getStatusIcon(insight.status)}
                                      <span className="ml-1">{insight.status}</span>
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {insight.clinicalSignificance && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSignificanceColor(insight.clinicalSignificance)}`}>
                                      {insight.clinicalSignificance} significance
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {insight.confidence}%
                                  </span>
                                </div>
                              </div>
                              
                              {/* Anatomical Location */}
                              {insight.anatomicalLocation && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {[
                                      insight.anatomicalLocation.organ,
                                      insight.anatomicalLocation.side,
                                      insight.anatomicalLocation.region
                                    ].filter(Boolean).join(' - ')}
                                  </span>
                                </div>
                              )}
                              
                              <p className="text-sm">{insight.description}</p>
                              
                              {/* Detailed Explanation */}
                              {insight.detailedExplanation && (
                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                  {insight.detailedExplanation}
                                </p>
                              )}
                              
                              {/* Differential Diagnosis */}
                              {insight.differentialDiagnosis && insight.differentialDiagnosis.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Differential: </span>
                                  <span className="text-muted-foreground">
                                    {insight.differentialDiagnosis.join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              {/* Measurements */}
                              {insight.measurementValue && (
                                <div className="text-xs flex items-center gap-2">
                                  <Activity className="h-3 w-3" />
                                  <span className="font-medium">Measured: {insight.measurementValue}</span>
                                  {insight.normalRange && (
                                    <span className="text-muted-foreground">(Normal: {insight.normalRange})</span>
                                  )}
                                </div>
                              )}
                              
                              {/* Follow-up Recommendation */}
                              {insight.followUpRecommendation && (
                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  <span className="font-medium">Follow-up: </span>
                                  {insight.followUpRecommendation}
                                </div>
                              )}
                              
                              {insight.region && !insight.anatomicalLocation && (
                                <p className="text-xs text-muted-foreground">
                                  Region: {insight.region}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No analysis results yet</p>
                    <p className="text-sm">Upload an image and click analyze</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detailed Report
                </CardTitle>
                <CardDescription>
                  Comprehensive narrative analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detailedReport && Object.keys(detailedReport).length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {detailedReport.technique && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Technique</h4>
                          <p className="text-sm text-muted-foreground">{detailedReport.technique}</p>
                        </div>
                      )}
                      
                      {detailedReport.clinicalHistory && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Clinical Context</h4>
                          <p className="text-sm text-muted-foreground">{detailedReport.clinicalHistory}</p>
                        </div>
                      )}
                      
                      {detailedReport.comparison && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Comparison</h4>
                          <p className="text-sm text-muted-foreground">{detailedReport.comparison}</p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {detailedReport.findingsNarrative && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Findings</h4>
                          <p className="text-sm whitespace-pre-wrap">{detailedReport.findingsNarrative}</p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {detailedReport.impression && (
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-1">Impression</h4>
                          <p className="text-sm font-medium">{detailedReport.impression}</p>
                        </div>
                      )}
                      
                      {detailedReport.recommendations && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-1 text-blue-800">Recommendations</h4>
                          <p className="text-sm text-blue-700">{detailedReport.recommendations}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No detailed report yet</p>
                    <p className="text-sm">Run analysis to generate report</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="patient" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <CardDescription>Enter patient details for the report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="patient_name">Patient Name *</Label>
                      <Input
                        id="patient_name"
                        placeholder="Enter patient name"
                        value={patientDetails.patient_name}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, patient_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patient_dob">Date of Birth</Label>
                      <Input
                        id="patient_dob"
                        type="date"
                        value={patientDetails.patient_dob}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, patient_dob: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patient_id">Patient ID / MRN</Label>
                      <Input
                        id="patient_id"
                        placeholder="Patient ID"
                        value={patientDetails.patient_id}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, patient_id: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="study_date">Study Date</Label>
                      <Input
                        id="study_date"
                        type="date"
                        value={patientDetails.study_date}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, study_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="referring_physician">Referring Physician</Label>
                      <Input
                        id="referring_physician"
                        placeholder="Dr. Name"
                        value={patientDetails.referring_physician}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, referring_physician: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="provider" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Provider Information
                </CardTitle>
                <CardDescription>Who is providing the interpretation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="provider_name">Interpreting Provider</Label>
                      <Input
                        id="provider_name"
                        placeholder="Dr. Provider Name"
                        value={providerDetails.provider_name}
                        onChange={(e) => setProviderDetails(prev => ({ ...prev, provider_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="provider_npi">NPI Number</Label>
                      <Input
                        id="provider_npi"
                        placeholder="1234567890"
                        value={providerDetails.provider_npi}
                        onChange={(e) => setProviderDetails(prev => ({ ...prev, provider_npi: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="report_date">Report Date</Label>
                      <Input
                        id="report_date"
                        type="date"
                        value={providerDetails.report_date}
                        onChange={(e) => setProviderDetails(prev => ({ ...prev, report_date: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="facility_name">Facility Name</Label>
                      <Input
                        id="facility_name"
                        placeholder="Hospital / Clinic Name"
                        value={providerDetails.facility_name}
                        onChange={(e) => setProviderDetails(prev => ({ ...prev, facility_name: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="facility_address">Facility Address</Label>
                      <Input
                        id="facility_address"
                        placeholder="123 Medical Center Dr, City, State"
                        value={providerDetails.facility_address}
                        onChange={(e) => setProviderDetails(prev => ({ ...prev, facility_address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Clinical Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add clinical observations, recommendations, or additional notes..."
              className="min-h-[80px]"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Provider Consultation Alert */}
        {hasAbnormalities && analysisComplete && (
          <Alert className="border-amber-500 bg-amber-50">
            <Phone className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Healthcare Provider Consultation Required</AlertTitle>
            <AlertDescription className="text-amber-700 text-sm">
              Abnormal findings detected. Please schedule an appointment with your healthcare provider to discuss these results. This AI analysis is not a substitute for professional medical interpretation.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <MedicalReportPDFGenerator
            patientDetails={patientDetails}
            providerDetails={providerDetails}
            aiInsights={aiInsights}
            measurements={measurements}
            clinicalNotes={clinicalNotes}
            documentType={documentType}
            modelUsed={modelUsed}
            disclaimer={disclaimer}
            panelAnalysis={panelAnalysis}
            detailedReport={detailedReport}
            abnormalitySummary={abnormalitySummary}
          />
          <Button 
            className="flex-1" 
            onClick={handleSave} 
            disabled={!patientDetails.patient_name}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicalImageAnalysis;
