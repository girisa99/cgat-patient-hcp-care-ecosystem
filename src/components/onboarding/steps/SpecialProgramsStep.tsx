
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Shield, Users, Building, Heart } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface SpecialProgramsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface Program340B {
  program_type: string;
  registration_number: string;
  parent_entity_name: string;
  contract_pharmacy_locations: string[];
  eligible_drug_categories: string[];
  compliance_contact_name: string;
  compliance_contact_email: string;
  compliance_contact_phone: string;
}

interface GPOMembership {
  gpo_name: string;
  membership_number: string;
  contract_effective_date: string;
  contract_expiration_date: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  covered_categories: string[];
  tier_level: string;
}

const PROGRAM_340B_TYPES = [
  { value: 'hospital', label: 'Disproportionate Share Hospital' },
  { value: 'fqhc', label: 'Federally Qualified Health Center' },
  { value: 'ryan_white', label: 'Ryan White HIV/AIDS Program' },
  { value: 'other', label: 'Other Covered Entity' }
];

const DRUG_CATEGORIES = [
  'Oncology', 'HIV/AIDS', 'Specialty Pharmacy', 'Vaccines', 'Generic Drugs', 'Brand Drugs'
];

const GPO_TIER_LEVELS = [
  { value: 'tier_1', label: 'Tier 1 - Premium' },
  { value: 'tier_2', label: 'Tier 2 - Standard' },
  { value: 'tier_3', label: 'Tier 3 - Basic' }
];

