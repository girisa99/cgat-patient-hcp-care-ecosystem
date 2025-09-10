/**
 * SIGNATURE CAPTURE COMPONENT
 * Digital signature capture for enrollment completion
 */
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

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

  const getConsentText = (moduleType: ModuleType) => {
    const consentTexts = {
      patient: 'I consent to the collection and processing of my health information as described in this enrollment form.',
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
          {/* Consent Text */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Consent Agreement</h3>
            <p className="text-sm text-muted-foreground">
              {getConsentText(moduleType)}
            </p>
          </div>

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