/**
 * HIPAA Compliance Service - P5 Commercialization
 * 
 * Manages HIPAA certification triggers, audit logging, and compliance scoring.
 * Integrates with Supabase for persistence.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

export type CertificationLevel = 'none' | 'pending' | 'basic' | 'full' | 'enterprise';

export type HIPAAEventType = 
  | 'phi_access' | 'phi_create' | 'phi_update' | 'phi_delete' | 'phi_export'
  | 'login' | 'logout' | 'failed_login' | 'password_change' | 'role_change'
  | 'consent_given' | 'consent_revoked' | 'data_request' | 'data_deletion'
  | 'baa_signed' | 'certification_change' | 'audit_performed' | 'breach_detected';

export interface HIPAAStatus {
  id: string;
  user_id: string;
  certification_level: CertificationLevel;
  baa_signed: boolean;
  baa_signed_at: string | null;
  baa_document_url: string | null;
  encryption_at_rest_enabled: boolean;
  encryption_in_transit_enabled: boolean;
  audit_logging_enabled: boolean;
  access_controls_configured: boolean;
  phi_handling_trained: boolean;
  breach_notification_plan: boolean;
  last_audit_date: string | null;
  next_audit_due: string | null;
  audit_score: number | null;
  audit_findings: unknown[];
  created_at: string;
  updated_at: string;
}

export interface HIPAAAuditEntry {
  id: string;
  user_id: string;
  event_type: HIPAAEventType;
  event_description: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

export interface ComplianceCheckResult {
  score: number;
  level: CertificationLevel;
  checks: {
    name: string;
    passed: boolean;
    points: number;
    recommendation?: string;
  }[];
  overallStatus: 'compliant' | 'partial' | 'non-compliant';
}

// ============================================
// SERVICE
// ============================================

class HIPAAComplianceService {
  private static instance: HIPAAComplianceService;

  private constructor() {}

  static getInstance(): HIPAAComplianceService {
    if (!HIPAAComplianceService.instance) {
      HIPAAComplianceService.instance = new HIPAAComplianceService();
    }
    return HIPAAComplianceService.instance;
  }

  /**
   * Get or create HIPAA certification status for a user
   */
  async getStatus(userId: string): Promise<HIPAAStatus | null> {
    try {
      const { data, error } = await supabase
        .from('hipaa_certification_status' as any)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record exists, create one
        return this.initializeStatus(userId);
      }

      if (error) {
        console.error('[HIPAACompliance] Error fetching status:', error);
        return null;
      }

      return data as unknown as HIPAAStatus;
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return null;
    }
  }

  /**
   * Initialize HIPAA status for a new user
   */
  async initializeStatus(userId: string): Promise<HIPAAStatus | null> {
    try {
      const { data, error } = await supabase
        .from('hipaa_certification_status' as any)
        .insert({
          user_id: userId,
          certification_level: 'none',
          baa_signed: false,
          encryption_at_rest_enabled: true, // Supabase default
          encryption_in_transit_enabled: true, // HTTPS default
          audit_logging_enabled: false,
          access_controls_configured: false,
          phi_handling_trained: false,
          breach_notification_plan: false,
        })
        .select()
        .single();

      if (error) {
        console.error('[HIPAACompliance] Error initializing status:', error);
        return null;
      }

      return data as unknown as HIPAAStatus;
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return null;
    }
  }

  /**
   * Update HIPAA compliance checks
   */
  async updateChecks(
    userId: string,
    checks: Partial<Pick<HIPAAStatus, 
      'baa_signed' | 'encryption_at_rest_enabled' | 'encryption_in_transit_enabled' |
      'audit_logging_enabled' | 'access_controls_configured' | 'phi_handling_trained' |
      'breach_notification_plan'
    >>
  ): Promise<HIPAAStatus | null> {
    try {
      const { data, error } = await supabase
        .from('hipaa_certification_status' as any)
        .update({
          ...checks,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[HIPAACompliance] Error updating checks:', error);
        return null;
      }

      // Log the certification change
      await this.logEvent(userId, 'certification_change', 
        `Updated HIPAA compliance checks: ${Object.keys(checks).join(', ')}`);

      // Recalculate certification level
      await this.recalculateCertification(userId);

      return data as unknown as HIPAAStatus;
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return null;
    }
  }

  /**
   * Sign BAA (Business Associate Agreement)
   */
  async signBAA(userId: string, documentUrl?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hipaa_certification_status' as any)
        .update({
          baa_signed: true,
          baa_signed_at: new Date().toISOString(),
          baa_document_url: documentUrl || null,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('[HIPAACompliance] Error signing BAA:', error);
        return false;
      }

      await this.logEvent(userId, 'baa_signed', 'Business Associate Agreement signed');
      await this.recalculateCertification(userId);
      return true;
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return false;
    }
  }

  /**
   * Log a HIPAA audit event
   */
  async logEvent(
    userId: string,
    eventType: HIPAAEventType,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hipaa_audit_log' as any)
        .insert({
          user_id: userId,
          event_type: eventType,
          event_description: description,
          metadata: metadata || {},
        });

      if (error) {
        console.error('[HIPAACompliance] Error logging event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return false;
    }
  }

  /**
   * Get audit log entries for a user
   */
  async getAuditLog(userId: string, limit = 50): Promise<HIPAAAuditEntry[]> {
    try {
      const { data, error } = await supabase
        .from('hipaa_audit_log' as any)
        .select('*')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[HIPAACompliance] Error fetching audit log:', error);
        return [];
      }

      return (data || []) as unknown as HIPAAAuditEntry[];
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return [];
    }
  }

  /**
   * Calculate compliance score and update certification level
   */
  async recalculateCertification(userId: string): Promise<ComplianceCheckResult | null> {
    try {
      const status = await this.getStatus(userId);
      if (!status) return null;

      const checks = [
        { name: 'BAA Signed', passed: status.baa_signed, points: 20, recommendation: 'Sign a Business Associate Agreement' },
        { name: 'Encryption at Rest', passed: status.encryption_at_rest_enabled, points: 15, recommendation: 'Enable database encryption' },
        { name: 'Encryption in Transit', passed: status.encryption_in_transit_enabled, points: 15, recommendation: 'Ensure HTTPS is enabled' },
        { name: 'Audit Logging', passed: status.audit_logging_enabled, points: 15, recommendation: 'Enable comprehensive audit logging' },
        { name: 'Access Controls', passed: status.access_controls_configured, points: 15, recommendation: 'Configure role-based access controls' },
        { name: 'PHI Training', passed: status.phi_handling_trained, points: 10, recommendation: 'Complete PHI handling training' },
        { name: 'Breach Plan', passed: status.breach_notification_plan, points: 10, recommendation: 'Document breach notification procedures' },
      ];

      const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
      
      let level: CertificationLevel = 'none';
      let overallStatus: 'compliant' | 'partial' | 'non-compliant' = 'non-compliant';

      if (score >= 85) {
        level = 'enterprise';
        overallStatus = 'compliant';
      } else if (score >= 70) {
        level = 'full';
        overallStatus = 'compliant';
      } else if (score >= 50) {
        level = 'basic';
        overallStatus = 'partial';
      } else if (score >= 20) {
        level = 'pending';
        overallStatus = 'partial';
      }

      // Update the status with new score and level
      await supabase
        .from('hipaa_certification_status' as any)
        .update({
          audit_score: score,
          certification_level: level,
        })
        .eq('user_id', userId);

      return { score, level, checks, overallStatus };
    } catch (error) {
      console.error('[HIPAACompliance] Error:', error);
      return null;
    }
  }

  /**
   * Trigger a full compliance audit
   */
  async performAudit(userId: string): Promise<ComplianceCheckResult | null> {
    const result = await this.recalculateCertification(userId);
    
    if (result) {
      // Update audit dates
      const now = new Date();
      const nextDue = new Date(now);
      nextDue.setMonth(nextDue.getMonth() + 6); // Next audit in 6 months

      await supabase
        .from('hipaa_certification_status' as any)
        .update({
          last_audit_date: now.toISOString(),
          next_audit_due: nextDue.toISOString(),
          audit_findings: result.checks.filter(c => !c.passed),
        })
        .eq('user_id', userId);

      await this.logEvent(userId, 'audit_performed', 
        `Compliance audit completed with score: ${result.score}/100`);
    }

    return result;
  }
}

export const hipaaComplianceService = HIPAAComplianceService.getInstance();
