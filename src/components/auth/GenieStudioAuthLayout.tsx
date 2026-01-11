/**
 * GENIE STUDIO AUTH LAYOUT
 * Dedicated authentication layout for Genie Studio with proper branding
 */
import React from 'react';
import { Sparkles, Zap, Wand2, Layers } from 'lucide-react';

// Import Genie Studio combined logo
import genieStudioCombinedLogo from '@/assets/logos/genie-studio-combined.png';

interface GenieStudioAuthLayoutProps {
  children: React.ReactNode;
}

const GenieStudioAuthLayout: React.FC<GenieStudioAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Genie Studio Branding with Clean White/Light Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white via-purple-50 to-violet-100 p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-200 to-violet-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full blur-3xl"></div>
        </div>
        
        {/* Main Logo & Branding - Centered */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          {/* Combined Logo with Genie Lamp */}
          <div className="mb-8">
            <img 
              src={genieStudioCombinedLogo} 
              alt="Genie Studio - Mind to Media" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          
          {/* Additional Tagline */}
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Transform your ideas into stunning media content with the power of AI
          </p>
          
          {/* Product Suite Features */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 text-sm">Genie Mind</h4>
                <p className="text-gray-500 text-xs">Knowledge Base</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 text-sm">Genie Spark</h4>
                <p className="text-gray-500 text-xs">AI Prototyping</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-lg">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 text-sm">Genie Vibe</h4>
                <p className="text-gray-500 text-xs">Media Generation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-lg">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 text-sm">Production Hub</h4>
                <p className="text-gray-500 text-xs">Orchestration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Genie AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex flex-col items-center space-y-4 mb-4">
              <img 
                src={genieStudioCombinedLogo} 
                alt="Genie Studio" 
                className="h-24 w-auto object-contain"
              />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenieStudioAuthLayout;
