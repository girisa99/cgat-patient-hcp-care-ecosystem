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

  // Fetch the SPL document — DailyMed returns sections by LOINC code
  const splUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setid}.json`;
  const r = await fetch(splUrl);
  if (!r.ok) return null;
  const j = await r.json();
  const data = j?.data || {};

  // LOINC → our key mapping for common SPL sections
  const LOINC_MAP: Record<string, { key: string; label: string }> = {
    "34066-1": { key: "boxed_warning", label: "Boxed Warning" },
    "34067-9": { key: "indications_and_usage", label: "1 Indications and Usage" },
    "34068-7": { key: "dosage_and_administration", label: "2 Dosage and Administration" },
    "43678-2": { key: "dosage_forms_and_strengths", label: "3 Dosage Forms and Strengths" },
    "34070-3": { key: "contraindications", label: "4 Contraindications" },
    "43685-7": { key: "warnings_and_precautions", label: "5 Warnings and Precautions" },
    "34071-1": { key: "warnings", label: "Warnings" },
    "34084-4": { key: "adverse_reactions", label: "6 Adverse Reactions" },
    "34073-7": { key: "drug_interactions", label: "7 Drug Interactions" },
    "43684-0": { key: "use_in_specific_populations", label: "8 Use in Specific Populations" },
    "34088-5": { key: "pregnancy", label: "8.1 Pregnancy" },
    "34081-0": { key: "pediatric_use", label: "8.4 Pediatric Use" },
    "34082-8": { key: "geriatric_use", label: "8.5 Geriatric Use" },
    "34088-3": { key: "overdosage", label: "10 Overdosage" },
    "34089-3": { key: "description", label: "11 Description" },
    "34090-1": { key: "clinical_pharmacology", label: "12 Clinical Pharmacology" },
    "43679-0": { key: "mechanism_of_action", label: "12.1 Mechanism of Action" },
    "43680-8": { key: "nonclinical_toxicology", label: "13 Nonclinical Toxicology" },
    "34092-7": { key: "clinical_studies", label: "14 Clinical Studies" },
    "34069-5": { key: "how_supplied", label: "16 How Supplied / Storage and Handling" },
    "42230-3": { key: "patient_information", label: "17 Patient Counseling Information" },
  };

  const fields: { key: string; label: string; value: string; evidence?: string }[] = [];
  const sections = Array.isArray(data.sections) ? data.sections : [];

  for (const sec of sections) {
    const code = sec?.code || sec?.loinc_code || sec?.section_code;
    const map = code && LOINC_MAP[code];
    if (!map) continue;
    const text = (sec.text || sec.section_text || sec.title_text || "").trim();
    if (text) fields.push({ key: map.key, label: map.label, value: text, evidence: `DailyMed setid ${setid} / LOINC ${code}` });
  }

  if (data.title) fields.unshift({ key: "spl_title", label: "SPL Title", value: data.title });
  if (data.published_date) fields.push({ key: "spl_published_date", label: "Published Date", value: String(data.published_date) });

  return {
    source: "DailyMed" as const,
    identifier: setid,
    fields,
    raw: { setid, title: data.title, published_date: data.published_date },
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

    let result: any = null;
    const order = prefer === "dailymed" ? ["dailymed", "openfda"] : ["openfda", "dailymed"];

    for (const src of order) {
      try {
        if (src === "openfda") result = await fetchOpenFda({ brand_name, generic_name, ndc, application_number });
        else result = await fetchDailyMed({ brand_name, generic_name, ndc, setid });
      } catch (e) {
        console.warn(`[fetch-rld-label] ${src} threw:`, (e as Error).message);
      }
      if (result && result.fields?.length) break;
    }

    if (!result || !result.fields?.length) {
      return new Response(
        JSON.stringify({ error: "No RLD label found in openFDA or DailyMed for the provided identifiers" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(result), {
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
