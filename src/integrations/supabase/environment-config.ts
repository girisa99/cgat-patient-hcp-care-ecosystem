/**
 * Multi-Environment Supabase Configuration
 * 
 * Maps environments to their respective Supabase project credentials.
 * DEV: Current production project (ithspbabhmdntioslfqe) - repurposed as dev
 * UAT: Placeholder - update when genie-suite-uat project is created
 * PROD: Placeholder - update when genie-suite-prod project is created
 */

import type { Environment } from '@/services/environmentService';

export interface SupabaseEnvironmentConfig {
  url: string;
  anonKey: string;
  projectRef: string;
  label: string;
}

const SUPABASE_CONFIGS: Record<Environment, SupabaseEnvironmentConfig> = {
  local: {
    url: 'https://ithspbabhmdntioslfqe.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw',
    projectRef: 'ithspbabhmdntioslfqe',
    label: 'Local → DEV',
  },
  development: {
    url: 'https://ithspbabhmdntioslfqe.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw',
    projectRef: 'ithspbabhmdntioslfqe',
    label: 'DEV (genie-suite-dev)',
  },
  uat: {
    url: 'https://epqsuaccpafjoqwtpajo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXN1YWNjcGFmam9xd3RwYWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODI0MTAsImV4cCI6MjA4NjY1ODQxMH0.SCF8u1izAOhb3OcAVO4ilKJ8ANCoDNcANhxrn-RFTto',
    projectRef: 'epqsuaccpafjoqwtpajo',
    label: 'UAT (genie-suite-uat)',
  },
  production: {
    // TODO: Replace with genie-suite-prod project credentials
    url: 'https://REPLACE_WITH_PROD_PROJECT_REF.supabase.co',
    anonKey: 'REPLACE_WITH_PROD_ANON_KEY',
    projectRef: 'REPLACE_WITH_PROD_PROJECT_REF',
    label: 'PROD (genie-suite-prod)',
  },
};

/**
 * Get Supabase config for a given environment
 */
export function getSupabaseConfig(env: Environment): SupabaseEnvironmentConfig {
  return SUPABASE_CONFIGS[env];
}

/**
 * Check if an environment has real credentials configured (not placeholders)
 */
export function isEnvironmentConfigured(env: Environment): boolean {
  const config = SUPABASE_CONFIGS[env];
  return !config.url.includes('REPLACE_WITH') && !config.anonKey.includes('REPLACE_WITH');
}

/**
 * Get all configured environments
 */
export function getConfiguredEnvironments(): Environment[] {
  return (Object.keys(SUPABASE_CONFIGS) as Environment[]).filter(isEnvironmentConfigured);
}
