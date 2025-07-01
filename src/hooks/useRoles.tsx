
import { useState, useEffect } from 'react';

// Simple roles data that matches the structure used in components
const rolesData = [
  { id: '1', name: 'superAdmin', description: 'Super Administrator' },
  { id: '2', name: 'caseManager', description: 'Case Manager' },
  { id: '3', name: 'onboardingTeam', description: 'Onboarding Team' },
  { id: '4', name: 'healthcareProvider', description: 'Healthcare Provider' },
  { id: '5', name: 'nurse', description: 'Nurse' },
  { id: '6', name: 'patientCaregiver', description: 'Patient/Caregiver' }
];

export const useRoles = () => {
  const [roles, setRoles] = useState(rolesData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Since we're using static data, we can just return it immediately
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    roles,
    isLoading,
    error,
    refetch: () => {
      // For static data, refetch does nothing but maintains API consistency
      setRoles(rolesData);
    }
  };
};
