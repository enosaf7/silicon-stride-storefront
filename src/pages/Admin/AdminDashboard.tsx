
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import DashboardStats from '@/components/Admin/DashboardStats';
import RecentOrders from '@/components/Admin/RecentOrders';
import PopularProducts from '@/components/Admin/PopularProducts';
import { Loader } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }
  
  return (
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
  );
};

export default AdminDashboard;
