
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding, PurchasingMethod, InventoryModel } from '@/types/onboarding';

interface PurchasingPreferencesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const PURCHASING_METHODS: { value: PurchasingMethod; label: string }[] = [
  { value: 'just_in_time', label: 'Just-in-Time' },
  { value: 'bulk_ordering', label: 'Bulk Ordering' },
  { value: 'consignment', label: 'Consignment' },
  { value: 'drop_ship', label: 'Drop Ship' },
  { value: 'blanket_orders', label: 'Blanket Orders' },
];

const INVENTORY_MODELS: { value: InventoryModel; label: string }[] = [
  { value: 'traditional_wholesale', label: 'Traditional Wholesale' },
  { value: 'consignment', label: 'Consignment' },
  { value: 'vendor_managed', label: 'Vendor Managed' },
  { value: 'drop_ship_only', label: 'Drop Ship Only' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const PurchasingPreferencesStep: React.FC<PurchasingPreferencesStepProps> = ({
  data,
  onDataChange,
}) => {
  const purchasingData = data.purchasing_preferences || {
    preferred_purchasing_methods: [],
    inventory_management_model: 'traditional_wholesale' as InventoryModel,
    automated_reordering_enabled: false,
    reorder_points: {},
    preferred_order_frequency: '',
    inventory_turnover_targets: {},
    storage_capacity_details: {},
    temperature_controlled_storage: false,
    hazmat_storage_capabilities: false,
  };

  const updatePurchasingData = (updates: any) => {
    onDataChange({
      ...data,
      purchasing_preferences: {
        ...purchasingData,
        ...updates,
      },
    });
  };

  const togglePurchasingMethod = (method: PurchasingMethod) => {
    const currentMethods = purchasingData.preferred_purchasing_methods || [];
    const updatedMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    updatePurchasingData({ preferred_purchasing_methods: updatedMethods });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchasing Methods</CardTitle>
          <CardDescription>
            Select your preferred purchasing methods and inventory management approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Preferred Purchasing Methods</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {PURCHASING_METHODS.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.value}
                    checked={purchasingData.preferred_purchasing_methods?.includes(method.value)}
                    onCheckedChange={() => togglePurchasingMethod(method.value)}
                  />
                  <Label htmlFor={method.value} className="text-sm">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="inventory_model">Inventory Management Model</Label>
            <Select
              value={purchasingData.inventory_management_model}
              onValueChange={(value: InventoryModel) => updatePurchasingData({ inventory_management_model: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inventory model" />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="order_frequency">Preferred Order Frequency</Label>
            <Input
              id="order_frequency"
              value={purchasingData.preferred_order_frequency || ''}
              onChange={(e) => updatePurchasingData({ preferred_order_frequency: e.target.value })}
              placeholder="e.g., Weekly, Bi-weekly, Monthly"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory & Storage</CardTitle>
          <CardDescription>
            Configure your inventory management and storage capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="automated_reordering"
              checked={purchasingData.automated_reordering_enabled}
              onCheckedChange={(checked) => updatePurchasingData({ automated_reordering_enabled: checked })}
            />
            <Label htmlFor="automated_reordering">
              Enable Automated Reordering
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="temperature_controlled"
              checked={purchasingData.temperature_controlled_storage}
              onCheckedChange={(checked) => updatePurchasingData({ temperature_controlled_storage: checked })}
            />
            <Label htmlFor="temperature_controlled">
              Temperature-Controlled Storage Available
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hazmat_storage"
              checked={purchasingData.hazmat_storage_capabilities}
              onCheckedChange={(checked) => updatePurchasingData({ hazmat_storage_capabilities: checked })}
            />
            <Label htmlFor="hazmat_storage">
              Hazmat Storage Capabilities
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Purchasing Methods: </span>
              {purchasingData.preferred_purchasing_methods?.length > 0 ? (
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {purchasingData.preferred_purchasing_methods.map((method) => {
                    const methodLabel = PURCHASING_METHODS.find(m => m.value === method)?.label;
                    return (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {methodLabel}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">None selected</span>
              )}
            </div>
            <div>
              <span className="font-medium">Inventory Model: </span>
              <Badge variant="outline">
                {INVENTORY_MODELS.find(m => m.value === purchasingData.inventory_management_model)?.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
