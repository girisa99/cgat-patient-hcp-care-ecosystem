import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Plus, Zap, MessageSquare, Brain } from "lucide-react";

const TechnicalApiTab: React.FC = () => {
  const technicalApis = [
    { name: 'Twilio SMS/Voice', category: 'Communication', status: 'active', type: 'REST' },
    { name: 'OpenAI GPT', category: 'AI/ML', status: 'active', type: 'REST' },
    { name: 'Claude AI', category: 'AI/ML', status: 'active', type: 'REST' },
    { name: 'DocAI Processing', category: 'Document', status: 'configured', type: 'REST' }
  ];

  const getIcon = (category: string) => {
    switch (category) {
      case 'Communication': return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'AI/ML': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'Document': return <Code className="h-5 w-5 text-orange-600" />;
      default: return <Zap className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Technical APIs</h2>
          <p className="text-gray-600">AI, communication, and technical service integrations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Technical API
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Technical API Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {technicalApis.map((api, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(api.category)}
                      <div>
                        <h3 className="font-semibold">{api.name}</h3>
                        <p className="text-sm text-gray-600">{api.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.status === 'active' ? "default" : "secondary"}>
                        {api.status}
                      </Badge>
                      <Badge variant="outline">{api.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalApiTab;