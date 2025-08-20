import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Search, Trash2, Edit, MessageSquare, 
  Settings, Bot, FileText, ChevronDown, ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopicInstruction {
  id: string;
  instruction: string;
}

interface Topic {
  id: string;
  label: string;
  classificationDescription: string;
  scope: string;
  instructions: TopicInstruction[];
  actions: string[];
  reasoning: string;
  agentResponse: string;
}

interface TopicManagerProps {
  onTopicSelect?: (topic: Topic) => void;
  selectedTopic?: Topic;
}

export const TopicManager: React.FC<TopicManagerProps> = ({
  onTopicSelect,
  selectedTopic
}) => {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      label: 'Case Management',
      classificationDescription: 'Handles customer inquiries and actions related to support cases, including providing case information, updating existing cases, and creating new cases.',
      scope: 'Your job is to help customers retrieve case information, update case comments, and create new cases based on customer needs.',
      instructions: [
        { id: '1', instruction: 'Always format any dates in a human readable format' },
        { id: '2', instruction: 'Do not ever show the Case Id to a customer' },
        { id: '3', instruction: 'If the customer is not known, always ask for their email address and get their Contact record before running any other actions.' },
        { id: '4', instruction: 'When adding a comment to a case, first retrieve the case details using the case number, ask the customer to verify before adding the comment.' },
        { id: '5', instruction: 'When sharing case details to the customer, show the following properties as an itemized list: Case Number, Subject, Description, Status' }
      ],
      actions: ['Add Case Comment', 'Create Case', 'Get All Cases For Contact'],
      reasoning: 'GROUNDED: The response is grounded in the context, which specifies that if the customer is not known, the agent should ask for their email address to get their contact record before running any other actions.',
      agentResponse: '{\n  "message": "Sure, I\'d be happy to help with your support case! Could you please provide your email address so I can look up your contact record?"\n}'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [expandedInstructions, setExpandedInstructions] = useState(false);
  const [expandedActions, setExpandedActions] = useState(false);
  const { toast } = useToast();

  const filteredTopics = topics.filter(topic =>
    topic.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.classificationDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addInstruction = (topicId: string) => {
    const newInstruction: TopicInstruction = {
      id: Date.now().toString(),
      instruction: ''
    };
    
    setTopics(topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, instructions: [...topic.instructions, newInstruction] }
        : topic
    ));
  };

  const updateInstruction = (topicId: string, instructionId: string, instruction: string) => {
    setTopics(topics.map(topic => 
      topic.id === topicId 
        ? {
            ...topic,
            instructions: topic.instructions.map(inst => 
              inst.id === instructionId ? { ...inst, instruction } : inst
            )
          }
        : topic
    ));
  };

  const removeInstruction = (topicId: string, instructionId: string) => {
    setTopics(topics.map(topic => 
      topic.id === topicId 
        ? {
            ...topic,
            instructions: topic.instructions.filter(inst => inst.id !== instructionId)
          }
        : topic
    ));
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Topics List */}
      <div className="w-96 border-r bg-background">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Topics</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Topic</DialogTitle>
                </DialogHeader>
                <TopicForm onSubmit={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Manage the topics assigned to your agent. To make changes, your agent must be deactivated.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredTopics.length} items • Sorted by Topic Label(asc)
          </p>

          <div className="space-y-2">
            {filteredTopics.map((topic) => (
              <Card 
                key={topic.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedTopic?.id === topic.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onTopicSelect?.(topic)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{topic.label}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle topic options
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - Topic Details */}
      {selectedTopic && (
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Topic Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedTopic.label}</h1>
                  <p className="text-muted-foreground">
                    Handles customer inquiries and actions related to support cases, including providing case information, updating existing cases, and creating new cases.
                  </p>
                </div>
              </div>

              {/* Instructions and Actions Sections */}
              <div className="grid grid-cols-1 gap-6">
                {/* Instructions Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Instructions</CardTitle>
                        <Badge variant="secondary">{selectedTopic.instructions.length}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedInstructions(!expandedInstructions)}
                      >
                        {expandedInstructions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedInstructions && (
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        The following instructions are used to run this topic.
                      </p>
                      
                      {selectedTopic.instructions.map((instruction) => (
                        <Card key={instruction.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <Textarea
                                value={instruction.instruction}
                                onChange={(e) => updateInstruction(selectedTopic.id, instruction.id, e.target.value)}
                                className="flex-1 min-h-[80px]"
                                placeholder="Enter instruction..."
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeInstruction(selectedTopic.id, instruction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        onClick={() => addInstruction(selectedTopic.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Instruction
                      </Button>
                    </CardContent>
                  )}
                </Card>

                {/* Actions Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Actions</CardTitle>
                        <Badge variant="secondary">{selectedTopic.actions.length}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedActions(!expandedActions)}
                      >
                        {expandedActions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedActions && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {selectedTopic.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 rounded bg-blue-100 dark:bg-blue-900">
                              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">{action}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Reasoning Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedTopic.reasoning}
                      onChange={(e) => {
                        const updatedTopic = { ...selectedTopic, reasoning: e.target.value };
                        setTopics(topics.map(t => t.id === selectedTopic.id ? updatedTopic : t));
                        onTopicSelect?.(updatedTopic);
                      }}
                      className="min-h-[100px]"
                      placeholder="GROUNDED: Describe the reasoning behind this topic..."
                    />
                  </CardContent>
                </Card>

                {/* Agent Response Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Agent Response
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                      <pre>{selectedTopic.agentResponse}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Panel - Conversation Preview */}
          <div className="w-80 border-l bg-background">
            <ConversationPreview topic={selectedTopic} />
          </div>
        </div>
      )}
    </div>
  );
};

const TopicForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    label: '',
    classificationDescription: '',
    scope: ''
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Topic Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
          placeholder="Case Management"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Classification Description</Label>
        <Textarea
          id="description"
          value={formData.classificationDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, classificationDescription: e.target.value }))}
          placeholder="Handles customer inquiries and actions related to support cases..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Textarea
          id="scope"
          value={formData.scope}
          onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
          placeholder="Your job is to help customers..."
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Create Topic
        </Button>
      </div>
    </form>
  );
};

const ConversationPreview: React.FC<{ topic: Topic }> = ({ topic }) => {
  const [messages] = useState([
    {
      id: '1',
      type: 'ai',
      content: "Hi, I'm an AI service assistant. How can I help you?"
    },
    {
      id: '2',
      type: 'user',
      content: "Can you help me with my support case"
    },
    {
      id: '3',
      type: 'ai',
      content: "Sure, I'd be happy to help with your support case! Could you please provide your email address so I can look up your contact record?"
    },
    {
      id: '4',
      type: 'user',
      content: "sofiarodreguez@example.com"
    },
    {
      id: '5',
      type: 'ai',
      content: "Great, I've found your contact record. How can I assist you with your case today? Do you need to check the status, add a comment, or create a new case?"
    },
    {
      id: '6',
      type: 'user',
      content: "It's the case about my upcoming Reservation Upgrade"
    },
    {
      id: '7',
      type: 'ai',
      content: "I found the case related to your upcoming reservation upgrade. Here are the details:\n\n• Case Number: 00001027\n• Subject: Upcoming Reservation Upgrade Request\n• Description: Sofia Rodriguez called this morning to request an upgrade, she is a high priority customer and we would really like to provide one but can not at the moment. She will need to request upgrade upon check-in.\n• Status: New\n\nHow would you like to proceed? Would you like to add a comment to this case or need help with something else?"
    }
  ]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Conversation Preview</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground'
              }`}
            >
              {message.content}
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">U</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Input
          placeholder="Describe your task or ask a question..."
          className="w-full"
        />
      </div>
    </div>
  );
};