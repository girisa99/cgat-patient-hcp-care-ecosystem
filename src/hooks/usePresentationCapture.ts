import { useCallback } from 'react';
import { useToast } from './use-toast';

export const usePresentationCapture = () => {
  const { toast } = useToast();

  const captureActualHTML = useCallback((presentationElement: HTMLElement) => {
    if (!presentationElement) {
      throw new Error('Presentation element not found');
    }

    // Get all stylesheets from the document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .join('\n');

    // Get inline styles from head
    const headStyles = Array.from(document.head.querySelectorAll('style'))
      .map(style => style.textContent)
      .join('\n');

    // Get computed styles for Tailwind classes
    const tailwindStyles = `
      <style>
        /* Tailwind CSS Variables */
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96%;
          --secondary-foreground: 222.2 84% 4.9%;
          --muted: 210 40% 96%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96%;
          --accent-foreground: 222.2 84% 4.9%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
          --radius: 0.5rem;
        }
        
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 84% 4.9%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 224.3 76.3% 94.1%;
        }

        /* Essential Tailwind utilities */
        .container { width: 100%; margin-left: auto; margin-right: auto; padding-left: 2rem; padding-right: 2rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .h-full { height: 100%; }
        .overflow-y-auto { overflow-y: auto; }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
        .text-center { text-align: center; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .max-w-3xl { max-width: 48rem; }
        .w-32 { width: 8rem; }
        .h-32 { width: 8rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-3 { width: 0.75rem; }
        .h-3 { height: 0.75rem; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .from-primary { --tw-gradient-from: hsl(var(--primary)); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, hsla(var(--primary), 0)); }
        .to-primary\\/60 { --tw-gradient-to: hsla(var(--primary), 0.6); }
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .flex { display: flex; }
        .grid { display: grid; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .p-6 { padding: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .border-l-4 { border-left-width: 4px; }
        .border-2 { border-width: 2px; }
        .border-blue-500 { border-color: rgb(59 130 246); }
        .border-green-500 { border-color: rgb(34 197 94); }
        .border-purple-500 { border-color: rgb(168 85 247); }
        .border-orange-500 { border-color: rgb(249 115 22); }
        .border-red-500 { border-color: rgb(239 68 68); }
        .border-teal-500 { border-color: rgb(20 184 166); }
        .border-indigo-500 { border-color: rgb(99 102 241); }
        .border-emerald-500 { border-color: rgb(16 185 129); }
        .border-rose-500 { border-color: rgb(244 63 94); }
        .text-blue-600 { color: rgb(37 99 235); }
        .text-green-600 { color: rgb(22 163 74); }
        .text-purple-700 { color: rgb(126 34 206); }
        .text-orange-700 { color: rgb(194 65 12); }
        .text-red-700 { color: rgb(185 28 28); }
        .text-teal-700 { color: rgb(15 118 110); }
        .text-indigo-600 { color: rgb(79 70 229); }
        .text-emerald-600 { color: rgb(5 150 105); }
        .text-rose-600 { color: rgb(225 29 72); }
        .text-primary { color: hsl(var(--primary)); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .bg-blue-500\\/15 { background-color: rgba(59, 130, 246, 0.15); }
        .bg-green-500\\/15 { background-color: rgba(34, 197, 94, 0.15); }
        .bg-purple-500\\/20 { background-color: rgba(168, 85, 247, 0.2); }
        .bg-orange-500\\/20 { background-color: rgba(249, 115, 22, 0.2); }
        .bg-red-500\\/20 { background-color: rgba(239, 68, 68, 0.2); }
        .bg-teal-500\\/20 { background-color: rgba(20, 184, 166, 0.2); }
        .bg-indigo-500\\/15 { background-color: rgba(99, 102, 241, 0.15); }
        .bg-emerald-500\\/15 { background-color: rgba(16, 185, 129, 0.15); }
        .bg-rose-500\\/15 { background-color: rgba(244, 63, 94, 0.15); }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:border-blue-500\\/50:hover { border-color: rgba(59, 130, 246, 0.5); }
        .hover\\:border-green-500\\/50:hover { border-color: rgba(34, 197, 94, 0.5); }
        .hover\\:border-purple-500\\/50:hover { border-color: rgba(168, 85, 247, 0.5); }
        .hover\\:border-orange-500\\/50:hover { border-color: rgba(249, 115, 22, 0.5); }
        .hover\\:border-red-500\\/50:hover { border-color: rgba(239, 68, 68, 0.5); }
        .hover\\:border-teal-500\\/50:hover { border-color: rgba(20, 184, 166, 0.5); }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .duration-300 { transition-duration: 300ms; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        /* Animation keyframes */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card styles */
        .bg-card { background-color: hsl(var(--card)); }
        .text-card-foreground { color: hsl(var(--card-foreground)); }
        .bg-background { background-color: hsl(var(--background)); }
        .text-foreground { color: hsl(var(--foreground)); }
        .border { border-width: 1px; }
        .border-border { border-color: hsl(var(--border)); }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        
        /* Print styles */
        @media print {
          .no-print { display: none !important; }
          .slide-break { page-break-after: always; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body { background: white !important; }
        }
        
        /* Ensure proper styling for captured content */
        .presentation-capture {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #1a202c;
        }
        
        .presentation-capture .slide-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin: 40px auto;
          padding: 48px;
          max-width: 1200px;
          border: 1px solid #e2e8f0;
          page-break-after: always;
        }
        
        .presentation-capture .slide-container:last-child {
          page-break-after: avoid;
        }
      </style>
    `;

    return { styles: styles + headStyles, tailwindStyles };
  }, []);

  const downloadActualPDF = useCallback((slides: any[]) => {
    try {
      const presentationElement = document.querySelector('[data-presentation-content]') as HTMLElement;
      if (!presentationElement) {
        throw new Error('Could not find presentation content');
      }

      const { styles, tailwindStyles } = captureActualHTML(presentationElement);
      
      // Create individual slide elements
      const slideElements = Array.from(presentationElement.children);
      
      const slidesHTML = slideElements.map((slideEl, index) => {
        const slideHTML = slideEl.outerHTML;
        return `
          <div class="slide-container">
            <div class="slide-header" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid #4f46e5;">
              <div style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                ${slides[index]?.title || `Slide ${index + 1}`}
              </div>
              ${slides[index]?.subtitle ? `<div style="font-size: 1.25rem; color: #64748b; font-weight: 500;">${slides[index].subtitle}</div>` : ''}
            </div>
            ${slideHTML}
          </div>
        `;
      }).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - Live Capture (${slides.length} Slides)</title>
            ${tailwindStyles}
            <style>
              ${styles}
              
              body {
                margin: 0;
                padding: 20px;
                background: #f7fafc;
              }
              
              .presentation-container {
                background: white;
                max-width: 1200px;
                margin: 0 auto;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
              }
              
              .presentation-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 60px 40px;
                text-align: center;
              }
              
              .presentation-header h1 {
                font-size: 3rem;
                font-weight: 800;
                margin-bottom: 1rem;
              }
              
              .presentation-header p {
                font-size: 1.25rem;
                opacity: 0.95;
                margin: 0.75rem 0;
              }
            </style>
          </head>
          <body class="presentation-capture">
            <div class="presentation-container">
              <div class="presentation-header">
                <h1>🤖 Agentic AI & Automation Platform</h1>
                <p>Complete AI Agent Implementation for Healthcare Onboarding</p>
                <p><strong>Live Capture Export - ${slides.length} Slides</strong></p>
                <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              ${slidesHTML}
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      printWindow.document.write(fullHTML);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        toast({
          title: "📄 Live Capture PDF Ready",
          description: "Exact presentation content captured with all styling preserved",
          variant: "default",
        });
      }, 1500);

    } catch (error) {
      console.error('Error capturing presentation for PDF:', error);
      toast({
        title: "❌ PDF Capture Failed", 
        description: "Could not capture live presentation content",
        variant: "destructive",
      });
    }
  }, [captureActualHTML, toast]);

  const downloadActualHTML = useCallback((slides: any[]) => {
    try {
      const presentationElement = document.querySelector('[data-presentation-content]') as HTMLElement;
      if (!presentationElement) {
        throw new Error('Could not find presentation content');
      }

      const { styles, tailwindStyles } = captureActualHTML(presentationElement);
      
      // Capture the entire presentation content
      const fullPresentationHTML = presentationElement.outerHTML;
      
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - Live HTML Export (${slides.length} Slides)</title>
            ${tailwindStyles}
            <style>
              ${styles}
              
              body {
                margin: 0;
                padding: 20px;
                background: #f7fafc;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              }
              
              .export-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                margin-bottom: 40px;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
              }
              
              .export-header h1 {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 1rem;
              }
              
              .export-header p {
                font-size: 1.125rem;
                opacity: 0.95;
                margin: 0.5rem 0;
              }
              
              .captured-presentation {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <div class="export-header">
              <h1>🤖 Agentic AI & Automation Platform</h1>
              <p>Live HTML Export - Exact Content Capture</p>
              <p><strong>${slides.length} Slides Preserved</strong> | Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>This export contains the exact same content, styling, and animations as the live presentation</p>
            </div>
            
            <div class="captured-presentation">
              ${fullPresentationHTML}
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-live-capture-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 Live HTML Export Complete",
        description: "Exact presentation content captured with full styling preserved",
        variant: "default",
      });

    } catch (error) {
      console.error('Error capturing presentation for HTML:', error);
      toast({
        title: "❌ HTML Capture Failed",
        description: "Could not capture live presentation content", 
        variant: "destructive",
      });
    }
  }, [captureActualHTML, toast]);

  return {
    downloadActualPDF,
    downloadActualHTML
  };
};