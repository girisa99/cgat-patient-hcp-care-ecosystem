import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  Phone, 
  Plus, 
  Edit, 
  Trash2,
  Hash,
  User,
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PhoneNumber {
  id: string;
  phone_number: string;
  assigned_to_type: 'agent' | 'brand';
  assigned_to_id: string;
  provider_id: string;
  is_active: boolean;
  created_at: string;
}

export const PhoneNumberManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNumber, setNewNumber] = useState({
    phone_number: '',
    assigned_to_type: 'agent' as 'agent' | 'brand',
    assigned_to_id: '',
    provider_id: ''
  });

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch phone numbers
  const { data: phoneNumbers = [], isLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PhoneNumber[];
    }
  });

  // Add phone number
  const addPhoneNumber = useMutation({
    mutationFn: async (numberData: typeof newNumber) => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .insert([{
          ...numberData,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      setShowAddForm(false);
      setNewNumber({
        phone_number: '',
        assigned_to_type: 'agent',
        assigned_to_id: '',
        provider_id: ''
      });
      showSuccess('Phone number added successfully');
    },
    onError: (error) => {
      console.error('Error adding phone number:', error);
      showError('Failed to add phone number');
    }
  });

  // Toggle phone number status
  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('phone_numbers')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      showSuccess('Phone number status updated');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    }
  });

  const handleAddNumber = () => {
    if (newNumber.phone_number && newNumber.assigned_to_id) {
      addPhoneNumber.mutate(newNumber);
    }
  };

  const formatPhoneNumber = (number: string) => {
    // Simple phone number formatting
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{phoneNumbers.length}</p>
                <p className="text-sm text-muted-foreground">Total Numbers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {phoneNumbers.filter(n => n.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {phoneNumbers.filter(n => n.assigned_to_type === 'agent').length}
                </p>
                <p className="text-sm text-muted-foreground">Agent Numbers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {phoneNumbers.filter(n => n.assigned_to_type === 'brand').length}
                </p>
                <p className="text-sm text-muted-foreground">Brand Numbers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Number Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Phone Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={newNumber.phone_number}
                  onChange={(e) => setNewNumber(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment Type</label>
                <Select 
                  value={newNumber.assigned_to_type} 
                  onValueChange={(value: 'agent' | 'brand') => 
                    setNewNumber(prev => ({ ...prev, assigned_to_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To ID</label>
                <Input
                  placeholder="Agent or Brand ID"
                  value={newNumber.assigned_to_id}
                  onChange={(e) => setNewNumber(prev => ({ ...prev, assigned_to_id: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider ID</label>
                <Input
                  placeholder="Voice Provider ID"
                  value={newNumber.provider_id}
                  onChange={(e) => setNewNumber(prev => ({ ...prev, provider_id: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddNumber} disabled={addPhoneNumber.isPending}>
                Add Number
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Numbers
          </CardTitle>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Number
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading phone numbers...</div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No phone numbers configured
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <span className="font-mono text-lg">{formatPhoneNumber(number.phone_number)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {number.assigned_to_type === 'agent' ? (
                        <User className="h-4 w-4 text-purple-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="text-sm text-muted-foreground capitalize">
                        {number.assigned_to_type}: {number.assigned_to_id}
                      </span>
                    </div>

                    <Badge variant={number.is_active ? "default" : "secondary"}>
                      {number.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate({ id: number.id, isActive: number.is_active })}
                    >
                      {number.is_active ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};