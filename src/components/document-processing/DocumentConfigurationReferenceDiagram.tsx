import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const DocumentConfigurationReferenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'document-configuration-reference.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Diagram downloaded as PNG!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Document Configuration Reference</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  background: #0f172a; 
                  display: flex; 
                  justify-content: center;
                  align-items: flex-start;
                  min-height: 100vh;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="Document Configuration Reference" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to open full size:', error);
      toast.error('Failed to open diagram in full size');
    }
  };

  const documentCategories = [
    {
      category: 'Healthcare',
      color: 'from-emerald-600 to-emerald-800',
      borderColor: 'border-emerald-500',
      icon: '🏥',
      types: [
        { name: 'Medical Records', icon: '📋', config: 'HIPAA, PHI Detection, FHIR Output' },
        { name: 'Prescriptions', icon: '💊', config: 'Drug Lookup, Dosage Validation' },
        { name: 'Lab Results', icon: '🔬', config: 'Reference Ranges, HL7 Export' },
        { name: 'Insurance Cards', icon: '🏷️', config: 'Plan Detection, Eligibility Check' },
      ],
    },
    {
      category: 'Medical Imaging',
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      icon: '🩻',
      types: [
        { name: 'X-Ray', icon: '📸', config: 'DICOM, Anomaly Detection' },
        { name: 'MRI/CT Scan', icon: '🧠', config: '3D Reconstruction, AI Analysis' },
        { name: 'Ultrasound', icon: '📡', config: 'Measurements, Annotations' },
        { name: 'Pathology', icon: '🔬', config: 'Cell Detection, Grading' },
      ],
    },
    {
      category: 'Financial',
      color: 'from-amber-600 to-amber-800',
      borderColor: 'border-amber-500',
      icon: '💰',
      types: [
        { name: 'Invoices', icon: '📄', config: 'Line Items, Tax Calculation' },
        { name: 'EOBs', icon: '📊', config: 'Claim Matching, Payment Posting' },
        { name: 'Receipts', icon: '🧾', config: 'Amount Extraction, Categorization' },
        { name: 'Bank Statements', icon: '🏦', config: 'Transaction Parsing, Reconciliation' },
      ],
    },
    {
      category: 'Identity',
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      icon: '🪪',
      types: [
        { name: 'Driver License', icon: '🚗', config: 'State Detection, Expiry Check' },
        { name: 'Passport', icon: '✈️', config: 'MRZ Parsing, Country Validation' },
        { name: 'ID Cards', icon: '🎫', config: 'Format Recognition, Data Extract' },
        { name: 'Insurance Cards', icon: '💳', config: 'Provider Lookup, Coverage Info' },
      ],
    },
  ];

  const configOptions = [
    { name: 'OCR Provider', options: ['Google Vision', 'Azure CV', 'AWS Textract'], icon: '🔍' },
    { name: 'AI Model', options: ['Gemini 2.5', 'GPT-4o', 'Claude 3.5'], icon: '🧠' },
    { name: 'Output Format', options: ['JSON', 'FHIR R4', 'HL7', 'CSV'], icon: '📤' },
    { name: 'Validation', options: ['Schema Check', 'Business Rules', 'Cross-Ref'], icon: '✅' },
  ];

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Document Configuration Reference</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize} className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-800">
            <ExternalLink className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          ref={diagramRef}
          className="relative w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-6"
          style={{ minWidth: '1100px' }}
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-center text-white mb-2">
            Document Configuration Reference
          </h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Supported document types, categories, and processing configurations
          </p>

          {/* Document Categories Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {documentCategories.map((cat) => (
              <div 
                key={cat.category}
                className={`bg-gradient-to-br ${cat.color} ${cat.borderColor} border-2 rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="text-base font-bold text-white">{cat.category}</h3>
                </div>
                
                <div className="space-y-2">
                  {cat.types.map((type) => (
                    <div key={type.name} className="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{type.icon}</span>
                        <span className="text-xs text-white font-medium">{type.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-5">{type.config}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Options */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
            <h3 className="text-base font-semibold text-cyan-400 mb-3 text-center">
              Processing Configuration Options
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {configOptions.map((config) => (
                <div key={config.name} className="bg-slate-900/80 border border-slate-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm font-medium text-white">{config.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {config.options.map((opt) => (
                      <span 
                        key={opt} 
                        className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Processing Hints Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span>✅</span> Auto-Enabled Features
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1">
                <li>• Table Extraction (for structured docs)</li>
                <li>• PHI Detection (for healthcare)</li>
                <li>• Medication Lookup (for Rx)</li>
                <li>• Code Intelligence (for billing)</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <span>⚙️</span> Configurable Settings
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1">
                <li>• OCR Provider Selection</li>
                <li>• AI Model Preference</li>
                <li>• Output Format</li>
                <li>• Validation Rules</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <span>🔄</span> Output Formats
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1">
                <li>• JSON (Standard API)</li>
                <li>• FHIR R4 (Healthcare)</li>
                <li>• HL7 v2/v3 (Clinical)</li>
                <li>• CSV/Excel (Analytics)</li>
              </ul>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-400">Healthcare Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-400">Medical Imaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[10px] text-slate-400">Financial Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-[10px] text-slate-400">Identity Documents</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-3 text-center">
          Document types are auto-detected and configured with appropriate processing hints, validation rules, and output formats
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentConfigurationReferenceDiagram;
