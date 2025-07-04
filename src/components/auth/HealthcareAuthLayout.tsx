
import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';

interface HealthcareAuthLayoutProps {
  children: React.ReactNode;
}

const HealthcareAuthLayout: React.FC<HealthcareAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex">
      {/* Left side - Branding and Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white rounded-full"></div>
        </div>
        
        {/* Logo Section */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-white p-3 rounded-lg">
              <img 
                src="/lovable-uploads/7b3ce1dc-c275-46ae-a0ca-f70f73094f01.png" 
                alt="GENIE Logo" 
                className="h-12 w-12"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GENIE</h1>
              <p className="text-lg text-blue-100">Cell, Gene Technology Navigator</p>
            </div>
          </div>
          <p className="text-xl text-blue-100 leading-relaxed">
            Secure access to comprehensive cell and gene therapy management system
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">HIPAA Compliant</h3>
              <p className="text-blue-100 text-sm">Enterprise-grade security ensuring patient data protection</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Role-Based Access</h3>
              <p className="text-blue-100 text-sm">Customized access levels for different healthcare roles</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Advanced Therapies</h3>
              <p className="text-blue-100 text-sm">Specialized tools for cell and gene therapy management</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-200 text-sm">
          © 2024 GENIE - Cell, Gene Technology Navigator. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/7b3ce1dc-c275-46ae-a0ca-f70f73094f01.png" 
                alt="GENIE Logo" 
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">GENIE</h1>
                <p className="text-sm text-slate-600">Cell, Gene Technology Navigator</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default HealthcareAuthLayout;
