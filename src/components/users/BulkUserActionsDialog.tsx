
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Users, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkUserActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkUserActionsDialog: React.FC<BulkUserActionsDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // TODO: Implement actual bulk import logic
      console.log('Processing bulk import:', selectedFile.name);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bulk Import Completed",
        description: "Users have been imported successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import users. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    setIsProcessing(true);
    try {
      // TODO: Implement actual bulk action logic
      console.log('Processing bulk action:', bulkAction);
      
      toast({
        title: "Bulk Action Completed",
        description: `${bulkAction} has been applied to selected users`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `First Name,Last Name,Email,Phone,Department,Role,Facility
John,Doe,john.doe@example.com,(555) 123-4567,IT,user,
Jane,Smith,jane.smith@example.com,(555) 987-6543,HR,moderator,
Admin,User,admin@example.com,(555) 555-5555,Administration,superAdmin,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your computer",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Actions
          </DialogTitle>
          <DialogDescription>
            Import users from CSV or perform bulk actions on existing users
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import Users</TabsTrigger>
            <TabsTrigger value="export">Export Users</TabsTrigger>
            <TabsTrigger value="actions">Bulk Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Users from CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-600">
                    Upload a CSV file with user information. Download the template below for the correct format.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download Template
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={!selectedFile || isProcessing}
                  >
                    {isProcessing ? 'Importing...' : 'Import Users'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export User Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Export all user data to CSV format for backup or analysis purposes.
                </p>
                
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV Format</SelectItem>
                      <SelectItem value="excel">Excel Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Users
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Action</Label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_role">Assign Role to Multiple Users</SelectItem>
                      <SelectItem value="assign_facility">Assign Facility Access</SelectItem>
                      <SelectItem value="assign_module">Assign Module Access</SelectItem>
                      <SelectItem value="deactivate">Deactivate Selected Users</SelectItem>
                      <SelectItem value="activate">Activate Selected Users</SelectItem>
                      <SelectItem value="reset_password">Send Password Reset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-gray-600">
                  Select users from the main user list, then choose an action to apply to all selected users.
                </p>

                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Apply to Selected Users'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUserActionsDialog;
