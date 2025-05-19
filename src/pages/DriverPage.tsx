
import React from 'react';
import Header from '@/components/Header';
import DriverDashboard from '@/components/DriverDashboard';

const DriverPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="driver" onLogout={() => console.log('Logout clicked')} />
      
      <main className="flex-1 py-6">
        <DriverDashboard />
      </main>
    </div>
  );
};

export default DriverPage;
