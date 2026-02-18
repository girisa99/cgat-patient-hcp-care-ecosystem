/**
 * MCP-Agent Action Binding Panel
 * Allows users to bind agent_actions to MCP server tools via the mcp_server_id column.
 * Discover tools from registered MCP servers and assign them to agent actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Link2, Unlink, Server, Wrench, RefreshCw, CheckCircle,
  AlertCircle, Search, Zap, ChevronRight, Settings,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMCPToolExecutor, type MCPTool } from '@/hooks/useMCPToolExecutor';

interface AgentAction {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  mcp_server_id: string | null;
  parameters: any;
  is_enabled: boolean | null;
  agent_id: string | null;
}

interface MCPServer {
  id: string;
  server_id: string;
  name: string;
  type: string;
  status: string;
  is_active: boolean | null;
}

interface MCPActionBindingPanelProps {
  agentId?: string;
}

export const MCPActionBindingPanel: React.FC<MCPActionBindingPanelProps> = ({ agentId }) => {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [bindDialogOpen, setBindDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [selectedToolName, setSelectedToolName] = useState('');
  const [discoveredTools, setDiscoveredTools] = useState<MCPTool[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [toolConfig, setToolConfig] = useState('{}');
  const { showSuccess, showError } = useMasterToast();
  const mcpExecutor = useMCPToolExecutor();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch actions and servers in parallel
      const [actionsRes, serversRes] = await Promise.all([
        agentId
          ? supabase.from('agent_actions').select('*').eq('agent_id', agentId).order('name')
          : supabase.from('agent_actions').select('*').order('name').limit(100),
        supabase.from('mcp_servers').select('id, server_id, name, type, status, is_active').order('name'),
      ]);

      if (actionsRes.error) throw actionsRes.error;
      if (serversRes.error) throw serversRes.error;

      setActions((actionsRes.data as AgentAction[]) || []);
      setServers((serversRes.data as MCPServer[]) || []);
    } catch (err: any) {
      showError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [agentId, showError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openBindDialog = (action: AgentAction) => {
    setSelectedAction(action);
    setSelectedServerId(action.mcp_server_id || '');
    setSelectedToolName(action.parameters?.mcp_tool_name || '');
    setToolConfig(JSON.stringify(action.parameters?.mcp_tool_config || {}, null, 2));
    setDiscoveredTools([]);
    setToolSearch('');
    setBindDialogOpen(true);
  };

  const discoverTools = async () => {
    if (!selectedServerId) return;
    const server = servers.find(s => s.id === selectedServerId);
    if (!server) return;
    try {
      const tools = await mcpExecutor.listTools(server.server_id);
      setDiscoveredTools(tools);
    } catch {}
  };

  const handleBind = async () => {
    if (!selectedAction) return;
    try {
      let toolCfg: any;
      try { toolCfg = JSON.parse(toolConfig); } catch { throw new Error('Invalid tool config JSON'); }

      const updates: any = {
        mcp_server_id: selectedServerId || null,
        parameters: {
          ...(selectedAction.parameters || {}),
          mcp_tool_name: selectedToolName || undefined,
          mcp_tool_config: toolCfg,
        },
      };

      const { error } = await supabase
        .from('agent_actions')
        .update(updates)
        .eq('id', selectedAction.id);

      if (error) throw error;
      showSuccess(`Action "${selectedAction.name}" bound to MCP server`);
      setBindDialogOpen(false);
      fetchData();
    } catch (err: any) {
      showError(err.message || 'Binding failed');
    }
  };

  const handleUnbind = async (action: AgentAction) => {
    try {
      const params = { ...(action.parameters || {}) };
      delete params.mcp_tool_name;
      delete params.mcp_tool_config;

      const { error } = await supabase
        .from('agent_actions')
        .update({ mcp_server_id: null, parameters: params })
        .eq('id', action.id);

      if (error) throw error;
      showSuccess(`Action "${action.name}" unbound from MCP`);
      fetchData();
    } catch (err: any) {
      showError(err.message || 'Unbind failed');
    }
  };

  const getServerName = (serverId: string | null) => {
    if (!serverId) return null;
    return servers.find(s => s.id === serverId)?.name || serverId;
  };

  const boundActions = actions.filter(a => a.mcp_server_id);
  const unboundActions = actions.filter(a => !a.mcp_server_id);
  const filteredTools = discoveredTools.filter(t =>
    !toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase())
    || t.description?.toLowerCase().includes(toolSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            MCP-Action Bindings
          </h2>
          <p className="text-sm text-muted-foreground">
            Bind agent actions to MCP server tools for real execution
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
          <div className="text-xl font-bold">{actions.length}</div>
          <div className="text-xs text-muted-foreground">Total Actions</div>
        </Card>
        <Card className="p-3 text-center">
          <Link2 className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <div className="text-xl font-bold">{boundActions.length}</div>
          <div className="text-xs text-muted-foreground">MCP-Bound</div>
        </Card>
        <Card className="p-3 text-center">
          <Unlink className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-xl font-bold">{unboundActions.length}</div>
          <div className="text-xs text-muted-foreground">Unbound</div>
        </Card>
      </div>

      {/* Bound Actions */}
      {boundActions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Bound Actions ({boundActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {boundActions.map(action => (
              <div key={action.id} className="flex items-center justify-between p-2 rounded border bg-accent/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{action.name}</span>
                    <Badge variant="outline" className="text-[10px]">{action.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Server className="h-3 w-3" />
                    <span>{getServerName(action.mcp_server_id)}</span>
                    {action.parameters?.mcp_tool_name && (
                      <>
                        <ChevronRight className="h-3 w-3" />
                        <Wrench className="h-3 w-3" />
                        <span className="font-mono">{action.parameters.mcp_tool_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openBindDialog(action)}>
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleUnbind(action)}>
                    <Unlink className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Unbound Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Unbound Actions ({unboundActions.length})
          </CardTitle>
          <CardDescription className="text-xs">Click "Bind" to connect an action to an MCP server tool</CardDescription>
        </CardHeader>
        <CardContent>
          {unboundActions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {actions.length === 0 ? 'No agent actions found.' : 'All actions are bound!'}
            </p>
          ) : (
            <div className="space-y-2">
              {unboundActions.map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{action.name}</span>
                      <Badge variant="outline" className="text-[10px]">{action.type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{action.category}</Badge>
                    </div>
                    {action.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{action.description}</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openBindDialog(action)}>
                    <Link2 className="h-3 w-3 mr-1" />
                    Bind
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bind Dialog */}
      <Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Bind "{selectedAction?.name}" to MCP Tool
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Server Selection */}
            <div>
              <Label>MCP Server</Label>
              <Select value={selectedServerId} onValueChange={(v) => {
                setSelectedServerId(v);
                setDiscoveredTools([]);
                setSelectedToolName('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MCP server..." />
                </SelectTrigger>
                <SelectContent>
                  {servers.filter(s => s.is_active).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <Server className="h-3 w-3" />
                        {s.name}
                        <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Discover Tools */}
            {selectedServerId && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={discoverTools} disabled={mcpExecutor.loading}>
                    <RefreshCw className={`h-3 w-3 mr-1 ${mcpExecutor.loading ? 'animate-spin' : ''}`} />
                    Discover Tools
                  </Button>
                  {discoveredTools.length > 0 && (
                    <Badge variant="secondary">{discoveredTools.length} tools</Badge>
                  )}
                </div>

                {discoveredTools.length > 0 && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                      <Input
                        value={toolSearch}
                        onChange={e => setToolSearch(e.target.value)}
                        placeholder="Filter tools..."
                        className="pl-7 h-8 text-sm"
                      />
                    </div>
                    <ScrollArea className="max-h-40">
                      <div className="space-y-1">
                        {filteredTools.map(tool => (
                          <button
                            key={tool.name}
                            className={`w-full text-left p-2 rounded border text-sm flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                              selectedToolName === tool.name ? 'ring-1 ring-primary bg-primary/5' : ''
                            }`}
                            onClick={() => setSelectedToolName(tool.name)}
                          >
                            <Wrench className="h-3 w-3 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium font-mono text-xs">{tool.name}</div>
                              {tool.description && (
                                <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            )}

            <Separator />

            {/* Manual tool name */}
            <div>
              <Label>Tool Name</Label>
              <Input
                value={selectedToolName}
                onChange={e => setSelectedToolName(e.target.value)}
                placeholder="e.g. lookup_patient"
                className="font-mono text-sm"
              />
            </div>

            {/* Tool config */}
            <div>
              <Label>Tool Configuration (JSON)</Label>
              <Textarea
                value={toolConfig}
                onChange={e => setToolConfig(e.target.value)}
                placeholder='{"default_params": {}}'
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBind} disabled={!selectedServerId}>
              <Link2 className="h-4 w-4 mr-1" />
              Bind Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
