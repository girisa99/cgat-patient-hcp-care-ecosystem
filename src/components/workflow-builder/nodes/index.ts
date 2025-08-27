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

// Node type registry for ReactFlow - Each node type gets its specialized configuration component
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
  
  // AI Model & Processing nodes - specialized AI configuration
  openai_agent: AIModelConfigurationNode,
  anthropic_agent: AIModelConfigurationNode,
  deepseek_agent: AIModelConfigurationNode,
  react_agent_llm: AIModelConfigurationNode,
  xml_agent: AIModelConfigurationNode,
  llm_chain: AIModelConfigurationNode,
  ollama_llama3: AIModelConfigurationNode,
  phi3_mini: AIModelConfigurationNode,
  
  // Flow Control nodes - specialized flow configuration
  agent_flow: FlowControlConfigurationNode,
  condition_flow: FlowControlConfigurationNode,
  iteration_flow: FlowControlConfigurationNode,
  start_flow: FlowControlConfigurationNode,
  human_input_flow: FlowControlConfigurationNode,
  
  // HTTP & API nodes - specialized HTTP configuration
  api_endpoint: HTTPConfigurationNode,
  webhook_listener: HTTPConfigurationNode,
  
  // Template and Configuration nodes
  templateConfigurationNode: TemplateConfigurationNode,
  humanInputNode: HumanInputNode,
  
  // Human in the Loop nodes
  human_handoff: HumanInputNode,
  escalation_trigger: FlowControlConfigurationNode,
  agent_transfer: FlowControlConfigurationNode,
  supervision_mode: HumanInputNode,
  approval_workflow: FlowControlConfigurationNode,
  
  // Workflow execution nodes
  start: FlowControlConfigurationNode,
  condition: FlowControlConfigurationNode,
  decision: FlowControlConfigurationNode,
  llm: AIModelConfigurationNode, // Use specialized AI model configuration
  agent: AIModelConfigurationNode,
  human_input: HumanInputNode, // Use specialized human input node
  loop: FlowControlConfigurationNode,
  iteration: FlowControlConfigurationNode,
  execute_flow: FlowControlConfigurationNode,
  direct_reply: TemplateConfigurationNode,
  http: HTTPConfigurationNode, // Use specialized HTTP configuration
  tools: FlowiseInspiredNode,
  retriever: FlowiseInspiredNode,
  custom_function: TemplateConfigurationNode,
  stick_note: TemplateConfigurationNode,
  customer: FlowiseInspiredNode,
  database: FlowiseInspiredNode,
  
  // Code & Deployment nodes
  code_snippet: TemplateConfigurationNode,
  docker_container: FlowiseInspiredNode,
  kubernetes_pod: FlowiseInspiredNode,
  deployment_pipeline: FlowiseInspiredNode,
  
  // Testing & Validation nodes
  flow_tester: FlowiseInspiredNode,
  response_validator: FlowControlConfigurationNode,
  load_tester: FlowiseInspiredNode,
  debug_console: FlowiseInspiredNode,
  
  // Template node variants - each gets specific template configuration
  prompt_template_system_prompt: TemplateConfigurationNode,
  prompt_template_few_shot: TemplateConfigurationNode,
  prompt_template_instruction: TemplateConfigurationNode,
  prompt_template_conversation: TemplateConfigurationNode,
  prompt_template_analysis: TemplateConfigurationNode,
  prompt_template_creative: TemplateConfigurationNode,
  agent_template: TemplateConfigurationNode,
};