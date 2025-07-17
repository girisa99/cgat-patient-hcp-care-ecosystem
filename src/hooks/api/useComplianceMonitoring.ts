import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceReport {
  id: string;
  report_type: string;
  compliance_score: number;
  total_violations: number | null;
  violations_by_severity: Record<string, any> | null;
  generated_at: string;
  report_data: Record<string, any>;
  recommendations: any[] | null;
}

export const useComplianceMonitoring = () => {
  return useQuery({
    queryKey: ['compliance-monitoring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ComplianceReport[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
};