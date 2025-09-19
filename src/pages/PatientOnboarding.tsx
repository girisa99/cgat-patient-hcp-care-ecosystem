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
  Mic
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const location = useLocation();

  // Load live data from database
  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch patient enrollments with related data
      const { data: enrollments, error } = await supabase
        .from('patient_enrollments')
        .select(`
          id,
          enrollment_status,
          current_section,
          progress_percentage,
          created_at,
          updated_at,
          completed_at,
          enrollment_patient_info (
            first_name,
            last_name,
            email,
            phone
          ),
          enrollment_provider_info (
            specialty
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }

      // Transform data to match interface
      const transformedData: PatientOnboarding[] = (enrollments || []).map((enrollment: any) => {
        const patientInfo = enrollment.enrollment_patient_info;
        const providerInfo = enrollment.enrollment_provider_info;
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
          patientName: patientInfo ? `${patientInfo.first_name || ''} ${patientInfo.last_name || ''}`.trim() : 'Patient Name Pending',
          email: patientInfo?.email || 'Email pending',
          phone: patientInfo?.phone || 'Phone pending',
          status: statusMap[enrollment.enrollment_status] || 'initiated',
          progress: enrollment.progress_percentage || 0,
          startDate: new Date(enrollment.created_at).toLocaleDateString(),
          completedSteps: Math.floor((enrollment.progress_percentage || 0) / 20), // Assuming 5 total steps
          totalSteps: 5,
          assignedStaff: assignedStaffName,
          priority,
          nextStep: nextStepMap[enrollment.current_section] || 'Assessment pending'
        };
      });

      setLiveOnboarding(transformedData);

      // Calculate live stats
      const stats = {
        total: transformedData.length,
        initiated: transformedData.filter(o => o.status === 'initiated').length,
        inProgress: transformedData.filter(o => o.status === 'in_progress').length,
        documentsPending: transformedData.filter(o => o.status === 'documents_pending').length,
        completed: transformedData.filter(o => o.status === 'completed').length,
        onHold: transformedData.filter(o => o.status === 'on_hold').length
      };
      setLiveStats(stats);

    } catch (error) {
      console.error('Failed to load live enrollment data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-open New Enrollment based on navigation intent
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const flow = params.get('flow');
      const start = (location.state as any)?.startEnrollment;
      if (flow === 'ai' || flow === 'form' || start) {
        setCurrentView('new_enrollment');
      }
    } catch (e) {
      console.warn('Failed to parse navigation state/query for PatientOnboarding');
    }
  }, [location]);

  const filteredOnboarding = liveOnboarding.filter(item => {
    const matchesSearch = item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onboardingStats = liveStats;

const getStatusIcon = (status: PatientOnboarding['status']) => {
  switch (status) {
    case 'initiated': return <UserPlus className="h-4 w-4" />;
    case 'in_progress': return <Clock className="h-4 w-4" />;
    case 'documents_pending': return <FileText className="h-4 w-4" />;
    case 'completed': return <CheckCircle2 className="h-4 w-4" />;
    case 'on_hold': return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: PatientOnboarding['status']) => {
  switch (status) {
    case 'initiated': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-orange-100 text-orange-800';
    case 'documents_pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'on_hold': return 'bg-red-100 text-red-800';
  }
};

const getPriorityColor = (priority: PatientOnboarding['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
  }
};

  // Handle view switching
  const handleNewEnrollment = () => {
    setCurrentView('new_enrollment');
    setSelectedPatient(null);
  };

  const handleViewWorkflow = (patient: PatientOnboarding) => {
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
            onSubmit={(data) => {
              console.log('Enrollment completed:', data);
              toast.success('Patient enrollment completed successfully!');
              handleBackToList();
              loadLiveData(); // Refresh the list
            }}
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
              firstName: selectedPatient.patientName.split(' ')[0],
              lastName: selectedPatient.patientName.split(' ')[1] || '',
              email: selectedPatient.email,
              phone: selectedPatient.phone
            }}
            submissionMethod="online"
            onWorkflowComplete={handleBackToList}
            currentUserRole="intake_coordinator"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Patient Onboarding">
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Onboarding</h1>
            <p className="text-muted-foreground">
              Start new patient enrollment process
            </p>
          </div>
          <Button onClick={handleNewEnrollment}>
            <Plus className="mr-2 h-4 w-4" />
            New Patient Enrollment
          </Button>
        </div>


        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Initiated</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.initiated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Docs Pending</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.documentsPending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.onHold}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by patient name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Status</option>
                <option value="initiated">Initiated</option>
                <option value="in_progress">In Progress</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding List */}
        <div className="grid gap-4">
          {filteredOnboarding.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle className="text-lg">{item.patientName}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started: {item.startDate}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress: {item.completedSteps}/{item.totalSteps} steps</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Assigned Staff:</span> {item.assignedStaff}</p>
                      <p><span className="font-medium">Next Step:</span> {item.nextStep}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => handleViewWorkflow(item)}>
                        Continue Workflow
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOnboarding.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No patient onboarding records match your filters.' 
                  : 'No patient onboarding records found. Create your first enrollment to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button className="mt-4" onClick={handleNewEnrollment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Enrollment
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Loading enrollment data...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}