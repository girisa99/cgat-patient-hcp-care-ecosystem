import React from 'react';
import { NPIVerificationDemoTrigger } from '@/components/demo/NPIVerificationDemoTrigger';
import AppLayout from '@/components/layout/AppLayout';

const NPIDemo: React.FC = () => {
  console.log('✅ NPIDemo page is rendering');
  
  return (
    <AppLayout title="NPI Verification Demo">
      <div className="container mx-auto px-4 py-8">
        <NPIVerificationDemoTrigger />
      </div>
    </AppLayout>
  );
};

export default NPIDemo;