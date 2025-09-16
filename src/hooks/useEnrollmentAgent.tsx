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
      const sections = getSectionsForModule(moduleType);

      // TODO: Create database record for tracking once tables are finalized
      // For now, using local state only

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
      const updatedFormData = {
        ...currentSession.formData,
        [sectionName]: {
          ...currentSession.formData[sectionName],
          ...data
        }
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        formData: updatedFormData
      } : null);

      // TODO: Update database once tables are finalized
      // For now, using local state only

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

      setCurrentSession(prev => prev ? {
        ...prev,
        completedSections: updatedCompletedSections,
        currentSection: nextSection || sectionName
      } : null);

      // TODO: Update database progress once tables are finalized

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