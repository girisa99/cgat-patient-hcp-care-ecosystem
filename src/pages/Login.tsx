import React from 'react';
import MasterAuthForm from '@/components/auth/MasterAuthForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <MasterAuthForm />
    </div>
  );
};

export default Login;