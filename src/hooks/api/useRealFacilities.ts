import { useQuery } from '@tanstack/react-query';
import { dbAdapter } from '@/utils/db';

export interface FacilityRow {
  id: string;
  name: string;
  facility_type: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean | null;
  created_at: string;
}

async function fetchFacilities(): Promise<FacilityRow[]> {
  const sql = `SELECT id, name, facility_type, address, phone, email, is_active, created_at
               FROM facilities
               ORDER BY created_at DESC
               LIMIT 500`;
  return dbAdapter.query<FacilityRow>(sql);
}

export const useRealFacilities = () => {
  return useQuery({
    queryKey: ['real-facilities'],
    queryFn: fetchFacilities,
    staleTime: 1000 * 60,
  });
};