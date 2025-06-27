
import React from 'react';
import { useDesignSystem } from './DesignSystemProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ColorSwatchProps {
  name: string;
  value: string;
  className?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, value, className }) => (
  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
    <div 
      className={`w-8 h-8 rounded-md border border-border ${className}`}
      style={{ backgroundColor: value }}
    />
    <div className="flex-1">
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-muted-foreground">{value}</div>
    </div>
  </div>
);

export const ColorPalette: React.FC = () => {
  const { colors } = useDesignSystem();

  const systemColors = [
    { name: 'Primary', value: colors.primary },
    { name: 'Secondary', value: colors.secondary },
    { name: 'Success', value: colors.success },
    { name: 'Warning', value: colors.warning },
    { name: 'Error', value: colors.error },
    { name: 'Info', value: colors.info },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design System Colors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {systemColors.map((color) => (
          <ColorSwatch
            key={color.name}
            name={color.name}
            value={color.value}
          />
        ))}
      </CardContent>
    </Card>
  );
};
