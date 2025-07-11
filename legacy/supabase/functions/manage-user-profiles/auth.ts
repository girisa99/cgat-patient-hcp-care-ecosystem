
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

export async function verifyAuthentication(authHeader: string | null) {
  if (!authHeader) {
    console.error('❌ [MANAGE-USER-PROFILES] No authorization header provided');
    return { user: null, error: 'Missing authorization header', supabase: null };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token || token === 'null' || token === 'undefined') {
    console.error('❌ [MANAGE-USER-PROFILES] Invalid or missing token');
    return { user: null, error: 'Invalid authorization token', supabase: null };
  }

  console.log('🔐 [MANAGE-USER-PROFILES] Verifying authentication with token...');

  try {
    // Create Supabase client for edge function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ [MANAGE-USER-PROFILES] Failed to verify user:', userError);
      return { user: null, error: userError?.message || 'Authentication failed', supabase: null };
    }

    console.log('✅ [MANAGE-USER-PROFILES] User authenticated:', user.email);

    // Create service role client for database operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    return { user, error: null, supabase: serviceSupabase };
  } catch (error: any) {
    console.error('❌ [MANAGE-USER-PROFILES] Authentication error:', error);
    return { user: null, error: 'Authentication verification failed', supabase: null };
  }
}

export async function checkPermissions(supabase: any, userId: string, targetUserId: string) {
  console.log('🔍 [MANAGE-USER-PROFILES] Checking permissions for user:', userId, 'target:', targetUserId);
  
  try {
    // Users can always access their own data
    if (userId === targetUserId) {
      console.log('✅ [MANAGE-USER-PROFILES] User accessing own data - permission granted');
      return { hasPermission: true, error: null };
    }

    // Check if user has admin role using service role client
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('user_has_role', { 
        check_user_id: userId, 
        role_name: 'superAdmin' 
      });

    if (adminError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error checking admin role:', adminError);
      return { hasPermission: false, error: 'Permission check failed' };
    }

    if (adminCheck) {
      console.log('✅ [MANAGE-USER-PROFILES] Super admin access granted');
      return { hasPermission: true, error: null };
    }

    // Check for onboarding team role
    const { data: onboardingCheck, error: onboardingError } = await supabase
      .rpc('user_has_role', { 
        check_user_id: userId, 
        role_name: 'onboardingTeam' 
      });

    if (onboardingError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error checking onboarding role:', onboardingError);
      return { hasPermission: false, error: 'Permission check failed' };
    }

    if (onboardingCheck) {
      console.log('✅ [MANAGE-USER-PROFILES] Onboarding team access granted');
      return { hasPermission: true, error: null };
    }

    console.log('❌ [MANAGE-USER-PROFILES] No sufficient permissions found');
    return { hasPermission: false, error: 'Insufficient permissions' };
  } catch (error: any) {
    console.error('❌ [MANAGE-USER-PROFILES] Permission check error:', error);
    return { hasPermission: false, error: 'Permission verification failed' };
  }
}

export async function checkListPermissions(supabase: any, userId: string) {
  console.log('🔍 [MANAGE-USER-PROFILES] Checking list permissions for user:', userId);
  
  try {
    // Check if user has admin role
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('user_has_role', { 
        check_user_id: userId, 
        role_name: 'superAdmin' 
      });

    if (adminError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error checking admin role:', adminError);
      return { hasPermission: false, error: 'Permission check failed' };
    }

    if (adminCheck) {
      console.log('✅ [MANAGE-USER-PROFILES] Super admin list access granted');
      return { hasPermission: true, error: null };
    }

    // Check for onboarding team role
    const { data: onboardingCheck, error: onboardingError } = await supabase
      .rpc('user_has_role', { 
        check_user_id: userId, 
        role_name: 'onboardingTeam' 
      });

    if (onboardingError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error checking onboarding role:', onboardingError);
      return { hasPermission: false, error: 'Permission check failed' };
    }

    if (onboardingCheck) {
      console.log('✅ [MANAGE-USER-PROFILES] Onboarding team list access granted');
      return { hasPermission: true, error: null };
    }

    console.log('❌ [MANAGE-USER-PROFILES] No list permissions found');
    return { hasPermission: false, error: 'Insufficient permissions to list users' };
  } catch (error: any) {
    console.error('❌ [MANAGE-USER-PROFILES] List permission check error:', error);
    return { hasPermission: false, error: 'Permission verification failed' };
  }
}
