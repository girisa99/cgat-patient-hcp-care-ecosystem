
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export async function verifyAuthentication(authHeader: string | null) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user, error: null, supabase };
}

export async function checkPermissions(supabase: any, userId: string, targetUserId: string) {
  if (targetUserId === userId) {
    return { hasPermission: true, error: null };
  }

  const { data: hasPermission } = await supabase.rpc('has_role', {
    user_id: userId,
    role_name: 'superAdmin'
  });
  
  if (hasPermission) {
    return { hasPermission: true, error: null };
  }

  const { data: hasOnboardingRole } = await supabase.rpc('has_role', {
    user_id: userId,
    role_name: 'onboardingTeam'
  });
  
  if (hasOnboardingRole) {
    return { hasPermission: true, error: null };
  }

  return { hasPermission: false, error: 'Insufficient permissions' };
}

export async function checkListPermissions(supabase: any, userId: string) {
  const { data: canList } = await supabase.rpc('has_role', {
    user_id: userId,
    role_name: 'superAdmin'
  });
  
  if (canList) {
    return { hasPermission: true, error: null };
  }

  const { data: hasManagerRole } = await supabase.rpc('has_role', {
    user_id: userId,
    role_name: 'caseManager'
  });
  
  if (hasManagerRole) {
    return { hasPermission: true, error: null };
  }

  return { hasPermission: false, error: 'Insufficient permissions' };
}
