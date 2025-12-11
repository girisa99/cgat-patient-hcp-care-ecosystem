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

// All nodes are now managed through the database-driven workflow_node_types table
// This eliminates hardcoded registries and ensures consistency across the platform