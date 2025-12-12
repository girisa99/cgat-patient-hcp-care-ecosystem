import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OpenFDADrug {
  product_ndc: string;
  generic_name: string;
  brand_name: string;
  labeler_name: string;
  dosage_form: string;
  route: string[];
  active_ingredients: { name: string; strength: string }[];
  pharm_class?: string[];
  product_type?: string;
}

interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drugName, searchType = 'all' } = await req.json();
    console.log(`🔍 Drug lookup request: ${drugName}, type: ${searchType}`);

    if (!drugName || drugName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Drug name must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any = {
      drugName: drugName.trim(),
      searchedAt: new Date().toISOString(),
      ndc: [],
      rxnorm: [],
      clinicalInfo: [],
      alternatives: []
    };

    // 1. OpenFDA NDC Lookup (American drug codes)
    if (searchType === 'all' || searchType === 'ndc') {
      try {
        const fdaUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(drugName)}"OR+brand_name:"${encodeURIComponent(drugName)}"&limit=10`;
        console.log(`📡 OpenFDA request: ${fdaUrl}`);
        
        const fdaResponse = await fetch(fdaUrl);
        if (fdaResponse.ok) {
          const fdaData = await fdaResponse.json();
          results.ndc = (fdaData.results || []).map((drug: OpenFDADrug) => ({
            code: drug.product_ndc,
            type: 'NDC',
            country: 'USA',
            genericName: drug.generic_name,
            brandName: drug.brand_name,
            manufacturer: drug.labeler_name,
            dosageForm: drug.dosage_form,
            route: drug.route?.join(', ') || 'oral',
            strength: drug.active_ingredients?.[0]?.strength || '',
            productType: drug.product_type,
            pharmClass: drug.pharm_class || []
          }));
          console.log(`✅ OpenFDA found ${results.ndc.length} NDC codes`);
        } else {
          console.log(`⚠️ OpenFDA returned ${fdaResponse.status}`);
        }
      } catch (fdaError) {
        console.error('OpenFDA error:', fdaError);
      }
    }

    // 2. RxNorm Lookup (NIH drug database for alternatives and clinical info)
    if (searchType === 'all' || searchType === 'rxnorm') {
      try {
        const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`;
        console.log(`📡 RxNorm request: ${rxNormUrl}`);
        
        const rxResponse = await fetch(rxNormUrl);
        if (rxResponse.ok) {
          const rxData = await rxResponse.json();
          const conceptGroup = rxData.drugGroup?.conceptGroup || [];
          
          for (const group of conceptGroup) {
            if (group.conceptProperties) {
              results.rxnorm.push(...group.conceptProperties.map((drug: RxNormDrug) => ({
                rxcui: drug.rxcui,
                name: drug.name,
                synonym: drug.synonym,
                termType: drug.tty
              })));
            }
          }
          console.log(`✅ RxNorm found ${results.rxnorm.length} entries`);

          // Get alternatives for the first RxCUI found
          if (results.rxnorm.length > 0) {
            const rxcui = results.rxnorm[0].rxcui;
            try {
              const altUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SBD+GPCK+BPCK`;
              const altResponse = await fetch(altUrl);
              if (altResponse.ok) {
                const altData = await altResponse.json();
                const relatedGroups = altData.relatedGroup?.conceptGroup || [];
                for (const group of relatedGroups) {
                  if (group.conceptProperties) {
                    results.alternatives.push(...group.conceptProperties.slice(0, 5).map((alt: any) => ({
                      rxcui: alt.rxcui,
                      name: alt.name,
                      termType: alt.tty
                    })));
                  }
                }
              }
            } catch (altError) {
              console.error('RxNorm alternatives error:', altError);
            }

            // Get clinical info (interactions, warnings)
            try {
              const interactionUrl = `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}`;
              const interactionResponse = await fetch(interactionUrl);
              if (interactionResponse.ok) {
                const interactionData = await interactionResponse.json();
                if (interactionData.interactionTypeGroup) {
                  for (const group of interactionData.interactionTypeGroup) {
                    for (const type of group.interactionType || []) {
                      for (const pair of type.interactionPair || []) {
                        results.clinicalInfo.push({
                          type: 'interaction',
                          severity: pair.severity || 'unknown',
                          description: pair.description
                        });
                      }
                    }
                  }
                }
              }
            } catch (interactionError) {
              console.error('RxNorm interactions error:', interactionError);
            }
          }
        }
      } catch (rxError) {
        console.error('RxNorm error:', rxError);
      }
    }

    // Add clinical recommendations based on drug class
    if (results.ndc.length > 0) {
      const pharmClasses = results.ndc[0].pharmClass || [];
      if (pharmClasses.some((c: string) => c.toLowerCase().includes('opioid'))) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'high',
          description: 'Opioid medication - Check PDMP database before dispensing. Verify patient ID and prescription authenticity.'
        });
        results.isControlled = true;
        results.schedule = 'II';
      }
      if (pharmClasses.some((c: string) => c.toLowerCase().includes('benzodiazepine'))) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'high',
          description: 'Benzodiazepine - Risk of dependence. Monitor for signs of misuse.'
        });
        results.isControlled = true;
        results.schedule = 'IV';
      }
    }

    console.log(`📦 Returning results: ${results.ndc.length} NDC, ${results.rxnorm.length} RxNorm, ${results.alternatives.length} alternatives`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Drug lookup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
