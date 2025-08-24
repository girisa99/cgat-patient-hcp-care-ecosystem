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

// Node type registry for ReactFlow
export const workflowNodeTypes = {
  useCaseNode: UseCaseNode,
  aiModelsNode: AIModelsNode,
  journeyStagesNode: JourneyStagesNode,
  wizardNode: WizardNode,
  actionsNode: ActionsNode,
  connectorsNode: ConnectorsNode,
  knowledgeBaseNode: KnowledgeBaseNode,
  testingNode: TestingNode,
  deploymentNode: DeploymentNode,
  aiIntelligence: FlowiseInspiredNode,
  agentNode: FlowiseInspiredNode,
  dataSource: FlowiseInspiredNode,
  // Workflow execution nodes
  start: FlowiseInspiredNode,
  condition: FlowiseInspiredNode,
  decision: FlowiseInspiredNode,
  llm: FlowiseInspiredNode,
  agent: FlowiseInspiredNode,
  human_input: FlowiseInspiredNode,
  loop: FlowiseInspiredNode,
  iteration: FlowiseInspiredNode,
  execute_flow: FlowiseInspiredNode,
  direct_reply: FlowiseInspiredNode,
  http: FlowiseInspiredNode,
  tools: FlowiseInspiredNode,
  retriever: FlowiseInspiredNode,
  custom_function: FlowiseInspiredNode,
  stick_note: FlowiseInspiredNode,
  customer: FlowiseInspiredNode,
  database: FlowiseInspiredNode,
};