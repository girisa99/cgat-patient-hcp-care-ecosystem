import { createRoot } from 'react-dom/client'
import App from './App-minimal.tsx'
import './index.css'

console.log('🚀 Minimal main.tsx starting...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('✅ React app rendered!');
}