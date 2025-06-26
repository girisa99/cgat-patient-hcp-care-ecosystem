
/**
 * Detects and catalogs internal APIs within the application
 * REFINED: Only core healthcare business functions (16 critical endpoints)
 */

export interface InternalEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  module: string;
  isPublic: boolean;
  authentication: string;
  parameters?: string[];
  responses?: Record<string, any>;
}

export class InternalApiDetector {
  /**
   * Detect only CORE CRITICAL healthcare business APIs (16 endpoints)
   */
  static detectInternalApis(): InternalEndpoint[] {
    const coreHealthcareApis: InternalEndpoint[] = [
      // Core Authentication (2 endpoints)
      {
        name: 'User Authentication',
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticate healthcare user credentials and return secure session',
        module: 'Core Authentication',
        isPublic: true,
        authentication: 'none',
        parameters: ['email', 'password'],
        responses: { 200: 'Authentication success with JWT', 401: 'Invalid credentials' }
      },
      {
        name: 'User Session Validation',
        method: 'GET',
        path: '/auth/validate',
        description: 'Validate active healthcare user session and permissions',
        module: 'Core Authentication',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['token'],
        responses: { 200: 'Valid session', 401: 'Session expired' }
      },

      // Core User Management (4 endpoints)
      {
        name: 'Get Healthcare Users',
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve healthcare users with role-based filtering',
        module: 'Core User Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['page', 'limit', 'role', 'facility_id']
      },
      {
        name: 'Create Healthcare User',
        method: 'POST',
        path: '/api/users',
        description: 'Create new healthcare user with role assignment',
        module: 'Core User Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['email', 'firstName', 'lastName', 'role', 'facilityId']
      },
      {
        name: 'Update User Profile',
        method: 'PUT',
        path: '/api/users/{id}',
        description: 'Update healthcare user profile and role assignments',
        module: 'Core User Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Get User Permissions',
        method: 'GET',
        path: '/api/users/{id}/permissions',
        description: 'Retrieve effective permissions for healthcare user',
        module: 'Core User Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Core Patient Management (3 endpoints)
      {
        name: 'Get Patients',
        method: 'GET',
        path: '/api/patients',
        description: 'Retrieve patient list with HIPAA-compliant filtering',
        module: 'Core Patient Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['facilityId', 'page', 'limit', 'searchTerm']
      },
      {
        name: 'Create Patient Record',
        method: 'POST',
        path: '/api/patients',
        description: 'Create new patient record with healthcare compliance',
        module: 'Core Patient Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['firstName', 'lastName', 'dateOfBirth', 'facilityId']
      },
      {
        name: 'Get Patient Details',
        method: 'GET',
        path: '/api/patients/{id}',
        description: 'Retrieve detailed patient information with access control',
        module: 'Core Patient Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Core Facility Management (3 endpoints)
      {
        name: 'Get Healthcare Facilities',
        method: 'GET',
        path: '/api/facilities',
        description: 'Retrieve healthcare facilities with user access filtering',
        module: 'Core Facility Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Create Healthcare Facility',
        method: 'POST',
        path: '/api/facilities',
        description: 'Register new healthcare facility with compliance data',
        module: 'Core Facility Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['name', 'address', 'phone', 'facilityType', 'npiNumber']
      },
      {
        name: 'Update Facility Information',
        method: 'PUT',
        path: '/api/facilities/{id}',
        description: 'Update healthcare facility information and settings',
        module: 'Core Facility Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Core Role & Permission Management (2 endpoints)
      {
        name: 'Get User Roles',
        method: 'GET',
        path: '/api/roles',
        description: 'Retrieve healthcare user roles and permissions',
        module: 'Core Role Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Assign User Role',
        method: 'POST',
        path: '/api/users/{id}/roles',
        description: 'Assign healthcare role to user with audit trail',
        module: 'Core Role Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['userId', 'roleId', 'facilityId']
      },

      // Core Module Management (2 endpoints)
      {
        name: 'Get Active Modules',
        method: 'GET',
        path: '/api/modules',
        description: 'Retrieve active healthcare modules for user',
        module: 'Core Module Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Assign Module Access',
        method: 'POST',
        path: '/api/modules/{id}/assign',
        description: 'Assign module access to healthcare user or role',
        module: 'Core Module Management',
        isPublic: false,
        authentication: 'bearer'
      }
    ];

    console.log(`🎯 REFINED CORE HEALTHCARE API: Detected ${coreHealthcareApis.length} critical business endpoints`);
    return coreHealthcareApis;
  }

  /**
   * Generate refined external documentation for core healthcare functions only
   */
  static generateExternalDocumentation(): any {
    const coreApis = this.detectInternalApis();
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Core Healthcare Admin API',
        version: '1.0.0',
        description: `Refined healthcare administration API with ${coreApis.length} critical business endpoints focusing on core user, patient, facility, and role management functions.`,
        contact: {
          name: 'Healthcare Core API Team',
          email: 'core-api@healthcare-admin.com'
        },
        license: {
          name: 'Healthcare Business License',
          url: 'https://healthcare-admin.com/core-license'
        }
      },
      servers: [
        {
          url: 'https://api.healthcare-admin.com/core',
          description: 'Core Healthcare API Server'
        }
      ],
      paths: this.generateOpenApiPaths(coreApis),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Healthcare user authentication token'
          }
        }
      }
    };
  }

  private static generateOpenApiPaths(apis: InternalEndpoint[]): any {
    const paths: any = {};
    
    apis.forEach(api => {
      if (!paths[api.path]) {
        paths[api.path] = {};
      }
      
      paths[api.path][api.method.toLowerCase()] = {
        summary: api.name,
        description: api.description,
        tags: [api.module],
        security: api.authentication === 'bearer' ? [{ bearerAuth: [] }] : [],
        responses: api.responses || {
          200: { description: 'Successful healthcare operation' },
          401: { description: 'Healthcare authentication required' },
          403: { description: 'Healthcare access forbidden' },
          404: { description: 'Healthcare resource not found' },
          500: { description: 'Healthcare system error' }
        }
      };
    });
    
    return paths;
  }
}
