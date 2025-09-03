import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Globe, Server, Database, Mail, Calendar, Bell, Brain, BarChart, Plus, Trash2, Shield } from 'lucide-react';

interface MCPProtocolConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const MCPProtocolConfig: React.FC<MCPProtocolConfigProps> = ({
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
                <Select onValueChange={field.onChange} defaultValue={field.value || 'mcp'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mcp">🔗 MCP Memory</SelectItem>
                    <SelectItem value="session">📝 Session Memory</SelectItem>
                    <SelectItem value="persistent">💿 Persistent Memory</SelectItem>
                    <SelectItem value="shared">🤝 Shared Memory</SelectItem>
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
                    placeholder='{"type": "object", "properties": {"mcp_response": {"type": "object"}, "capabilities": {"type": "array"}, "status": {"type": "string"}}}'
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

  const renderFileSystemMCP = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-green-500" />
          File System MCP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="basePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Path *</FormLabel>
              <FormControl>
                <Input placeholder="/home/user/documents" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>File Operations</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="allowRead"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Read Files</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowWrite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Write Files</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowDelete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Delete Files</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="allowList"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>List Directory</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>File Search</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowWatch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>File Watching</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="allowedExtensions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed File Extensions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=".txt,.json,.md,.pdf,.docx"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxFileSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max File Size (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="securityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'high'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDatabaseMCP = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Database MCP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="databaseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="postgresql">🐘 PostgreSQL</SelectItem>
                  <SelectItem value="mysql">🐬 MySQL</SelectItem>
                  <SelectItem value="sqlite">📁 SQLite</SelectItem>
                  <SelectItem value="mongodb">🍃 MongoDB</SelectItem>
                  <SelectItem value="redis">🔴 Redis</SelectItem>
                  <SelectItem value="supabase">⚡ Supabase</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectionString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="postgresql://user:pass@localhost:5432/db"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Database Operations</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="allowSelect"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>SELECT</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowInsert"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>INSERT</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowUpdate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>UPDATE</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="allowDelete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>DELETE</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowSchema"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Schema Access</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowTransactions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Transactions</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="allowedTables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Tables</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="users,orders,products"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="queryTimeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query Timeout (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxConnections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Connections</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderWebSearchMCP = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-500" />
          Web Search MCP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="searchEngine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Engine *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select search engine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="google">🔍 Google Search</SelectItem>
                  <SelectItem value="bing">🔍 Bing Search</SelectItem>
                  <SelectItem value="duckduckgo">🦆 DuckDuckGo</SelectItem>
                  <SelectItem value="serp">🐍 SerpAPI</SelectItem>
                  <SelectItem value="tavily">🔎 Tavily</SelectItem>
                  <SelectItem value="custom">⚙️ Custom API</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.searchEngine !== 'duckduckgo' && (
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Your API key" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <FormLabel>Search Capabilities</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="enableWebSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Web Search</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableContentScraping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Content Scraping</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableUrlAnalysis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>URL Analysis</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="enableSiteCrawl"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Site Crawling</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableSemanticSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Semantic Search</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Results</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="searchLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'en'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="fr">🇫🇷 French</SelectItem>
                    <SelectItem value="de">🇩🇪 German</SelectItem>
                    <SelectItem value="auto">🌐 Auto-detect</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="blockedDomains"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blocked Domains</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="example.com,spam-site.com"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderEmailMCP = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-red-500" />
          Email MCP Configuration
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
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="smtp">📧 SMTP</SelectItem>
                  <SelectItem value="gmail">📬 Gmail API</SelectItem>
                  <SelectItem value="outlook">📮 Outlook API</SelectItem>
                  <SelectItem value="sendgrid">📨 SendGrid</SelectItem>
                  <SelectItem value="mailgun">🔫 Mailgun</SelectItem>
                  <SelectItem value="ses">☁️ Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.emailProvider === 'smtp' && (
          <div className="space-y-4">
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
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Your password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enableTLS"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Enable TLS</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableSSL"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Enable SSL</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <FormLabel>Email Operations</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="allowSend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Send Email</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowReceive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Receive Email</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowTemplates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Email Templates</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="allowAttachments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value !== false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Attachments</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowBulkSend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Bulk Send</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxAttachmentSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Attachment Size (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dailyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Send Limit</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'filesystem_mcp':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderFileSystemMCP()}
          </div>
        );
      case 'database_mcp':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderDatabaseMCP()}
          </div>
        );
      case 'websearch_mcp':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderWebSearchMCP()}
          </div>
        );
      case 'email_mcp':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderEmailMCP()}
          </div>
        );
      case 'calendar_mcp':
      case 'notification_mcp':
      case 'memory_mcp':
      case 'analytics_mcp':
      case 'weather_mcp':
      case 'slack_mcp':
      case 'github_mcp':
      case 'jira_mcp':
      case 'salesforce_mcp':
      case 'stripe_mcp':
      case 'shopify_mcp':
      case 'wordpress_mcp':
      case 'docker_mcp':
      case 'kubernetes_mcp':
      case 'aws_mcp':
      case 'gcp_mcp':
      case 'azure_mcp':
      case 'terraform_mcp':
      case 'jenkins_mcp':
      case 'monitoring_mcp':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderFileSystemMCP()}
            {renderDatabaseMCP()}
            {renderWebSearchMCP()}
            {renderEmailMCP()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderFileSystemMCP()}
            {renderDatabaseMCP()}
            {renderWebSearchMCP()}
            {renderEmailMCP()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};