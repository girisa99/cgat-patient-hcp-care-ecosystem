
import React from 'react';
import { useDesignSystem } from './DesignSystemProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpacingDemoProps {
  size: keyof ReturnType<typeof useDesignSystem>['spacing'];
  value: string;
}

const SpacingDemo: React.FC<SpacingDemoProps> = ({ size, value }) => (
  <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex items-center space-x-2">
      <div 
        className="bg-primary/20 border-2 border-primary/40 rounded"
        style={{ width: value, height: '1rem' }}
      />
      <span className="text-sm font-mono">{size}</span>
    </div>
    <span className="text-xs text-muted-foreground">{value}</span>
  </div>
);

export const SpacingSystem: React.FC = () => {
  const { spacing } = useDesignSystem();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spacing System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(spacing).map(([size, value]) => (
          <SpacingDemo
            key={size}
            size={size as keyof typeof spacing}
            value={value}
          />
        ))}
      </CardContent>
    </Card>
  );
};
