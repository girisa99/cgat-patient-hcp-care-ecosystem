/**
 * fetch-rld-label
 *
 * Looks up the Reference Listed Drug (RLD) label from FDA's openFDA Drug Label API
 * with DailyMed (NLM) as a fallback. Returns sections in the same shape the
 * DrugLabelRLDTab uses so they can be merged into the RLD side of the comparison.
 *
 * No API key required for either source.
 *
 * Request body: { brand_name?, generic_name?, ndc?, application_number?, setid? }
 * Response: { source, identifier, fields: [{ key, label, value, evidence }], raw? }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Keys we never want to surface as label sections (metadata/IDs handled separately)
const OPENFDA_SKIP_KEYS = new Set<string>([
  "openfda", "id", "set_id", "version", "effective_time", "spl_id",
  "spl_set_id", "spl_product_data_elements", "package_label_principal_display_panel",
]);

// Best-effort human label from a snake_case key
const humanizeKey = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function buildOpenFdaSearch(input: {
  brand_name?: string;
  generic_name?: string;
  ndc?: string;
  application_number?: string;
}): string | null {
  const clauses: string[] = [];
  if (input.application_number) clauses.push(`openfda.application_number:"${input.application_number}"`);
  if (input.ndc) clauses.push(`openfda.product_ndc:"${input.ndc}"`);
  if (input.brand_name) clauses.push(`openfda.brand_name:"${input.brand_name.replace(/"/g, '')}"`);
  if (input.generic_name) clauses.push(`openfda.generic_name:"${input.generic_name.replace(/"/g, '')}"`);
  if (clauses.length === 0) return null;
  return clauses.join("+OR+");
}

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);

const decodeXmlEntities = (value: string) => value
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'");

const stripXmlTags = (value: string) => cleanText(decodeXmlEntities(value.replace(/<[^>]+>/g, " ")));

const firstTagText = (xml: string, tagName: string): string => {
  const match = xml.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? stripXmlTags(match[1]) : "";
};

const firstTagAttr = (xml: string, tagName: string, attr: string): string => {
  const match = xml.match(new RegExp(`<${tagName}\\b[^>]*\\s${attr}="([^"]+)"`, "i"));
  return match?.[1] || "";
};

async function fetchOpenFda(input: any) {
  const search = buildOpenFdaSearch(input);
  if (!search) return null;
  const url = `https://api.fda.gov/drug/label.json?search=${search}&limit=1`;
  console.log("[fetch-rld-label] openFDA URL:", url);
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("[fetch-rld-label] openFDA non-200:", res.status);
    return null;
  }
  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) return null;

  const fields: { key: string; label: string; value: string; evidence?: string }[] = [];

  // Identity / metadata fields from openfda block
  const of = hit.openfda || {};
  const meta: Record<string, string> = {
    brand_name: (of.brand_name || [])[0] || "",
    generic_name: (of.generic_name || [])[0] || "",
    manufacturer: (of.manufacturer_name || [])[0] || "",
    application_number: (of.application_number || [])[0] || "",
    ndc: (of.product_ndc || [])[0] || "",
    route_of_administration: (of.route || [])[0] || "",
    dosage_form: (of.dosage_form || [])[0] || "",
  };
  for (const [key, value] of Object.entries(meta)) {
    if (value) fields.push({ key, label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value });
  }

  // SPL sections — dynamically surface EVERY string-array field openFDA returns.
  // openFDA exposes each SPL section as a top-level key whose value is a string array.
  // We don't hardcode a list — whatever sections this specific label has, we pass through.
  for (const [key, val] of Object.entries(hit)) {
    if (OPENFDA_SKIP_KEYS.has(key)) continue;
    if (key.endsWith("_table")) continue; // structured HTML tables, skip for text comparison
    if (!Array.isArray(val)) continue;
    const text = (val as unknown[]).filter((x) => typeof x === "string").join("\n\n").trim();
    if (!text) continue;
    fields.push({ key, label: humanizeKey(key), value: text, evidence: "openFDA Drug Label API" });
  }

  return {
    source: "openFDA" as const,
    identifier: meta.application_number || meta.ndc || meta.brand_name || "unknown",
    fields,
    raw: { id: hit.id, set_id: hit.set_id, version: hit.version, effective_time: hit.effective_time },
  };
}

async function fetchDailyMed(input: any) {
  // DailyMed search by drug name → returns setid → fetch SPL JSON for sections
  const q = input.brand_name || input.generic_name;
  if (!q && !input.setid && !input.ndc) return null;

  let setid: string | null = input.setid || null;

  if (!setid && input.ndc) {
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?ndc=${encodeURIComponent(input.ndc)}&pagesize=1`;
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      setid = j?.data?.[0]?.setid || null;
    }
  }
  if (!setid && q) {
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(q)}&pagesize=1`;
    console.log("[fetch-rld-label] DailyMed search:", url);
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    setid = j?.data?.[0]?.setid || null;
  }
  if (!setid) return null;

  // Fetch the SPL XML document — DailyMed does not expose the full detail as .json.
  const splUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setid}.xml`;
  const r = await fetch(splUrl, { headers: { "User-Agent": "GenieSuite-RLD-Comparison/1.0" } });
  if (!r.ok) {
    console.warn("[fetch-rld-label] DailyMed SPL XML non-200:", r.status, splUrl);
    return null;
  }
  const xml = await r.text();

  const fields: { key: string; label: string; value: string; evidence?: string }[] = [];
  const title = firstTagText(xml, "title");
  const effectiveTime = firstTagAttr(xml, "effectiveTime", "value");

  // Dynamic: surface every section DailyMed returns. Derive a snake_case key from
  // the section title or LOINC code — no hardcoded section mapping.
  const sections = Array.from(xml.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi));
  const seen = new Set<string>();
  for (const secMatch of sections) {
    const sec = secMatch[1];
    const title = firstTagText(sec, "title");
    const textMatch = sec.match(/<text\b[^>]*>([\s\S]*?)<\/text>/i);
    const text = textMatch ? stripXmlTags(textMatch[1]) : "";
    if (!text) continue;
    const code = firstTagAttr(sec, "code", "code");
    const key = title ? slug(title) : code ? `loinc_${slug(String(code))}` : `section_${fields.length + 1}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const label = title || (code ? `LOINC ${code}` : `Section ${fields.length + 1}`);
    fields.push({
      key,
      label,
      value: text,
      evidence: `DailyMed setid ${setid}${code ? ` / LOINC ${code}` : ""}`,
    });
  }

  if (title) fields.unshift({ key: "spl_title", label: "SPL Title", value: title });
  if (effectiveTime) fields.push({ key: "spl_effective_time", label: "SPL Effective Time", value: effectiveTime });

  return {
    source: "DailyMed" as const,
    identifier: setid,
    fields,
    raw: { setid, title, effective_time: effectiveTime },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const input = await req.json().catch(() => ({}));
    const { brand_name, generic_name, ndc, application_number, setid, prefer } = input || {};

    if (!brand_name && !generic_name && !ndc && !application_number && !setid) {
      return new Response(
        JSON.stringify({ error: "Provide at least one of: brand_name, generic_name, ndc, application_number, setid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch BOTH sources in parallel — caller needs to compare each independently.
    const [openFdaRes, dailyMedRes] = await Promise.allSettled([
      fetchOpenFda({ brand_name, generic_name, ndc, application_number }),
      fetchDailyMed({ brand_name, generic_name, ndc, setid }),
    ]);

    const openFda = openFdaRes.status === "fulfilled" ? openFdaRes.value : null;
    const dailyMed = dailyMedRes.status === "fulfilled" ? dailyMedRes.value : null;
    const openFdaError = openFdaRes.status === "rejected" ? (openFdaRes.reason as Error)?.message : null;
    const dailyMedError = dailyMedRes.status === "rejected" ? (dailyMedRes.reason as Error)?.message : null;

    if (!openFda && !dailyMed) {
      return new Response(
        JSON.stringify({
          error: "No RLD label found in openFDA or DailyMed for the provided identifiers",
          openFdaError, dailyMedError,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ openFda, dailyMed, openFdaError, dailyMedError }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[fetch-rld-label] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
