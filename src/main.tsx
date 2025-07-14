console.log('🚀 Step 1: main.tsx file is being parsed');

import { createRoot } from 'react-dom/client';
console.log('🚀 Step 2: React DOM imported successfully');

import React from 'react';
console.log('🚀 Step 3: React imported successfully');

console.log('🚀 Step 4: About to create simple component');

const SimpleApp = () => {
  console.log('🚀 Step 6: SimpleApp component rendering');
  return React.createElement('div', 
    { style: { padding: '20px', fontFamily: 'Arial' } },
    React.createElement('h1', null, 'React is Working!'),
    React.createElement('p', null, 'This proves React can render successfully.')
  );
};

console.log('🚀 Step 5: SimpleApp component created');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  console.log('✅ React root created, rendering app...');
  root.render(React.createElement(SimpleApp));
  console.log('✅ React app rendered successfully!');
}
