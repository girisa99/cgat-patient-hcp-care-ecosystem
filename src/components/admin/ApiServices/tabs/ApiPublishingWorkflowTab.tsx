
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  Globe, 
  Settings, 
  FileText,
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const ApiPublishingWorkflowTab: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [selectedApi, setSelectedApi] = useState<string | null>(null);

  console.log('🚀 API Publishing Workflow Tab with complete publishing pipeline');

  const draftApis = apiServices.data.filter(api => api.status === 'draft' || api.lifecycle_stage === 'development');
  const publishedApis = apiServices.data.filter(api => api.status === 'active' && api.lifecycle_stage === 'production');

  return (
    <div className="space-y-6">
      {/* Publishing Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Publishing Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Manage the complete API publishing lifecycle from draft to production
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Start New Publishing Workflow
        </Button>
      </div>

      {/* Publishing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Draft APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftApis.length}</div>
            <p className="text-xs text-muted-foreground">Ready for publishing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedApis.length}</div>
            <p className="text-xs text-muted-foreground">Live in production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Workflow Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Publishing Pipeline</TabsTrigger>
          <TabsTrigger value="review">Review Queue</TabsTrigger>
          <TabsTrigger value="published">Published APIs</TabsTrigger>
          <TabsTrigger value="analytics">Publishing Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <PublishingPipelineTab draftApis={draftApis} />
        </TabsContent>

        <TabsContent value="review">
          <ReviewQueueTab />
        </TabsContent>

        <TabsContent value="published">
          <PublishedApisTab publishedApis={publishedApis} />
        </TabsContent>

        <TabsContent value="analytics">
          <PublishingAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Publishing Pipeline Subtab
const PublishingPipelineTab: React.FC<{ draftApis: any[] }> = ({ draftApis }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publishing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draftApis.map((api) => (
              <div key={api.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{api.name}</h4>
                    <p className="text-sm text-muted-foreground">{api.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {api.status}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Publishing Progress</span>
                    <span className="text-sm text-muted-foreground">3 of 5 steps completed</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Documentation
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Testing
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Security Review
                    </span>
                  </div>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue Publishing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Review Queue Subtab
const ReviewQueueTab: React.FC = () => {
  const reviewItems = [
    { id: '1', name: 'Patient Data API', type: 'Security Review', priority: 'High', submittedAt: '2024-01-15' },
    { id: '2', name: 'Treatment API', type: 'Technical Review', priority: 'Medium', submittedAt: '2024-01-14' },
    { id: '3', name: 'Billing API', type: 'Compliance Review', priority: 'High', submittedAt: '2024-01-13' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Review Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviewItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.type} • Submitted: {item.submittedAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.priority === 'High' ? 'destructive' : 'secondary'}>
                    {item.priority} Priority
                  </Badge>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Published APIs Subtab
const PublishedApisTab: React.FC<{ publishedApis: any[] }> = ({ publishedApis }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Published APIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {publishedApis.map((api) => (
            <div key={api.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{api.name}</h4>
                  <p className="text-sm text-muted-foreground">{api.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span>Version: {api.version}</span>
                    <span>Published: {new Date().toLocaleDateString()}</span>
                    <span>Usage: 1,234 calls/day</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Live
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Publishing Analytics Subtab
const PublishingAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Time to Publish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5 days</div>
            <p className="text-xs text-muted-foreground">From draft to production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">APIs successfully published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Review Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3 days</div>
            <p className="text-xs text-muted-foreground">Average review time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Workflow Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Documentation Review</span>
              <div className="flex items-center gap-2">
                <Progress value={85} className="w-24 h-2" />
                <span className="text-sm text-muted-foreground">85% efficiency</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Security Review</span>
              <div className="flex items-center gap-2">
                <Progress value={78} className="w-24 h-2" />
                <span className="text-sm text-muted-foreground">78% efficiency</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Testing Phase</span>
              <div className="flex items-center gap-2">
                <Progress value={92} className="w-24 h-2" />
                <span className="text-sm text-muted-foreground">92% efficiency</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
