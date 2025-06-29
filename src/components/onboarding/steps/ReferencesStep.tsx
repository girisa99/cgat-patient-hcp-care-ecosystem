
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface ReferencesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ReferencesStep: React.FC<ReferencesStepProps> = ({ data, onUpdate }) => {
  const updateReference = (referenceType: 'primary_bank' | 'primary_supplier' | 'technology_provider', field: string, value: string) => {
    onUpdate({
      references: {
        ...data.references,
        [referenceType]: {
          ...data.references?.[referenceType],
          [field]: value
        }
      }
    });
  };

  const addAdditionalReference = () => {
    const currentRefs = data.references?.additional_references || [];
    onUpdate({
      references: {
        ...data.references,
        additional_references: [
          ...currentRefs,
          { name: '', account_number: '', contact_name: '', phone: '' }
        ]
      }
    });
  };

  const updateAdditionalReference = (index: number, field: string, value: string) => {
    const currentRefs = data.references?.additional_references || [];
    const updatedRefs = [...currentRefs];
    updatedRefs[index] = { ...updatedRefs[index], [field]: value };
    onUpdate({
      references: {
        ...data.references,
        additional_references: updatedRefs
      }
    });
  };

  const removeAdditionalReference = (index: number) => {
    const currentRefs = data.references?.additional_references || [];
    onUpdate({
      references: {
        ...data.references,
        additional_references: currentRefs.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Bank Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Bank Reference *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                value={data.references?.primary_bank?.name || ''}
                onChange={(e) => updateReference('primary_bank', 'name', e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <Label htmlFor="bank_account">Account Number</Label>
              <Input
                id="bank_account"
                value={data.references?.primary_bank?.account_number || ''}
                onChange={(e) => updateReference('primary_bank', 'account_number', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="bank_contact">Contact Name *</Label>
              <Input
                id="bank_contact"
                value={data.references?.primary_bank?.contact_name || ''}
                onChange={(e) => updateReference('primary_bank', 'contact_name', e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="bank_phone">Phone *</Label>
              <Input
                id="bank_phone"
                value={data.references?.primary_bank?.phone || ''}
                onChange={(e) => updateReference('primary_bank', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Supplier Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Supplier Reference *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_name">Supplier Name *</Label>
              <Input
                id="supplier_name"
                value={data.references?.primary_supplier?.name || ''}
                onChange={(e) => updateReference('primary_supplier', 'name', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label htmlFor="supplier_account">Account Number</Label>
              <Input
                id="supplier_account"
                value={data.references?.primary_supplier?.account_number || ''}
                onChange={(e) => updateReference('primary_supplier', 'account_number', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="supplier_contact">Contact Name *</Label>
              <Input
                id="supplier_contact"
                value={data.references?.primary_supplier?.contact_name || ''}
                onChange={(e) => updateReference('primary_supplier', 'contact_name', e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="supplier_phone">Phone *</Label>
              <Input
                id="supplier_phone"
                value={data.references?.primary_supplier?.phone || ''}
                onChange={(e) => updateReference('primary_supplier', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Provider Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Provider Reference (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tech_name">Provider Name</Label>
              <Input
                id="tech_name"
                value={data.references?.technology_provider?.name || ''}
                onChange={(e) => updateReference('technology_provider', 'name', e.target.value)}
                placeholder="Enter provider name"
              />
            </div>
            <div>
              <Label htmlFor="tech_account">Account Number</Label>
              <Input
                id="tech_account"
                value={data.references?.technology_provider?.account_number || ''}
                onChange={(e) => updateReference('technology_provider', 'account_number', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="tech_contact">Contact Name</Label>
              <Input
                id="tech_contact"
                value={data.references?.technology_provider?.contact_name || ''}
                onChange={(e) => updateReference('technology_provider', 'contact_name', e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="tech_phone">Phone</Label>
              <Input
                id="tech_phone"
                value={data.references?.technology_provider?.phone || ''}
                onChange={(e) => updateReference('technology_provider', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Additional References
            <Button onClick={addAdditionalReference} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reference
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.references?.additional_references?.map((ref, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Reference {index + 1}</h4>
                <Button
                  onClick={() => removeAdditionalReference(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`ref_name_${index}`}>Company Name *</Label>
                  <Input
                    id={`ref_name_${index}`}
                    value={ref.name}
                    onChange={(e) => updateAdditionalReference(index, 'name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor={`ref_account_${index}`}>Account Number</Label>
                  <Input
                    id={`ref_account_${index}`}
                    value={ref.account_number || ''}
                    onChange={(e) => updateAdditionalReference(index, 'account_number', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <Label htmlFor={`ref_contact_${index}`}>Contact Name *</Label>
                  <Input
                    id={`ref_contact_${index}`}
                    value={ref.contact_name}
                    onChange={(e) => updateAdditionalReference(index, 'contact_name', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor={`ref_phone_${index}`}>Phone *</Label>
                  <Input
                    id={`ref_phone_${index}`}
                    value={ref.phone}
                    onChange={(e) => updateAdditionalReference(index, 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional references added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
