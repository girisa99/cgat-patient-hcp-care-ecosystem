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
  
  // Template and Configuration nodes
  templateConfigurationNode: TemplateConfigurationNode,
  humanInputNode: HumanInputNode,
  
  // Workflow execution nodes
  start: FlowiseInspiredNode,
  condition: FlowiseInspiredNode,
  decision: FlowiseInspiredNode,
  llm: TemplateConfigurationNode, // Use customized LLM configuration
  agent: FlowiseInspiredNode,
  human_input: HumanInputNode, // Use specialized human input node
  loop: FlowiseInspiredNode,
  iteration: FlowiseInspiredNode,
  execute_flow: TemplateConfigurationNode, // Use customized execute flow configuration
  direct_reply: FlowiseInspiredNode,
  http: TemplateConfigurationNode, // Use customized HTTP configuration
  tools: FlowiseInspiredNode,
  retriever: FlowiseInspiredNode,
  custom_function: FlowiseInspiredNode,
  stick_note: FlowiseInspiredNode,
  customer: FlowiseInspiredNode,
  database: FlowiseInspiredNode,
  
  // Template node variants
  prompt_template_system_prompt: TemplateConfigurationNode,
  prompt_template_few_shot: TemplateConfigurationNode,
  prompt_template_instruction: TemplateConfigurationNode,
  prompt_template_conversation: TemplateConfigurationNode,
  prompt_template_analysis: TemplateConfigurationNode,
  prompt_template_creative: TemplateConfigurationNode,
  agent_template: TemplateConfigurationNode,
};