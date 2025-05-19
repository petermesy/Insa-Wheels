
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated and is an employee
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (!token || !userInfo) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    // Verify that the user is an employee
    const user = JSON.parse(userInfo);
    if (user.role !== 'employee') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="employee" onLogout={handleLogout} />
      
      <main className="flex-1 py-6">
        <EmployeeDashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
