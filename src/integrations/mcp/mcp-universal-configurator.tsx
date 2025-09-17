import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDatabaseSchema } from '@/hooks/useDatabaseSchema'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface McpUniversalConfig {
  id?: string
  name: string
  description?: string
  mcp_type: 'database' | 'api' | 'memory' | 'file' | 'hybrid'
  tables: string[]
  schema?: string
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
  }
  filters?: Record<string, any>
  api_endpoints?: Record<string, any>
  memory_config?: {
    storage_type: 'memory' | 'distributed'
    compression: boolean
    max_memory_mb: number
    ttl_seconds: number
    partitions: string[]
  }
  hybrid_config?: {
    primary_backend: string
    fallback_backends: string[]
    routing_rules: Record<string, any>
  }
  is_active: boolean
}

interface McpUniversalConfiguratorProps {
  onConfigSave?: (config: McpUniversalConfig) => void
  initialConfig?: Partial<McpUniversalConfig>
  moduleContext?: string // 'enrollment', 'patient', 'clinical', etc.
}

export const McpUniversalConfigurator: React.FC<McpUniversalConfiguratorProps> = ({
  onConfigSave,
  initialConfig,
  moduleContext = 'general'
}) => {
  const { tables, isLoading } = useDatabaseSchema()
  const [config, setConfig] = useState<McpUniversalConfig>({
    name: '',
    mcp_type: 'database',
    tables: [],
    schema: 'public',
    permissions: { read: true, write: false, delete: false },
    is_active: true,
    ...initialConfig
  })

  const [savedConfigs, setSavedConfigs] = useState<McpUniversalConfig[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>(config.tables)

  useEffect(() => {
    loadSavedConfigs()
  }, [])

  const loadSavedConfigs = async () => {
    try {
      // For now, use local storage until database types are updated
      const saved = localStorage.getItem(`mcp_configs_${moduleContext}`)
      if (saved) {
        setSavedConfigs(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load MCP configurations:', error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const configToSave = {
        ...config,
        id: config.id || crypto.randomUUID(),
        tables: selectedTables,
        module_context: moduleContext,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Save to local storage for now
      const saved = localStorage.getItem(`mcp_configs_${moduleContext}`)
      const configs = saved ? JSON.parse(saved) : []
      const updatedConfigs = [...configs.filter(c => c.id !== configToSave.id), configToSave]
      localStorage.setItem(`mcp_configs_${moduleContext}`, JSON.stringify(updatedConfigs))

      setSavedConfigs(updatedConfigs)
      onConfigSave?.(configToSave)
      toast.success('MCP configuration saved successfully')
    } catch (error) {
      console.error('Failed to save MCP configuration:', error)
      toast.error('Failed to save configuration')
    }
  }

  const handleTestConfig = async () => {
    try {
      const testPayload = {
        action: 'get_schema',
        config: {
          tables: selectedTables,
          schema: config.schema,
          permissions: config.permissions
        }
      }

      let functionName = ''
      switch (config.mcp_type) {
        case 'database':
          functionName = 'mcp-database-server'
          break
        case 'api':
          functionName = 'mcp-api-server'
          break
        case 'memory':
          functionName = 'mcp-memory-server'
          break
        default:
          throw new Error('Unsupported MCP type for testing')
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testPayload
      })

      if (error) throw error

      toast.success('MCP configuration test successful')
      console.log('Test result:', data)
    } catch (error) {
      console.error('MCP test failed:', error)
      toast.error('Configuration test failed')
    }
  }

  const getRecommendedTables = () => {
    // Integration with EXISTING agent templates (NO CHANGES to current implementation)
    const moduleTableMap = {
      // Patient enrollment - uses existing agent templates and workflows
      enrollment: [
        'enrollment_instances',
        'enrollment_consent', 
        'enrollment_patient_info',
        'enrollment_provider_info',
        'enrollment_insurance_info',
        'enrollment_clinical_info',
        'enrollment_documents',
        'agent_templates', // Existing agent templates for reuse
        'npi_verification_results', // Existing NPI verification agent
        'voice_providers' // Existing voice/SMS/WhatsApp/email agents
      ],
      // Agent module - existing functionality (NO modifications)
      agent: [
        'agents', 
        'agent_sessions', 
        'agent_conversations',
        'agent_templates', // Existing templates for NPI, credentialing, PDF, consent
        'npi_verification_results',
        'voice_providers'
      ],
      patient: ['profiles', 'patient_medical_history', 'patient_demographics'],
      clinical: ['clinical_assessments', 'treatment_plans', 'clinical_notes'],
      facility: ['facilities', 'facility_staff', 'facility_departments']
    }

    const recommendedTables = moduleTableMap[moduleContext] || []
    return tables.filter(table => 
      recommendedTables.some(recommended => 
        table.includes(recommended) || recommended.includes(table)
      )
    )
  }

  if (isLoading) {
    return <div>Loading database schema...</div>
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Universal MCP Configurator</CardTitle>
        <CardDescription>
          Configure MCP backend options for {moduleContext} module with table-agnostic settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="tables">Table Configuration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            <TabsTrigger value="saved">Saved Configs</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-4">
              <div>
                <Label htmlFor="config-name">Configuration Name</Label>
                <Input
                  id="config-name"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`${moduleContext} MCP Configuration`}
                />
              </div>

              <div>
                <Label htmlFor="config-description">Description</Label>
                <Textarea
                  id="config-description"
                  value={config.description || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this configuration's purpose..."
                />
              </div>

              <div>
                <Label htmlFor="mcp-type">MCP Backend Type</Label>
                <Select
                  value={config.mcp_type}
                  onValueChange={(value) => setConfig(prev => ({ 
                    ...prev, 
                    mcp_type: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database MCP (Real-time Supabase)</SelectItem>
                    <SelectItem value="api">API MCP (External APIs)</SelectItem>
                    <SelectItem value="memory">Memory MCP (High-speed cache)</SelectItem>
                    <SelectItem value="file">File MCP (Document storage)</SelectItem>
                    <SelectItem value="hybrid">Hybrid MCP (Multi-backend)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="read-permission"
                    checked={config.permissions.read}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, read: checked }
                      }))
                    }
                  />
                  <Label htmlFor="read-permission">Read Access</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="write-permission"
                    checked={config.permissions.write}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, write: checked }
                      }))
                    }
                  />
                  <Label htmlFor="write-permission">Write Access</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="delete-permission"
                    checked={config.permissions.delete}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, delete: checked }
                      }))
                    }
                  />
                  <Label htmlFor="delete-permission">Delete Access</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tables">
            <div className="space-y-4">
              <div>
                <Label>Recommended Tables for {moduleContext} Module</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getRecommendedTables().map(table => (
                    <Badge
                      key={table}
                      variant={selectedTables.includes(table) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table)
                            ? prev.filter(t => t !== table)
                            : [...prev, table]
                        )
                      }}
                    >
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>All Available Tables</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                  {tables.filter(table => !getRecommendedTables().includes(table)).map(table => (
                    <Badge
                      key={table}
                      variant={selectedTables.includes(table) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table)
                            ? prev.filter(t => t !== table)
                            : [...prev, table]
                        )
                      }}
                    >
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Selected Tables ({selectedTables.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTables.map(table => (
                    <Badge key={table} variant="default">
                      {table}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => setSelectedTables(prev => prev.filter(t => t !== table))}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-4">
              {config.mcp_type === 'memory' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Memory Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-memory">Max Memory (MB)</Label>
                      <Input
                        id="max-memory"
                        type="number"
                        value={config.memory_config?.max_memory_mb || 100}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          memory_config: {
                            ...prev.memory_config,
                            max_memory_mb: parseInt(e.target.value) || 100,
                            storage_type: 'memory',
                            compression: false,
                            ttl_seconds: 3600,
                            partitions: [moduleContext]
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ttl-seconds">TTL (seconds)</Label>
                      <Input
                        id="ttl-seconds"
                        type="number"
                        value={config.memory_config?.ttl_seconds || 3600}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          memory_config: {
                            ...prev.memory_config,
                            ttl_seconds: parseInt(e.target.value) || 3600,
                            storage_type: 'memory',
                            compression: false,
                            max_memory_mb: 100,
                            partitions: [moduleContext]
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.mcp_type === 'hybrid' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Hybrid Configuration</h4>
                  <div>
                    <Label htmlFor="primary-backend">Primary Backend</Label>
                    <Select
                      value={config.hybrid_config?.primary_backend || 'database'}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        hybrid_config: {
                          ...prev.hybrid_config,
                          primary_backend: value,
                          fallback_backends: ['memory', 'api'],
                          routing_rules: {}
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="memory">Memory</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="space-y-4">
              <div className="grid gap-4">
                {savedConfigs.map(savedConfig => (
                  <Card key={savedConfig.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{savedConfig.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {savedConfig.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{savedConfig.mcp_type}</Badge>
                          <Badge variant="outline">{savedConfig.tables.length} tables</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setConfig(savedConfig)
                          setSelectedTables(savedConfig.tables)
                        }}
                      >
                        Load
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleTestConfig}>
            Test Configuration
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => {
              setConfig({
                name: '',
                mcp_type: 'database',
                tables: [],
                schema: 'public',
                permissions: { read: true, write: false, delete: false },
                is_active: true
              })
              setSelectedTables([])
            }}>
              Reset
            </Button>
            <Button onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}