
import React from 'react';
import Header from '@/components/Header';
import EmployeeDashboard from '@/components/EmployeeDashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="employee" onLogout={() => console.log('Logout clicked')} />
      
      <main className="flex-1 py-6">
        <EmployeeDashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
