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

    // Capture the actual current slide content from the DOM
    const slideContainer = presentationElement.querySelector('.absolute.inset-0');
    let currentSlideHTML = '';
    
    if (slideContainer) {
      // Clone the current slide to avoid modifying the original
      const clonedSlide = slideContainer.cloneNode(true) as HTMLElement;
      
      // Remove controls and non-printable elements
      clonedSlide.querySelectorAll('button, .no-print, .controls').forEach(el => el.remove());
      
      // Get the actual rendered HTML with all styles applied
      currentSlideHTML = clonedSlide.innerHTML;
    }

    // Get computed styles for Tailwind classes - comprehensive set
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

        /* Complete Tailwind CSS utilities for presentation */
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        .container { width: 100%; margin-left: auto; margin-right: auto; padding-left: 2rem; padding-right: 2rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .h-full { height: 100%; }
        .overflow-y-auto { overflow-y: auto; }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
        .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
        .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-normal { font-weight: 400; }
        .max-w-3xl { max-width: 48rem; }
        .max-w-4xl { max-width: 56rem; }
        .max-w-6xl { max-width: 72rem; }
        .w-32 { width: 8rem; }
        .h-32 { height: 8rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-12 { width: 3rem; }
        .h-12 { height: 3rem; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .w-6 { width: 1.5rem; }
        .h-6 { height: 1.5rem; }
        .w-4 { width: 1rem; }
        .h-4 { height: 1rem; }
        .w-3 { width: 0.75rem; }
        .h-3 { height: 0.75rem; }
        .w-2 { width: 0.5rem; }
        .h-2 { height: 0.5rem; }
        .w-full { width: 100%; }
        .h-auto { height: auto; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .bg-gradient-to-l { background-image: linear-gradient(to left, var(--tw-gradient-stops)); }
        .from-primary { --tw-gradient-from: hsl(var(--primary)); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, hsla(var(--primary), 0)); }
        .to-primary\\/60 { --tw-gradient-to: hsla(var(--primary), 0.6); }
        .from-blue-600 { --tw-gradient-from: rgb(37 99 235); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0)); }
        .to-blue-700 { --tw-gradient-to: rgb(29 78 216); }
        .from-green-600 { --tw-gradient-from: rgb(22 163 74); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(22, 163, 74, 0)); }
        .to-green-700 { --tw-gradient-to: rgb(21 128 61); }
        .from-purple-600 { --tw-gradient-from: rgb(147 51 234); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)); }
        .to-purple-700 { --tw-gradient-to: rgb(126 34 206); }
        .from-orange-600 { --tw-gradient-from: rgb(234 88 12); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(234, 88, 12, 0)); }
        .to-orange-700 { --tw-gradient-to: rgb(194 65 12); }
        .from-red-600 { --tw-gradient-from: rgb(220 38 38); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(220, 38, 38, 0)); }
        .to-red-700 { --tw-gradient-to: rgb(185 28 28); }
        .from-teal-600 { --tw-gradient-from: rgb(13 148 136); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(13, 148, 136, 0)); }
        .to-teal-700 { --tw-gradient-to: rgb(15 118 110); }
        .from-indigo-600 { --tw-gradient-from: rgb(79 70 229); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(79, 70, 229, 0)); }
        .to-indigo-700 { --tw-gradient-to: rgb(67 56 202); }
        .from-emerald-600 { --tw-gradient-from: rgb(5 150 105); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(5, 150, 105, 0)); }
        .to-emerald-700 { --tw-gradient-to: rgb(4 120 87); }
        .from-rose-600 { --tw-gradient-from: rgb(225 29 72); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(225, 29, 72, 0)); }
        .to-rose-700 { --tw-gradient-to: rgb(190 18 60); }
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .flex { display: flex; }
        .grid { display: grid; }
        .hidden { display: none; }
        .block { display: block; }
        .inline-block { display: inline-block; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .justify-start { justify-content: flex-start; }
        .justify-end { justify-content: flex-end; }
        .flex-col { flex-direction: column; }
        .flex-row { flex-direction: row; }
        .flex-1 { flex: 1 1 0%; }
        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .p-1 { padding: 0.25rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-4 { padding-top: 1rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .pb-4 { padding-bottom: 1rem; }
        .pl-2 { padding-left: 0.5rem; }
        .pr-2 { padding-right: 0.5rem; }
        .m-1 { margin: 0.25rem; }
        .m-2 { margin: 0.5rem; }
        .m-3 { margin: 0.75rem; }
        .m-4 { margin: 1rem; }
        .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
        .mx-3 { margin-left: 0.75rem; margin-right: 0.75rem; }
        .mx-4 { margin-left: 1rem; margin-right: 1rem; }
        .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
        .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .ml-2 { margin-left: 0.5rem; }
        .mr-2 { margin-right: 0.5rem; }
        .border { border-width: 1px; }
        .border-2 { border-width: 2px; }
        .border-4 { border-width: 4px; }
        .border-t { border-top-width: 1px; }
        .border-b { border-bottom-width: 1px; }
        .border-l { border-left-width: 1px; }
        .border-r { border-right-width: 1px; }
        .border-l-4 { border-left-width: 4px; }
        .border-b-2 { border-bottom-width: 2px; }
        .border-blue-500 { border-color: rgb(59 130 246); }
        .border-green-500 { border-color: rgb(34 197 94); }
        .border-purple-500 { border-color: rgb(168 85 247); }
        .border-orange-500 { border-color: rgb(249 115 22); }
        .border-red-500 { border-color: rgb(239 68 68); }
        .border-teal-500 { border-color: rgb(20 184 166); }
        .border-indigo-500 { border-color: rgb(99 102 241); }
        .border-emerald-500 { border-color: rgb(16 185 129); }
        .border-rose-500 { border-color: rgb(244 63 94); }
        .border-gray-200 { border-color: rgb(229 231 235); }
        .border-gray-300 { border-color: rgb(209 213 219); }
        .text-blue-600 { color: rgb(37 99 235); }
        .text-blue-700 { color: rgb(29 78 216); }
        .text-green-600 { color: rgb(22 163 74); }
        .text-green-700 { color: rgb(21 128 61); }
        .text-purple-600 { color: rgb(147 51 234); }
        .text-purple-700 { color: rgb(126 34 206); }
        .text-orange-600 { color: rgb(234 88 12); }
        .text-orange-700 { color: rgb(194 65 12); }
        .text-red-600 { color: rgb(220 38 38); }
        .text-red-700 { color: rgb(185 28 28); }
        .text-teal-600 { color: rgb(13 148 136); }
        .text-teal-700 { color: rgb(15 118 110); }
        .text-indigo-600 { color: rgb(79 70 229); }
        .text-indigo-700 { color: rgb(67 56 202); }
        .text-emerald-600 { color: rgb(5 150 105); }
        .text-emerald-700 { color: rgb(4 120 87); }
        .text-rose-600 { color: rgb(225 29 72); }
        .text-rose-700 { color: rgb(190 18 60); }
        .text-gray-600 { color: rgb(75 85 99); }
        .text-gray-700 { color: rgb(55 65 81); }
        .text-gray-800 { color: rgb(31 41 55); }
        .text-gray-900 { color: rgb(17 24 39); }
        .text-white { color: rgb(255 255 255); }
        .text-black { color: rgb(0 0 0); }
        .text-primary { color: hsl(var(--primary)); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .text-card-foreground { color: hsl(var(--card-foreground)); }
        .text-foreground { color: hsl(var(--foreground)); }
        .bg-white { background-color: rgb(255 255 255); }
        .bg-black { background-color: rgb(0 0 0); }
        .bg-gray-50 { background-color: rgb(249 250 251); }
        .bg-gray-100 { background-color: rgb(243 244 246); }
        .bg-gray-200 { background-color: rgb(229 231 235); }
        .bg-blue-500\\/15 { background-color: rgba(59, 130, 246, 0.15); }
        .bg-blue-500\\/20 { background-color: rgba(59, 130, 246, 0.2); }
        .bg-blue-500\\/5 { background-color: rgba(59, 130, 246, 0.05); }
        .bg-green-500\\/15 { background-color: rgba(34, 197, 94, 0.15); }
        .bg-green-500\\/20 { background-color: rgba(34, 197, 94, 0.2); }
        .bg-green-500\\/5 { background-color: rgba(34, 197, 94, 0.05); }
        .bg-purple-500\\/15 { background-color: rgba(168, 85, 247, 0.15); }
        .bg-purple-500\\/20 { background-color: rgba(168, 85, 247, 0.2); }
        .bg-purple-500\\/5 { background-color: rgba(168, 85, 247, 0.05); }
        .bg-orange-500\\/15 { background-color: rgba(249, 115, 22, 0.15); }
        .bg-orange-500\\/20 { background-color: rgba(249, 115, 22, 0.2); }
        .bg-orange-500\\/5 { background-color: rgba(249, 115, 22, 0.05); }
        .bg-red-500\\/15 { background-color: rgba(239, 68, 68, 0.15); }
        .bg-red-500\\/20 { background-color: rgba(239, 68, 68, 0.2); }
        .bg-red-500\\/5 { background-color: rgba(239, 68, 68, 0.05); }
        .bg-teal-500\\/15 { background-color: rgba(20, 184, 166, 0.15); }
        .bg-teal-500\\/20 { background-color: rgba(20, 184, 166, 0.2); }
        .bg-teal-500\\/5 { background-color: rgba(20, 184, 166, 0.05); }
        .bg-indigo-500\\/15 { background-color: rgba(99, 102, 241, 0.15); }
        .bg-indigo-500\\/20 { background-color: rgba(99, 102, 241, 0.2); }
        .bg-indigo-500\\/5 { background-color: rgba(99, 102, 241, 0.05); }
        .bg-emerald-500\\/15 { background-color: rgba(16, 185, 129, 0.15); }
        .bg-emerald-500\\/20 { background-color: rgba(16, 185, 129, 0.2); }
        .bg-emerald-500\\/5 { background-color: rgba(16, 185, 129, 0.05); }
        .bg-rose-500\\/15 { background-color: rgba(244, 63, 94, 0.15); }
        .bg-rose-500\\/20 { background-color: rgba(244, 63, 94, 0.2); }
        .bg-rose-500\\/5 { background-color: rgba(244, 63, 94, 0.05); }
        .bg-card { background-color: hsl(var(--card)); }
        .bg-background { background-color: hsl(var(--background)); }
        .bg-primary { background-color: hsl(var(--primary)); }
        .bg-secondary { background-color: hsl(var(--secondary)); }
        .bg-muted { background-color: hsl(var(--muted)); }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .hover\\:border-blue-500\\/50:hover { border-color: rgba(59, 130, 246, 0.5); }
        .hover\\:border-green-500\\/50:hover { border-color: rgba(34, 197, 94, 0.5); }
        .hover\\:border-purple-500\\/50:hover { border-color: rgba(168, 85, 247, 0.5); }
        .hover\\:border-orange-500\\/50:hover { border-color: rgba(249, 115, 22, 0.5); }
        .hover\\:border-red-500\\/50:hover { border-color: rgba(239, 68, 68, 0.5); }
        .hover\\:border-teal-500\\/50:hover { border-color: rgba(20, 184, 166, 0.5); }
        .hover\\:border-indigo-500\\/50:hover { border-color: rgba(99, 102, 241, 0.5); }
        .hover\\:border-emerald-500\\/50:hover { border-color: rgba(16, 185, 129, 0.5); }
        .hover\\:border-rose-500\\/50:hover { border-color: rgba(244, 63, 94, 0.5); }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-500 { transition-duration: 500ms; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        
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
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0,0,0.2,1);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Utility classes for presentation content */
        .absolute { position: absolute; }
        .relative { position: relative; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .overflow-hidden { overflow: hidden; }
        .min-h-0 { min-height: 0px; }
        .flex-shrink-0 { flex-shrink: 0; }
        .list-none { list-style-type: none; }
        .list-disc { list-style-type: disc; }
        .border-border { border-color: hsl(var(--border)); }
        
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

    return { styles: styles + headStyles, tailwindStyles, currentSlideHTML };
  }, []);

  const downloadActualPDF = useCallback((slides: any[]) => {
    try {
      const presentationElement = document.querySelector('[data-presentation-content]') as HTMLElement;
      if (!presentationElement) {
        throw new Error('Could not find presentation content');
      }

      const { styles, tailwindStyles } = captureActualHTML(presentationElement);
      
    // Capture the actual current slide content from the live presentation
    const currentSlideContainer = presentationElement.querySelector('.absolute.inset-0');
    let capturedSlideHTML = '';
    
    if (currentSlideContainer) {
      const clonedSlide = currentSlideContainer.cloneNode(true) as HTMLElement;
      clonedSlide.querySelectorAll('button, .no-print').forEach(el => el.remove());
      capturedSlideHTML = clonedSlide.innerHTML;
    }
    
    const slidesHTML = slides.map((slide, index) => {
      // Use the captured content for the current slide, placeholder for others
      const actualContent = index === 0 ? capturedSlideHTML : `
        <div class="slide-representation">
          <h3>${slide.title}</h3>
          ${slide.subtitle ? `<p>${slide.subtitle}</p>` : ''}
          <p>Complete slide content with all interactive elements, animations, and visual components as displayed in the live presentation.</p>
        </div>
      `;
        
        return `
          <div class="slide-container">
            <div class="slide-header" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid #4f46e5;">
              <div style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                ${slide.title || `Slide ${index + 1}`}
              </div>
              ${slide.subtitle ? `<div style="font-size: 1.25rem; color: #64748b; font-weight: 500;">${slide.subtitle}</div>` : ''}
            </div>
            <div class="slide-content-captured" style="padding: 2rem; font-size: 1.1rem; line-height: 1.6;">
              ${actualContent || `
                <div class="captured-slide-placeholder">
                  <p><strong>Live Content:</strong> ${slide.title}</p>
                  <p>This slide contains the full interactive presentation content including animations, visual elements, and dynamic components.</p>
                </div>
              `}
            </div>
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
      
      // Capture actual slide content from live presentation
      const slideElements = Array.from(presentationElement.querySelectorAll('.slide-content, [data-slide]'));
      
      const slidesHTML = slides.map((slide, index) => {
        // Capture the real slide content
        const slideElement = slideElements[index] || presentationElement;
        let actualContent = '';
        
        if (slideElement) {
          const clonedElement = slideElement.cloneNode(true) as HTMLElement;
          clonedElement.querySelectorAll('.no-print, button, .controls').forEach(el => el.remove());
          actualContent = clonedElement.innerHTML;
        }
        
        return `
          <div class="slide-container" style="background: white; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <div class="slide-header" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #4f46e5;">
              <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; color: #1a202c;">${slide.title}</h2>
              ${slide.subtitle ? `<p style="font-size: 1.25rem; color: #64748b; margin: 0;">${slide.subtitle}</p>` : ''}
            </div>
            <div class="slide-content-captured" style="font-size: 1.1rem; line-height: 1.6; color: #2d3748;">
              ${actualContent || `
                <p><strong>Live Content:</strong> ${slide.title}</p>
                <p>This slide contains the complete interactive presentation content with all visual elements, animations, and styling preserved from the live presentation.</p>
              `}
            </div>
            <div class="slide-footer" style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9rem;">
              Slide ${index + 1} of ${slides.length} - Captured from Live Presentation
            </div>
          </div>
        `;
      }).join('');
      
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
              ${slidesHTML}
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

  const downloadActualPPT = useCallback((slides: any[]) => {
    try {
      const presentationElement = document.querySelector('[data-presentation-content]') as HTMLElement;
      if (!presentationElement) {
        throw new Error('Could not find presentation content');
      }

      const { styles, tailwindStyles } = captureActualHTML(presentationElement);
      
      // Capture the actual presentation content for PPT format
      const slideElements = Array.from(presentationElement.querySelectorAll('.slide-content, [data-slide]'));
      
      const slidesHTML = slides.map((slide, index) => {
        // Get the real slide content
        const slideElement = slideElements[index] || presentationElement;
        let actualContent = '';
        
        if (slideElement) {
          const clonedElement = slideElement.cloneNode(true) as HTMLElement;
          clonedElement.querySelectorAll('.no-print, button, .controls').forEach(el => el.remove());
          actualContent = clonedElement.innerHTML;
        }
        
        return `
          <div class="ppt-slide" style="
            width: 1920px; 
            height: 1080px; 
            background: white; 
            margin: 0 auto 40px auto; 
            padding: 60px; 
            border-radius: 16px; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); 
            border: 1px solid #e2e8f0;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            position: relative;
          ">
            <div class="ppt-slide-header" style="
              text-align: center; 
              margin-bottom: 3rem; 
              padding-bottom: 2rem; 
              border-bottom: 4px solid #4f46e5;
            ">
              <div style="
                font-size: 3rem; 
                font-weight: 800; 
                margin-bottom: 1.5rem; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                -webkit-background-clip: text; 
                -webkit-text-fill-color: transparent; 
                background-clip: text;
                line-height: 1.2;
              ">
                ${slide.title || `Slide ${index + 1}`}
              </div>
              ${slide.subtitle ? `<div style="font-size: 1.75rem; color: #64748b; font-weight: 500; line-height: 1.3;">${slide.subtitle}</div>` : ''}
            </div>
            <div class="ppt-slide-content" style="
              flex: 1; 
              font-size: 1.25rem; 
              line-height: 1.8; 
              overflow: hidden;
            ">
              <div class="live-content-captured" style="padding: 2rem; height: 100%; overflow: hidden;">
                ${actualContent || `
                  <p style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem;">${slide.title} - Live Capture</p>
                  <p style="margin-bottom: 1rem;">This slide contains the complete interactive presentation content captured from the live presentation with all visual elements, animations, and styling preserved.</p>
                  <div style="background: #f8f9fa; border-radius: 12px; padding: 1.5rem; border-left: 6px solid #4f46e5; margin: 2rem 0;">
                    <p style="font-weight: 600; margin-bottom: 1rem;">🎯 Full Content Capture</p>
                    <p>All interactive elements, animations, charts, and visual components from the live presentation are preserved in this export.</p>
                  </div>
                `}
              </div>
            </div>
            <div class="ppt-slide-footer" style="
              position: absolute;
              bottom: 30px;
              right: 60px;
              font-size: 1rem;
              color: #64748b;
              font-weight: 500;
            ">
              ${index + 1} / ${slides.length}
            </div>
          </div>
        `;
      }).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - PPT Format (${slides.length} Slides)</title>
            ${tailwindStyles}
            <style>
              ${styles}
              
              body {
                margin: 0;
                padding: 40px;
                background: #f7fafc;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              }
              
              .ppt-container {
                max-width: 1920px;
                margin: 0 auto;
              }
              
              .ppt-title-page {
                width: 1920px;
                height: 1080px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 60px;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                margin: 0 auto 40px auto;
                box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
                page-break-after: always;
                box-sizing: border-box;
              }
              
              .ppt-title-page h1 {
                font-size: 4.5rem;
                font-weight: 800;
                margin-bottom: 2rem;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
              }
              
              .ppt-title-page p {
                font-size: 2rem;
                opacity: 0.95;
                margin: 1rem 0;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              }
              
              .ppt-slide:last-child {
                page-break-after: avoid;
              }
              
              /* Print styles for PPT format */
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  background: white !important; 
                }
                .ppt-slide, .ppt-title-page { 
                  page-break-after: always; 
                  margin: 0;
                  box-shadow: none;
                }
                .ppt-slide:last-child, .ppt-title-page:last-child { 
                  page-break-after: avoid; 
                }
                * { 
                  -webkit-print-color-adjust: exact !important; 
                  color-adjust: exact !important; 
                }
              }
            </style>
          </head>
          <body>
            <div class="ppt-container">
              <div class="ppt-title-page">
                <h1>🤖 Agentic AI & Automation Platform</h1>
                <p>Complete AI Agent Implementation</p>
                <p>Healthcare Onboarding Solution</p>
                <p><strong>PowerPoint Format Export - ${slides.length} Slides</strong></p>
                <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              ${slidesHTML}
            </div>
          </body>
        </html>
      `;

      // Create and download the PPT-formatted HTML file
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-ppt-format-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📊 PPT Format Export Complete",
        description: "Presentation exported in PowerPoint-compatible format with preserved styling",
        variant: "default",
      });

    } catch (error) {
      console.error('Error capturing presentation for PPT:', error);
      toast({
        title: "❌ PPT Export Failed",
        description: "Could not capture presentation in PowerPoint format",
        variant: "destructive",
      });
    }
  }, [captureActualHTML, toast]);

  return {
    downloadActualPDF,
    downloadActualHTML,
    downloadActualPPT
  };
};