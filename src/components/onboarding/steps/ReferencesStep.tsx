
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Building, CreditCard, Phone } from 'lucide-react';

interface ReferencesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ReferencesStep: React.FC<ReferencesStepProps> = ({ data, onDataChange }) => {
  const references = data.references || {
    primary_bank: { name: '', contact_name: '', phone: '' },
    primary_supplier: { name: '', contact_name: '', phone: '' },
    additional_references: []
  };

  const updateReference = (referenceType: keyof typeof references, field: string, value: string) => {
    if (referenceType === 'additional_references') return;
    
    const updatedReferences = {
      ...references,
      [referenceType]: {
        ...references[referenceType],
        [field]: value
      }
    };

    onDataChange({
      ...data,
      references: updatedReferences
    });
  };

  const addAdditionalReference = () => {
    const updatedReferences = {
      ...references,
      additional_references: [
        ...references.additional_references,
        { name: '', contact_name: '', phone: '', account_number: '' }
      ]
    };

    onDataChange({
      ...data,
      references: updatedReferences
    });
  };

  const updateAdditionalReference = (index: number, field: string, value: string) => {
    const updatedReferences = [...references.additional_references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value
    };

    onDataChange({
      ...data,
      references: {
        ...references,
        additional_references: updatedReferences
      }
    });
  };

  const removeAdditionalReference = (index: number) => {
    const updatedReferences = references.additional_references.filter((_, i) => i !== index);
    
    onDataChange({
      ...data,
      references: {
        ...references,
        additional_references: updatedReferences
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Bank Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Primary Bank Reference *</span>
          </CardTitle>
          <CardDescription>
            Your primary banking institution for reference verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank-name">Bank Name *</Label>
            <Input
              id="bank-name"
              value={references.primary_bank?.name || ''}
              onChange={(e) => updateReference('primary_bank', 'name', e.target.value)}
              placeholder="Enter bank name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank-contact">Contact Name *</Label>
              <Input
                id="bank-contact"
                value={references.primary_bank?.contact_name || ''}
                onChange={(e) => updateReference('primary_bank', 'contact_name', e.target.value)}
                placeholder="Enter contact name"
                required
              />
            </div>
            <div>
              <Label htmlFor="bank-phone">Phone Number *</Label>
              <Input
                id="bank-phone"
                type="tel"
                value={references.primary_bank?.phone || ''}
                onChange={(e) => updateReference('primary_bank', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bank-account">Account Number</Label>
            <Input
              id="bank-account"
              value={references.primary_bank?.account_number || ''}
              onChange={(e) => updateReference('primary_bank', 'account_number', e.target.value)}
              placeholder="Enter account number (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Primary Supplier Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Primary Supplier Reference *</span>
          </CardTitle>
          <CardDescription>
            Your primary supplier or vendor for trade reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="supplier-name">Supplier/Vendor Name *</Label>
            <Input
              id="supplier-name"
              value={references.primary_supplier?.name || ''}
              onChange={(e) => updateReference('primary_supplier', 'name', e.target.value)}
              placeholder="Enter supplier name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier-contact">Contact Name *</Label>
              <Input
                id="supplier-contact"
                value={references.primary_supplier?.contact_name || ''}
                onChange={(e) => updateReference('primary_supplier', 'contact_name', e.target.value)}
                placeholder="Enter contact name"
                required
              />
            </div>
            <div>
              <Label htmlFor="supplier-phone">Phone Number *</Label>
              <Input
                id="supplier-phone"
                type="tel"
                value={references.primary_supplier?.phone || ''}
                onChange={(e) => updateReference('primary_supplier', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="supplier-account">Account Number</Label>
            <Input
              id="supplier-account"
              value={references.primary_supplier?.account_number || ''}
              onChange={(e) => updateReference('primary_supplier', 'account_number', e.target.value)}
              placeholder="Enter account number (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Technology Provider Reference */}
      {!references.technology_provider ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onDataChange({
                ...data,
                references: {
                  ...references,
                  technology_provider: { name: '', contact_name: '', phone: '' }
                }
              })}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Technology Provider Reference</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Technology Provider Reference</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const updatedReferences = { ...references };
                delete updatedReferences.technology_provider;
                onDataChange({
                  ...data,
                  references: updatedReferences
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Provider Name</Label>
              <Input
                value={references.technology_provider?.name || ''}
                onChange={(e) => {
                  const updatedReferences = {
                    ...references,
                    technology_provider: {
                      ...references.technology_provider,
                      name: e.target.value
                    }
                  };
                  onDataChange({ ...data, references: updatedReferences });
                }}
                placeholder="Enter technology provider name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={references.technology_provider?.contact_name || ''}
                  onChange={(e) => {
                    const updatedReferences = {
                      ...references,
                      technology_provider: {
                        ...references.technology_provider,
                        contact_name: e.target.value
                      }
                    };
                    onDataChange({ ...data, references: updatedReferences });
                  }}
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={references.technology_provider?.phone || ''}
                  onChange={(e) => {
                    const updatedReferences = {
                      ...references,
                      technology_provider: {
                        ...references.technology_provider,
                        phone: e.target.value
                      }
                    };
                    onDataChange({ ...data, references: updatedReferences });
                  }}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Additional References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Additional References (Optional)</span>
            <Button
              type="button"
              onClick={addAdditionalReference}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Reference</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Additional trade references, suppliers, or business contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {references.additional_references.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No additional references added yet.</p>
            </div>
          ) : (
            references.additional_references.map((reference, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">Reference {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdditionalReference(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Company/Organization Name</Label>
                    <Input
                      value={reference.name}
                      onChange={(e) => updateAdditionalReference(index, 'name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Name</Label>
                      <Input
                        value={reference.contact_name}
                        onChange={(e) => updateAdditionalReference(index, 'contact_name', e.target.value)}
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={reference.phone}
                        onChange={(e) => updateAdditionalReference(index, 'phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Account Number (Optional)</Label>
                    <Input
                      value={reference.account_number || ''}
                      onChange={(e) => updateAdditionalReference(index, 'account_number', e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
