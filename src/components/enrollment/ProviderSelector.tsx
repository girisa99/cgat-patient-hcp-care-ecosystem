import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, Phone, Mail, MapPin, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  name: string;
  provider_type: string;
  description: string | null;
  contact_info: any; // jsonb
  capabilities: string[] | null;
  geographic_coverage: string[] | null;
  certification_details: any; // jsonb
  specializations: string[] | null;
  is_active: boolean;
}

interface ProviderSelectorProps {
  value?: string;
  onValueChange: (providerId: string, providerData: Provider) => void;
  facilityId?: string;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  value,
  onValueChange,
  facilityId,
  required = false,
  className = '',
  label = 'Provider',
  placeholder = 'Search and select provider...'
}) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Load providers
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('service_providers')
          .select(`
            id, name, provider_type, description, contact_info,
            capabilities, geographic_coverage, certification_details,
            specializations, is_active
          `)
          .eq('is_active', true);

        // Filter by facility if provided
        if (facilityId) {
          // You might want to add a facility_providers junction table for this
          // For now, we'll load all active providers
        }

        const { data, error } = await query.order('name');

        if (error) throw error;

        setProviders(data || []);
        
        // If there's a selected value, find the provider
        if (value && data) {
          const provider = data.find(p => p.id === value);
          setSelectedProvider(provider || null);
        }
        
      } catch (error) {
        console.error('Error loading providers:', error);
        toast({
          title: "Error Loading Providers",
          description: "Failed to load available providers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [facilityId, value, toast]);

  const handleSelectionChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      onValueChange(providerId, provider);
    }
  };

  const filteredProviders = providers.filter(provider => {
    if (!searchTerm) return true;
    
    const name = provider.name.toLowerCase();
    const specializations = provider.specializations?.join(' ').toLowerCase() || '';
    const description = provider.description?.toLowerCase() || '';
    const npi = provider.contact_info?.npi || '';
    
    return name.includes(searchTerm.toLowerCase()) ||
           specializations.includes(searchTerm.toLowerCase()) ||
           description.includes(searchTerm.toLowerCase()) ||
           npi.includes(searchTerm);
  });

  const getProviderDisplayName = (provider: Provider) => {
    return provider.name;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="provider-search">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="provider-search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Provider Selection */}
        <Select 
          value={value || ''} 
          onValueChange={handleSelectionChange}
          required={required}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select from filtered providers..." />
          </SelectTrigger>
          <SelectContent>
            {filteredProviders.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? 'No providers match your search' : 'No providers available'}
              </div>
            ) : (
              filteredProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{getProviderDisplayName(provider)}</div>
                        {provider.specializations && provider.specializations.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {provider.specializations.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {provider.provider_type}
                      </Badge>
                      {provider.contact_info?.npi && (
                        <div className="text-xs text-muted-foreground mt-1">
                          NPI: {provider.contact_info.npi}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedProvider && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5" />
              {getProviderDisplayName(selectedProvider)}
              <Badge variant="outline">{selectedProvider.provider_type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProvider.description && (
              <div className="text-sm">
                <span className="font-medium">Description:</span> {selectedProvider.description}
              </div>
            )}

            {selectedProvider.specializations && selectedProvider.specializations.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Specializations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProvider.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedProvider.contact_info?.npi && (
              <div className="text-sm">
                <span className="font-medium">NPI Number:</span> {selectedProvider.contact_info.npi}
              </div>
            )}

            {selectedProvider.contact_info?.license && (
              <div className="text-sm">
                <span className="font-medium">License:</span> {selectedProvider.contact_info.license}
              </div>
            )}

            <div className="flex gap-4 text-sm">
              {selectedProvider.contact_info?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedProvider.contact_info.phone}</span>
                </div>
              )}
              {selectedProvider.contact_info?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedProvider.contact_info.email}</span>
                </div>
              )}
            </div>

            {selectedProvider.contact_info?.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{selectedProvider.contact_info.address}</span>
              </div>
            )}

            {selectedProvider.capabilities && selectedProvider.capabilities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedProvider.capabilities.slice(0, 5).map((capability, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};