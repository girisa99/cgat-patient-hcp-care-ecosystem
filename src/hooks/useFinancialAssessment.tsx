
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';

type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface FinancialAssessment {
  id?: string;
  onboarding_id: string;
  annual_revenue_range?: string;
  credit_score_range?: string;
  years_in_operation?: number;
  debt_to_equity_ratio?: number;
  current_ratio?: number;
  days_sales_outstanding?: number;
  payment_history_rating?: string;
  insurance_coverage: any;
  financial_guarantees: any;
  risk_assessment_score?: number;
  risk_level?: RiskLevel;
  credit_limit_recommendation?: number;
  payment_terms_recommendation?: string;
}

export const useFinancialAssessment = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['financial-assessments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('onboarding_financial_assessment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const calculateRiskScore = useMutation({
    mutationFn: async (assessment: FinancialAssessment) => {
      const { data, error } = await supabase.rpc('calculate_financial_risk_score', {
        p_annual_revenue_range: assessment.annual_revenue_range,
        p_years_in_operation: assessment.years_in_operation || 0,
        p_debt_to_equity_ratio: assessment.debt_to_equity_ratio || 0,
        p_current_ratio: assessment.current_ratio || 0,
        p_days_sales_outstanding: assessment.days_sales_outstanding || 0,
      });

      if (error) throw error;
      return data;
    },
  });

  const determineRiskLevel = (score: number): RiskLevel => {
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'very_high';
  };

  const saveAssessment = useMutation({
    mutationFn: async (assessment: FinancialAssessment) => {
      // Calculate risk score first
      let riskScore = 0;
      if (assessment.annual_revenue_range && assessment.years_in_operation) {
        riskScore = await calculateRiskScore.mutateAsync(assessment);
      }

      const dbAssessment = {
        onboarding_id: assessment.onboarding_id,
        annual_revenue_range: assessment.annual_revenue_range,
        credit_score_range: assessment.credit_score_range,
        years_in_operation: assessment.years_in_operation,
        debt_to_equity_ratio: assessment.debt_to_equity_ratio,
        current_ratio: assessment.current_ratio,
        days_sales_outstanding: assessment.days_sales_outstanding,
        payment_history_rating: assessment.payment_history_rating,
        insurance_coverage: assessment.insurance_coverage,
        financial_guarantees: assessment.financial_guarantees,
        risk_assessment_score: riskScore,
        risk_level: determineRiskLevel(riskScore),
        credit_limit_recommendation: assessment.credit_limit_recommendation,
        payment_terms_recommendation: assessment.payment_terms_recommendation,
      };

      if (assessment.id) {
        const { data, error } = await supabase
          .from('onboarding_financial_assessment')
          .update(dbAssessment)
          .eq('id', assessment.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('onboarding_financial_assessment')
          .insert(dbAssessment)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-assessments'] });
      toast({
        title: "Success",
        description: "Financial assessment saved successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error saving financial assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save financial assessment",
        variant: "destructive",
      });
    },
  });

  return {
    assessments,
    isLoading,
    saveAssessment: saveAssessment.mutate,
    isSaving: saveAssessment.isPending,
    calculateRiskScore: calculateRiskScore.mutate,
  };
};
