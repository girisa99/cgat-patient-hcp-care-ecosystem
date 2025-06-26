
export function buildAuditLogQuery(supabase: any, filters?: any) {
  let query = supabase
    .from('audit_logs')
    .select('*');

  if (filters) {
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.table_name) {
      query = query.eq('table_name', filters.table_name);
    }
    if (filters.action_type) {
      query = query.eq('action', filters.action_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
  }

  return query;
}

export async function executeAuditLogQuery(query: any, action: string, filters?: any) {
  switch (action) {
    case 'get_logs':
      return await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

    case 'get_user_activity':
      if (!filters?.user_id) {
        throw new Error('User ID is required for user activity');
      }
      
      return await query
        .eq('user_id', filters.user_id)
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

    case 'get_table_changes':
      if (!filters?.table_name) {
        throw new Error('Table name is required for table changes');
      }
      
      return await query
        .eq('table_name', filters.table_name)
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

    case 'export_logs':
      return await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 1000);

    default:
      throw new Error('Invalid action');
  }
}
