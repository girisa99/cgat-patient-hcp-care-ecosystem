import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  roles: string[]; // array of role names
}

async function fetchUsers(): Promise<UserRow[]> {
  try {
    // Use Supabase client instead of dbAdapter to respect RLS policies
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

    // Transform the data to match UserRow interface
    return (data || []).map(user => ({
      ...user,
      roles: [] // We'll add role fetching later if needed
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