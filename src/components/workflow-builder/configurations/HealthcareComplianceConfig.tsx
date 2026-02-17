import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FileCheck, Users, AlertTriangle, Plus, Trash2, Heart } from 'lucide-react';

interface HealthcareComplianceConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const HealthcareComplianceConfig: React.FC<HealthcareComplianceConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderHIPAACompliance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          HIPAA Compliance Checker Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="complianceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compliance Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compliance level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="strict">🔒 Strict - Full HIPAA Compliance</SelectItem>
                  <SelectItem value="standard">⚖️ Standard - Basic Requirements</SelectItem>
                  <SelectItem value="minimal">📋 Minimal - Essential Only</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auditTrail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value !== false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Enable Audit Trail</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataEncryption"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value !== false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Encrypt PHI Data</FormLabel>
            </FormItem>
          )}
        />

        {/* PHI Field Detection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>PHI Field Detection Rules</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const rules = configuration.phiDetectionRules || [];
                onChange({ 
                  ...configuration, 
                  phiDetectionRules: [...rules, { fieldName: '', dataType: 'string', required: false }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </div>
          
          {(configuration.phiDetectionRules || []).map((rule: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={rule.fieldName || ''}
                  onChange={(e) => {
                    const rules = [...(configuration.phiDetectionRules || [])];
                    rules[index] = { ...rules[index], fieldName: e.target.value };
                    onChange({ ...configuration, phiDetectionRules: rules });
                  }}
                  placeholder="Field name (e.g., ssn, dob, patient_id)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const rules = [...(configuration.phiDetectionRules || [])];
                    rules.splice(index, 1);
                    onChange({ ...configuration, phiDetectionRules: rules });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={rule.dataType || 'string'} 
                  onValueChange={(value) => {
                    const rules = [...(configuration.phiDetectionRules || [])];
                    rules[index] = { ...rules[index], dataType: value };
                    onChange({ ...configuration, phiDetectionRules: rules });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="ssn">SSN</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rule.required}
                    onCheckedChange={(checked) => {
                      const rules = [...(configuration.phiDetectionRules || [])];
                      rules[index] = { ...rules[index], required: checked };
                      onChange({ ...configuration, phiDetectionRules: rules });
                    }}
                  />
                  <span className="text-sm">Required</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="accessLogging"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Logging Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'detailed'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderICD10Lookup = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-green-600" />
          ICD-10 Codes Lookup Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="icdVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ICD Version *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'ICD-10-CM'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ICD-10-CM">ICD-10-CM (Clinical Modification)</SelectItem>
                  <SelectItem value="ICD-10-PCS">ICD-10-PCS (Procedure Coding System)</SelectItem>
                  <SelectItem value="ICD-11">ICD-11 (WHO)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="searchMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'fuzzy'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="fuzzy">Fuzzy Search</SelectItem>
                  <SelectItem value="semantic">Semantic Search</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Fuzzy + Semantic)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="includeDescriptions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Include Descriptions</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeHierarchy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Include Hierarchy</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Category Filters */}
        <div className="space-y-4">
          <FormLabel>Category Filters</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            {[
              'Infectious diseases', 'Neoplasms', 'Blood disorders', 'Endocrine disorders',
              'Mental disorders', 'Nervous system', 'Eye disorders', 'Ear disorders',
              'Circulatory system', 'Respiratory system', 'Digestive system', 'Skin disorders',
              'Musculoskeletal', 'Genitourinary', 'Pregnancy related', 'Perinatal conditions',
              'Congenital anomalies', 'Symptoms/signs', 'Injury/poisoning', 'External causes',
              'Health status', 'Special purposes'
            ].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Switch
                  checked={configuration.categoryFilters?.[category] || false}
                  onCheckedChange={(checked) => {
                    const filters = { ...configuration.categoryFilters };
                    filters[category] = checked;
                    onChange({ ...configuration, categoryFilters: filters });
                  }}
                />
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="maxResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Results</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderNPIValidator = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          NPI Validator Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Configuration Section */}
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Configuration
          </h4>
          
          <FormField
            control={form.control}
            name="apiEndpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NPI Registry API Endpoint *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://npiregistry.cms.hhs.gov/api" 
                    value={field.value || 'https://npiregistry.cms.hhs.gov/api'}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      onChange({ ...configuration, apiEndpoint: e.target.value });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (if required)</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Enter API key..." 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      onChange({ ...configuration, apiKey: e.target.value });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Version</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onChange({ ...configuration, apiVersion: value });
                  }} 
                  defaultValue={field.value || '2.1'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="2.0">v2.0</SelectItem>
                    <SelectItem value="2.1">v2.1 (Latest)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="validationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validation Type *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange({ ...configuration, validationType: value });
                }} 
                defaultValue={field.value || 'comprehensive'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="format">Format Only</SelectItem>
                  <SelectItem value="registry">Registry Lookup</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive (Format + Registry)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="npiType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NPI Type Filter</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange({ ...configuration, npiType: value });
                }} 
                defaultValue={field.value || 'both'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="both">Both Type 1 & 2</SelectItem>
                  <SelectItem value="type1">Type 1 (Individual)</SelectItem>
                  <SelectItem value="type2">Type 2 (Organization)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* MCP/Tool Integration */}
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-medium text-sm">Tool Integration</h4>
          
          <FormField
            control={form.control}
            name="enableMCPSync"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onChange({ ...configuration, enableMCPSync: checked });
                    }}
                  />
                </FormControl>
                <FormLabel>Enable MCP Data Sync</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saveToDatabase"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onChange({ ...configuration, saveToDatabase: checked });
                    }}
                  />
                </FormControl>
                <FormLabel>Save Results to Database</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="externalWebhook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Webhook (optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-api.com/webhook" 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      onChange({ ...configuration, externalWebhook: e.target.value });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="includeInactive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onChange({ ...configuration, includeInactive: checked });
                    }}
                  />
                </FormControl>
                <FormLabel>Include Inactive NPIs</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeDetails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onChange({ ...configuration, includeDetails: checked });
                    }}
                  />
                </FormControl>
                <FormLabel>Include Provider Details</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cacheDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cache Duration (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="60" 
                  value={field.value || 60}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onChange({ ...configuration, cacheDuration: parseInt(e.target.value) || 60 });
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderClinicalDecisionSupport = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Clinical Decision Support Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="ruleEngine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Engine *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule engine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fhir-cql">FHIR CQL (Clinical Quality Language)</SelectItem>
                  <SelectItem value="arden-syntax">Arden Syntax</SelectItem>
                  <SelectItem value="custom-rules">Custom Rules Engine</SelectItem>
                  <SelectItem value="ml-based">ML-Based Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alertSeverity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Alert Severity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'medium'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Clinical Guidelines */}
        <div className="space-y-4">
          <FormLabel>Active Clinical Guidelines</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Drug Interactions', 'Allergy Alerts', 'Dosage Guidelines', 'Lab Value Alerts',
              'Preventive Care', 'Chronic Disease Management', 'Age-Based Recommendations',
              'Gender-Specific Guidelines', 'Pregnancy Considerations', 'Contraindications'
            ].map((guideline) => (
              <div key={guideline} className="flex items-center space-x-2">
                <Switch
                  checked={configuration.activeGuidelines?.[guideline] !== false}
                  onCheckedChange={(checked) => {
                    const guidelines = { ...configuration.activeGuidelines };
                    guidelines[guideline] = checked;
                    onChange({ ...configuration, activeGuidelines: guidelines });
                  }}
                />
                <span className="text-sm">{guideline}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patientContextRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Require Patient Context</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableOverrides"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow Provider Overrides</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGenericCompliance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="complianceStandard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compliance Standard *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compliance standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hipaa">HIPAA</SelectItem>
                  <SelectItem value="hitech">HITECH</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                  <SelectItem value="sox">SOX</SelectItem>
                  <SelectItem value="pci-dss">PCI DSS</SelectItem>
                  <SelectItem value="custom">Custom Standard</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="validationRules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validation Rules</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Define validation rules..."
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="strictMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Strict Mode</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auditEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Auditing</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'hipaa_compliance_checker':
      return renderHIPAACompliance();
    case 'icd_codes_lookup':
      return renderICD10Lookup();
    case 'npi_validator':
      return renderNPIValidator();
    case 'clinical_decision_support':
      return renderClinicalDecisionSupport();
    case 'cms_data_integration':
    case 'fda_integration':
    default:
      return renderGenericCompliance();
  }
};