import React from 'react';
import ProtectedMasterAuthForm from '@/components/auth/ProtectedMasterAuthForm';

const Login: React.FC = () => {
  console.log('🔐 Login page component rendering...');
  
  return <ProtectedMasterAuthForm />;
};

export default Login;