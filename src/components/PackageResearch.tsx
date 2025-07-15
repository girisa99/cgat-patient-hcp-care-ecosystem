import { supabase } from "@/integrations/supabase/client";

// Component to research npm packages using Claude AI
export const PackageResearch = () => {
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
      
      // Display the response
      const responseDiv = document.createElement('div');
      responseDiv.innerHTML = `
        <h3>Claude AI Package Research Results:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.response}</pre>
      `;
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