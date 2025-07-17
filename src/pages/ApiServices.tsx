
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ApiServicesTabsContainer from '@/components/api/ApiServicesTabsContainer';
import { getErrorMessage } from '@/utils/errorHandling';

const ApiServices = () => {
  console.log('🚀 API Services page rendered');
  
  return (
    <AppLayout title="API Services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Services Management
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive API ecosystem management including internal services, external integrations, publishing, marketplace, developer portal, and more
          </p>
        </div>

        {/* Main Tabs Container with all functionality */}
        <ApiServicesTabsContainer />
      </div>
    </AppLayout>
  );
};

export default ApiServices;
