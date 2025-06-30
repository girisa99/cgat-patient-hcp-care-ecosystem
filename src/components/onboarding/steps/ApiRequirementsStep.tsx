
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { 
  Globe, 
  Server, 
  Code, 
  Database,
  ExternalLink,
  Info
} from 'lucide-react';

interface ApiRequirementsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface ApiRequirements {
  needs_api_integration: boolean;
  integration_priority: 'high' | 'medium' | 'low';
  integration_timeline: string;
  current_systems: string[];
  data_exchange_needs: string[];
  security_requirements: string[];
  technical_contact_name?: string;
  technical_contact_email?: string;
  technical_contact_phone?: string;
  additional_notes?: string;
}

export const ApiRequirementsStep: React.FC<ApiRequirementsStepProps> = ({
  data,
  onDataChange,
}) => {
  const apiRequirements = data.api_requirements || {
    needs_api_integration: false,
    integration_priority: 'medium',
    integration_timeline: 'within_3_months',
    current_systems: [],
    data_exchange_needs: [],
    security_requirements: [],
    additional_notes: '',
  };

  const updateRequirements = (updates: Partial<ApiRequirements>) => {
    onDataChange({
      api_requirements: { ...apiRequirements, ...updates },
    });
  };

  const systemOptions = [
    'EHR/EMR System',
    'Practice Management System',
    'Pharmacy Management System',
    'Inventory Management System',
    'Financial/Billing System',
    'Laboratory Information System',
    'Patient Portal',
    'Telemedicine Platform',
    'Other'
  ];

  const dataExchangeOptions = [
    'Patient Data',
    'Order Management',
    'Inventory Updates',
    'Billing Information',
    'Clinical Data',
    'Prescription Data',
    'Lab Results',
    'Reporting Data'
  ];

  const securityOptions = [
    'HIPAA Compliance',
    'SOC 2 Type II',
    'API Authentication',
    'Data Encryption',
    'Audit Logging',
    'Role-based Access',
    'IP Whitelisting'
  ];

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">API Integration Requirements</h4>
              <p className="text-sm text-blue-700 mt-1">
                Help us understand your technical integration needs. Based on your requirements, 
                our team will work with you to set up the appropriate API connections and data flows 
                through our API Services platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Integration Need */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Integration Requirements</span>
          </CardTitle>
          <CardDescription>
            Do you need API integration with your existing systems?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="needs-integration"
              checked={apiRequirements.needs_api_integration}
              onCheckedChange={(checked) => updateRequirements({ needs_api_integration: checked })}
            />
            <Label htmlFor="needs-integration">Yes, we need API integration</Label>
          </div>

          {apiRequirements.needs_api_integration && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Integration Priority</Label>
                  <Select
                    value={apiRequirements.integration_priority}
                    onValueChange={(value: any) => updateRequirements({ integration_priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Critical for operations</SelectItem>
                      <SelectItem value="medium">Medium - Important but not urgent</SelectItem>
                      <SelectItem value="low">Low - Nice to have</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeline">Desired Timeline</Label>
                  <Select
                    value={apiRequirements.integration_timeline}
                    onValueChange={(value) => updateRequirements({ integration_timeline: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (within 30 days)</SelectItem>
                      <SelectItem value="within_3_months">Within 3 months</SelectItem>
                      <SelectItem value="within_6_months">Within 6 months</SelectItem>
                      <SelectItem value="within_year">Within a year</SelectItem>
                      <SelectItem value="flexible">Flexible timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Systems */}
      {apiRequirements.needs_api_integration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Current Systems</span>
            </CardTitle>
            <CardDescription>
              Which systems do you currently use that might need integration?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {systemOptions.map((system) => (
                <div key={system} className="flex items-center space-x-2">
                  <Checkbox
                    id={system}
                    checked={apiRequirements.current_systems.includes(system)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateRequirements({
                          current_systems: [...apiRequirements.current_systems, system],
                        });
                      } else {
                        updateRequirements({
                          current_systems: apiRequirements.current_systems.filter(s => s !== system),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={system} className="text-sm">{system}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Exchange Needs */}
      {apiRequirements.needs_api_integration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Exchange Needs</span>
            </CardTitle>
            <CardDescription>
              What types of data do you need to exchange through APIs?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dataExchangeOptions.map((dataType) => (
                <div key={dataType} className="flex items-center space-x-2">
                  <Checkbox
                    id={dataType}
                    checked={apiRequirements.data_exchange_needs.includes(dataType)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateRequirements({
                          data_exchange_needs: [...apiRequirements.data_exchange_needs, dataType],
                        });
                      } else {
                        updateRequirements({
                          data_exchange_needs: apiRequirements.data_exchange_needs.filter(d => d !== dataType),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={dataType} className="text-sm">{dataType}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Requirements */}
      {apiRequirements.needs_api_integration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Security & Compliance</span>
            </CardTitle>
            <CardDescription>
              What security and compliance requirements do you have?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {securityOptions.map((security) => (
                <div key={security} className="flex items-center space-x-2">
                  <Checkbox
                    id={security}
                    checked={apiRequirements.security_requirements.includes(security)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateRequirements({
                          security_requirements: [...apiRequirements.security_requirements, security],
                        });
                      } else {
                        updateRequirements({
                          security_requirements: apiRequirements.security_requirements.filter(s => s !== security),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={security} className="text-sm">{security}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Contact */}
      {apiRequirements.needs_api_integration && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Contact</CardTitle>
            <CardDescription>
              Who should our technical team contact regarding API integration?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tech-name">Contact Name</Label>
                <input
                  id="tech-name"
                  className="w-full p-2 border rounded-md"
                  value={apiRequirements.technical_contact_name || ''}
                  onChange={(e) => updateRequirements({ technical_contact_name: e.target.value })}
                  placeholder="Technical contact name"
                />
              </div>
              <div>
                <Label htmlFor="tech-email">Email</Label>
                <input
                  id="tech-email"
                  type="email"
                  className="w-full p-2 border rounded-md"
                  value={apiRequirements.technical_contact_email || ''}
                  onChange={(e) => updateRequirements({ technical_contact_email: e.target.value })}
                  placeholder="technical@example.com"
                />
              </div>
              <div>
                <Label htmlFor="tech-phone">Phone</Label>
                <input
                  id="tech-phone"
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  value={apiRequirements.technical_contact_phone || ''}
                  onChange={(e) => updateRequirements({ technical_contact_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {apiRequirements.needs_api_integration && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Requirements</CardTitle>
            <CardDescription>
              Any additional technical requirements or notes about your integration needs?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={apiRequirements.additional_notes || ''}
              onChange={(e) => updateRequirements({ additional_notes: e.target.value })}
              placeholder="Describe any specific integration requirements, existing APIs, or technical constraints..."
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Next Steps Information */}
      {apiRequirements.needs_api_integration && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <ExternalLink className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Next Steps</h4>
                <p className="text-sm text-green-700 mt-1">
                  After completing your onboarding, you'll have access to our API Services platform 
                  where you can manage all your integrations, view documentation, test endpoints, 
                  and monitor API usage. Our technical team will also reach out to discuss your 
                  specific requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
