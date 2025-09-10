/**
 * SIGNATURE CAPTURE COMPONENT
 * Digital signature capture for enrollment completion
 */
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface SignatureCaptureProps {
  onSignatureComplete: (signatureData: string) => void;
  onCancel: () => void;
  moduleType: ModuleType;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureComplete,
  onCancel,
  moduleType
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getEventPos(e);
    setLastPoint(pos);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPos = getEventPos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    setLastPoint(currentPos);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSignatureComplete(signatureData);
  };

  const [householdSize, setHouseholdSize] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [diseaseEducationConsent, setDiseaseEducationConsent] = useState(false);
  const [tcpaConsent, setTcpaConsent] = useState(false);

  const getConsentText = (moduleType: ModuleType) => {
    const consentTexts = {
      patient: 'Patient Consent and Authorization',
      treatment_center: 'I certify that the information provided is accurate and that our facility meets all regulatory requirements.',
      customer: 'I agree to the terms and conditions of service and authorize the processing of this registration.',
      manufacturer: 'I certify that our company information is accurate and we agree to comply with all applicable regulations.'
    };
    return consentTexts[moduleType];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            Digital Signature Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {moduleType === 'patient' ? (
            <>
              {/* Financial Eligibility Section */}
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <h3 className="font-semibold">Financial Eligibility</h3>
                <p className="text-sm text-muted-foreground">
                  Complete only if you are applying to the Genie Patient Foundation. 
                  By completing this section, I am agreeing to the Terms and Conditions of the Genie Patient Foundation outlined on page 2.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="householdSize">Household size (including you):</Label>
                    <Input
                      id="householdSize"
                      type="number"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(e.target.value)}
                      placeholder="Enter number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual household income:</Label>
                    <Input
                      id="annualIncome"
                      type="text"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      placeholder="Enter income"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Consent Sections */}
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <h3 className="font-semibold">Optional Consents</h3>
                
                {/* Disease Education Consent */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="diseaseEducation"
                    checked={diseaseEducationConsent}
                    onCheckedChange={(checked) => setDiseaseEducationConsent(checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="diseaseEducation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Consent for Patient Resources and Information (OPTIONAL)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Genie offers optional and free disease education and other material for patients. This may include 
                      information and marketing material about products, services and programs offered by Genie, its partners 
                      and their respective affiliates. If you sign up, you may be contacted using the information you have provided. 
                      By checking this box, I agree to receive optional disease education and other material. I understand 
                      providing this agreement is voluntary and plays no role in getting Genie Access Solutions services 
                      or my medicine and that it may be necessary to use my sensitive personal information to provide me 
                      with relevant material. I also understand that I may opt out of receiving this information at any time by 
                      calling (888)999‑9999 and that this consent will remain active unless I opt out.
                    </p>
                  </div>
                </div>

                {/* TCPA Consent */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="tcpaConsent"
                    checked={tcpaConsent}
                    onCheckedChange={(checked) => setTcpaConsent(checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="tcpaConsent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Telephone Consumer Protection Act (TCPA) Consent (OPTIONAL)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, I consent to receive autodialed marketing calls and text messages from and 
                      on behalf of Genie at the phone number(s) I have provided. I understand that consent is not a 
                      requirement of any purchase or enrollment. Message frequency may vary. Message and data rates may 
                      apply. I may opt out at any time by texting STOP or calling (877) Genie/(888)999-9999.
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Consent Text */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Patient Consent and Authorization</h3>
                <p className="text-sm text-muted-foreground">
                  By signing this form, I acknowledge that I have provided accurate and complete information and 
                  understand and agree to the terms of this form. My signature certifies that I have read, understood, and 
                  agree to the release and use of my personal information, including sensitive personal information, pursuant 
                  to the Authorization to Use and Disclose Personal Information and as otherwise stated on this form.
                </p>
              </div>
            </>
          ) : (
            /* Other module types */
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Consent Agreement</h3>
              <p className="text-sm text-muted-foreground">
                {getConsentText(moduleType)}
              </p>
            </div>
          )}

          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">Signature</label>
              <Badge variant={hasSignature ? "default" : "secondary"}>
                {hasSignature ? "Signature Captured" : "Please Sign"}
              </Badge>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4 bg-background">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 border border-border rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                Sign above using your mouse or touch device
              </p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
            <p className="font-medium mb-1">Legal Notice:</p>
            <p>
              By signing above, you acknowledge that you have read, understood, and agree to all terms 
              and conditions outlined in this enrollment process. This digital signature has the same 
              legal effect as a handwritten signature.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={saveSignature}
              disabled={!hasSignature}
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Enrollment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};