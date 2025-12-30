/**
 * useMedicationSearch Hook
 * Handles drug search, NDC lookup, SIG parsing, and medication state
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
import { toast } from 'sonner';
import { MedicationResult, ProcessingResult } from './useDocumentProcessingState';

// Dose options
export const DOSE_OPTIONS = ['1 tablet', '2 tablets', '1 capsule', '2 capsules', '1 drop', '2 drops', '5 ml', '10 ml', '1 puff', '2 puffs'];

// Route options
export const ROUTE_OPTIONS = [
  { value: 'po', label: 'by mouth (oral)' },
  { value: 'sl', label: 'under the tongue (sublingual)' },
  { value: 'pr', label: 'rectally' },
  { value: 'im', label: 'intramuscular injection' },
  { value: 'iv', label: 'intravenous injection' },
  { value: 'sc', label: 'subcutaneous injection' },
  { value: 'top', label: 'topically (on skin)' },
  { value: 'inh', label: 'by inhalation' },
  { value: 'ou', label: 'both eyes' },
  { value: 'au', label: 'both ears' },
];

// Frequency options
export const FREQUENCY_OPTIONS = [
  { value: 'qd', label: 'once daily', timesPerDay: 1 },
  { value: 'bid', label: 'twice daily', timesPerDay: 2 },
  { value: 'tid', label: 'three times a day', timesPerDay: 3 },
  { value: 'qid', label: 'four times a day', timesPerDay: 4 },
  { value: 'q4h', label: 'every 4 hours', timesPerDay: 6 },
  { value: 'q6h', label: 'every 6 hours', timesPerDay: 4 },
  { value: 'q8h', label: 'every 8 hours', timesPerDay: 3 },
  { value: 'q12h', label: 'every 12 hours', timesPerDay: 2 },
  { value: 'hs', label: 'at bedtime', timesPerDay: 1 },
  { value: 'prn', label: 'as needed', timesPerDay: 0 },
];

// Duration options
export const DURATION_OPTIONS = ['7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days'];

export function useMedicationSearch(processingResult: ProcessingResult | null) {
  const { calculateQuantityAndDaySupply, parseSig } = useMedicationProcessing();
  
  // Ref to track if we're in extraction mode
  const isExtractingRef = useRef(false);
  
  // ============= MEDICATION SEARCH STATE =============
  const [drugSearchQuery, setDrugSearchQuery] = useState(() => 
    sessionStorage.getItem('docProcessing_drugQuery') || ''
  );
  const [sigInstructions, setSigInstructions] = useState(() => 
    sessionStorage.getItem('docProcessing_sigInstructions') || ''
  );
  const [searchResults, setSearchResults] = useState<MedicationResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_searchResults');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState<string | null>(() => 
    sessionStorage.getItem('docProcessing_selectedNdc')
  );
  const [parsedSig, setParsedSig] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_parsedSig');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<{ title: string; message: string; type: string } | null>(null);
  
  // ============= DOSE/ROUTE/FREQUENCY/DURATION STATE =============
  const [selectedDose, setSelectedDose] = useState(() => 
    sessionStorage.getItem('docProcessing_selectedDose') || '1 tablet'
  );
  const [selectedRoute, setSelectedRoute] = useState(() => 
    sessionStorage.getItem('docProcessing_selectedRoute') || 'by mouth (oral)'
  );
  const [selectedFrequency, setSelectedFrequency] = useState(() => 
    sessionStorage.getItem('docProcessing_selectedFrequency') || 'once daily'
  );
  const [selectedDuration, setSelectedDuration] = useState(() => 
    sessionStorage.getItem('docProcessing_selectedDuration') || '30 days'
  );
  
  // NDC-specific dosing info
  const [ndcDosageInfo, setNdcDosageInfo] = useState<{
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    dosageForm: string;
    strength: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_ndcDosageInfo');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  // Calculated quantity state
  const [calculatedQuantity, setCalculatedQuantity] = useState<{ totalQuantity: number; dailyDose: number; daysSupply: number } | null>(null);
  const [combinedSig, setCombinedSig] = useState('');

  // ============= SESSION STORAGE PERSISTENCE =============
  useEffect(() => {
    if (drugSearchQuery) sessionStorage.setItem('docProcessing_drugQuery', drugSearchQuery);
    else sessionStorage.removeItem('docProcessing_drugQuery');
  }, [drugSearchQuery]);
  
  useEffect(() => {
    if (sigInstructions) sessionStorage.setItem('docProcessing_sigInstructions', sigInstructions);
    else sessionStorage.removeItem('docProcessing_sigInstructions');
  }, [sigInstructions]);
  
  useEffect(() => {
    if (searchResults) sessionStorage.setItem('docProcessing_searchResults', JSON.stringify(searchResults));
    else sessionStorage.removeItem('docProcessing_searchResults');
  }, [searchResults]);
  
  useEffect(() => {
    if (selectedNdc) sessionStorage.setItem('docProcessing_selectedNdc', selectedNdc);
    else sessionStorage.removeItem('docProcessing_selectedNdc');
  }, [selectedNdc]);
  
  useEffect(() => {
    if (parsedSig) sessionStorage.setItem('docProcessing_parsedSig', JSON.stringify(parsedSig));
    else sessionStorage.removeItem('docProcessing_parsedSig');
  }, [parsedSig]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDose', selectedDose);
  }, [selectedDose]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedRoute', selectedRoute);
  }, [selectedRoute]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedFrequency', selectedFrequency);
  }, [selectedFrequency]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDuration', selectedDuration);
  }, [selectedDuration]);
  
  useEffect(() => {
    if (ndcDosageInfo) sessionStorage.setItem('docProcessing_ndcDosageInfo', JSON.stringify(ndcDosageInfo));
    else sessionStorage.removeItem('docProcessing_ndcDosageInfo');
  }, [ndcDosageInfo]);

  // ============= DRUG NAME NORMALIZATION =============
  const normalizeDrugName = useCallback((drugName: string): { baseName: string; extractedStrength: string } => {
    const original = drugName.trim();
    
    // Extract strength if present (e.g., "Metformin 500mg" -> "Metformin", "500mg")
    const strengthMatch = original.match(/\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%|iu|units?)/i);
    const extractedStrength = strengthMatch ? `${strengthMatch[1]}${strengthMatch[2]}` : '';
    
    // Remove strength from name
    const baseName = original
      .replace(/\s+\d+(?:\.\d+)?\s*(mg|mcg|g|ml|%|iu|units?)/gi, '')
      .replace(/\s*\(.*?\)/g, '') // Remove parenthetical info
      .replace(/\s+er\b|\s+sr\b|\s+xr\b|\s+cr\b/gi, '') // Remove extended release suffixes
      .trim()
      .split(/\s+/)[0]; // Take first word (generic name)
    
    return { baseName: baseName || original.split(/\s+/)[0], extractedStrength };
  }, []);

  // ============= SIG PARSING =============
  const parseSigToSelectors = useCallback((sigText: string) => {
    if (!sigText) return;
    
    isExtractingRef.current = true;
    
    const lowerSig = sigText.toLowerCase();
    
    let newDose = selectedDose;
    let newRoute = selectedRoute;
    let newFrequency = selectedFrequency;
    let newDuration = selectedDuration;
    
    // Parse dose amount
    const dosePatterns = [
      /take\s*(\d+)\s*(tablet|tab|capsule|cap|drop|ml|puff)s?/i,
      /(\d+)\s*(tablet|tab|capsule|cap|drop|ml|puff)s?/i,
    ];
    
    for (const pattern of dosePatterns) {
      const match = sigText.match(pattern);
      if (match) {
        const amount = match[1];
        const unit = match[2].toLowerCase();
        if (unit.startsWith('tab')) newDose = `${amount} tablet${parseInt(amount) > 1 ? 's' : ''}`;
        else if (unit.startsWith('cap')) newDose = `${amount} capsule${parseInt(amount) > 1 ? 's' : ''}`;
        else if (unit === 'drop') newDose = `${amount} drop${parseInt(amount) > 1 ? 's' : ''}`;
        else if (unit === 'ml') newDose = `${amount} ml`;
        else if (unit === 'puff') newDose = `${amount} puff${parseInt(amount) > 1 ? 's' : ''}`;
        break;
      }
    }
    
    // Parse route
    if (lowerSig.includes('by mouth') || lowerSig.includes('orally') || lowerSig.includes(' po ')) {
      newRoute = 'by mouth (oral)';
    } else if (lowerSig.includes('topical') || lowerSig.includes('apply')) {
      newRoute = 'topically (on skin)';
    } else if (lowerSig.includes('inhal') || lowerSig.includes('puff')) {
      newRoute = 'by inhalation';
    }
    
    // Parse frequency
    if (lowerSig.includes('once daily') || lowerSig.includes('once a day') || lowerSig.includes(' qd ')) {
      newFrequency = 'once daily';
    } else if (lowerSig.includes('twice daily') || lowerSig.includes('twice a day') || lowerSig.includes(' bid ')) {
      newFrequency = 'twice daily';
    } else if (lowerSig.includes('three times') || lowerSig.includes(' tid ')) {
      newFrequency = 'three times a day';
    } else if (lowerSig.includes('four times') || lowerSig.includes(' qid ')) {
      newFrequency = 'four times a day';
    }
    
    // Parse duration
    const durationMatch = sigText.match(/for\s*(\d+)\s*days?/i);
    if (durationMatch) {
      const days = parseInt(durationMatch[1]);
      if ([7, 10, 14, 21, 30, 60, 90].includes(days)) {
        newDuration = `${days} days`;
      }
    }
    
    setSelectedDose(newDose);
    setSelectedRoute(newRoute);
    setSelectedFrequency(newFrequency);
    setSelectedDuration(newDuration);
    
    setTimeout(() => {
      isExtractingRef.current = false;
    }, 200);
  }, [selectedDose, selectedRoute, selectedFrequency, selectedDuration]);

  // Parse SIG when it changes
  useEffect(() => {
    if (sigInstructions.trim()) {
      const parsed = parseSig(sigInstructions);
      setParsedSig(parsed);
      
      if (parsed.dose?.display) setSelectedDose(parsed.dose.display);
      if (parsed.route?.meaning) setSelectedRoute(parsed.route.meaning);
      if (parsed.frequency?.meaning) setSelectedFrequency(parsed.frequency.meaning);
      if (parsed.duration?.display) setSelectedDuration(parsed.duration.display);
    } else {
      setParsedSig(null);
    }
  }, [sigInstructions, parseSig]);

  // Auto-update fields when NDC changes
  useEffect(() => {
    if (selectedNdc && searchResults) {
      const ndcOption = searchResults.ndcOptions.find(opt => opt.code === selectedNdc);
      if (ndcOption) {
        const dosageForm = (ndcOption as any).dosageForm?.toLowerCase() || '';
        const strength = searchResults.strength || '';
        
        let dose = '1 tablet';
        let route = 'by mouth (oral)';
        
        if (dosageForm.includes('tablet')) {
          dose = '1 tablet';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('capsule')) {
          dose = '1 capsule';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('injection') || dosageForm.includes('injectable')) {
          dose = strength || '1 ml';
          route = 'subcutaneous injection';
        } else if (dosageForm.includes('cream') || dosageForm.includes('ointment') || dosageForm.includes('topical')) {
          dose = 'Apply as directed';
          route = 'topically (on skin)';
        } else if (dosageForm.includes('solution') || dosageForm.includes('suspension')) {
          dose = '5 ml';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('drop') || dosageForm.includes('ophthalmic')) {
          dose = '1 drop';
          route = 'both eyes';
        } else if (dosageForm.includes('inhaler') || dosageForm.includes('inhalation')) {
          dose = '2 puffs';
          route = 'by inhalation';
        }
        
        setSelectedDose(dose);
        setSelectedRoute(route);
        
        setNdcDosageInfo({
          dose,
          route,
          frequency: selectedFrequency,
          duration: selectedDuration,
          dosageForm: (ndcOption as any).dosageForm || 'Unknown',
          strength
        });
      }
    }
  }, [selectedNdc, searchResults, selectedFrequency, selectedDuration]);

  // Auto-calculate total quantity
  useEffect(() => {
    if (isExtractingRef.current) return;
    
    const timeoutId = setTimeout(() => {
      const doseMatch = selectedDose.match(/^(\d+(?:\.\d+)?)/);
      const doseAmount = doseMatch ? parseFloat(doseMatch[1]) : 1;
      
      const freqOption = FREQUENCY_OPTIONS.find(f => f.label === selectedFrequency);
      const timesPerDay = freqOption?.timesPerDay || 1;
      
      const durationMatch = selectedDuration.match(/(\d+)\s*days?/i);
      const days = durationMatch ? parseInt(durationMatch[1]) : 30;
      
      const dailyDose = doseAmount * timesPerDay;
      const totalQuantity = Math.ceil(dailyDose * days);
      
      setCalculatedQuantity({ totalQuantity, dailyDose, daysSupply: days });
      
      const sig = `Take ${selectedDose} ${selectedRoute} ${selectedFrequency} for ${selectedDuration}`;
      setCombinedSig(sig);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedDose, selectedRoute, selectedFrequency, selectedDuration]);

  // ============= DRUG SEARCH =============
  const handleDrugSearch = useCallback(async () => {
    if (!drugSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedNdc(null);
    
    try {
      const { baseName, extractedStrength } = normalizeDrugName(drugSearchQuery);
      const preferredStrength = processingResult?.medications?.[0]?.strength || extractedStrength || '';
      
      const { data, error } = await supabase.functions.invoke('drug-lookup', {
        body: { drugName: baseName, searchType: 'all' }
      });
      
      if (error) throw error;
      
      if (data) {
        const calculation = calculateQuantityAndDaySupply(sigInstructions || 'Take 1 tablet daily for 30 days');
        
        const ndcOptions = (data.ndc || []).map((ndc: any) => ({
          code: ndc.code,
          name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
          manufacturer: ndc.manufacturer,
          dosageForm: ndc.dosageForm,
          country: 'USA'
        }));
        
        const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
        
        if (data.isControlled) {
          clinicalRecommendations.push({
            type: 'warning',
            title: 'Controlled Substance',
            message: `Schedule ${data.schedule} controlled substance - Verify patient ID and check PDMP`
          });
        }
        
        if (data.clinicalInfo) {
          data.clinicalInfo.forEach((info: any) => {
            const recType = info.type === 'error' ? 'error' : 
                            (info.severity === 'high' ? 'warning' : 'info');
            clinicalRecommendations.push({
              type: recType as 'warning' | 'info' | 'error',
              title: info.title || undefined,
              message: info.description
            });
          });
        }
        
        if (clinicalRecommendations.length === 0) {
          clinicalRecommendations.push({
            type: 'info',
            title: 'Standard Medication',
            message: 'No specific warnings found. Follow standard prescribing guidelines.'
          });
        }
        
        const primaryNdc = data.ndc?.[0];
        
        const result: MedicationResult = {
          drugName: primaryNdc?.brandName || data.drugName || baseName,
          genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name,
          strength: preferredStrength || primaryNdc?.strength || '',
          sig: sigInstructions || 'Take 1 tablet daily for 30 days',
          calculatedQuantity: calculation.totalQuantity,
          daysSupply: calculation.daysSupply,
          dailyDose: calculation.dailyDose,
          ndc: primaryNdc?.code,
          ndcOptions,
          alternatives: (data.alternatives || []).map((alt: any) => ({
            name: alt.name,
            ndc: alt.rxcui,
            inStock: Math.random() > 0.3,
            stockQty: Math.floor(Math.random() * 500)
          })),
          clinicalRecommendations,
          isControlled: data.isControlled,
          schedule: data.schedule
        };
        
        setSearchResults(result);
        
        if (ndcOptions.length > 0) {
          setSelectedNdc(ndcOptions[0].code);
        }

        if (ndcOptions.length > 0 || (data.rxnorm && data.rxnorm.length > 0)) {
          toast.success(`Found ${ndcOptions.length} NDC codes + ${data.rxnorm?.length || 0} RxNorm entries`);
        } else {
          toast.info('No NDC/RxNorm matches; showing clinical info');
        }
      } else {
        toast.error('Drug lookup failed - empty response');
        setSearchResults(null);
      }
    } catch (err) {
      console.error('Drug search error:', err);
      toast.error('Failed to search drug database');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [drugSearchQuery, sigInstructions, calculateQuantityAndDaySupply, normalizeDrugName, processingResult]);

  // Reset medication state
  const resetMedicationState = useCallback(() => {
    setDrugSearchQuery('');
    setSigInstructions('');
    setSearchResults(null);
    setSelectedNdc(null);
    setParsedSig(null);
    setSelectedDose('1 tablet');
    setSelectedRoute('by mouth (oral)');
    setSelectedFrequency('once daily');
    setSelectedDuration('30 days');
    setNdcDosageInfo(null);
    
    sessionStorage.removeItem('docProcessing_drugQuery');
    sessionStorage.removeItem('docProcessing_sigInstructions');
    sessionStorage.removeItem('docProcessing_searchResults');
    sessionStorage.removeItem('docProcessing_selectedNdc');
    sessionStorage.removeItem('docProcessing_parsedSig');
  }, []);

  return {
    // Search State
    drugSearchQuery,
    setDrugSearchQuery,
    sigInstructions,
    setSigInstructions,
    searchResults,
    setSearchResults,
    isSearching,
    selectedNdc,
    setSelectedNdc,
    parsedSig,
    setParsedSig,
    selectedRecommendation,
    setSelectedRecommendation,
    
    // Dose/Route/Frequency/Duration
    selectedDose,
    setSelectedDose,
    selectedRoute,
    setSelectedRoute,
    selectedFrequency,
    setSelectedFrequency,
    selectedDuration,
    setSelectedDuration,
    ndcDosageInfo,
    setNdcDosageInfo,
    
    // Calculated
    calculatedQuantity,
    combinedSig,
    
    // Functions
    handleDrugSearch,
    parseSigToSelectors,
    normalizeDrugName,
    resetMedicationState,
    isExtractingRef,
    
    // Options (for UI)
    doseOptions: DOSE_OPTIONS,
    routeOptions: ROUTE_OPTIONS,
    frequencyOptions: FREQUENCY_OPTIONS,
    durationOptions: DURATION_OPTIONS,
  };
}
