
import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import DashboardStats from '@/components/Admin/DashboardStats';
import RecentOrders from '@/components/Admin/RecentOrders';
import PopularProducts from '@/components/Admin/PopularProducts';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute adminOnly>
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
          
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <RecentOrders />
            <PopularProducts />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
