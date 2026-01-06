/**
 * Smart Document Studio Components
 * Unified export point for all studio components
 */

export { SmartDocumentStudio } from './SmartDocumentStudio';
export { DocumentUploadZone } from './DocumentUploadZone';
export { DocumentCharacteristicsPanel } from './DocumentCharacteristicsPanel';
export { LiveExtractionPanel } from './LiveExtractionPanel';
export { SideBySideEditor } from './SideBySideEditor';
export { FieldConfirmationCard } from './FieldConfirmationCard';
export { ReviewGateBar } from './ReviewGateBar';
export { AgentFindingsPanel } from './AgentFindingsPanel';
export { AutoConfigPanel } from './AutoConfigPanel';
export { AddCustomAgentDialog } from './AddCustomAgentDialog';

export type {
  DocumentCharacteristics,
  ExtractedField,
  AgentFinding,
  ModelRoutingInfo
} from './SmartDocumentStudio';

export type { CustomAgentConfig } from './AddCustomAgentDialog';
