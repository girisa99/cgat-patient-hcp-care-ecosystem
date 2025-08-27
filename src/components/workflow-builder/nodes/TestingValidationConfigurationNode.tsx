import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, TestTube, CheckCircle, Activity, Bug } from 'lucide-react';

export const TestingValidationConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Test Configuration
    test_type: data.test_type || 'flow_tester',
    test_name: data.test_name || '',
    test_description: data.test_description || '',
    
    // Test Scenarios
    test_scenarios: data.test_scenarios || [],
    
    // Flow Testing
    flow_test_config: data.flow_test_config || {
      test_inputs: [],
      expected_outputs: [],
      validation_rules: [],
      timeout_ms: 30000
    },
    
    // Response Validation
    response_validation_config: data.response_validation_config || {
      schema_validation: true,
      content_validation: true,
      performance_validation: true,
      security_validation: false
    },
    
    // Load Testing
    load_test_config: data.load_test_config || {
      concurrent_users: 10,
      test_duration_minutes: 5,
      ramp_up_time_minutes: 1,
      target_rps: 100
    },
    
    // Debug Configuration
    debug_config: data.debug_config || {
      log_level: 'debug',
      capture_requests: true,
      capture_responses: true,
      capture_errors: true,
      trace_execution: true
    },
    
    // Assertions
    assertions: data.assertions || [],
    
    // Test Data
    test_data_sources: data.test_data_sources || [],
    mock_data_enabled: data.mock_data_enabled || false,
    
    // Reporting
    reporting_config: data.reporting_config || {
      generate_report: true,
      report_format: 'json',
      include_screenshots: false,
      include_logs: true
    },
    
    // Continuous Testing
    continuous_testing_enabled: data.continuous_testing_enabled || false,
    test_schedule: data.test_schedule || '',
    
    // Integration Testing
    integration_endpoints: data.integration_endpoints || [],
    
    // Performance Metrics
    performance_thresholds: data.performance_thresholds || {
      max_response_time_ms: 1000,
      min_success_rate: 95,
      max_error_rate: 5
    },
    
    // Notification Settings
    notification_settings: data.notification_settings || {
      notify_on_failure: true,
      notify_on_success: false,
      notification_channels: []
    }
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof data?.configOpen !== 'undefined') {
      setIsExpanded(!!data.configOpen);
    }
  }, [data?.configOpen]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addTestScenario = () => {
    updateConfig({
      test_scenarios: [...config.test_scenarios, { 
        name: '', 
        description: '', 
        enabled: true,
        priority: 'medium',
        steps: []
      }]
    });
  };

  const updateTestScenario = (index: number, field: string, value: any) => {
    const updated = [...config.test_scenarios];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ test_scenarios: updated });
  };

  const removeTestScenario = (index: number) => {
    updateConfig({
      test_scenarios: config.test_scenarios.filter((_, i) => i !== index)
    });
  };

  const addAssertion = () => {
    updateConfig({
      assertions: [...config.assertions, {
        type: 'equals',
        field: '',
        expected_value: '',
        description: ''
      }]
    });
  };

  const updateAssertion = (index: number, field: string, value: any) => {
    const updated = [...config.assertions];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ assertions: updated });
  };

  const removeAssertion = (index: number) => {
    updateConfig({
      assertions: config.assertions.filter((_, i) => i !== index)
    });
  };

  const addTestDataSource = () => {
    updateConfig({
      test_data_sources: [...config.test_data_sources, {
        name: '',
        type: 'json',
        source: '',
        enabled: true
      }]
    });
  };

  const updateTestDataSource = (index: number, field: string, value: any) => {
    const updated = [...config.test_data_sources];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ test_data_sources: updated });
  };

  const removeTestDataSource = (index: number) => {
    updateConfig({
      test_data_sources: config.test_data_sources.filter((_, i) => i !== index)
    });
  };

  const testTypes = [
    { value: 'flow_tester', label: 'Flow Tester' },
    { value: 'response_validator', label: 'Response Validator' },
    { value: 'load_tester', label: 'Load Tester' },
    { value: 'debug_console', label: 'Debug Console' }
  ];

  const assertionTypes = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Field Exists' },
    { value: 'not_null', label: 'Not Null' },
    { value: 'regex_match', label: 'Regex Match' }
  ];

  const dataSourceTypes = [
    { value: 'json', label: 'JSON File' },
    { value: 'csv', label: 'CSV File' },
    { value: 'database', label: 'Database Query' },
    { value: 'api', label: 'API Endpoint' },
    { value: 'mock', label: 'Mock Data' }
  ];

  const reportFormats = [
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'pdf', label: 'PDF' },
    { value: 'xml', label: 'XML' }
  ];

  const logLevels = [
    { value: 'error', label: 'Error' },
    { value: 'warn', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' },
    { value: 'trace', label: 'Trace' }
  ];

  const getTestIcon = () => {
    switch (config.test_type) {
      case 'response_validator': return CheckCircle;
      case 'load_tester': return Activity;
      case 'debug_console': return Bug;
      default: return TestTube;
    }
  };

  const TestIcon = getTestIcon();

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={TestIcon}
      title={`${data.display_name || 'Testing & Validation'} - ${config.test_type}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.test_type}
        </Badge>
        {config.test_scenarios.length > 0 && (
          <Badge variant="outline" className="mr-1">{config.test_scenarios.length} Scenarios</Badge>
        )}
        {config.continuous_testing_enabled && (
          <Badge variant="outline">Continuous</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Test Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TestIcon className="w-4 h-4" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Test Type</Label>
                <Select value={config.test_type} onValueChange={(value) => updateConfig({ test_type: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Test Name</Label>
                  <Input
                    className="h-8"
                    value={config.test_name}
                    onChange={(e) => updateConfig({ test_name: e.target.value })}
                    placeholder="My Test Suite"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Continuous Testing</Label>
                  <Switch
                    checked={config.continuous_testing_enabled}
                    onCheckedChange={(checked) => updateConfig({ continuous_testing_enabled: checked })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Test Description</Label>
                <Textarea
                  className="min-h-16 text-xs"
                  value={config.test_description}
                  onChange={(e) => updateConfig({ test_description: e.target.value })}
                  placeholder="Describe what this test validates..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Flow Testing Configuration */}
          {config.test_type === 'flow_tester' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Flow Testing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.flow_test_config.timeout_ms}
                    onChange={(e) => {
                      const newConfig = { ...config.flow_test_config, timeout_ms: parseInt(e.target.value) };
                      updateConfig({ flow_test_config: newConfig });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Validation Configuration */}
          {config.test_type === 'response_validator' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Response Validation Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.response_validation_config.schema_validation}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.response_validation_config, schema_validation: checked };
                        updateConfig({ response_validation_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Schema Validation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.response_validation_config.content_validation}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.response_validation_config, content_validation: checked };
                        updateConfig({ response_validation_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Content Validation</Label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.response_validation_config.performance_validation}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.response_validation_config, performance_validation: checked };
                        updateConfig({ response_validation_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Performance Validation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.response_validation_config.security_validation}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.response_validation_config, security_validation: checked };
                        updateConfig({ response_validation_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Security Validation</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Load Testing Configuration */}
          {config.test_type === 'load_tester' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Load Testing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Concurrent Users</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.load_test_config.concurrent_users}
                      onChange={(e) => {
                        const newConfig = { ...config.load_test_config, concurrent_users: parseInt(e.target.value) };
                        updateConfig({ load_test_config: newConfig });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Test Duration (min)</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.load_test_config.test_duration_minutes}
                      onChange={(e) => {
                        const newConfig = { ...config.load_test_config, test_duration_minutes: parseInt(e.target.value) };
                        updateConfig({ load_test_config: newConfig });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Ramp Up Time (min)</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.load_test_config.ramp_up_time_minutes}
                      onChange={(e) => {
                        const newConfig = { ...config.load_test_config, ramp_up_time_minutes: parseInt(e.target.value) };
                        updateConfig({ load_test_config: newConfig });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target RPS</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.load_test_config.target_rps}
                      onChange={(e) => {
                        const newConfig = { ...config.load_test_config, target_rps: parseInt(e.target.value) };
                        updateConfig({ load_test_config: newConfig });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Configuration */}
          {config.test_type === 'debug_console' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Debug Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Log Level</Label>
                  <Select 
                    value={config.debug_config.log_level} 
                    onValueChange={(value) => {
                      const newConfig = { ...config.debug_config, log_level: value };
                      updateConfig({ debug_config: newConfig });
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.debug_config.capture_requests}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.debug_config, capture_requests: checked };
                        updateConfig({ debug_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Capture Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.debug_config.capture_responses}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.debug_config, capture_responses: checked };
                        updateConfig({ debug_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Capture Responses</Label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.debug_config.capture_errors}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.debug_config, capture_errors: checked };
                        updateConfig({ debug_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Capture Errors</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.debug_config.trace_execution}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...config.debug_config, trace_execution: checked };
                        updateConfig({ debug_config: newConfig });
                      }}
                    />
                    <Label className="text-xs">Trace Execution</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Scenarios */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Test Scenarios
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addTestScenario}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.test_scenarios.map((scenario, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={scenario.name}
                      onChange={(e) => updateTestScenario(index, 'name', e.target.value)}
                      placeholder="Scenario name"
                    />
                    <Select
                      value={scenario.priority}
                      onValueChange={(value) => updateTestScenario(index, 'priority', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={scenario.enabled}
                        onCheckedChange={(checked) => updateTestScenario(index, 'enabled', checked)}
                      />
                      <Label className="text-xs">Enabled</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTestScenario(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-16 text-xs"
                    value={scenario.description}
                    onChange={(e) => updateTestScenario(index, 'description', e.target.value)}
                    placeholder="Scenario description..."
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assertions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Assertions
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addAssertion}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.assertions.map((assertion, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={assertion.type}
                      onValueChange={(value) => updateAssertion(index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assertionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-8 flex-1"
                      value={assertion.field}
                      onChange={(e) => updateAssertion(index, 'field', e.target.value)}
                      placeholder="Field path"
                    />
                    <Input
                      className="h-8 flex-1"
                      value={assertion.expected_value}
                      onChange={(e) => updateAssertion(index, 'expected_value', e.target.value)}
                      placeholder="Expected value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAssertion(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={assertion.description}
                    onChange={(e) => updateAssertion(index, 'description', e.target.value)}
                    placeholder="Assertion description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Thresholds */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Performance Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Max Response Time (ms)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.performance_thresholds.max_response_time_ms}
                    onChange={(e) => {
                      const newThresholds = { ...config.performance_thresholds, max_response_time_ms: parseInt(e.target.value) };
                      updateConfig({ performance_thresholds: newThresholds });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Min Success Rate (%)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.performance_thresholds.min_success_rate}
                    onChange={(e) => {
                      const newThresholds = { ...config.performance_thresholds, min_success_rate: parseInt(e.target.value) };
                      updateConfig({ performance_thresholds: newThresholds });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Error Rate (%)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.performance_thresholds.max_error_rate}
                    onChange={(e) => {
                      const newThresholds = { ...config.performance_thresholds, max_error_rate: parseInt(e.target.value) };
                      updateConfig({ performance_thresholds: newThresholds });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporting Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Reporting Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Generate Report</Label>
                <Switch
                  checked={config.reporting_config.generate_report}
                  onCheckedChange={(checked) => {
                    const newConfig = { ...config.reporting_config, generate_report: checked };
                    updateConfig({ reporting_config: newConfig });
                  }}
                />
              </div>

              {config.reporting_config.generate_report && (
                <>
                  <div>
                    <Label className="text-xs">Report Format</Label>
                    <Select 
                      value={config.reporting_config.report_format} 
                      onValueChange={(value) => {
                        const newConfig = { ...config.reporting_config, report_format: value };
                        updateConfig({ reporting_config: newConfig });
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.reporting_config.include_screenshots}
                        onCheckedChange={(checked) => {
                          const newConfig = { ...config.reporting_config, include_screenshots: checked };
                          updateConfig({ reporting_config: newConfig });
                        }}
                      />
                      <Label className="text-xs">Include Screenshots</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.reporting_config.include_logs}
                        onCheckedChange={(checked) => {
                          const newConfig = { ...config.reporting_config, include_logs: checked };
                          updateConfig({ reporting_config: newConfig });
                        }}
                      />
                      <Label className="text-xs">Include Logs</Label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseWorkflowNode>
  );
};