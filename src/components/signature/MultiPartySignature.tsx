/**
 * MULTI-PARTY SIGNATURE COMPONENT
 * Manages multiple signers and signature workflow
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Send
} from 'lucide-react';
import { SignatureCapture } from './SignatureCapture';

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signature_data?: string;
  signed_at?: string;
  decline_reason?: string;
}

interface MultiPartySignatureProps {
  applicationId?: string;
  signers: Signer[];
  onSignersChange: (signers: Signer[]) => void;
  currentUserEmail?: string;
  onSubmitForSigning?: (signers: Signer[]) => Promise<void>;
  readOnly?: boolean;
}

const SIGNER_ROLES = [
  { value: 'applicant', label: 'Applicant' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'authorized_representative', label: 'Authorized Representative' },
  { value: 'guarantor', label: 'Guarantor' },
  { value: 'witness', label: 'Witness' },
  { value: 'co_applicant', label: 'Co-Applicant' }
];

export const MultiPartySignature: React.FC<MultiPartySignatureProps> = ({
  applicationId,
  signers,
  onSignersChange,
  currentUserEmail,
  onSubmitForSigning,
  readOnly = false
}) => {
  const [newSigner, setNewSigner] = useState<Partial<Signer>>({
    name: '',
    email: '',
    role: 'applicant'
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentSignerIndex, setCurrentSignerIndex] = useState<number | null>(null);

  const addSigner = () => {
    if (!newSigner.name || !newSigner.email || !newSigner.role) return;

    const signer: Signer = {
      id: `signer_${Date.now()}`,
      name: newSigner.name,
      email: newSigner.email,
      role: newSigner.role,
      order: signers.length + 1,
      status: 'pending'
    };

    onSignersChange([...signers, signer]);
    setNewSigner({ name: '', email: '', role: 'applicant' });
    setShowAddDialog(false);
  };

  const removeSigner = (signerId: string) => {
    const updatedSigners = signers
      .filter(s => s.id !== signerId)
      .map((s, index) => ({ ...s, order: index + 1 }));
    onSignersChange(updatedSigners);
  };

  const updateSignerSignature = (signerId: string, signatureData: string | null) => {
    const updatedSigners = signers.map(signer => {
      if (signer.id === signerId) {
        return {
          ...signer,
          signature_data: signatureData || undefined,
          status: signatureData ? 'signed' as const : 'pending' as const,
          signed_at: signatureData ? new Date().toISOString() : undefined
        };
      }
      return signer;
    });
    onSignersChange(updatedSigners);
  };

  const getSigningProgress = () => {
    const signedCount = signers.filter(s => s.status === 'signed').length;
    return signers.length > 0 ? (signedCount / signers.length) * 100 : 0;
  };

  const canCurrentUserSign = (signer: Signer) => {
    return signer.email === currentUserEmail && signer.status === 'pending';
  };

  const allRequiredSignaturesCompleted = () => {
    return signers.length > 0 && signers.every(s => s.status === 'signed');
  };

  const getStatusBadge = (status: Signer['status']) => {
    switch (status) {
      case 'signed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Signed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'expired':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Party Signatures
          </CardTitle>
          {!readOnly && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Signer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Signer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signer-name">Full Name</Label>
                    <Input
                      id="signer-name"
                      value={newSigner.name || ''}
                      onChange={(e) => setNewSigner(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signer-email">Email Address</Label>
                    <Input
                      id="signer-email"
                      type="email"
                      value={newSigner.email || ''}
                      onChange={(e) => setNewSigner(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signer-role">Role</Label>
                    <Select value={newSigner.role} onValueChange={(value) => setNewSigner(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIGNER_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addSigner} disabled={!newSigner.name || !newSigner.email}>
                      Add Signer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {signers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Signing Progress</span>
              <span>{signers.filter(s => s.status === 'signed').length} of {signers.length} completed</span>
            </div>
            <Progress value={getSigningProgress()} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {signers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No signers added yet</p>
            <p className="text-sm">Add signers to enable multi-party signing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signers.map((signer, index) => (
              <Card key={signer.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {signer.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{signer.name}</span>
                          {getStatusBadge(signer.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {signer.email}
                          <span>•</span>
                          <span className="capitalize">{signer.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!readOnly && signer.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSigner(signer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {signer.status === 'signed' && signer.signature_data ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Signature</Label>
                      <div className="border rounded-lg p-4 bg-green-50">
                        <img 
                          src={signer.signature_data} 
                          alt={`${signer.name}'s signature`}
                          className="max-w-full h-24 object-contain"
                        />
                        <p className="text-xs text-green-700 mt-2">
                          Signed on {new Date(signer.signed_at!).toLocaleDateString()} at{' '}
                          {new Date(signer.signed_at!).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : canCurrentUserSign(signer) ? (
                    <SignatureCapture
                      title={`Your Signature - ${signer.role.replace('_', ' ')}`}
                      description="Please provide your signature to proceed with the application"
                      required={true}
                      onSignatureChange={(data) => updateSignerSignature(signer.id, data)}
                      value={signer.signature_data}
                      disabled={readOnly}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {signer.status === 'pending' 
                          ? 'Waiting for signature from this signer'
                          : signer.status === 'declined'
                          ? `Signature declined: ${signer.decline_reason || 'No reason provided'}`
                          : 'Signature expired'
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {signers.length > 0 && onSubmitForSigning && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {allRequiredSignaturesCompleted() 
                  ? 'All signatures completed!' 
                  : `${signers.filter(s => s.status === 'signed').length} of ${signers.length} signatures completed`
                }
              </div>
              
              {!readOnly && signers.some(s => s.status === 'pending') && (
                <Button 
                  onClick={() => onSubmitForSigning(signers)}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send for Signatures
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};