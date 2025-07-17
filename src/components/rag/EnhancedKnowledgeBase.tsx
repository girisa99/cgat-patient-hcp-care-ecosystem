import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  File, 
  Download, 
  Share2, 
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  uploadDate: string;
}

export const EnhancedKnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'uploading' as const,
          uploadDate: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDoc]);
        
        // Process the file (upload to storage)
        handleProcessFile(file, newDoc.id);
      });
    }
  };
  
  const handleProcessFile = async (file: File, docId: string) => {
    try {
      // Update status to uploading
      updateDocStatus(docId, 'uploading');
      
      // Upload to storage
      const fileName = `knowledge-docs/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('agent-assets')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('agent-assets')
        .getPublicUrl(fileName);
        
      const fileUrl = data.publicUrl;
      
      // Process document content with edge function (simulated here)
      updateDocStatus(docId, 'processing');
      
      // Simulate processing time
      setTimeout(() => {
        updateDocStatus(docId, 'ready');
        
        toast({
          title: "Document Ready",
          description: `${file.name} has been processed and added to the knowledge base.`
        });
      }, 2000);
      
    } catch (error: any) {
      updateDocStatus(docId, 'error');
      
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const updateDocStatus = (docId: string, status: Document['status']) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, status } : doc
      )
    );
  };
  
  const handleShareDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      toast({
        title: "Document Shared",
        description: `${doc.name} has been shared for compliance review.`
      });
    }
  };
  
  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary">Uploading...</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing...</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage documents for your agent's knowledge base
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="manage">Knowledge Management</TabsTrigger>
          <TabsTrigger value="search">Search & Retrieve</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Documents</CardTitle>
              <CardDescription>
                Add documents to your agent's knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                <div
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, DOC, DOCX, TXT, MD up to 50MB
                  </p>
                  <Button variant="outline" size="sm">
                    Select Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status)}
                        {doc.status === 'ready' && (
                          <Button variant="ghost" size="sm" onClick={() => handleShareDocument(doc.id)}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Knowledge Management</h3>
              <p className="text-muted-foreground mb-4">
                Organize, categorize, and manage your knowledge documents
              </p>
              <Button>View Knowledge Base</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Search & Retrieve</h3>
              <p className="text-muted-foreground mb-4">
                Search through your knowledge base to find specific information
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input placeholder="Search knowledge base..." />
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};