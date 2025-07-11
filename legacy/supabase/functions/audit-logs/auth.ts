
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export async function verifyAuthentication(req: Request) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
  
  if (authError || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user, error: null };
}

export async function checkSuperAdminPermission(supabase: any, userId: string) {
  const { data: hasPermission } = await supabase.rpc('has_role', {
    user_id: userId,
    role_name: 'superAdmin'
  });

  return hasPermission;
}
