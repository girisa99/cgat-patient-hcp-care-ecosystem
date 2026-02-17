import React from 'react';
import { PatientEnrollmentWithWhatsApp } from '@/components/patient-enrollment/PatientEnrollmentWithWhatsApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Shield, Users } from 'lucide-react';

const PatientOnboardingWhatsApp: React.FC = () => {
  const handleEnrollmentComplete = (data: any) => {
    console.log('Patient enrollment completed:', data);
    // Handle completion - could redirect or show success message
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">WhatsApp-Enhanced Patient Enrollment</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline patient consent collection with AI-powered WhatsApp agents that adapt to 
            different locations and contexts while maintaining full compliance and security.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium text-sm">WhatsApp Integration</h3>
              <p className="text-xs text-muted-foreground">Secure messaging via Twilio</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium text-sm">Location Aware</h3>
              <p className="text-xs text-muted-foreground">Facility, remote, or caregiver modes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium text-sm">HIPAA Compliant</h3>
              <p className="text-xs text-muted-foreground">Full encryption and audit trails</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium text-sm">Voice & Text</h3>
              <p className="text-xs text-muted-foreground">Multiple consent collection methods</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <PatientEnrollmentWithWhatsApp 
        onComplete={handleEnrollmentComplete}
      />

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-3">For Healthcare Providers</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    Reduce administrative overhead with automated consent collection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    Maintain compliance with digital audit trails and signatures
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    Improve patient engagement with familiar messaging platforms
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    Seamlessly integrate with existing enrollment workflows
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">For Patients & Caregivers</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    Complete consent from home or any location with internet access
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    Use familiar WhatsApp interface for secure communication
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    Get guided assistance through the enrollment process
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    Receive immediate confirmation and next steps
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientOnboardingWhatsApp;