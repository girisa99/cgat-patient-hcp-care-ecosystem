import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleAgentBuilderProps {
  step?: string;
}

export const SimpleAgentBuilder: React.FC<SimpleAgentBuilderProps> = ({ step }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Builder - {step}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Agent builder for step: {step}</p>
        <p>This is a simplified version to debug React error #185</p>
      </CardContent>
    </Card>
  );
};