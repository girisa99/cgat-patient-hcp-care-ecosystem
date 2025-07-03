import { useQuery } from '@tanstack/react-query';
import { dbAdapter } from '@/utils/db';

export interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  roles: string[]; // array of role names
}

async function fetchUsers(): Promise<UserRow[]> {
  // Basic select with role aggregation
  const sql = `
    SELECT p.id,
           p.email,
           p.first_name,
           p.last_name,
           p.created_at,
           COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
    FROM profiles p
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    LEFT JOIN roles r ON r.id = ur.role_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 500`;

  return dbAdapter.query<UserRow>(sql);
}

export const useRealUsers = () => {
  return useQuery({
    queryKey: ['real-users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60, // 1 minute
  });
};