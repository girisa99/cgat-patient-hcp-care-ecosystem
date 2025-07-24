import { supabase } from "@/integrations/supabase/client";

// Component to research npm packages using Claude AI
const PackageResearch = () => {
  const researchPackages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('claude-ai-chat', {
        body: {
          message: `I need to find the correct npm package names for Model Context Protocol packages. I'm looking for:
1. @modelcontextprotocol/server
2. @modelcontextprotocol/client  
3. eslint-plugin-duplicate-prevention

Can you help me find the correct package names that exist on npm? Please provide the exact package names I should use for npm install.`,
          model: "claude-sonnet-4-20250514",
          systemPrompt: "You are a helpful npm package expert. Provide accurate package names that exist on the public npm registry.",
          maxTokens: 1000,
          temperature: 0.1
        }
      });

      if (error) {
        console.error('Error calling Claude AI:', error);
        return;
      }

      console.log('Claude AI Response:', data.response);
      
      // Display the response safely (no XSS risk)
      const responseDiv = document.createElement('div');
      
      const heading = document.createElement('h3');
      heading.textContent = 'Claude AI Package Research Results:';
      
      const pre = document.createElement('pre');
      pre.style.background = '#f5f5f5';
      pre.style.padding = '15px';
      pre.style.borderRadius = '5px';
      pre.style.whiteSpace = 'pre-wrap';
      pre.textContent = data.response; // Safe text content, no HTML injection
      
      responseDiv.appendChild(heading);
      responseDiv.appendChild(pre);
      document.body.appendChild(responseDiv);
      
    } catch (err) {
      console.error('Failed to research packages:', err);
    }
  };

  // Auto-run the research
  researchPackages();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Package Research in Progress...</h2>
      <p>Using Claude AI to research correct npm package names...</p>
      <p>Check the console and page for results.</p>
    </div>
  );
};

export default PackageResearch;