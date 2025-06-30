import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Shield, Settings } from 'lucide-react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

const OnboardingPage = () => {
  const { user, profile } = useAuthContext();

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="p-5">
          <CardTitle className="text-2xl font-bold">Welcome to GENIE!</CardTitle>
          <CardDescription>
            Let's get you set up with the basics.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-500 h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Account Created</h3>
              <p className="text-sm text-gray-500">
                Your account has been successfully created.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="text-blue-500 h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-sm text-gray-500">
                {profile?.first_name} {profile?.last_name} ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="text-yellow-500 h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Security Settings</h3>
              <p className="text-sm text-gray-500">
                Configure two-factor authentication and other security measures.
              </p>
              <Button variant="outline" size="sm">
                Go to Security Settings
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Settings className="text-purple-500 h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              <p className="text-sm text-gray-500">
                Customize how you receive updates and alerts.
              </p>
              <Button variant="outline" size="sm">
                Go to Notification Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
