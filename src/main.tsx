import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SecurityHeaders } from '@/utils/security/securityHeaders';
import { InputSanitizer } from '@/utils/security/inputSanitizer';

// Initialize security measures
SecurityHeaders.initialize();
InputSanitizer.initializeRateLimit();

console.log('🚀 Starting main.tsx...');
console.log('🚀 About to render App...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('✅ App rendered successfully');
