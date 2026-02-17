import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { ConnectorBrand, searchConnectorBrands } from './ConnectorBrandRegistry';
import { useConnectorMetrics } from '@/hooks/useConnectorMetrics';
import { useToast } from "@/hooks/use-toast";

interface QuickConnectorCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectorCreated: (connector: any) => void;
  initialSearch?: string;
}

interface CustomConnectorData {
  name: string;
  description: string;
  type: 'database' | 'api' | 'messaging' | 'external_service' | 'ai_model' | 'file_system';
  category: string;
  baseUrl: string;
  authType: 'api_key' | 'bearer' | 'oauth' | 'custom';
}

export const QuickConnectorCreator: React.FC<QuickConnectorCreatorProps> = ({
  isOpen,
  onClose,
  onConnectorCreated,
  initialSearch = ''
}) => {
  const { toast } = useToast();
  const { createConnector } = useConnectorMetrics();
  
  const [mode, setMode] = useState<'brand' | 'custom'>('brand');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState<ConnectorBrand | null>(null);
  const [connectorName, setConnectorName] = useState('');
  const [connectorDescription, setConnectorDescription] = useState('');
  
  const [customData, setCustomData] = useState<CustomConnectorData>({
    name: '',
    description: '',
    type: 'api',
    category: 'Integration',
    baseUrl: '',
    authType: 'api_key'
  });

  const filteredBrands = searchConnectorBrands(searchQuery);

  const handleBrandSelect = (brand: ConnectorBrand) => {
    setSelectedBrand(brand);
    setConnectorName(brand.name);
    setConnectorDescription(brand.description);
  };

  const handleCreateFromBrand = async () => {
    if (!selectedBrand) return;

    try {
      const newConnector = await createConnector.mutateAsync({
        name: connectorName,
        description: connectorDescription,
        type: selectedBrand.type,
        category: selectedBrand.category,
        status: 'inactive',
        base_url: selectedBrand.baseUrl || '',
        auth_type: selectedBrand.authTypes[0] || 'api_key',
        endpoints: (selectedBrand.commonEndpoints || []).map((endpoint, index) => ({
          id: `${selectedBrand.id}-endpoint-${index}`,
          path: endpoint,
          method: 'GET',
          description: `${selectedBrand.name} endpoint`
        })),
        usage_count: 0,
        success_rate: 0,
        configuration: {
          brand_id: selectedBrand.id,
          endpoints: selectedBrand.commonEndpoints || []
        }
      });

      toast({
        title: "Connector Created",
        description: `${connectorName} has been created successfully.`
      });

      onConnectorCreated(newConnector);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create connector. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCustom = async () => {
    if (!customData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a connector name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newConnector = await createConnector.mutateAsync({
        name: customData.name,
        description: customData.description,
        type: customData.type,
        category: customData.category,
        status: 'inactive',
        base_url: customData.baseUrl,
        auth_type: customData.authType,
        endpoints: [],
        usage_count: 0,
        success_rate: 0,
        configuration: {
          custom: true,
          created_via: 'quick_creator'
        }
      });

      toast({
        title: "Custom Connector Created",
        description: `${customData.name} has been created successfully.`
      });

      onConnectorCreated(newConnector);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom connector. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setMode('brand');
    setSearchQuery(initialSearch);
    setSelectedBrand(null);
    setConnectorName('');
    setConnectorDescription('');
    setCustomData({
      name: '',
      description: '',
      type: 'api',
      category: 'Integration',
      baseUrl: '',
      authType: 'api_key'
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Connector</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'brand' ? 'default' : 'outline'}
              onClick={() => setMode('brand')}
              className="flex-1"
            >
              From Brand Library
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              onClick={() => setMode('custom')}
              className="flex-1"
            >
              Custom Connector
            </Button>
          </div>

          {mode === 'brand' && (
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Label>Search Connector Brands</Label>
                <Input
                  placeholder="Search by name, category, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Brand Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredBrands.map((brand) => (
                  <Card
                    key={brand.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBrand?.id === brand.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{brand.name}</h4>
                          <Badge variant="outline" className="text-xs">{brand.category}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{brand.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {searchQuery && filteredBrands.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No brands found for "{searchQuery}"</p>
                  <Button
                    variant="outline"
                    onClick={() => setMode('custom')}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Connector Instead
                  </Button>
                </div>
              )}

              {/* Selected Brand Configuration */}
              {selectedBrand && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label>Connector Name</Label>
                      <Input
                        value={connectorName}
                        onChange={(e) => setConnectorName(e.target.value)}
                        placeholder="Enter connector name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={connectorDescription}
                        onChange={(e) => setConnectorDescription(e.target.value)}
                        placeholder="Describe what this connector will do"
                        className="h-20"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Connector Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Connector Name *</Label>
                      <Input
                        value={customData.name}
                        onChange={(e) => setCustomData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Service"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={customData.category}
                        onChange={(e) => setCustomData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Integration, CRM, Database..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={customData.description}
                      onChange={(e) => setCustomData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this connector will do..."
                      className="h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={customData.type}
                        onValueChange={(value: any) => setCustomData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API Service</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="messaging">Messaging</SelectItem>
                          <SelectItem value="external_service">External Service</SelectItem>
                          <SelectItem value="ai_model">AI Model</SelectItem>
                          <SelectItem value="file_system">File System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Authentication Type</Label>
                      <Select
                        value={customData.authType}
                        onValueChange={(value: any) => setCustomData(prev => ({ ...prev, authType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="oauth">OAuth</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Base URL (Optional)</Label>
                    <Input
                      value={customData.baseUrl}
                      onChange={(e) => setCustomData(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://api.myservice.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode === 'brand' && selectedBrand && (
              <Button onClick={handleCreateFromBrand} disabled={createConnector.isPending}>
                {createConnector.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Connector
              </Button>
            )}
            {mode === 'custom' && (
              <Button onClick={handleCreateCustom} disabled={createConnector.isPending}>
                {createConnector.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Custom Connector
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};