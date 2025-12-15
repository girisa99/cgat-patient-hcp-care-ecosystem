import { UseCaseNode } from './UseCaseNode';
import { AIModelsNode } from './AIModelsNode';
import { JourneyStagesNode } from './JourneyStagesNode';
import { WizardNode } from './WizardNode';
import { ActionsNode } from './ActionsNode';
import { ConnectorsNode } from './ConnectorsNode';
import { KnowledgeBaseNode } from './KnowledgeBaseNode';
import { TestingNode } from './TestingNode';
import { DeploymentNode } from './DeploymentNode';
import { AIIntelligenceNode } from './AIIntelligenceNode';
import { AgentNode } from './AgentNode';
import { DataSourceNode } from './DataSourceNode';
import { FlowiseInspiredNode } from './FlowiseInspiredNode';
import { TemplateConfigurationNode } from './TemplateConfigurationNode';
import { HumanInputNode } from './HumanInputNode';
import { AIModelConfigurationNode } from './AIModelConfigurationNode';
import { FlowControlConfigurationNode } from './FlowControlConfigurationNode';
import { HTTPConfigurationNode } from './HTTPConfigurationNode';
import VoiceConfigurationNode from './VoiceConfigurationNode';
import HealthcareComplianceConfigurationNode from './HealthcareComplianceConfigurationNode';
import { VectorStoreConfigurationNode } from './VectorStoreConfigurationNode';
import { TestingConfigurationNode } from './TestingConfigurationNode';
import { DeploymentConfigurationNode } from './DeploymentConfigurationNode';
import { DatabaseConfigurationNode } from './DatabaseConfigurationNode';

// Multi-Agent Node Components
import { 
  MULTI_AGENT_NODE_TYPES,
  A2AAgentNode,
  TaskHandoffNode,
  CommunicationHubNode,
  AgentTeamNode,
  SwarmDecisionNode,
  ToolSharingNode,
  ReActLoopNode,
  ToolChainNode,
  SelfReflectionNode,
  GoalDecompositionNode
} from './MultiAgentNodes';

// Document Processing Node Components
import {
  DOCUMENT_PROCESSING_NODE_TYPES,
  OCRDocumentNode,
  DocAINode,
  MetadataExtractionNode,
  FormRecognitionNode,
  ImageAnalysisNode,
  DocumentValidationNode,
  DataExtractionNode,
  DocumentComparisonNode,
  DocumentArchiveNode,
  DocumentToDatabaseNode
} from './DocumentProcessingNodes';

// Enhanced Agentic AI Node Components
import {
  ENHANCED_AGENTIC_NODE_TYPES,
  PlanExecuteNode,
  ReasoningChainNode,
  MemoryContextNode,
  CritiqueRefinementNode,
  MultiPerspectiveNode,
  KnowledgeIntegrationNode,
  HypothesisTestingNode,
  SkillCompositionNode,
  AdaptiveLearningNode,
  WorkflowOrchestratorNode
} from './EnhancedAgenticNodes';

// Medical Imaging Node Components
import {
  medicalImagingNodeTypes,
  XRayAnalysisNode,
  CTScanAnalysisNode,
  MRIAnalysisNode,
  ECGAnalysisNode,
  UltrasoundAnalysisNode,
  MammogramAnalysisNode,
  MultiProviderVisionNode
} from './MedicalImagingNodes';

// Export all node types
export { BaseWorkflowNode } from './BaseWorkflowNode';
export { UseCaseNode } from './UseCaseNode';
export { AIModelsNode } from './AIModelsNode';
export { JourneyStagesNode } from './JourneyStagesNode';
export { WizardNode } from './WizardNode';
export { ActionsNode } from './ActionsNode';
export { ConnectorsNode } from './ConnectorsNode';
export { KnowledgeBaseNode } from './KnowledgeBaseNode';
export { TestingNode } from './TestingNode';
export { DeploymentNode } from './DeploymentNode';
export { AIIntelligenceNode } from './AIIntelligenceNode';
export { AgentNode } from './AgentNode';
export { DataSourceNode } from './DataSourceNode';
export { FlowiseInspiredNode } from './FlowiseInspiredNode';
export { TemplateConfigurationNode } from './TemplateConfigurationNode';
export { HumanInputNode } from './HumanInputNode';
export { AIModelConfigurationNode } from './AIModelConfigurationNode';
export { FlowControlConfigurationNode } from './FlowControlConfigurationNode';
export { HTTPConfigurationNode } from './HTTPConfigurationNode';

// Export Multi-Agent nodes
export { 
  MULTI_AGENT_NODE_TYPES,
  A2AAgentNode,
  TaskHandoffNode,
  CommunicationHubNode,
  AgentTeamNode,
  SwarmDecisionNode,
  ToolSharingNode,
  ReActLoopNode,
  ToolChainNode,
  SelfReflectionNode,
  GoalDecompositionNode
} from './MultiAgentNodes';

// Export Document Processing nodes
export {
  DOCUMENT_PROCESSING_NODE_TYPES,
  OCRDocumentNode,
  DocAINode,
  MetadataExtractionNode,
  FormRecognitionNode,
  ImageAnalysisNode,
  DocumentValidationNode,
  DataExtractionNode,
  DocumentComparisonNode,
  DocumentArchiveNode,
  DocumentToDatabaseNode
} from './DocumentProcessingNodes';

// Export Enhanced Agentic AI nodes
export {
  ENHANCED_AGENTIC_NODE_TYPES,
  PlanExecuteNode,
  ReasoningChainNode,
  MemoryContextNode,
  CritiqueRefinementNode,
  MultiPerspectiveNode,
  KnowledgeIntegrationNode,
  HypothesisTestingNode,
  SkillCompositionNode,
  AdaptiveLearningNode,
  WorkflowOrchestratorNode
} from './EnhancedAgenticNodes';

// Export Medical Imaging nodes
export {
  medicalImagingNodeTypes,
  XRayAnalysisNode,
  CTScanAnalysisNode,
  MRIAnalysisNode,
  ECGAnalysisNode,
  UltrasoundAnalysisNode,
  MammogramAnalysisNode,
  MultiProviderVisionNode
} from './MedicalImagingNodes';

// All nodes are now managed through the database-driven workflow_node_types table
// This eliminates hardcoded registries and ensures consistency across the platform