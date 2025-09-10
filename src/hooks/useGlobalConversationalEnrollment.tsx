/**
 * GLOBAL CONVERSATIONAL ENROLLMENT HOOK
 * Provides global access to conversational enrollment from any page
 */
import { createContext, useContext, useState, ReactNode } from 'react';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface GlobalConversationalEnrollmentContextType {
  isOpen: boolean;
  moduleType: ModuleType | null;
  openEnrollment: (moduleType: ModuleType) => void;
  closeEnrollment: () => void;
  onComplete: (result: { instanceId: string; pdfUrl: string }) => void;
}

const GlobalConversationalEnrollmentContext = createContext<GlobalConversationalEnrollmentContextType | undefined>(undefined);

export const GlobalConversationalEnrollmentProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);

  const openEnrollment = (type: ModuleType) => {
    setModuleType(type);
    setIsOpen(true);
  };

  const closeEnrollment = () => {
    setIsOpen(false);
    setModuleType(null);
  };

  const onComplete = (result: { instanceId: string; pdfUrl: string }) => {
    console.log('Enrollment completed:', result);
    // You can add global completion logic here (notifications, analytics, etc.)
    closeEnrollment();
    
    // Show success notification or redirect
    if (result.pdfUrl) {
      // Auto-download PDF
      const link = document.createElement('a');
      link.href = result.pdfUrl;
      link.download = `enrollment_${result.instanceId}.pdf`;
      link.click();
    }
  };

  return (
    <GlobalConversationalEnrollmentContext.Provider
      value={{
        isOpen,
        moduleType,
        openEnrollment,
        closeEnrollment,
        onComplete
      }}
    >
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