
import { useState, useEffect } from 'react';
import { 
  SEED_THERAPIES, 
  SEED_MANUFACTURERS, 
  SEED_MODALITIES, 
  SEED_PRODUCTS, 
  SEED_SERVICES, 
  SEED_SERVICE_PROVIDERS, 
  SEED_CLINICAL_TRIALS, 
  SEED_COMMERCIAL_PRODUCTS,
  SERVICE_CAPABILITIES,
  ONLINE_SERVICES,
  USER_ROLES
} from '@/data/seedData';

// Hook to provide seed data when database is empty
export const useSeedData = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock the data loading process
  useEffect(() => {
    setIsLoading(true);
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    therapies: SEED_THERAPIES,
    manufacturers: SEED_MANUFACTURERS,
    modalities: SEED_MODALITIES,
    products: SEED_PRODUCTS,
    services: SEED_SERVICES,
    serviceProviders: SEED_SERVICE_PROVIDERS,
    clinicalTrials: SEED_CLINICAL_TRIALS,
    commercialProducts: SEED_COMMERCIAL_PRODUCTS,
    capabilities: SERVICE_CAPABILITIES,
    onlineServices: ONLINE_SERVICES,
    userRoles: USER_ROLES,
    isLoading,
  };
};
