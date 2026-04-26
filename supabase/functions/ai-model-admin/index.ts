/**
 * AI MODEL ADMIN — Edge function for managing the AI model registry
 *
 * Provides admin API for zero-deploy model management:
 *   POST /register     — Register a new model
 *   POST /deprecate    — Mark model deprecated + set replacement
 *   POST /retire       — Retire a model (follow alias chain)
 *   POST /route        — Update regional routing
 *   GET  /health       — Show all models with status + sunset warnings
 *   POST /invalidate   — Force all edge functions to reload cache
 *
 * Auth: Requires service_role key (admin only)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { invalidateModelCache, getAllModels, getSunsetWarnings } from '../_shared/dynamic-model-resolver.ts';

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || (req.method === 'GET' ? 'health' : '');
    const body = req.method === 'POST' ? await req.json() : {};

    switch (action) {
      // ── REGISTER NEW MODEL ──────────────────────────────────────────
      case 'register': {
        const { model_id, display_name, provider, capabilities, model_alias, quality_tier, speed_tier, api_endpoint, meta } = body;
        if (!model_id || !display_name || !provider) {
          return json(corsHeaders, 400, { error: 'model_id, display_name, and provider are required' });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase.from('ai_model_registry').insert({
          model_id,
          display_name,
          provider,
          capabilities: capabilities ?? [],
          model_alias: model_alias ?? [],
          quality_tier: quality_tier ?? 'standard',
          speed_tier: speed_tier ?? 'medium',
          api_endpoint: api_endpoint ?? null,
          status: 'active',
          meta: meta ?? {},
        }).select().single();

        if (error) return json(corsHeaders, 400, { error: error.message });

        invalidateModelCache();
        return json(corsHeaders, 201, { message: `Model ${model_id} registered`, model: data });
      }

      // ── DEPRECATE MODEL ─────────────────────────────────────────────
      case 'deprecate': {
        const { model_id, replaced_by, sunset_date } = body;
        if (!model_id || !replaced_by) {
          return json(corsHeaders, 400, { error: 'model_id and replaced_by are required' });
        }

        const supabase = getSupabase();

        // 1. Mark old model as deprecated
        const { error: updateError } = await supabase.from('ai_model_registry')
          .update({
            status: 'deprecated',
            replaced_by,
            sunset_date: sunset_date ?? null,
          })
          .eq('model_id', model_id);

        if (updateError) return json(corsHeaders, 400, { error: updateError.message });

        // 2. Add old model_id to new model's alias array
        const { data: newModel } = await supabase.from('ai_model_registry')
          .select('model_alias')
          .eq('model_id', replaced_by)
          .single();

        if (newModel) {
          const aliases = new Set([...(newModel.model_alias ?? []), model_id]);
          await supabase.from('ai_model_registry')
            .update({ model_alias: [...aliases] })
            .eq('model_id', replaced_by);
        }

        invalidateModelCache();
        return json(corsHeaders, 200, {
          message: `${model_id} deprecated → ${replaced_by}`,
          alias_added: true,
        });
      }

      // ── RETIRE MODEL ────────────────────────────────────────────────
      case 'retire': {
        const { model_id } = body;
        if (!model_id) return json(corsHeaders, 400, { error: 'model_id is required' });

        const supabase = getSupabase();
        const { error } = await supabase.from('ai_model_registry')
          .update({ status: 'retired' })
          .eq('model_id', model_id);

        if (error) return json(corsHeaders, 400, { error: error.message });

        invalidateModelCache();
        return json(corsHeaders, 200, { message: `${model_id} retired` });
      }

      // ── UPDATE REGIONAL ROUTING ─────────────────────────────────────
      case 'route': {
        const { region, capability, primary_model_id, fallback_model_ids, sub_region, language_code, reason } = body;
        if (!region || !capability || !primary_model_id) {
          return json(corsHeaders, 400, { error: 'region, capability, and primary_model_id are required' });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase.from('ai_model_regional_routing').upsert({
          region,
          capability,
          primary_model_id,
          fallback_model_ids: fallback_model_ids ?? [],
          sub_region: sub_region ?? null,
          language_code: language_code ?? null,
          reason: reason ?? null,
          is_active: true,
        }, {
          onConflict: 'region,COALESCE(sub_region,\'\'),COALESCE(language_code,\'\'),capability',
        }).select().single();

        if (error) return json(corsHeaders, 400, { error: error.message });

        invalidateModelCache();
        return json(corsHeaders, 200, { message: `Route updated: ${region}/${capability} → ${primary_model_id}`, route: data });
      }

      // ── HEALTH CHECK ────────────────────────────────────────────────
      case 'health': {
        const allModels = await getAllModels();
        const warnings = await getSunsetWarnings(30);

        const byStatus: Record<string, number> = {};
        const byProvider: Record<string, number> = {};
        for (const m of allModels) {
          byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
          byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
        }

        const retired = allModels.filter(m => m.status === 'retired' || m.status === 'sunset');
        const noReplacement = retired.filter(m => !m.replaced_by);

        return json(corsHeaders, 200, {
          total_models: allModels.length,
          by_status: byStatus,
          by_provider: byProvider,
          sunset_warnings: warnings.map(w => ({
            model_id: w.model_id,
            provider: w.provider,
            sunset_date: w.sunset_date,
            replaced_by: w.replaced_by,
          })),
          retired_without_replacement: noReplacement.map(m => ({
            model_id: m.model_id,
            provider: m.provider,
          })),
        });
      }

      // ── INVALIDATE CACHE ────────────────────────────────────────────
      case 'invalidate': {
        invalidateModelCache();
        return json(corsHeaders, 200, { message: 'Cache invalidated, next request will reload from DB' });
      }

      default:
        return json(corsHeaders, 400, {
          error: `Unknown action: ${action}`,
          available_actions: ['register', 'deprecate', 'retire', 'route', 'health', 'invalidate'],
        });
    }
  } catch (err) {
    console.error('[ai-model-admin] Error:', err);
    return json(getCorsHeaders(req), 500, { error: (err as Error)?.message ?? 'Internal error' });
  }
});

function json(headers: Record<string, string>, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
