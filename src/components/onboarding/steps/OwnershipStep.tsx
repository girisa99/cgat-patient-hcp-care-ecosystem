
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface OwnershipStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const OwnershipStep: React.FC<OwnershipStepProps> = ({ data, onDataChange }) => {
  const ownership = data.ownership || {
    principal_owners: [],
    bankruptcy_history: false
  };

  const addPrincipalOwner = () => {
    const updatedOwnership = {
      ...ownership,
      principal_owners: [
        ...ownership.principal_owners,
        { name: '', title: '', ownership_percentage: 0 }
      ]
    };

    onDataChange({
      ...data,
      ownership: updatedOwnership
    });
  };

  const updatePrincipalOwner = (index: number, field: string, value: string | number) => {
    const updatedOwners = [...ownership.principal_owners];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [field]: value
    };

    onDataChange({
      ...data,
      ownership: {
        ...ownership,
        principal_owners: updatedOwners
      }
    });
  };

  const removePrincipalOwner = (index: number) => {
    const updatedOwners = ownership.principal_owners.filter((_, i) => i !== index);
    
    onDataChange({
      ...data,
      ownership: {
        ...ownership,
        principal_owners: updatedOwners
      }
    });
  };

  const updateControllingEntity = (field: string, value: string) => {
    const updatedOwnership = {
      ...ownership,
      controlling_entity: {
        ...ownership.controlling_entity,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      ownership: updatedOwnership
    });
  };

  const updateBankruptcyHistory = (checked: boolean) => {
    const updatedOwnership = {
      ...ownership,
      bankruptcy_history: checked
    };

    onDataChange({
      ...data,
      ownership: updatedOwnership
    });
  };

  const updateBankruptcyExplanation = (explanation: string) => {
    const updatedOwnership = {
      ...ownership,
      bankruptcy_explanation: explanation
    };

    onDataChange({
      ...data,
      ownership: updatedOwnership
    });
  };

  const totalPercentage = ownership.principal_owners.reduce((sum, owner) => sum + (owner.ownership_percentage || 0), 0);

  return (
    <div className="space-y-6">
      {/* Principal Owners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Principal Owners *</span>
            <Button
              type="button"
              onClick={addPrincipalOwner}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Owner</span>
            </Button>
          </CardTitle>
          <CardDescription>
            List all individuals or entities with 20% or more ownership interest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ownership.principal_owners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No principal owners added yet. Click "Add Owner" to get started.</p>
            </div>
          ) : (
            <>
              {ownership.principal_owners.map((owner, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Owner {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrincipalOwner(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={owner.name}
                          onChange={(e) => updatePrincipalOwner(index, 'name', e.target.value)}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={owner.title}
                          onChange={(e) => updatePrincipalOwner(index, 'title', e.target.value)}
                          placeholder="Enter title"
                          required
                        />
                      </div>
                      <div>
                        <Label>Ownership Percentage *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={owner.ownership_percentage}
                          onChange={(e) => updatePrincipalOwner(index, 'ownership_percentage', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Ownership Percentage Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Ownership Percentage:</span>
                  <span className={`font-bold ${totalPercentage !== 100 ? 'text-orange-600' : 'text-green-600'}`}>
                    {totalPercentage.toFixed(2)}%
                  </span>
                </div>
                {totalPercentage !== 100 && (
                  <div className="mt-2 flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Total ownership should equal 100%</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Controlling Entity */}
      <Card>
        <CardHeader>
          <CardTitle>Controlling Entity (If Applicable)</CardTitle>
          <CardDescription>
            Information about any parent company or controlling entity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Entity Name</Label>
              <Input
                value={ownership.controlling_entity?.name || ''}
                onChange={(e) => updateControllingEntity('name', e.target.value)}
                placeholder="Enter entity name"
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input
                value={ownership.controlling_entity?.relationship || ''}
                onChange={(e) => updateControllingEntity('relationship', e.target.value)}
                placeholder="e.g., Parent Company, Holding Company"
              />
            </div>
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={ownership.controlling_entity?.phone || ''}
              onChange={(e) => updateControllingEntity('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <div className="grid grid-cols-1 gap-2">
              <Input
                value={ownership.controlling_entity?.address?.street || ''}
                onChange={(e) => updateControllingEntity('street', e.target.value)}
                placeholder="Street Address"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={ownership.controlling_entity?.address?.city || ''}
                  onChange={(e) => updateControllingEntity('city', e.target.value)}
                  placeholder="City"
                />
                <Input
                  value={ownership.controlling_entity?.address?.state || ''}
                  onChange={(e) => updateControllingEntity('state', e.target.value)}
                  placeholder="State"
                />
                <Input
                  value={ownership.controlling_entity?.address?.zip || ''}
                  onChange={(e) => updateControllingEntity('zip', e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Bankruptcy History */}
      <Card>
        <CardHeader>
          <CardTitle>Financial History</CardTitle>
          <CardDescription>
            Disclosure of any bankruptcy or financial difficulties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bankruptcy-history"
              checked={ownership.bankruptcy_history}
              onCheckedChange={updateBankruptcyHistory}
            />
            <Label htmlFor="bankruptcy-history" className="text-sm">
              Has your organization or any principal owner filed for bankruptcy in the past 7 years?
            </Label>
          </div>
          
          {ownership.bankruptcy_history && (
            <div className="mt-4">
              <Label htmlFor="bankruptcy-explanation">Bankruptcy Explanation *</Label>
              <Textarea
                id="bankruptcy-explanation"
                value={ownership.bankruptcy_explanation || ''}
                onChange={(e) => updateBankruptcyExplanation(e.target.value)}
                placeholder="Please provide details about the bankruptcy filing, including dates, circumstances, and current financial status..."
                rows={4}
                required
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
