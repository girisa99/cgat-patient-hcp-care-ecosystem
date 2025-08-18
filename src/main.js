console.log('🚀 Step 1: main.js file is being parsed');

console.log('🚀 Step 2: About to create simple vanilla JS app');

// Create a simple app without any imports first
const createSimpleApp = () => {
  console.log('🚀 Step 3: Creating simple app');
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('❌ Root element not found!');
    return;
  }
  
  console.log('✅ Root element found');
  
  // Create elements using vanilla JS
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  const title = document.createElement('h1');
  title.textContent = 'Basic JavaScript Works!';
  title.style.color = 'green';
  
  const message = document.createElement('p');
  message.textContent = 'This proves basic JavaScript can run. Now testing React...';
  
  container.appendChild(title);
  container.appendChild(message);
  
  // Clear the root safely and add our content
  while (rootElement.firstChild) {
    rootElement.removeChild(rootElement.firstChild);
  }
  rootElement.appendChild(container);
  
  console.log('✅ Basic app rendered successfully!');
  
  // Now try to load React dynamically
  loadReactApp();
};

const loadReactApp = () => {
  console.log('🚀 Step 4: Attempting to load React dynamically');
  
  // Try to import React dynamically
  import('react').then((React) => {
    console.log('✅ React imported successfully');
    
    return import('react-dom/client');
  }).then((ReactDOM) => {
    console.log('✅ ReactDOM imported successfully');
    
    // If we get here, React works - let's use it
    const React = window.React;
    const { createRoot } = ReactDOM;
    
    const ReactApp = () => {
      return React.createElement('div', 
        { style: { padding: '20px', fontFamily: 'Arial', backgroundColor: '#f0f8ff' } },
        React.createElement('h1', { style: { color: 'blue' } }, 'React is Working!'),
        React.createElement('p', null, 'Success! React has loaded and rendered properly.')
      );
    };
    
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(React.createElement(ReactApp));
    
    console.log('✅ React app rendered successfully!');
    
  }).catch((error) => {
    console.error('❌ Error loading React:', error);
    
    const rootElement = document.getElementById("root");
    const errorElement = document.createElement('p');
    errorElement.style.color = 'red';
    errorElement.style.margin = '10px 0';
    errorElement.textContent = '❌ React failed to load: ' + error.message;
    rootElement.appendChild(errorElement);
  });
};

// Start the app
console.log('🚀 Starting app...');
createSimpleApp();