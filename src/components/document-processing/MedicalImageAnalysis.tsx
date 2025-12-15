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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MedicalImageAnalysisProps {
  imageUrl: string;
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
  notes: string;
  reportGenerated: boolean;
  modelUsed?: string;
  disclaimer?: string;
}

interface AIInsight {
  category: 'finding' | 'observation' | 'recommendation' | 'concern' | 'normal';
  description: string;
  confidence: number;
  region?: string;
  clinicalSignificance?: 'low' | 'medium' | 'high';
}

export const MedicalImageAnalysis: React.FC<MedicalImageAnalysisProps> = ({
  imageUrl,
  documentType,
  onSaveAnalysis
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [rawAnalysis, setRawAnalysis] = useState<string>('');
  const [activeTab, setActiveTab] = useState('analysis');
  
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

  const getDocumentTypeLabel = () => {
    const labels: Record<string, string> = {
      'xray': 'X-Ray',
      'ct-scan': 'CT Scan',
      'mri': 'MRI',
      'ecg': 'ECG/EKG',
      'ultrasound': 'Ultrasound'
    };
    return labels[documentType] || 'Medical Image';
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setAiInsights([]);
    setRawAnalysis('');
    
    try {
      // Call AI to analyze the medical image using Vision AI
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'analyze_medical_image',
          imageUrl,
          documentType,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      if (data?.insights) {
        setAiInsights(data.insights);
        setModelUsed(data.modelUsed || 'unknown');
        setDisclaimer(data.disclaimer || '');
        setRawAnalysis(data.rawAnalysis || '');
      }
      
      setAnalysisComplete(true);
      toast.success(`Image analyzed using ${data?.modelUsed || 'AI'}`, {
        description: 'Review the clinical insights below'
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

  const generateReport = () => {
    if (!patientDetails.patient_name) {
      toast.error('Please enter patient details first');
      return;
    }

    // Generate a formatted report
    const report = `
MEDICAL IMAGING REPORT
======================

STUDY TYPE: ${getDocumentTypeLabel()}
STUDY DATE: ${patientDetails.study_date}
REPORT DATE: ${providerDetails.report_date}

PATIENT INFORMATION
-------------------
Name: ${patientDetails.patient_name}
DOB: ${patientDetails.patient_dob || 'Not provided'}
Patient ID/MRN: ${patientDetails.patient_id || 'Not provided'}
Referring Physician: ${patientDetails.referring_physician || 'Not provided'}

PROVIDER INFORMATION
--------------------
Interpreting Provider: ${providerDetails.provider_name || 'Not provided'}
NPI: ${providerDetails.provider_npi || 'Not provided'}
Facility: ${providerDetails.facility_name || 'Not provided'}
Address: ${providerDetails.facility_address || 'Not provided'}

AI-ASSISTED FINDINGS
--------------------
${aiInsights.map((insight, i) => `
${i + 1}. [${insight.category.toUpperCase()}] ${insight.description}
   Confidence: ${insight.confidence}%
   ${insight.region ? `Region: ${insight.region}` : ''}
   ${insight.clinicalSignificance ? `Clinical Significance: ${insight.clinicalSignificance}` : ''}
`).join('\n')}

CLINICAL NOTES
--------------
${clinicalNotes || 'No additional notes provided.'}

DISCLAIMER
----------
${disclaimer || 'This AI-assisted analysis is for informational purposes only and should not replace professional medical interpretation. Always consult qualified healthcare providers for clinical decisions.'}

---
Analysis Model: ${modelUsed || 'Unknown'}
Generated: ${new Date().toISOString()}
    `.trim();

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_report_${patientDetails.patient_name.replace(/\s+/g, '_')}_${patientDetails.study_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report generated and downloaded');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'finding': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'observation': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'recommendation': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
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
      case 'normal': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSignificanceColor = (significance?: string) => {
    switch (significance) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
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
          
          {/* Model Badge */}
          {modelUsed && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                {modelUsed}
              </Badge>
              {analysisComplete && (
                <Badge variant="secondary" className="text-xs">
                  {aiInsights.length} insights
                </Badge>
              )}
            </div>
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
              Uses Gemini Vision for medical image analysis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Analysis & Details */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              AI Insights
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
          
          <TabsContent value="analysis" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Clinical Insights
                </CardTitle>
                <CardDescription>
                  {analysisComplete 
                    ? `${aiInsights.length} findings from AI analysis` 
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
                  <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-3">
                      {aiInsights.map((insight, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${getCategoryColor(insight.category)}`}
                        >
                          <div className="flex items-start gap-2">
                            {getCategoryIcon(insight.category)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {insight.category}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  {insight.clinicalSignificance && (
                                    <span className={`text-xs font-medium ${getSignificanceColor(insight.clinicalSignificance)}`}>
                                      {insight.clinicalSignificance} significance
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {insight.confidence}% confidence
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm">{insight.description}</p>
                              {insight.region && (
                                <p className="text-xs text-muted-foreground mt-1">
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={generateReport}
            disabled={!patientDetails.patient_name || aiInsights.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
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
