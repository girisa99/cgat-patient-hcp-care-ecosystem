import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost';
  size?: 'sm' | 'lg' | 'icon' | 'default';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({
  icon,
  label,
  onClick,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  loading = false,
  className = ''
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      disabled={disabled}
      loading={loading}
      icon={icon}
      iconPosition="left"
      onClick={onClick}
      className={className}
    >
      {label}
    </Button>
  );
});
ActionButton.displayName = 'ActionButton';

export interface BulkActionConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  handler: (selectedItems: string[]) => void;
  permission: string;
  variant?: 'default' | 'outline' | 'destructive';
}

export const BulkActions: React.FC<{
  selectedItems: string[];
  actions: BulkActionConfig[];
  permissions: string[];
  onClearSelection?: () => void;
}> = ({ selectedItems, actions, permissions, onClearSelection }) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-blue-700">
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
        </span>
        {onClearSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        {actions
          .filter(action => permissions.includes(action.permission))
          .map(action => (
            <ActionButton
              key={action.id}
              icon={action.icon}
              label={action.label}
              onClick={() => action.handler(selectedItems)}
              variant={action.variant || 'outline'}
              size="sm"
            />
          ))
        }
      </div>
    </div>
  );
};
