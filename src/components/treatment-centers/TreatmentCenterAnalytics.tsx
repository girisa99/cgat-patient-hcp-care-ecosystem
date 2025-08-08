import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Bot, Activity, 
  Calendar, Clock, AlertCircle, CheckCircle 
} from "lucide-react";

interface TreatmentCenterAnalyticsProps {
  center: any;
  isOpen: boolean;
  onClose: () => void;
}

const mockActivityData = [
  { month: 'Jan', agents: 12, conversations: 450, patients: 89 },
  { month: 'Feb', agents: 15, conversations: 520, patients: 105 },
  { month: 'Mar', agents: 18, conversations: 680, patients: 134 },
  { month: 'Apr', agents: 22, conversations: 750, patients: 156 },
  { month: 'May', agents: 25, conversations: 890, patients: 178 },
  { month: 'Jun', agents: 28, conversations: 1020, patients: 201 },
];

const mockPerformanceData = [
  { name: 'Patient Onboarding', value: 35, color: '#3b82f6' },
  { name: 'Appointment Scheduling', value: 25, color: '#10b981' },
  { name: 'Insurance Verification', value: 20, color: '#f59e0b' },
  { name: 'Follow-up Care', value: 15, color: '#ef4444' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
];

export const TreatmentCenterAnalytics: React.FC<TreatmentCenterAnalyticsProps> = ({
  center,
  isOpen,
  onClose
}) => {
  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {center.name} - Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="child-tabs">
          <TabsList className="child-tabs">
            <TabsTrigger value="overview" className="child-tab-trigger">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="child-tab-trigger">
              <Activity className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="child-tab-trigger">
              <Bot className="h-4 w-4" />
              <span>Agent Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="child-tab-content space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Conversations</p>
                      <p className="text-2xl font-bold text-blue-900">1,247</p>
                      <p className="text-xs text-blue-600">+12% this month</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Patients Served</p>
                      <p className="text-2xl font-bold text-green-900">345</p>
                      <p className="text-xs text-green-600">+8% this month</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Active Agents</p>
                      <p className="text-2xl font-bold text-purple-900">28</p>
                      <p className="text-xs text-purple-600">+4 new agents</p>
                    </div>
                    <Bot className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Satisfaction Rate</p>
                      <p className="text-2xl font-bold text-orange-900">94.2%</p>
                      <p className="text-xs text-orange-600">+2.1% improvement</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="conversations" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Conversations"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="patients" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Patients"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="child-tab-content space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Use Case Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent Use Case Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockPerformanceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {mockPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Response Time</span>
                      <span className="font-semibold">2.3s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolution Rate</span>
                      <span className="font-semibold">92.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Agent Availability</span>
                      <span className="font-semibold">96.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="child-tab-content space-y-6">
            {/* Agent Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="agents" fill="#3b82f6" name="Active Agents" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Patient Coordinator AI', 'Scheduling Assistant', 'Insurance Verification Bot', 'Follow-up Care Agent'].map((agentName, index) => (
                    <div key={agentName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{agentName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{(95 - index * 2).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">Success Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};