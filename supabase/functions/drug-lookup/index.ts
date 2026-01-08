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

// Common OCR misspellings and their corrections
const DRUG_NAME_CORRECTIONS: Record<string, string> = {
  'amoxillin': 'amoxicillin',
  'amoxicilin': 'amoxicillin',
  'amoxycillin': 'amoxicillin',
  'amoxycylin': 'amoxicillin',
  'amoxacillin': 'amoxicillin',
  'ibuprophen': 'ibuprofen',
  'ibuprofin': 'ibuprofen',
  'ibuprofan': 'ibuprofen',
  'acetamenophen': 'acetaminophen',
  'acetaminophin': 'acetaminophen',
  'acetominophen': 'acetaminophen',
  'tylenol': 'acetaminophen',
  'tylanol': 'acetaminophen',
  'metforman': 'metformin',
  'metformine': 'metformin',
  'lisinpril': 'lisinopril',
  'lisanopril': 'lisinopril',
  'lisinipril': 'lisinopril',
  'atorvastain': 'atorvastatin',
  'atorvastatan': 'atorvastatin',
  'atorvastin': 'atorvastatin',
  'omeprazol': 'omeprazole',
  'omeprazola': 'omeprazole',
  'amlodapine': 'amlodipine',
  'amlodopine': 'amlodipine',
  'gabapantin': 'gabapentin',
  'gabapenton': 'gabapentin',
  'sertaline': 'sertraline',
  'sertralene': 'sertraline',
  'losarton': 'losartan',
  'losarten': 'losartan',
  'hydrocodene': 'hydrocodone',
  'hydrocondone': 'hydrocodone',
  'oxycodene': 'oxycodone',
  'oxycontin': 'oxycodone',
  'alprazolom': 'alprazolam',
  'alprazalam': 'alprazolam',
  'aspirn': 'aspirin',
  'asprin': 'aspirin',
  'prednisone': 'prednisone',
  'prednizone': 'prednisone',
  'levothyroxin': 'levothyroxine',
  'levothyroxene': 'levothyroxine',
  'metoprolal': 'metoprolol',
  'metropolol': 'metoprolol',
  'simvastain': 'simvastatin',
  'simvastin': 'simvastatin',
  'atenalol': 'atenolol',
  'atinolol': 'atenolol',
  'clopidogral': 'clopidogrel',
  'clopidagrel': 'clopidogrel',
  'ciprofloxicin': 'ciprofloxacin',
  'ciprofloxin': 'ciprofloxacin',
  'azithromicin': 'azithromycin',
  'azythromycin': 'azithromycin',
  'tramadal': 'tramadol',
  'tramidal': 'tramadol',
  'furosimide': 'furosemide',
  'furosimid': 'furosemide',
  'pantoprazol': 'pantoprazole',
  'pantoprazola': 'pantoprazole',
  'duloxatine': 'duloxetine',
  'duloxetin': 'duloxetine',
  'escitalopran': 'escitalopram',
  'escitaloprom': 'escitalopram',
  'fluoxatine': 'fluoxetine',
  'fluoxetin': 'fluoxetine',
  'warferin': 'warfarin',
  'warfiran': 'warfarin',
  'cephalexan': 'cephalexin',
  'cephalexen': 'cephalexin',
  'doxycyclin': 'doxycycline',
  'doxycyclin': 'doxycycline',
};

