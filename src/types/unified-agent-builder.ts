export interface UseCase {
  id: string;
  name: string;
  description: string;
  category: 'healthcare' | 'customer-service' | 'automation' | 'analytics' | 'custom';
  complexity: 'simple' | 'moderate' | 'complex';
  recommended_journey: JourneyStage[];
  required_components: ComponentType[];
  optional_components: ComponentType[];
  templates: {
    canvas_layout?: any;
    default_actions?: any[];
    suggested_connectors?: any[];
    knowledge_sources?: any[];
    voice_config?: any;
    deployment_profile?: any;
  };
}

export interface ComponentType {
  id: string;
  name: string;
  category: 'core' | 'integration' | 'deployment' | 'enhancement';
  dependencies: string[];
  provides: string[];
}

export interface UnifiedAgentState {
  // Core Info
  id?: string;
  name: string;
  description?: string;
  use_case: UseCase;
  
  // Journey Management
  current_journey_stage: string;
  completed_stages: string[];
  custom_journey?: JourneyStage[];
  
  // User Experience Preferences
  user_mode: 'guided' | 'visual' | 'expert' | 'hybrid';
  show_suggestions: boolean;
  auto_progress: boolean;
  
  // Component States (unified)
  canvas: CanvasState;
  actions: ActionsState;
  knowledge: KnowledgeState;
  connectors: ConnectorsState;
  deployment: DeploymentState;
  voice_channels: VoiceChannelState;
  
  // System Intelligence
  suggestions: SmartSuggestion[];
  validation_results: ValidationResult[];
  completion_score: number;
}

export interface SmartSuggestion {
  id: string;
  type: 'next_step' | 'enhancement' | 'optimization' | 'fix_issue';
  component: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: () => void;
  auto_apply?: boolean;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: any;
}

export interface CanvasState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  layout_type: 'vertical' | 'horizontal' | 'radial' | 'custom';
  auto_layout: boolean;
  journey_sync: boolean; // Automatically updates journey when canvas changes
}

export interface FlowNode {
  id: string;
  type: 'journey_stage' | 'action' | 'decision' | 'connector' | 'knowledge' | 'deployment';
  position: { x: number; y: number };
  data: {
    label: string;
    component_data: any;
    journey_stage_id?: string;
    dependencies: string[];
    outputs: string[];
  };
}

export interface ActionConfig {
  id: string;
  name: string;
  type: string;
  config: any;
  enabled?: boolean;
}

export interface ActionTemplate {
  id: string;
  name: string;
  description: string;
  config: any;
}

export interface ActionsState {
  assigned_actions: ActionConfig[];
  custom_actions: ActionConfig[];
  templates: ActionTemplate[];
  execution_order: string[];
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'document' | 'url' | 'api' | 'database';
  config: any;
}

export interface EmbeddingsConfig {
  provider?: string;
  model?: string;
  dimensions?: number;
}

export interface RAGSettings {
  chunk_size?: number;
  chunk_overlap?: number;
  retrieval_method?: string;
}

export interface KnowledgeState {
  sources: KnowledgeSource[];
  embeddings_config: EmbeddingsConfig;
  rag_settings: RAGSettings;
  auto_sync: boolean;
}

export interface APIIntegration {
  id: string;
  name: string;
  type: string;
  config: any;
  enabled: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  type: string;
  config: any;
  status: 'active' | 'inactive';
}

export interface CustomConnector {
  id: string;
  name: string;
  type: string;
  config: any;
}

export interface AuthConfig {
  id: string;
  type: string;
  config: any;
}

export interface ConnectorsState {
  api_integrations: APIIntegration[];
  mcp_servers: MCPServer[];
  custom_connectors: CustomConnector[];
  authentication: AuthConfig[];
}

export interface ScalingConfig {
  min_instances?: number;
  max_instances?: number;
  auto_scale?: boolean;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  type: string;
  config: any;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: any[];
}

export interface ChannelDeployment {
  id: string;
  channel: string;
  status: string;
  config: any;
}

export interface DeploymentState {
  environment: 'development' | 'staging' | 'production';
  scaling_config: ScalingConfig;
  ai_models: AIModelConfig[];
  monitoring: MonitoringConfig;
  channels: ChannelDeployment[];
}

export interface VoiceConfig {
  id: string;
  name: string;
  provider: string;
  settings: any;
}

export interface ChannelAssignment {
  id: string;
  channel: string;
  config: any;
}

export interface TelephonyConfig {
  provider?: string;
  settings?: any;
}

export interface SpeechConfig {
  language?: string;
  voice?: string;
  speed?: number;
}

export interface VoiceChannelState {
  voice_configs: VoiceConfig[];
  channel_assignments: ChannelAssignment[];
  telephony_settings: TelephonyConfig;
  speech_settings: SpeechConfig;
}

export interface ValidationResult {
  component: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  fix_suggestions: SmartSuggestion[];
}

export interface JourneyStage {
  id: string;
  title: string;
  description?: string;
  type: 'information_gathering' | 'decision_point' | 'action_required' | 'completion';
  components_involved: ComponentType[];
  canvas_node_id?: string;
  validation_rules?: any;
  auto_progress_conditions?: any;
}

// Use case templates
export const USE_CASE_TEMPLATES: UseCase[] = [
  {
    id: 'patient_intake',
    name: 'Patient Intake Assistant',
    description: 'Automated patient registration and initial assessment',
    category: 'healthcare',
    complexity: 'moderate',
    recommended_journey: [
      { id: 'patient_info', title: 'Gather Patient Information', type: 'information_gathering', components_involved: [] },
      { id: 'insurance_verify', title: 'Insurance Verification', type: 'action_required', components_involved: [] },
      { id: 'schedule_appointment', title: 'Schedule Appointment', type: 'action_required', components_involved: [] }
    ],
    required_components: [
      { id: 'forms_integration', name: 'Forms Integration', category: 'integration', dependencies: [], provides: ['patient_data'] },
      { id: 'ehr_connector', name: 'EHR Connector', category: 'integration', dependencies: [], provides: ['medical_records'] }
    ],
    optional_components: [
      { id: 'voice_interface', name: 'Voice Interface', category: 'enhancement', dependencies: [], provides: ['voice_interaction'] }
    ],
    templates: {
      canvas_layout: { type: 'vertical', auto_layout: true },
      default_actions: [
        { name: 'collect_patient_info', type: 'form', config: {} },
        { name: 'verify_insurance', type: 'api_call', config: {} }
      ],
      suggested_connectors: ['epic_fhir', 'insurance_api'],
      knowledge_sources: ['medical_terminology', 'insurance_policies'],
      voice_config: { enabled: true, language: 'en-US' }
    }
  }
];