/**
 * MCP SERVER MANAGEMENT UI
 * Phase 3B gap: CRUD interface and tool execution for MCP servers.
 * Uses existing mcp_servers table from Supabase.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Server, Plus, Pencil, Trash2, RefreshCw, Activity, CheckCircle, XCircle, Cpu, Wifi,
  Play, HeartPulse, Wrench, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMCPToolExecutor } from '@/hooks/useMCPToolExecutor';

interface MCPServer {
  id: string;
  server_id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
  is_active: boolean | null;
  capabilities: any;
  connection_config: any;
  reliability_score: number | null;
  created_at: string;
  updated_at: string;
}

const SERVER_TYPES = ['healthcare', 'database', 'filesystem', 'memory', 'api', 'hybrid', 'custom'];
const STATUS_OPTIONS = ['connected', 'disconnected', 'error', 'initializing'];

const STATUS_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  connected: { icon: CheckCircle, color: 'text-green-500' },
  disconnected: { icon: XCircle, color: 'text-muted-foreground' },
  error: { icon: XCircle, color: 'text-destructive' },
  initializing: { icon: RefreshCw, color: 'text-yellow-500' },
};

export const MCPServerManagementUI: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const { showSuccess, showError } = useMasterToast();
  const mcpExecutor = useMCPToolExecutor();

  // Tool execution state
  const [toolExecOpen, setToolExecOpen] = useState(false);
  const [toolExecServer, setToolExecServer] = useState<MCPServer | null>(null);
  const [toolExecName, setToolExecName] = useState('');
  const [toolExecArgs, setToolExecArgs] = useState('{}');
  const [toolExecResult, setToolExecResult] = useState('');
  const [discoveredTools, setDiscoveredTools] = useState<Array<{ name: string; description?: string }>>([]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    server_id: '',
    type: 'custom',
    description: '',
    status: 'disconnected',
    is_active: true,
    capabilities: '[]',
    connection_config: '{}',
  });

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setServers((data as MCPServer[]) || []);
    } catch (err: any) {
      showError(err.message || 'Failed to load MCP servers');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchServers(); }, [fetchServers]);

  const resetForm = () => {
    setForm({ name: '', server_id: '', type: 'custom', description: '', status: 'disconnected', is_active: true, capabilities: '[]', connection_config: '{}' });
    setEditingServer(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (server: MCPServer) => {
    setEditingServer(server);
    setForm({
      name: server.name,
      server_id: server.server_id,
      type: server.type,
      description: server.description || '',
      status: server.status,
      is_active: server.is_active ?? true,
      capabilities: JSON.stringify(server.capabilities || [], null, 2),
      connection_config: JSON.stringify(server.connection_config || {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      let caps: any, config: any;
      try { caps = JSON.parse(form.capabilities); } catch { throw new Error('Invalid capabilities JSON'); }
      try { config = JSON.parse(form.connection_config); } catch { throw new Error('Invalid connection_config JSON'); }

      const payload = {
        name: form.name,
        server_id: form.server_id,
        type: form.type,
        description: form.description || null,
        status: form.status,
        is_active: form.is_active,
        capabilities: caps,
        connection_config: config,
      };

      if (editingServer) {
        const { error } = await supabase.from('mcp_servers').update(payload).eq('id', editingServer.id);
        if (error) throw error;
        showSuccess('MCP server updated');
      } else {
        const { error } = await supabase.from('mcp_servers').insert(payload);
        if (error) throw error;
        showSuccess('MCP server created');
      }

      setDialogOpen(false);
      resetForm();
      fetchServers();
    } catch (err: any) {
      showError(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('mcp_servers').delete().eq('id', id);
      if (error) throw error;
      showSuccess('MCP server deleted');
      fetchServers();
    } catch (err: any) {
      showError(err.message || 'Delete failed');
    }
  };

  const toggleActive = async (server: MCPServer) => {
    try {
      const { error } = await supabase
        .from('mcp_servers')
        .update({ is_active: !server.is_active, status: !server.is_active ? 'connected' : 'disconnected' })
        .eq('id', server.id);
      if (error) throw error;
      fetchServers();
    } catch (err: any) {
      showError(err.message || 'Toggle failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          MCP Server Management
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchServers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingServer ? 'Edit MCP Server' : 'Add MCP Server'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Server" />
                  </div>
                  <div>
                    <Label>Server ID</Label>
                    <Input value={form.server_id} onChange={e => setForm(f => ({ ...f, server_id: e.target.value }))} placeholder="my-server-01" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SERVER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                  <Label>Active</Label>
                </div>
                <div>
                  <Label>Capabilities (JSON)</Label>
                  <Textarea value={form.capabilities} onChange={e => setForm(f => ({ ...f, capabilities: e.target.value }))} rows={3} className="font-mono text-xs" />
                </div>
                <div>
                  <Label>Connection Config (JSON)</Label>
                  <Textarea value={form.connection_config} onChange={e => setForm(f => ({ ...f, connection_config: e.target.value }))} rows={3} className="font-mono text-xs" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.name || !form.server_id}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <Cpu className="h-4 w-4 mx-auto mb-1 text-primary" />
          <div className="text-xl font-bold">{servers.length}</div>
          <div className="text-xs text-muted-foreground">Total Servers</div>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <div className="text-xl font-bold">{servers.filter(s => s.status === 'connected').length}</div>
          <div className="text-xs text-muted-foreground">Connected</div>
        </Card>
        <Card className="p-3 text-center">
          <Wifi className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-xl font-bold">{servers.filter(s => s.is_active).length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
        <Card className="p-3 text-center">
          <Activity className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
          <div className="text-xl font-bold">{servers.filter(s => s.reliability_score && s.reliability_score > 0.9).length}</div>
          <div className="text-xs text-muted-foreground">High Reliability</div>
        </Card>
      </div>

      {/* Server List */}
      <div className="space-y-2">
        {servers.length === 0 ? (
          <Card>
            <CardContent className="text-center text-muted-foreground py-8">
              {loading ? 'Loading MCP servers...' : 'No MCP servers configured. Click "Add Server" to get started.'}
            </CardContent>
          </Card>
        ) : (
          servers.map((server) => {
            const statusCfg = STATUS_ICONS[server.status] || STATUS_ICONS.disconnected;
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={server.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <StatusIcon className={`h-5 w-5 ${statusCfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{server.name}</span>
                      <Badge variant="outline" className="text-[10px]">{server.type}</Badge>
                      <Badge variant={server.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {server.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {server.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{server.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ID: <span className="font-mono">{server.server_id}</span>
                      {server.reliability_score != null && (
                        <span className="ml-2">• Reliability: {(server.reliability_score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Health Check" onClick={async () => {
                      try {
                        const result = await mcpExecutor.healthCheck(server.server_id);
                        if (result.status === 'healthy') {
                          showSuccess(`${server.name} is healthy (${result.latency_ms}ms)`);
                        } else {
                          showError(`${server.name} is unhealthy: ${result.error}`);
                        }
                        fetchServers();
                      } catch {}
                    }}>
                      <HeartPulse className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Execute Tool" onClick={() => {
                      setToolExecServer(server);
                      setToolExecOpen(true);
                    }}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Switch checked={server.is_active ?? false} onCheckedChange={() => toggleActive(server)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(server)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(server.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Tool Execution Dialog */}
      <Dialog open={toolExecOpen} onOpenChange={setToolExecOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Execute Tool — {toolExecServer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Discover Tools */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={async () => {
                if (!toolExecServer) return;
                try {
                  const tools = await mcpExecutor.listTools(toolExecServer.server_id);
                  setDiscoveredTools(tools);
                } catch {}
              }} disabled={mcpExecutor.loading}>
                <RefreshCw className={`h-3 w-3 mr-1 ${mcpExecutor.loading ? 'animate-spin' : ''}`} />
                Discover Tools
              </Button>
              {discoveredTools.length > 0 && (
                <Badge variant="secondary">{discoveredTools.length} tools found</Badge>
              )}
            </div>

            {/* Tool Selection */}
            {discoveredTools.length > 0 && (
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {discoveredTools.map((tool) => (
                    <button
                      key={tool.name}
                      className={`w-full text-left p-2 rounded border text-sm flex items-center gap-2 hover:bg-muted/50 ${
                        toolExecName === tool.name ? 'ring-1 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setToolExecName(tool.name)}
                    >
                      <ChevronRight className="h-3 w-3" />
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        {tool.description && <div className="text-xs text-muted-foreground">{tool.description}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Manual Tool Name */}
            <div>
              <Label>Tool Name</Label>
              <Input
                value={toolExecName}
                onChange={e => setToolExecName(e.target.value)}
                placeholder="e.g. lookup_patient"
              />
            </div>
            <div>
              <Label>Arguments (JSON)</Label>
              <Textarea
                value={toolExecArgs}
                onChange={e => setToolExecArgs(e.target.value)}
                placeholder='{"patient_id": "123"}'
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            {/* Execute */}
            <Button
              className="w-full"
              disabled={!toolExecName || mcpExecutor.loading}
              onClick={async () => {
                if (!toolExecServer || !toolExecName) return;
                try {
                  let args = {};
                  if (toolExecArgs.trim()) args = JSON.parse(toolExecArgs);
                  const result = await mcpExecutor.executeTool(toolExecServer.server_id, toolExecName, args);
                  setToolExecResult(JSON.stringify(result, null, 2));
                  showSuccess(`Tool "${toolExecName}" executed successfully`);
                } catch (err: any) {
                  setToolExecResult(`Error: ${err.message}`);
                }
              }}
            >
              <Play className="h-4 w-4 mr-1" />
              {mcpExecutor.loading ? 'Executing...' : 'Execute Tool'}
            </Button>

            {/* Result */}
            {toolExecResult && (
              <div>
                <Label>Result</Label>
                <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                  {toolExecResult}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MCPServerManagementUI;
