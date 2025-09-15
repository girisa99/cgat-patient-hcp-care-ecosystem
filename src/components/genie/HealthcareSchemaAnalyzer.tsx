import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Table, Users, FileText } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface HealthcareTable {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>;
  category: 'patient' | 'provider' | 'clinical' | 'insurance' | 'onboarding' | 'treatment' | 'compliance' | 'other';
  relevance_score: number;
}

interface HealthcareSchemaAnalyzerProps {
  onSchemaAnalyzed?: (tables: HealthcareTable[]) => void;
}

const HEALTHCARE_TABLE_PATTERNS = {
  patient: ['patient', 'enrollment', 'clinical_info'],
  provider: ['provider', 'npi', 'practitioner'],
  clinical: ['clinical', 'treatment', 'diagnosis', 'medication'],
  insurance: ['insurance', 'coverage', 'billing'],
  onboarding: ['onboarding', 'application', 'intake'],
  treatment: ['treatment', 'therapy', 'procedure'],
  compliance: ['audit', 'compliance', 'hipaa', 'consent'],
  other: []
};

export const HealthcareSchemaAnalyzer: React.FC<HealthcareSchemaAnalyzerProps> = ({
  onSchemaAnalyzed
}) => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<HealthcareTable[]>([]);
  const { showError, showSuccess } = useMasterToast();

  const categorizeTable = (tableName: string): { category: keyof typeof HEALTHCARE_TABLE_PATTERNS; score: number } => {
    for (const [category, patterns] of Object.entries(HEALTHCARE_TABLE_PATTERNS)) {
      if (category === 'other') continue;
      
      for (const pattern of patterns) {
        if (tableName.toLowerCase().includes(pattern)) {
          return { category: category as keyof typeof HEALTHCARE_TABLE_PATTERNS, score: 0.9 };
        }
      }
    }
    return { category: 'other', score: 0.1 };
  };

  const analyzeHealthcareSchema = async () => {
    setLoading(true);
    try {
      // Get healthcare-related tables and their columns
      const { data: tableNames, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .ilike('table_name', '%patient%')
        .or('table_name.ilike.%enrollment%,table_name.ilike.%treatment%,table_name.ilike.%onboarding%,table_name.ilike.%clinical%,table_name.ilike.%insurance%');

      if (error) throw error;

      const healthcareTables: HealthcareTable[] = [];

      // Process each table
      if (tableNames && Array.isArray(tableNames)) {
        for (const table of tableNames) {
          const { category, score } = categorizeTable(table.table_name);
          
          // Get column information for this table
          const { data: columns } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', table.table_name);

          healthcareTables.push({
            table_name: table.table_name,
            columns: columns || [],
            category,
            relevance_score: score
          });
        }
      }

      // Add key healthcare tables manually if they exist
      const keyTables = ['treatment_center_onboarding', 'enrollment_clinical_info', 'enrollment_insurance_info', 'clinical_trials', 'profiles', 'facilities'];
      for (const tableName of keyTables) {
        if (!healthcareTables.find(t => t.table_name === tableName)) {
          const { data: tableExists } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', tableName)
            .single();
            
          if (tableExists) {
            const { data: columns } = await supabase
              .from('information_schema.columns')
              .select('column_name, data_type, is_nullable')
              .eq('table_schema', 'public')
              .eq('table_name', tableName);
              
            const { category, score } = categorizeTable(tableName);
            healthcareTables.push({
              table_name: tableName,
              columns: columns || [],
              category,
              relevance_score: Math.max(score, 0.8) // Boost key tables
            });
          }
        }
      }

      // Sort by relevance score
      healthcareTables.sort((a, b) => b.relevance_score - a.relevance_score);
      
      setTables(healthcareTables);
      onSchemaAnalyzed?.(healthcareTables);
      showSuccess(`Analyzed ${healthcareTables.length} healthcare-related tables`);
    } catch (error) {
      console.error('Schema analysis error:', error);
      showError('Failed to analyze healthcare schema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeHealthcareSchema();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient': return <Users className="h-4 w-4" />;
      case 'clinical': return <FileText className="h-4 w-4" />;
      case 'onboarding': return <Database className="h-4 w-4" />;
      default: return <Table className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'clinical': return 'bg-green-500/20 text-green-700 border-green-300';
      case 'onboarding': return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'provider': return 'bg-orange-500/20 text-orange-700 border-orange-300';
      case 'insurance': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'treatment': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'compliance': return 'bg-gray-500/20 text-gray-700 border-gray-300';
      default: return 'bg-slate-500/20 text-slate-700 border-slate-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Healthcare Database Schema
          </CardTitle>
          <CardDescription>
            Scanning database tables for healthcare-specific structures...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Healthcare Schema Analysis ({tables.length} tables)
          </CardTitle>
          <CardDescription>
            Database tables categorized by healthcare domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {tables.map((table) => (
              <div key={table.table_name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(table.category)}
                  <div>
                    <div className="font-medium">{table.table_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {table.columns.length} columns • Score: {(table.relevance_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <Badge className={getCategoryColor(table.category)}>
                  {table.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthcareSchemaAnalyzer;