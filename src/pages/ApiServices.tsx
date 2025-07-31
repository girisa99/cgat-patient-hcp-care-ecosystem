
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ApiServicesTabsContainer from '@/components/api/ApiServicesTabsContainer';
import { getErrorMessage } from '@/utils/errorHandling';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiServices = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const context = searchParams.get('context');
  
  console.log('🚀 API Services page rendered', { serviceId, context });
  
  const isOnboardingContext = context === 'onboarding';
  
  return (
    <AppLayout title="API Services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {isOnboardingContext && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Onboarding Context
                  </Badge>
                  <span className="text-sm text-blue-700">
                    You're viewing this API service as part of your onboarding process.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const from = searchParams.get('from');
                    if (from === 'onboarding') {
                      window.history.back();
                    } else {
                      window.close();
                    }
                  }}
                  className="flex items-center space-x-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Onboarding</span>
                </Button>
              </div>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOnboardingContext ? 'API Service Details' : 'API Services Management'}
          </h1>
          <p className="text-lg text-gray-600">
            {isOnboardingContext 
              ? 'Review the API service details and integration requirements for your onboarding'
              : 'Comprehensive API ecosystem management including internal services, external integrations, publishing, marketplace, developer portal, and more'
            }
          </p>
        </div>

        {/* Main Tabs Container with all functionality */}
        <ApiServicesTabsContainer 
          defaultTab={serviceId ? "internal" : "internal"}
          selectedServiceId={serviceId}
          onboardingContext={isOnboardingContext}
        />
      </div>
    </AppLayout>
  );
};

export default ApiServices;
