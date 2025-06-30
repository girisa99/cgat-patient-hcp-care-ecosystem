
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Users, Building, Calendar } from 'lucide-react';

interface GPOMembershipStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const GPOMembershipStep: React.FC<GPOMembershipStepProps> = ({ data, onDataChange }) => {
  const gpoMemberships = data.gpo_memberships || [];

  const addGPOMembership = () => {
    const newMembership = {
      gpo_name: '',
      membership_number: '',
      tier_level: '',
      contract_effective_date: '',
      contract_expiration_date: '',
      primary_contact_name: '',
      primary_contact_email: '',
      primary_contact_phone: '',
      covered_categories: [],
      rebate_information: {}
    };
    
    onDataChange({
      ...data,
      gpo_memberships: [...gpoMemberships, newMembership]
    });
  };

  const updateGPOMembership = (index: number, field: string, value: any) => {
    const updatedMemberships = [...gpoMemberships];
    updatedMemberships[index] = { ...updatedMemberships[index], [field]: value };
    
    onDataChange({
      ...data,
      gpo_memberships: updatedMemberships
    });
  };

  const removeGPOMembership = (index: number) => {
    const updatedMemberships = gpoMemberships.filter((_, i) => i !== index);
    onDataChange({
      ...data,
      gpo_memberships: updatedMemberships
    });
  };

  const categoryOptions = [
    'Pharmaceuticals',
    'Medical Supplies',
    'Laboratory Supplies',
    'Capital Equipment',
    'IT Services',
    'Facility Services',
    'Food Services',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* GPO Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Group Purchasing Organization (GPO) Memberships</span>
            </div>
            <button
              type="button"
              onClick={addGPOMembership}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              + Add GPO Membership
            </button>
          </CardTitle>
          <CardDescription>
            Manage your GPO memberships and contracts for group purchasing benefits
          </CardDescription>
        </CardHeader>
      </Card>

      {/* GPO Memberships List */}
      <div className="space-y-6">
        {gpoMemberships.map((membership, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>GPO Membership #{index + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeGPOMembership(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>GPO Name *</Label>
                  <Input
                    value={membership.gpo_name}
                    onChange={(e) => updateGPOMembership(index, 'gpo_name', e.target.value)}
                    placeholder="e.g., Premier, Vizient, HealthTrust"
                    required
                  />
                </div>
                <div>
                  <Label>Membership Number</Label>
                  <Input
                    value={membership.membership_number}
                    onChange={(e) => updateGPOMembership(index, 'membership_number', e.target.value)}
                    placeholder="Member ID or account number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tier Level</Label>
                  <Select
                    value={membership.tier_level}
                    onValueChange={(value) => updateGPOMembership(index, 'tier_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="premier">Premier</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contract Start Date</Label>
                  <Input
                    type="date"
                    value={membership.contract_effective_date}
                    onChange={(e) => updateGPOMembership(index, 'contract_effective_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contract End Date</Label>
                  <Input
                    type="date"
                    value={membership.contract_expiration_date}
                    onChange={(e) => updateGPOMembership(index, 'contract_expiration_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Primary Contact */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Primary Contact</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={membership.primary_contact_name}
                      onChange={(e) => updateGPOMembership(index, 'primary_contact_name', e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={membership.primary_contact_email}
                      onChange={(e) => updateGPOMembership(index, 'primary_contact_email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={membership.primary_contact_phone}
                      onChange={(e) => updateGPOMembership(index, 'primary_contact_phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Covered Categories */}
              <div className="border-t pt-4">
                <Label className="text-base font-medium">Covered Categories</Label>
                <p className="text-sm text-gray-600 mb-3">Select the categories covered by this GPO membership</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categoryOptions.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${index}-${category}`}
                        checked={membership.covered_categories?.includes(category)}
                        onCheckedChange={(checked) => {
                          const currentCategories = membership.covered_categories || [];
                          const updatedCategories = checked
                            ? [...currentCategories, category]
                            : currentCategories.filter(c => c !== category);
                          updateGPOMembership(index, 'covered_categories', updatedCategories);
                        }}
                      />
                      <Label htmlFor={`${index}-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {gpoMemberships.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No GPO Memberships</h3>
              <p className="text-gray-600 mb-4">
                Add your Group Purchasing Organization memberships to leverage group buying power
              </p>
              <button
                type="button"
                onClick={addGPOMembership}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add First GPO Membership
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
