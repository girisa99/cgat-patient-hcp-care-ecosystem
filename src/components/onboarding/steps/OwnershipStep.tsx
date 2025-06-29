
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface OwnershipStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const OwnershipStep: React.FC<OwnershipStepProps> = ({ data, onUpdate }) => {
  const updateOwnership = (field: string, value: any) => {
    onUpdate({
      ownership: {
        ...data.ownership,
        [field]: value
      }
    });
  };

  const addOwner = () => {
    const currentOwners = data.ownership?.principal_owners || [];
    updateOwnership('principal_owners', [
      ...currentOwners,
      { name: '', ownership_percentage: 0, ssn: '' }
    ]);
  };

  const updateOwner = (index: number, field: string, value: any) => {
    const currentOwners = data.ownership?.principal_owners || [];
    const updatedOwners = [...currentOwners];
    updatedOwners[index] = { ...updatedOwners[index], [field]: value };
    updateOwnership('principal_owners', updatedOwners);
  };

  const removeOwner = (index: number) => {
    const currentOwners = data.ownership?.principal_owners || [];
    updateOwnership('principal_owners', currentOwners.filter((_, i) => i !== index));
  };

  const updateControllingEntity = (field: string, value: any) => {
    onUpdate({
      ownership: {
        ...data.ownership,
        controlling_entity: {
          ...data.ownership?.controlling_entity,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Principal Owners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Principal Owners (25% or more ownership)
            <Button onClick={addOwner} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.ownership?.principal_owners?.map((owner, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Owner {index + 1}</h4>
                <Button
                  onClick={() => removeOwner(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`owner_name_${index}`}>Full Name *</Label>
                  <Input
                    id={`owner_name_${index}`}
                    value={owner.name}
                    onChange={(e) => updateOwner(index, 'name', e.target.value)}
                    placeholder="Enter owner name"
                  />
                </div>
                <div>
                  <Label htmlFor={`owner_percentage_${index}`}>Ownership % *</Label>
                  <Input
                    id={`owner_percentage_${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={owner.ownership_percentage}
                    onChange={(e) => updateOwner(index, 'ownership_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="Enter percentage"
                  />
                </div>
                <div>
                  <Label htmlFor={`owner_ssn_${index}`}>SSN (Optional)</Label>
                  <Input
                    id={`owner_ssn_${index}`}
                    value={owner.ssn || ''}
                    onChange={(e) => updateOwner(index, 'ssn', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <p>No owners added yet. Click "Add Owner" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controlling Entity */}
      <Card>
        <CardHeader>
          <CardTitle>Controlling Entity (if applicable)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="controlling_name">Entity Name</Label>
              <Input
                id="controlling_name"
                value={data.ownership?.controlling_entity?.name || ''}
                onChange={(e) => updateControllingEntity('name', e.target.value)}
                placeholder="Enter entity name"
              />
            </div>
            <div>
              <Label htmlFor="controlling_relationship">Relationship</Label>
              <Input
                id="controlling_relationship"
                value={data.ownership?.controlling_entity?.relationship || ''}
                onChange={(e) => updateControllingEntity('relationship', e.target.value)}
                placeholder="Parent company, holding company, etc."
              />
            </div>
            <div>
              <Label htmlFor="controlling_phone">Phone</Label>
              <Input
                id="controlling_phone"
                value={data.ownership?.controlling_entity?.phone || ''}
                onChange={(e) => updateControllingEntity('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="controlling_street">Address</Label>
            <Input
              id="controlling_street"
              value={data.ownership?.controlling_entity?.address?.street || ''}
              onChange={(e) => updateControllingEntity('address', {
                ...data.ownership?.controlling_entity?.address,
                street: e.target.value
              })}
              placeholder="Enter street address"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="controlling_city">City</Label>
              <Input
                id="controlling_city"
                value={data.ownership?.controlling_entity?.address?.city || ''}
                onChange={(e) => updateControllingEntity('address', {
                  ...data.ownership?.controlling_entity?.address,
                  city: e.target.value
                })}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="controlling_state">State</Label>
              <Input
                id="controlling_state"
                value={data.ownership?.controlling_entity?.address?.state || ''}
                onChange={(e) => updateControllingEntity('address', {
                  ...data.ownership?.controlling_entity?.address,
                  state: e.target.value
                })}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="controlling_zip">ZIP</Label>
              <Input
                id="controlling_zip"
                value={data.ownership?.controlling_entity?.address?.zip || ''}
                onChange={(e) => updateControllingEntity('address', {
                  ...data.ownership?.controlling_entity?.address,
                  zip: e.target.value
                })}
                placeholder="ZIP"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
