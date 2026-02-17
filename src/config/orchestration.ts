// Orchestration defaults and registries used by prompt + visual modes
// Keep this file small and focused on declarative lists (no business logic)

export const DEFAULT_MODEL_AUTO_ID = 'auto-hybrid';
export const DEFAULT_MODEL_AUTO_LABEL = 'Auto (Claude/OpenAI)';
export const AUTOSUGGEST_MODE = 'apply_on_click' as const;
export type AutosuggestMode = typeof AUTOSUGGEST_MODE;

export interface ChannelDef {
  id: string;
  label: string;
}

export interface ConnectorDef {
  id: string;
  label: string;
}

export const CHANNELS: ChannelDef[] = [
  { id: 'web_chat', label: 'Web Chat' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'voice', label: 'Voice' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'uber', label: 'Uber' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'conversational', label: 'Conversational' },
];

export const CONNECTORS: ConnectorDef[] = [
  { id: 'salesforce', label: 'Salesforce' },
  { id: 'ehr', label: 'EHR' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'slack', label: 'Slack' },
  { id: 'uber', label: 'Uber' },
  { id: 'video', label: 'Video' },
  { id: 'map', label: 'Map' },
  { id: 'veeva', label: 'Veeva' },
  { id: 'supabase', label: 'Supabase' },
  { id: 'postgres', label: 'Postgres' },
  { id: 'mongodb', label: 'MongoDB' },
  { id: 'oracle', label: 'Oracle' },
];

// Reserved: used by orchestrator for display, not persisted directly
export const HYBRID_AUTO_HINT = `${DEFAULT_MODEL_AUTO_LABEL} selects between Claude and OpenAI dynamically per turn.`;
