import React from 'react';
import { Helmet } from 'react-helmet-async';
import AppLayout from '@/components/layout/AppLayout';
import MCPDemoComponent from '@/components/MCPDemoComponent';

const MCPDemo: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Helmet>
          <title>MCP Tools | Model Context Protocol Demo</title>
          <meta name="description" content="Run MCP tools and inspect results for your agent ecosystem." />
          <link rel="canonical" href="/mcp" />
        </Helmet>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Model Context Protocol (MCP) Tools</h1>
          <p className="text-muted-foreground">Start/stop servers and run tools for your agent workflows.</p>
        </div>
        <MCPDemoComponent />
      </div>
    </AppLayout>
  );
};

export default MCPDemo;
