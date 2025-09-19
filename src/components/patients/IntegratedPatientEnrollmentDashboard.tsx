import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, UserPlus, RefreshCw, Edit, UserX, Activity, 
  ArrowRight, MoreVertical, FileText, Database, AlertTriangle,
  CheckCircle, Clock, Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useAdminRealtime } from '@/hooks/useRealtime';
import { PatientForm } from './PatientForm';
import { toast } from 'sonner';

interface EnrollmentPatient {
  id: string;
  enrollment_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  enrollment_status: string;
  enrollment_type?: string;
  progress_percentage: number;
  created_at: string;
  source: 'enrollment' | 'profiles';
  is_synced: boolean;
}

export const IntegratedPatientEnrollmentDashboard: React.FC = () => {
  // Enable real-time updates
  useAdminRealtime({ 
    enableNotifications: true,
    areas: ['userManagement', 'patients', 'enrollment'] 
  });

  const { 
    users, 
    isLoading: usersLoading, 
    refreshData: refreshUsers,
    createUser
  } = useMasterUserManagement();
  
  const [enrollmentPatients, setEnrollmentPatients] = useState<EnrollmentPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'profiles' | 'enrollment' | 'unsynced'>('all');
  
  // Load enrollment data
  const loadEnrollmentData = async () => {
    try {
      setIsLoading(true);
      
      // Get enrollment patient data
      const { data: enrollmentData, error } = await supabase
        .from('enrollment_patient_info')
        .select(`
          id,
          enrollment_id,
          first_name,
          last_name,
          email,
          phone,
          created_at
        `);
      
      if (error) {
        console.error('Error fetching enrollment data:', error);
        return;
      }

      // Get enrollment status data
      const enrollmentIds = enrollmentData?.map(e => e.enrollment_id) || [];
      const { data: enrollmentStatus } = enrollmentIds.length > 0 
        ? await supabase
            .from('patient_enrollments')
            .select('id, enrollment_status, progress_percentage')
            .in('id', enrollmentIds)
        : { data: [] };

      const statusMap = new Map((enrollmentStatus || []).map((s: any) => [s.id, s]));

      // Transform enrollment data
      const transformedEnrollmentData: EnrollmentPatient[] = (enrollmentData || []).map(patient => {
        const status = statusMap.get(patient.enrollment_id) as any;
        return {
          id: patient.id,
          enrollment_id: patient.enrollment_id,
          first_name: patient.first_name || 'Name',
          last_name: patient.last_name || 'Pending',
          email: patient.email,
          phone: patient.phone,
          enrollment_status: status?.enrollment_status || 'initiated',
          enrollment_type: 'enrollment_form',
          progress_percentage: status?.progress_percentage || 0,
          created_at: patient.created_at,
          source: 'enrollment',
          is_synced: false // Check if exists in profiles
        };
      });

      setEnrollmentPatients(transformedEnrollmentData);
    } catch (error) {
      console.error('Error loading enrollment data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollmentData();
  }, []);

  // Get profiles patients  
  const profilesPatients: EnrollmentPatient[] = users
    .filter(user => user.user_roles?.some(ur => ur.role?.name === 'patientCaregiver'))
    .map(user => ({
      id: user.id,
      enrollment_id: '',
      first_name: user.first_name || 'Name',
      last_name: user.last_name || 'Pending',
      email: user.email,
      phone: user.phone,
      enrollment_status: user.enrollment_status || 'not_started',
      enrollment_type: user.enrollment_type || 'not_selected',
      progress_percentage: user.enrollment_progress || 0,
      created_at: user.created_at,
      source: 'profiles',
      is_synced: true
    }));

  // Sync enrollment patient to profiles
  const syncToProfiles = async (enrollmentPatient: EnrollmentPatient) => {
    try {
      const userData = {
        first_name: enrollmentPatient.first_name,
        last_name: enrollmentPatient.last_name,
        email: enrollmentPatient.email,
        phone: enrollmentPatient.phone,
        password: 'TempPassword123!',
        roles: [] // Will be assigned patientCaregiver role
      };

      // Create user in profiles system
      await createUser(userData);
      
      // Refresh data
      await Promise.all([loadEnrollmentData(), refreshUsers()]);
      
      toast.success(`${enrollmentPatient.first_name} ${enrollmentPatient.last_name} synced to patient management system`);
    } catch (error) {
      console.error('Error syncing patient:', error);
      toast.error('Failed to sync patient');
    }
  };

  // Combined data based on selected tab
  const getFilteredPatients = () => {
    switch (selectedTab) {
      case 'profiles':
        return profilesPatients;
      case 'enrollment':
        return enrollmentPatients;
      case 'unsynced':
        return enrollmentPatients.filter(p => !p.is_synced);
      default:
        // Combine and deduplicate
        const combined = [...profilesPatients];
        enrollmentPatients.forEach(ep => {
          if (!profilesPatients.find(pp => pp.email === ep.email)) {
            combined.push(ep);
          }
        });
        return combined;
    }
  };

  const filteredPatients = getFilteredPatients();

  const stats = {
    total: profilesPatients.length + enrollmentPatients.length,
    profiles: profilesPatients.length,
    enrollment: enrollmentPatients.length,
    unsynced: enrollmentPatients.filter(p => !profilesPatients.find(pp => pp.email === p.email)).length
  };

  if (isLoading || usersLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading patient data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Flow Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Data Flow Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-700">
          <p className="mb-2">
            <strong>Integration Status:</strong> Enrollment forms and Patient management are now connected
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded border">
              <div className="font-semibold text-blue-700">Enrollment Forms</div>
              <div className="text-xs">Saves to: enrollment_patient_info</div>
              <div className="text-xs">{stats.enrollment} records</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-semibold text-green-700">Patient Management</div>
              <div className="text-xs">Saves to: profiles (superadmin)</div>
              <div className="text-xs">{stats.profiles} records</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-semibold text-orange-700">Unsynced</div>
              <div className="text-xs">Need sync to profiles</div>
              <div className="text-xs">{stats.unsynced} records</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.profiles}</div>
            <div className="text-sm text-muted-foreground">In Management</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.enrollment}</div>
            <div className="text-sm text-muted-foreground">From Enrollment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.unsynced}</div>
            <div className="text-sm text-muted-foreground">Need Sync</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Dashboard with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Integrated Patient Dashboard
            </div>
            <Button onClick={() => setShowPatientForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Patients ({stats.total})</TabsTrigger>
              <TabsTrigger value="profiles">Management ({stats.profiles})</TabsTrigger>
              <TabsTrigger value="enrollment">Enrollment ({stats.enrollment})</TabsTrigger>
              <TabsTrigger value="unsynced">Unsynced ({stats.unsynced})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No patients found in this category</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <Card key={`${patient.source}-${patient.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-lg">
                                {patient.first_name} {patient.last_name}
                              </div>
                              <Badge variant={patient.source === 'profiles' ? 'default' : 'secondary'}>
                                {patient.source === 'profiles' ? 'In Management' : 'From Enrollment'}
                              </Badge>
                              {patient.source === 'enrollment' && !patient.is_synced && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                  Needs Sync
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {patient.email} • Created: {new Date(patient.created_at).toLocaleDateString()}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Status:</span>
                                <Badge variant="outline">
                                  {patient.enrollment_status?.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Progress:</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-300"
                                      style={{ width: `${patient.progress_percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{patient.progress_percentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {patient.source === 'enrollment' && !patient.is_synced && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncToProfiles(patient)}
                                title="Sync to Patient Management"
                              >
                                <Database className="h-4 w-4 mr-1" />
                                Sync
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              title="Continue Workflow"
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Continue
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Patient Form Dialog */}
      <PatientForm 
        open={showPatientForm} 
        onOpenChange={setShowPatientForm}
        mode="create"
      />
    </div>
  );
};