
import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';

const AdminChat: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Chat</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Chat functionality has been removed.</p>
          <p className="text-gray-500 mt-2">Use the Messages section to view contact form submissions.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
