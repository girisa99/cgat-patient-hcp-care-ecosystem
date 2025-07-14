import { createRoot } from 'react-dom/client';
import React from 'react';
import './index.css';

console.log('🚀 main.tsx is loading...');

// Simple working app component
const App = () => {
  console.log('🎯 App component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>🎉 React App is Working!</h1>
      <p>Your development server is now working properly.</p>
      <p style={{ color: 'blue' }}>This is your main React application.</p>
    </div>
  );
};

console.log('🚀 Creating React root...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  const root = createRoot(rootElement);
  console.log('🚀 Rendering app...');
  root.render(<App />);
  console.log('✅ App rendered successfully!');
}
