/**
 * UNIVERSAL ENROLLMENT HOOK
 * Centralized hook for managing all enrollment module operations
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentTemplate {
  id: string;
  name: string;
  module_type: ModuleType;
  template_data: any;
  form_schema: any;
  validation_rules: any;
  workflow_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnrollmentInstance {
  id: string;
  template_id: string | null;
  module_type: ModuleType;
  enrollment_data: any;
  submission_method: string;
  status: string;
  progress: number;
  current_step: string;
  assigned_to: string | null;
  submitted_by: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateInstanceData {
  template_id: string | null;
  module_type: ModuleType;
  enrollment_data: any;
  submission_method: string;
  status: string;
  progress: number;
  current_step: string;
  assigned_to?: string | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
}

export const useUniversalEnrollment = () => {
  const [templates, setTemplates] = useState<EnrollmentTemplate[]>([]);
  const [instances, setInstances] = useState<EnrollmentInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  // Create default templates for each module type
  const createDefaultTemplates = useCallback(() => {
    const defaultTemplates: EnrollmentTemplate[] = [
      {
        id: 'patient-default',
        name: 'Patient Enrollment Template',
        module_type: 'patient',
        template_data: {
          title: 'Patient Enrollment',
          description: 'Standard patient enrollment form'
        },
        form_schema: {
          fields: [
            { name: 'firstName', type: 'text', required: true, label: 'First Name' },
            { name: 'lastName', type: 'text', required: true, label: 'Last Name' },
            { name: 'dateOfBirth', type: 'date', required: true, label: 'Date of Birth' },
            { name: 'email', type: 'email', required: true, label: 'Email' },
            { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
            { name: 'address', type: 'textarea', required: true, label: 'Address' },
            { name: 'medicalHistory', type: 'textarea', required: false, label: 'Medical History' }
          ]
        },
        validation_rules: {
          required_fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address']
        },
        workflow_config: {
          steps: ['intake', 'verification', 'approval', 'completed'],
          approvals: ['medical_review']
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'treatment-center-default',
        name: 'Treatment Center Onboarding Template',
        module_type: 'treatment_center',
        template_data: {
          title: 'Treatment Center Onboarding',
          description: 'Treatment center registration and onboarding form'
        },
        form_schema: {
          fields: [
            { name: 'facilityName', type: 'text', required: true, label: 'Facility Name' },
            { name: 'licenseNumber', type: 'text', required: true, label: 'License Number' },
            { name: 'npiNumber', type: 'text', required: true, label: 'NPI Number' },
            { name: 'address', type: 'textarea', required: true, label: 'Facility Address' },
            { name: 'contactPerson', type: 'text', required: true, label: 'Contact Person' },
            { name: 'email', type: 'email', required: true, label: 'Contact Email' },
            { name: 'phone', type: 'tel', required: true, label: 'Contact Phone' },
            { name: 'specialties', type: 'multiselect', required: true, label: 'Treatment Specialties' }
          ]
        },
        validation_rules: {
          required_fields: ['facilityName', 'licenseNumber', 'npiNumber', 'address', 'contactPerson', 'email', 'phone']
        },
        workflow_config: {
          steps: ['registration', 'document_verification', 'compliance_review', 'approval', 'onboarding'],
          approvals: ['compliance_team', 'medical_director']
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'customer-default',
        name: 'Customer Onboarding Template',
        module_type: 'customer',
        template_data: {
          title: 'Customer Onboarding',
          description: 'Standard customer registration and onboarding form'
        },
        form_schema: {
          fields: [
            { name: 'companyName', type: 'text', required: true, label: 'Company Name' },
            { name: 'contactPerson', type: 'text', required: true, label: 'Primary Contact' },
            { name: 'email', type: 'email', required: true, label: 'Business Email' },
            { name: 'phone', type: 'tel', required: true, label: 'Business Phone' },
            { name: 'address', type: 'textarea', required: true, label: 'Business Address' },
            { name: 'industry', type: 'select', required: true, label: 'Industry Type' },
            { name: 'companySize', type: 'select', required: true, label: 'Company Size' }
          ]
        },
        validation_rules: {
          required_fields: ['companyName', 'contactPerson', 'email', 'phone', 'address', 'industry']
        },
        workflow_config: {
          steps: ['registration', 'verification', 'setup', 'activation'],
          approvals: ['sales_team']
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'manufacturer-default',
        name: 'Manufacturer Onboarding Template',
        module_type: 'manufacturer',
        template_data: {
          title: 'Manufacturer Onboarding',
          description: 'Manufacturer partner registration and onboarding form'
        },
        form_schema: {
          fields: [
            { name: 'companyName', type: 'text', required: true, label: 'Manufacturer Name' },
            { name: 'fdaRegistration', type: 'text', required: true, label: 'FDA Registration Number' },
            { name: 'gmpCertification', type: 'text', required: true, label: 'GMP Certification' },
            { name: 'contactPerson', type: 'text', required: true, label: 'Primary Contact' },
            { name: 'email', type: 'email', required: true, label: 'Contact Email' },
            { name: 'phone', type: 'tel', required: true, label: 'Contact Phone' },
            { name: 'address', type: 'textarea', required: true, label: 'Manufacturing Address' },
            { name: 'productCategories', type: 'multiselect', required: true, label: 'Product Categories' }
          ]
        },
        validation_rules: {
          required_fields: ['companyName', 'fdaRegistration', 'gmpCertification', 'contactPerson', 'email', 'phone']
        },
        workflow_config: {
          steps: ['application', 'document_review', 'facility_inspection', 'compliance_verification', 'approval'],
          approvals: ['regulatory_team', 'quality_assurance']
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setTemplates(defaultTemplates);
    return defaultTemplates;
  }, []);

  // Template Operations
  const fetchTemplates = useCallback(async (moduleType?: ModuleType) => {
    try {
      setLoading(true);
      setError(null);

      // For now, use default templates
      const defaultTemplates = createDefaultTemplates();
      const filteredTemplates = moduleType 
        ? defaultTemplates.filter(t => t.module_type === moduleType)
        : defaultTemplates;

      setTemplates(filteredTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates');
      showError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [showError, createDefaultTemplates]);

  const createTemplate = useCallback(async (templateData: Omit<EnrollmentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const newTemplate: EnrollmentTemplate = {
        ...templateData,
        id: `custom-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTemplates(prev => [...prev, newTemplate]);
      showSuccess('Template created successfully');
      return newTemplate;
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create template');
      showError('Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EnrollmentTemplate>) => {
    try {
      setLoading(true);
      setError(null);

      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? { ...template, ...updates, updated_at: new Date().toISOString() }
          : template
      ));
      showSuccess('Template updated successfully');
      return templates.find(t => t.id === id);
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template');
      showError('Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess, templates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      setTemplates(prev => prev.filter(template => template.id !== id));
      showSuccess('Template deleted successfully');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
      showError('Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  // Instance Operations
  const fetchInstances = useCallback(async (moduleType?: ModuleType) => {
    try {
      setLoading(true);
      setError(null);

      // For now, return empty array
      setInstances([]);
    } catch (err) {
      console.error('Error fetching instances:', err);
      setError('Failed to fetch enrollment instances');
      showError('Failed to fetch enrollment instances');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const getInstance = useCallback(async (id: string): Promise<EnrollmentInstance | null> => {
    try {
      return instances.find(instance => instance.id === id) || null;
    } catch (err) {
      console.error('Error fetching instance:', err);
      return null;
    }
  }, [instances]);

  const createInstance = useCallback(async (instanceData: CreateInstanceData) => {
    try {
      setLoading(true);
      setError(null);

      const newInstance: EnrollmentInstance = {
        ...instanceData,
        id: `instance-${Date.now()}`,
        assigned_to: instanceData.assigned_to || null,
        submitted_by: instanceData.submitted_by || null,
        submitted_at: instanceData.submitted_at || null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setInstances(prev => [newInstance, ...prev]);
      showSuccess('Enrollment instance created successfully');
      return newInstance;
    } catch (err) {
      console.error('Error creating instance:', err);
      setError('Failed to create enrollment instance');
      showError('Failed to create enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const updateInstance = useCallback(async (id: string, updates: Partial<EnrollmentInstance>) => {
    try {
      setLoading(true);
      setError(null);

      setInstances(prev => prev.map(instance => 
        instance.id === id 
          ? { ...instance, ...updates, updated_at: new Date().toISOString() }
          : instance
      ));
      showSuccess('Enrollment instance updated successfully');
      return instances.find(i => i.id === id);
    } catch (err) {
      console.error('Error updating instance:', err);
      setError('Failed to update enrollment instance');
      showError('Failed to update enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess, instances]);

  const deleteInstance = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      setInstances(prev => prev.filter(instance => instance.id !== id));
      showSuccess('Enrollment instance deleted successfully');
    } catch (err) {
      console.error('Error deleting instance:', err);
      setError('Failed to delete enrollment instance');
      showError('Failed to delete enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  // Statistics
  const getInstanceStats = useCallback((moduleType?: ModuleType) => {
    const filteredInstances = moduleType 
      ? instances.filter(instance => instance.module_type === moduleType)
      : instances;

    return {
      total: filteredInstances.length,
      draft: filteredInstances.filter(i => i.status === 'draft').length,
      in_progress: filteredInstances.filter(i => i.status === 'in_progress').length,
      review_needed: filteredInstances.filter(i => i.status === 'review_needed').length,
      completed: filteredInstances.filter(i => i.status === 'completed').length,
      rejected: filteredInstances.filter(i => i.status === 'rejected').length
    };
  }, [instances]);

  return {
    // State
    templates,
    instances,
    loading,
    error,

    // Template operations
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Instance operations
    fetchInstances,
    getInstance,
    createInstance,
    updateInstance,
    deleteInstance,

    // Utils
    getInstanceStats
  };
};