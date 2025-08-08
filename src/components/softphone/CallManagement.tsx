import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { useSoftphone } from '@/hooks/useSoftphone';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Download,
  Play,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

export const CallManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  const { callSessions, isLoading, formatDuration } = useSoftphone();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'missed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredSessions = callSessions.filter(session => {
    const matchesSearch = session.phone_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || session.direction === directionFilter;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const callColumns = [
    {
      accessorKey: 'direction',
      header: 'Type',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.direction === 'outbound' ? (
            <PhoneOutgoing className="h-4 w-4 text-green-600" />
          ) : (
            <PhoneIncoming className="h-4 w-4 text-blue-600" />
          )}
          <span className="capitalize">{row.original.direction}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">
          {row.original.phone_number}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.status)} variant="secondary">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.duration ? formatDuration(row.original.duration) : 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date/Time',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {format(new Date(row.original.created_at), 'MMM dd, yyyy HH:mm')}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('View details:', row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.has_recording && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Play recording:', row.original)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleExportCalls = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Direction,Phone Number,Status,Duration,Date/Time\n" +
      filteredSessions.map(session => 
        `${session.direction},${session.phone_number},${session.status},${session.duration || 0},${session.created_at}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `call_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{callSessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PhoneOutgoing className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {callSessions.filter(s => s.direction === 'outbound').length}
                </p>
                <p className="text-sm text-muted-foreground">Outbound</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {callSessions.filter(s => s.direction === 'inbound').length}
                </p>
                <p className="text-sm text-muted-foreground">Inbound</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(callSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}m
                </p>
                <p className="text-sm text-muted-foreground">Total Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleExportCalls} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <DataTable
            columns={callColumns}
            data={filteredSessions}
            loading={isLoading}
            searchPlaceholder="Search calls..."
          />
        </CardContent>
      </Card>
    </div>
  );
};