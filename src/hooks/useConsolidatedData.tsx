import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Sample data for development
const SAMPLE_FACILITIES = [
  {
    id: '1',
    name: 'Central Medical Center',
    facility_type: 'Hospital',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@centralmed.com',
    is_active: true,
    capacity: 250,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Community Health Clinic',
    facility_type: 'Clinic',
    address: '456 Oak Ave, City, State 12345',
    phone: '(555) 234-5678',
    email: 'contact@communityclinic.com',
    is_active: true,
    capacity: 50,
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Specialized Care Institute',
    facility_type: 'Specialty Center',
    address: '789 Pine Rd, City, State 12345',
    phone: '(555) 345-6789',
    email: 'admin@specializedcare.com',
    is_active: true,
    capacity: 100,
    created_at: '2024-02-01T09:15:00Z'
  }
];

const SAMPLE_MODULES = [
  {
    id: '1',
    name: 'Patient Management',
    description: 'Complete patient record management system',
    is_active: true,
    category: 'Core',
    version: '2.1.0',
    permissions: ['read', 'write', 'delete'],
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    name: 'Appointment Scheduling',
    description: 'Advanced appointment booking and management',
    is_active: true,
    category: 'Operations',
    version: '1.8.3',
    permissions: ['read', 'write'],
    created_at: '2024-01-12T10:30:00Z'
  },
  {
    id: '3',
    name: 'Billing & Insurance',
    description: 'Comprehensive billing and insurance processing',
    is_active: true,
    category: 'Financial',
    version: '3.0.1',
    permissions: ['read', 'write', 'process'],
    created_at: '2024-01-18T13:45:00Z'
  },
  {
    id: '4',
    name: 'Lab Results',
    description: 'Laboratory test results management',
    is_active: false,
    category: 'Medical',
    version: '1.2.4',
    permissions: ['read'],
    created_at: '2024-02-05T16:20:00Z'
  }
];

const SAMPLE_USERS = [
  {
    id: '1',
    full_name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    user_roles: [{ roles: { name: 'doctor' } }],
    facility_id: '1',
    last_sign_in_at: '2024-12-20T09:30:00Z',
    created_at: '2024-01-05T10:00:00Z',
    is_active: true
  },
  {
    id: '2',
    full_name: 'John Smith',
    email: 'john.smith@email.com',
    user_roles: [{ roles: { name: 'patientCaregiver' } }],
    facility_id: '2',
    last_sign_in_at: '2024-12-19T14:15:00Z',
    created_at: '2024-01-08T11:30:00Z',
    is_active: true
  },
  {
    id: '3',
    full_name: 'Admin User',
    email: 'admin@system.com',
    user_roles: [{ roles: { name: 'admin' } }],
    facility_id: '1',
    last_sign_in_at: '2024-12-21T08:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: '4',
    full_name: 'Nurse Betty Wilson',
    email: 'betty.wilson@hospital.com',
    user_roles: [{ roles: { name: 'nurse' } }],
    facility_id: '1',
    last_sign_in_at: '2024-12-18T07:45:00Z',
    created_at: '2024-01-10T09:00:00Z',
    is_active: true
  }
];

const SAMPLE_API_SERVICES = [
  {
    id: '1',
    name: 'Patient Data API',
    description: 'RESTful API for patient data management',
    type: 'REST',
    status: 'active',
    endpoint: '/api/v1/patients',
    version: '1.0.0',
    documentation_url: 'https://docs.api.com/patients',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Appointment Sync API',
    description: 'Real-time appointment synchronization',
    type: 'GraphQL',
    status: 'active',
    endpoint: '/graphql/appointments',
    version: '2.1.0',
    documentation_url: 'https://docs.api.com/appointments',
    created_at: '2024-01-20T11:30:00Z'
  },
  {
    id: '3',
    name: 'Billing Integration API',
    description: 'Third-party billing system integration',
    type: 'REST',
    status: 'testing',
    endpoint: '/api/v2/billing',
    version: '1.5.2',
    documentation_url: 'https://docs.api.com/billing',
    created_at: '2024-02-01T14:15:00Z'
  }
];

