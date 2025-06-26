
/**
 * Detects and catalogs internal APIs within the application
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
   * Detect all internal APIs within the application
   */
  static detectInternalApis(): InternalEndpoint[] {
    const internalApis: InternalEndpoint[] = [
      // Auth APIs
      {
        name: 'User Authentication',
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticate user credentials and return session token',
        module: 'Authentication',
        isPublic: true,
        authentication: 'none',
        parameters: ['email', 'password'],
        responses: { 200: 'Success with token', 401: 'Invalid credentials' }
      },
      {
        name: 'User Registration',
        method: 'POST',
        path: '/auth/register',
        description: 'Register new user account',
        module: 'Authentication',
        isPublic: true,
        authentication: 'none',
        parameters: ['email', 'password', 'firstName', 'lastName']
      },
      {
        name: 'Logout',
        method: 'POST',
        path: '/auth/logout',
        description: 'Invalidate user session',
        module: 'Authentication',
        isPublic: false,
        authentication: 'bearer'
      },

      // User Management APIs
      {
        name: 'Get Users',
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve paginated list of users with role information',
        module: 'User Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['page', 'limit', 'role', 'status']
      },
      {
        name: 'Create User',
        method: 'POST',
        path: '/api/users',
        description: 'Create new user with specified role and permissions',
        module: 'User Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['email', 'firstName', 'lastName', 'role', 'facilityId']
      },
      {
        name: 'Update User',
        method: 'PUT',
        path: '/api/users/{id}',
        description: 'Update existing user information and roles',
        module: 'User Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Delete User',
        method: 'DELETE',
        path: '/api/users/{id}',
        description: 'Soft delete user account (marks as inactive)',
        module: 'User Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Patient Management APIs
      {
        name: 'Get Patients',
        method: 'GET',
        path: '/api/patients',
        description: 'Retrieve patient list with HIPAA-compliant data filtering',
        module: 'Patient Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['facilityId', 'page', 'limit', 'searchTerm']
      },
      {
        name: 'Create Patient',
        method: 'POST',
        path: '/api/patients',
        description: 'Register new patient with healthcare information',
        module: 'Patient Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['firstName', 'lastName', 'dateOfBirth', 'facilityId', 'medicalRecordNumber']
      },
      {
        name: 'Get Patient Details',
        method: 'GET',
        path: '/api/patients/{id}',
        description: 'Retrieve detailed patient information (role-based access)',
        module: 'Patient Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Update Patient',
        method: 'PUT',
        path: '/api/patients/{id}',
        description: 'Update patient information with audit trail',
        module: 'Patient Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Facility Management APIs
      {
        name: 'Get Facilities',
        method: 'GET',
        path: '/api/facilities',
        description: 'Retrieve healthcare facilities list',
        module: 'Facility Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Create Facility',
        method: 'POST',
        path: '/api/facilities',
        description: 'Register new healthcare facility',
        module: 'Facility Management',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['name', 'address', 'phone', 'email', 'type']
      },
      {
        name: 'Update Facility',
        method: 'PUT',
        path: '/api/facilities/{id}',
        description: 'Update facility information and settings',
        module: 'Facility Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Module Management APIs
      {
        name: 'Get Modules',
        method: 'GET',
        path: '/api/modules',
        description: 'Retrieve available system modules and permissions',
        module: 'Module Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Create Module',
        method: 'POST',
        path: '/api/modules',
        description: 'Register new system module with auto-generated templates',
        module: 'Module Management',
        isPublic: false,
        authentication: 'bearer'
      },
      {
        name: 'Module Assignment',
        method: 'POST',
        path: '/api/modules/{id}/assign',
        description: 'Assign module access to users or roles',
        module: 'Module Management',
        isPublic: false,
        authentication: 'bearer'
      },

      // Audit & Compliance APIs
      {
        name: 'Get Audit Logs',
        method: 'GET',
        path: '/api/audit-logs',
        description: 'Retrieve system audit logs for compliance reporting',
        module: 'Audit & Compliance',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['startDate', 'endDate', 'action', 'userId', 'table']
      },
      {
        name: 'Export Audit Report',
        method: 'GET',
        path: '/api/audit-logs/export',
        description: 'Export audit logs in compliance-ready format (CSV/PDF)',
        module: 'Audit & Compliance',
        isPublic: false,
        authentication: 'bearer'
      },

      // System Health APIs
      {
        name: 'Health Check',
        method: 'GET',
        path: '/api/health',
        description: 'System health and status monitoring endpoint',
        module: 'System',
        isPublic: true,
        authentication: 'none'
      },
      {
        name: 'Database Status',
        method: 'GET',
        path: '/api/health/database',
        description: 'Database connectivity and performance metrics',
        module: 'System',
        isPublic: false,
        authentication: 'bearer'
      }
    ];

    return internalApis;
  }

  /**
   * Generate comprehensive API documentation for external sharing
   */
  static generateExternalDocumentation(): any {
    const apis = this.detectInternalApis();
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Healthcare Admin Platform API',
        version: '1.0.0',
        description: 'Comprehensive healthcare administration platform with HIPAA-compliant patient management, user administration, and facility operations.',
        contact: {
          name: 'Healthcare Admin API Team',
          email: 'api-support@healthcare-admin.com'
        },
        license: {
          name: 'Proprietary',
          url: 'https://healthcare-admin.com/license'
        }
      },
      servers: [
        {
          url: 'https://api.healthcare-admin.com',
          description: 'Production API Server'
        },
        {
          url: 'https://staging-api.healthcare-admin.com',
          description: 'Staging API Server'
        }
      ],
      paths: this.generateOpenApiPaths(apis),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
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
          200: { description: 'Success' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not Found' },
          500: { description: 'Internal Server Error' }
        }
      };
    });
    
    return paths;
  }
}
