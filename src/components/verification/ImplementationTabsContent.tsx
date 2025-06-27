
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Target } from 'lucide-react';
import { ImplementationItem } from './types/implementationTypes';
import ImplementationItemCard from './ImplementationItemCard';

interface ImplementationTabsContentProps {
  items: ImplementationItem[];
  onToggleItem: (id: string) => void;
}

const ImplementationTabsContent: React.FC<ImplementationTabsContentProps> = ({ 
  items, 
  onToggleItem 
}) => {
  const criticalItems = items.filter(item => item.priority === 'critical');
  const highPriorityItems = items.filter(item => item.priority === 'high');
  const otherItems = items.filter(item => !['critical', 'high'].includes(item.priority));
  const completedItems = items.filter(item => item.completed);

  return (
    <>
      <TabsContent value="critical" className="space-y-4">
        <div className="space-y-3">
          {criticalItems.map((item) => (
            <ImplementationItemCard
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              variant="critical"
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="high" className="space-y-4">
        <div className="space-y-3">
          {highPriorityItems.map((item) => (
            <ImplementationItemCard
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              variant="high"
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="other" className="space-y-4">
        <div className="space-y-3">
          {otherItems.map((item) => (
            <ImplementationItemCard
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              variant="default"
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <div className="space-y-3">
          {completedItems.map((item) => (
            <ImplementationItemCard
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              variant="completed"
            />
          ))}
          {completedItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No completed tasks yet. Start with the critical issues!</p>
            </div>
          )}
        </div>
      </TabsContent>
    </>
  );
};

export default ImplementationTabsContent;
