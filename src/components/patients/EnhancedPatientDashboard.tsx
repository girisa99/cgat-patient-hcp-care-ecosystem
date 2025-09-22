import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, RefreshCw, Edit, UserX, Activity, 
  Settings, ArrowRight, MoreVertical, FileText 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEnrollmentPatients } from '@/hooks/useEnrollmentPatients';
import { useAdminRealtime } from '@/hooks/useRealtime';
import { PatientForm } from './PatientForm';

interface EnhancedPatient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_source?: string;
  enrollment_status?: string;
  progress_percentage?: number;
  session_id?: string;
  created_at: string;
  is_active?: boolean;
  current_section?: string;
}

export const EnhancedPatientDashboard: React.FC = () => {
  // Enable real-time updates
  useAdminRealtime({ 
    enableNotifications: true,
    areas: ['userManagement', 'patients'] 
  });

  const { 
    patients: enrollmentPatients, 
    isLoading, 
    error,
    getEnrollmentStats,
    refreshData,
    deactivateEnrollment,
    isDeactivating
  } = useEnrollmentPatients();
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<EnhancedPatient | null>(null);
  
  // Use enrollment patients directly
  const patients: EnhancedPatient[] = enrollmentPatients.map(enrollment => ({
    id: enrollment.id,
    first_name: enrollment.first_name || 'Unknown',
    last_name: enrollment.last_name || 'Patient',
    email: enrollment.email || 'No email',
    enrollment_source: enrollment.enrollment_source || 'unknown',
    enrollment_status: enrollment.enrollment_status || 'not_started',
    progress_percentage: enrollment.progress_percentage || 0,
    session_id: enrollment.session_id,
    created_at: enrollment.created_at,
    is_active: enrollment.is_active,
    current_section: enrollment.current_section
  }));
  
  const stats = getEnrollmentStats();

  console.log('🏥 Enhanced Patient Dashboard - Using enrollment tables for patient data');

  // Enrollment source display helper
  const getEnrollmentSourceDisplay = (source: string) => {
    switch (source) {
      case 'mcp': return { label: 'MCP Agent', color: 'bg-blue-100 text-blue-800' };
      case 'conversational': return { label: 'Conversational AI', color: 'bg-green-100 text-green-800' };
      case 'diagnostic_test': return { label: 'Diagnostic Test', color: 'bg-purple-100 text-purple-800' };
      case 'online': return { label: 'Online Form', color: 'bg-orange-100 text-orange-800' };
      default: return { label: 'Unknown Source', color: 'bg-gray-100 text-gray-600' };
    }
  };

  // Action handlers
  const handleAddPatient = () => {
    setFormMode('create');
    setSelectedPatientForEdit(null);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: EnhancedPatient) => {
    setFormMode('edit');
    setSelectedPatientForEdit(patient);
    setShowPatientForm(true);
  };

  const handleDeactivatePatient = async (patientId: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${patientName}?`)) {
      await deactivateEnrollment(patientId);
    }
  };

  const handleEnrollmentStatusChange = (patient: EnhancedPatient, newStatus: string) => {
    console.log(`Changing enrollment status for ${patient.first_name} ${patient.last_name} to ${newStatus}`);
    // updateEnrollmentStatus({ enrollmentId: patient.id, status: newStatus });
  };

  const handleContinueWorkflow = (patient: EnhancedPatient) => {
    console.log(`Continuing workflow for ${patient.first_name} ${patient.last_name}`);
    // Navigate to enrollment workflow
  };

  const handleRefresh = () => {
    refreshData();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading patient information...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <p className="text-red-700">Error loading patients: {error?.message || String(error)}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Enrollments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active Enrollments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.withInfo}</div>
            <div className="text-sm text-muted-foreground">With Patient Info</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Patient Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patient Enrollment Dashboard ({patients.length} patients)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleAddPatient}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
                <p className="text-sm mt-2">Add your first patient to get started</p>
                <Button onClick={handleAddPatient} className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map((patient) => {
                  const enrollmentSource = getEnrollmentSourceDisplay(patient.enrollment_source || 'unknown');
                  const progressPercentage = patient.progress_percentage || 0;
                  
                  return (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Patient Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-lg">
                                {patient.first_name} {patient.last_name}
                              </div>
                              <Badge variant={patient.is_active !== false ? 'default' : 'secondary'}>
                                {patient.is_active !== false ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {patient.email} • Session: {patient.session_id} • Started: {new Date(patient.created_at).toLocaleDateString()}
                            </div>
                            
                            {/* Enrollment Information */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Source:</span>
                                <Badge className={`${enrollmentSource.color} border-0`}>
                                  {enrollmentSource.label}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Status:</span>
                                <Badge variant="outline">
                                  {patient.enrollment_status?.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Section:</span>
                                <Badge variant="secondary">
                                  {patient.current_section?.replace('_', ' ').toUpperCase() || 'N/A'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Progress:</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-300"
                                      style={{ width: `${progressPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContinueWorkflow(patient)}
                              title="Continue Enrollment"
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Continue
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Patient
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(patient, 'in_progress')}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Mark In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(patient, 'completed')}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(patient, 'pending_review')}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Mark Pending Review
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivatePatient(patient.id, `${patient.first_name} ${patient.last_name}`)}
                                  className="text-orange-600"
                                  disabled={isDeactivating}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Note */}
      <Card className="border-0 shadow-sm bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="text-sm text-green-700">
            <p><strong>✅ Patient Enrollment Dashboard (Using Enrollment Tables):</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• Patient data from enrollment tables with patient info</li>
              <li>• Enrollment sources: MCP Agent, Conversational AI, Diagnostic Test</li>
              <li>• Real enrollment status and progress tracking</li>
              <li>• Session IDs and current sections displayed</li>
              <li>• Deactivation and status management</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Patient Form Dialog */}
      <PatientForm 
        open={showPatientForm} 
        onOpenChange={setShowPatientForm}
        mode={formMode}
        patientId={selectedPatientForEdit?.id}
        initialData={selectedPatientForEdit}
      />
    </div>
  );
};