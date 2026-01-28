/**
 * Legal Compliance Service
 * Manages Terms of Service, Privacy Policy, and Cookie Policy acceptance tracking.
 */

import { supabase } from '@/integrations/supabase/client';

export type LegalDocumentType = 
  | 'terms_of_service' 
  | 'privacy_policy' 
  | 'cookie_policy' 
  | 'data_processing_agreement' 
  | 'baa';

export interface LegalAcceptance {
  id: string;
  user_id: string;
  document_type: LegalDocumentType;
  document_version: string;
  accepted_at: string;
  acceptance_method: 'click' | 'checkbox' | 'signature' | 'api';
  is_valid: boolean;
}

export interface LegalComplianceStatus {
  user_id: string;
  terms_of_service: boolean;
  privacy_policy: boolean;
  cookie_policy: boolean;
  all_accepted: boolean;
  checked_at: string;
}

class LegalComplianceService {
  /**
   * Check if user has accepted all required legal documents
   */
  async checkCompliance(userId: string): Promise<LegalComplianceStatus | null> {
    try {
      const { data, error } = await supabase
        .rpc('check_user_legal_compliance', { p_user_id: userId });

      if (error) {
        console.error('[LegalCompliance] Error checking compliance:', error);
        return null;
      }

      return data as unknown as LegalComplianceStatus;
    } catch (err) {
      console.error('[LegalCompliance] Exception checking compliance:', err);
      return null;
    }
  }

  /**
   * Record user acceptance of a legal document
   */
  async recordAcceptance(
    userId: string,
    documentType: LegalDocumentType,
    version: string = '1.0',
    method: 'click' | 'checkbox' | 'signature' | 'api' = 'click'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('record_legal_acceptance', {
          p_user_id: userId,
          p_document_type: documentType,
          p_version: version,
          p_ip_address: null, // Could be populated from server-side
          p_user_agent: navigator.userAgent,
          p_method: method
        });

      if (error) {
        console.error('[LegalCompliance] Error recording acceptance:', error);
        return false;
      }

      const result = data as unknown as { success?: boolean };
      return result?.success === true;
    } catch (err) {
      console.error('[LegalCompliance] Exception recording acceptance:', err);
      return false;
    }
  }

  /**
   * Accept all required documents at once (for signup flow)
   */
  async acceptAllRequired(userId: string, version: string = '1.0'): Promise<boolean> {
    const documents: LegalDocumentType[] = ['terms_of_service', 'privacy_policy'];
    
    try {
      const results = await Promise.all(
        documents.map(doc => this.recordAcceptance(userId, doc, version, 'checkbox'))
      );
      
      return results.every(r => r === true);
    } catch (err) {
      console.error('[LegalCompliance] Error accepting all documents:', err);
      return false;
    }
  }

  /**
   * Get user's acceptance history
   */
  async getAcceptanceHistory(userId: string): Promise<LegalAcceptance[]> {
    try {
      const { data, error } = await supabase
        .from('user_legal_acceptances' as any)
        .select('*')
        .eq('user_id', userId)
        .order('accepted_at', { ascending: false });

      if (error) {
        console.error('[LegalCompliance] Error fetching history:', error);
        return [];
      }

      return (data || []) as unknown as LegalAcceptance[];
    } catch (err) {
      console.error('[LegalCompliance] Exception fetching history:', err);
      return [];
    }
  }

  /**
   * Check if a specific document has been accepted
   */
  async hasAccepted(userId: string, documentType: LegalDocumentType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_legal_acceptances' as any)
        .select('id')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .eq('is_valid', true)
        .limit(1);

      if (error) {
        console.error('[LegalCompliance] Error checking acceptance:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (err) {
      console.error('[LegalCompliance] Exception checking acceptance:', err);
      return false;
    }
  }
}

export const legalComplianceService = new LegalComplianceService();
export default legalComplianceService;
