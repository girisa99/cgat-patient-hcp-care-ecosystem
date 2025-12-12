/**
 * Document Processing Page
 * Comprehensive OCR, medication processing, and data extraction functionality
 * Works across patient onboarding, order management, treatment centers, and customer onboarding
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileSearch, 
  Upload, 
  Pill, 
  FileText, 
  Table2, 
  PenTool, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Bot,
  Settings,
  History,
  Download,
  RefreshCcw,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Building2,
  Users,
  ShoppingCart,
  UserCheck,
  Brain,
  Activity
} from 'lucide-react';
import { DocumentUploadProcessor } from '@/components/document-processing';
import { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
import { toast } from 'sonner';

// Context types for different workflows
type WorkflowContext = 'patient-onboarding' | 'order-management' | 'treatment-center' | 'customer-onboarding' | 'general';

interface DocumentProcessingProps {
  initialContext?: WorkflowContext;
}

const WORKFLOW_CONFIGS: Record<WorkflowContext, {
  title: string;
  icon: React.ReactNode;
  description: string;
  targetFields: { key: string; label: string; required?: boolean }[];
  documentTypes: string[];
}> = {
  'patient-onboarding': {
    title: 'Patient Onboarding',
    icon: <UserCheck className="h-5 w-5" />,
    description: 'Process patient enrollment documents, prescriptions, and consent forms',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'dob', label: 'Date of Birth', required: true },
      { key: 'insurance_id', label: 'Insurance ID' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'medication', label: 'Medication', required: true },
      { key: 'dosage', label: 'Dosage', required: true },
      { key: 'frequency', label: 'Frequency', required: true },
      { key: 'prescriber_npi', label: 'Prescriber NPI' },
      { key: 'consent_signed', label: 'Consent Signed' }
    ],
    documentTypes: ['Prescription', 'Lab Results', 'Consent Form', 'Insurance Card', 'Prior Authorization']
  },
  'order-management': {
    title: 'Order Management',
    icon: <ShoppingCart className="h-5 w-5" />,
    description: 'Process prescription orders, refills, and medication dispensing',
    targetFields: [
      { key: 'medication', label: 'Medication', required: true },
      { key: 'ndc', label: 'NDC Code', required: true },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'days_supply', label: 'Days Supply', required: true },
      { key: 'refills', label: 'Refills' },
      { key: 'prescriber', label: 'Prescriber' },
      { key: 'pharmacy', label: 'Pharmacy' },
      { key: 'sig', label: 'Sig/Instructions' }
    ],
    documentTypes: ['Prescription', 'Refill Request', 'Transfer Request', 'Prior Auth', 'Hospital Discharge']
  },
  'treatment-center': {
    title: 'Treatment Center Onboarding',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Process facility credentials, licenses, and compliance documents',
    targetFields: [
      { key: 'facility_name', label: 'Facility Name', required: true },
      { key: 'license_number', label: 'License Number', required: true },
      { key: 'dea_number', label: 'DEA Number' },
      { key: 'npi', label: 'NPI', required: true },
      { key: 'accreditation', label: 'Accreditation' },
      { key: 'address', label: 'Address', required: true },
      { key: 'contact_name', label: 'Contact Name' },
      { key: 'phone', label: 'Phone' }
    ],
    documentTypes: ['License', 'DEA Registration', 'Insurance Certificate', 'Accreditation', 'Contract']
  },
  'customer-onboarding': {
    title: 'Customer Onboarding',
    icon: <Users className="h-5 w-5" />,
    description: 'Process customer registration and verification documents',
    targetFields: [
      { key: 'company_name', label: 'Company Name', required: true },
      { key: 'tax_id', label: 'Tax ID', required: true },
      { key: 'contact_name', label: 'Contact Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'credit_terms', label: 'Credit Terms' }
    ],
    documentTypes: ['Business License', 'W-9', 'Credit Application', 'Contract', 'Insurance Certificate']
  },
  'general': {
    title: 'General Document Processing',
    icon: <FileSearch className="h-5 w-5" />,
    description: 'Process any document type with OCR and data extraction',
    targetFields: [
      { key: 'document_type', label: 'Document Type' },
      { key: 'extracted_text', label: 'Extracted Text' },
      { key: 'entities', label: 'Entities' },
      { key: 'tables', label: 'Tables' }
    ],
    documentTypes: ['Any']
  }
};

export default function DocumentProcessing({ initialContext = 'general' }: DocumentProcessingProps) {
  const [activeContext, setActiveContext] = useState<WorkflowContext>(initialContext);
  const [activeTab, setActiveTab] = useState('upload');
  const [enableMedicationCalc, setEnableMedicationCalc] = useState(true);
  const [enableNDCMatching, setEnableNDCMatching] = useState(true);
  const [enableRecommendations, setEnableRecommendations] = useState(true);
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);
  
  const { analyzePrescription, isProcessing } = useMedicationProcessing();
  
  const currentConfig = WORKFLOW_CONFIGS[activeContext];

  const handleDocumentProcessed = (result: any) => {
    setProcessedDocuments(prev => [result, ...prev]);
    toast.success('Document processed successfully');
  };

  const handleConnectAgent = () => {
    toast.info('Opening agent connection wizard...');
    // Navigate to agents or open modal
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Document Processing</h1>
            <p className="text-muted-foreground">OCR, data extraction, medication processing & form mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleConnectAgent}>
            <Bot className="h-4 w-4 mr-2" />
            Connect Agent
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Workflow Context Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Workflow Context</CardTitle>
          <CardDescription>Select the context to customize document processing for your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(WORKFLOW_CONFIGS) as WorkflowContext[]).map((context) => {
              const config = WORKFLOW_CONFIGS[context];
              return (
                <Button
                  key={context}
                  variant={activeContext === context ? 'default' : 'outline'}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveContext(context)}
                >
                  {config.icon}
                  <span className="text-xs text-center">{config.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Context Banner */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentConfig.icon}
              <div>
                <h3 className="font-semibold">{currentConfig.title}</h3>
                <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{currentConfig.documentTypes.length} Document Types</Badge>
              <Badge variant="secondary">{currentConfig.targetFields.length} Target Fields</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Process
          </TabsTrigger>
          <TabsTrigger value="medication" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medication
          </TabsTrigger>
          <TabsTrigger value="extraction" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Data Extraction
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Upload & Process Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DocumentUploadProcessor
                targetFormFields={currentConfig.targetFields.map(f => f.key)}
                onFormMappingComplete={(mapping) => {
                  handleDocumentProcessed(mapping);
                }}
              />
            </div>
            
            {/* Processing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ocr">Enable OCR</Label>
                  <Switch id="ocr" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="handwriting">Handwriting Recognition</Label>
                  <Switch id="handwriting" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tables">Table Extraction</Label>
                  <Switch id="tables" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="signatures">Signature Detection</Label>
                  <Switch id="signatures" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="medication-calc">Medication Calculations</Label>
                  <Switch 
                    id="medication-calc" 
                    checked={enableMedicationCalc}
                    onCheckedChange={setEnableMedicationCalc}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ndc-match">NDC/DIN Matching</Label>
                  <Switch 
                    id="ndc-match" 
                    checked={enableNDCMatching}
                    onCheckedChange={setEnableNDCMatching}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="recommendations">Clinical Recommendations</Label>
                  <Switch 
                    id="recommendations" 
                    checked={enableRecommendations}
                    onCheckedChange={setEnableRecommendations}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Document Type Filter</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {currentConfig.documentTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Input type="number" defaultValue="0.85" min="0" max="1" step="0.05" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medication Tab */}
        <TabsContent value="medication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medication Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medication Quantity Calculator
                </CardTitle>
                <CardDescription>
                  Auto-calculate quantity and days supply from prescription instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Drug Name</Label>
                    <Input placeholder="e.g., Metformin 500mg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sig/Instructions</Label>
                    <Input placeholder="e.g., Take 1 tablet BID for 90 days" />
                  </div>
                </div>
                
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">180</p>
                        <p className="text-sm text-muted-foreground">Total Quantity</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">90</p>
                        <p className="text-sm text-muted-foreground">Days Supply</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">2</p>
                        <p className="text-sm text-muted-foreground">Daily Dose</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Calculate from Document
                </Button>
              </CardContent>
            </Card>

            {/* NDC/DIN Matcher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  NDC/DIN Code Matcher
                </CardTitle>
                <CardDescription>
                  Match medication orders to American (NDC) and Canadian (DIN) codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Medication</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter drug name or code..." />
                    <Button variant="secondary">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-2">
                    {[
                      { code: '02167786', name: 'APO-Metformin 500mg', type: 'DIN' },
                      { code: '02380196', name: 'JAMP-Metformin 500mg', type: 'DIN' },
                      { code: '02242974', name: 'RATIO-Metformin 500mg', type: 'DIN' },
                      { code: '02257726', name: 'TEVA-Metformin 500mg', type: 'DIN' },
                      { code: '0123-4567-89', name: 'Generic Metformin 500mg', type: 'NDC' },
                    ].map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.type}: {med.code}</p>
                        </div>
                        <Badge variant={med.type === 'NDC' ? 'default' : 'secondary'}>
                          {med.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Clinical Recommendations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Clinical Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered medication safety checks and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Dose Too Low</p>
                          <p className="text-sm text-muted-foreground">
                            Increase Dalteparin to 15,000 SC daily for 5 days with Warfarin
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Ineffective Drug</p>
                          <p className="text-sm text-muted-foreground">
                            Levofloxacin 750 mg PO daily for 5 days may not be effective
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Contraindication</p>
                          <p className="text-sm text-muted-foreground">
                            Calcium carbonate - Risk of heart block
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Stock Check */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Inventory & Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Metoprolol 50mg BID for 90 days</p>
                    <p className="text-sm text-muted-foreground">Disp Qty = 180 tablets</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-yellow-600">On Hand = 100 tablets</p>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600">Low Stock</Badge>
                    </div>
                    <Button variant="outline">View Alternatives</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Extraction Tab */}
        <TabsContent value="extraction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Fields</CardTitle>
                <CardDescription>Fields to extract for {currentConfig.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentConfig.targetFields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.label}</span>
                        {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                      <Input className="w-48" placeholder="Extracted value..." />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Tables</CardTitle>
                <CardDescription>Tables detected in uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">Qty</th>
                        <th className="p-2 text-left">Days</th>
                        <th className="p-2 text-left">NDC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">Apo-Lansoprazole 15mg</td>
                        <td className="p-2">28</td>
                        <td className="p-2">28</td>
                        <td className="p-2">0123-4567-89</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>Review and verify extracted data before submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5 border-green-500/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">High Confidence Fields</p>
                      <p className="text-sm text-muted-foreground">8 fields verified with confidence &gt; 95%</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-500/5 border-yellow-500/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Review Required</p>
                      <p className="text-sm text-muted-foreground">2 fields need manual verification</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Document AI Agent
                </CardTitle>
                <CardDescription>Connect to workflow agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect a document processing agent to automate your workflow
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>Pre-built document processing nodes for your agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'OCR Processor', desc: 'Text extraction from images' },
                    { name: 'Medication Parser', desc: 'Drug name & dosage extraction' },
                    { name: 'NDC/DIN Matcher', desc: 'Drug code matching' },
                    { name: 'Table Extractor', desc: 'Structured data extraction' },
                    { name: 'Signature Detector', desc: 'Signature validation' },
                    { name: 'Form Mapper', desc: 'Auto-fill form fields' }
                  ].map((node, i) => (
                    <div key={i} className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                      <p className="font-medium">{node.name}</p>
                      <p className="text-sm text-muted-foreground">{node.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Processing History</CardTitle>
                  <CardDescription>Recent document processing jobs</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {processedDocuments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents processed yet</p>
                  <p className="text-sm">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {processedDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.fileName || 'Document'}</p>
                          <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
