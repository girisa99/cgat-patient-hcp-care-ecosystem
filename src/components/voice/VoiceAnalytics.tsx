import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  TrendingUp, 
  Clock, 
  Phone, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const VoiceAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('calls');

  // Mock analytics data
  const callVolumeData = [
    { date: '2024-01-01', calls: 45, successful: 42, failed: 3 },
    { date: '2024-01-02', calls: 52, successful: 48, failed: 4 },
    { date: '2024-01-03', calls: 38, successful: 35, failed: 3 },
    { date: '2024-01-04', calls: 61, successful: 58, failed: 3 },
    { date: '2024-01-05', calls: 47, successful: 44, failed: 3 },
    { date: '2024-01-06', calls: 55, successful: 52, failed: 3 },
    { date: '2024-01-07', calls: 49, successful: 46, failed: 3 }
  ];

  const voiceQualityData = [
    { provider: 'ElevenLabs', quality: 95, latency: 120, uptime: 99.8 },
    { provider: 'OpenAI', quality: 92, latency: 85, uptime: 99.5 },
    { provider: 'Twilio', quality: 88, latency: 200, uptime: 99.9 },
    { provider: 'Azure', quality: 90, latency: 150, uptime: 99.7 }
  ];

  const providerDistribution = [
    { name: 'ElevenLabs', value: 45, color: '#8884d8' },
    { name: 'OpenAI', value: 30, color: '#82ca9d' },
    { name: 'Twilio', value: 15, color: '#ffc658' },
    { name: 'Azure', value: 10, color: '#ff7300' }
  ];

  const totalCalls = callVolumeData.reduce((sum, day) => sum + day.calls, 0);
  const successRate = (callVolumeData.reduce((sum, day) => sum + day.successful, 0) / totalCalls * 100).toFixed(1);
  const avgDuration = '2:34';
  const activeProviders = voiceQualityData.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-bold text-emerald-900 mb-2">Voice System Analytics</h3>
        <p className="text-emerald-700">
          Comprehensive performance insights, quality metrics, and usage analytics for your voice infrastructure.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calls">Call Volume</SelectItem>
                <SelectItem value="quality">Voice Quality</SelectItem>
                <SelectItem value="latency">Latency</SelectItem>
                <SelectItem value="errors">Error Rates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{totalCalls}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last period
                </p>
              </div>
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent performance
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{avgDuration}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per conversation
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold">{activeProviders}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  All operational
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Call Volume Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={callVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="successful" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Provider Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Voice Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Voice Quality & Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={voiceQualityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quality" fill="#8884d8" name="Quality Score" />
              <Bar dataKey="latency" fill="#82ca9d" name="Latency (ms)" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Provider Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Provider Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Quality Score</th>
                  <th className="text-left p-3">Avg Latency</th>
                  <th className="text-left p-3">Uptime</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {voiceQualityData.map((provider) => (
                  <tr key={provider.provider} className="border-b">
                    <td className="p-3 font-medium">{provider.provider}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${provider.quality}%` }}
                          />
                        </div>
                        <span className="text-sm">{provider.quality}%</span>
                      </div>
                    </td>
                    <td className="p-3">{provider.latency}ms</td>
                    <td className="p-3">{provider.uptime}%</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAnalytics;