
/**
 * Detects and catalogs onboarding-specific APIs
 * Comprehensive onboarding business functions for treatment centers
 */

import { ApiRlsPolicy, ApiDataMapping } from './ApiIntegrationTypes';

export interface OnboardingEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  module: string;
  isPublic: boolean;
  authentication: string;
  parameters?: string[];
  responses?: Record<string, any>;
  requiresWorkflowPermission?: boolean;
}

export class OnboardingApiDetector {
  /**
   * Detect comprehensive onboarding healthcare business APIs
   */
  static detectOnboardingApis(): OnboardingEndpoint[] {
    const onboardingApis: OnboardingEndpoint[] = [
      // Core Onboarding Workflow (6 endpoints)
      {
        name: 'Start Facility Onboarding',
        method: 'POST',
        path: '/api/onboarding/facilities/start',
        description: 'Initialize onboarding process for new healthcare facility',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['facility_data', 'onboarding_type'],
        responses: { 200: 'Onboarding initiated', 400: 'Invalid facility data' }
      },
      {
        name: 'Complete User Setup',
        method: 'POST',
        path: '/api/onboarding/users/setup',
        description: 'Complete user account setup during onboarding',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['user_data', 'facility_id', 'role_assignments']
      },
      {
        name: 'Grant Facility Access',
        method: 'POST',
        path: '/api/onboarding/access/grant',
        description: 'Grant user access to facility during onboarding',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['user_id', 'facility_id', 'access_level']
      },
      {
        name: 'Get Onboarding Status',
        method: 'GET',
        path: '/api/onboarding/status/{id}',
        description: 'Retrieve current onboarding status and progress',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['onboarding_id']
      },
      {
        name: 'Update Workflow Step',
        method: 'PUT',
        path: '/api/onboarding/workflow/steps/{id}',
        description: 'Update specific workflow step status and data',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['step_id', 'status', 'completion_data']
      },
      {
        name: 'Initialize Workflow',
        method: 'POST',
        path: '/api/onboarding/workflow/initialize',
        description: 'Initialize standard onboarding workflow steps',
        module: 'Onboarding Workflow',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['onboarding_id', 'workflow_type']
      },

      // Treatment Center Onboarding (8 endpoints)
      {
        name: 'Create Treatment Center Application',
        method: 'POST',
        path: '/api/onboarding/treatment-centers',
        description: 'Create new treatment center onboarding application',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['company_info', 'business_info', 'contacts']
      },
      {
        name: 'Update Application Section',
        method: 'PUT',
        path: '/api/onboarding/treatment-centers/{id}/sections/{section}',
        description: 'Update specific section of treatment center application',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['application_id', 'section', 'data']
      },
      {
        name: 'Submit Application',
        method: 'POST',
        path: '/api/onboarding/treatment-centers/{id}/submit',
        description: 'Submit completed treatment center application for review',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['application_id']
      },
      {
        name: 'Get Application Details',
        method: 'GET',
        path: '/api/onboarding/treatment-centers/{id}',
        description: 'Retrieve detailed treatment center application',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['application_id']
      },
      {
        name: 'Calculate Financial Risk',
        method: 'POST',
        path: '/api/onboarding/financial/risk-assessment',
        description: 'Calculate financial risk score for treatment center',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['financial_data', 'business_metrics']
      },
      {
        name: 'Upload Documents',
        method: 'POST',
        path: '/api/onboarding/documents/upload',
        description: 'Upload required documents for onboarding',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['application_id', 'document_type', 'file_data']
      },
      {
        name: 'Verify Licenses',
        method: 'POST',
        path: '/api/onboarding/licenses/verify',
        description: 'Verify healthcare licenses and certifications',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['license_data', 'facility_id']
      },
      {
        name: 'Configure API Requirements',
        method: 'POST',
        path: '/api/onboarding/api-requirements',
        description: 'Configure API integration requirements during onboarding',
        module: 'Treatment Center Onboarding',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['application_id', 'api_requirements']
      },

      // Compliance & Audit (4 endpoints)
      {
        name: 'Log Audit Trail',
        method: 'POST',
        path: '/api/onboarding/audit/log',
        description: 'Log onboarding audit trail events',
        module: 'Onboarding Compliance',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['onboarding_id', 'action_type', 'description']
      },
      {
        name: 'Get Audit History',
        method: 'GET',
        path: '/api/onboarding/audit/{id}/history',
        description: 'Retrieve audit history for onboarding process',
        module: 'Onboarding Compliance',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['onboarding_id', 'date_range']
      },
      {
        name: 'Validate Compliance Requirements',
        method: 'POST',
        path: '/api/onboarding/compliance/validate',
        description: 'Validate compliance requirements for facility',
        module: 'Onboarding Compliance',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['facility_data', 'compliance_programs']
      },
      {
        name: 'Generate Compliance Report',
        method: 'GET',
        path: '/api/onboarding/compliance/report/{id}',
        description: 'Generate compliance assessment report',
        module: 'Onboarding Compliance',
        isPublic: false,
        authentication: 'bearer',
        requiresWorkflowPermission: true,
        parameters: ['onboarding_id', 'report_type']
      }
    ];

    console.log(`🎯 ONBOARDING API: Detected ${onboardingApis.length} onboarding endpoints`);
    return onboardingApis;
  }

