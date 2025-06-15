
import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import DashboardStats from '@/components/Admin/DashboardStats';
import RecentOrders from '@/components/Admin/RecentOrders';
import PopularProducts from '@/components/Admin/PopularProducts';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute adminOnly>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-gray-600">
                Welcome back! This is a shared admin dashboard - all changes are visible to all administrators.
              </p>
              <div className="ml-auto flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Live Updates</span>
              </div>
            </div>
          </div>
          
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
