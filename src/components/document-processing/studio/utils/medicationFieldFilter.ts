/**
 * Medication Field Deduplication Utility
 * Filters duplicate medication fields to prevent showing both numbered (medication_1_name)
 * and non-numbered (medication_name) formats simultaneously
 */

/**
 * Determines if a medication field should be hidden to avoid duplicates
 * For single medications: hide numbered fields (medication_1_name) when non-numbered exist (medication_name)
 * For multiple medications: hide non-numbered fields when numbered fields exist
 */
export function shouldHideDuplicateMedicationField(
  key: string, 
  extractedFields: Record<string, any>
): boolean {
  const lowerKey = key.toLowerCase();
  
  // Check if this is a numbered medication field (medication_1_name, medication_2_quantity, etc.)
  const numberedMatch = lowerKey.match(/^medication_(\d+)_(.+)$/);
  
  // Check if non-numbered medication fields exist (medication_name, quantity, sig, etc.)
  const hasNonNumberedMeds = ['medication_name', 'name', 'quantity', 'sig', 'strength', 'form', 'route', 'refills', 'dosage', 'ndc_code', 'frequency']
    .some(field => {
      const fullKey = field === 'name' ? 'medication_name' : field;
      const value = extractedFields[fullKey]?.value || extractedFields[`medication_${field}`]?.value;
      return value !== undefined && value !== null && value !== '';
    });
  
  // Count how many unique numbered medications exist
  const numberedMedCount = new Set(
    Object.keys(extractedFields)
      .filter(k => /^medication_\d+_/i.test(k))
      .map(k => k.toLowerCase().match(/^medication_(\d+)_/)?.[1])
      .filter(Boolean)
  ).size;
  
  if (numberedMatch) {
    // This is a numbered field (medication_1_name, medication_1_medication_name, etc.)
    // Hide it if there's only 1 medication AND non-numbered fields exist
    if (numberedMedCount <= 1 && hasNonNumberedMeds) {
      return true;
    }
  } else {
    // This is a non-numbered medication field (medication_name, quantity, etc.)
    const isMedicationField = /^(medication_)?(name|quantity|sig|strength|form|route|refills|ndc|ndc_code|dosage|frequency)$/i.test(lowerKey) ||
                              lowerKey === 'medication_name';
    
    // Hide non-numbered medication fields if there are multiple numbered medications
    if (isMedicationField && numberedMedCount > 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter extracted fields to remove duplicate medication entries
 * Returns a new object with deduplicated fields
 */
export function filterDuplicateMedicationFields<T extends Record<string, any>>(
  extractedFields: T
): T {
  const filtered: Record<string, any> = {};
  
  Object.entries(extractedFields).forEach(([key, value]) => {
    if (!shouldHideDuplicateMedicationField(key, extractedFields)) {
      filtered[key] = value;
    }
  });
  
  return filtered as T;
}

/**
 * Remove truly duplicate medication fields with different naming conventions
 * e.g., medication_1_medication_name vs medication_1_name (keep the shorter one)
 */
export function deduplicateMedicationFields<T extends Record<string, any>>(
  extractedFields: T
): T {
  const result: Record<string, any> = { ...extractedFields };
  const keysToRemove: string[] = [];
  
  Object.keys(result).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check for medication_N_medication_X pattern (redundant 'medication' word)
    const redundantMatch = lowerKey.match(/^medication_(\d+)_medication_(.+)$/);
    if (redundantMatch) {
      const simpleKey = `medication_${redundantMatch[1]}_${redundantMatch[2]}`;
      // If the simple version exists, remove the redundant one
      if (result[simpleKey] !== undefined) {
        keysToRemove.push(key);
      } else {
        // Rename to simple format
        result[simpleKey] = result[key];
        keysToRemove.push(key);
      }
    }
  });
  
  keysToRemove.forEach(key => delete result[key]);
  
  return result as T;
}

/**
 * Full deduplication pipeline - removes redundant keys then filters duplicates
 */
export function cleanMedicationFields<T extends Record<string, any>>(
  extractedFields: T
): T {
  const deduplicated = deduplicateMedicationFields(extractedFields);
  return filterDuplicateMedicationFields(deduplicated);
}
