/**
 * CREDIT APPLICATION PAGE
 * Secure credit application with comprehensive features
 */
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { SecureCreditApplicationForm } from '@/components/credit/SecureCreditApplicationForm';

const CreditApplication = () => {
  return (
    <AppLayout title="Credit Application">
      <div className="min-h-screen bg-gray-50">
        <SecureCreditApplicationForm />
      </div>
    </AppLayout>
  );
};

export default CreditApplication;