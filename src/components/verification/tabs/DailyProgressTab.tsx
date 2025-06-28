
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

  // Load historical data from localStorage
  useEffect(() => {
    const loadHistoricalData = () => {
      try {
        const stored = localStorage.getItem('daily-progress-history');
        const data = stored ? JSON.parse(stored) : [];
        setHistoricalData(data);
      } catch (error) {
        console.error('Error loading daily progress history:', error);
        setHistoricalData([]);
      }
    };

    loadHistoricalData();
    
    // Listen for new fixes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'daily-progress-history') {
        loadHistoricalData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Generate mock historical data for demonstration (remove in production)
  useEffect(() => {
    const generateMockData = () => {
      const today = new Date();
      const mockData: FixedIssueRecord[] = [];
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Add some random fixes per day
        const fixesPerDay = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < fixesPerDay; j++) {
          const categories = ['Security', 'UI/UX', 'Database', 'Code Quality'];
          const severities = ['critical', 'high', 'medium', 'low'];
          const category = categories[Math.floor(Math.random() * categories.length)];
          const severity = severities[Math.floor(Math.random() * severities.length)];
          
          mockData.push({
            id: `mock-${i}-${j}`,
            issue: {
              type: `${category} Issue`,
              message: `Sample ${category.toLowerCase()} issue ${j + 1}`,
              severity,
              category,
              description: `Detailed description of ${category.toLowerCase()} issue that was resolved on ${dateStr}`
            },
            fixedDate: dateStr,
            fixedTimestamp: new Date(date.getTime() + j * 3600000).toISOString(),
            fixMethod: Math.random() > 0.5 ? 'manual' : 'automatic'
          });
        }
      }
      
      // Only add mock data if no real data exists
      const existing = localStorage.getItem('daily-progress-history');
      if (!existing) {
        localStorage.setItem('daily-progress-history', JSON.stringify(mockData));
        setHistoricalData(mockData);
      }
    };

    if (historicalData.length === 0) {
      generateMockData();
    }
  }, [historicalData.length]);

  // Filter and search logic
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
                placeholder="Search issues..."
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
              {filteredData.length} fixes found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Display */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No fixes found for the selected criteria</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or date range</p>
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
                    <Badge variant="outline">{records.length} fixes</Badge>
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
