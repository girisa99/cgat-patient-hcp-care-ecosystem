/**
 * INTEGRATED THERAPY & SERVICE SELECTOR
 * Combines data generation with real-time therapy/service selection
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TherapyDataGenerator } from '@/components/data-generation/TherapyDataGenerator';
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

export const TherapyServiceSelector: React.FC<TherapyServiceSelectorProps> = ({
  selectedTherapies,
  onTherapySelectionChange,
  facility_id
}) => {
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [commercialProducts, setCommercialProducts] = useState<CommercialProduct[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapyId, setSelectedTherapyId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
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

      // Fetch manufacturers
      const { data: manufacturerData, error: manufacturerError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (manufacturerError) throw manufacturerError;

      setTherapies(therapyData as Therapy[] || []);
      setProducts(productData as Product[] || []);
      setCommercialProducts(commercialData as CommercialProduct[] || []);
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

  const handleTherapySelect = (therapy: Therapy) => {
    if (!Array.isArray(selectedTherapies)) {
      console.error('selectedTherapies is not an array:', selectedTherapies);
      return;
    }
    
    const existingIndex = selectedTherapies.findIndex(s => s.therapy_id === therapy.id);
    
    if (existingIndex >= 0) {
      // Remove if already selected
      const updated = selectedTherapies.filter(s => s.therapy_id !== therapy.id);
      onTherapySelectionChange(updated);
    } else {
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
      <Tabs defaultValue="select" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Select Therapies</TabsTrigger>
          <TabsTrigger value="generate">Generate New Data</TabsTrigger>
        </TabsList>

        {/* Therapy Selection Tab */}
        <TabsContent value="select" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Available Therapies & Products</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select therapies and associated products with complete commercial information
              </p>
            </CardHeader>
            <CardContent>
              {therapies.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Therapies Available</h3>
                  <p className="text-gray-500 mb-4">
                    Generate therapy data first using the "Generate New Data" tab.
                  </p>
                </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {therapies.map((therapy) => {
                     const isSelected = Array.isArray(selectedTherapies) && selectedTherapies.some(s => s.therapy_id === therapy.id);
                     const therapyProducts = getProductsForTherapy(therapy.id);
                    
                    return (
                      <Card 
                        key={therapy.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleTherapySelect(therapy)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium">{therapy.name}</h4>
                            {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                          </div>
                          
                          <Badge variant="outline" className="mb-2">
                            {THERAPY_TYPES[therapy.therapy_type]}
                          </Badge>
                          
                          {therapy.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {therapy.description}
                            </p>
                          )}
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Building className="h-4 w-4 mr-2" />
                              <span>{therapyProducts.length} products available</span>
                            </div>
                            
                            {therapy.indication && (
                              <div className="flex items-center text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{therapy.indication}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
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
                  const selectedProduct = products.find(p => p.id === selection.product_id);
                  const commercialProduct = selectedProduct ? getCommercialProductForProduct(selectedProduct.id) : undefined;
                  const manufacturer = selectedProduct ? getManufacturerForProduct(selectedProduct) : undefined;

                  return (
                    <Card key={selection.therapy_id} className="p-4">
                      <h4 className="font-medium mb-4">{therapy?.name}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Selection */}
                        <div className="space-y-2">
                          <Label>Select Product</Label>
                          <Select 
                            value={selection.product_id} 
                            onValueChange={(value) => updateTherapySelection(selection.therapy_id, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {therapyProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    {product.brand_name && (
                                      <span className="text-sm text-muted-foreground">Brand: {product.brand_name}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Priority Level */}
                        <div className="space-y-2">
                          <Label>Priority Level</Label>
                          <Select 
                            value={selection.priority_level} 
                            onValueChange={(value) => updateTherapySelection(selection.therapy_id, 'priority_level', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Generation Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Generate Therapy & Product Data</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use AI to generate comprehensive therapy data including products, manufacturers, and commercial information
              </p>
            </CardHeader>
            <CardContent>
              <TherapyDataGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};