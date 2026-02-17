import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataPreviewTableProps {
  data: Array<Record<string, unknown>>;
  schema?: Record<string, string>;
  maxRows?: number;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  data,
  schema,
  maxRows = 10
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data to preview
      </div>
    );
  }

  const headers = Object.keys(data[0]);
  const previewData = data.slice(0, maxRows);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Preview</h3>
        <Badge variant="outline">
          Showing {previewData.length} of {data.length} rows
        </Badge>
      </div>

      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="min-w-[100px]">
                  <div className="space-y-1">
                    <div className="font-medium">{header}</div>
                    {schema && schema[header] && (
                      <Badge variant="secondary" className="text-xs">
                        {schema[header]}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header} className="max-w-[200px]">
                    <div className="truncate" title={String(row[header])}>
                      {String(row[header] ?? '')}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};