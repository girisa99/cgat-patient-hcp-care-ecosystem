import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, FileImage } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface DiagramFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  diagramRef: React.RefObject<HTMLDivElement>;
  downloadFileName?: string;
}

export const DiagramFullscreenModal: React.FC<DiagramFullscreenModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  diagramRef,
  downloadFileName = 'diagram'
}) => {
  if (!isOpen) return null;

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${downloadFileName}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPNG} 
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <FileImage className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose} 
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
      <div className="p-8 flex justify-center">
        <div ref={diagramRef} className="max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DiagramFullscreenModal;
