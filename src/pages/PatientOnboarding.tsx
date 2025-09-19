import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PatientEnrollmentForm } from '@/components/patient-enrollment/PatientEnrollmentForm';
import { CollaborativeEnrollmentWorkflow } from '@/components/patient-enrollment/CollaborativeEnrollmentWorkflow';
import { PatientEnrollmentTemplateManager } from '@/components/patient-enrollment/PatientEnrollmentTemplateManager';
import { UniversalAgentConfigManager } from '@/components/agent-types/UniversalAgentConfigManager';
import { ChannelVoiceManager } from '@/components/channel-integration/ChannelVoiceManager';
import { ContextAwareEnrollmentOptions } from '@/components/context-aware-enrollment/ContextAwareEnrollmentOptions';
import { ConversationalEnrollmentSelector } from '@/components/universal-enrollment/ConversationalEnrollmentSelector';
import { EnrollmentDashboardDataManager, EnrollmentDashboardItem } from '@/components/enrollment/EnrollmentDashboardDataManager';

import { 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Plus,
  Eye,
  Calendar,
  Phone,
  Mail,
  Workflow,
  Settings,
  Mic,
  RefreshCw,
  Bot,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Shield,
  FileCheck,
  CreditCard,
  User
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SmartMCPStepwiseAgent } from '@/components/enrollment/SmartMCPStepwiseAgent';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface PatientOnboarding {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'initiated' | 'in_progress' | 'docs_pending' | 'completed' | 'on_hold';
  progress: number;
  startDate: string;
  completedSteps: number;
  totalSteps: number;
  assignedStaff: string;
  priority: 'high' | 'medium' | 'low';
  nextStep: string;
  
  // Enrollment-specific fields
  enrollmentSource?: 'mcp' | 'conversational_ai' | 'ai_structure' | 'online_form' | 'diagnostic_test';
  providerName?: string | null;
  providerNpi?: string | null;
  treatmentCenter?: string | null;
  treatmentCenterNpi?: string | null;
  providerNpiVerified?: boolean;
  treatmentCenterNpiVerified?: boolean;
  missingDocuments?: string[];
  documentCount?: number;
  requiredDocumentCount?: number;
  insuranceVerified?: boolean;
  insuranceCardUploaded?: boolean;
  consentCompleted?: boolean;
  consentMethod?: string | null;
  consentPending?: boolean;
  isActive?: boolean;
  deactivatedBy?: string | null;
  deactivationReason?: string | null;
}

interface OnboardingStats {
  total: number;
  initiated: number;
  inProgress: number;
  completed: number;
  documentsPending: number;
  onHold: number;
}

