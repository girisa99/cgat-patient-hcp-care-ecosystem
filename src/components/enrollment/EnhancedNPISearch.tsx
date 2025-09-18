/**
 * Enhanced NPI Search Component
 * Supports searching by NPI number, provider name, or organization name
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, User, HashIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNPIVerification } from '@/hooks/useNPIVerification';
import { useToast } from '@/hooks/use-toast';

interface EnhancedNPISearchProps {
  onVerificationComplete?: (data: any) => void;
  onAutoFill?: (data: any) => void;
  enrollmentId?: string;
  facilityId?: string;
}

export const EnhancedNPISearch: React.FC<EnhancedNPISearchProps> = ({
  onVerificationComplete,
  onAutoFill,
  enrollmentId,
  facilityId
}) => {
  const [searchType, setSearchType] = useState<'npi' | 'name' | 'organization'>('npi');
  const [searchData, setSearchData] = useState({
    npi: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const { verifyCredentials, isVerifying, validateNPIFormat } = useNPIVerification();
  const { toast } = useToast();

  const handleSearch = async () => {
    try {
      let verificationData: any = {
        enrollmentId,
        facilityId,
        providerType: searchType === 'organization' ? 'organization' : 'individual'
      };

      if (searchType === 'npi') {
        if (!searchData.npi) {
          toast({
            title: "NPI Required",
            description: "Please enter an NPI number to search.",
            variant: "destructive"
          });
          return;
        }
        
        const validation = validateNPIFormat(searchData.npi);
        if (!validation.isValid) {
          toast({
            title: "Invalid NPI",
            description: validation.error,
            variant: "destructive"
          });
          return;
        }
        
        verificationData.npi = searchData.npi;
      } else {
        // Name-based search
        verificationData.providerSearch = {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          organizationName: searchData.organizationName,
          city: searchData.city,
          state: searchData.state,
          postalCode: searchData.postalCode
        };
      }

      const result = await verifyCredentials(verificationData);
      setVerificationResult(result);

      if (result.isValid) {
        // Auto-fill form data if available
        if (onAutoFill && result.npiData) {
          const autoFillData = {
            provider_name: result.npiData.basic?.name || 
                          `${result.npiData.basic?.first_name} ${result.npiData.basic?.last_name}`,
            provider_npi: result.npiData.number,
            treatment_center: result.npiData.addresses?.[0]?.organization_name || 
                           result.npiData.basic?.organization_name,
            provider_address: result.npiData.addresses?.[0]?.address_1,
            provider_city: result.npiData.addresses?.[0]?.city,
            provider_state: result.npiData.addresses?.[0]?.state,
            provider_zip: result.npiData.addresses?.[0]?.postal_code,
            provider_phone: result.npiData.addresses?.[0]?.telephone_number
          };
          
          onAutoFill(autoFillData);
          
          toast({
            title: "Provider Information Auto-filled",
            description: "Form has been populated with verified provider data.",
          });
        }

        onVerificationComplete?.(result);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to verify provider information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderSearchFields = () => {
    switch (searchType) {
      case 'npi':
        return (
          <div className="space-y-2">
            <Label htmlFor="npi">NPI Number</Label>
            <Input
              id="npi"
              placeholder="Enter 10-digit NPI number"
              value={searchData.npi}
              onChange={(e) => setSearchData(prev => ({ ...prev, npi: e.target.value }))}
              maxLength={10}
            />
          </div>
        );
      
      case 'name':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Provider first name"
                value={searchData.firstName}
                onChange={(e) => setSearchData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Provider last name"
                value={searchData.lastName}
                onChange={(e) => setSearchData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                placeholder="City"
                value={searchData.city}
                onChange={(e) => setSearchData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State (Optional)</Label>
              <Input
                id="state"
                placeholder="State"
                value={searchData.state}
                onChange={(e) => setSearchData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
        );
      
      case 'organization':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                placeholder="Treatment center or organization name"
                value={searchData.organizationName}
                onChange={(e) => setSearchData(prev => ({ ...prev, organizationName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={searchData.city}
                  onChange={(e) => setSearchData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={searchData.state}
                  onChange={(e) => setSearchData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP Code</Label>
                <Input
                  id="postalCode"
                  placeholder="ZIP"
                  value={searchData.postalCode}
                  onChange={(e) => setSearchData(prev => ({ ...prev, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Enhanced NPI & Provider Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search by NPI number, provider name, or organization name for automatic verification and form auto-fill
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Type Selection */}
        <div className="space-y-2">
          <Label>Search Method</Label>
          <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="npi">
                <div className="flex items-center gap-2">
                  <HashIcon className="h-4 w-4" />
                  NPI Number
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Provider Name
                </div>
              </SelectItem>
              <SelectItem value="organization">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Name
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Fields */}
        {renderSearchFields()}

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search & Verify
            </>
          )}
        </Button>

        {/* Verification Result */}
        {verificationResult && (
          <Card className={verificationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {verificationResult.isValid ? 'Verification Successful' : 'Verification Failed'}
                </span>
                <Badge variant={verificationResult.isValid ? 'default' : 'destructive'}>
                  {verificationResult.verificationStatus}
                </Badge>
              </div>

              {verificationResult.isValid && verificationResult.npiData && (
                <div className="space-y-2 text-sm">
                  <div><strong>NPI:</strong> {verificationResult.npiData.number}</div>
                  <div><strong>Name:</strong> {verificationResult.npiData.basic?.name || 
                    `${verificationResult.npiData.basic?.first_name} ${verificationResult.npiData.basic?.last_name}`}</div>
                  {verificationResult.npiData.basic?.organization_name && (
                    <div><strong>Organization:</strong> {verificationResult.npiData.basic.organization_name}</div>
                  )}
                  <div><strong>Primary Taxonomy:</strong> {verificationResult.npiData.taxonomies?.[0]?.desc}</div>
                  <Badge className="text-xs mt-2">
                    Confidence: {verificationResult.confidence}%
                  </Badge>
                </div>
              )}

              {!verificationResult.isValid && verificationResult.issues.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800">Issues found:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                    {verificationResult.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};