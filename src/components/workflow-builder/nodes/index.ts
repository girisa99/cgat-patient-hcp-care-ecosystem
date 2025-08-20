import { UseCaseNode } from './UseCaseNode';
import { AIModelsNode } from './AIModelsNode';
import { JourneyStagesNode } from './JourneyStagesNode';
import { WizardNode } from './WizardNode';
import { ActionsNode } from './ActionsNode';
import { ConnectorsNode } from './ConnectorsNode';
import { KnowledgeBaseNode } from './KnowledgeBaseNode';
import { TestingNode } from './TestingNode';
import { DeploymentNode } from './DeploymentNode';

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
};