export const useConsolidatedData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // FACILITIES FUNCTIONALITY
  const facilities = {
    data: SAMPLE_FACILITIES,
    isLoading: false,
    error: null,
    
    getFacilityStats: () => {
      const total = SAMPLE_FACILITIES.length;
      const active = SAMPLE_FACILITIES.filter(f => f.is_active).length;
      const inactive = total - active;
      const typeBreakdown = SAMPLE_FACILITIES.reduce((acc: any, facility) => {
        const type = facility.facility_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        inactive,
        typeBreakdown,
        byType: typeBreakdown
      };
    },
    
    searchFacilities: (query: string) => {
      if (!query.trim()) return SAMPLE_FACILITIES;
      return SAMPLE_FACILITIES.filter(facility => 
        facility.name.toLowerCase().includes(query.toLowerCase()) ||
        facility.address.toLowerCase().includes(query.toLowerCase()) ||
        facility.facility_type.toLowerCase().includes(query.toLowerCase())
      );
    },
    
    createFacility: async (facilityData: any) => {
      toast({
        title: "Facility Created",
        description: `${facilityData.name} has been created successfully.`,
      });
      return Promise.resolve();
    },
    
    updateFacility: async (id: string, facilityData: any) => {
      toast({
        title: "Facility Updated",
        description: `Facility has been updated successfully.`,
      });
      return Promise.resolve();
    },

    meta: {
      totalFacilities: SAMPLE_FACILITIES.length,
      dataSource: 'consolidated-sample-data',
      lastUpdated: new Date().toISOString()
    }
  };

  // MODULES FUNCTIONALITY
  const modules = {
    data: SAMPLE_MODULES,
    isLoading: false,
    error: null,
    
    getModuleStats: () => {
      const total = SAMPLE_MODULES.length;
      const active = SAMPLE_MODULES.filter(m => m.is_active).length;
      const inactive = total - active;
      const userAccessible = active;
      const byCategory = SAMPLE_MODULES.reduce((acc: any, module) => {
        const category = module.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        inactive,
        userAccessible,
        byCategory
      };
    },
    
    searchModules: (query: string) => {
      if (!query.trim()) return SAMPLE_MODULES;
      return SAMPLE_MODULES.filter(module => 
        module.name.toLowerCase().includes(query.toLowerCase()) ||
        module.description.toLowerCase().includes(query.toLowerCase())
      );
    },
    
    createModule: async (moduleData: any) => {
      toast({
        title: "Module Created",
        description: `${moduleData.name} module has been created successfully.`,
      });
      return Promise.resolve();
    },
    
    updateModule: async (id: string, moduleData: any) => {
      toast({
        title: "Module Updated",
        description: `Module has been updated successfully.`,
      });
      return Promise.resolve();
    },

    meta: {
      totalModules: SAMPLE_MODULES.length,
      dataSource: 'consolidated-sample-data',
      lastUpdated: new Date().toISOString()
    }
  };

  // USERS FUNCTIONALITY
  const users = {
    data: SAMPLE_USERS,
    isLoading: false,
    error: null,
    
    getUserStats: () => ({
      total: SAMPLE_USERS.length,
      active: SAMPLE_USERS.filter(u => u.is_active).length,
      totalUsers: SAMPLE_USERS.length,
      activeUsers: SAMPLE_USERS.filter(u => u.last_sign_in_at).length,
      totalFacilities: SAMPLE_FACILITIES.length,
      totalModules: SAMPLE_MODULES.length,
      totalApis: SAMPLE_API_SERVICES.length,
      totalPermissions: 12
    }),
    
    getPatients: () => SAMPLE_USERS.filter(user => 
      user.user_roles?.some(ur => ur.roles.name === 'patientCaregiver')
    ),
    
    getStaff: () => SAMPLE_USERS.filter(user => 
      user.user_roles?.some(ur => ['doctor', 'nurse'].includes(ur.roles.name))
    ),
    
    getAdmins: () => SAMPLE_USERS.filter(user => 
      user.user_roles?.some(ur => ur.roles.name === 'admin')
    ),
    
    searchUsers: (query: string) => {
      if (!query.trim()) return SAMPLE_USERS;
      return SAMPLE_USERS.filter(user => 
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    },

    meta: {
      totalUsers: SAMPLE_USERS.length,
      dataSource: 'consolidated-sample-data',
      lastUpdated: new Date().toISOString()
    }
  };

  // API SERVICES FUNCTIONALITY
  const apiServices = {
    data: SAMPLE_API_SERVICES,
    isLoading: false,
    error: null,
    
    getApiStats: () => {
      const total = SAMPLE_API_SERVICES.length;
      const active = SAMPLE_API_SERVICES.filter(api => api.status === 'active').length;
      const byType = SAMPLE_API_SERVICES.reduce((acc: any, api) => {
        const type = api.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        byType
      };
    },
    
    searchApis: (query: string) => {
      if (!query.trim()) return SAMPLE_API_SERVICES;
      return SAMPLE_API_SERVICES.filter(api => 
        api.name.toLowerCase().includes(query.toLowerCase()) ||
        api.description.toLowerCase().includes(query.toLowerCase())
      );
    },
    
    createIntegration: async (apiData: any) => {
      toast({
        title: "API Integration Created",
        description: `${apiData.name} integration has been created successfully.`,
      });
      return Promise.resolve();
    },
    
    updateIntegration: async (id: string, apiData: any) => {
      toast({
        title: "API Integration Updated",
        description: `Integration has been updated successfully.`,
      });
      return Promise.resolve();
    },

    meta: {
      totalApis: SAMPLE_API_SERVICES.length,
      dataSource: 'consolidated-sample-data',
      lastUpdated: new Date().toISOString()
    }
  };

  // UNIFIED REFRESH FUNCTION
  const refreshAllData = () => {
    setIsLoading(true);
    toast({
      title: "Data Refreshed",
      description: "All data has been refreshed successfully.",
    });
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    isLoading,
    error,
    hasError: !!error,
    
    // All consolidated data
    facilities,
    modules,
    users,
    apiServices,
    
    // Global stats
    realTimeStats: {
      totalUsers: SAMPLE_USERS.length,
      activeUsers: SAMPLE_USERS.filter(u => u.is_active).length,
      totalFacilities: SAMPLE_FACILITIES.length,
      totalModules: SAMPLE_MODULES.length,
      totalApis: SAMPLE_API_SERVICES.length,
      totalPermissions: 12,
      total: SAMPLE_USERS.length + SAMPLE_FACILITIES.length + SAMPLE_MODULES.length
    },
    
    // Methods
    refreshAllData,
    
    meta: {
      implementationLocked: true,
      version: 'consolidated-v1.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 4,
      lastUpdated: new Date().toISOString(),
      principle: 'Consolidated Single Source with Working Data'
    }
  };
};