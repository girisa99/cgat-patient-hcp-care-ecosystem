/**
 * ENROLLMENT AGENT CONFIG HOOK
 * Manages feature configuration for enrollment agents using GenieFeatureSelector
 * P1 Implementation: Wire enrollment agents to feature selector system
 * P3 Enhancement: Persist features per deployment via deploymentFeaturePersistence
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useGenieConfiguration } from './useGenieConfiguration';
import { 
  GenieFeature, 
  GENIE_FEATURE_CATALOG, 
  validateFeatureDependencies 
} from '@/types/genie-features';
import { deploymentFeaturePersistence, DeploymentFeatureConfig } from '@/services/deploymentFeaturePersistence';

// Enrollment-specific feature IDs
export const ENROLLMENT_FEATURE_IDS = [
  // Core enrollment features
  'patient_onboarding',
  'npi_verification',
  'credentialing_workflow',
  'consent_management',
  'insurance_verification',
  'clinical_assessment',
  
  // Supporting features
  'multi_model_intelligence',
  'advanced_rag',
  'streaming_responses',
  'clinical_knowledge',
  'hipaa_compliance',
  'smart_field_routing',
  'real_time_validation',
  'enrollment_personality',
  
  // Premium features
  'whatsapp_integration',
  'voice_enrollment',
  'document_generation',
] as const;

export type EnrollmentFeatureId = typeof ENROLLMENT_FEATURE_IDS[number];

export interface EnrollmentAgentConfig {
  enabledFeatures: string[];
  npiVerification: boolean;
  credentialingWorkflow: boolean;
  consentManagement: boolean;
  insuranceVerification: boolean;
  clinicalAssessment: boolean;
  smartFieldRouting: boolean;
  realTimeValidation: boolean;
  whatsappIntegration: boolean;
  voiceEnrollment: boolean;
  documentGeneration: boolean;
  personalityMode: 'professional' | 'empathetic' | 'casual' | 'humorous';
  aiProvider: 'gemini' | 'openai' | 'claude';
}

const DEFAULT_ENROLLMENT_FEATURES = [
  'patient_onboarding',
  'npi_verification',
  'consent_management',
  'clinical_assessment',
  'multi_model_intelligence',
  'clinical_knowledge',
  'hipaa_compliance',
  'smart_field_routing',
  'enrollment_personality',
];

export const useEnrollmentAgentConfig = (deploymentId?: string) => {
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(DEFAULT_ENROLLMENT_FEATURES);
  const [personalityMode, setPersonalityMode] = useState<EnrollmentAgentConfig['personalityMode']>('professional');
  const [aiProvider, setAiProvider] = useState<EnrollmentAgentConfig['aiProvider']>('gemini');
  const [isValid, setIsValid] = useState(true);
  const [isLoadedFromDeployment, setIsLoadedFromDeployment] = useState(false);
  
  // Use genie configuration for loading/saving (fallback)
  const genieConfig = useGenieConfiguration();

  // Get enrollment-specific features from catalog
  const enrollmentFeatures = useMemo(() => {
    return GENIE_FEATURE_CATALOG.filter(f => 
      ENROLLMENT_FEATURE_IDS.includes(f.id as EnrollmentFeatureId)
    );
  }, []);

  // Validate feature dependencies
  const validateFeatures = useCallback((features: string[]) => {
    const result = validateFeatureDependencies(features, enrollmentFeatures);
    setIsValid(result.valid);
    return result;
  }, [enrollmentFeatures]);

  // P3: Load from deployment-specific configuration first
  useEffect(() => {
    if (!deploymentId) return;
    
    const loadFromDeployment = async () => {
      const config = await deploymentFeaturePersistence.loadDeploymentFeatures(deploymentId);
      if (config) {
        setIsLoadedFromDeployment(true);
        if (config.enabled_features?.length) {
          setEnabledFeatures(config.enabled_features);
        }
        if (config.personality_mode) {
          setPersonalityMode(config.personality_mode as EnrollmentAgentConfig['personalityMode']);
        }
        if (config.ai_provider) {
          setAiProvider(config.ai_provider as EnrollmentAgentConfig['aiProvider']);
        }
      }
    };
    
    loadFromDeployment();
  }, [deploymentId]);

  // Fallback: Sync with genie configuration when deployment config not available
  useEffect(() => {
    if (isLoadedFromDeployment) return;
    
    if (genieConfig.currentConfig && deploymentId) {
      const savedFeatures = genieConfig.currentConfig.enabled_features;
      if (savedFeatures && Array.isArray(savedFeatures)) {
        setEnabledFeatures(savedFeatures);
      }
    }
  }, [genieConfig.currentConfig, deploymentId, isLoadedFromDeployment]);

  // Toggle feature
  const toggleFeature = useCallback((featureId: string) => {
    setEnabledFeatures(prev => {
      const newFeatures = prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId];
      
      validateFeatures(newFeatures);
      return newFeatures;
    });
  }, [validateFeatures]);

  // Set features (replaces all)
  const setFeatures = useCallback((features: string[]) => {
    validateFeatures(features);
    setEnabledFeatures(features);
  }, [validateFeatures]);

  // Apply preset configuration
  const applyPreset = useCallback((preset: 'basic' | 'standard' | 'comprehensive' | 'healthcare_full') => {
    let presetFeatures: string[] = [];
    
    switch (preset) {
      case 'basic':
        presetFeatures = [
          'patient_onboarding',
          'consent_management',
          'multi_model_intelligence',
          'enrollment_personality',
        ];
        break;
      case 'standard':
        presetFeatures = [
          'patient_onboarding',
          'npi_verification',
          'consent_management',
          'clinical_assessment',
          'multi_model_intelligence',
          'clinical_knowledge',
          'smart_field_routing',
          'enrollment_personality',
        ];
        break;
      case 'comprehensive':
        presetFeatures = [
          'patient_onboarding',
          'npi_verification',
          'credentialing_workflow',
          'consent_management',
          'clinical_assessment',
          'multi_model_intelligence',
          'advanced_rag',
          'streaming_responses',
          'clinical_knowledge',
          'hipaa_compliance',
          'smart_field_routing',
          'real_time_validation',
          'enrollment_personality',
        ];
        break;
      case 'healthcare_full':
        presetFeatures = ENROLLMENT_FEATURE_IDS.filter(id => {
          const feature = GENIE_FEATURE_CATALOG.find(f => f.id === id);
          return feature && !feature.isPremium;
        });
        break;
    }
    
    setFeatures(presetFeatures);
  }, [setFeatures]);

  // Check if specific feature is enabled
  const isFeatureEnabled = useCallback((featureId: string): boolean => {
    return enabledFeatures.includes(featureId);
  }, [enabledFeatures]);

  // Build config object for agent
  const config: EnrollmentAgentConfig = useMemo(() => ({
    enabledFeatures,
    npiVerification: isFeatureEnabled('npi_verification'),
    credentialingWorkflow: isFeatureEnabled('credentialing_workflow'),
    consentManagement: isFeatureEnabled('consent_management'),
    insuranceVerification: isFeatureEnabled('insurance_verification'),
    clinicalAssessment: isFeatureEnabled('clinical_assessment'),
    smartFieldRouting: isFeatureEnabled('smart_field_routing'),
    realTimeValidation: isFeatureEnabled('real_time_validation'),
    whatsappIntegration: isFeatureEnabled('whatsapp_integration'),
    voiceEnrollment: isFeatureEnabled('voice_enrollment'),
    documentGeneration: isFeatureEnabled('document_generation'),
    personalityMode,
    aiProvider,
  }), [enabledFeatures, isFeatureEnabled, personalityMode, aiProvider]);

  // P3: Save configuration to genie_deployments.configuration
  const saveConfiguration = useCallback(async () => {
    if (!deploymentId) return { success: false, error: 'No deployment ID' };
    
    try {
      // Primary: Save to deployment-specific configuration (P3)
      const result = await deploymentFeaturePersistence.saveEnrollmentConfig(deploymentId, config);
      
      if (result.success) {
        setIsLoadedFromDeployment(true);
        return { success: true };
      }
      
      // Fallback to genie_configurations if deployment save fails
      const existingConfig = genieConfig.configurations.find(c => c.configuration_name === deploymentId);
      
      if (existingConfig?.id) {
        await genieConfig.updateConfiguration(existingConfig.id, {
          enabled_features: enabledFeatures,
        });
      } else {
        await genieConfig.saveConfiguration({
          configuration_name: deploymentId,
          selected_mode: 'single',
          selected_models: [],
          left_model: '',
          right_model: '',
          selected_model_type: 'llm',
          enabled_features: enabledFeatures,
          selected_mcp_tools: [],
          knowledge_base: '',
          medical_context: true,
          is_default: false,
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }, [deploymentId, enabledFeatures, config, genieConfig]);

  return {
    // State
    enabledFeatures,
    personalityMode,
    aiProvider,
    isValid,
    config,
    isLoadedFromDeployment,
    
    // Available features
    enrollmentFeatures,
    
    // Actions
    toggleFeature,
    setFeatures,
    setPersonalityMode,
    setAiProvider,
    applyPreset,
    isFeatureEnabled,
    validateFeatures,
    saveConfiguration,
    
    // Loading state from genie config
    isLoading: genieConfig.loading,
  };
};
