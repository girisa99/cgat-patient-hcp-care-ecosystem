
/**
 * Secure Patient Data Hook
 * 
 * This hook provides additional security layers and monitoring for patient data access.
 * Use this when you need extra security validation or audit logging.
 */

import { useCallback } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { usePatients } from '@/hooks/usePatients';
import { validatePatientData, PATIENT_ROLE } from '@/utils/patientDataHelpers';
import { supabase } from '@/integrations/supabase/client';

export const useSecurePatientData = () => {
  const { hasRole, user } = useSecureAuth();
  const { patients, isLoading, error, refetch } = usePatients();

  /**
   * Verifies user has permission to access patient data
   */
  const verifyPatientAccess = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn('⚠️ No authenticated user for patient data access');
      return false;
    }

    // Check if user has roles that can access patient data
    const allowedRoles = ['superAdmin', 'caseManager', 'healthcareProvider'];
    const hasAccess = allowedRoles.some(role => hasRole(role as any));
    
    if (!hasAccess) {
      console.warn(`⚠️ User ${user.email} lacks permission to access patient data`);
      
      // Log unauthorized access attempt
      await supabase.from('audit_logs').insert({
        action: 'UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT',
        table_name: 'auth.users',
        record_id: user.id,
        new_values: {
          attempted_by: user.email,
          timestamp: new Date().toISOString(),
          reason: 'Insufficient role permissions'
        }
      });
      
      return false;
    }

    return true;
  }, [user, hasRole]);

  /**
   * Gets patient data with additional security validation
   */
  const getSecurePatientData = useCallback(async () => {
    const hasAccess = await verifyPatientAccess();
    if (!hasAccess) {
      throw new Error('Unauthorized: Insufficient permissions to access patient data');
    }

    if (!patients) {
      return [];
    }

    // Validate each patient record
    const validatedPatients = patients.filter(patient => {
      try {
        validatePatientData(patient);
        return true;
      } catch (error) {
        console.error('❌ Patient data validation failed:', error, patient);
        return false;
      }
    });

    // Log patient data access for audit
    await supabase.from('audit_logs').insert({
      action: 'PATIENT_DATA_ACCESSED',
      table_name: 'auth.users',
      record_id: user?.id,
      new_values: {
        accessed_by: user?.email,
        patient_count: validatedPatients.length,
        timestamp: new Date().toISOString()
      }
    });

    return validatedPatients;
  }, [patients, verifyPatientAccess, user]);

  /**
   * Gets a specific patient by ID with security validation
   */
  const getPatientById = useCallback(async (patientId: string) => {
    const securePatients = await getSecurePatientData();
    const patient = securePatients.find(p => p.id === patientId);
    
    if (!patient) {
      console.warn(`⚠️ Patient not found or access denied: ${patientId}`);
      return null;
    }

    return patient;
  }, [getSecurePatientData]);

  return {
    patients,
    isLoading,
    error,
    refetch,
    verifyPatientAccess,
    getSecurePatientData,
    getPatientById,
    // Security metadata
    security: {
      dataSource: 'auth.users via manage-user-profiles edge function',
      roleRequired: PATIENT_ROLE,
      auditLogged: true,
      accessControlEnabled: true
    }
  };
};
