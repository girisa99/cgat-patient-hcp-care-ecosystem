/**
 * NPI VERIFICATION HOOK
 * Hook for managing NPI and license verification processes
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NPIVerificationData {
  npi: string;
  providerType: 'individual' | 'organization';
  providerName?: string;
  state?: string;
  licenseNumber?: string;
  deaNumber?: string;
  facilityId?: string;
  enrollmentId?: string;
}

interface VerificationResult {
  isValid: boolean;
  npiData?: any;
  licenseVerification?: any;
  deaVerification?: any;
  verificationStatus: 'verified' | 'failed' | 'partial' | 'pending';
  issues: string[];
  verifiedAt: string;
  confidence: number;
}

interface VerificationHistory {
  id: string;
  npi: string;
  verificationStatus: string;
  confidence: number;
  issues: string[];
  verifiedAt: string;
  facilityId?: string;
  enrollmentId?: string;
}

export const useNPIVerification = () => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Verify NPI and credentials
  const verifyCredentials = useCallback(async (data: NPIVerificationData): Promise<VerificationResult> => {
    setIsVerifying(true);
    
    try {
      console.log('🔍 Initiating NPI verification for:', data.npi);
      
      const { data: result, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: data
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!result.success) {
        throw new Error(result.error || 'Verification failed');
      }

      return result.verification;

    } catch (error) {
      console.error('NPI verification error:', error);
      
      const failedResult: VerificationResult = {
        isValid: false,
        verificationStatus: 'failed',
        issues: [error instanceof Error ? error.message : 'Unknown error'],
        verifiedAt: new Date().toISOString(),
        confidence: 0
      };

      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : 'Verification failed',
        variant: "destructive",
      });

      return failedResult;
    } finally {
      setIsVerifying(false);
    }
  }, [toast]);

  // Get verification history for a specific NPI or facility
  const getVerificationHistory = useCallback(async (npi?: string, facilityId?: string) => {
    setIsLoadingHistory(true);
    
    try {
      // Use any type to bypass TypeScript issues with new table
      const { data, error } = await (supabase as any)
        .from('npi_verification_results')
        .select('*')
        .order('verified_at', { ascending: false });

      if (error) {
        console.error('Query error:', error);
        setVerificationHistory([]);
        return [];
      }

      let filteredData = data || [];
      
      // Apply filters manually since we can't use .eq() with any type safely
      if (npi) {
        filteredData = filteredData.filter((item: any) => item.npi === npi);
      }
      
      if (facilityId) {
        filteredData = filteredData.filter((item: any) => item.facility_id === facilityId);
      }

      const history: VerificationHistory[] = filteredData.map((item: any) => ({
        id: item.id,
        npi: item.npi,
        verificationStatus: item.verification_status,
        confidence: item.confidence_score,
        issues: item.issues || [],
        verifiedAt: item.verified_at,
        facilityId: item.facility_id,
        enrollmentId: item.enrollment_id
      }));

      setVerificationHistory(history);
      return history;

    } catch (error) {
      console.error('Error fetching verification history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification history",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  // Check if NPI is already verified and valid
  const checkExistingVerification = useCallback(async (npi: string): Promise<VerificationResult | null> => {
    try {
      // Use any type to bypass TypeScript issues with new table
      const { data, error } = await (supabase as any)
        .from('npi_verification_results')
        .select('*')
        .eq('npi', npi)
        .eq('verification_status', 'verified')
        .order('verified_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Check existing verification error:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const latest = data[0];
      
      // Check if verification is still recent (within 30 days)
      const verifiedAt = new Date(latest.verified_at);
      const daysSinceVerification = (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceVerification > 30) {
        return null; // Verification is too old
      }

      return latest.verification_data as VerificationResult;

    } catch (error) {
      console.error('Error checking existing verification:', error);
      return null;
    }
  }, []);

  // Bulk verify multiple NPIs
  const bulkVerifyCredentials = useCallback(async (verificationList: NPIVerificationData[]): Promise<VerificationResult[]> => {
    const results: VerificationResult[] = [];
    
    for (const data of verificationList) {
      try {
        const result = await verifyCredentials(data);
        results.push(result);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Bulk verification failed for NPI ${data.npi}:`, error);
        results.push({
          isValid: false,
          verificationStatus: 'failed',
          issues: [error instanceof Error ? error.message : 'Unknown error'],
          verifiedAt: new Date().toISOString(),
          confidence: 0
        });
      }
    }

    return results;
  }, [verifyCredentials]);

  // Validate NPI format
  const validateNPIFormat = useCallback((npi: string): { isValid: boolean; error?: string } => {
    if (!npi) {
      return { isValid: false, error: 'NPI is required' };
    }

    if (!/^\d{10}$/.test(npi)) {
      return { isValid: false, error: 'NPI must be exactly 10 digits' };
    }

    // Luhn algorithm check for NPI
    const digits = npi.split('').map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return { isValid: false, error: 'Invalid NPI checksum' };
    }

    return { isValid: true };
  }, []);

  // Re-verify expired credentials
  const reverifyExpiredCredentials = useCallback(async (facilityId?: string) => {
    try {
      // Use any type to bypass TypeScript issues
      let query = (supabase as any)
        .from('npi_verification_results')
        .select('*')
        .lt('verified_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 days ago

      if (facilityId) {
        query = query.eq('facility_id', facilityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Re-verify query error:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const reverificationPromises = data.map(async (record: any) => {
        const verificationData: NPIVerificationData = {
          npi: record.npi,
          providerType: record.provider_type,
          facilityId: record.facility_id,
          enrollmentId: record.enrollment_id
        };

        return verifyCredentials(verificationData);
      });

      const results = await Promise.all(reverificationPromises);
      
      toast({
        title: "Re-verification Complete",
        description: `Re-verified ${results.length} expired credentials`,
      });

      return results;

    } catch (error) {
      console.error('Error re-verifying expired credentials:', error);
      toast({
        title: "Re-verification Failed",
        description: "Failed to re-verify expired credentials",
        variant: "destructive",
      });
      return [];
    }
  }, [verifyCredentials, toast]);

  return {
    // State
    isVerifying,
    verificationHistory,
    isLoadingHistory,

    // Actions
    verifyCredentials,
    getVerificationHistory,
    checkExistingVerification,
    bulkVerifyCredentials,
    validateNPIFormat,
    reverifyExpiredCredentials
  };
};