  /**
   * Generate onboarding API integration
   */
  static generateOnboardingIntegration() {
    const onboardingEndpoints = this.detectOnboardingApis();
    
    return {
      id: 'onboarding_healthcare_api',
      name: 'Healthcare Onboarding Management API',
      description: 'Comprehensive onboarding APIs for treatment centers, facilities, and healthcare providers',
      type: 'internal' as const,
      version: '1.0.0',
      baseUrl: 'https://api.healthcare-admin.com/onboarding',
      status: 'active' as const,
      category: 'onboarding',
      endpoints: onboardingEndpoints.map(endpoint => ({
        id: `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: endpoint.name,
        method: endpoint.method,
        url: endpoint.path,
        description: endpoint.description,
        isPublic: endpoint.isPublic,
        authentication: endpoint.authentication === 'bearer' ? {
          type: 'bearer' as const,
          required: true
        } : {
          type: 'none' as const,
          required: false
        },
        parameters: endpoint.parameters || [],
        responses: endpoint.responses || { 200: 'Success' },
        fullUrl: `https://api.healthcare-admin.com/onboarding${endpoint.path}`,
        headers: endpoint.authentication === 'bearer' ? { 'Authorization': 'Bearer {token}' } : {},
        queryParams: endpoint.method === 'GET' && endpoint.parameters ? 
          endpoint.parameters.reduce((acc, param) => ({ ...acc, [param]: 'value' }), {}) : {},
        bodySchema: endpoint.method !== 'GET' && endpoint.parameters ? 
          endpoint.parameters.reduce((acc, param) => ({ ...acc, [param]: 'string' }), {}) : undefined,
        requiresWorkflowPermission: endpoint.requiresWorkflowPermission || false
      })),
      schemas: {
        OnboardingApplication: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'] },
            company_info: { type: 'object' },
            business_info: { type: 'object' },
            contacts: { type: 'object' }
          }
        },
        WorkflowStep: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            onboarding_id: { type: 'string', format: 'uuid' },
            step_name: { type: 'string' },
            step_type: { type: 'string' },
            status: { type: 'string' },
            assigned_to: { type: 'string', format: 'uuid' }
          }
        },
        FinancialAssessment: {
          type: 'object',
          properties: {
            risk_score: { type: 'integer' },
            risk_level: { type: 'string' },
            credit_limit_recommendation: { type: 'number' },
            annual_revenue_range: { type: 'string' }
          }
        }
      },
      rlsPolicies: [
        {
          table: 'treatment_center_onboarding',
          policy: 'Users can view own onboarding applications',
          type: 'SELECT',
          policyName: 'user_own_onboarding_select',
          operation: 'SELECT',
          tableName: 'treatment_center_onboarding',
          condition: 'user_id = auth.uid()',
          roles: ['authenticated']
        },
        {
          table: 'onboarding_workflow_steps',
          policy: 'Workflow managers can update steps',
          type: 'UPDATE',
          policyName: 'workflow_manager_steps_update',
          operation: 'UPDATE',
          tableName: 'onboarding_workflow_steps',
          condition: 'EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN (\'onboardingTeam\', \'workflowManager\', \'superAdmin\'))',
          roles: ['onboardingTeam', 'workflowManager', 'superAdmin']
        },
        {
          table: 'onboarding_audit_trail',
          policy: 'Audit trail readable by authorized users',
          type: 'SELECT',
          policyName: 'onboarding_audit_authorized_select',
          operation: 'SELECT',
          tableName: 'onboarding_audit_trail',
          condition: 'EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN (\'onboardingTeam\', \'superAdmin\'))',
          roles: ['onboardingTeam', 'superAdmin']
        }
      ] as ApiRlsPolicy[],
      mappings: [
        {
          internal: 'treatment_center_onboarding',
          external: 'onboarding_applications',
          type: 'table',
          sourceField: 'treatment_center_onboarding.id',
          targetField: 'onboarding_applications.id',
          targetTable: 'onboarding_applications',
          transformation: 'direct'
        },
        {
          internal: 'onboarding_workflow_steps',
          external: 'workflow_steps',
          type: 'table',
          sourceField: 'onboarding_workflow_steps.onboarding_id',
          targetField: 'workflow_steps.application_id',
          targetTable: 'workflow_steps',
          transformation: 'join'
        },
        {
          internal: 'onboarding_financial_assessment',
          external: 'financial_assessments',
          type: 'table',
          sourceField: 'onboarding_financial_assessment.onboarding_id',
          targetField: 'financial_assessments.application_id',
          targetTable: 'financial_assessments',
          transformation: 'join'
        }
      ] as ApiDataMapping[]
    };
  }

  /**
   * Generate onboarding external documentation
   */
  static generateOnboardingDocumentation(): any {
    const onboardingApis = this.detectOnboardingApis();
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Healthcare Onboarding Management API',
        version: '1.0.0',
        description: `Comprehensive onboarding management API with ${onboardingApis.length} endpoints for treatment centers, facilities, and healthcare provider onboarding processes.`,
        contact: {
          name: 'Healthcare Onboarding API Team',
          email: 'onboarding-api@healthcare-admin.com'
        }
      },
      servers: [
        {
          url: 'https://api.healthcare-admin.com/onboarding',
          description: 'Healthcare Onboarding API Server'
        }
      ],
      paths: this.generateOnboardingOpenApiPaths(onboardingApis),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Healthcare onboarding authentication token'
          }
        }
      }
    };
  }

  private static generateOnboardingOpenApiPaths(apis: OnboardingEndpoint[]): any {
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
          200: { description: 'Successful onboarding operation' },
          401: { description: 'Authentication required' },
          403: { description: 'Insufficient permissions' },
          404: { description: 'Resource not found' },
          500: { description: 'Server error' }
        }
      };
    });
    
    return paths;
  }
}
