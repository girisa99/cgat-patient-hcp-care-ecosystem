export interface AgentChannelDeployment {
  id: string;
  agent_id: string;
  channel_id: string;
  channel_type: 'voice-call' | 'web-chat' | 'email' | 'messaging' | 'voice-assistant' | 'instagram';
  deployment_status: 'pending' | 'active' | 'paused' | 'failed' | 'stopped';
  deployment_config: {
    auto_scaling?: boolean;
    load_balancing?: boolean;
    failover_enabled?: boolean;
    custom_settings?: Record<string, any>;
  };
  priority: number;
  max_concurrent_sessions?: number;
  assigned_at: string;
  deployed_at?: string;
  last_health_check?: string;
  health_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  performance_metrics: {
    response_time_avg?: number;
    success_rate?: number;
    active_sessions?: number;
    total_requests?: number;
    error_rate?: number;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
  [key: string]: any;
}

export interface VoiceProvider {
  id: string;
  name: string;
  provider_type: 'five9' | 'genesys' | 'avaya' | 'twilio' | 'vonage' | 'voxiplant';
  configuration: {
    base_url: string;
    version: string;
    region?: string;
    custom_settings?: Record<string, any>;
  };
  api_credentials: {
    encrypted: boolean;
    credential_fields: string[];
    [key: string]: any;
  };
  capabilities: {
    languages: string[];
    voice_quality: string;
    features: string[];
    [key: string]: any;
  };
  rate_limits: {
    calls_per_minute?: number;
    concurrent_calls?: number;
    data_transfer_limit?: number;
  };
  webhook_config: {
    endpoint_url?: string;
    events?: string[];
    security?: Record<string, any>;
  };
  health_check_config: {
    endpoint?: string;
    interval_seconds?: number;
    timeout_seconds?: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AgentChannelAssignment {
  agent: {
    id: string;
    name: string;
    status: string;
  };
  channels: {
    channel_id: string;
    channel_type: string;
    deployment_status: string;
    deployment_config: Record<string, any>;
    performance_metrics: Record<string, any>;
  }[];
}

export interface ChannelCapacity {
  channel_id: string;
  channel_type: string;
  max_agents?: number;
  assigned_agents: number;
  available_slots: number;
  is_at_capacity: boolean;
}

export interface DeploymentHealth {
  deployment_id: string;
  agent_id: string;
  channel_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  last_check: string;
  metrics: {
    response_time: number;
    success_rate: number;
    error_rate: number;
    active_sessions: number;
  };
  alerts: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }[];
}