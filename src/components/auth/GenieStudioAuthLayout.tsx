/**
 * GENIE STUDIO AUTH LAYOUT
 * Dedicated authentication layout for Genie Studio with proper branding
 */
import React from 'react';
import { Sparkles, Zap, Wand2, Star, Layers } from 'lucide-react';

// Import Genie Studio logo
import genieStudioLogo from '@/assets/logos/genie-studio-horizontal.png';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieStudioAuthLayoutProps {
  children: React.ReactNode;
}

const GenieStudioAuthLayout: React.FC<GenieStudioAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex">
      {/* Left side - Genie Studio Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        {/* Logo Section */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-white p-3 rounded-xl shadow-xl">
              <img 
                src={genieStudioLogo} 
                alt="Genie Studio" 
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-purple-100 mb-2">
            Mind to Media
          </h2>
          <p className="text-lg text-purple-200 leading-relaxed max-w-md">
            Complete AI-powered media production suite. Build intelligent agents, 
            generate content, and orchestrate workflows with the power of AI.
          </p>
        </div>

        {/* Product Suite Icons */}
        <div className="relative z-10 space-y-5">
          <h3 className="text-sm uppercase tracking-wider text-purple-200 font-semibold mb-4">
            Complete Suite Includes
          </h3>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Genie Mind</h3>
              <p className="text-purple-200 text-sm">Universal knowledge base & RAG engine</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Genie Spark</h3>
              <p className="text-purple-200 text-sm">Rapid AI prototyping in seconds</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Genie Vibe</h3>
              <p className="text-purple-200 text-sm">AI-powered media generation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Production Hub (Arc)</h3>
              <p className="text-purple-200 text-sm">Enterprise orchestration layer</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={genieSuiteLogo} 
              alt="Genie Suite" 
              className="h-8 w-auto object-contain opacity-80"
            />
          </div>
          <div className="text-purple-300 text-sm">
            © 2024 Genie AI. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex flex-col items-center space-y-4 mb-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                <img 
                  src={genieStudioLogo} 
                  alt="Genie Studio" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Mind to Media</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenieStudioAuthLayout;
