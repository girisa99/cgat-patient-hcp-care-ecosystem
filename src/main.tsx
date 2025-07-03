import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👉 Initialize background services (Registry Fix Agent, etc.)
import { startBackgroundServices } from './bootstrap';

// Ensure background services start once
startBackgroundServices();

createRoot(document.getElementById("root")!).render(<App />);
