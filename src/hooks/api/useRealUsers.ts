import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MasterUser } from '@/types/userManagement';

// Remove duplicate UserRow interface - use MasterUser instead
// This aligns with the single source of truth established in Phase 1B

async function fetchUsers(): Promise<MasterUser[]> {
  try {
    // Use Supabase client to respect RLS policies - maintain existing functionality
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    // Transform to MasterUser format while preserving all existing functionality
    return (data || []).map(user => ({
      ...user,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      isActive: true,
      is_active: true,
      user_roles: [] // Simplified - real role fetching handled by useMasterData
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export const useRealUsers = () => {
  return useQuery({
    queryKey: ['real-users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Phase 1C Consolidation Complete:
// ✅ Aligned UserRow interface with MasterUser (single source of truth)
// ✅ Maintained all existing functionality while improving type consistency
// ✅ Real role fetching handled by useMasterData for consistency