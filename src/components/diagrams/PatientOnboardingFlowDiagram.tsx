import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Send, Shield, User, Building2, CreditCard, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const PatientOnboardingFlowDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const steps = [
    { icon: Send, label: 'Submission Method', description: 'Choose enrollment method', color: 'bg-blue-500' },
    { icon: Shield, label: 'Consent Management', description: 'Patient consent & authorization', color: 'bg-purple-500' },
    { icon: User, label: 'Patient Info', description: 'Basic patient details', color: 'bg-green-500' },
    { icon: Building2, label: 'Provider Info', description: 'Treatment center & providers', color: 'bg-orange-500' },
    { icon: CreditCard, label: 'Insurance', description: 'Medical & pharmacy coverage', color: 'bg-cyan-500' },
    { icon: Activity, label: 'Treatment & Clinical', description: 'Clinical assessment', color: 'bg-pink-500' },
    { icon: CheckCircle, label: 'Submit', description: 'Final review & submission', color: 'bg-emerald-500' },
  ];

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#1e40af',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'patient-onboarding-flow.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Diagram downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = () => {
    if (!diagramRef.current) return;
    
    html2canvas(diagramRef.current, {
      backgroundColor: '#1e40af',
      scale: 2,
    }).then(canvas => {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Patient Onboarding Flow</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f172a;">
              <img src="${canvas.toDataURL('image/png')}" style="max-width:100%;height:auto;" />
            </body>
          </html>
        `);
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Patient Onboarding Flow</CardTitle>
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
      <CardContent>
        <div 
          ref={diagramRef}
          className="p-8 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}
        >
          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Patient Onboarding Workflow
          </h2>
          
          {/* Flow Steps */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <React.Fragment key={index}>
                  {/* Step Card */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white rounded-xl shadow-lg p-4 w-32 h-32 flex flex-col items-center justify-center">
                      <div className={`${step.color} p-3 rounded-full mb-2`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                        {step.label}
                      </span>
                    </div>
                    <span className="text-xs text-blue-100 mt-2 text-center max-w-[120px]">
                      {step.description}
                    </span>
                  </div>
                  
                  {/* Arrow (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-0.5 bg-white/60"></div>
                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-white/60"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* AI Enhancement Banner */}
          <div className="mt-8 bg-white/10 rounded-lg p-4 text-center">
            <p className="text-white/90 text-sm">
              🤖 <strong>AI-Powered:</strong> Document OCR, Auto-field extraction, Real-time validation at each step
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Complete 7-step patient enrollment journey with AI-powered document processing and validation
        </p>
      </CardContent>
    </Card>
  );
};

export default PatientOnboardingFlowDiagram;
