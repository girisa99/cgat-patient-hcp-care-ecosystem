import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PatientEnrollmentForm } from '@/components/patient-enrollment/PatientEnrollmentForm';
import { EnhancedEnrollmentInterface } from '@/components/patient-enrollment/EnhancedEnrollmentInterface';
import { CollaborativeEnrollmentWorkflow } from '@/components/patient-enrollment/CollaborativeEnrollmentWorkflow';
import { PatientEnrollmentTemplateManager } from '@/components/patient-enrollment/PatientEnrollmentTemplateManager';
import { UniversalAgentConfigManager } from '@/components/agent-types/UniversalAgentConfigManager';
import { ChannelVoiceManager } from '@/components/channel-integration/ChannelVoiceManager';
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
import { PageEnrollmentIntegration } from '@/components/page-integration/PageEnrollmentIntegration';
import { toast } from 'sonner';

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

const mockOnboarding: PatientOnboarding[] = [
  {
    id: 'ONB-001',
    patientName: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '(555) 123-4567',
    status: 'in_progress',
    progress: 60,
    startDate: '2024-01-15',
    completedSteps: 3,
    totalSteps: 5,
    assignedStaff: 'Dr. Smith',
    priority: 'high',
    nextStep: 'Medical History Review'
  },
  {
    id: 'ONB-002',
    patientName: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    status: 'documents_pending',
    progress: 40,
    startDate: '2024-01-14',
    completedSteps: 2,
    totalSteps: 5,
    assignedStaff: 'Nurse Johnson',
    priority: 'medium',
    nextStep: 'Insurance Verification'
  },
  {
    id: 'ONB-003',
    patientName: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '(555) 345-6789',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-10',
    completedSteps: 5,
    totalSteps: 5,
    assignedStaff: 'Dr. Anderson',
    priority: 'low',
    nextStep: 'Treatment Planning'
  }
];

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

export default function PatientOnboarding() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'new_enrollment' | 'workflow' | 'templates' | 'agent_config' | 'voice_channels'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientOnboarding | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<string>('');
  const [channelData, setChannelData] = useState<Record<string, any>>({});

  const filteredOnboarding = mockOnboarding.filter(item => {
    const matchesSearch = item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onboardingStats = {
    total: mockOnboarding.length,
    initiated: mockOnboarding.filter(o => o.status === 'initiated').length,
    inProgress: mockOnboarding.filter(o => o.status === 'in_progress').length,
    documentsPending: mockOnboarding.filter(o => o.status === 'documents_pending').length,
    completed: mockOnboarding.filter(o => o.status === 'completed').length,
    onHold: mockOnboarding.filter(o => o.status === 'on_hold').length
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

  // Render different views based on current state
  if (currentView === 'new_enrollment') {
    return (
      <AppLayout title="Enhanced Patient Enrollment">
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Enhanced Patient Enrollment</h1>
              <p className="text-muted-foreground">
                AI-powered conversational enrollment with automatic data capture and audit trails
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          </div>

          <EnhancedEnrollmentInterface
            onSubmit={(data) => {
              console.log('Enhanced enrollment submitted:', data);
              toast.success('Enrollment completed successfully with conversation history stored');
              handleBackToList();
            }}
          />
        </div>
      </AppLayout>
    );
  }

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
              Manage patient enrollment and onboarding processes with collaborative workflows
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleViewTemplates}>
              <Workflow className="mr-2 h-4 w-4" />
              Workflow Templates
            </Button>
            <Button variant="outline" onClick={handleViewAgentConfig}>
              <Settings className="mr-2 h-4 w-4" />
              Agent Configuration
            </Button>
            <Button variant="outline" onClick={handleViewVoiceChannels}>
              <Mic className="mr-2 h-4 w-4" />
              Voice Channels
            </Button>
            <Button onClick={handleNewEnrollment}>
              <Plus className="mr-2 h-4 w-4" />
              New Patient Enrollment
            </Button>
          </div>
        </div>

        {/* AI Enrollment Integration */}
        <PageEnrollmentIntegration variant="banner" />

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

        {filteredOnboarding.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No patient onboarding records found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}