// Fuzzy match function using Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Correct drug name spelling using corrections dictionary and fuzzy matching
function correctDrugNameSpelling(drugName: string): { corrected: string; original: string; wasCorrected: boolean } {
  const lowerName = drugName.toLowerCase().trim();
  
  // Check exact match in corrections dictionary
  if (DRUG_NAME_CORRECTIONS[lowerName]) {
    console.log(`📝 Corrected spelling: ${drugName} → ${DRUG_NAME_CORRECTIONS[lowerName]}`);
    return { corrected: DRUG_NAME_CORRECTIONS[lowerName], original: drugName, wasCorrected: true };
  }
  
  // Try fuzzy matching against corrections dictionary keys
  let bestMatch = '';
  let bestDistance = Infinity;
  
  for (const [misspelling, correct] of Object.entries(DRUG_NAME_CORRECTIONS)) {
    const distance = levenshteinDistance(lowerName, misspelling);
    if (distance < bestDistance && distance <= 2) { // Allow up to 2 character differences
      bestDistance = distance;
      bestMatch = correct;
    }
  }
  
  if (bestMatch) {
    console.log(`📝 Fuzzy matched spelling: ${drugName} → ${bestMatch} (distance: ${bestDistance})`);
    return { corrected: bestMatch, original: drugName, wasCorrected: true };
  }
  
  // Try fuzzy matching against the correct names directly (for partial matches)
  const uniqueCorrectNames = [...new Set(Object.values(DRUG_NAME_CORRECTIONS))];
  for (const correctName of uniqueCorrectNames) {
    const distance = levenshteinDistance(lowerName, correctName);
    if (distance < bestDistance && distance <= 2) {
      bestDistance = distance;
      bestMatch = correctName;
    }
  }
  
  if (bestMatch) {
    console.log(`📝 Fuzzy matched to correct name: ${drugName} → ${bestMatch} (distance: ${bestDistance})`);
    return { corrected: bestMatch, original: drugName, wasCorrected: true };
  }
  
  return { corrected: drugName, original: drugName, wasCorrected: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drugName, searchType = 'all' } = await req.json();
    console.log(`🔍 Drug lookup request: ${drugName}, type: ${searchType}`);

    // Clean drug name - remove dots from abbreviations like "A.D." -> "AD"
    const cleanedDrugName = (drugName || '').trim().replace(/\./g, '').replace(/\s+/g, ' ').trim();
    
    // For suggestions (autocomplete), allow minimum 1 character
    // For full search, require at least 2 characters
    const minLength = searchType === 'suggestions' ? 1 : 2;
    
    // Skip invalid searches (empty, too short, or clearly not a drug name)
    const invalidSearchTerms = [
      'unknown abbreviation',
      'requires clarification',
      'not found',
      'n/a',
      'none',
      'null',
      'undefined'
    ];
    
    const isInvalidTerm = invalidSearchTerms.some(term => 
      cleanedDrugName.toLowerCase().includes(term)
    );
    
    if (!cleanedDrugName || cleanedDrugName.length < minLength || isInvalidTerm) {
      // For suggestions, return empty array instead of error for better UX
      if (searchType === 'suggestions') {
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Drug name must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle suggestions request (autocomplete)
    if (searchType === 'suggestions') {
      try {
        const suggestions: any[] = [];
        
        // Get suggestions from RxNorm spelling suggestions
        const spellingUrl = `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(cleanedDrugName)}`;
        const spellingResponse = await fetch(spellingUrl);
        
        if (spellingResponse.ok) {
          const spellingData = await spellingResponse.json();
          const suggestionList = spellingData.suggestionGroup?.suggestionList?.suggestion || [];
          for (const name of suggestionList.slice(0, 8)) {
            suggestions.push({ name, source: 'rxnorm' });
          }
        }
        
        // Also try to get drug details from RxNorm approximateMatch for better results
        const approxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(cleanedDrugName)}&maxEntries=8`;
        const approxResponse = await fetch(approxUrl);
        
        if (approxResponse.ok) {
          const approxData = await approxResponse.json();
          const candidates = approxData.approximateGroup?.candidate || [];
          for (const candidate of candidates.slice(0, 8)) {
            if (candidate.name && !suggestions.some(s => s.name.toLowerCase() === candidate.name.toLowerCase())) {
              suggestions.push({ 
                name: candidate.name,
                rxcui: candidate.rxcui,
                source: 'rxnorm'
              });
            }
          }
        }
        
        // Try FDA for brand names
        try {
          const fdaUrl = `https://api.fda.gov/drug/ndc.json?search=brand_name:"${encodeURIComponent(cleanedDrugName)}"*&limit=5`;
          const fdaResponse = await fetch(fdaUrl);
          if (fdaResponse.ok) {
            const fdaData = await fdaResponse.json();
            for (const drug of (fdaData.results || []).slice(0, 5)) {
              const existingByName = suggestions.some(s => 
                s.name.toLowerCase() === (drug.brand_name || '').toLowerCase() ||
                s.name.toLowerCase() === (drug.generic_name || '').toLowerCase()
              );
              if (!existingByName && drug.brand_name) {
                suggestions.push({
                  name: drug.brand_name,
                  genericName: drug.generic_name,
                  strength: drug.active_ingredients?.[0]?.strength,
                  dosageForm: drug.dosage_form,
                  manufacturer: drug.labeler_name,
                  source: 'fda'
                });
              }
            }
          }
        } catch (fdaError) {
          console.error('FDA suggestions error:', fdaError);
        }
        
        console.log(`✅ Found ${suggestions.length} drug suggestions for "${drugName}"`);
        
        return new Response(
          JSON.stringify({ suggestions: suggestions.slice(0, 8) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (suggestionError) {
        console.error('Suggestion error:', suggestionError);
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Correct spelling before lookup
    const { corrected: correctedDrugName, wasCorrected } = correctDrugNameSpelling(drugName.trim());
    const searchName = correctedDrugName;
    
    console.log(`🔍 Searching for: ${searchName}${wasCorrected ? ` (corrected from ${drugName})` : ''}`);

    const results: any = {
      drugName: drugName.trim(),
      correctedName: wasCorrected ? correctedDrugName : undefined,
      wasCorrected,
      searchedAt: new Date().toISOString(),
      ndc: [],
      rxnorm: [],
      clinicalInfo: [],
      alternatives: []
    };

    // 1. OpenFDA NDC Lookup (American drug codes) - use corrected name
    if (searchType === 'all' || searchType === 'ndc') {
      try {
        const fdaUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(searchName)}"OR+brand_name:"${encodeURIComponent(searchName)}"&limit=10`;
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

    // 2. RxNorm Lookup (NIH drug database for alternatives and clinical info) - use corrected name
    if (searchType === 'all' || searchType === 'rxnorm') {
      try {
        const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(searchName)}`;
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

    // Fallback: if no results found, try a simplified drug name (e.g., remove strength and dosage form)
    if (results.ndc.length === 0 && results.rxnorm.length === 0) {
      const simplifiedName = searchName
        .toLowerCase()
        // Remove strength like "250 mg", "10mg", etc.
        .replace(/\b\d+\s*(mg|mcg|g|ml|units?)\b/gi, '')
        // Remove common dosage form words
        .replace(/\b(tablets?|capsules?|caps?|tabs?|solution|suspension|injection|cream|ointment|topical|drops?|inhaler|syrup)\b/gi, '')
        // Collapse extra spaces
        .replace(/\s+/g, ' ')
        .trim();
      
      // Also try correcting the simplified name
      const { corrected: correctedSimplified } = correctDrugNameSpelling(simplifiedName);
      const searchSimplified = correctedSimplified;

      if (searchSimplified && searchSimplified.length >= 2 && searchSimplified !== searchName.toLowerCase()) {
        console.log(`🔁 No results for full name, retrying with simplified/corrected name: ${searchSimplified}`);

        // Retry OpenFDA with simplified/corrected name
        try {
          const fdaUrlSimple = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(searchSimplified)}"OR+brand_name:"${encodeURIComponent(searchSimplified)}"&limit=10`;
          console.log(`📡 OpenFDA fallback request: ${fdaUrlSimple}`);
          const fdaResponseSimple = await fetch(fdaUrlSimple);
          if (fdaResponseSimple.ok) {
            const fdaDataSimple = await fdaResponseSimple.json();
            results.ndc = (fdaDataSimple.results || []).map((drug: OpenFDADrug) => ({
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
            console.log(`✅ OpenFDA fallback found ${results.ndc.length} NDC codes`);
          } else {
            console.log(`⚠️ OpenFDA fallback returned ${fdaResponseSimple.status}`);
          }
        } catch (fdaError) {
          console.error('OpenFDA fallback error:', fdaError);
        }

        // Retry RxNorm with simplified/corrected name
        try {
          const rxNormUrlSimple = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(searchSimplified)}`;
          console.log(`📡 RxNorm fallback request: ${rxNormUrlSimple}`);
          const rxResponseSimple = await fetch(rxNormUrlSimple);
          if (rxResponseSimple.ok) {
            const rxDataSimple = await rxResponseSimple.json();
            const conceptGroupSimple = rxDataSimple.drugGroup?.conceptGroup || [];
            for (const group of conceptGroupSimple) {
              if (group.conceptProperties) {
                results.rxnorm.push(...group.conceptProperties.map((drug: RxNormDrug) => ({
                  rxcui: drug.rxcui,
                  name: drug.name,
                  synonym: drug.synonym,
                  termType: drug.tty
                })));
              }
            }
            console.log(`✅ RxNorm fallback found ${results.rxnorm.length} entries`);
          }
        } catch (rxError) {
          console.error('RxNorm fallback error:', rxError);
        }
      }
    }

    // Add clinical recommendations based on drug class and drug name (use corrected name for matching)
    const drugNameLower = searchName.toLowerCase();
    
    if (results.ndc.length > 0) {
      const pharmClasses = results.ndc[0].pharmClass || [];
      const genericName = results.ndc[0].genericName?.toLowerCase() || '';
      
      // Controlled substance warnings
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
      
      // Common medication-specific recommendations
      if (genericName.includes('metformin') || drugNameLower.includes('metformin')) {
        results.clinicalInfo.push({
          type: 'info',
          severity: 'medium',
          title: 'Dosage Guidance',
          description: 'Start with low dose (500mg once daily) and titrate gradually. Take with meals to reduce GI side effects.'
        });
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'medium',
          title: 'Contraindication',
          description: 'Contraindicated in patients with renal impairment (eGFR <30). Monitor kidney function regularly.'
        });
        results.clinicalInfo.push({
          type: 'info',
          severity: 'low',
          title: 'Clinical Monitoring',
          description: 'Monitor B12 levels with long-term use. May cause lactic acidosis in rare cases - discontinue before contrast procedures.'
        });
      }
      
      if (genericName.includes('lisinopril') || drugNameLower.includes('lisinopril')) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'high',
          title: 'Contraindication',
          description: 'Contraindicated in pregnancy. May cause angioedema - discontinue immediately if facial/throat swelling occurs.'
        });
        results.clinicalInfo.push({
          type: 'info',
          severity: 'medium',
          title: 'Drug Interaction',
          description: 'Avoid potassium supplements and potassium-sparing diuretics. Monitor potassium levels.'
        });
      }
      
      if (genericName.includes('atorvastatin') || drugNameLower.includes('atorvastatin') || drugNameLower.includes('lipitor')) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'medium',
          title: 'Muscle Effects',
          description: 'Monitor for muscle pain, tenderness, or weakness. Risk of rhabdomyolysis, especially with high doses.'
        });
        results.clinicalInfo.push({
          type: 'info',
          severity: 'low',
          title: 'Dosage Alert',
          description: 'Take in the evening for optimal effect. Avoid grapefruit juice which can increase drug levels.'
        });
      }
      
      if (genericName.includes('warfarin') || drugNameLower.includes('warfarin') || drugNameLower.includes('coumadin')) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'high',
          title: 'Bleeding Risk',
          description: 'High bleeding risk - monitor INR regularly. Numerous drug and food interactions (vitamin K).'
        });
        results.clinicalInfo.push({
          type: 'error',
          severity: 'high',
          title: 'Contraindication',
          description: 'Contraindicated in pregnancy, active bleeding, and uncontrolled hypertension.'
        });
      }
      
      if (genericName.includes('amoxicillin') || drugNameLower.includes('amoxicillin')) {
        results.clinicalInfo.push({
          type: 'warning',
          severity: 'medium',
          title: 'Allergy Alert',
          description: 'Check for penicillin allergy before prescribing. Cross-reactivity with cephalosporins possible.'
        });
        results.clinicalInfo.push({
          type: 'info',
          severity: 'low',
          title: 'Administration',
          description: 'Can be taken with or without food. Complete full course even if symptoms improve.'
        });
      }
    }
    
    // Add general recommendation if nothing specific found
    if (results.clinicalInfo.length === 0) {
      results.clinicalInfo.push({
        type: 'info',
        severity: 'low',
        title: 'Standard Medication',
        description: 'No specific warnings found. Follow standard prescribing guidelines and monitor for adverse effects.'
      });
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
