import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👉 Initialize background services (Registry Fix Agent, etc.)
import { startBackgroundServices } from './bootstrap';

console.log('🚀 Starting main.tsx...');

// Ensure background services start once
startBackgroundServices();

console.log('🚀 About to render App...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('✅ App rendered successfully');
