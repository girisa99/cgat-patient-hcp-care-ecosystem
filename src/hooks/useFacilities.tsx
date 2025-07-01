
import { useState, useEffect } from 'react';

// Simple facilities data that matches the structure used in components
const facilitiesData = [
  { id: '1', name: 'Main Hospital', facility_type: 'Hospital' },
  { id: '2', name: 'Community Clinic', facility_type: 'Clinic' },
  { id: '3', name: 'Treatment Center', facility_type: 'Treatment Center' }
];

export const useFacilities = () => {
  const [facilities, setFacilities] = useState(facilitiesData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Since we're using static data, we can just return it immediately
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    facilities,
    isLoading,
    error,
    refetch: () => {
      // For static data, refetch does nothing but maintains API consistency
      setRoles(facilitiesData);
    }
  };
};
