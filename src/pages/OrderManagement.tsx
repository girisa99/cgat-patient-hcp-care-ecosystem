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
...
      </div>
    </AppLayout>
  );
}