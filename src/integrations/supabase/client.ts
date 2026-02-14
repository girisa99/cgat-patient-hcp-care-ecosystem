// Multi-environment Supabase client
// Automatically selects DEV/UAT/PROD credentials based on current domain
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { environmentService } from '@/services/environmentService';
import { getSupabaseConfig, isEnvironmentConfigured } from './environment-config';

const env = environmentService.detectEnvironment();
const config = getSupabaseConfig(env);

// Fall back to DEV if environment credentials are placeholders
const resolvedConfig = isEnvironmentConfigured(env) 
  ? config 
  : (() => {
      console.warn(
        `[Supabase] Environment "${env}" not configured yet. Falling back to DEV.`
      );
      return getSupabaseConfig('development');
    })();

const SUPABASE_URL = resolvedConfig.url;
const SUPABASE_ANON_KEY = resolvedConfig.anonKey;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);