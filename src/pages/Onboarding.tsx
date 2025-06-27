
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, Users, UserPlus, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'facility' | 'user' | 'complete'>('facility');
  const [isLoading, setIsLoading] = useState(false);
  
  const [facilityData, setFacilityData] = useState({
    name: '',
    facility_type: '',
    address: '',
    phone: '',
    email: '',
    license_number: ''
  });

  const [userData, setUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    role: '',
    facility_id: ''
  });

  const handleCreateFacility = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'start_facility_onboarding',
          facility_data: facilityData
        }
      });

      if (error) throw error;

      toast({
        title: "Facility Created",
        description: "Facility has been created successfully.",
      });

      setUserData({ ...userData, facility_id: data.facility.id });
      setActiveStep('user');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'complete_user_setup',
          user_data: userData
        }
      });

      if (error) throw error;

      toast({
        title: "User Created",
        description: "User has been created successfully.",
      });

      setActiveStep('complete');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Set up new facilities and users in the system
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className={`flex items-center space-x-2 ${activeStep === 'facility' ? 'text-blue-600' : activeStep === 'user' || activeStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <Building className="h-5 w-5" />
            <span>Create Facility</span>
          </div>
          <div className="h-px bg-gray-300 w-16"></div>
          <div className={`flex items-center space-x-2 ${activeStep === 'user' ? 'text-blue-600' : activeStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <UserPlus className="h-5 w-5" />
            <span>Create User</span>
          </div>
          <div className="h-px bg-gray-300 w-16"></div>
          <div className={`flex items-center space-x-2 ${activeStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-5 w-5" />
            <span>Complete</span>
          </div>
        </div>

        {/* Facility Creation Step */}
        {activeStep === 'facility' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Create Facility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facility-name">Facility Name</Label>
                  <Input
                    id="facility-name"
                    value={facilityData.name}
                    onChange={(e) => setFacilityData({ ...facilityData, name: e.target.value })}
                    placeholder="Enter facility name"
                  />
                </div>
                <div>
                  <Label htmlFor="facility-type">Facility Type</Label>
                  <Select value={facilityData.facility_type} onValueChange={(value) => setFacilityData({ ...facilityData, facility_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatmentFacility">Treatment Facility</SelectItem>
                      <SelectItem value="referralFacility">Referral Facility</SelectItem>
                      <SelectItem value="prescriberFacility">Prescriber Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="facility-email">Email</Label>
                  <Input
                    id="facility-email"
                    type="email"
                    value={facilityData.email}
                    onChange={(e) => setFacilityData({ ...facilityData, email: e.target.value })}
                    placeholder="facility@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="facility-phone">Phone</Label>
                  <Input
                    id="facility-phone"
                    value={facilityData.phone}
                    onChange={(e) => setFacilityData({ ...facilityData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="facility-address">Address</Label>
                <Textarea
                  id="facility-address"
                  value={facilityData.address}
                  onChange={(e) => setFacilityData({ ...facilityData, address: e.target.value })}
                  placeholder="Enter facility address"
                />
              </div>
              <div>
                <Label htmlFor="license-number">License Number (Optional)</Label>
                <Input
                  id="license-number"
                  value={facilityData.license_number}
                  onChange={(e) => setFacilityData({ ...facilityData, license_number: e.target.value })}
                  placeholder="Enter license number"
                />
              </div>
              <Button 
                onClick={handleCreateFacility} 
                disabled={isLoading || !facilityData.name || !facilityData.facility_type}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Facility'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User Creation Step */}
        {activeStep === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Create User</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={userData.role} onValueChange={(value) => setUserData({ ...userData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcareProvider">Healthcare Provider</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="caseManager">Case Manager</SelectItem>
                      <SelectItem value="onboardingTeam">Onboarding Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={userData.first_name}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={userData.last_name}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="user-phone">Phone</Label>
                  <Input
                    id="user-phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep('facility')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  disabled={isLoading || !userData.email || !userData.first_name || !userData.role}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Step */}
        {activeStep === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Onboarding Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-lg text-muted-foreground mb-4">
                Facility and user have been successfully created!
              </p>
              <Button 
                onClick={() => {
                  setActiveStep('facility');
                  setFacilityData({
                    name: '',
                    facility_type: '',
                    address: '',
                    phone: '',
                    email: '',
                    license_number: ''
                  });
                  setUserData({
                    email: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    department: '',
                    role: '',
                    facility_id: ''
                  });
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Start New Onboarding
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Onboarding;
