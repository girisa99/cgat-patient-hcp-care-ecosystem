/**
 * DIGITAL SIGNATURE CANVAS
 * Canvas component for capturing digital signatures with validation
 */
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DigitalSignatureCanvasProps {
  onComplete: (signatureData: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

export const DigitalSignatureCanvas: React.FC<DigitalSignatureCanvasProps> = ({
  onComplete,
  onCancel,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { toast } = useToast();

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before continuing",
        variant: "destructive",
      });
      return;
    }

    // Convert canvas to base64 data URL
    const signatureData = canvas.toDataURL('image/png');
    
    // Validate signature (check if canvas has been drawn on)
    if (signatureData === getBlankCanvasData()) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before continuing",
        variant: "destructive",
      });
      return;
    }

    onComplete(signatureData);
  }, [hasSignature, onComplete, toast]);

  const getBlankCanvasData = (): string => {
    // Create a temporary canvas to get blank data URL for comparison
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    return tempCanvas.toDataURL('image/png');
  };

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Add signature line
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, height - 30);
    ctx.lineTo(width - 50, height - 30);
    ctx.stroke();

    // Add signature text
    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sign above this line', width / 2, height - 10);
  }, [width, height]);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            className="border border-border rounded cursor-crosshair touch-none"
            style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              startDrawing(e);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {hasSignature ? "Signature captured" : "Draw your signature above"}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          
          <Button
            size="sm"
            onClick={saveSignature}
            disabled={!hasSignature}
          >
            <Check className="h-3 w-3 mr-1" />
            Complete
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        By signing, you agree to the terms and conditions of this enrollment.
        Your digital signature has the same legal validity as a handwritten signature.
      </div>
    </div>
  );
};