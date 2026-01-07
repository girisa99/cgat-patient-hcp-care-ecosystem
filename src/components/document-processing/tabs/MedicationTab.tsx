/**
 * MedicationTab Component
 * Handles drug search, NDC lookup, SIG parsing, and clinical recommendations
 * Data flows: Document Extraction → Auto-populate → User Edit → Save
 * Enhanced with FDA-powered drug name suggestions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Package,
  Brain,
  Activity,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Shield,
  Eye,
  Loader2,
  Save,
  FileText,
  Bot,
  Edit3,
  ChevronDown,
  ArrowDown,
  Pill
} from 'lucide-react';
import { toast } from 'sonner';
import { AgentFindingsDisplay } from '../AgentFindingsDisplay';
import { supabase } from '@/integrations/supabase/client';

// Drug suggestion interface for autocomplete
interface DrugSuggestion {
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
}

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: string;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: any[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  lineItems?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string;
}

// Multi-medication search results structure
interface MultiMedicationResults {
  [medicationName: string]: SearchResults;
}

interface SearchResults {
  drugName: string;
  genericName?: string;
  strength?: string;
  calculatedQuantity: number;
  daysSupply: number;
  dailyDose: number;
  isControlled?: boolean;
  schedule?: string;
  ndcOptions: { code: string; name: string; manufacturer: string; dosageForm?: string }[];
  clinicalRecommendations?: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[];
  alternatives?: { name: string; ndc: string; inStock: boolean; stockQty: number }[];
}

interface CalculatedQuantity {
  totalQuantity: number;
  dailyDose: number;
  daysSupply: number;
}

interface NdcDosageInfo {
  dosageForm: string;
  strength?: string;
}

interface AgentFindingResult {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: Record<string, any>;
  confidence: number;
  executionTimeMs: number;
  timestamp: string;
  alerts?: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
}

interface MedicationTabProps {
  processingResult: ProcessingResult | null;
  drugSearchQuery: string;
  setDrugSearchQuery: (query: string) => void;
  handleDrugSearch: () => void;
  isSearching: boolean;
  searchResults: SearchResults | null;
  // Multi-medication search results (keyed by medication name)
  multiMedicationResults?: MultiMedicationResults;
  selectedNdc: string;
  setSelectedNdc: (ndc: string) => void;
  // Multi-medication NDC selections (keyed by medication name)
  multiSelectedNdcs?: { [medName: string]: string };
  setMultiSelectedNdc?: (medName: string, ndc: string) => void;
  selectedDose: string;
  setSelectedDose: (dose: string) => void;
  selectedRoute: string;
  setSelectedRoute: (route: string) => void;
  selectedFrequency: string;
  setSelectedFrequency: (frequency: string) => void;
  selectedDuration: string;
  setSelectedDuration: (duration: string) => void;
  calculatedQuantity: CalculatedQuantity | null;
  ndcDosageInfo: NdcDosageInfo | null;
  doseOptions: string[];
  routeOptions: { value: string; label: string }[];
  frequencyOptions: { value: string; label: string; timesPerDay: number }[];
  durationOptions: string[];
  setSelectedRecommendation: (rec: { title: string; message: string; type: string } | null) => void;
  agentFindings?: AgentFindingResult[];
  // New props for saving medication data
  onSaveMedicationData?: () => Promise<void>;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  // Track if data has been confirmed in SmartDocumentStudio
  isDataConfirmed?: boolean;
  // Pending medication data waiting for confirmation
  hasPendingData?: boolean;
}

export default function MedicationTab({
  processingResult,
  drugSearchQuery,
  setDrugSearchQuery,
  handleDrugSearch,
  isSearching,
  searchResults,
  multiMedicationResults = {},
  selectedNdc,
  setSelectedNdc,
  multiSelectedNdcs = {},
  setMultiSelectedNdc,
  selectedDose,
  setSelectedDose,
  selectedRoute,
  setSelectedRoute,
  selectedFrequency,
  setSelectedFrequency,
  selectedDuration,
  setSelectedDuration,
  calculatedQuantity,
  ndcDosageInfo,
  doseOptions,
  routeOptions,
  frequencyOptions,
  durationOptions,
  setSelectedRecommendation,
  agentFindings = [],
  onSaveMedicationData,
  isSaving = false,
  hasUnsavedChanges = false,
  isDataConfirmed = false,
  hasPendingData = false
}: MedicationTabProps) {
  // Track which medication is currently selected for detailed view
  const [activeMedicationIndex, setActiveMedicationIndex] = useState(0);
  // State for drug suggestions autocomplete
  const [drugSuggestions, setDrugSuggestions] = useState<DrugSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionTimeoutRef, setSuggestionTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll state
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Fetch drug suggestions from FDA/RxNorm as user types
  const fetchDrugSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDrugSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('drug-lookup', {
        body: { drugName: query, searchType: 'suggestions' }
      });
      
      if (!error && data?.suggestions) {
        setDrugSuggestions(data.suggestions.slice(0, 8));
        setShowSuggestions(data.suggestions.length > 0);
      } else {
        setDrugSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching drug suggestions:', err);
      setDrugSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);
  
  // Debounced suggestion fetch
  const handleQueryChange = useCallback((value: string) => {
    setDrugSearchQuery(value);
    
    if (suggestionTimeoutRef) {
      clearTimeout(suggestionTimeoutRef);
    }
    
    const timeout = setTimeout(() => {
      fetchDrugSuggestions(value);
    }, 300);
    
    setSuggestionTimeoutRef(timeout);
  }, [setDrugSearchQuery, fetchDrugSuggestions, suggestionTimeoutRef]);
  
  // Select a suggestion
  const selectSuggestion = useCallback((suggestion: DrugSuggestion) => {
    const fullName = suggestion.strength 
      ? `${suggestion.name} ${suggestion.strength}` 
      : suggestion.name;
    setDrugSearchQuery(fullName);
    setShowSuggestions(false);
    setDrugSuggestions([]);
    // Trigger search with the selected drug
    setTimeout(() => handleDrugSearch(), 100);
  }, [setDrugSearchQuery, handleDrugSearch]);
  
  // Handle scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, []);
  
  // Check scroll position to show/hide scroll button
  useEffect(() => {
    const checkScroll = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
        }
      }
    };
    
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollContainer.removeEventListener('scroll', checkScroll);
    }
  }, []);
  
  // Helper to get icon based on recommendation type
  const getRecommendationIcon = (rec: { title?: string; message: string; type: string }) => {
    if (rec.title?.toLowerCase().includes('contraindication') || rec.message.toLowerCase().includes('contraindication'))
      return XCircle;
    if (rec.title?.toLowerCase().includes('dose') || rec.message.toLowerCase().includes('dose'))
      return AlertTriangle;
    if (rec.title?.toLowerCase().includes('interaction') || rec.message.toLowerCase().includes('interaction'))
      return Activity;
    if (rec.title?.toLowerCase().includes('controlled') || rec.message.toLowerCase().includes('controlled'))
      return Shield;
    if (rec.title?.toLowerCase().includes('monitor') || rec.message.toLowerCase().includes('monitor'))
      return Activity;
    if (rec.type === 'error') return XCircle;
    if (rec.type === 'warning') return AlertTriangle;
    return Sparkles;
  };

  // Helper to get display title
  const getDisplayTitle = (rec: { title?: string; message: string }) => {
    if (rec.title) return rec.title;
    const msg = rec.message.toLowerCase();
    if (msg.includes('dose')) return 'Dosage Guidance';
    if (msg.includes('interaction')) return 'Drug Interaction';
    if (msg.includes('contraindication')) return 'Contraindication';
    if (msg.includes('controlled')) return 'Controlled Substance';
    if (msg.includes('monitor')) return 'Clinical Monitoring';
    return 'Clinical Note';
  };

  // Check if data came from extraction
  const hasExtractedData = processingResult?.medications && processingResult.medications.length > 0;
  const hasAgentData = agentFindings && agentFindings.length > 0;

  return (
    <div className="space-y-4">
      {/* Pending Confirmation Banner - Show when data extracted but not yet confirmed */}
      {hasPendingData && !isDataConfirmed && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-950/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Medication Data Pending Confirmation
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Document has been extracted but not yet verified. Data will populate here after you review and confirm in the <strong>Upload & Process</strong> tab.
                </p>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Workflow:</strong> Upload → Review & Edit → Confirm & Save → Data flows here → Agents process
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Indicator Banner */}
      {(hasExtractedData || searchResults || hasAgentData) && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                {hasExtractedData && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-200">
                      From Document Extraction
                    </Badge>
                  </div>
                )}
                {searchResults && (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 border-green-200">
                      Drug Search: {searchResults.drugName}
                    </Badge>
                  </div>
                )}
                {hasAgentData && (
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950 border-purple-200">
                      {agentFindings.length} Agent Result{agentFindings.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Save Button */}
              {onSaveMedicationData && (searchResults || hasAgentData) && (
                <Button 
                  onClick={onSaveMedicationData} 
                  disabled={isSaving}
                  size="sm"
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Medication Data'}
                  {hasUnsavedChanges && !isSaving && (
                    <Badge variant="secondary" className="ml-1 text-xs">Modified</Badge>
                  )}
                </Button>
              )}
            </div>
            
            {/* Info text about editing */}
            <p className="text-xs text-muted-foreground mt-2">
              <Edit3 className="h-3 w-3 inline mr-1" />
              Edit drug search, SIG details, and NDC selection below. Changes are saved when you click "Save Medication Data".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Multi-Medication Summary Panel - Shows ALL medications from prescription */}
      {processingResult?.medications && processingResult.medications.length > 1 && (
        <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-blue-600" />
              Multiple Medications Detected ({processingResult.medications.length})
            </CardTitle>
            <CardDescription>
              This prescription contains multiple medications. Agent analysis covers all drugs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {processingResult.medications.map((med: any, index: number) => {
                const medName = med.medication_name || med.name || `Medication ${index + 1}`;
                const strength = med.strength || '';
                const sig = med.sig || med.directions || '';
                const quantity = med.quantity || '';
                
                return (
                  <div 
                    key={index}
                    className="p-3 bg-background rounded-lg border border-blue-200 dark:border-blue-800 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => {
                      setDrugSearchQuery(medName);
                      toast.info(`Selected ${medName} for lookup`);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            #{index + 1}
                          </Badge>
                          <p className="font-medium text-sm truncate">{medName}</p>
                        </div>
                        {strength && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {strength}
                          </Badge>
                        )}
                        {sig && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            Sig: {sig}
                          </p>
                        )}
                        {quantity && (
                          <p className="text-xs text-muted-foreground">
                            Qty: {quantity}
                          </p>
                        )}
                      </div>
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click any medication to search for NDC codes and clinical information. Agent results below analyze all medications together.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prescription Image Preview for Verification */}
      {processingResult?.imageUrl && processingResult.stage === 'complete' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-primary" />
              Prescription Document (Verification)
            </CardTitle>
            <CardDescription>
              Original document for verification against extracted data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 border rounded-lg overflow-hidden bg-white">
                <img 
                  src={processingResult.imageUrl} 
                  alt="Uploaded prescription" 
                  className="max-h-64 w-auto object-contain"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{processingResult.fileName}</Badge>
                  <Badge className="bg-green-500">Processed</Badge>
                  {processingResult.medications && processingResult.medications.length > 1 && (
                    <Badge variant="secondary">
                      {processingResult.medications.length} Medications
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Compare extracted data with the original document to verify accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Show primary medication or first from array */}
                  {(processingResult.medications?.[0]?.medication_name || processingResult.extractedFields['medication']?.value) && (
                    <Badge variant="secondary">
                      Medication: {processingResult.medications?.[0]?.medication_name || processingResult.extractedFields['medication'].value}
                      {processingResult.medications && processingResult.medications.length > 1 && 
                        ` (+${processingResult.medications.length - 1} more)`
                      }
                    </Badge>
                  )}
                  {processingResult.extractedFields['patient_name']?.value && (
                    <Badge variant="secondary">
                      Patient: {processingResult.extractedFields['patient_name'].value}
                    </Badge>
                  )}
                  {processingResult.extractedFields['prescriber_name']?.value && (
                    <Badge variant="secondary">
                      Prescriber: {processingResult.extractedFields['prescriber_name'].value}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Execution Results - Dynamic component that works for ANY document type */}
      {agentFindings && agentFindings.length > 0 && (
        <AgentFindingsDisplay 
          agentFindings={agentFindings}
          title="Agent Execution Results"
        />
      )}
      
      {/* Multi-Medication Results Section - When we have multiple medications with lookup results */}
      {processingResult?.medications && processingResult.medications.length > 1 && Object.keys(multiMedicationResults).length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Multi-Medication Lookup Results ({Object.keys(multiMedicationResults).length} drugs)
                </CardTitle>
                <CardDescription>
                  All medications from this prescription have been looked up. Select a medication to view details.
                </CardDescription>
              </div>
            </div>
            
            {/* Medication Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.keys(multiMedicationResults).map((medName, index) => {
                const result = multiMedicationResults[medName];
                const isActive = activeMedicationIndex === index;
                return (
                  <Button
                    key={medName}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setActiveMedicationIndex(index)}
                  >
                    <span className="text-xs font-bold">#{index + 1}</span>
                    <span className="truncate max-w-[150px]">{medName}</span>
                    {result?.isControlled && (
                      <Badge variant="destructive" className="text-[10px] px-1">C{result.schedule}</Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Active Medication Details */}
            {(() => {
              const medNames = Object.keys(multiMedicationResults);
              const activeMedName = medNames[activeMedicationIndex] || medNames[0];
              const activeResult = multiMedicationResults[activeMedName];
              const activeNdc = multiSelectedNdcs?.[activeMedName] || '';
              
              if (!activeResult) return null;
              
              return (
                <div className="space-y-6">
                  {/* Drug Info Summary */}
                  <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{activeResult.drugName}</p>
                        <p className="text-sm text-muted-foreground">{activeResult.genericName}</p>
                        {activeResult.strength && (
                          <Badge variant="secondary" className="mt-1">{activeResult.strength}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {activeResult.isControlled && (
                          <Badge variant="destructive">Schedule {activeResult.schedule}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Medication #{activeMedicationIndex + 1}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-2xl font-bold text-primary">{activeResult.calculatedQuantity}</p>
                        <p className="text-xs text-muted-foreground">Total Quantity</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-2xl font-bold text-primary">{activeResult.daysSupply}</p>
                        <p className="text-xs text-muted-foreground">Days Supply</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-2xl font-bold text-primary">{activeResult.dailyDose}</p>
                        <p className="text-xs text-muted-foreground">Daily Dose</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* NDC Codes for Active Medication */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Package className="h-4 w-4" />
                          NDC Codes - {activeMedName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activeResult.ndcOptions && activeResult.ndcOptions.length > 0 ? (
                          <ScrollArea className="h-48 border rounded-lg">
                            <div className="p-2 space-y-1">
                              {activeResult.ndcOptions.map((option, i) => (
                                <div 
                                  key={i} 
                                  className={`flex items-center justify-between p-3 rounded cursor-pointer border-b last:border-0 transition-colors ${
                                    activeNdc === option.code 
                                      ? 'bg-primary/10 border-primary' 
                                      : 'hover:bg-muted'
                                  }`}
                                  onClick={() => {
                                    if (setMultiSelectedNdc) {
                                      setMultiSelectedNdc(activeMedName, option.code);
                                    }
                                    toast.success(`Selected NDC for ${activeMedName}: ${option.code}`);
                                  }}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{option.name}</p>
                                    <p className="text-xs text-muted-foreground">{option.manufacturer}</p>
                                    {option.dosageForm && (
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {option.dosageForm}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right flex items-center gap-2">
                                    {activeNdc === option.code && (
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                    <Badge className={activeNdc === option.code ? 'bg-primary' : 'bg-blue-600'}>
                                      {option.code}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <p className="text-sm">No NDC codes found</p>
                          </div>
                        )}
                        {activeNdc && (
                          <div className="mt-3 p-2 bg-muted rounded-lg">
                            <p className="text-xs font-medium">Selected NDC</p>
                            <p className="text-sm font-bold text-primary">{activeNdc}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Clinical Recommendations for Active Medication */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Brain className="h-4 w-4" />
                          Clinical Info - {activeMedName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activeResult.clinicalRecommendations && activeResult.clinicalRecommendations.length > 0 ? (
                          <ScrollArea className="h-48">
                            <div className="space-y-2">
                              {activeResult.clinicalRecommendations.map((rec, i) => {
                                const IconComponent = getRecommendationIcon(rec);
                                const displayTitle = getDisplayTitle(rec);
                                return (
                                  <div 
                                    key={i} 
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                      rec.type === 'error' ? 'bg-destructive/10 border-destructive/30' : 
                                      rec.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300' : 
                                      'bg-muted/50'
                                    } border`}
                                    onClick={() => setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type })}
                                  >
                                    <div className="flex items-start gap-2">
                                      <IconComponent className={`h-4 w-4 mt-0.5 shrink-0 ${
                                        rec.type === 'error' ? 'text-destructive' : 
                                        rec.type === 'warning' ? 'text-amber-600' : 
                                        'text-muted-foreground'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{displayTitle}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{rec.message}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
                            <p className="text-sm">No clinical alerts</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Alternatives for Active Medication */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4" />
                        Alternatives & Inventory - {activeMedName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeResult.alternatives && activeResult.alternatives.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {activeResult.alternatives.slice(0, 6).map((alt, i) => (
                            <div 
                              key={i} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => {
                                toast.info(`Alternative: ${alt.name}`, {
                                  description: `RxCUI: ${alt.ndc} | ${alt.inStock ? `${alt.stockQty} in stock` : 'Out of stock'}`
                                });
                              }}
                            >
                              <p className="font-medium text-sm truncate">{alt.name}</p>
                              <p className="text-xs text-muted-foreground">RxCUI: {alt.ndc}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-[10px]">Same molecule</Badge>
                                {alt.inStock ? (
                                  <Badge className="bg-green-600 text-white text-[10px]">
                                    {alt.stockQty} in stock
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-[10px]">Out</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No alternatives found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* All Medications Quick Summary */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        All Medications Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(multiMedicationResults).map(([medName, result], idx) => (
                          <div 
                            key={medName}
                            className={`p-2 rounded border text-sm ${
                              idx === activeMedicationIndex ? 'border-primary bg-primary/5' : 'bg-background'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{medName}</span>
                              <div className="flex items-center gap-1">
                                {multiSelectedNdcs?.[medName] ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-muted-foreground" />
                                )}
                                {result?.isControlled && (
                                  <Badge variant="destructive" className="text-[8px] px-1">C{result.schedule}</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {result?.ndcOptions?.length || 0} NDCs | {result?.alternatives?.length || 0} alternatives
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
      
      {/* Single Medication Grid Layout - Original layout when single medication or no multi-results */}
      {(!processingResult?.medications || processingResult.medications.length <= 1 || Object.keys(multiMedicationResults).length === 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drug Search with Autocomplete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Drug Search & Calculation
              </CardTitle>
              <CardDescription>
                Search drug name and enter sig to auto-calculate quantity & day supply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Drug Name
                  {drugSuggestions.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      FDA/RxNorm suggestions available
                    </Badge>
                  )}
                </Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        ref={inputRef}
                        placeholder="e.g., Metformin, Lisinopril, Atorvastatin..." 
                        value={drugSearchQuery}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowSuggestions(false);
                            handleDrugSearch();
                          }
                          if (e.key === 'Escape') {
                            setShowSuggestions(false);
                          }
                        }}
                        onFocus={() => drugSuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="pr-8"
                      />
                      {isLoadingSuggestions && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleDrugSearch} disabled={isSearching}>
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Drug Suggestions Dropdown */}
                  {showSuggestions && drugSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-1">
                        <p className="px-2 py-1 text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          Select a medication from FDA/RxNorm
                        </p>
                        {drugSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.name}-${index}`}
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-start gap-2 transition-colors"
                            onClick={() => selectSuggestion(suggestion)}
                            type="button"
                          >
                            <Pill className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{suggestion.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {suggestion.genericName && suggestion.genericName !== suggestion.name && (
                                  <span>Generic: {suggestion.genericName}</span>
                                )}
                                {suggestion.strength && (
                                  <Badge variant="outline" className="text-[10px] h-4">
                                    {suggestion.strength}
                                  </Badge>
                                )}
                                {suggestion.dosageForm && (
                                  <span className="text-muted-foreground/70">{suggestion.dosageForm}</span>
                                )}
                              </div>
                              {suggestion.manufacturer && (
                                <p className="text-[10px] text-muted-foreground/60 truncate">
                                  Mfg: {suggestion.manufacturer}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {!drugSearchQuery && processingResult?.extractedFields?.['medication']?.value && (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary cursor-pointer hover:underline" onClick={() => {
                      setDrugSearchQuery(processingResult.extractedFields['medication'].value);
                      setTimeout(handleDrugSearch, 100);
                    }}>
                      Use extracted: "{processingResult.extractedFields['medication'].value}"
                    </span>
                  </p>
                )}
              </div>

              {/* Separate Dropdowns for Dose, Route, Frequency, Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Dose</Label>
                  <Select value={selectedDose} onValueChange={setSelectedDose}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select dose" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {doseOptions.map((dose) => (
                        <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Route</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {routeOptions.map((route) => (
                        <SelectItem key={route.value} value={route.label}>{route.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Frequency</Label>
                  <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {frequencyOptions.map((freq) => (
                        <SelectItem key={freq.value} value={freq.label}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Duration</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {durationOptions.map((dur) => (
                        <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sig / Instructions - Read-only Summary with Calculated Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Sig / Instructions (Generated)
                </Label>
                <div className="p-3 bg-primary/5 border border-primary/30 rounded-lg space-y-3">
                  <p className="text-sm text-primary font-medium">
                    Take {selectedDose} {selectedRoute} {selectedFrequency} for {selectedDuration}
                  </p>
                  
                  {/* Calculated Quantity Display */}
                  {calculatedQuantity && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/20">
                      <div className="text-center p-2 bg-background/50 rounded">
                        <p className="text-xl font-bold text-green-600">{calculatedQuantity.totalQuantity}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Total Tablets</p>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded">
                        <p className="text-xl font-bold text-blue-600">{calculatedQuantity.dailyDose}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Per Day</p>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded">
                        <p className="text-xl font-bold text-purple-600">{calculatedQuantity.daysSupply}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Days Supply</p>
                      </div>
                    </div>
                  )}
                  
                  {ndcDosageInfo && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{ndcDosageInfo.dosageForm}</Badge>
                      {ndcDosageInfo.strength && (
                        <Badge variant="secondary" className="text-xs">{ndcDosageInfo.strength}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Quantity auto-calculated: {selectedDose.match(/^(\d+)/)?.[1] || 1} × {frequencyOptions.find(f => f.label === selectedFrequency)?.timesPerDay || 1} times/day × {selectedDuration.match(/(\d+)/)?.[1] || 30} days
                </p>
              </div>

              {searchResults && (
                <Card className="bg-muted/50 border-border">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{searchResults.drugName}</p>
                        <p className="text-sm text-muted-foreground">{searchResults.genericName}</p>
                      </div>
                      {searchResults.isControlled && (
                        <Badge variant="destructive">Schedule {searchResults.schedule}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-3xl font-bold text-primary">{searchResults.calculatedQuantity}</p>
                        <p className="text-xs text-muted-foreground">Total Quantity</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-3xl font-bold text-primary">{searchResults.daysSupply}</p>
                        <p className="text-xs text-muted-foreground">Days Supply</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-3xl font-bold text-primary">{searchResults.dailyDose}</p>
                        <p className="text-xs text-muted-foreground">Daily Dose</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                NDC Codes (USA)
              </CardTitle>
              <CardDescription>
                Select an NDC to view clinical recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults ? (
                <div className="space-y-2">
                  {searchResults.ndcOptions.length > 0 ? (
                    <ScrollArea className="h-48 border rounded-lg">
                      <div className="p-2 space-y-1">
                        {searchResults.ndcOptions.map((option, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center justify-between p-3 rounded cursor-pointer border-b last:border-0 transition-colors ${
                              selectedNdc === option.code 
                                ? 'bg-primary/10 border-primary' 
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              setSelectedNdc(option.code);
                              toast.success(`Selected NDC: ${option.code}`);
                            }}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{option.name}</p>
                              <p className="text-xs text-muted-foreground">{option.manufacturer}</p>
                              {option.dosageForm && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {option.dosageForm}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right flex items-center gap-2">
                              {selectedNdc === option.code && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                              <Badge className={selectedNdc === option.code ? 'bg-primary' : 'bg-blue-600'}>
                                {option.code}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No NDC codes found for this drug</p>
                      <p className="text-xs">Try a different spelling or generic name</p>
                    </div>
                  )}
                  {selectedNdc && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Selected NDC</p>
                      <p className="text-lg font-bold text-primary">{selectedNdc}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search for a drug to see NDC codes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Clinical Recommendations
                {selectedNdc && (
                  <Badge variant="outline" className="ml-2">NDC: {selectedNdc}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedNdc 
                  ? 'Clinical insights for selected NDC from OpenFDA and RxNorm' 
                  : 'Select an NDC code above to view specific recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!searchResults ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search for a drug to see clinical recommendations</p>
                  <p className="text-xs mt-2">Powered by OpenFDA & RxNorm APIs</p>
                </div>
              ) : !selectedNdc ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an NDC code to view clinical recommendations</p>
                  <p className="text-xs mt-2">Click on any NDC code in the list above</p>
                </div>
              ) : searchResults?.clinicalRecommendations && searchResults.clinicalRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.clinicalRecommendations.map((rec, i) => {
                    const IconComponent = getRecommendationIcon(rec);
                    const displayTitle = getDisplayTitle(rec);
                    const bgColor = rec.type === 'error' ? 'bg-destructive' : 
                                     rec.type === 'warning' ? 'bg-zinc-900 dark:bg-zinc-800' : 
                                     'bg-muted';
                    const textColor = rec.type === 'error' || rec.type === 'warning' ? 'text-white' : 'text-foreground';
                    
                    return (
                      <div 
                        key={i} 
                        className={`rounded-xl p-4 ${bgColor} ${textColor} relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                        onClick={() => setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type })}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                            RECOMMENDATION
                          </span>
                          <IconComponent className="h-5 w-5 opacity-60" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{displayTitle}</h3>
                        <p className="text-sm opacity-90 leading-relaxed line-clamp-3">{rec.message}</p>
                        <Button 
                          variant="link" 
                          className={`p-0 h-auto mt-3 ${textColor} opacity-70 hover:opacity-100`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type });
                          }}
                        >
                          Read more
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <p>No specific clinical alerts for this medication</p>
                  <p className="text-xs mt-2">Follow standard prescribing guidelines</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternatives */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Drug Alternatives & Inventory
              </CardTitle>
              <CardDescription>
                Alternative medications based on molecule/compound from RxNorm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults?.alternatives && searchResults.alternatives.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.alternatives.map((alt, i) => (
                      <div 
                        key={i} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          toast.info(`Alternative: ${alt.name}`, {
                            description: `RxCUI: ${alt.ndc} | ${alt.inStock ? `${alt.stockQty} in stock` : 'Out of stock'}`
                          });
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{alt.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">RxCUI: {alt.ndc}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Same molecule
                              </Badge>
                              {searchResults.isControlled && (
                                <Badge variant="secondary" className="text-xs">
                                  Schedule {searchResults.schedule}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-2">
                            {alt.inStock ? (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                {alt.stockQty} in stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Out of stock</Badge>
                            )}
                            <Button size="sm" variant="outline" className="text-xs">
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      These alternatives share the same active ingredient and therapeutic class as {searchResults.genericName || searchResults.drugName}.
                      Always verify clinical appropriateness before substitution.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Alternative medications will appear after drug search</p>
                  <p className="text-xs mt-2">Data sourced from RxNorm related drugs API</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
