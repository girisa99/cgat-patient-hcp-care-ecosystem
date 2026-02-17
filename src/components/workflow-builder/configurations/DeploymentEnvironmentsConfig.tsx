import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Code, TestTube, Package, Rocket, Settings, Plus, Trash2 } from 'lucide-react';

interface DeploymentEnvironmentsConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const DeploymentEnvironmentsConfig: React.FC<DeploymentEnvironmentsConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderDevelopmentEnvironment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-500" />
          Development Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="devFramework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Development Framework *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select development framework" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="nodejs">🟢 Node.js</SelectItem>
                  <SelectItem value="python">🐍 Python</SelectItem>
                  <SelectItem value="react">⚛️ React</SelectItem>
                  <SelectItem value="nextjs">▲ Next.js</SelectItem>
                  <SelectItem value="vue">💚 Vue.js</SelectItem>
                  <SelectItem value="angular">🅰️ Angular</SelectItem>
                  <SelectItem value="dotnet">🔵 .NET</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="localPort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Development Port</FormLabel>
              <FormControl>
                <Input type="number" placeholder="3000" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="devDatabaseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Development Database URL</FormLabel>
              <FormControl>
                <Input placeholder="postgresql://localhost:5432/dev_db" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Environment Variables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Development Environment Variables</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const envVars = configuration.devEnvVariables || [];
                onChange({ 
                  ...configuration, 
                  devEnvVariables: [...envVars, { key: '', value: '' }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variable
            </Button>
          </div>
          
          {(configuration.devEnvVariables || []).map((envVar: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={envVar.key || ''}
                  onChange={(e) => {
                    const vars = [...(configuration.devEnvVariables || [])];
                    vars[index] = { ...vars[index], key: e.target.value };
                    onChange({ ...configuration, devEnvVariables: vars });
                  }}
                  placeholder="Variable name"
                />
                <Input
                  value={envVar.value || ''}
                  onChange={(e) => {
                    const vars = [...(configuration.devEnvVariables || [])];
                    vars[index] = { ...vars[index], value: e.target.value };
                    onChange({ ...configuration, devEnvVariables: vars });
                  }}
                  placeholder="Variable value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const vars = [...(configuration.devEnvVariables || [])];
                    vars.splice(index, 1);
                    onChange({ ...configuration, devEnvVariables: vars });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableHotReload"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Hot Reload</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableDebugMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Debug Mode</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableSourceMaps"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Source Maps</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderTestEnvironment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-green-500" />
          Test Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="testingFramework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testing Framework *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select testing framework" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="jest">🃏 Jest</SelectItem>
                  <SelectItem value="mocha">☕ Mocha</SelectItem>
                  <SelectItem value="cypress">🌲 Cypress</SelectItem>
                  <SelectItem value="playwright">🎭 Playwright</SelectItem>
                  <SelectItem value="vitest">⚡ Vitest</SelectItem>
                  <SelectItem value="selenium">🕷️ Selenium</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testDatabaseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Database URL</FormLabel>
              <FormControl>
                <Input placeholder="postgresql://localhost:5432/test_db" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="testCoverage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="80" min="0" max="100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testTimeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Timeout (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30000" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="testCommand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Command</FormLabel>
              <FormControl>
                <Input placeholder="npm test" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="enableE2E"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>E2E Tests</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableUnit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Unit Tests</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableIntegration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Integration</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enablePerformance"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Performance</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStagingEnvironment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          Staging Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="stagingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staging URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://staging.yourapp.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deploymentStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'rolling'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rolling">🔄 Rolling Update</SelectItem>
                  <SelectItem value="blue-green">🔵 Blue-Green</SelectItem>
                  <SelectItem value="canary">🐤 Canary</SelectItem>
                  <SelectItem value="recreate">🔄 Recreate</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stagingDatabaseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staging Database URL</FormLabel>
              <FormControl>
                <Input placeholder="postgresql://staging-db:5432/staging_db" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="instanceCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instance Count</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxInstances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Instances</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableAutoScaling"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Scaling</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableLoadBalancer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Load Balancer</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableHealthChecks"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Health Checks</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderProductionEnvironment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-red-500" />
          Production Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="productionUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Production URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://yourapp.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cdnUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CDN URL</FormLabel>
              <FormControl>
                <Input placeholder="https://cdn.yourapp.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productionDatabaseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Production Database URL</FormLabel>
              <FormControl>
                <Input placeholder="postgresql://prod-db:5432/prod_db" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="minInstances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Instances</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxInstances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Instances</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="20" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpuThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="70" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="backupSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Schedule (Cron)</FormLabel>
                <FormControl>
                  <Input placeholder="0 2 * * *" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monitoringUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monitoring URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://monitoring.yourapp.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="enableSSL"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>SSL/TLS</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableCompression"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Compression</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableCaching"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Caching</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMonitoring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Monitoring</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderUATEnvironment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          UAT Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="uatUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UAT URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://uat.yourapp.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userAcceptanceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Acceptance Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'standard'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">📊 Basic Testing</SelectItem>
                  <SelectItem value="standard">✅ Standard UAT</SelectItem>
                  <SelectItem value="comprehensive">🔍 Comprehensive</SelectItem>
                  <SelectItem value="regulatory">⚖️ Regulatory Compliance</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testDataSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Data Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test data source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="production-copy">📋 Production Copy</SelectItem>
                  <SelectItem value="synthetic">🤖 Synthetic Data</SelectItem>
                  <SelectItem value="anonymized">🎭 Anonymized Data</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Dataset</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="uatDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UAT Duration (days)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="14" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUsers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Concurrent Users</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableFeedback"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>User Feedback</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableRecording"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Session Recording</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAnalytics"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Analytics</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'dev_environment':
    case 'development_environment':
      return renderDevelopmentEnvironment();
    case 'test_environment':
      return renderTestEnvironment();
    case 'staging_environment':
      return renderStagingEnvironment();
    case 'production_environment':
      return renderProductionEnvironment();
    case 'uat_environment':
      return renderUATEnvironment();
    default:
      return renderDevelopmentEnvironment(); // Default fallback
  }
};

export default DeploymentEnvironmentsConfig;