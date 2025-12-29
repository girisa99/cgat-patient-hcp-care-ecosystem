import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Send, Shield, User, Building2, CreditCard, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const PatientOnboardingFlowDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const steps = [
    { 
      step: 1,
      icon: Send, 
      label: 'Submission Method', 
      description: 'Choose how to complete enrollment',
      aiFeature: 'Smart Form Detection',
      color: '#3B82F6' // blue
    },
    { 
      step: 2,
      icon: Shield, 
      label: 'Consent Management', 
      description: 'Patient consent & provider authorization',
      aiFeature: 'E-Signature Capture',
      color: '#8B5CF6' // purple
    },
    { 
      step: 3,
      icon: User, 
      label: 'Patient Information', 
      description: 'Demographics & contact details',
      aiFeature: 'ID Card OCR Extraction',
      color: '#10B981' // green
    },
    { 
      step: 4,
      icon: Building2, 
      label: 'Provider Information', 
      description: 'Treatment center & prescriber details',
      aiFeature: 'NPI Validation',
      color: '#F59E0B' // orange
    },
    { 
      step: 5,
      icon: CreditCard, 
      label: 'Insurance Details', 
      description: 'Medical & pharmacy coverage',
      aiFeature: 'Insurance Card OCR',
      color: '#06B6D4' // cyan
    },
    { 
      step: 6,
      icon: Activity, 
      label: 'Treatment & Clinical', 
      description: 'Clinical assessment & treatment plan',
      aiFeature: 'Prior Auth Check',
      color: '#EC4899' // pink
    },
    { 
      step: 7,
      icon: CheckCircle, 
      label: 'Review & Submit', 
      description: 'Final review and submission',
      aiFeature: 'Completeness Validation',
      color: '#059669' // emerald
    },
  ];

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#1e3a5f',
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = 'patient-onboarding-flow-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Patient Onboarding Flow diagram downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#1e3a5f',
        scale: 2,
        useCORS: true,
      });
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Patient Onboarding Flow Diagram</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f172a;">
              <img src="${canvas.toDataURL('image/png')}" style="max-width:100%;height:auto;" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to open full size:', error);
      toast.error('Failed to open full size view');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Patient Onboarding Workflow</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div 
          ref={diagramRef}
          className="p-8 rounded-lg min-w-[1100px]"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Patient Onboarding Workflow
            </h2>
            <p className="text-blue-200 text-sm">
              AI-Powered 7-Step Enrollment Journey with Document Processing
            </p>
          </div>
          
          {/* Flow Steps - Top Row (Steps 1-4) */}
          <div className="flex justify-center items-start gap-2 mb-6">
            {steps.slice(0, 4).map((step, index) => {
              const IconComponent = step.icon;
              return (
                <React.Fragment key={step.step}>
                  {/* Step Card */}
                  <div className="flex flex-col items-center w-[140px]">
                    {/* Step Number Badge */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2 shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.step}
                    </div>
                    
                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-xl p-4 w-full">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: step.color }} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 text-center mb-1 leading-tight">
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-500 text-center mb-2 leading-tight">
                        {step.description}
                      </p>
                      <div 
                        className="text-xs font-medium text-center py-1 px-2 rounded-full"
                        style={{ backgroundColor: `${step.color}15`, color: step.color }}
                      >
                        🤖 {step.aiFeature}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  {index < 3 && (
                    <div className="flex items-center pt-16">
                      <ArrowRight className="h-6 w-6 text-white/70" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Connecting Arrow Down */}
          <div className="flex justify-end pr-[70px] mb-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-white/50"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white/50"></div>
            </div>
          </div>

          {/* Flow Steps - Bottom Row (Steps 5-7) */}
          <div className="flex justify-center items-start gap-2">
            {steps.slice(4).reverse().map((step, index) => {
              const IconComponent = step.icon;
              const reversedSteps = steps.slice(4).reverse();
              return (
                <React.Fragment key={step.step}>
                  {/* Step Card */}
                  <div className="flex flex-col items-center w-[140px]">
                    {/* Step Number Badge */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2 shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.step}
                    </div>
                    
                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-xl p-4 w-full">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: step.color }} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 text-center mb-1 leading-tight">
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-500 text-center mb-2 leading-tight">
                        {step.description}
                      </p>
                      <div 
                        className="text-xs font-medium text-center py-1 px-2 rounded-full"
                        style={{ backgroundColor: `${step.color}15`, color: step.color }}
                      >
                        🤖 {step.aiFeature}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow (reversed direction) */}
                  {index < reversedSteps.length - 1 && (
                    <div className="flex items-center pt-16">
                      <ArrowRight className="h-6 w-6 text-white/70" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer Banner */}
          <div className="mt-8 bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex justify-between items-center text-white/90 text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                  Document OCR
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                  Auto-Extraction
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                  Real-time Validation
                </span>
              </div>
              <span className="text-blue-200 font-medium">
                Powered by Multi-Model AI
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Complete 7-step patient enrollment journey with AI-powered document processing at each stage
        </p>
      </CardContent>
    </Card>
  );
};

export default PatientOnboardingFlowDiagram;
