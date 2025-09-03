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

// CONSOLIDATED NODE REGISTRY - 84 Unique Nodes Across 12 Categories
// Removed duplicates, merged with database configurations for intelligent consolidation
export const workflowNodeTypes = {
  // Core Workflow Nodes (Legacy - Keep for backward compatibility)
  useCaseNode: UseCaseNode,
  aiModelsNode: AIModelsNode,
  journeyStagesNode: JourneyStagesNode,
  wizardNode: WizardNode,
  actionsNode: ActionsNode,
  connectorsNode: ConnectorsNode,
  knowledgeBaseNode: KnowledgeBaseNode,
  testingNode: TestingNode,
  deploymentNode: DeploymentNode,
  
  // CONSOLIDATED DATABASE-CONFIGURED NODES (84 total)
  
  // 1. Document Loaders (7 nodes)
  pdf_loader: FlowiseInspiredNode,
  csv_loader: FlowiseInspiredNode,
  json_loader: FlowiseInspiredNode,
  xml_loader: FlowiseInspiredNode,
  html_loader: FlowiseInspiredNode,
  text_loader: FlowiseInspiredNode,
  docx_loader: FlowiseInspiredNode,
  
  // 2. GenAI & LLM (12 nodes)
  openai_gpt4: AIModelConfigurationNode,
  openai_gpt35: AIModelConfigurationNode,
  anthropic_claude: AIModelConfigurationNode,
  google_gemini: AIModelConfigurationNode,
  meta_llama: AIModelConfigurationNode,
  mistral_ai: AIModelConfigurationNode,
  cohere_command: AIModelConfigurationNode,
  deepseek_coder: AIModelConfigurationNode,
  ollama_local: AIModelConfigurationNode,
  huggingface_inference: AIModelConfigurationNode,
  openrouter_models: AIModelConfigurationNode,
  azure_openai: AIModelConfigurationNode,
  
  // 3. Vector Stores (8 nodes)
  pinecone_store: VectorStoreConfigurationNode,
  chromadb_store: VectorStoreConfigurationNode,
  weaviate_store: VectorStoreConfigurationNode,
  qdrant_store: VectorStoreConfigurationNode,
  milvus_store: VectorStoreConfigurationNode,
  faiss_store: VectorStoreConfigurationNode,
  pgvector_store: VectorStoreConfigurationNode,
  redis_vector: VectorStoreConfigurationNode,
  
  // 4. Healthcare & Compliance (9 nodes)
  hipaa_compliance: HealthcareComplianceConfigurationNode,
  hl7_fhir: HealthcareComplianceConfigurationNode,
  icd_10_codes: HealthcareComplianceConfigurationNode,
  cpt_codes: HealthcareComplianceConfigurationNode,
  npi_validation: HealthcareComplianceConfigurationNode,
  phi_detection: HealthcareComplianceConfigurationNode,
  clinical_notes: HealthcareComplianceConfigurationNode,
  medication_management: HealthcareComplianceConfigurationNode,
  care_plan_generator: HealthcareComplianceConfigurationNode,
  
  // 5. Tools & Utilities (8 nodes)
  web_scraper: FlowiseInspiredNode,
  email_sender: FlowiseInspiredNode,
  calendar_integration: FlowiseInspiredNode,
  file_processor: FlowiseInspiredNode,
  data_validator: FlowiseInspiredNode,
  json_parser: FlowiseInspiredNode,
  regex_matcher: FlowiseInspiredNode,
  url_shortener: FlowiseInspiredNode,
  
  // 6. Code & Deployment (6 nodes)
  github_integration: DeploymentConfigurationNode,
  docker_deployment: DeploymentConfigurationNode,
  kubernetes_deploy: DeploymentConfigurationNode,
  ci_cd_pipeline: DeploymentConfigurationNode,
  code_generator: DeploymentConfigurationNode,
  api_generator: DeploymentConfigurationNode,
  
  // 7. Voice Configuration (5 nodes)
  speech_to_text: VoiceConfigurationNode,
  text_to_speech: VoiceConfigurationNode,
  voice_assistant: VoiceConfigurationNode,
  audio_processing: VoiceConfigurationNode,
  voice_biometrics: VoiceConfigurationNode,
  
  // 8. Channel Deployment (6 nodes)
  web_chat: DeploymentConfigurationNode,
  whatsapp_bot: DeploymentConfigurationNode,
  slack_integration: DeploymentConfigurationNode,
  teams_integration: DeploymentConfigurationNode,
  telegram_bot: DeploymentConfigurationNode,
  discord_bot: DeploymentConfigurationNode,
  
  // 9. Agent Flows (5 nodes)
  multi_agent_orchestrator: FlowControlConfigurationNode,
  agent_collaboration: FlowControlConfigurationNode,
  task_delegation: FlowControlConfigurationNode,
  consensus_building: FlowControlConfigurationNode,
  agent_monitoring: FlowControlConfigurationNode,
  
  // 10. Human Loop (4 nodes)
  human_review: HumanInputNode,
  approval_gate: HumanInputNode,
  escalation_handler: HumanInputNode,
  feedback_collector: HumanInputNode,
  
  // 11. Cache & Memory (5 nodes)
  redis_cache: DatabaseConfigurationNode,
  memory_buffer: DatabaseConfigurationNode,
  conversation_memory: DatabaseConfigurationNode,
  semantic_cache: DatabaseConfigurationNode,
  session_store: DatabaseConfigurationNode,
  
  // 12. MCP Protocol (24 nodes) - Comprehensive MCP Server Integration
  filesystem_mcp: FlowiseInspiredNode,
  database_mcp: DatabaseConfigurationNode,
  websearch_mcp: FlowiseInspiredNode,
  email_mcp: FlowiseInspiredNode,
  calendar_mcp: FlowiseInspiredNode,
  notification_mcp: FlowiseInspiredNode,
  memory_mcp: DatabaseConfigurationNode,
  analytics_mcp: FlowiseInspiredNode,
  weather_mcp: FlowiseInspiredNode,
  slack_mcp: FlowiseInspiredNode,
  github_mcp: DeploymentConfigurationNode,
  jira_mcp: FlowiseInspiredNode,
  salesforce_mcp: FlowiseInspiredNode,
  stripe_mcp: FlowiseInspiredNode,
  shopify_mcp: FlowiseInspiredNode,
  wordpress_mcp: FlowiseInspiredNode,
  docker_mcp: DeploymentConfigurationNode,
  kubernetes_mcp: DeploymentConfigurationNode,
  aws_mcp: DeploymentConfigurationNode,
  gcp_mcp: DeploymentConfigurationNode,
  azure_mcp: DeploymentConfigurationNode,
  terraform_mcp: DeploymentConfigurationNode,
  jenkins_mcp: DeploymentConfigurationNode,
  monitoring_mcp: FlowiseInspiredNode,
};