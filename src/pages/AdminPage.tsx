
import React from 'react';
import Header from '@/components/Header';
import AdminDashboard from '@/components/AdminDashboard';

const AdminPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="admin" onLogout={() => console.log('Logout clicked')} />
      
      <main className="flex-1 py-6">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default AdminPage;
