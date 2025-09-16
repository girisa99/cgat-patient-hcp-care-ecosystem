import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

interface PatientInformationData {
  // Basic Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  preferredLanguage: 'english' | 'spanish' | 'other';
  otherLanguage?: string;
  gender: 'male' | 'female' | 'other';
  otherGender?: string;
  
  // Contact Information
  email: string;
  homePhone?: string;
  cellPhone: string;
  
  // Address Information
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Alternative Contact
  alternateContactName?: string;
  alternateContactRelationship?: string;
  alternateContactPhone?: string;
  doNotContactPatient?: boolean;
}

interface PatientInformationSectionProps {
  data: PatientInformationData;
  onChange: (data: Partial<PatientInformationData>) => void;
  onSave: () => void;
  isLoading?: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild',
  'Friend', 'Guardian', 'Power of Attorney', 'Other'
];

export const PatientInformationSection: React.FC<PatientInformationSectionProps> = ({
  data,
  onChange,
  onSave,
  isLoading = false
}) => {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    onChange({ [field]: formatted });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patient Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete patient demographics and contact information
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={data.middleName || ''}
                onChange={(e) => onChange({ middleName: e.target.value })}
                placeholder="Enter middle name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onChange({ dateOfBirth: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={data.gender} onValueChange={(value: any) => onChange({ gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {data.gender === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherGender">Specify Gender</Label>
                <Input
                  id="otherGender"
                  value={data.otherGender || ''}
                  onChange={(e) => onChange({ otherGender: e.target.value })}
                  placeholder="Please specify"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language *</Label>
              <Select 
                value={data.preferredLanguage} 
                onValueChange={(value: any) => onChange({ preferredLanguage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {data.preferredLanguage === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherLanguage">Specify Language</Label>
                <Input
                  id="otherLanguage"
                  value={data.otherLanguage || ''}
                  onChange={(e) => onChange({ otherLanguage: e.target.value })}
                  placeholder="Please specify language"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="patient@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homePhone">Home Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="homePhone"
                  value={data.homePhone || ''}
                  onChange={(e) => handlePhoneChange('homePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cellPhone">Cell Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cellPhone"
                  value={data.cellPhone}
                  onChange={(e) => handlePhoneChange('cellPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => onChange({ address: e.target.value })}
                placeholder="123 Main Street"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apartment">Apt/Unit</Label>
              <Input
                id="apartment"
                value={data.apartment || ''}
                onChange={(e) => onChange({ apartment: e.target.value })}
                placeholder="Apt 1A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Enter city"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={data.state} onValueChange={(value) => onChange({ state: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                value={data.zipCode}
                onChange={(e) => onChange({ zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
          </div>
        </div>

        {/* Alternative Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alternative Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alternateContactName">Alternative Contact Name</Label>
              <Input
                id="alternateContactName"
                value={data.alternateContactName || ''}
                onChange={(e) => onChange({ alternateContactName: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alternateContactRelationship">Relationship</Label>
              <Select 
                value={data.alternateContactRelationship || ''} 
                onValueChange={(value) => onChange({ alternateContactRelationship: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map(relationship => (
                    <SelectItem key={relationship} value={relationship.toLowerCase()}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alternateContactPhone">Alternative Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="alternateContactPhone"
                  value={data.alternateContactPhone || ''}
                  onChange={(e) => handlePhoneChange('alternateContactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="doNotContactPatient"
              checked={data.doNotContactPatient || false}
              onCheckedChange={(checked) => onChange({ doNotContactPatient: !!checked })}
            />
            <Label htmlFor="doNotContactPatient" className="text-sm font-medium">
              Do not contact patient directly (use alternative contact only)
            </Label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export type { PatientInformationData };