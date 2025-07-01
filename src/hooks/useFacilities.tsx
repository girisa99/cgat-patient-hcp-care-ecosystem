
import { useState, useEffect } from 'react';

// Enhanced facilities data that matches the structure used in components
const facilitiesData = [
  { 
    id: '1', 
    name: 'Main Hospital', 
    facility_type: 'Hospital',
    address: '123 Healthcare Ave, Medical City, MC 12345',
    phone: '(555) 123-4567',
    email: 'info@mainhospital.com',
    is_active: true
  },
  { 
    id: '2', 
    name: 'Community Clinic', 
    facility_type: 'Clinic',
    address: '456 Community Blvd, Health Town, HT 67890',
    phone: '(555) 234-5678',
    email: 'contact@communityclinic.com',
    is_active: true
  },
  { 
    id: '3', 
    name: 'Treatment Center', 
    facility_type: 'Treatment Center',
    address: '789 Wellness St, Care City, CC 13579',
    phone: '(555) 345-6789',
    email: 'info@treatmentcenter.com',
    is_active: true
  }
];

export const useFacilities = () => {
  const [facilities, setFacilities] = useState(facilitiesData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Since we're using static data, we can just return it immediately
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Calculate facility statistics
  const getFacilityStats = () => {
    const stats = {
      total: facilities.length,
      active: facilities.filter(f => f.is_active).length,
      inactive: facilities.filter(f => !f.is_active).length,
      typeBreakdown: facilities.reduce((acc, facility) => {
        const type = facility.facility_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    return stats;
  };

  // Mock create facility function
  const createFacility = (facilityData: any) => {
    console.log('Creating facility:', facilityData);
    const newFacility = {
      id: String(Date.now()),
      ...facilityData,
      is_active: true
    };
    setFacilities(prev => [...prev, newFacility]);
  };

  // Mock update facility function
  const updateFacility = ({ id, updates }: { id: string; updates: any }) => {
    console.log('Updating facility:', id, updates);
    setFacilities(prev => 
      prev.map(facility => 
        facility.id === id ? { ...facility, ...updates } : facility
      )
    );
  };

  return {
    facilities,
    isLoading,
    error,
    refetch: () => {
      // For static data, refetch does nothing but maintains API consistency
      setFacilities(facilitiesData);
    },
    getFacilityStats,
    createFacility,
    updateFacility
  };
};
