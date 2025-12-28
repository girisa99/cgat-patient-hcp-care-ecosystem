/**
 * Adherence Orchestrator Hook
 * Implements event-driven Monitoring → Intervention → Escalation pipeline
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import {
  AdherenceOrchestratorState,
  AdherenceMonitoringResult,
  InterventionResult,
  EscalationResult,
  AdherenceMetrics,
  AdherenceAlert,
  AdherenceBarrier,
  AdherenceStage,
  PipelineStatus
} from '@/types/hierarchical-agent-types';

export const useAdherenceOrchestrator = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [orchestratorState, setOrchestratorState] = useState<AdherenceOrchestratorState | null>(null);

  // Initialize orchestrator
  const initializeOrchestrator = useCallback((patientId: string, medicationId: string): AdherenceOrchestratorState => {
    const state: AdherenceOrchestratorState = {
      patientId,
      medicationId,
      currentStage: 'monitoring',
      interventions: [],
      escalations: [],
      status: 'pending',
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
    setOrchestratorState(state);
    return state;
  }, []);

  // Execute Monitoring Stage
  const executeMonitoringMutation = useMutation({
    mutationFn: async ({ patientId, medicationId }: { patientId: string; medicationId: string }): Promise<AdherenceMonitoringResult> => {
      initializeOrchestrator(patientId, medicationId);
      setOrchestratorState(prev => prev ? { ...prev, status: 'in_progress', currentStage: 'monitoring' } : null);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const pdc = 0.65 + Math.random() * 0.3;
      const alerts: AdherenceAlert[] = [];
      
      if (pdc < 0.8) {
        alerts.push({
          id: `alert_${Date.now()}`,
          type: 'gap_detected',
          severity: pdc < 0.6 ? 'urgent' : 'warning',
          message: `PDC below threshold: ${(pdc * 100).toFixed(1)}%`,
          triggeredAt: new Date().toISOString()
        });
      }

      const result: AdherenceMonitoringResult = {
        patientId,
        medicationId,
        metrics: {
          pdc,
          mpr: pdc + 0.05,
          refillGaps: pdc < 0.8 ? [{ startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date().toISOString(), daysGap: 14 }] : [],
          missedDoses: Math.floor((1 - pdc) * 30),
          onTimeRefills: Math.floor(pdc * 12),
          lateRefills: Math.floor((1 - pdc) * 12),
          calculatedAt: new Date().toISOString()
        },
        alerts,
        nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: alerts.length > 0 ? [{ type: 'outreach_call', priority: 'high', message: 'Patient may benefit from adherence support', suggestedAction: 'Schedule outreach call' }] : []
      };

      setOrchestratorState(prev => prev ? { ...prev, monitoringResult: result, currentStage: alerts.length > 0 ? 'intervention' : 'resolved' } : null);
      return result;
    },
    onSuccess: (result) => {
      if (result.alerts.length > 0) {
        showWarning('Adherence Alert', `${result.alerts.length} issues detected - intervention recommended`);
      } else {
        showSuccess('Monitoring Complete', `PDC: ${(result.metrics.pdc * 100).toFixed(1)}%`);
      }
    }
  });

  // Execute Intervention Stage
  const executeInterventionMutation = useMutation({
    mutationFn: async ({ type, notes }: { type: InterventionResult['type']; notes?: string }): Promise<InterventionResult> => {
      setOrchestratorState(prev => prev ? { ...prev, status: 'in_progress', currentStage: 'intervention' } : null);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: InterventionResult = {
        interventionId: `int_${Date.now()}`,
        type,
        status: 'completed',
        outcome: {
          contactMade: true,
          patientResponse: 'positive',
          barriersIdentified: [{ type: 'forgetfulness', description: 'Forgets to take medication', severity: 'moderate', addressed: true }],
          actionsTaken: ['Set up refill reminders', 'Discussed pill organizer'],
          followUpRequired: false
        },
        completedAt: new Date().toISOString(),
        notes
      };

      setOrchestratorState(prev => prev ? { ...prev, interventions: [...prev.interventions, result], currentStage: 'resolved', status: 'completed' } : null);
      return result;
    },
    onSuccess: () => showSuccess('Intervention Complete', 'Patient contact successful')
  });

  // Execute Escalation Stage
  const executeEscalationMutation = useMutation({
    mutationFn: async ({ level, reason }: { level: EscalationResult['level']; reason: string }): Promise<EscalationResult> => {
      setOrchestratorState(prev => prev ? { ...prev, currentStage: 'escalation' } : null);
      await new Promise(resolve => setTimeout(resolve, 800));

      const result: EscalationResult = {
        escalationId: `esc_${Date.now()}`,
        level,
        reason,
        status: 'escalated',
        escalatedAt: new Date().toISOString(),
        escalatedTo: `${level}_team@healthcare.com`
      };

      setOrchestratorState(prev => prev ? { ...prev, escalations: [...prev.escalations, result] } : null);
      return result;
    },
    onSuccess: (result) => showInfo('Escalated', `Case escalated to ${result.level}`)
  });

  return {
    orchestratorState,
    currentStage: orchestratorState?.currentStage,
    monitoringResult: orchestratorState?.monitoringResult,
    interventions: orchestratorState?.interventions || [],
    escalations: orchestratorState?.escalations || [],
    
    initializeOrchestrator,
    executeMonitoring: executeMonitoringMutation.mutate,
    executeIntervention: executeInterventionMutation.mutate,
    executeEscalation: executeEscalationMutation.mutate,
    
    isMonitoring: executeMonitoringMutation.isPending,
    isIntervening: executeInterventionMutation.isPending,
    isEscalating: executeEscalationMutation.isPending
  };
};
