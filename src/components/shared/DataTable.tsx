
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  icon?: React.ReactNode;
  onAdd?: () => void;
  addButtonText?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Reusable data table component for consistent UI across modules
 */
export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  icon,
  onAdd,
  addButtonText = "Add Item",
  isLoading,
  emptyMessage = "No data found"
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{emptyMessage}</p>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || onAdd) && (
        <div className="flex justify-between items-center">
          {title && (
            <h3 className="text-lg font-medium flex items-center gap-2">
              {icon}
              {title} ({data.length})
            </h3>
          )}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    {column.render 
                      ? column.render(item)
                      : String((item as any)[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
