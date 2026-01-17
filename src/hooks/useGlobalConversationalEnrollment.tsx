/**
 * GLOBAL CONVERSATIONAL ENROLLMENT HOOK
 * Provides global access to conversational enrollment from any page
 */
import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { usePageAwareEnrollment } from './usePageAwareEnrollment';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface GlobalConversationalEnrollmentContextType {
  isOpen: boolean;
  moduleType: ModuleType | null;
  openEnrollment: (moduleType?: ModuleType) => void;
  closeEnrollment: () => void;
  onComplete: (result: { instanceId: string; pdfUrl: string }) => void;
  pageContext: any;
}

const GlobalConversationalEnrollmentContext = createContext<GlobalConversationalEnrollmentContextType | undefined>(undefined);

export const GlobalConversationalEnrollmentProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);
  const { pageContext, getAvailableModules } = usePageAwareEnrollment();

  const openEnrollment = useCallback((type?: ModuleType) => {
    console.log('🚀 Opening enrollment with type:', type);
    // If no type specified, use the first available module for the current page
    const availableModules = getAvailableModules();
    const selectedType = type || availableModules[0];
    
    console.log('📝 Selected enrollment type:', selectedType);
    setModuleType(selectedType);
    setIsOpen(true);
    console.log('✅ Modal should be open now');
  }, [getAvailableModules]);

  const closeEnrollment = useCallback(() => {
    setIsOpen(false);
    setModuleType(null);
  }, []);

  const onComplete = useCallback((result: { instanceId: string; pdfUrl: string }) => {
    console.log('Enrollment completed:', result);
    setIsOpen(false);
    setModuleType(null);
    
    // Show success notification or redirect
    if (result.pdfUrl) {
      // Auto-download PDF
      const link = document.createElement('a');
      link.href = result.pdfUrl;
      link.download = `enrollment_${result.instanceId}.pdf`;
      link.click();
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    isOpen,
    moduleType,
    openEnrollment,
    closeEnrollment,
    onComplete,
    pageContext
  }), [isOpen, moduleType, openEnrollment, closeEnrollment, onComplete, pageContext]);

  return (
    <GlobalConversationalEnrollmentContext.Provider value={value}>
      {children}
    </GlobalConversationalEnrollmentContext.Provider>
  );
};

export const useGlobalConversationalEnrollment = () => {
  const context = useContext(GlobalConversationalEnrollmentContext);
  if (context === undefined) {
    throw new Error('useGlobalConversationalEnrollment must be used within a GlobalConversationalEnrollmentProvider');
  }
  return context;
};