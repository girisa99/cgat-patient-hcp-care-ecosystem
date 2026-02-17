import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

/**
 * MCP TOOL EXECUTOR — Production Edge Function Proxy
 * 
 * Bridges frontend tool invocations to real external MCP-compatible servers.
 * Reads server configs (URL, auth) from `mcp_servers` table, 
 * then proxies tool calls via Streamable HTTP or JSON-RPC.
 * 
 * Actions:
 *   listTools     — Discover tools from an external MCP server
 *   executeTool   — Execute a tool on an external MCP server
 *   healthCheck   — Ping an MCP server to verify connectivity
 *   listResources — List resources exposed by an MCP server
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Action = "listTools" | "executeTool" | "healthCheck" | "listResources";

interface RequestBody {
  action: Action;
  serverId: string;          // mcp_servers.server_id
  toolName?: string;         // for executeTool
  toolArgs?: Record<string, unknown>; // for executeTool
  resourceUri?: string;      // for listResources
}

interface MCPServerRow {
  id: string;
  server_id: string;
  name: string;
  type: string;
  status: string;
  is_active: boolean;
  capabilities: unknown;
  connection_config: {
    base_url?: string;
    auth_type?: "bearer" | "api_key" | "none";
    auth_header?: string;
    auth_secret_name?: string;
    transport?: "streamable-http" | "json-rpc" | "sse";
    timeout_ms?: number;
    custom_headers?: Record<string, string>;
  } | null;
}

// ── JSON-RPC helpers ─────────────────────────────────────────

let jsonRpcId = 1;

function buildJsonRpcRequest(method: string, params?: Record<string, unknown>) {
  return {
    jsonrpc: "2.0",
    id: jsonRpcId++,
    method,
    params: params || {},
  };
}

async function sendMcpRequest(
  baseUrl: string,
  method: string,
  params: Record<string, unknown>,
  headers: Record<string, string>,
  timeoutMs: number
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(buildJsonRpcRequest(method, params)),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MCP server returned ${response.status}: ${text}`);
    }

    const result = await response.json();

    // Handle JSON-RPC error
    if (result.error) {
      throw new Error(`MCP RPC error ${result.error.code}: ${result.error.message}`);
    }

    return result.result;
  } finally {
    clearTimeout(timer);
  }
}

// ── Main handler ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { action, serverId, toolName, toolArgs, resourceUri } = body;

    if (!action || !serverId) {
      throw new Error("action and serverId are required");
    }

    // Load server config from DB
    const { data: serverRow, error: dbError } = await supabase
      .from("mcp_servers")
      .select("*")
      .eq("server_id", serverId)
      .eq("is_active", true)
      .single();

    if (dbError || !serverRow) {
      throw new Error(`MCP server '${serverId}' not found or inactive`);
    }

    const server = serverRow as MCPServerRow;
    const connConfig = server.connection_config || {};
    const baseUrl = connConfig.base_url;

    if (!baseUrl) {
      throw new Error(
        `MCP server '${serverId}' has no base_url configured. Update connection_config in the MCP Server Management UI.`
      );
    }

    // Build auth headers
    const authHeaders: Record<string, string> = {};
    if (connConfig.auth_type === "bearer" && connConfig.auth_secret_name) {
      const secret = Deno.env.get(connConfig.auth_secret_name);
      if (secret) {
        authHeaders["Authorization"] = `Bearer ${secret}`;
      }
    } else if (connConfig.auth_type === "api_key" && connConfig.auth_secret_name) {
      const secret = Deno.env.get(connConfig.auth_secret_name);
      const headerName = connConfig.auth_header || "X-API-Key";
      if (secret) {
        authHeaders[headerName] = secret;
      }
    }

    // Merge custom headers
    if (connConfig.custom_headers) {
      Object.assign(authHeaders, connConfig.custom_headers);
    }

    const timeoutMs = connConfig.timeout_ms || 30_000;

    console.log(`[MCP Proxy] Action: ${action}, Server: ${serverId} (${baseUrl})`);

    let data: unknown;

    switch (action) {
      // ─ List tools ─────────────────
      case "listTools": {
        data = await sendMcpRequest(baseUrl, "tools/list", {}, authHeaders, timeoutMs);
        break;
      }

      // ─ Execute tool ───────────────
      case "executeTool": {
        if (!toolName) throw new Error("toolName is required for executeTool");
        data = await sendMcpRequest(
          baseUrl,
          "tools/call",
          { name: toolName, arguments: toolArgs || {} },
          authHeaders,
          timeoutMs
        );

        // Update reliability score based on success
        await supabase
          .from("mcp_servers")
          .update({
            status: "connected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", server.id);

        break;
      }

      // ─ Health check ───────────────
      case "healthCheck": {
        const start = Date.now();
        try {
          // Try to list tools as a health probe
          await sendMcpRequest(baseUrl, "tools/list", {}, authHeaders, Math.min(timeoutMs, 10_000));
          const latency = Date.now() - start;

          // Update server status
          await supabase
            .from("mcp_servers")
            .update({
              status: "connected",
              updated_at: new Date().toISOString(),
            })
            .eq("id", server.id);

          data = {
            status: "healthy",
            latency_ms: latency,
            server_id: serverId,
            base_url: baseUrl,
          };
        } catch (healthErr) {
          const latency = Date.now() - start;

          await supabase
            .from("mcp_servers")
            .update({
              status: "error",
              updated_at: new Date().toISOString(),
            })
            .eq("id", server.id);

          data = {
            status: "unhealthy",
            latency_ms: latency,
            error: (healthErr as Error).message,
            server_id: serverId,
            base_url: baseUrl,
          };
        }
        break;
      }

      // ─ List resources ─────────────
      case "listResources": {
        const params: Record<string, unknown> = {};
        if (resourceUri) params.uri = resourceUri;
        data = await sendMcpRequest(baseUrl, "resources/list", params, authHeaders, timeoutMs);
        break;
      }

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MCP Proxy] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
