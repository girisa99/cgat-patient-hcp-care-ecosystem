/**
 * ENROLLMENT TEMPLATE MANAGER
 * Manages templates for different enrollment modules
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

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

interface EnrollmentTemplateManagerProps {
  moduleType: ModuleType;
  templates: EnrollmentTemplate[];
  onTemplateChange: () => void;
}

export const EnrollmentTemplateManager: React.FC<EnrollmentTemplateManagerProps> = ({
  moduleType,
  templates,
  onTemplateChange
}) => {
  const [editingTemplate, setEditingTemplate] = useState<EnrollmentTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    form_schema: '',
    validation_rules: '',
    workflow_config: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      form_schema: '',
      validation_rules: '',
      workflow_config: ''
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleEdit = (template: EnrollmentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.template_data?.description || '',
      form_schema: JSON.stringify(template.form_schema, null, 2),
      validation_rules: JSON.stringify(template.validation_rules, null, 2),
      workflow_config: JSON.stringify(template.workflow_config, null, 2)
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetForm();
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate JSON fields
      let formSchema, validationRules, workflowConfig;
      try {
        formSchema = JSON.parse(formData.form_schema || '{}');
        validationRules = JSON.parse(formData.validation_rules || '{}');
        workflowConfig = JSON.parse(formData.workflow_config || '{}');
      } catch (error) {
        showError('Invalid JSON format in configuration fields');
        return;
      }

      const templateData = {
        name: formData.name,
        module_type: moduleType,
        template_data: {
          title: formData.name,
          description: formData.description
        },
        form_schema: formSchema,
        validation_rules: validationRules,
        workflow_config: workflowConfig,
        is_active: true
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('enrollment_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        showSuccess('Template updated successfully');
      } else {
        // Create new template
        const { error } = await supabase
          .from('enrollment_templates')
          .insert([templateData]);

        if (error) throw error;
        showSuccess('Template created successfully');
      }

      resetForm();
      onTemplateChange();
    } catch (error) {
      console.error('Template save error:', error);
      showError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('enrollment_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      showSuccess('Template deleted successfully');
      onTemplateChange();
    } catch (error) {
      console.error('Template delete error:', error);
      showError('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (template: EnrollmentTemplate) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('enrollment_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      showSuccess(`Template ${template.is_active ? 'deactivated' : 'activated'}`);
      onTemplateChange();
    } catch (error) {
      console.error('Template toggle error:', error);
      showError('Failed to update template status');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (template: EnrollmentTemplate) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('enrollment_templates')
        .insert([{
          name: `${template.name} (Copy)`,
          module_type: template.module_type,
          template_data: template.template_data,
          form_schema: template.form_schema,
          validation_rules: template.validation_rules,
          workflow_config: template.workflow_config,
          is_active: false
        }]);

      if (error) throw error;

      showSuccess('Template duplicated successfully');
      onTemplateChange();
    } catch (error) {
      console.error('Template duplicate error:', error);
      showError('Failed to duplicate template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Manager</h2>
          <p className="text-muted-foreground">
            Manage enrollment templates for {moduleType.replace('_', ' ')} module
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template List */}
      <div className="grid gap-4">
        {templates.filter(t => t.module_type === moduleType).map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.template_data?.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={template.is_active ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleActive(template)}
                    >
                      {template.is_active ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <br />
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>
                  <br />
                  {new Date(template.updated_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Fields:</span>
                  <br />
                  {template.form_schema?.fields?.length || 0} fields
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.filter(t => t.module_type === moduleType).length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No templates found for {moduleType.replace('_', ' ')} module
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Editor */}
      {(isCreating || editingTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="form_schema">Form Schema (JSON)</Label>
              <Textarea
                id="form_schema"
                value={formData.form_schema}
                onChange={(e) => setFormData(prev => ({ ...prev, form_schema: e.target.value }))}
                placeholder='{"fields": [{"name": "firstName", "type": "text", "required": true}]}'
                className="h-32 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="validation_rules">Validation Rules (JSON)</Label>
              <Textarea
                id="validation_rules"
                value={formData.validation_rules}
                onChange={(e) => setFormData(prev => ({ ...prev, validation_rules: e.target.value }))}
                placeholder='{"required_fields": ["firstName", "email"]}'
                className="h-24 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="workflow_config">Workflow Configuration (JSON)</Label>
              <Textarea
                id="workflow_config"
                value={formData.workflow_config}
                onChange={(e) => setFormData(prev => ({ ...prev, workflow_config: e.target.value }))}
                placeholder='{"steps": ["intake", "review", "approval"]}'
                className="h-24 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading || !formData.name}>
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};