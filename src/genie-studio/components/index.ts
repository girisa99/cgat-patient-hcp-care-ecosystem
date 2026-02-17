/**
 * Genie Studio Components - Barrel Export
 * Re-exports all Genie Studio components from their original locations
 */

// Core Genie Studio components
export * from '@/components/genie-studio/types';
export * from '@/components/genie-studio/constants';
export * from '@/components/genie-studio/hooks';

// Individual components - re-exported for convenience
export { AIProviderSelector } from '@/components/genie-studio/AIProviderSelector';
export { AccessibilityToggle } from '@/components/genie-studio/AccessibilityEnhancements';
export { AskGenie } from '@/components/genie-studio/AskGenie';
export { AudioToScriptPanel } from '@/components/genie-studio/AudioToScriptPanel';
export type { ContentModerationResult } from '@/components/genie-studio/ContentModerationService';
export { ContentSafetyBanner } from '@/components/genie-studio/ContentSafetyBanner';
export { ContentViolationWarning } from '@/components/genie-studio/ContentViolationWarning';
export { DashboardWelcome } from '@/components/genie-studio/DashboardWelcome';
export { DocumentToScriptPanel } from '@/components/genie-studio/DocumentToScriptPanel';
export { FullPipelineWorkflow } from '@/components/genie-studio/FullPipelineWorkflow';
export { GenieSparkDraftsPanel } from '@/components/genie-studio/GenieSparkDraftsPanel';
export { GenieSparkLogo } from '@/components/genie-studio/GenieSparkLogo';
export { GenieStudioInfoBanner } from '@/components/genie-studio/GenieStudioInfoBanner';
export { HIPAAComplianceFooter } from '@/components/genie-studio/HIPAAComplianceFooter';
export { HeroCarousel } from '@/components/genie-studio/HeroCarousel';
export { ImageModelSelector } from '@/components/genie-studio/ImageModelSelector';
export { ImageToScriptPanel } from '@/components/genie-studio/ImageToScriptPanel';
export { KnowledgeSearchPanel } from '@/components/genie-studio/KnowledgeSearchPanel';
export { PipelineOrchestrationPanel } from '@/components/genie-studio/PipelineOrchestrationPanel';
export { PostGenerationActions } from '@/components/genie-studio/PostGenerationActions';
export { PresentationScriptView } from '@/components/genie-studio/PresentationScriptView';
export { RecordingLayoutPreview } from '@/components/genie-studio/RecordingLayoutPreview';
export { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
export { SavedScriptCard } from '@/components/genie-studio/SavedScriptCard';
export { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
export { ScriptModeToolbar } from '@/components/genie-studio/ScriptModeToolbar';
export { SessionCalendarButtons } from '@/components/genie-studio/SessionCalendarButtons';
export { SlideScriptCard } from '@/components/genie-studio/SlideScriptCard';
export { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
export { TermsAcceptanceModal } from '@/components/genie-studio/TermsAcceptanceModal';
export { URLContentAnalyzer } from '@/components/genie-studio/URLContentAnalyzer';
export { UrlToScriptPanel } from '@/components/genie-studio/UrlToScriptPanel';
export { VideoContentAnalyzer } from '@/components/genie-studio/VideoContentAnalyzer';
export { VoiceSelector } from '@/components/genie-studio/VoiceSelector';

// Genie Vibe components
export * from '@/components/genie-vibe';

// Genie Management components
export { GenieManagementDashboard } from '@/components/genie-management/GenieManagementDashboard';
export { GenieInstanceCard } from '@/components/genie-management/GenieInstanceCard';
export { DeploymentOptionsDialog } from '@/components/genie-management/DeploymentOptionsDialog';

// Configurable Genie components
export { BrandConfigurationEditor } from '@/components/configurable-genie/BrandConfigurationEditor';
export { BrandConfigurationManager } from '@/components/configurable-genie/BrandConfigurationManager';
export { ConfigurableGenieWidget } from '@/components/configurable-genie/ConfigurableGenieWidget';
export { ConfigurationPreview } from '@/components/configurable-genie/ConfigurationPreview';
export { DeploymentCodeGenerator } from '@/components/configurable-genie/DeploymentCodeGenerator';
export { KnowledgeBaseConfiguration } from '@/components/configurable-genie/KnowledgeBaseConfiguration';

// Genie core components
export { ContentDownloader } from '@/components/genie/ContentDownloader';
export { ContextManager } from '@/components/genie/ContextManager';
export { DisclaimerModal } from '@/components/genie/DisclaimerModal';
export { EnhancedGenieInterface } from '@/components/genie/EnhancedGenieInterface';
export { ExternalSystemsIntegrator } from '@/components/genie/ExternalSystemsIntegrator';
export { GenieConfigurationDashboard } from '@/components/genie/GenieConfigurationDashboard';
export { GenieFeatureDeploymentBuilder } from '@/components/genie/GenieFeatureDeploymentBuilder';
export { GenieFeatureDropdown } from '@/components/genie/GenieFeatureDropdown';
export { GenieFeatureSelector } from '@/components/genie/GenieFeatureSelector';
export { GenieModelDropdown } from '@/components/genie/GenieModelDropdown';
export { GenieProviderStatusPanel } from '@/components/genie/GenieProviderStatusPanel';
export { GenieSessionManager } from '@/components/genie/GenieSessionManager';
export { GuidedHealthcareGenie } from '@/components/genie/GuidedHealthcareGenie';
export { HealthcareContextualGenie } from '@/components/genie/HealthcareContextualGenie';
export { HealthcareDataMapper } from '@/components/genie/HealthcareDataMapper';
export { HealthcareSchemaAnalyzer } from '@/components/genie/HealthcareSchemaAnalyzer';
export { HealthcareStepWizard } from '@/components/genie/HealthcareStepWizard';
export { HealthcareWorkflowMapper } from '@/components/genie/HealthcareWorkflowMapper';
export { StreamlinedModelSelector } from '@/components/genie/StreamlinedModelSelector';

// Genie diagrams
export * from '@/components/diagrams/genie-command-center';
