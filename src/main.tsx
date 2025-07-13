import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👉 Initialize core services only (simplified)
import { startBackgroundServices } from './bootstrap';

console.log('🚀 Starting main.tsx...');

// Ensure core services start (simplified)
startBackgroundServices();

console.log('🚀 About to render App...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('✅ App rendered successfully');
