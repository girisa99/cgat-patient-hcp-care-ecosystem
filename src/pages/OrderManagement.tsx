import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { PageEnrollmentIntegration } from '@/components/page-integration/PageEnrollmentIntegration';

interface Order {
  id: string;
  patientName: string;
  medication: string;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  priority: 'low' | 'medium' | 'high';
  totalAmount: number;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    patientName: 'John Smith',
    medication: 'Medication A',
    quantity: 30,
    status: 'processing',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-18',
    priority: 'high',
    totalAmount: 150.00
  },
  {
    id: 'ORD-002',
    patientName: 'Jane Doe',
    medication: 'Medication B',
    quantity: 60,
    status: 'shipped',
    orderDate: '2024-01-14',
    estimatedDelivery: '2024-01-17',
    priority: 'medium',
    totalAmount: 275.00
  },
  {
    id: 'ORD-003',
    patientName: 'Bob Johnson',
    medication: 'Medication C',
    quantity: 90,
    status: 'delivered',
    orderDate: '2024-01-12',
    priority: 'low',
    totalAmount: 425.00
  }
];

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'processing': return <Package className="h-4 w-4" />;
    case 'shipped': return <Truck className="h-4 w-4" />;
    case 'delivered': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
  }
};

const getPriorityColor = (priority: Order['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
  }
};

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length
  };

  return (
    <AppLayout title="Order Management">
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground">
              Manage medication orders and deliveries. New customers can register quickly with AI assistance.
            </p>
          </div>
        </div>

        {/* AI Customer Registration Integration */}
        <PageEnrollmentIntegration variant="banner" />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.shipped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by patient, medication, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <CardDescription className="mt-1">
                      Patient: {order.patientName} • {order.medication}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Quantity:</span> {order.quantity} units</p>
                    <p className="text-sm"><span className="font-medium">Order Date:</span> {order.orderDate}</p>
                    {order.estimatedDelivery && (
                      <p className="text-sm"><span className="font-medium">Est. Delivery:</span> {order.estimatedDelivery}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm">Update Status</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}