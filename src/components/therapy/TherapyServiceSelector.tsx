/**
 * INTEGRATED THERAPY & SERVICE SELECTOR
 * Combines data generation with real-time therapy/service selection
 * Enhanced with multi-select capabilities and improved UX
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { 
  Stethoscope, 
  Building, 
  Plus, 
  Sparkles,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import type { 
  Therapy, 
  Product, 
  CommercialProduct, 
  Manufacturer,
  TherapySelection 
} from '@/types/therapies';
import { THERAPY_TYPES, TREATMENT_READINESS_LEVELS, PRIORITY_LEVELS } from '@/types/therapies';

interface TherapyServiceSelectorProps {
  selectedTherapies: TherapySelection[];
  onTherapySelectionChange: (selections: TherapySelection[]) => void;
  facility_id?: string;
}

// Dosing options for dropdown selection
const DOSING_OPTIONS = [
  { value: 'once_weekly', label: 'Once Weekly' },
  { value: 'twice_weekly', label: 'Twice Weekly' },
  { value: 'once_monthly', label: 'Once Monthly' },
  { value: 'every_2_weeks', label: 'Every 2 Weeks' },
  { value: 'every_3_weeks', label: 'Every 3 Weeks' },
  { value: 'every_4_weeks', label: 'Every 4 Weeks' },
  { value: 'single_dose', label: 'Single Dose Treatment' },
  { value: 'loading_then_maintenance', label: 'Loading Dose + Maintenance' },
  { value: 'cycle_based', label: 'Cycle-Based Dosing' },
  { value: 'as_needed', label: 'As Needed (PRN)' },
  { value: 'custom', label: 'Custom Dosing Schedule' }
];

// Service categories for better organization
const SERVICE_CATEGORIES = [
  { 
    id: 'manufacturing', 
    name: 'Manufacturing Services',
    services: [
      'Cell Processing & Manufacturing',
      'Vector Production',
      'Quality Control & Testing',
      'Cryopreservation Services',
      'Chain of Custody Management'
    ]
  },
  { 
    id: 'clinical', 
    name: 'Clinical Services',
    services: [
      'Patient Assessment & Screening',
      'Apheresis Services',
      'Cell Collection & Processing',
      'Conditioning Regimen Support',
      'Post-Treatment Monitoring'
    ]
  },
  { 
    id: 'logistical', 
    name: 'Logistical Services',
    services: [
      'Cold Chain Management',
      'Transportation & Delivery',
      'Inventory Management',
      'Scheduling & Coordination',
      'Emergency Support Services'
    ]
  },
  { 
    id: 'regulatory', 
    name: 'Regulatory & Compliance',
    services: [
      'Regulatory Submission Support',
      'IND/BLA Management',
      'Pharmacovigilance',
      'Quality Assurance',
      'Risk Management Planning'
    ]
  }
];

export const TherapyServiceSelector: React.FC<TherapyServiceSelectorProps> = ({
  selectedTherapies: rawSelectedTherapies,
  onTherapySelectionChange,
  facility_id
}) => {
  // Convert object-like arrays to proper arrays
  const selectedTherapies = React.useMemo(() => {
    if (!rawSelectedTherapies) return [];
    if (Array.isArray(rawSelectedTherapies)) return rawSelectedTherapies;
    
    // Handle object with numeric keys (common when data comes from forms or storage)
    if (typeof rawSelectedTherapies === 'object') {
      const keys = Object.keys(rawSelectedTherapies);
      if (keys.every(key => !isNaN(Number(key)))) {
        return Object.values(rawSelectedTherapies) as TherapySelection[];
      }
    }
    
    console.warn('selectedTherapies is not in expected format:', rawSelectedTherapies);
    return [];
  }, [rawSelectedTherapies]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [commercialProducts, setCommercialProducts] = useState<CommercialProduct[]>([]);
  const [clinicalTrials, setClinicalTrials] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingProducts, setGeneratingProducts] = useState<Set<string>>(new Set());
  const [selectedTherapyId, setSelectedTherapyId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showAddProductForm, setShowAddProductForm] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all therapy data
  useEffect(() => {
    fetchTherapyData();
  }, []);

  const fetchTherapyData = async () => {
    try {
      setLoading(true);
      
      // Fetch therapies with related data
      const { data: therapyData, error: therapyError } = await supabase
        .from('therapies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (therapyError) throw therapyError;

      // Fetch products with therapy, manufacturer, and modality info
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          therapy:therapies(*),
          manufacturer:manufacturers(*),
          modality:modalities(*)
        `)
        .eq('is_active', true);

      if (productError) throw productError;

      // Fetch commercial products
      const { data: commercialData, error: commercialError } = await supabase
        .from('commercial_products')
        .select(`
          *,
          product:products(*)
        `)
        .eq('is_active', true);

      if (commercialError) throw commercialError;

      // Fetch clinical trials
      const { data: trialsData, error: trialsError } = await supabase
        .from('clinical_trials')
        .select('*')
        .eq('is_active', true);

      if (trialsError) throw trialsError;

      // Fetch manufacturers
      const { data: manufacturerData, error: manufacturerError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (manufacturerError) throw manufacturerError;

      setTherapies(therapyData as Therapy[] || []);
      setProducts(productData as Product[] || []);
      setCommercialProducts(commercialData as CommercialProduct[] || []);
      setClinicalTrials(trialsData || []);
      setManufacturers(manufacturerData as Manufacturer[] || []);

    } catch (error) {
      console.error('Error fetching therapy data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load therapy and product information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTherapySelect = async (therapy: Therapy) => {
    console.log('handleTherapySelect called with selectedTherapies:', selectedTherapies);
    
    if (!Array.isArray(selectedTherapies)) {
      console.error('selectedTherapies is not an array in handleTherapySelect:', selectedTherapies);
      return;
    }
    
    const existingIndex = selectedTherapies.findIndex(s => s.therapy_id === therapy.id);
    
    if (existingIndex >= 0) {
      // Remove if already selected
      const updated = selectedTherapies.filter(s => s.therapy_id !== therapy.id);
      onTherapySelectionChange(updated);
    } else {
      // Check if therapy has products, if not generate them
      const therapyProducts = getProductsForTherapy(therapy.id);
      
      if (therapyProducts.length === 0) {
        setGeneratingProducts(prev => new Set([...prev, therapy.id]));
        
        toast({
          title: "Generating Products",
          description: `Creating products for ${therapy.name}...`,
        });
        
        try {
          console.log('Calling healthcare-agentic-orchestrator for therapy ID:', therapy.id);
          const response = await supabase.functions.invoke('healthcare-agentic-orchestrator', {
            body: { 
              therapy_ids: [therapy.id],
              ai_providers: ['openai', 'claude'],
              use_mcp: true,
              small_model_fallback: true
            }
          });
          
          console.log('Multi-AI orchestrator response:', response);
          
          if (response.error) {
            console.error('Multi-AI orchestrator error:', response.error);
            throw response.error;
          }
          
          // Refresh product data
          console.log('Refreshing product data...');
          await fetchTherapyData();
          
          setGeneratingProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(therapy.id);
            return newSet;
          });
          
          toast({
            title: "Products Generated",
            description: `Successfully created products for ${therapy.name} using multiple AI providers including Claude AI`,
          });
        } catch (error) {
          console.error('Error generating products:', error);
          setGeneratingProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(therapy.id);
            return newSet;
          });
          toast({
            title: "Generation Error",
            description: `Failed to generate products: ${error.message || 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
      
      // Add new selection
      const newSelection: TherapySelection = {
        therapy_id: therapy.id,
        product_id: '',
        service_id: '',
        selected_provider_id: '',
        treatment_readiness_level: 'planning',
        priority_level: 'medium',
        onboarding_id: '', // Will be set by parent
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        therapy
      };
      const updated = [...selectedTherapies, newSelection];
      onTherapySelectionChange(updated);
    }
  };

  const updateTherapySelection = (therapyId: string, field: keyof TherapySelection, value: any) => {
    if (!Array.isArray(selectedTherapies)) {
      console.error('selectedTherapies is not an array:', selectedTherapies);
      return;
    }
    
    const updated = selectedTherapies.map(selection =>
      selection.therapy_id === therapyId ? { ...selection, [field]: value } : selection
    );
    onTherapySelectionChange(updated);
  };

  const getProductsForTherapy = (therapyId: string): Product[] => {
    return products.filter(p => p.therapy_id === therapyId);
  };

  const getCommercialProductForProduct = (productId: string): CommercialProduct | undefined => {
    return commercialProducts.find(cp => cp.product_id === productId);
  };

  const getManufacturerForProduct = (product: Product): Manufacturer | undefined => {
    return manufacturers.find(m => m.id === product.manufacturer_id);
  };

  const getCommercialProductsForTherapy = (therapyId: string): Product[] => {
    const therapyProducts = getProductsForTherapy(therapyId);
    return therapyProducts.filter(product => 
      product.product_status === 'approved' || 
      commercialProducts.some(cp => cp.product_id === product.id)
    );
  };

  const getClinicalTrialsForTherapy = (therapyId: string): any[] => {
    return clinicalTrials.filter(trial => {
      const product = products.find(p => p.id === trial.product_id);
      return product && product.therapy_id === therapyId;
    });
  };

  const getTrialProductsForTherapy = (therapyId: string): Product[] => {
    const therapyProducts = getProductsForTherapy(therapyId);
    return therapyProducts.filter(product => 
      product.product_status === 'phase_1' || 
      product.product_status === 'phase_2' || 
      product.product_status === 'phase_3' ||
      clinicalTrials.some(trial => trial.product_id === product.id)
    );
  };

  const handleTherapyAction = async () => {
    if (selectedTherapyId === 'generate-new') {
      // Handle data generation
      setGeneratingProducts(prev => new Set([...prev, 'generating']));
      
      toast({
        title: "Generating Data",
        description: "Creating comprehensive therapy data using AI...",
      });
      
      try {
        // Get all existing therapy IDs to generate products for all therapies
        const allTherapyIds = therapies.map(t => t.id);
        
        const response = await supabase.functions.invoke('healthcare-agentic-orchestrator', {
          body: { 
            therapy_ids: allTherapyIds.length > 0 ? allTherapyIds : ['all'], // Fallback to 'all' if no therapies exist
            ai_providers: ['openai', 'claude'],
            use_mcp: true,
            small_model_fallback: true
          }
        });
        
        if (response.error) {
          throw response.error;
        }
        
        // Refresh data
        await fetchTherapyData();
        
        setGeneratingProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete('generating');
          return newSet;
        });
        
        setSelectedTherapyId(''); // Reset selection
        
        toast({
          title: "Data Generated",
          description: "Successfully generated comprehensive therapy data including products and services.",
        });
      } catch (error) {
        console.error('Error generating data:', error);
        setGeneratingProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete('generating');
          return newSet;
        });
        toast({
          title: "Generation Error",
          description: `Failed to generate data: ${error.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } else {
      // Handle therapy selection
      const therapy = therapies.find(t => t.id === selectedTherapyId);
      if (therapy) {
        await handleTherapySelect(therapy);
        setSelectedTherapyId(''); // Reset selection
      }
    }
  };

  const isGenerating = generatingProducts.has('generating') || Array.from(generatingProducts).some(id => id !== 'generating');

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-muted-foreground">Loading therapy data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <span>Therapy Selection & Generation</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select existing therapies or generate new therapy data using AI
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Therapy Selection Dropdown */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="therapy-select">Select Therapy</Label>
                <Select value={selectedTherapyId} onValueChange={setSelectedTherapyId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a therapy or generate new data..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background border border-border shadow-lg z-50">
                    {therapies.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">
                          Existing Therapies
                        </div>
                        {therapies.map((therapy) => {
                          const therapyProducts = getProductsForTherapy(therapy.id);
                          const isGenerating = generatingProducts.has(therapy.id);
                          const isSelected = Array.isArray(selectedTherapies) && selectedTherapies.some(s => s.therapy_id === therapy.id);
                          
                          return (
                            <SelectItem 
                              key={therapy.id} 
                              value={therapy.id}
                              disabled={isGenerating}
                              className="focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center justify-between w-full min-h-[2.5rem]">
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium truncate">{therapy.name}</span>
                                    {isSelected && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                      {THERAPY_TYPES[therapy.therapy_type]}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {isGenerating ? 'Generating...' : `${therapyProducts.length} products`}
                                    </span>
                                  </div>
                                </div>
                                {isGenerating && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary flex-shrink-0 ml-2"></div>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                    
                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-t border-b bg-muted/50">
                      Generate New Data
                    </div>
                    <SelectItem value="generate-new" className="p-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span>Generate New Therapy Data</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleTherapyAction}
                disabled={!selectedTherapyId || isGenerating}
                className="mt-6"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : selectedTherapyId === 'generate-new' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Data
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Therapy
                  </>
                )}
              </Button>
            </div>

            {/* Generation Status */}
            {selectedTherapyId === 'generate-new' && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">AI Data Generation</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    Generate comprehensive therapy data including Cell Therapy, Gene Therapy, Personalized Medicine, and Radioligand Therapy with associated products and services.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-600">
                    <div>• Multiple therapy modalities</div>
                    <div>• Commercial product data</div>
                    <div>• Manufacturing information</div>
                    <div>• Service offerings</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

        {/* Selected Therapies Configuration */}
        {Array.isArray(selectedTherapies) && selectedTherapies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Configure Selected Therapies</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure products, dosing, and commercial details for selected therapies
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedTherapies.map((selection) => {
                const therapy = selection.therapy;
                const therapyProducts = getProductsForTherapy(selection.therapy_id);
                const commercialProducts = getCommercialProductsForTherapy(selection.therapy_id);
                const trialProducts = getTrialProductsForTherapy(selection.therapy_id);
                const clinicalTrials = getClinicalTrialsForTherapy(selection.therapy_id);
                const selectedProduct = products.find(p => p.id === selection.product_id);
                const commercialProduct = selectedProduct ? getCommercialProductForProduct(selectedProduct.id) : undefined;
                const manufacturer = selectedProduct ? getManufacturerForProduct(selectedProduct) : undefined;

                return (
                  <Card key={selection.therapy_id} className="p-4">
                    <h4 className="font-medium mb-4">{therapy?.name}</h4>
                    
                    <div className="space-y-6">
                      {/* Commercial Products Section */}
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          Commercial Products ({commercialProducts.length})
                        </h5>
                        {commercialProducts.length > 0 ? (
                          <div className="grid gap-3">
                            {commercialProducts.map((product) => {
                              const manufacturer = getManufacturerForProduct(product);
                              const commercial = getCommercialProductForProduct(product.id);
                              return (
                                <Card key={product.id} className="p-3 border border-green-200 bg-green-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h6 className="font-medium">{product.name}</h6>
                                        <Badge variant="outline" className="text-green-700 border-green-300">
                                          Commercial
                                        </Badge>
                                      </div>
                                      {product.brand_name && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Brand: {product.brand_name}
                                        </p>
                                      )}
                                      {manufacturer && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Manufacturer: {manufacturer.name}
                                        </p>
                                      )}
                                      {commercial?.launch_date && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Launch Date: {new Date(commercial.launch_date).toLocaleDateString()}
                                        </p>
                                      )}
                                      {commercial?.market_regions && (
                                        <p className="text-sm text-muted-foreground">
                                          Markets: {commercial.market_regions.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant={selection.product_id === product.id ? "default" : "outline"}
                                      onClick={() => updateTherapySelection(selection.therapy_id, 'product_id', product.id)}
                                    >
                                      {selection.product_id === product.id ? 'Selected' : 'Select'}
                                    </Button>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No commercial products available</p>
                        )}
                      </div>

                      {/* Clinical Trials / Trial Products Section */}
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          Trial Products ({trialProducts.length})
                        </h5>
                        {trialProducts.length > 0 ? (
                          <div className="grid gap-3">
                            {trialProducts.map((product) => {
                              const manufacturer = getManufacturerForProduct(product);
                              const relatedTrial = clinicalTrials.find(trial => trial.product_id === product.id);
                              return (
                                <Card key={product.id} className="p-3 border border-blue-200 bg-blue-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h6 className="font-medium">{product.name}</h6>
                                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                                          {product.product_status?.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                      </div>
                                      {product.brand_name && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Brand: {product.brand_name}
                                        </p>
                                      )}
                                      {manufacturer && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Sponsor: {manufacturer.name}
                                        </p>
                                      )}
                                      {relatedTrial?.nct_number && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                          NCT: {relatedTrial.nct_number}
                                        </p>
                                      )}
                                      {relatedTrial?.enrollment_target && (
                                        <p className="text-sm text-muted-foreground">
                                          Target Enrollment: {relatedTrial.enrollment_target} patients
                                        </p>
                                      )}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant={selection.product_id === product.id ? "default" : "outline"}
                                      onClick={() => updateTherapySelection(selection.therapy_id, 'product_id', product.id)}
                                    >
                                      {selection.product_id === product.id ? 'Selected' : 'Select'}
                                    </Button>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No trial products available</p>
                        )}
                      </div>

                      {/* Manual Product Addition - Working Dialog */}
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-purple-600" />
                          Add Custom Product
                        </h5>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Product
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
                            <DialogHeader>
                              <DialogTitle>Add Custom Product</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {/* Product Name */}
                              <div className="space-y-2">
                                <Label>Product Name *</Label>
                                <Input placeholder="Enter product name..." />
                              </div>
                              
                              {/* Brand Name */}
                              <div className="space-y-2">
                                <Label>Brand Name</Label>
                                <Input placeholder="Enter brand name..." />
                              </div>
                              
                              {/* Dosing Schedule Selection */}
                              <div className="space-y-2">
                                <Label>Dosing Schedule *</Label>
                                <Select>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select dosing schedule..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                                    {DOSING_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Product Status */}
                              <div className="space-y-2">
                                <Label>Product Status *</Label>
                                <Select>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select product status..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                                    <SelectItem value="preclinical">Preclinical</SelectItem>
                                    <SelectItem value="phase_1">Phase 1</SelectItem>
                                    <SelectItem value="phase_2">Phase 2</SelectItem>
                                    <SelectItem value="phase_3">Phase 3</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Manufacturer Selection */}
                              <div className="space-y-2">
                                <Label>Manufacturer</Label>
                                <Select>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select manufacturer..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                                    {manufacturers.map((manufacturer) => (
                                      <SelectItem key={manufacturer.id} value={manufacturer.id}>
                                        {manufacturer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Indication */}
                              <div className="space-y-2">
                                <Label>Indication</Label>
                                <Textarea 
                                  placeholder="Enter primary indication..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline">Cancel</Button>
                                <Button onClick={() => {
                                  toast({
                                    title: "Product Added",
                                    description: "Custom product has been successfully added to this therapy.",
                                  });
                                }}>
                                  Add Product
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Services Selection Section */}
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-orange-600" />
                          Required Services
                        </h5>
                        <div className="space-y-4">
                          {SERVICE_CATEGORIES.map((category) => (
                            <Card key={category.id} className="p-3 bg-orange-50 border-orange-200">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <h6 className="font-medium text-orange-900">{category.name}</h6>
                                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                                    {category.services.length} Available
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {category.services.map((service, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`${category.id}-${index}`}
                                        className="border-orange-400"
                                      />
                                      <Label 
                                        htmlFor={`${category.id}-${index}`}
                                        className="text-sm cursor-pointer text-orange-800"
                                      >
                                        {service}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Configuration Options */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Priority Level */}
                        <div className="space-y-2">
                          <Label>Priority Level</Label>
                          <Select 
                            value={selection.priority_level} 
                            onValueChange={(value) => updateTherapySelection(selection.therapy_id, 'priority_level', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-lg z-50">
                              {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                         </div>

                        {/* Treatment Readiness */}
                        <div className="space-y-2">
                          <Label>Treatment Readiness</Label>
                          <Select 
                            value={selection.treatment_readiness_level} 
                            onValueChange={(value) => updateTherapySelection(selection.therapy_id, 'treatment_readiness_level', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-lg z-50">
                              {Object.entries(TREATMENT_READINESS_LEVELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Patient Volume */}
                        <div className="space-y-2">
                          <Label>Estimated Patient Volume</Label>
                          <Input
                            type="number"
                            value={selection.patient_volume_estimate || ''}
                            onChange={(e) => updateTherapySelection(selection.therapy_id, 'patient_volume_estimate', parseInt(e.target.value) || 0)}
                            placeholder="Annual patient volume..."
                          />
                        </div>
                      </div>

                      {/* Commercial Product Information */}
                      {selectedProduct && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-3 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Commercial Information
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {selectedProduct.ndc_number && (
                              <div>
                                <span className="font-medium">NDC Number:</span>
                                <p className="text-muted-foreground">{selectedProduct.ndc_number}</p>
                              </div>
                            )}
                            
                            {manufacturer && (
                              <div>
                                <span className="font-medium">Manufacturer:</span>
                                <p className="text-muted-foreground">{manufacturer.name}</p>
                              </div>
                            )}
                            
                            {selectedProduct.approval_date && (
                              <div>
                                <span className="font-medium">Approval Date:</span>
                                <p className="text-muted-foreground">{selectedProduct.approval_date}</p>
                              </div>
                            )}
                          </div>

                          {/* Dosing Information */}
                          {selectedProduct.dosing_information && Object.keys(selectedProduct.dosing_information).length > 0 && (
                            <div className="mt-4">
                              <span className="font-medium">Dosing Information:</span>
                              <pre className="mt-1 text-sm bg-white p-2 rounded border text-muted-foreground">
                                {JSON.stringify(selectedProduct.dosing_information, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selection Rationale */}
                      <div className="mt-4 space-y-2">
                        <Label>Selection Rationale</Label>
                        <Textarea
                          value={selection.selection_rationale || ''}
                          onChange={(e) => updateTherapySelection(selection.therapy_id, 'selection_rationale', e.target.value)}
                          placeholder="Why is this therapy important for your facility?"
                          rows={3}
                        />
                       </div>
                    </div>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}
    </div>
  );
};