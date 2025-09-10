/**
 * PAGE-AWARE ENROLLMENT HOOK
 * Detects current page and shows relevant enrollment options only
 */
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface PageEnrollmentConfig {
  moduleType: ModuleType;
  title: string;
  description: string;
  showFloating: boolean;
  context: string;
}

export const usePageAwareEnrollment = () => {
  const location = useLocation();
  
  // Route to module mapping
  const pageModuleMap: Record<string, PageEnrollmentConfig> = {
    '/patients': {
      moduleType: 'patient',
      title: 'Patient Enrollment',
      description: 'Complete patient intake and medical information',
      showFloating: true,
      context: 'patient_portal'
    },
    '/patient-onboarding': {
      moduleType: 'patient',
      title: 'Patient Onboarding',
      description: 'Start your patient enrollment process',
      showFloating: true,
      context: 'patient_onboarding'
    },
    '/treatment-centers': {
      moduleType: 'treatment_center',
      title: 'Treatment Center Registration',
      description: 'Register and onboard your treatment facility',
      showFloating: true,
      context: 'treatment_center_portal'
    },
    '/facilities': {
      moduleType: 'treatment_center',
      title: 'Facility Onboarding',
      description: 'Complete facility registration and compliance',
      showFloating: true,
      context: 'facility_management'
    },
    '/order-management': {
      moduleType: 'customer',
      title: 'Customer Registration',
      description: 'Register as a customer to place orders',
      showFloating: true,
      context: 'order_management'
    },
    '/onboarding': {
      moduleType: 'treatment_center',
      title: 'General Onboarding',
      description: 'Complete your onboarding process',
      showFloating: true,
      context: 'general_onboarding'
    },
    // Manufacturing/vendor pages
    '/system-integration': {
      moduleType: 'manufacturer',
      title: 'Vendor Registration',
      description: 'Register as a system integration partner',
      showFloating: true,
      context: 'vendor_onboarding'
    },
    // Dashboard pages - show all options
    '/dashboard': {
      moduleType: 'patient',
      title: 'Quick Enrollment',
      description: 'Access all enrollment options',
      showFloating: false,
      context: 'dashboard'
    },
    '/demo-dashboard': {
      moduleType: 'patient',
      title: 'Demo Enrollment',
      description: 'Try our enrollment system',
      showFloating: false,
      context: 'demo'
    }
  };

  const currentPageConfig = useMemo(() => {
    // Check for exact match first
    if (pageModuleMap[location.pathname]) {
      return pageModuleMap[location.pathname];
    }
    
    // Check for partial matches
    const pathSegments = location.pathname.split('/');
    const basePath = '/' + pathSegments[1];
    
    if (pageModuleMap[basePath]) {
      return pageModuleMap[basePath];
    }
    
    // Default - no specific module (show all options)
    return null;
  }, [location.pathname]);

  const getAvailableModules = (): ModuleType[] => {
    if (!currentPageConfig) {
      // Show all modules for general pages
      return ['patient', 'treatment_center', 'customer', 'manufacturer'];
    }
    
    // Show only the relevant module for specific pages
    return [currentPageConfig.moduleType];
  };

  const shouldShowFloatingButton = (): boolean => {
    return currentPageConfig?.showFloating ?? false;
  };

  const getPageContext = () => {
    return {
      isPageSpecific: !!currentPageConfig,
      config: currentPageConfig,
      availableModules: getAvailableModules(),
      showFloating: shouldShowFloatingButton(),
      pathname: location.pathname
    };
  };

  const getContextualPrompt = (moduleType: ModuleType): string => {
    const contextPrompts = {
      patient: {
        patient_portal: "I see you're in the patient portal. Let me help you complete your patient enrollment quickly and easily.",
        patient_onboarding: "Welcome to patient onboarding! I'm here to guide you through your medical intake process.",
        dashboard: "Ready to start patient enrollment? I'll make this quick and conversational.",
        demo: "Let's try patient enrollment! This is a demo of our conversational enrollment system."
      },
      treatment_center: {
        treatment_center_portal: "I'm here to help you register your treatment center. Let's go through the facility requirements together.",
        facility_management: "Let's complete your facility registration. I'll guide you through all the compliance requirements.",
        general_onboarding: "Welcome! I'll help you complete the onboarding process for your organization.",
        dashboard: "Ready to onboard a treatment center? Let's start the registration process."
      },
      customer: {
        order_management: "I see you want to place orders. Let me help you register as a customer first - it's quick and easy!",
        dashboard: "Ready for customer registration? I'll help you set up your account."
      },
      manufacturer: {
        vendor_onboarding: "Let's get you registered as a vendor partner. I'll guide you through the integration requirements.",
        dashboard: "Ready to register as a manufacturer? Let's set up your vendor profile."
      }
    };

    const context = currentPageConfig?.context || 'dashboard';
    return contextPrompts[moduleType]?.[context] || 
           `Let me help you complete ${moduleType} enrollment through our conversational system.`;
  };

  return {
    currentPageConfig,
    getAvailableModules,
    shouldShowFloatingButton,
    getPageContext,
    getContextualPrompt
  };
};