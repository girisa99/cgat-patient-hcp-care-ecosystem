/**
 * ENROLLMENT AGENT HOOK
 * Manages AI-powered enrollment process with backend integration
 * Provides real-time updates and section management
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentSession {
  instanceId: string;
  moduleType: ModuleType;
  currentSection: string;
  completedSections: string[];
  formData: Record<string, any>;
  isActive: boolean;
}

interface UseEnrollmentAgentReturn {
  currentSession: EnrollmentSession | null;
  isLoading: boolean;
  error: string | null;
  startEnrollment: (moduleType: ModuleType) => Promise<string>;
  updateSection: (sectionName: string, data: any, options?: { skipNPIVerification?: boolean }) => Promise<void>;
  completeSection: (sectionName: string) => Promise<void>;
  generatePDF: () => Promise<{ pdfUrl: string; documentId: string }>;
  endSession: () => void;
}

export const useEnrollmentAgent = (): UseEnrollmentAgentReturn => {
  const [currentSession, setCurrentSession] = useState<EnrollmentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startEnrollment = useCallback(async (moduleType: ModuleType): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const instanceId = crypto.randomUUID();
      const sessionId = `hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sections = getSectionsForModule(moduleType);

      // Create database record with proper UUID and constraint handling
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id) {
        await supabase.from('patient_enrollments').upsert({
          id: instanceId,
          session_id: sessionId,
          enrollment_status: 'in_progress',
          current_section: sections[0],
          progress_percentage: 0,
          enrollment_source: 'ai_agent_hook',
          metadata: { 
            agent_type: 'hook_managed', 
            module_type: moduleType,
            completed_sections: [],
            section_timestamps: {}
          },
          user_id: authUser.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      const newSession: EnrollmentSession = {
        instanceId,
        moduleType,
        currentSection: sections[0],
        completedSections: [],
        formData: {},
        isActive: true
      };

      setCurrentSession(newSession);
      
      toast({
        title: "Enrollment Started",
        description: `Starting ${moduleType} enrollment with AI assistant`,
      });

      return instanceId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start enrollment';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSection = useCallback(async (sectionName: string, data: any, options?: { skipNPIVerification?: boolean }) => {
    if (!currentSession) return;

    try {
      // Apply universal DB constraint fixes
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
          
          // NPI validation: only allow exactly 10 digits for DB persistence
          if (/npi$/i.test(key) && dbValue) {
            const digits = dbValue.toString().replace(/\D/g, '');
            dbValue = digits.length === 10 ? digits : null;
          }
          
          return [key, dbValue];
        })
      );

      const updatedFormData = {
        ...currentSession.formData,
        [sectionName]: {
          ...currentSession.formData[sectionName],
          ...cleanedData
        }
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        formData: updatedFormData
      } : null);

      // Update database with proper UUID validation - individual fields approach
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentSession.instanceId)) {
        // Calculate progress based on completed sections
        const allSections = getSectionsForModule(currentSession.moduleType);
        const progress = Math.round((currentSession.completedSections.length / allSections.length) * 100);
        
        await supabase.from('patient_enrollments').update({
          current_section: currentSession.currentSection,
          progress_percentage: progress,
          // Only use JSONB for truly flexible configuration data
          metadata: {
            agent_type: 'hook_managed',
            module_type: currentSession.moduleType,
            last_updated_section: sectionName
          } as any,
          updated_at: new Date().toISOString()
        }).eq('id', currentSession.instanceId);
      }

      // Only trigger NPI verification if explicitly enabled and not skipped
      if (!options?.skipNPIVerification && 
          sectionName === 'provider_info' && 
          data.npi && 
          !data.npiVerified && 
          data.enableNPIVerification) {
        await triggerNPIVerification(data.npi, sectionName);
      }

    } catch (err) {
      console.error('Failed to update section:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section';
      setError(errorMessage);
    }
  }, [currentSession]);

  const triggerNPIVerification = useCallback(async (npi: string, sectionName: string) => {
    try {
      // Call NPI verification service
      const { data, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: {
          npi,
          providerType: 'individual',
          enrollmentId: currentSession?.instanceId
        }
      });

      if (error) throw error;

      if (data.success && data.verification.isValid) {
        // Auto-fill provider data from NPI verification
        const autoFillData = {
          firstName: data.verification.npiData?.basic?.first_name || '',
          lastName: data.verification.npiData?.basic?.last_name || '',
          primarySpecialty: data.verification.npiData?.taxonomies?.[0]?.desc || '',
          practiceAddress: data.verification.npiData?.addresses?.[0]?.address_1 || '',
          practiceCity: data.verification.npiData?.addresses?.[0]?.city || '',
          practiceState: data.verification.npiData?.addresses?.[0]?.state || '',
          practiceZip: data.verification.npiData?.addresses?.[0]?.postal_code || '',
          businessPhone: data.verification.npiData?.addresses?.[0]?.telephone_number || '',
          npiVerified: true,
          verificationDate: new Date().toISOString()
        };

        // Update the session with auto-filled data
        setCurrentSession(prev => prev ? {
          ...prev,
          formData: {
            ...prev.formData,
            [sectionName]: {
              ...prev.formData[sectionName],
              ...autoFillData
            }
          }
        } : null);

        toast({
          title: "NPI Verified",
          description: "Provider information has been auto-filled from NPI verification",
        });
      }
    } catch (err) {
      console.error('NPI verification failed:', err);
      // Don't throw error, just log it - form can still be completed manually
    }
  }, [currentSession, toast]);

  const completeSection = useCallback(async (sectionName: string) => {
    if (!currentSession) return;

    try {
      const updatedCompletedSections = [...currentSession.completedSections, sectionName];
      const allSections = getSectionsForModule(currentSession.moduleType);
      const currentIndex = allSections.indexOf(sectionName);
      const nextSection = allSections[currentIndex + 1];
      const progress = Math.round((updatedCompletedSections.length / allSections.length) * 100);

      setCurrentSession(prev => prev ? {
        ...prev,
        completedSections: updatedCompletedSections,
        currentSection: nextSection || sectionName
      } : null);

      // Update database progress with individual fields approach
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentSession.instanceId)) {
        await supabase.from('patient_enrollments').update({
          current_section: nextSection || 'completed',
          progress_percentage: progress,
          // Only use JSONB for truly flexible configuration data
          metadata: {
            agent_type: 'hook_managed',
            module_type: currentSession.moduleType,
            last_completed_section: sectionName,
            completion_timestamp: new Date().toISOString()
          } as any,
          updated_at: new Date().toISOString()
        }).eq('id', currentSession.instanceId);
      }

      toast({
        title: "Section Completed",
        description: `${sectionName} has been completed successfully`,
      });

    } catch (err) {
      console.error('Failed to complete section:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete section';
      setError(errorMessage);
    }
  }, [currentSession, toast]);

  const generatePDF = useCallback(async (): Promise<{ pdfUrl: string; documentId: string }> => {
    if (!currentSession) {
      throw new Error('No active enrollment session');
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-enrollment-pdf', {
        body: {
          moduleType: currentSession.moduleType,
          formData: currentSession.formData,
          instanceId: currentSession.instanceId
        }
      });

      if (error) throw error;

      // TODO: Update session status in database once tables are finalized

      toast({
        title: "PDF Generated",
        description: "Your enrollment document is ready for download",
      });

      return {
        pdfUrl: data.pdfUrl,
        documentId: data.documentId
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, toast]);

  const endSession = useCallback(() => {
    // TODO: Mark session as cancelled in database once tables are finalized
    setCurrentSession(null);
    setError(null);
  }, []);

  return {
    currentSession,
    isLoading,
    error,
    startEnrollment,
    updateSection,
    completeSection,
    generatePDF,
    endSession
  };
};

const getSectionsForModule = (moduleType: ModuleType): string[] => {
  const sectionMap = {
    patient: ['demographics', 'medical-history', 'insurance', 'consent'],
    treatment_center: ['facility-info', 'licensing-certifications', 'staff-credentials', 'service-agreements'],
    customer: ['account-info', 'service-preferences', 'billing-setup', 'account-verification'],
    manufacturer: ['company-details', 'product-catalog', 'certifications-compliance', 'partnership-agreements']
  };
  return sectionMap[moduleType];
};