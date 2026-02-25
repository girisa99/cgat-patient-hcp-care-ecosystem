import React from 'react';
import { useUniversalAI } from '@/hooks/useUniversalAI';

// Component to research npm packages using Universal AI
const PackageResearch = () => {
  const { generateResponse, isLoading } = useUniversalAI();

  const researchPackages = async () => {
    try {
      const response = await generateResponse({
        prompt: `I need to find the correct npm package names for Model Context Protocol packages. I'm looking for:
1. @modelcontextprotocol/server
2. @modelcontextprotocol/client  
3. eslint-plugin-duplicate-prevention

Can you help me find the correct package names that exist on npm? Please provide the exact package names I should use for npm install.`,
        provider: 'claude',
        systemPrompt: "You are a helpful npm package expert. Provide accurate package names that exist on the public npm registry.",
        temperature: 0.3,
        maxTokens: 1000
      });

      if (!response?.content) {
        throw new Error('No response from AI');
      }

      console.log('AI Response:', response.content);

      // Update the page content with AI response
      const container = document.getElementById('research-results');
      if (container) {
        const heading = document.createElement('h3');
        heading.textContent = 'AI Package Research Results:';
        
        const content = document.createElement('div');
        const pre = document.createElement('pre');
        pre.style.cssText = 'white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;';
        pre.textContent = response.content;
        content.appendChild(pre);
        
        container.appendChild(heading);
        container.appendChild(content);
      }

    } catch (error) {
      console.error('Error researching packages:', error);
      const container = document.getElementById('research-results');
      if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Error: ${error.message || 'Failed to research packages'}`;
        container.replaceChildren(errorDiv);
      }
    }
  };

  // Auto-run research when component mounts
  React.useEffect(() => {
    researchPackages();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Package Research in Progress...</h2>
      <p>{isLoading ? 'Using Universal AI to research correct npm package names...' : 'Research completed!'}</p>
      <p>Check the console and page for results.</p>
      <div id="research-results"></div>
    </div>
  );
};

export default PackageResearch;