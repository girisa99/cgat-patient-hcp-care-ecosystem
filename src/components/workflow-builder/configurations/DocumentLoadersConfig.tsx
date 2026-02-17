import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Upload, Database, Globe } from 'lucide-react';

interface DocumentLoadersConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const DocumentLoadersConfig: React.FC<DocumentLoadersConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderPDFLoader = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Document Loader Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="pdfSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF Source *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PDF source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="file-upload">File Upload</SelectItem>
                  <SelectItem value="url">URL Path</SelectItem>
                  <SelectItem value="base64">Base64 String</SelectItem>
                  <SelectItem value="buffer">Buffer</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.pdfSource === 'url' && (
          <FormField
            control={form.control}
            name="pdfUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PDF URL *</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/document.pdf" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="splitPages"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Split Pages</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extractImages"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Extract Images</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chunkSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunk Size</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chunkOverlap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunk Overlap</FormLabel>
              <FormControl>
                <Input type="number" placeholder="200" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderCSVLoader = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          CSV File Loader Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="csvSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSV Source *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSV source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="file-upload">File Upload</SelectItem>
                  <SelectItem value="url">URL Path</SelectItem>
                  <SelectItem value="text">Text Content</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="delimiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delimiter</FormLabel>
                <FormControl>
                  <Input placeholder="," {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="encoding"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Encoding</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'utf-8'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="utf-8">UTF-8</SelectItem>
                    <SelectItem value="ascii">ASCII</SelectItem>
                    <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hasHeader"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Has Header Row</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skipEmptyLines"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Skip Empty Lines</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Column Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Column Selection</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const columns = configuration.selectedColumns || [];
                onChange({ ...configuration, selectedColumns: [...columns, { name: '', include: true }] });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
          </div>
          
          {(configuration.selectedColumns || []).map((column: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={column.name || ''}
                  onChange={(e) => {
                    const columns = [...(configuration.selectedColumns || [])];
                    columns[index] = { ...columns[index], name: e.target.value };
                    onChange({ ...configuration, selectedColumns: columns });
                  }}
                  placeholder="Column name"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={column.include !== false}
                    onCheckedChange={(checked) => {
                      const columns = [...(configuration.selectedColumns || [])];
                      columns[index] = { ...columns[index], include: checked };
                      onChange({ ...configuration, selectedColumns: columns });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const columns = [...(configuration.selectedColumns || [])];
                      columns.splice(index, 1);
                      onChange({ ...configuration, selectedColumns: columns });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAPILoader = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          API Loader Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="apiEndpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Endpoint *</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/data" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="httpMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTTP Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'GET'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Headers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Headers</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const headers = configuration.headers || [];
                onChange({ ...configuration, headers: [...headers, { key: '', value: '' }] });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Header
            </Button>
          </div>
          
          {(configuration.headers || []).map((header: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={header.key || ''}
                  onChange={(e) => {
                    const headers = [...(configuration.headers || [])];
                    headers[index] = { ...headers[index], key: e.target.value };
                    onChange({ ...configuration, headers });
                  }}
                  placeholder="Header name"
                />
                <Input
                  value={header.value || ''}
                  onChange={(e) => {
                    const headers = [...(configuration.headers || [])];
                    headers[index] = { ...headers[index], value: e.target.value };
                    onChange({ ...configuration, headers });
                  }}
                  placeholder="Header value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const headers = [...(configuration.headers || [])];
                    headers.splice(index, 1);
                    onChange({ ...configuration, headers });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="responseFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'json'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pagination"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Handle Pagination</FormLabel>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderGenericLoader = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="repository">Repository</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourcePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Path *</FormLabel>
              <FormControl>
                <Input placeholder="Enter source path or URL" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="processingOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Options</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional processing options..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="autoDetectEncoding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Detect Encoding</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validateContent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Validate Content</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'pdf_loader':
      return renderPDFLoader();
    case 'csv_loader':
      return renderCSVLoader();
    case 'api_loader':
      return renderAPILoader();
    case 'json_loader':
    case 'text_loader':
    case 'github_loader':
    case 'firecrawl_loader':
    default:
      return renderGenericLoader();
  }
};