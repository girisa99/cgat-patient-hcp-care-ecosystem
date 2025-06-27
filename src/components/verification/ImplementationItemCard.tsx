
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, Shield, Palette, Zap, Code, Target } from 'lucide-react';
import { ImplementationItem } from './types/implementationTypes';

interface ImplementationItemCardProps {
  item: ImplementationItem;
  onToggle: (id: string) => void;
  variant?: 'critical' | 'high' | 'default' | 'completed';
}

const ImplementationItemCard: React.FC<ImplementationItemCardProps> = ({ 
  item, 
  onToggle, 
  variant = 'default' 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accessibility': return Shield;
      case 'ui-ux': return Palette;
      case 'security': return Shield;
      case 'performance': return Zap;
      case 'code-quality': return Code;
      default: return Target;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCardClassName = () => {
    switch (variant) {
      case 'critical': return 'border-red-200 bg-red-50/50';
      case 'high': return 'border-orange-200 bg-orange-50/50';
      case 'completed': return 'border-green-200 bg-green-50/50';
      default: return '';
    }
  };

  const getBackgroundClassName = () => {
    switch (variant) {
      case 'critical': return 'bg-white/60';
      case 'high': return 'bg-white/60';
      default: return 'bg-gray-50';
    }
  };

  const IconComponent = getCategoryIcon(item.category);

  if (item.completed && variant === 'completed') {
    return (
      <Card className={getCardClassName()}>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2 text-green-800">
                  <IconComponent className="h-4 w-4" />
                  {item.title}
                </h4>
                <Badge variant="default" className="bg-green-600">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-green-700">{item.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getCardClassName()}>
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => onToggle(item.id)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {item.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(item.priority) as any}>
                  {item.priority}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.estimatedTime}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className={`${getBackgroundClassName()} p-3 rounded border`}>
              <p className="text-xs font-medium text-blue-700">Implementation:</p>
              <p className="text-xs text-gray-600 mt-1">{item.implementation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImplementationItemCard;
