import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Clock, Activity, UserCheck, UserX } from 'lucide-react';

interface LiveAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: any;
  mode: 'create' | 'edit';
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export const LiveAgentDialog = ({ 
  open, 
  onOpenChange, 
  agent, 
  mode, 
  onSave, 
  onDelete,
  isLoading = false 
}: LiveAgentDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    skills: '',
    max_concurrent_calls: 3,
    status: 'offline',
    is_available: true,
    phone_extension: '',
    specializations: '',
    shift_start: '',
    shift_end: '',
    timezone: 'UTC',
    notes: ''
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (agent && open) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        department: agent.department || '',
        skills: Array.isArray(agent.skills) ? agent.skills.join(', ') : (agent.skills || ''),
        max_concurrent_calls: agent.max_concurrent_calls || 3,
        status: agent.status || 'offline',
        is_available: agent.is_available ?? true,
        phone_extension: agent.phone_extension || '',
        specializations: Array.isArray(agent.specializations) ? agent.specializations.join(', ') : (agent.specializations || ''),
        shift_start: agent.shift_start || '',
        shift_end: agent.shift_end || '',
        timezone: agent.timezone || 'UTC',
        notes: agent.notes || ''
      });
    } else if (mode === 'create' && open) {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        department: '',
        skills: '',
        max_concurrent_calls: 3,
        status: 'offline',
        is_available: true,
        phone_extension: '',
        specializations: '',
        shift_start: '',
        shift_end: '',
        timezone: 'UTC',
        notes: ''
      });
    }
  }, [agent, open, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const saveData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : []
    };

    if (mode === 'edit' && agent) {
      onSave({ id: agent.id, updates: saveData });
    } else {
      onSave(saveData);
    }
  };

  const handleDelete = () => {
    if (agent && onDelete) {
      onDelete(agent.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'busy': return 'destructive';
      case 'away': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === 'create' ? 'Add Live Agent' : `Edit Agent: ${agent?.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="agent@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Customer Support, Sales, Technical"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_extension">Phone Extension</Label>
                <Input
                  id="phone_extension"
                  value={formData.phone_extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_extension: e.target.value }))}
                  placeholder="1234"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Availability & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Availability & Status</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🟢 Online</SelectItem>
                    <SelectItem value="busy">🔴 Busy</SelectItem>
                    <SelectItem value="away">🟡 Away</SelectItem>
                    <SelectItem value="offline">⚫ Offline</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getStatusColor(formData.status)} className="w-fit">
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_concurrent_calls">Max Concurrent Calls</Label>
                <Select
                  value={formData.max_concurrent_calls.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, max_concurrent_calls: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Call</SelectItem>
                    <SelectItem value="2">2 Calls</SelectItem>
                    <SelectItem value="3">3 Calls</SelectItem>
                    <SelectItem value="5">5 Calls</SelectItem>
                    <SelectItem value="10">10 Calls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
              <Label htmlFor="is_available" className="flex items-center gap-2">
                {formData.is_available ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                Agent Available for Calls
              </Label>
            </div>
          </div>

          <Separator />

          {/* Skills & Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Skills & Schedule</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="General Support, Technical Issues, Billing, Sales"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations (comma-separated)</Label>
              <Input
                id="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                placeholder="Healthcare, Insurance, Technical Products"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift_start">Shift Start</Label>
                <Input
                  id="shift_start"
                  type="time"
                  value={formData.shift_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, shift_start: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shift_end">Shift End</Label>
                <Input
                  id="shift_end"
                  type="time"
                  value={formData.shift_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, shift_end: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern (EST/EDT)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CST/CDT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MST/MDT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PST/PDT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this agent..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {mode === 'edit' && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete Agent
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (mode === 'create' ? 'Creating...' : 'Saving...') 
                  : (mode === 'create' ? 'Create Agent' : 'Save Changes')
                }
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background border rounded-lg p-6 max-w-sm">
              <h3 className="font-semibold mb-2">Delete Agent</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this agent? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};