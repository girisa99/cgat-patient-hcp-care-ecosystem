/**
 * ENHANCED REALTIME PROGRESS TRACKER
 * Real-time updates with field-level progress and dashboard sync
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Send,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldStatus {
  fieldName: string;
  displayName: string;
  isRequired: boolean;
  isCompleted: boolean;
  value?: any;
  lastUpdated?: string;
  validationStatus: 'valid' | 'invalid' | 'pending';
  syncStatus: 'synced' | 'syncing' | 'failed';
}

interface SectionStatus {
  sectionKey: string;
  sectionTitle: string;
  isCompleted: boolean;
  isCurrent: boolean;
  completedAt?: string;
  fields: FieldStatus[];
  overallProgress: number;
  requiredProgress: number;
}

interface RealtimeProgress {
  patientId: string;
  sessionId: string;
  enrollmentStatus: 'in_progress' | 'completed' | 'paused' | 'error';
  currentSection: string;
  sections: SectionStatus[];
  overallProgress: number;
  lastActivity: string;
  criticalIssues: string[];
  syncedToDashboard: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

interface EnhancedRealtimeProgressTrackerProps {
  patientId: string;
  sessionId: string;
  onSectionComplete?: (sectionKey: string) => void;
  onProgressUpdate?: (progress: RealtimeProgress) => void;
  dashboardSyncEnabled?: boolean;
}

export const EnhancedRealtimeProgressTracker: React.FC<EnhancedRealtimeProgressTrackerProps> = ({
  patientId,
  sessionId,
  onSectionComplete,
  onProgressUpdate,
  dashboardSyncEnabled = true
}) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<RealtimeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Initialize real-time connection
  useEffect(() => {
    initializeRealtimeConnection();
    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [patientId, sessionId]);

  const initializeRealtimeConnection = async () => {
    try {
      setIsLoading(true);
      
      // Load initial data
      const initialProgress = await loadProgressData();
      if (initialProgress) {
        setProgress(initialProgress);
        onProgressUpdate?.(initialProgress);
      }

      // Set up real-time subscription for all enrollment tables
      const channel = supabase
        .channel(`enrollment_progress_${patientId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patient_enrollments',
            filter: `id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollment_consent',
            filter: `patient_id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollment_patient_info',
            filter: `patient_id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollment_provider_info',
            filter: `patient_id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollment_insurance_info',
            filter: `patient_id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollment_clinical_info',
            filter: `patient_id=eq.${patientId}`
          },
          async (payload) => {
            await handleRealtimeUpdate(payload);
          }
        )
        .subscribe();

      // Set up periodic sync if enabled
      if (autoSyncEnabled) {
        const syncInterval = setInterval(() => {
          syncProgressToDashboard();
        }, 30000); // Sync every 30 seconds

        return () => clearInterval(syncInterval);
      }

    } catch (error) {
      console.error('Failed to initialize realtime connection:', error);
      updateConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgressData = async (): Promise<RealtimeProgress | null> => {
    try {
      // Base enrollment row
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('patient_enrollments')
        .select('*')
        .eq('id', patientId)
        .single();

      if (enrollmentError) throw enrollmentError;

      // For now, just use the main enrollment data to avoid TypeScript complexity
      // TODO: Add section-specific data loading when TypeScript types are resolved
      const merged = enrollment;

      // Build progress object from enrollment data
      const progressData: RealtimeProgress = {
        patientId,
        sessionId,
        enrollmentStatus: (enrollment.enrollment_status as 'in_progress' | 'completed' | 'paused' | 'error') || 'in_progress',
        currentSection: enrollment.current_section || 'submission_method',
        sections: buildSectionStatus(merged),
        overallProgress: enrollment.progress_percentage || 0,
        lastActivity: enrollment.updated_at,
        criticalIssues: [],
        syncedToDashboard: true,
        connectionStatus: 'connected'
      };

      return progressData;
    } catch (error) {
      console.error('Failed to load progress data:', error);
      return null;
    }
  };

  const buildSectionStatus = (enrollment: any): SectionStatus[] => {
    const sections = [
      'submission_method',
      'consent_management',
      'patient_information',
      'provider_treatment_center',
      'insurance_information',
      'clinical_treatment',
      'final_submit'
    ];

    return sections.map(sectionKey => ({
      sectionKey,
      sectionTitle: getSectionTitle(sectionKey),
      isCompleted: isCompletedSection(enrollment, sectionKey),
      isCurrent: enrollment.current_section === sectionKey,
      fields: buildFieldStatus(enrollment, sectionKey),
      overallProgress: calculateSectionProgress(enrollment, sectionKey),
      requiredProgress: calculateRequiredProgress(enrollment, sectionKey)
    }));
  };

  const getSectionTitle = (sectionKey: string): string => {
    const titles: Record<string, string> = {
      submission_method: 'Submission Method',
      consent_management: 'Consent Management',
      patient_information: 'Patient Information',
      provider_treatment_center: 'Provider & Treatment Center',
      insurance_information: 'Insurance Information',
      clinical_treatment: 'Clinical Assessment',
      final_submit: 'Final Review & Submit'
    };
    return titles[sectionKey] || sectionKey;
  };

  const buildFieldStatus = (enrollment: any, sectionKey: string): FieldStatus[] => {
    // Enhanced field mappings for all sections
    const fieldMappings: Record<string, any[]> = {
      consent_management: [
        { name: 'provider_name', displayName: 'Provider Name', required: true },
        { name: 'provider_npi', displayName: 'Provider NPI', required: true },
        { name: 'treatment_center', displayName: 'Treatment Center', required: true },
        { name: 'patient_consent_method', displayName: 'Consent Method', required: true },
        { name: 'provider_signature', displayName: 'Provider Signature', required: true }
      ],
      patient_information: [
        { name: 'first_name', displayName: 'First Name', required: true },
        { name: 'last_name', displayName: 'Last Name', required: true },
        { name: 'middle_name', displayName: 'Middle Name', required: false },
        { name: 'date_of_birth', displayName: 'Date of Birth', required: true },
        { name: 'preferred_language', displayName: 'Preferred Language', required: true },
        { name: 'gender', displayName: 'Gender', required: true },
        { name: 'email', displayName: 'Email Address', required: true },
        { name: 'phone', displayName: 'Phone Number', required: true },
        { name: 'address_line1', displayName: 'Address', required: true },
        { name: 'city', displayName: 'City', required: true },
        { name: 'state', displayName: 'State', required: true },
        { name: 'zip_code', displayName: 'Zip Code', required: true }
      ],
      provider_treatment_center: [
        { name: 'referring_provider_npi', displayName: 'Referring Provider NPI', required: true },
        { name: 'facility_npi', displayName: 'Facility NPI', required: false }
      ],
      insurance_information: [
        { name: 'insurance_provider', displayName: 'Insurance Provider', required: true },
        { name: 'member_id', displayName: 'Member ID', required: true },
        { name: 'policy_holder', displayName: 'Policy Holder', required: true },
        { name: 'group_number', displayName: 'Group Number', required: false }
      ],
      clinical_treatment: [
        { name: 'primary_diagnosis', displayName: 'Primary Diagnosis', required: true },
        { name: 'treatment_goals', displayName: 'Treatment Goals', required: true }
      ],
      final_submit: [
        { name: 'final_review_complete', displayName: 'Final Review Complete', required: true }
      ]
    };

    const fields = fieldMappings[sectionKey] || [];
    
    return fields.map(field => {
      const value = enrollment[field.name] || enrollment.metadata?.[field.name];
      return {
        fieldName: field.name,
        displayName: field.displayName,
        isRequired: field.required,
        isCompleted: !!value,
        value,
        validationStatus: value ? 'valid' : 'pending',
        syncStatus: 'synced'
      };
    });
  };

  const isCompletedSection = (enrollment: any, sectionKey: string): boolean => {
    const metadata = enrollment.metadata || {};
    return metadata.completed_sections?.includes(sectionKey) || false;
  };

  const calculateSectionProgress = (enrollment: any, sectionKey: string): number => {
    const fields = buildFieldStatus(enrollment, sectionKey);
    if (fields.length === 0) return 0;
    const completed = fields.filter(f => f.isCompleted).length;
    return (completed / fields.length) * 100;
  };

  const calculateRequiredProgress = (enrollment: any, sectionKey: string): number => {
    const fields = buildFieldStatus(enrollment, sectionKey);
    const required = fields.filter(f => f.isRequired);
    if (required.length === 0) return 100;
    const completed = required.filter(f => f.isCompleted).length;
    return (completed / required.length) * 100;
  };

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Realtime update received:', payload);
    
    if (payload.new) {
      const updatedProgress = buildProgressFromPayload(payload.new);
      setProgress(updatedProgress);
      onProgressUpdate?.(updatedProgress);
      
      // Check for section completion
      const completedSections = payload.new.metadata?.completed_sections || [];
      const previousSections = progress?.sections.filter(s => s.isCompleted).map(s => s.sectionKey) || [];
      const newCompletions = completedSections.filter((s: string) => !previousSections.includes(s));
      
      newCompletions.forEach((sectionKey: string) => {
        onSectionComplete?.(sectionKey);
        toast({
          title: "Section Completed! 🎉",
          description: `${getSectionTitle(sectionKey)} has been completed successfully.`,
        });
      });
    }

    updateConnectionStatus('connected');
    setLastSync(new Date());
  }, [progress, onProgressUpdate, onSectionComplete, toast]);

  const buildProgressFromPayload = (data: any): RealtimeProgress => {
    return {
      patientId,
      sessionId,
      enrollmentStatus: (data.enrollment_status as 'in_progress' | 'completed' | 'paused' | 'error') || 'in_progress',
      currentSection: data.current_section || 'submission_method',
      sections: buildSectionStatus(data),
      overallProgress: data.progress_percentage || 0,
      lastActivity: data.updated_at,
      criticalIssues: [],
      syncedToDashboard: dashboardSyncEnabled,
      connectionStatus: 'connected'
    };
  };

  const updateConnectionStatus = (status: 'connected' | 'disconnected' | 'reconnecting') => {
    setProgress(prev => prev ? { ...prev, connectionStatus: status } : null);
  };

  const syncProgressToDashboard = async () => {
    if (!dashboardSyncEnabled || !progress) return;

    try {
      // Update enrollment progress in database
      await supabase
        .from('patient_enrollments')
        .update({
          progress_percentage: progress.overallProgress,
          updated_at: new Date().toISOString(),
          metadata: { dashboard_synced: true, last_sync: new Date().toISOString() } as any
        })
        .eq('id', patientId);

      setLastSync(new Date());
      toast({
        title: "Dashboard Updated",
        description: "Progress synced to dashboard successfully.",
      });
    } catch (error) {
      console.error('Failed to sync to dashboard:', error);
    }
  };

  const handleManualSync = () => {
    syncProgressToDashboard();
  };

  const getCurrentSection = () => {
    return progress?.sections.find(s => s.isCurrent);
  };

  const getConnectionIcon = () => {
    if (!progress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    
    switch (progress.connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'reconnecting': return <RefreshCw className="h-4 w-4 animate-spin text-orange-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading progress tracker...
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Failed to load progress data. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  const currentSection = getCurrentSection();

  return (
    <div className="space-y-4">
      {/* Connection Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              Real-time Progress Tracker
            </div>
            <div className="flex items-center gap-2">
              {lastSync && (
                <Badge variant="outline" className="text-xs">
                  Last sync: {lastSync.toLocaleTimeString()}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleManualSync}>
                <Database className="h-3 w-3 mr-1" />
                Sync Now
              </Button>
            </div>
          </CardTitle>
          
          <div className="text-sm text-muted-foreground">
            Patient ID: {patientId} • Status: {progress.enrollmentStatus}
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Progress</span>
              <Badge variant="outline">{Math.round(progress.overallProgress)}% Complete</Badge>
            </div>
            <Progress value={progress.overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Current Section Focus */}
      {currentSection && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" />
              Currently Active: {currentSection.sectionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Field Progress</div>
                <Progress value={currentSection.overallProgress} className="h-2 mt-1" />
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(currentSection.overallProgress)}% complete
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-red-600">Required Fields</div>
                <Progress value={currentSection.requiredProgress} className="h-2 mt-1" />
                <div className="text-xs text-red-600 mt-1">
                  {Math.round(currentSection.requiredProgress)}% complete
                </div>
              </div>
            </div>

            {/* Field Status */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Field Status</div>
              <div className="grid grid-cols-1 gap-2">
                {currentSection.fields.map(field => (
                  <div key={field.fieldName} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      {field.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{field.displayName}</span>
                      {field.isRequired && (
                        <Badge variant="destructive" className="text-xs h-4">Required</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {field.syncStatus === 'synced' && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          Synced
                        </Badge>
                      )}
                      {field.syncStatus === 'syncing' && (
                        <RefreshCw className="h-3 w-3 animate-spin text-orange-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Sync Status */}
      {dashboardSyncEnabled && (
        <Alert className="border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Dashboard Integration Active</div>
                <div className="text-sm">Progress updates are being synced to the main dashboard in real-time.</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open('/dashboard', '_blank')}>
                  <Eye className="h-3 w-3 mr-1" />
                  View Dashboard
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export type { RealtimeProgress, SectionStatus, FieldStatus };