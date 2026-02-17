import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  Lock,
  Key,
  FileText,
  Settings,
  Globe,
  Building,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Crown,
  Zap,
  Database,
  Network,
  Cpu,
  HardDrive
} from 'lucide-react';

interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastActive: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'GDPR' | 'SOC2' | 'HIPAA' | 'ISO27001';
  status: 'compliant' | 'warning' | 'non-compliant';
  lastCheck: string;
  score: number;
}

export const EnterpriseFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [selectedUser, setSelectedUser] = useState<EnterpriseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock data initialization
  useEffect(() => {
    // Initialize mock users
    const mockUsers: EnterpriseUser[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@company.com',
        role: 'Admin',
        department: 'IT',
        lastActive: '2024-01-15T10:30:00Z',
        permissions: ['user.create', 'user.edit', 'user.delete', 'system.config', 'audit.view'],
        status: 'active'
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@company.com',
        role: 'Manager',
        department: 'Operations',
        lastActive: '2024-01-15T09:15:00Z',
        permissions: ['workflow.create', 'workflow.edit', 'team.manage', 'reports.view'],
        status: 'active'
      },
      {
        id: '3',
        name: 'Carol Davis',
        email: 'carol@company.com',
        role: 'User',
        department: 'Marketing',
        lastActive: '2024-01-14T16:45:00Z',
        permissions: ['workflow.create', 'workflow.edit', 'templates.use'],
        status: 'inactive'
      }
    ];

    // Initialize mock audit logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: '2024-01-15T10:30:00Z',
        user: 'alice@company.com',
        action: 'User Created',
        resource: 'User: bob@company.com',
        details: 'Created new user account with Manager role',
        severity: 'low'
      },
      {
        id: '2',
        timestamp: '2024-01-15T09:15:00Z',
        user: 'bob@company.com',
        action: 'Workflow Deployed',
        resource: 'Workflow: Customer Onboarding',
        details: 'Deployed workflow to production environment',
        severity: 'medium'
      },
      {
        id: '3',
        timestamp: '2024-01-14T16:45:00Z',
        user: 'system',
        action: 'Security Alert',
        resource: 'Authentication System',
        details: 'Multiple failed login attempts detected',
        severity: 'high'
      }
    ];

    // Initialize mock compliance reports
    const mockCompliance: ComplianceReport[] = [
      {
        id: '1',
        name: 'GDPR Compliance',
        type: 'GDPR',
        status: 'compliant',
        lastCheck: '2024-01-15T08:00:00Z',
        score: 95
      },
      {
        id: '2',
        name: 'SOC 2 Type II',
        type: 'SOC2',
        status: 'warning',
        lastCheck: '2024-01-14T12:00:00Z',
        score: 78
      },
      {
        id: '3',
        name: 'ISO 27001',
        type: 'ISO27001',
        status: 'compliant',
        lastCheck: '2024-01-13T14:30:00Z',
        score: 88
      }
    ];

    setUsers(mockUsers);
    setAuditLogs(mockAuditLogs);
    setComplianceReports(mockCompliance);
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Role-Based Access Control Component
  const RBACManager = () => (
    <div className="space-y-6">
      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                    {user.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.department}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Admin Permissions</Label>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  System Configuration
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  User Management
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Audit Logs
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  All Workflows
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Manager Permissions</Label>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Team Management
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Workflow Creation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Department Reports
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  Limited System Access
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">User Permissions</Label>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Personal Workflows
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Template Usage
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  Read-only Reports
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  No System Access
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Multi-tenancy Component
  const MultiTenancyManager = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Tenant Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Acme Corp', users: 45, status: 'active', plan: 'Enterprise' },
              { name: 'TechStart Inc', users: 12, status: 'active', plan: 'Professional' },
              { name: 'Global Solutions', users: 78, status: 'suspended', plan: 'Enterprise' }
            ].map((tenant, index) => (
              <motion.div
                key={index}
                className="p-4 border rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tenant.name}</h3>
                  <Badge variant={tenant.status === 'active' ? 'secondary' : 'destructive'}>
                    {tenant.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {tenant.users} users • {tenant.plan} plan
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Resource Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">CPU Usage by Tenant</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { name: 'Acme Corp', usage: 65, color: 'bg-blue-500' },
                    { name: 'TechStart Inc', usage: 25, color: 'bg-green-500' },
                    { name: 'Global Solutions', usage: 45, color: 'bg-yellow-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-24 text-xs">{item.name}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.usage}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs text-right">{item.usage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Storage Usage by Tenant</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { name: 'Acme Corp', usage: 78, color: 'bg-purple-500' },
                    { name: 'TechStart Inc', usage: 32, color: 'bg-pink-500' },
                    { name: 'Global Solutions', usage: 55, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-24 text-xs">{item.name}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.usage}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs text-right">{item.usage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Security & Audit Component
  const SecurityAudit = () => (
    <div className="space-y-6">
      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <motion.div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.severity === 'critical' ? 'bg-red-500' :
                    log.severity === 'high' ? 'bg-orange-500' :
                    log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{log.user}</p>
                  <p>{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Sessions', value: '24', icon: Users, color: 'text-blue-500' },
          { title: 'Failed Logins', value: '3', icon: AlertTriangle, color: 'text-red-500' },
          { title: 'API Calls', value: '1.2k', icon: Network, color: 'text-green-500' },
          { title: 'Security Score', value: '95%', icon: Shield, color: 'text-purple-500' }
        ].map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Compliance Component
  const ComplianceManager = () => (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {complianceReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{report.name}</CardTitle>
                <Badge variant={
                  report.status === 'compliant' ? 'secondary' :
                  report.status === 'warning' ? 'default' : 'destructive'
                }>
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance Score</span>
                  <span className="font-bold">{report.score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      report.score >= 90 ? 'bg-green-500' :
                      report.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${report.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(report.lastCheck).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Data Retention Policy</p>
                <p className="text-sm text-muted-foreground">Configure automatic data cleanup</p>
              </div>
              <Button size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Access Controls Review</p>
                <p className="text-sm text-muted-foreground">Quarterly permission audit</p>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Compliance Report</p>
                <p className="text-sm text-muted-foreground">Generate detailed compliance report</p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Enterprise Features
          </h2>
          <p className="text-muted-foreground">Advanced security, compliance, and multi-tenancy management</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Enterprise Plan
          </Badge>
        </div>
      </div>

      {/* Main Enterprise Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rbac">RBAC & Users</TabsTrigger>
          <TabsTrigger value="multitenancy">Multi-tenancy</TabsTrigger>
          <TabsTrigger value="security">Security & Audit</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="rbac">
          <RBACManager />
        </TabsContent>

        <TabsContent value="multitenancy">
          <MultiTenancyManager />
        </TabsContent>

        <TabsContent value="security">
          <SecurityAudit />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceManager />
        </TabsContent>
      </Tabs>

      {/* User Edit Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold mb-4">Edit User: {selectedUser.name}</h3>
              <div className="space-y-4">
                <div>
                  <Label>Role</Label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input defaultValue={selectedUser.department} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={selectedUser.status === 'active'} />
                  <Label>Active Status</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => {
                    toast.success('User updated successfully');
                    setSelectedUser(null);
                  }}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnterpriseFeatures;