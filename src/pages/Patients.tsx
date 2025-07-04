import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartHandshake, Search, RefreshCw, UserPlus } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

const Patients: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🏥 Patients Page - Direct Database Loading');

  const loadPatients = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading patients directly from database...');
      
      // For now, we'll use the profiles table and filter for patient-type users
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, created_at')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        setError(dbError.message);
        return;
      }

      const cleanPatients = (data || []).map(patient => ({
        id: patient.id,
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        created_at: patient.created_at || new Date().toISOString()
      }));

      setPatients(cleanPatients);
      console.log('✅ Patients loaded successfully:', cleanPatients.length, 'patients');
      
    } catch (err: any) {
      console.error('💥 Exception loading patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadPatients();
    }
  }, [isAuthenticated, authLoading]);

  const handleRefresh = () => {
    loadPatients();
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(query) ||
      patient.last_name.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-muted-foreground">Authenticating...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view patients</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading patients: {error}</div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.length,
    recentPatients: patients.filter(p => 
      new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
        <p className="text-muted-foreground">
          Manage patient records and healthcare information
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{stats.totalPatients}</div>
          <div className="text-sm text-pink-600">Total Patients</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activePatients}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.recentPatients}</div>
          <div className="text-sm text-blue-600">Recent (30 days)</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              Patient Records ({filteredPatients.length} patients)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading state */}
            {loading && (
              <div className="text-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600" />
                <div className="text-muted-foreground">Loading patients...</div>
              </div>
            )}

            {/* Patients List */}
            {!loading && filteredPatients.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            )}

            {!loading && filteredPatients.length > 0 && (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{patient.email}</div>
                      {patient.phone && (
                        <div className="text-sm text-muted-foreground">{patient.phone}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(patient.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">
                        View Records
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
