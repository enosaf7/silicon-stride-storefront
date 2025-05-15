
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Users, Package, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { formatCediFull } from '@/lib/utils';

interface StatsResponse {
  ordersCount: number;
  productsCount: number;
  usersCount: number;
  totalRevenue: number;
}

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get counts directly without RPC
      const [
        ordersResponse,
        productsResponse,
        usersResponse,
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      
      // For total revenue, we'll sum up the order totals
      const { data: orders } = await supabase.from('orders').select('total');
      const totalRevenue = orders ? orders.reduce((sum, order) => sum + Number(order.total), 0) : 0;
      
      return {
        ordersCount: ordersResponse.count || 0,
        productsCount: productsResponse.count || 0,
        usersCount: usersResponse.count || 0,
        totalRevenue: totalRevenue
      } as StatsResponse;
    }
  });
  
  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.ordersCount || 0,
      icon: <ShoppingBag className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Total Products',
      value: stats?.productsCount || 0,
      icon: <Package className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50'
    },
    {
      title: 'Registered Users',
      value: stats?.usersCount || 0,
      icon: <Users className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: formatCediFull(stats?.totalRevenue || 0),
      icon: <CreditCard className="h-8 w-8 text-brand-orange" />,
      color: 'bg-orange-50'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex items-center p-6">
            <div className={`p-4 rounded-full ${stat.color}`}>{stat.icon}</div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : stat.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
