import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simplified bootstrap - disable complex stability systems temporarily

console.log('🚀 Starting simplified app...');

createRoot(document.getElementById("root")!).render(<App />);

console.log('✅ App rendered successfully');
