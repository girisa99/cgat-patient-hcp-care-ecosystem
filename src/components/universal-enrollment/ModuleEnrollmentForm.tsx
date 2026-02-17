/**
 * MODULE ENROLLMENT FORM
 * Dynamic form component for different enrollment modules
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Save, Send, AlertCircle } from 'lucide-react';

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

interface ModuleEnrollmentFormProps {
  moduleType: ModuleType;
  templates: EnrollmentTemplate[];
  onInstanceCreate: (data: any) => Promise<any>;
}

export const ModuleEnrollmentForm: React.FC<ModuleEnrollmentFormProps> = ({
  moduleType,
  templates,
  onInstanceCreate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EnrollmentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (status: string) => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      await onInstanceCreate({
        template_id: selectedTemplate.id,
        module_type: moduleType,
        enrollment_data: formData,
        submission_method: 'online_form',
        status,
        progress: status === 'draft' ? 0 : 25,
        current_step: 'data_entry'
      });
      
      setFormData({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTemplates = templates.filter(t => t.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">New Enrollment</h2>
        <p className="text-muted-foreground">
          Create a new enrollment for {moduleType.replace('_', ' ')} module
        </p>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {activeTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.template_data?.description || 'No description'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {template.form_schema?.fields?.length || 0} fields
                  </Badge>
                </div>
              </div>
            ))}

            {activeTemplates.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active templates found for this module. Please create a template first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate.form_schema?.fields?.map((field: any) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label || field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      [field.name]: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit('draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSubmit('submitted')}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};