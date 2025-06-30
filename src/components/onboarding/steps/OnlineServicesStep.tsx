
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Monitor, Users, ShoppingCart, FileText, BarChart, Share2 } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useServices } from '@/hooks/useServices';

interface OnlineServicesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
  applicationId?: string;
}

export const OnlineServicesStep: React.FC<OnlineServicesStepProps> = ({
  data,
  onDataChange
}) => {
  const { onlineServices, userRoles } = useServices();
  const [selectedServices, setSelectedServices] = useState<string[]>(data.selected_online_services || []);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(data.selected_user_roles || []);

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(updatedServices);
    onDataChange({
      ...data,
      selected_online_services: updatedServices
    });
  };

  const handleRoleToggle = (roleId: string) => {
    const updatedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    
    setSelectedRoles(updatedRoles);
    onDataChange({
      ...data,
      selected_user_roles: updatedRoles
    });
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Order')) return <ShoppingCart className="h-5 w-5" />;
    if (serviceName.includes('Returns') || serviceName.includes('Claims')) return <FileText className="h-5 w-5" />;
    if (serviceName.includes('Invoice')) return <FileText className="h-5 w-5" />;
    if (serviceName.includes('DSCSA')) return <FileText className="h-5 w-5" />;
    if (serviceName.includes('Analytics') || serviceName.includes('Reporting')) return <BarChart className="h-5 w-5" />;
    if (serviceName.includes('Sharing')) return <Share2 className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Online Platform Services</span>
          </CardTitle>
          <CardDescription>
            Select the online services and features you want to enable for your treatment center.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onlineServices?.map((service) => (
              <Card key={service.id} className={`cursor-pointer transition-all ${
                selectedServices.includes(service.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(service.service_name)}
                      <CardTitle className="text-base">{service.service_name}</CardTitle>
                    </div>
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Features:</Label>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Roles & Access</span>
          </CardTitle>
          <CardDescription>
            Select the user roles that will be applicable for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRoles?.map((role) => (
              <Card key={role.role} className={`cursor-pointer transition-all ${
                selectedRoles.includes(role.role) ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{role.title}</CardTitle>
                      <CardDescription className="text-sm">{role.description}</CardDescription>
                    </div>
                    <Checkbox
                      checked={selectedRoles.includes(role.role)}
                      onCheckedChange={() => handleRoleToggle(role.role)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Permissions:</Label>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {(selectedServices.length > 0 || selectedRoles.length > 0) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedServices.length > 0 && (
                <div>
                  <Label className="font-medium text-blue-900">Selected Services ({selectedServices.length}):</Label>
                  <div className="mt-2 space-y-1">
                    {selectedServices.map(serviceId => {
                      const service = onlineServices?.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex items-center space-x-2">
                          {getServiceIcon(service.service_name)}
                          <span className="text-sm">{service.service_name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {selectedRoles.length > 0 && (
                <div>
                  <Label className="font-medium text-blue-900">Selected Roles ({selectedRoles.length}):</Label>
                  <div className="mt-2 space-y-1">
                    {selectedRoles.map(roleId => {
                      const role = userRoles?.find(r => r.role === roleId);
                      return role ? (
                        <div key={roleId} className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{role.title}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
