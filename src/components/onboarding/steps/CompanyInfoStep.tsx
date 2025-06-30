
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Globe, FileText } from 'lucide-react';

interface CompanyInfoStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

export const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({ data, onDataChange }) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({
      company_info: {
        ...data.company_info,
        [field]: value,
      },
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    onDataChange({
      company_info: {
        ...data.company_info,
        legal_address: {
          ...data.company_info?.legal_address,
          [field]: value,
        },
      },
    });
  };

  const handleDistributorChange = (distributor: string, checked: boolean) => {
    const currentDistributors = data.selected_distributors || [];
    const updatedDistributors = checked
      ? [...currentDistributors, distributor as any]
      : currentDistributors.filter(d => d !== distributor);
    
    onDataChange({
      selected_distributors: updatedDistributors,
    });
  };

  return (
    <div className="space-y-6">
      {/* Distributor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Preferred Healthcare Distributors</span>
          </CardTitle>
          <CardDescription>
            Select the healthcare distributors you would like to work with (select all that apply)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'amerisource_bergen', label: 'AmerisourceBergen', description: 'Leading pharmaceutical distributor' },
              { value: 'cardinal_health', label: 'Cardinal Health', description: 'Healthcare services and products' },
              { value: 'mckesson', label: 'McKesson', description: 'Healthcare supply chain management' }
            ].map((distributor) => (
              <div key={distributor.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={distributor.value}
                  checked={data.selected_distributors?.includes(distributor.value as any) || false}
                  onCheckedChange={(checked) => handleDistributorChange(distributor.value, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={distributor.value} className="font-medium cursor-pointer">
                    {distributor.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{distributor.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {data.selected_distributors && data.selected_distributors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm font-medium">Selected:</span>
              {data.selected_distributors.map((dist) => (
                <Badge key={dist} variant="secondary">
                  {dist.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>
            Provide your company's basic information and legal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legal_name">Legal Company Name *</Label>
              <Input
                id="legal_name"
                value={data.company_info?.legal_name || ''}
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                placeholder="Enter your legal business name"
                required
              />
            </div>
            <div>
              <Label htmlFor="dba_name">DBA Name (if different)</Label>
              <Input
                id="dba_name"
                value={data.company_info?.dba_name || ''}
                onChange={(e) => handleInputChange('dba_name', e.target.value)}
                placeholder="Doing Business As name"
              />
            </div>
            <div>
              <Label htmlFor="website" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={data.company_info?.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
              />
            </div>
            <div>
              <Label htmlFor="federal_tax_id">Federal Tax ID (EIN) *</Label>
              <Input
                id="federal_tax_id"
                value={data.company_info?.federal_tax_id || ''}
                onChange={(e) => handleInputChange('federal_tax_id', e.target.value)}
                placeholder="XX-XXXXXXX"
                pattern="[0-9]{2}-[0-9]{7}"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Legal Business Address</span>
          </CardTitle>
          <CardDescription>
            Provide your company's legal business address as registered with the state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.company_info?.legal_address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Main Street, Suite 100"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.company_info?.legal_address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={data.company_info?.legal_address?.state || ''}
                onValueChange={(value) => handleAddressChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={data.company_info?.legal_address?.zip || ''}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                placeholder="12345"
                pattern="[0-9]{5}(-[0-9]{4})?"
                required
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Checkbox
              id="same_as_legal"
              checked={data.company_info?.same_as_legal_address || false}
              onCheckedChange={(checked) => handleInputChange('same_as_legal_address', checked)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="same_as_legal" className="font-medium cursor-pointer">
                Use this address for billing and shipping
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Check this if your billing and shipping addresses are the same as your legal address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