export const SpecialProgramsStep: React.FC<SpecialProgramsStepProps> = ({
  data,
  onDataChange
}) => {
  const is340bEntity = (data as any)?.is_340b_entity || false;
  const program340b = (data as any)?.program_340b || [];
  const gpoMemberships = (data as any)?.gpo_memberships_detailed || [];

  // 340B Program Management
  const toggle340BStatus = (enabled: boolean) => {
    onDataChange({
      ...data,
      is_340b_entity: enabled,
      program_340b: enabled ? program340b : []
    });
  };

  const add340BProgram = () => {
    const newProgram: Program340B = {
      program_type: 'hospital',
      registration_number: '',
      parent_entity_name: '',
      contract_pharmacy_locations: [],
      eligible_drug_categories: [],
      compliance_contact_name: '',
      compliance_contact_email: '',
      compliance_contact_phone: ''
    };

    onDataChange({
      ...data,
      program_340b: [...program340b, newProgram]
    });
  };

  const update340BProgram = (index: number, field: string, value: any) => {
    const updatedPrograms = [...program340b];
    updatedPrograms[index] = {
      ...updatedPrograms[index],
      [field]: value
    };

    onDataChange({
      ...data,
      program_340b: updatedPrograms
    });
  };

  const remove340BProgram = (index: number) => {
    const updatedPrograms = program340b.filter((_: any, i: number) => i !== index);
    onDataChange({
      ...data,
      program_340b: updatedPrograms
    });
  };

  // GPO Membership Management
  const addGPOMembership = () => {
    const newMembership: GPOMembership = {
      gpo_name: '',
      membership_number: '',
      contract_effective_date: '',
      contract_expiration_date: '',
      primary_contact_name: '',
      primary_contact_email: '',
      primary_contact_phone: '',
      covered_categories: [],
      tier_level: 'tier_2'
    };

    onDataChange({
      ...data,
      gpo_memberships_detailed: [...gpoMemberships, newMembership]
    });
  };

  const updateGPOMembership = (index: number, field: string, value: any) => {
    const updatedMemberships = [...gpoMemberships];
    updatedMemberships[index] = {
      ...updatedMemberships[index],
      [field]: value
    };

    onDataChange({
      ...data,
      gpo_memberships_detailed: updatedMemberships
    });
  };

  const removeGPOMembership = (index: number) => {
    const updatedMemberships = gpoMemberships.filter((_: any, i: number) => i !== index);
    onDataChange({
      ...data,
      gpo_memberships_detailed: updatedMemberships
    });
  };

  const toggleDrugCategory = (programIndex: number, category: string) => {
    const currentCategories = program340b[programIndex]?.eligible_drug_categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    
    update340BProgram(programIndex, 'eligible_drug_categories', updatedCategories);
  };

  const toggleGPOCategory = (membershipIndex: number, category: string) => {
    const currentCategories = gpoMemberships[membershipIndex]?.covered_categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    
    updateGPOMembership(membershipIndex, 'covered_categories', updatedCategories);
  };

  return (
    <div className="space-y-6">
      {/* 340B Program Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>340B Drug Pricing Program</span>
          </CardTitle>
          <CardDescription>
            Configure your 340B program eligibility and compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Checkbox
              id="is_340b_entity"
              checked={is340bEntity}
              onCheckedChange={toggle340BStatus}
            />
            <div>
              <Label htmlFor="is_340b_entity" className="font-medium cursor-pointer">
                We are a 340B covered entity
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Check this if your organization participates in the 340B Drug Pricing Program
              </p>
            </div>
          </div>

          {is340bEntity && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">340B Program Details</h4>
                <Button onClick={add340BProgram} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>

              {program340b.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No 340B programs configured yet.</p>
                  <p className="text-sm">Add your 340B program details.</p>
                </div>
              ) : (
                program340b.map((program: Program340B, index: number) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">340B Program {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove340BProgram(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Program Type *</Label>
                          <Select
                            value={program.program_type}
                            onValueChange={(value) => update340BProgram(index, 'program_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select program type" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRAM_340B_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>340B Registration Number *</Label>
                          <Input
                            value={program.registration_number}
                            onChange={(e) => update340BProgram(index, 'registration_number', e.target.value)}
                            placeholder="Enter 340B ID"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Parent Entity Name</Label>
                        <Input
                          value={program.parent_entity_name}
                          onChange={(e) => update340BProgram(index, 'parent_entity_name', e.target.value)}
                          placeholder="If applicable, enter parent entity name"
                        />
                      </div>

                      <div>
                        <Label>Eligible Drug Categories</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {DRUG_CATEGORIES.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`drug_${index}_${category}`}
                                checked={program.eligible_drug_categories?.includes(category) || false}
                                onCheckedChange={() => toggleDrugCategory(index, category)}
                              />
                              <Label htmlFor={`drug_${index}_${category}`} className="text-sm">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h5 className="font-medium mb-3">Compliance Contact</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Contact Name</Label>
                            <Input
                              value={program.compliance_contact_name}
                              onChange={(e) => update340BProgram(index, 'compliance_contact_name', e.target.value)}
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={program.compliance_contact_email}
                              onChange={(e) => update340BProgram(index, 'compliance_contact_email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={program.compliance_contact_phone}
                              onChange={(e) => update340BProgram(index, 'compliance_contact_phone', e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPO Memberships Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Group Purchasing Organization (GPO) Memberships</span>
            </span>
            <Button onClick={addGPOMembership} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add GPO
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your GPO memberships and contracted pricing agreements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gpoMemberships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No GPO memberships configured yet.</p>
              <p className="text-sm">Add your GPO memberships to access contracted pricing.</p>
            </div>
          ) : (
            gpoMemberships.map((membership: GPOMembership, index: number) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">GPO Membership {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGPOMembership(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>GPO Name *</Label>
                      <Input
                        value={membership.gpo_name}
                        onChange={(e) => updateGPOMembership(index, 'gpo_name', e.target.value)}
                        placeholder="Enter GPO name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Membership Number</Label>
                      <Input
                        value={membership.membership_number}
                        onChange={(e) => updateGPOMembership(index, 'membership_number', e.target.value)}
                        placeholder="Enter membership ID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Contract Effective Date</Label>
                      <Input
                        type="date"
                        value={membership.contract_effective_date}
                        onChange={(e) => updateGPOMembership(index, 'contract_effective_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Contract Expiration Date</Label>
                      <Input
                        type="date"
                        value={membership.contract_expiration_date}
                        onChange={(e) => updateGPOMembership(index, 'contract_expiration_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tier Level</Label>
                    <Select
                      value={membership.tier_level}
                      onValueChange={(value) => updateGPOMembership(index, 'tier_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier level" />
                      </SelectTrigger>
                      <SelectContent>
                        {GPO_TIER_LEVELS.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Covered Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {DRUG_CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`gpo_${index}_${category}`}
                            checked={membership.covered_categories?.includes(category) || false}
                            onCheckedChange={() => toggleGPOCategory(index, category)}
                          />
                          <Label htmlFor={`gpo_${index}_${category}`} className="text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h5 className="font-medium mb-3">Primary Contact</h5>
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
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
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