const PatientOnboarding: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new_enrollment' | 'mcp_stepwise'>('dashboard');
  const [patients, setPatients] = useState<PatientOnboarding[]>([]);
  const [onboardingStats, setOnboardingStats] = useState<OnboardingStats>({
    total: 0,
    initiated: 0,
    inProgress: 0,
    completed: 0,
    documentsPending: 0,
    onHold: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'initiated' | 'in_progress' | 'docs_pending' | 'completed' | 'on_hold'>('all');
  const [showEnrollmentOptions, setShowEnrollmentOptions] = useState(false);
  const [showAIAgentSelector, setShowAIAgentSelector] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientOnboarding | null>(null);
  
  const location = useLocation();
  const { toast } = useToast();

  // Load live data from database
  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    try {
      setIsLoading(true);
      
      // Use the new enrollment dashboard data manager
      const [enrollmentData, stats] = await Promise.all([
        EnrollmentDashboardDataManager.fetchEnrollmentData(),
        EnrollmentDashboardDataManager.fetchEnrollmentStats()
      ]);
      
      // Transform to PatientOnboarding interface format
      const transformedData: PatientOnboarding[] = enrollmentData.map(enrollment => ({
        id: enrollment.id,
        name: enrollment.patientName,
        email: enrollment.patientEmail,
        phone: enrollment.patientPhone,
        status: enrollment.status,
        priority: enrollment.priority,
        progress: enrollment.progressPercentage,
        completedSteps: Math.floor(enrollment.progressPercentage / 20), // Estimate based on 5 main sections
        totalSteps: 5,
        startDate: new Date(enrollment.createdAt).toLocaleDateString(),
        assignedStaff: enrollment.assignedStaff,
        nextStep: enrollment.nextStep,
        enrollmentSource: enrollment.enrollmentSource,
        providerName: enrollment.providerName,
        providerNpi: enrollment.providerNpi,
        treatmentCenter: enrollment.treatmentCenter,
        treatmentCenterNpi: enrollment.treatmentCenterNpi,
        providerNpiVerified: enrollment.providerNpiVerified,
        treatmentCenterNpiVerified: enrollment.treatmentCenterNpiVerified,
        missingDocuments: enrollment.missingDocuments,
        documentCount: enrollment.documentCount,
        requiredDocumentCount: enrollment.requiredDocumentCount,
        insuranceVerified: enrollment.insuranceVerified,
        insuranceCardUploaded: enrollment.insuranceCardUploaded,
        consentCompleted: enrollment.consentCompleted,
        consentMethod: enrollment.consentMethod,
        consentPending: enrollment.consentPending,
        isActive: enrollment.isActive,
        deactivatedBy: enrollment.deactivatedBy,
        deactivationReason: enrollment.deactivationReason
      }));

      setPatients(transformedData);
      setOnboardingStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load enrollment dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patients based on search and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Event handlers
  const handleNewEnrollment = () => {
    setShowEnrollmentOptions(true);
  };

  const handleAIAgentClick = () => {
    setShowAIAgentSelector(true);
  };

  const handleViewPatient = (patient: PatientOnboarding) => {
    setSelectedPatient(patient);
    // Could open a detailed view modal
  };

  const handleContinueWorkflow = (patient: PatientOnboarding) => {
    if (!patient.enrollmentSource) {
      toast({
        title: "Cannot Continue",
        description: "Unable to determine enrollment source. Please start a new enrollment.",
        variant: "destructive"
      });
      return;
    }

    const continueUrl = `/patient-onboarding?enrollment_id=${patient.id}&resume=true`;
    window.location.href = continueUrl;
  };

  const handleEditPatient = (patient: PatientOnboarding) => {
    // Navigate to edit mode
    const editUrl = `/patient-onboarding?enrollment_id=${patient.id}&mode=edit`;
    window.location.href = editUrl;
  };

  const handleDeactivatePatient = async (patient: PatientOnboarding) => {
    try {
      await EnrollmentDashboardDataManager.deactivateEnrollment(
        patient.id,
        'Deactivated from dashboard',
        'system' // TODO: Replace with actual user ID
      );
      
      toast({
        title: "Patient Deactivated",
        description: `${patient.name}'s enrollment has been deactivated.`,
      });
      
      loadLiveData(); // Refresh data
    } catch (error) {
      console.error('Error deactivating patient:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate patient enrollment.",
        variant: "destructive"
      });
    }
  };

  const handleReactivatePatient = async (patient: PatientOnboarding) => {
    try {
      await EnrollmentDashboardDataManager.reactivateEnrollment(patient.id);
      
      toast({
        title: "Patient Reactivated",
        description: `${patient.name}'s enrollment has been reactivated.`,
      });
      
      loadLiveData(); // Refresh data
    } catch (error) {
      console.error('Error reactivating patient:', error);
      toast({
        title: "Error", 
        description: "Failed to reactivate patient enrollment.",
        variant: "destructive"
      });
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    
    const sourceLabels = {
      'mcp': 'MCP Stepwise',
      'conversational_ai': 'Conversational AI',
      'ai_structure': 'AI Structure',
      'online_form': 'Online Form',
      'diagnostic_test': 'Diagnostic Test'
    };

    return (
      <Badge variant="outline" className="text-xs">
        {sourceLabels[source as keyof typeof sourceLabels] || source}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'documents_pending': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'on_hold': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  if (currentView === 'new_enrollment') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <ContextAwareEnrollmentOptions 
            onAgentSelect={() => {}}
            onTraditionalSelect={() => {}}
          />
        </div>
      </AppLayout>
    );
  }

  if (currentView === 'mcp_stepwise') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <SmartMCPStepwiseAgent
            patientId="new"
            moduleType="patient"
            enrollmentSource="mcp"
            onComplete={() => {
              setCurrentView('dashboard');
              loadLiveData();
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Onboarding Dashboard</h1>
            <p className="text-muted-foreground">
              Manage patient enrollment processes and workflows with AI agents, OCR, and online forms
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleAIAgentClick} variant="default">
              <Bot className="mr-2 h-4 w-4" />
              AI Agent
            </Button>
            <Button onClick={handleNewEnrollment} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Enrollment
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Docs Pending</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.documentsPending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.onHold}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Initiated</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.initiated}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'initiated' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('initiated')}
              size="sm"
            >
              Initiated
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('in_progress')}
              size="sm"
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'docs_pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('docs_pending')}
              size="sm"
            >
              Docs Pending
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'on_hold' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('on_hold')}
              size="sm"
            >
              On Hold
            </Button>
          </div>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Enrollments</CardTitle>
            <CardDescription>
              Manage and track patient enrollment progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading enrollment data...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No patient enrollments found. Start a new enrollment to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-6 border rounded-lg bg-card">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{patient.name}</h3>
                          {getSourceBadge(patient.enrollmentSource)}
                          <Badge variant={
                            patient.priority === 'high' ? 'destructive' :
                            patient.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {patient.priority}
                          </Badge>
                          <Badge variant={
                            patient.status === 'completed' ? 'default' :
                            patient.status === 'in_progress' ? 'secondary' :
                            patient.status === 'docs_pending' ? 'outline' :
                            'destructive'
                          }>
                            {getStatusIcon(patient.status)}
                            {patient.status.replace('_', ' ')}
                          </Badge>
                          {!patient.isActive && (
                            <Badge variant="destructive">
                              <PauseCircle className="h-3 w-3 mr-1" />
                              Deactivated
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Contact:</span>
                            <div className="text-muted-foreground">
                              <div>{patient.email}</div>
                              <div>{patient.phone}</div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Provider:</span>
                            <div className="text-muted-foreground">
                              <div>{patient.providerName || 'Not assigned'}</div>
                              <div className="flex items-center space-x-1">
                                <span>NPI: {patient.providerNpi || 'Pending'}</span>
                                {patient.providerNpiVerified && <Shield className="h-3 w-3 text-green-500" />}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Treatment Center:</span>
                            <div className="text-muted-foreground">
                              <div>{patient.treatmentCenter || 'Not assigned'}</div>
                              <div className="flex items-center space-x-1">
                                <span>NPI: {patient.treatmentCenterNpi || 'Pending'}</span>
                                {patient.treatmentCenterNpiVerified && <Shield className="h-3 w-3 text-green-500" />}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Status Summary:</span>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <FileCheck className="h-3 w-3" />
                                <span>{patient.documentCount || 0}/{patient.requiredDocumentCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="h-3 w-3" />
                                <span className={patient.insuranceVerified ? 'text-green-500' : ''}>
                                  {patient.insuranceVerified ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span className={patient.consentCompleted ? 'text-green-500' : patient.consentPending ? 'text-orange-500' : ''}>
                                  {patient.consentCompleted ? 'Complete' : patient.consentPending ? 'Pending' : 'Not Started'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Progress value={patient.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {patient.completedSteps}/{patient.totalSteps} steps ({patient.progress}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <span>Started: {patient.startDate}</span>
                            <span className="mx-2">•</span>
                            <span>Assigned: {patient.assignedStaff}</span>
                            {patient.deactivationReason && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-red-600">Reason: {patient.deactivationReason}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm">
                            <strong>Next:</strong> {patient.nextStep}
                          </p>
                        </div>

                        {patient.missingDocuments && patient.missingDocuments.length > 0 && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                            <div className="flex items-center space-x-1 text-orange-800">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">Missing Documents:</span>
                              <span>{patient.missingDocuments.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        
                        {patient.isActive ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleContinueWorkflow(patient)}
                            >
                              <Workflow className="mr-2 h-4 w-4" />
                              Continue
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivatePatient(patient)}
                            >
                              <PauseCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivatePatient(patient)}
                          >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Management Tools */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Template Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Manage Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PatientEnrollmentTemplateManager />
            </CardContent>
          </Card>
          
          {/* Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalAgentConfigManager />
            </CardContent>
          </Card>
          
          {/* Voice Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelVoiceManager />
            </CardContent>
          </Card>
        </div>

        {/* Method Selection Dialog */}
        <Dialog open={showEnrollmentOptions} onOpenChange={setShowEnrollmentOptions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Enrollment Method</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                onClick={() => {
                  setShowEnrollmentOptions(false);
                  setCurrentView('new_enrollment');
                }}
                className="h-20 text-left flex-col items-start"
              >
                <div className="font-semibold">Online Form</div>
                <div className="text-sm opacity-90">Complete enrollment using online forms</div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setShowEnrollmentOptions(false);
                  window.location.href = '/patient-onboarding?method=pdf';
                }}
                className="h-20 text-left flex-col items-start"
              >
                <div className="font-semibold">Fill & Submit PDF</div>
                <div className="text-sm opacity-90">Upload and complete PDF forms</div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setShowEnrollmentOptions(false);
                  window.location.href = '/patient-onboarding?method=ocr';
                }}
                className="h-20 text-left flex-col items-start"
              >
                <div className="font-semibold">Fill & Fax (OCR)</div>
                <div className="text-sm opacity-90">Scan and process documents with OCR</div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Agent Selector Modal */}
        <Dialog open={showAIAgentSelector} onOpenChange={setShowAIAgentSelector}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Agent Selection</DialogTitle>
            </DialogHeader>
            <ConversationalEnrollmentSelector
              moduleType="patient"
              onComplete={(result) => {
                console.log('AI Agent enrollment completed:', result);
                setShowAIAgentSelector(false);
                loadLiveData(); // Refresh the dashboard
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PatientOnboarding;