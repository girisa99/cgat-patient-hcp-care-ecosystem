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
  Bot
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SmartMCPStepwiseAgent } from '@/components/enrollment/SmartMCPStepwiseAgent';
import { v4 as uuidv4 } from 'uuid';

interface PatientOnboarding {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  status: 'initiated' | 'in_progress' | 'documents_pending' | 'completed' | 'on_hold';
  progress: number;
  startDate: string;
  completedSteps: number;
  totalSteps: number;
  assignedStaff: string;
  priority: 'low' | 'medium' | 'high';
  nextStep: string;
}

export default function PatientOnboarding() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  
  // Live data state - moved inside component
  const [liveOnboarding, setLiveOnboarding] = useState<PatientOnboarding[]>([]);
  const [liveStats, setLiveStats] = useState({
    total: 0,
    initiated: 0,
    inProgress: 0,
    documentsPending: 0,
    completed: 0,
    onHold: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'new_enrollment' | 'workflow' | 'templates' | 'agent_config' | 'voice_channels'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientOnboarding | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<string>('');
  const [channelData, setChannelData] = useState<Record<string, any>>({});
  const [showAIAgentSelector, setShowAIAgentSelector] = useState(false);
  const [showEnrollmentOptions, setShowEnrollmentOptions] = useState(false);
  const location = useLocation();
  // Method selection
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<string | null>(null);

  // Load live data from database
  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch enrollments only (no nested selects to avoid schema mismatch)
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('patient_enrollments')
        .select(`id, enrollment_status, current_section, progress_percentage, created_at, updated_at, completed_at`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        return;
      }

      const ids = (enrollments || []).map((e: any) => e.id);

      // Fetch patient info in bulk
      const { data: patientInfos } = ids.length
        ? await supabase
            .from('enrollment_patient_info')
            .select('enrollment_id, first_name, last_name, email, phone')
            .in('enrollment_id', ids)
        : { data: [], error: null } as any;

      // Fetch provider info in bulk (select all available fields to avoid column errors)
      const { data: providerInfos } = ids.length
        ? await supabase
            .from('enrollment_provider_info')
            .select('*')
            .in('enrollment_id', ids)
        : { data: [], error: null } as any;

      const patientInfoMap = Object.fromEntries((patientInfos || []).map((p: any) => [p.enrollment_id, p]));
      const providerInfoMap = Object.fromEntries((providerInfos || []).map((p: any) => [p.enrollment_id, p]));

      // Transform data to match interface
      const transformedData: PatientOnboarding[] = (enrollments || []).map((enrollment: any) => {
        const patientInfo = patientInfoMap[enrollment.id];
        const providerInfo = providerInfoMap[enrollment.id];
        const assignedStaffName = 'Unassigned';
        
        // Map enrollment status to UI status
        const statusMap: Record<string, PatientOnboarding['status']> = {
          'initiated': 'initiated',
          'in_progress': 'in_progress',
          'docs_pending': 'documents_pending',
          'completed': 'completed',
          'on_hold': 'on_hold'
        };

        // Determine priority based on progress and time
        const daysSinceCreated = Math.floor((Date.now() - new Date(enrollment.created_at).getTime()) / (1000 * 60 * 60 * 24));
        let priority: PatientOnboarding['priority'] = 'medium';
        if (enrollment.progress_percentage < 30 && daysSinceCreated > 3) priority = 'high';
        else if (enrollment.progress_percentage > 70) priority = 'low';

        // Determine next step based on current section
        const nextStepMap: Record<string, string> = {
          'consent_management': 'Patient Information Collection',
          'patient_information': 'Provider & Treatment Details',
          'provider_treatment': 'Insurance Verification',
          'insurance_information': 'Clinical Assessment',
          'clinical_treatment': 'Final Review & Submission',
          'submit': 'Enrollment Complete'
        };

        return {
          id: enrollment.id,
          patientName: patientInfo ? `${patientInfo.first_name || 'Patient'} ${patientInfo.last_name || 'Name Pending'}` : 'Patient Name Pending',
          email: patientInfo?.email || 'Email pending',
          phone: patientInfo?.phone || 'Phone pending',
          status: statusMap[enrollment.enrollment_status] || 'initiated',
          progress: enrollment.progress_percentage || 0,
          startDate: new Date(enrollment.created_at).toLocaleDateString(),
          completedSteps: Math.floor((enrollment.progress_percentage || 0) / 20), // Assuming 5 steps total
          totalSteps: 5,
          assignedStaff: assignedStaffName,
          priority,
          nextStep: nextStepMap[enrollment.current_section] || 'Assessment pending'
        };
      });

      setLiveOnboarding(transformedData);

      // Calculate stats
      const stats = {
        total: transformedData.length,
        initiated: transformedData.filter(p => p.status === 'initiated').length,
        inProgress: transformedData.filter(p => p.status === 'in_progress').length,
        documentsPending: transformedData.filter(p => p.status === 'documents_pending').length,
        completed: transformedData.filter(p => p.status === 'completed').length,
        onHold: transformedData.filter(p => p.status === 'on_hold').length,
      };
      setLiveStats(stats);

    } catch (error) {
      console.error('Error loading live data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patients based on search and status
  const filteredOnboarding = liveOnboarding.filter((patient) => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats for display
  const onboardingStats = liveStats;

  // Event handlers
  const handleNewEnrollment = () => {
    setShowEnrollmentOptions(true);
  };

  const handleAIAgentClick = () => {
    setShowAIAgentSelector(true);
  };

  const handleAgentSelect = (moduleType: string) => {
    console.log('AI Agent selected for module:', moduleType);
    setShowAIAgentSelector(false);
  };

  const handleTraditionalSelect = (option: string) => {
    console.log('Traditional option selected:', option);
    setShowEnrollmentOptions(false);
    if (option === 'online-form') {
      setCurrentView('new_enrollment');
    }
  };

  const handleViewPatient = (patient: PatientOnboarding) => {
    console.log('View patient:', patient);
    // Add view logic here
    toast.info(`Viewing details for ${patient.patientName}`);
  };

  const handleContinueWorkflow = (patient: PatientOnboarding) => {
    setSelectedPatient(patient);
    setCurrentView('workflow');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPatient(null);
    loadLiveData(); // Refresh data when returning to list
  };

  const handleViewTemplates = () => {
    setCurrentView('templates');
  };

  const handleViewAgentConfig = () => {
    setCurrentView('agent_config');
  };

  const handleViewVoiceChannels = () => {
    setCurrentView('voice_channels');
  };

  if (currentView === 'templates') {
    return (
      <AppLayout title="Enrollment Templates">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Enrollment Templates & Workflows</h1>
              <p className="text-muted-foreground">
                Manage workflow templates with visualization for all agent types
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <PatientEnrollmentTemplateManager
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
              toast.success('Template ready for deployment');
            }}
          />
        </div>
      </AppLayout>
    );
  }

  if (currentView === 'voice_channels') {
    return (
      <AppLayout title="Voice Channel Management">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Voice Channel Management</h1>
              <p className="text-muted-foreground">
                Manage voice interactions across all channels with ElevenLabs and Hugging Face integration
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <ChannelVoiceManager
            onChannelData={(channel, data) => {
              setChannelData(prev => ({
                ...prev,
                [channel]: data
              }));
              console.log('Channel data updated:', channel, data);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  if (currentView === 'agent_config') {
    return (
      <AppLayout title="Agent Configuration">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Universal Agent Configuration</h1>
              <p className="text-muted-foreground">
                Configure conversational AI, audit trails, and deployment for all agent types
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <UniversalAgentConfigManager
            selectedAgentType={selectedAgentType}
            onAgentTypeSelect={(agentType) => {
              setSelectedAgentType(agentType.id);
              console.log('Agent type selected:', agentType);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  if (currentView === 'new_enrollment') {
    return (
      <AppLayout title="New Patient Enrollment">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Patient Enrollment</h1>
              <p className="text-muted-foreground">
                Complete the enrollment process for a new patient
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <PatientEnrollmentForm
            channelType="online"
          />
        </div>
      </AppLayout>
    );
  }

  if (currentView === 'workflow' && selectedPatient) {
    return (
      <AppLayout title="Enrollment Workflow">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Collaborative Enrollment Workflow</h1>
              <p className="text-muted-foreground">
                Patient: {selectedPatient.patientName} (ID: {selectedPatient.id})
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <CollaborativeEnrollmentWorkflow
            enrollmentId={selectedPatient.id}
            patientData={{
              patientName: selectedPatient.patientName,
              email: selectedPatient.email,
              phone: selectedPatient.phone
            }}
            submissionMethod="online"
            currentUserRole="intake_coordinator"
          />
        </div>
      </AppLayout>
    );
  }

  // Main dashboard view with integrated patient management
  return (
    <AppLayout title="Patient Onboarding & Management">
      <div className="flex-1 space-y-6 p-4 md:p-6">
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
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('in_progress')}
              size="sm"
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'documents_pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('documents_pending')}
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
          </div>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Enrollment Status</CardTitle>
            <CardDescription>
              Track and manage patient onboarding progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading enrollment data...</div>
            ) : filteredOnboarding.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No patients found matching the current filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOnboarding.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{patient.patientName}</h3>
                        <Badge variant={
                          patient.priority === 'high' ? 'destructive' :
                          patient.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {patient.priority}
                        </Badge>
                        <Badge variant={
                          patient.status === 'completed' ? 'default' :
                          patient.status === 'in_progress' ? 'secondary' :
                          patient.status === 'documents_pending' ? 'outline' :
                          'destructive'
                        }>
                          {patient.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{patient.email}</span>
                        <span>{patient.phone}</span>
                        <span>Started: {patient.startDate}</span>
                        <span>Assigned: {patient.assignedStaff}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={patient.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground">
                          {patient.completedSteps}/{patient.totalSteps} steps ({patient.progress}%)
                        </span>
                      </div>
                      <p className="text-sm">
                        <strong>Next:</strong> {patient.nextStep}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleContinueWorkflow(patient)}
                      >
                        <Workflow className="mr-2 h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Method Selection Dialog */}
        <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Enrollment Method</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                onClick={() => {
                  setShowMethodDialog(false);
                  setCurrentView('new_enrollment');
                }}
                className="h-20 text-left flex-col items-start"
              >
                <div className="font-semibold">Standard Form Enrollment</div>
                <div className="text-sm opacity-90">Complete enrollment using our standard form interface</div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setShowMethodDialog(false);
                  // Navigate to AI-powered enrollment
                  window.location.href = '/patient-onboarding?method=ai';
                }}
                className="h-20 text-left flex-col items-start"
              >
                <div className="font-semibold">AI-Powered Enrollment</div>
                <div className="text-sm opacity-90">Let our AI guide the enrollment process</div>
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

        {/* Enrollment Options Modal */}
        <Dialog open={showEnrollmentOptions} onOpenChange={setShowEnrollmentOptions}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enrollment Options</DialogTitle>
            </DialogHeader>
            <ContextAwareEnrollmentOptions
              onAgentSelect={handleAgentSelect}
              onTraditionalSelect={handleTraditionalSelect}
            />
          </DialogContent>
        </Dialog>

        {/* Additional Action Buttons */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleViewTemplates}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
            <Button variant="outline" onClick={handleViewAgentConfig}>
              <Settings className="mr-2 h-4 w-4" />
              Agent Configuration
            </Button>
            <Button variant="outline" onClick={handleViewVoiceChannels}>
              <Mic className="mr-2 h-4 w-4" />
              Voice Channels
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}