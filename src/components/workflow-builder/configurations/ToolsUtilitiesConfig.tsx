import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calculator, Mail, Globe, FileText, Code, Plus, Trash2, Zap } from 'lucide-react';

interface ToolsUtilitiesConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const ToolsUtilitiesConfig: React.FC<ToolsUtilitiesConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderCalculatorTool = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-500" />
          Calculator Tool Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="calculationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calculator Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculator type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">🔢 Basic Math</SelectItem>
                  <SelectItem value="scientific">🧮 Scientific</SelectItem>
                  <SelectItem value="financial">💰 Financial</SelectItem>
                  <SelectItem value="statistical">📊 Statistical</SelectItem>
                  <SelectItem value="unit-converter">📏 Unit Converter</SelectItem>
                  <SelectItem value="date-calculator">📅 Date Calculator</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="precision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decimal Precision</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2" min="0" max="15" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allowNegative"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow Negative Values</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validateInput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Validate Input</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.calculationType === 'unit-converter' && (
          <div className="space-y-4">
            <FormLabel>Unit Categories</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {['Length', 'Weight', 'Temperature', 'Area', 'Volume', 'Speed', 'Energy', 'Power', 'Pressure'].map((unit) => (
                <div key={unit} className="flex items-center space-x-2">
                  <Switch
                    checked={configuration.unitCategories?.[unit] !== false}
                    onCheckedChange={(checked) => {
                      const categories = { ...configuration.unitCategories };
                      categories[unit] = checked;
                      onChange({ ...configuration, unitCategories: categories });
                    }}
                  />
                  <span className="text-sm">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmailTool = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-green-500" />
          Email Tool Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="emailProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sendgrid">📧 SendGrid</SelectItem>
                  <SelectItem value="ses">📮 Amazon SES</SelectItem>
                  <SelectItem value="mailgun">🎯 Mailgun</SelectItem>
                  <SelectItem value="smtp">📤 SMTP</SelectItem>
                  <SelectItem value="outlook">🏢 Outlook/Office365</SelectItem>
                  <SelectItem value="gmail">📬 Gmail API</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter API key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {configuration.emailProvider === 'smtp' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smtpHost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host *</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.gmail.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Port *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="587" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smtpUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your-email@domain.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smtpPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="defaultFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default From Address</FormLabel>
              <FormControl>
                <Input placeholder="noreply@yourcompany.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultFromName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default From Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableTracking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Email Tracking</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableHtml"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>HTML Emails</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAttachments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Attachments</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Template Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Email Templates</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const templates = configuration.templates || [];
                onChange({ 
                  ...configuration, 
                  templates: [...templates, { name: '', subject: '', body: '', type: 'html' }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Template
            </Button>
          </div>
          
          {(configuration.templates || []).map((template: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={template.name || ''}
                  onChange={(e) => {
                    const templates = [...(configuration.templates || [])];
                    templates[index] = { ...templates[index], name: e.target.value };
                    onChange({ ...configuration, templates });
                  }}
                  placeholder="Template name"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const templates = [...(configuration.templates || [])];
                    templates.splice(index, 1);
                    onChange({ ...configuration, templates });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={template.subject || ''}
                onChange={(e) => {
                  const templates = [...(configuration.templates || [])];
                  templates[index] = { ...templates[index], subject: e.target.value };
                  onChange({ ...configuration, templates });
                }}
                placeholder="Email subject"
              />
              <Textarea
                value={template.body || ''}
                onChange={(e) => {
                  const templates = [...(configuration.templates || [])];
                  templates[index] = { ...templates[index], body: e.target.value };
                  onChange({ ...configuration, templates });
                }}
                placeholder="Email body template"
                rows={3}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderWebScrapingTool = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-500" />
          Web Scraping Tool Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="scrapingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scraping Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scraping method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="requests">🌐 HTTP Requests</SelectItem>
                  <SelectItem value="selenium">🤖 Selenium (Browser)</SelectItem>
                  <SelectItem value="playwright">🎭 Playwright</SelectItem>
                  <SelectItem value="beautifulsoup">🍲 Beautiful Soup</SelectItem>
                  <SelectItem value="scrapy">🕷️ Scrapy</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cssSelectors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSS Selectors</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter CSS selectors, one per line"
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
            name="respectRobots"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Respect robots.txt</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableJavaScript"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable JavaScript</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requestDelay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Delay (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxRetries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Retries</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="userAgent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom User Agent</FormLabel>
              <FormControl>
                <Input placeholder="Mozilla/5.0..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderCodeExecutionTool = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-500" />
          Code Execution Tool Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programming Language *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="python">🐍 Python</SelectItem>
                  <SelectItem value="javascript">🟨 JavaScript</SelectItem>
                  <SelectItem value="typescript">🔷 TypeScript</SelectItem>
                  <SelectItem value="java">☕ Java</SelectItem>
                  <SelectItem value="csharp">🟦 C#</SelectItem>
                  <SelectItem value="go">🐹 Go</SelectItem>
                  <SelectItem value="rust">🦀 Rust</SelectItem>
                  <SelectItem value="bash">💻 Bash</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="executionEnvironment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Execution Environment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'sandbox'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sandbox">🔒 Sandboxed</SelectItem>
                  <SelectItem value="container">📦 Container</SelectItem>
                  <SelectItem value="vm">💻 Virtual Machine</SelectItem>
                  <SelectItem value="local">⚠️ Local (Unsafe)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="timeoutSeconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memoryLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Limit (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="512" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpuLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Limit (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allowNetworkAccess"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow Network Access</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowFileSystem"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow File System</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="allowedImports"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Imports/Libraries</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter allowed imports, one per line"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderGenericTool = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="toolName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter tool name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toolDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this tool does..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toolConfiguration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Configuration</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter tool-specific configuration..."
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
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Tool Enabled</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresAuth"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Requires Authentication</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'calculator':
    case 'math_tool':
      return renderCalculatorTool();
    case 'email_tool':
    case 'send_email':
      return renderEmailTool();
    case 'web_scraper':
    case 'scraping_tool':
      return renderWebScrapingTool();
    case 'code_executor':
    case 'python_executor':
      return renderCodeExecutionTool();
    default:
      return renderGenericTool();
  }
};