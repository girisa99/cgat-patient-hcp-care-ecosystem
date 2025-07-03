import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FixedIssueRecord {
  id: string;
  issue: {
    type: string;
    message: string;
    severity: string;
    category: string;
    description: string;
  };
  fixedDate: string; // YYYY-MM-DD format
  fixedTimestamp: string; // ISO string
  fixMethod: 'manual' | 'automatic';
}

interface DailyProgressTabProps {
  className?: string;
}

const DailyProgressTab: React.FC<DailyProgressTabProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState(7); // Last 7 days default
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [historicalData, setHistoricalData] = useState<FixedIssueRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FixedIssueRecord[]>([]);

  // Load real historical data from verification system - NO MOCK DATA
  useEffect(() => {
    const loadRealHistoricalData = async () => {
      try {
        console.log('🔍 Loading REAL daily progress data from verification system...');
        
        // Get real fixed issues from localStorage (real verification system data)
        const stored = localStorage.getItem('daily-progress-history');
        const realData = stored ? JSON.parse(stored) : [];
        
        // Filter to only include real verification system entries (not mock data)
        const verifiedRealData = realData.filter((record: FixedIssueRecord) => 
          !record.id.includes('mock-') && 
          record.issue && 
          record.fixedDate &&
          record.fixedTimestamp
        );
        
        console.log('✅ Real verification data loaded:', verifiedRealData.length, 'entries');
        setHistoricalData(verifiedRealData);
        
        // If no real data exists, show empty state instead of generating mock data
        if (verifiedRealData.length === 0) {
          console.log('📊 No real verification history found - showing empty state');
        }
        
      } catch (error) {
        console.error('❌ Error loading real daily progress history:', error);
        setHistoricalData([]);
      }
    };

    loadRealHistoricalData();
    
    // Listen for new real fixes from verification system
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'daily-progress-history') {
        loadRealHistoricalData();
      }
    };

    // Listen for real-time verification updates
    const handleVerificationUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'verification-fix-completed') {
        console.log('🔄 Real verification fix completed, refreshing data...');
        loadRealHistoricalData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('verification-update' as any, handleVerificationUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('verification-update' as any, handleVerificationUpdate);
    };
  }, []);

  // Filter and search logic - REAL DATA ONLY
  useEffect(() => {
    let filtered = historicalData;

    // Date range filter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);
    filtered = filtered.filter(record => new Date(record.fixedDate) >= cutoffDate);

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => 
        record.issue.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(record => record.issue.severity === selectedSeverity);
    }

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.issue.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.fixedTimestamp).getTime() - new Date(a.fixedTimestamp).getTime());

    setFilteredData(filtered);
  }, [historicalData, dateRange, selectedCategory, selectedSeverity, searchTerm]);

  // Group data by date
  const groupedByDate = filteredData.reduce((acc, record) => {
    const date = record.fixedDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, FixedIssueRecord[]>);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real Data Status Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-800 font-medium">
              Real Verification Data Only - No Mock Data
            </span>
          </div>
          <div className="mt-2 text-xs text-green-700">
            Showing {historicalData.length} real verification fixes from system history
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Daily Progress Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search real issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="ui/ux">UI/UX</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="code quality">Code Quality</SelectItem>
                <SelectItem value="mock data">Mock Data</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {filteredData.length} real fixes found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Display - REAL DATA ONLY */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No real verification fixes found</p>
              <p className="text-sm text-gray-400 mt-2">
                This shows actual fixes from the verification system. As you use the application 
                and the verification system detects and fixes issues, they will appear here.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  ✅ <strong>No Mock Data:</strong> This component only shows real verification system data.
                  Mock data generation has been eliminated to maintain data integrity.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByDate).map(([date, records]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {formatDate(date)}
                    <Badge variant="outline">{records.length} real fixes</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(date).toLocaleDateString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{record.issue.type}</span>
                          <Badge className={getSeverityColor(record.issue.severity)}>
                            {record.issue.severity}
                          </Badge>
                          <Badge variant="outline">{record.issue.category}</Badge>
                          <Badge className="bg-green-100 text-green-800">Real Fix</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(record.fixedTimestamp).toLocaleTimeString()}
                          <Badge variant={record.fixMethod === 'manual' ? 'default' : 'secondary'}>
                            {record.fixMethod}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.issue.description}</p>
                      <p className="text-xs text-gray-500">{record.issue.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyProgressTab;
