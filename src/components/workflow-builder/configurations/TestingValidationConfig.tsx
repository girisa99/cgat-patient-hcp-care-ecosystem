import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TestTube, CheckCircle, AlertTriangle, BarChart, Database, Plus, Trash2 } from 'lucide-react';

interface TestingValidationConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const TestingValidationConfig: React.FC<TestingValidationConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderCommonConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Flow State & Memory Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableFlowState"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Flow State</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Memory</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableMemory && (
          <FormField
            control={form.control}
            name="memoryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'conversation'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="conversation">💬 Conversation Memory</SelectItem>
                    <SelectItem value="entity">👤 Entity Memory</SelectItem>
                    <SelectItem value="summary">📝 Summary Memory</SelectItem>
                    <SelectItem value="vector">🔍 Vector Memory</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableJsonOutput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>JSON Structured Output</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addKnowledge"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Add Knowledge Base</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableJsonOutput && (
          <FormField
            control={form.control}
            name="jsonSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JSON Output Schema</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {"result": {"type": "string"}, "confidence": {"type": "number"}}}'
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderUnitTesting = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-green-500" />
          Unit Testing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="testFramework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testing Framework *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="jest">🧪 Jest</SelectItem>
                  <SelectItem value="mocha">☕ Mocha</SelectItem>
                  <SelectItem value="jasmine">🌸 Jasmine</SelectItem>
                  <SelectItem value="pytest">🐍 PyTest</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Framework</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Directory</FormLabel>
              <FormControl>
                <Input placeholder="./tests" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testPattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test File Pattern</FormLabel>
              <FormControl>
                <Input placeholder="**/*.test.js" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableCoverage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Coverage Report</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMocking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Mocking</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parallelExecution"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Parallel Tests</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableCoverage && (
          <FormField
            control={form.control}
            name="coverageThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" placeholder="80" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderIntegrationTesting = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          Integration Testing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="integrationScope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integration Scope *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="api">🌐 API Integration</SelectItem>
                  <SelectItem value="database">🗄️ Database Integration</SelectItem>
                  <SelectItem value="workflow">🔄 Workflow Integration</SelectItem>
                  <SelectItem value="external">🔗 External Services</SelectItem>
                  <SelectItem value="end-to-end">🎯 End-to-End</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testEnvironment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Environment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'staging'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="local">💻 Local</SelectItem>
                  <SelectItem value="development">🛠️ Development</SelectItem>
                  <SelectItem value="staging">🎭 Staging</SelectItem>
                  <SelectItem value="production">🚀 Production</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="setupScript"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup Script</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="#!/bin/bash&#10;npm install&#10;docker-compose up -d"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teardownScript"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teardown Script</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="#!/bin/bash&#10;docker-compose down&#10;npm run cleanup"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Timeout (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="300" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retryAttempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retry Attempts</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadTesting = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-orange-500" />
          Load Testing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="loadTestingTool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Load Testing Tool *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tool" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="k6">📊 K6</SelectItem>
                  <SelectItem value="locust">🦗 Locust</SelectItem>
                  <SelectItem value="jmeter">☕ JMeter</SelectItem>
                  <SelectItem value="artillery">🎯 Artillery</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Tool</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="virtualUsers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Virtual Users</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rampUp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ramp-up (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="60" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetEndpoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Endpoints</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="https://api.example.com/users&#10;https://api.example.com/orders"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responseTimeThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Time Threshold (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2000" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="errorRateThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Error Rate Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderValidationRules = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Validation Rules Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Validation Rules</FormLabel>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => {
              const rules = configuration.validationRules || [];
              onChange({ 
                ...configuration, 
                validationRules: [...rules, { type: 'required', field: '', message: '' }] 
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
        
        {(configuration.validationRules || []).map((rule: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Select
                value={rule.type || 'required'}
                onValueChange={(value) => {
                  const rules = [...(configuration.validationRules || [])];
                  rules[index] = { ...rules[index], type: value };
                  onChange({ ...configuration, validationRules: rules });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={rule.field || ''}
                onChange={(e) => {
                  const rules = [...(configuration.validationRules || [])];
                  rules[index] = { ...rules[index], field: e.target.value };
                  onChange({ ...configuration, validationRules: rules });
                }}
                placeholder="Field name"
              />
              <Input
                value={rule.message || ''}
                onChange={(e) => {
                  const rules = [...(configuration.validationRules || [])];
                  rules[index] = { ...rules[index], message: e.target.value };
                  onChange({ ...configuration, validationRules: rules });
                }}
                placeholder="Error message"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const rules = [...(configuration.validationRules || [])];
                  rules.splice(index, 1);
                  onChange({ ...configuration, validationRules: rules });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'unit_testing':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderUnitTesting()}
            {renderValidationRules()}
          </div>
        );
      case 'integration_testing':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderIntegrationTesting()}
            {renderValidationRules()}
          </div>
        );
      case 'load_testing':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderLoadTesting()}
            {renderValidationRules()}
          </div>
        );
      case 'validation_engine':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderValidationRules()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderUnitTesting()}
            {renderIntegrationTesting()}
            {renderValidationRules()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};