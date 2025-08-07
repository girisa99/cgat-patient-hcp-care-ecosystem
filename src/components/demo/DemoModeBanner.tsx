/**
 * Demo Mode Banner - Quick Access to AI Learning
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useQuickDemo } from '@/hooks/useQuickDemo';
import { Brain, Play, BookOpen, Zap } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useQuickDemo();

  if (isDemoMode) {
    return (
      <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-orange-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-orange-800">🎭 AI Learning Mode Active</h3>
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                    DEMO
                  </Badge>
                </div>
                <p className="text-sm text-orange-700">
                  You're safely exploring AI capabilities with realistic healthcare data
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={disableDemoMode}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Exit Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                🤖 Explore Healthcare AI
              </h3>
              <p className="text-gray-600 mb-2">
                Learn and experiment with AI implementation in healthcare settings
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  AI Models
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Learning Modules  
                </span>
                <span>✅ Safe Environment</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => enableDemoMode('beginner')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            <Button 
              onClick={() => enableDemoMode('advanced')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Advanced Mode
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};